"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTheme } from "next-themes";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Stars } from "@react-three/drei";
import * as THREE from "three";

const BRAND = "#33E092";

function MorphingCore({ isDark }: { isDark: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const basePositions = useRef<Float32Array | null>(null);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.15, 5), []);

  useEffect(() => {
    basePositions.current = geometry.attributes.position.array.slice() as Float32Array;
  }, [geometry]);

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current || !basePositions.current) return;

    const time = clock.elapsedTime;
    const positions = geometry.attributes.position;
    const base = basePositions.current;

    for (let i = 0; i < positions.count; i++) {
      const ix = i * 3;
      const x = base[ix];
      const y = base[ix + 1];
      const z = base[ix + 2];

      const noise =
        Math.sin(x * 2.1 + time * 0.9) *
        Math.cos(y * 2.4 + time * 0.7) *
        Math.sin(z * 2.0 + time * 0.8);

      const pulse = 1 + noise * 0.14 + Math.sin(time * 1.2) * 0.03;
      positions.setXYZ(ix, x * pulse, y * pulse, z * pulse);
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();

    const targetRotY = pointer.x * 0.45;
    const targetRotX = pointer.y * 0.25;
    groupRef.current.rotation.y +=
      (targetRotY - groupRef.current.rotation.y) * 0.06;
    groupRef.current.rotation.x +=
      (targetRotX - groupRef.current.rotation.x) * 0.06;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={isDark ? "#0f172a" : "#e4e4e7"}
          emissive={BRAND}
          emissiveIntensity={isDark ? 0.35 : 0.2}
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>
      <mesh geometry={geometry} scale={1.002}>
        <meshBasicMaterial
          color={isDark ? BRAND : "#059669"}
          wireframe
          transparent
          opacity={isDark ? 0.55 : 0.45}
        />
      </mesh>
    </group>
  );
}

function OrbitParticles({ count = 120 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 1.6 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
      spd[i] = 0.2 + Math.random() * 0.6;
    }

    return { positions: pos, speeds: spd };
  }, [count]);

  useFrame(({ clock, pointer }) => {
    if (!ref.current) return;
    const time = clock.elapsedTime;
    const attr = ref.current.geometry.attributes.position;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const speed = speeds[i];
      const radius = Math.hypot(positions[ix], positions[ix + 2]);
      const angle = Math.atan2(positions[ix + 2], positions[ix]) + time * speed * 0.15;

      attr.setXYZ(
        i,
        Math.cos(angle) * radius + pointer.x * 0.15,
        positions[ix + 1] + Math.sin(time * speed + i) * 0.08,
        Math.sin(angle) * radius + pointer.y * 0.1,
      );
    }

    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={BRAND}
        size={0.035}
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function SceneContent({ isDark }: { isDark: boolean }) {
  return (
    <>
      <ambientLight intensity={isDark ? 0.35 : 0.55} />
      <pointLight position={[3, 2, 4]} intensity={1.2} color={BRAND} />
      <pointLight position={[-3, -1, -2]} intensity={0.4} color="#f59e0b" />

      <Stars
        radius={8}
        depth={20}
        count={isDark ? 800 : 400}
        factor={2}
        saturation={0}
        fade
        speed={0.4}
      />

      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
        <MorphingCore isDark={isDark} />
      </Float>

      <OrbitParticles />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate
        autoRotate
        autoRotateSpeed={0.35}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.6}
      />
    </>
  );
}

export default function Hero3DScene() {
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const bgColor = isDark ? "#18181b" : "#f4f4f5";

  return (
    <div className="relative w-full h-full min-h-0 bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{
          antialias: !isMobile,
          alpha: false,
          powerPreference: isMobile ? "low-power" : "default",
        }}
        dpr={isMobile ? 1 : [1, 2]}
      >
        <color attach="background" args={[bgColor]} />
        <SceneContent isDark={isDark} />
      </Canvas>

      <div className="pointer-events-none absolute bottom-3 left-3 text-[10px] font-mono text-zinc-500 dark:text-zinc-600 tracking-wider uppercase">
        drag to explore
      </div>
    </div>
  );
}
