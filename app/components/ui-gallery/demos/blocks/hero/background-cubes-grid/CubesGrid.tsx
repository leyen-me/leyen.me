"use client";

/**
 * Background Cubes Grid — isometric variant, ported from Aceternity UI.
 * Source: https://ui.aceternity.com/components/background-cubes-grid
 * License: https://ui.aceternity.com/licence (author permission granted).
 *
 * Kept from the original: the 120 Hz grid simulation, the nine-point Laplacian
 * wave, the shader shading and the idle-ripple behaviour.
 * Changed for the gallery: `motion/react`'s `useAnimationFrame` became a
 * self-managed rAF loop that suspends once the field is flat, and the palette
 * is passed in so the block can follow the gallery theme.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

export type CubesPalette = {
  /** Top face, also used as the seam / clear colour. */
  top: string;
  left: string;
  right: string;
  glow: string;
};

const SIM_HZ = 120;
const STEP = 1 / SIM_HZ;
const BRUSH_RADIUS = 1.1;
const PUSH_PER_CELL = 0.16;
const CLICK_PUSH = 0.14;

const vertexShader = `
  attribute vec2 aOffset;
  attribute float aHeight;
  attribute float aGlow;
  uniform float uAmplitude;
  varying vec3 vNormal;
  varying float vHeight;
  varying float vGlow;
  varying float vDepth;

  void main() {
    vec3 p = position;
    p.xz += aOffset;
    // Crests round off with tanh while troughs sink deeper than crests rise;
    // the two curves blend around zero so cubes never change speed at rest.
    float x = aHeight;
    vHeight = mix( x * 1.5, tanh( x ), smoothstep( -0.6, 0.6, x ) );
    p.y += vHeight * uAmplitude;
    vNormal = normal;
    vGlow = aGlow;
    vDepth = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );
  }
`;

const fragmentShader = `
  uniform vec3 uTop;
  uniform vec3 uLeft;
  uniform vec3 uRight;
  uniform vec3 uGlowColor;
  uniform float uGlow;
  varying vec3 vNormal;
  varying float vHeight;
  varying float vGlow;
  varying float vDepth;

  void main() {
    bool isTop = vNormal.y > 0.5;
    vec3 color = isTop ? uTop : ( abs( vNormal.x ) > 0.5 ? uLeft : uRight );
    // Tops below the rest line pick up a little shade so troughs read.
    if ( isTop ) color = mix( color, uLeft, clamp( -vHeight, 0.0, 1.0 ) * 0.6 );

    // Tops take a soft tint; side faces are lit hardest near the rim.
    float glow = clamp( vGlow * uGlow, 0.0, 1.0 );
    float falloff = isTop ? 0.2 : exp( vDepth * 1.6 ) * 0.6;
    color = mix( color, uGlowColor, glow * falloff );

    gl_FragColor = vec4( color, 1.0 );
    #include <colorspace_fragment>
  }
`;

type Options = {
  cellSize: number;
  gap: number;
  amplitude: number;
  speed: number;
  damping: number;
  idleRipples: boolean;
  idleDelay: number;
  glow: number;
  palette: CubesPalette;
};

function createScene(
  canvas: HTMLCanvasElement,
  container: HTMLDivElement,
  options: Options
) {
  const {
    cellSize,
    gap,
    amplitude,
    speed,
    damping,
    idleRipples,
    idleDelay,
    glow,
    palette,
  } = options;

  const c2 = Math.min((speed / SIM_HZ) ** 2, 0.5);
  // While the pointer moves, waves travel and a slow pull removes leftover
  // offset. Once quiet, both rates ramp up so the grid eases back to flat.
  const flowDrag = -Math.log(Math.min(Math.max(damping, 1e-4), 1));
  const settleDrag = -Math.log(0.02);
  const flowPull = 0.8;
  const settlePull = 3.5;
  const SETTLE_AFTER = 0.15;
  const SETTLE_RAMP = 0.8;
  const FLAT = 0.004;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setClearColor(palette.top);
  const scene = new THREE.Scene();

  // True isometric view: camera on the (1, 1, 1) diagonal.
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uAmplitude: { value: amplitude },
      uTop: { value: new THREE.Color(palette.top) },
      uLeft: { value: new THREE.Color(palette.left) },
      uRight: { value: new THREE.Color(palette.right) },
      uGlowColor: { value: new THREE.Color(palette.glow) },
      uGlow: { value: glow },
    },
  });

  let size = 0;
  let height = new Float32Array(0);
  let velocity = new Float32Array(0);
  let lastHeight = new Float32Array(0);
  let glowField = new Float32Array(0);
  let geometry: THREE.InstancedBufferGeometry | null = null;
  let heightAttribute: THREE.InstancedBufferAttribute | null = null;
  let glowAttribute: THREE.InstancedBufferAttribute | null = null;
  let mesh: THREE.Mesh | null = null;

  const build = (count: number) => {
    if (mesh) scene.remove(mesh);
    geometry?.dispose();
    size = count;
    height = new Float32Array(size * size);
    velocity = new Float32Array(size * size);
    lastHeight = new Float32Array(size * size);
    glowField = new Float32Array(size * size);

    // Tall columns so deep troughs never expose a cube's bottom cap.
    const box = new THREE.BoxGeometry(1 - gap, 16, 1 - gap).translate(0, -8, 0);
    geometry = new THREE.InstancedBufferGeometry();
    geometry.index = box.index;
    geometry.setAttribute("position", box.getAttribute("position"));
    geometry.setAttribute("normal", box.getAttribute("normal"));

    const offsets = new Float32Array(size * size * 2);
    const half = (size - 1) / 2;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        offsets[(i * size + j) * 2] = i - half;
        offsets[(i * size + j) * 2 + 1] = j - half;
      }
    }
    geometry.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets, 2));
    heightAttribute = new THREE.InstancedBufferAttribute(new Float32Array(size * size), 1);
    heightAttribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("aHeight", heightAttribute);
    glowAttribute = new THREE.InstancedBufferAttribute(glowField, 1);
    glowAttribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("aGlow", glowAttribute);
    geometry.instanceCount = size * size;

    mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);
  };

  let awake = true;
  let frame = 0;
  let lastTime = 0;

  const resize = () => {
    const width = container.clientWidth;
    const viewHeight = container.clientHeight;
    if (width === 0 || viewHeight === 0) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, viewHeight, false);

    // A tile's top face spans sqrt(2) world units across the screen.
    const scale = cellSize / Math.SQRT2;
    camera.left = -width / 2 / scale;
    camera.right = width / 2 / scale;
    camera.top = viewHeight / 2 / scale;
    camera.bottom = -viewHeight / 2 / scale;
    camera.updateProjectionMatrix();

    const needed = Math.ceil(((width + viewHeight * 2) / cellSize) * 1.1) + 4;
    if (needed > size) build(needed);
    awake = true;
    start();
  };

  // Smooth Gaussian push into the velocity field at a fractional grid position.
  const brush = (gx: number, gz: number, strength: number, radius = BRUSH_RADIUS) => {
    const reach = Math.ceil(radius * 3);
    const inv = 1 / (2 * radius * radius);
    const ci = Math.round(gx);
    const cj = Math.round(gz);
    for (let i = Math.max(1, ci - reach); i <= Math.min(size - 2, ci + reach); i++) {
      for (let j = Math.max(1, cj - reach); j <= Math.min(size - 2, cj + reach); j++) {
        const dx = i - gx;
        const dz = j - gz;
        velocity[i * size + j] -= strength * Math.exp(-(dx * dx + dz * dz) * inv);
      }
    }
    awake = true;
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  let target: { x: number; z: number } | null = null;
  let brushAt: { x: number; z: number } | null = null;
  let idleTime = 0;
  let quietTime = 0;
  let idleTimer = 0;
  let autoMode = false;
  let lastEnergy = 0;

  const gridPoint = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    if (Math.abs(nx) > 1 || Math.abs(ny) > 1) return null;
    pointer.set(nx, ny);
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.ray.intersectPlane(ground, hit)) return null;
    const half = (size - 1) / 2;
    return { x: hit.x + half, z: hit.z + half };
  };

  // Listen on window so anything stacked above the canvas cannot block ripples.
  const onPointerMove = (event: PointerEvent) => {
    const point = gridPoint(event);
    if (!point) {
      target = null;
      brushAt = null;
      return;
    }
    target = point;
    idleTime = 0;
    quietTime = 0;
    autoMode = false;
    start();
  };

  // A press drops a stronger single ripple instead of dragging the brush.
  const onPointerDown = (event: PointerEvent) => {
    const point = gridPoint(event);
    if (!point) return;
    target = point;
    brushAt = point;
    brush(point.x, point.z, CLICK_PUSH, 1.5);
    idleTime = 0;
    quietTime = 0;
    autoMode = false;
    start();
  };

  // Pick up the path travelled since the last frame.
  const applyPointer = () => {
    if (!target) return;
    if (!brushAt) {
      brushAt = { ...target };
      return;
    }
    const dx = target.x - brushAt.x;
    const dz = target.z - brushAt.z;
    const distance = Math.hypot(dx, dz);
    if (distance < 0.01) return;
    const samples = Math.ceil(distance / 0.35);
    const push = (Math.min(distance, 3) * PUSH_PER_CELL) / samples;
    for (let s = 1; s <= samples; s++) {
      brush(brushAt.x + (dx * s) / samples, brushAt.z + (dz * s) / samples, push);
    }
    brushAt = { ...target };
  };

  const step = () => {
    const ramp = autoMode ? 0 : Math.min(Math.max((idleTime - SETTLE_AFTER) / SETTLE_RAMP, 0), 1);
    const s = ramp * ramp * (3 - 2 * ramp);
    const keep = Math.exp(-(flowDrag + (settleDrag - flowDrag) * s) / SIM_HZ);
    const relax = Math.exp(-(flowPull + (settlePull - flowPull) * s) / SIM_HZ);
    lastHeight.set(height);
    for (let i = 1; i < size - 1; i++) {
      for (let j = 1; j < size - 1; j++) {
        const k = i * size + j;
        // Nine-point Laplacian: round wavefronts, no grid-aligned checkerboard.
        const edges = height[k - 1] + height[k + 1] + height[k - size] + height[k + size];
        const corners =
          height[k - size - 1] + height[k - size + 1] + height[k + size - 1] + height[k + size + 1];
        const laplacian = (4 * edges + corners - 20 * height[k]) / 6;
        velocity[k] = (velocity[k] + c2 * laplacian) * keep;
      }
    }
    for (let k = 0; k < height.length; k++) height[k] = (height[k] + velocity[k]) * relax;

    // Glow eases toward local wave energy: quick to light, slow to fade.
    for (let i = 1; i < size - 1; i++) {
      for (let j = 1; j < size - 1; j++) {
        const k = i * size + j;
        const energy =
          (Math.abs(height[k]) * 4 +
            Math.abs(height[k - 1]) +
            Math.abs(height[k + 1]) +
            Math.abs(height[k - size]) +
            Math.abs(height[k + size])) /
          8;
        glowField[k] += (energy - glowField[k]) * (energy > glowField[k] ? 0.08 : 0.015);
      }
    }
  };

  let accumulator = 0;
  const update = (delta: number) => {
    if (!heightAttribute || !glowAttribute || size === 0) return false;

    idleTime += delta;
    // Auto mode starts only after the grid has been flat and still long enough.
    quietTime =
      !autoMode && idleTime > SETTLE_AFTER && lastEnergy < FLAT ? quietTime + delta : 0;
    if (idleRipples && !autoMode && quietTime > idleDelay) autoMode = true;
    if (autoMode) {
      idleTimer += delta;
      if (idleTimer > 1.8) {
        idleTimer = 0;
        const spread = size * 0.15;
        brush(
          size / 2 + (Math.random() - 0.5) * spread * 2,
          size / 2 + (Math.random() - 0.5) * spread * 2,
          0.28,
          1.8
        );
      }
    } else {
      idleTimer = 1.8;
    }

    applyPointer();
    if (!awake) {
      lastEnergy = 0;
      return false;
    }

    accumulator = Math.min(accumulator + delta, STEP * 8);
    while (accumulator >= STEP) {
      step();
      accumulator -= STEP;
    }

    // Blend the last two simulation states so motion stays smooth at any Hz.
    const alpha = accumulator / STEP;
    const display = heightAttribute.array as Float32Array;
    let wave = 0;
    let light = 0;
    for (let k = 0; k < height.length; k++) {
      display[k] = lastHeight[k] + (height[k] - lastHeight[k]) * alpha;
      wave = Math.max(wave, Math.abs(height[k]), Math.abs(velocity[k]) * 20);
      light = Math.max(light, glowField[k]);
    }
    heightAttribute.needsUpdate = true;
    glowAttribute.needsUpdate = true;
    renderer.render(scene, camera);
    lastEnergy = wave;
    const energy = Math.max(wave, light);

    // Stop rendering once the surface settles; the next push wakes it up.
    if (energy < 1e-4) {
      awake = false;
      return false;
    }
    return true;
  };

  const tick = (now: number) => {
    frame = 0;
    const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 1 / 60;
    lastTime = now;
    if (update(delta)) frame = window.requestAnimationFrame(tick);
  };

  const start = () => {
    if (frame !== 0) return;
    lastTime = 0;
    frame = window.requestAnimationFrame(tick);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerdown", onPointerDown);
  resize();

  return {
    dispose() {
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      if (frame !== 0) window.cancelAnimationFrame(frame);
      geometry?.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}

export function BackgroundCubesGrid({
  palette,
  className,
}: {
  palette: CubesPalette;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = createScene(canvas, container, {
      cellSize: 150,
      gap: 0.025,
      amplitude: 0.7,
      speed: 7,
      damping: 0.08,
      // Idle ripples are continuous motion; interactive feedback stays.
      idleRipples: !reduceMotion,
      idleDelay: 1.5,
      glow: 0.5,
      palette,
    });
    return () => scene.dispose();
  }, [palette]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{ backgroundColor: palette.top }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
