/**
 * The wake is a grid of numbers, not pixels.
 *
 * Every cell in a 360 × 240 canvas holds a "heat" value. The pointer stamps
 * heat along its path with a soft round falloff; every frame the whole grid
 * cools by the same exponential fraction. A cold cell is a dot whose radius
 * follows the cube mask, a warm cell picks a glyph from a ramp — so the wake
 * visibly thickens under the hand and decays back to dots behind it.
 *
 * The cube itself is not drawn as a shape: three projected faces are tested
 * per cell, and each hit returns a shade that scales the dot radius. That is
 * why the rim reads as an outline and the interior as a lighter field.
 */

export type GlyphSet = "Classic" | "Blocks" | "Dots" | "Binary";

export type WakeOptions = {
  glyphs: GlyphSet;
  /** Dot pitch in CSS pixels. */
  size: number;
  /** Wake radius, 0–100 (mapped to 12–70 CSS pixels). */
  reach: number;
  /** Seconds for the wake to cool. */
  trail: number;
  /** How far glyphs lean toward the pointer, 0–100. */
  pull: number;
};

export const WAKE_WIDTH = 360;
export const WAKE_HEIGHT = 240;

const GLYPHS: Record<GlyphSet, readonly string[]> = {
  Classic: [" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"],
  Blocks: [" ", "·", "░", "▒", "▓", "█"],
  Dots: [" ", "·", "•", "●"],
  Binary: [" ", ".", ":", "0", "1"],
};

const MONO =
  'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace';
const DOT_THRESHOLD = 0.04;
const RING_LIFE = 2.2;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Deterministic hash in [0, 1): the glyph dither must be stable across frames. */
function rand(a: number, b: number) {
  let n = (a * 374761393 + b * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/**
 * Shade of the isometric cube at (x, y), in canvas-centred coordinates.
 * `light` inverts the ramp so a dark canvas (light theme) keeps the same
 * edge/face contrast as a white one.
 */
function cubeMask(x: number, y: number, light: boolean) {
  const shade = (value: number) =>
    0.35 + 0.65 * clamp(light ? value : 1.09 - value, 0, 1);

  const radius = 112;
  const dx = Math.cos(Math.PI / 6) * radius;
  const half = radius / 2;

  // Top diamond, left face and right face, as projected points.
  const top = [0, -112];
  const upperLeft = [-dx, -56];
  const upperRight = [dx, -56];
  const left = [-dx, half];
  const bottom = [0, radius];

  const barycentric = (a: number[], b: number[], c: number[]) => {
    const v0x = b[0] - a[0];
    const v0y = b[1] - a[1];
    const v1x = c[0] - a[0];
    const v1y = c[1] - a[1];
    const v2x = x - a[0];
    const v2y = y - a[1];
    const den = v0x * v1y - v0y * v1x;
    return [
      (v2x * v1y - v2y * v1x) / den,
      (v0x * v2y - v0y * v2x) / den,
    ];
  };

  const inside = ([u, v]: number[]) => u >= 0 && u <= 1 && v >= 0 && v <= 1;
  /** A third of a cell from the silhouette edge becomes a solid rim dot. */
  const rim = (value: number) => +(value < 0.045);

  let t = barycentric(top, upperRight, upperLeft);
  if (inside(t)) {
    const [u, v] = t;
    return rim(1 - u) || rim(1 - v)
      ? 1
      : shade(0.96 - (0.1 * (u + v)) / 2);
  }

  t = barycentric(upperLeft, [0, 0], left);
  if (inside(t)) {
    const [u, v] = t;
    return rim(u) ? 1 : shade(0.56 - 0.12 * v);
  }

  t = barycentric([0, 0], upperRight, bottom);
  if (inside(t)) {
    const [u, v] = t;
    return rim(u) || rim(v) ? 1 : shade(0.13 - 0.05 * u);
  }

  return 0;
}

export type Wake = ReturnType<typeof createWake>;

export function createWake(canvas: HTMLCanvasElement) {
  let options: WakeOptions = {
    glyphs: "Classic",
    size: 10,
    reach: 60,
    trail: 1.2,
    pull: 40,
  };

  const state = {
    cols: 0,
    rows: 0,
    cw: 0,
    ch: 0,
    ox: 0,
    oy: 0,
    font: "",
    heat: new Float32Array(),
    mask: new Float32Array(),
    hx: -999,
    hy: -999,
    lx: NaN,
    ly: NaN,
    near: 0,
    inside: false,
    rings: [] as { x: number; y: number; t: number }[],
    deal: 0,
    tick: 0,
    raf: 0,
    ratio: 1,
  };

  /** Ink colour is read from CSS so light and dark themes stay in sync. */
  function measure() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    state.ratio = dpr;
    canvas.width = Math.round(WAKE_WIDTH * dpr);
    canvas.height = Math.round(WAKE_HEIGHT * dpr);

    const rgb =
      getComputedStyle(canvas).color.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
    const light = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 128;

    state.ch = options.size * 0.82;
    state.cw = options.size * 0.62;
    state.cols = Math.floor(WAKE_WIDTH / state.cw - 0.5);
    state.rows = Math.floor(WAKE_HEIGHT / state.ch);
    state.font = `500 ${options.size}px ${MONO}`;
    state.heat = new Float32Array(state.cols * state.rows);
    state.mask = new Float32Array(state.cols * state.rows);

    const ox = (state.ox = (WAKE_WIDTH - state.cols * state.cw) / 2);
    const oy = (state.oy = (WAKE_HEIGHT - state.rows * state.ch) / 2);

    for (let row = 0; row < state.rows; row++) {
      for (let col = 0; col < state.cols; col++) {
        // Odd rows are offset half a cell, which gives the lattice its weave.
        const x =
          ox + (col + 0.5 + (row & 1) * 0.5) * state.cw - WAKE_WIDTH / 2;
        const y = oy + (row + 0.5) * state.ch - WAKE_HEIGHT / 2;
        state.mask[row * state.cols + col] = cubeMask(x, y, light);
      }
    }
  }

  function stamp(px: number, py: number, radius: number, amount: number) {
    const x = px - state.ox;
    const y = py - state.oy;
    const c0 = Math.max(0, Math.floor((x - radius) / state.cw));
    const c1 = Math.min(state.cols - 1, Math.ceil((x + radius) / state.cw));
    const r0 = Math.max(0, Math.floor((y - radius) / state.ch));
    const r1 = Math.min(state.rows - 1, Math.ceil((y + radius) / state.ch));
    const rr = radius * radius;

    for (let row = r0; row <= r1; row++) {
      const dy = (row + 0.5) * state.ch - y;
      for (let col = c0; col <= c1; col++) {
        const dx = (col + 0.5) * state.cw - x;
        const q = (dx * dx + dy * dy) / rr;
        if (q >= 1) continue;
        const falloff = 1 - q;
        const index = row * state.cols + col;
        state.heat[index] = Math.min(
          1,
          state.heat[index] + amount * falloff * falloff,
        );
      }
    }
  }

  const reachRadius = () => 12 + (clamp(options.reach, 0, 100) / 100) * 58;

  function draw() {
    if (!state.cols) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(state.ratio, 0, 0, state.ratio, 0, 0);
    ctx.clearRect(0, 0, WAKE_WIDTH, WAKE_HEIGHT);
    ctx.fillStyle = getComputedStyle(canvas).color;

    const dotRadius = Math.min(state.cw, state.ch) * 0.44;
    ctx.font = state.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const ramp = GLYPHS[options.glyphs] ?? GLYPHS.Classic;
    const top = ramp.length - 1;
    const pull = (clamp(options.pull, 0, 100) / 100) * state.near;
    const radius = reachRadius();
    const pullRange = radius * 2;
    const pullRange2 = pullRange * pullRange;
    const nearRange2 = radius * radius;

    const rings = state.rings.map((ring) => {
      const t = ring.t / RING_LIFE;
      const eased = 1 - (1 - t) ** 3;
      return {
        x: ring.x,
        y: ring.y,
        radius: 8 + eased * 260,
        amp: 0.6 * (1 - t) * (1 - t) * Math.min(1, t * 6),
      };
    });

    for (let row = 0; row < state.rows; row++) {
      const y = state.oy + (row + 0.5) * state.ch;
      for (let col = 0; col < state.cols; col++) {
        const index = row * state.cols + col;
        const mask = state.mask[index];
        if (mask <= 0) continue;

        const x = state.ox + (col + 0.5 + (row & 1) * 0.5) * state.cw;
        let heat = state.heat[index];

        // The pointer itself holds a hot spot, even while the hand is still.
        if (state.near > 0.002) {
          const q = ((x - state.hx) ** 2 + (y - state.hy) ** 2) / nearRange2;
          if (q < 1) {
            heat = Math.max(heat, 0.95 * state.near * (1 - q) * (1 - q));
          }
        }

        for (const ring of rings) {
          // Gaussian band: the press sends a widening, fading circle out.
          const q = (Math.hypot(x - ring.x, y - ring.y) - ring.radius) / 24;
          if (q > -2.5 && q < 2.5) heat += ring.amp * Math.exp(-q * q);
        }

        heat *= 0.55 + 0.45 * mask;
        let level = Math.min(1, heat) * top + 0.5;
        if (heat > DOT_THRESHOLD) {
          // Dither the glyph choice so neighbouring cells do not band.
          level +=
            (rand(index, state.deal) - 0.5) * 1.6 * Math.min(1, heat * 2);
        }
        const glyph = clamp(Math.floor(level), 1, top);

        let px = x;
        let py = y;
        if (pull > 0.002) {
          const dx = state.hx - px;
          const dy = state.hy - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < pullRange2) {
            const falloff = 1 - d2 / pullRange2;
            const distance = Math.sqrt(d2) || 1;
            const amount = Math.min(
              distance * 0.6,
              14 * pull * falloff * falloff,
            );
            px += (dx / distance) * amount;
            py += (dy / distance) * amount;
          }
        }

        if (heat <= DOT_THRESHOLD || glyph === 1) {
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.45, dotRadius * Math.sqrt(mask)), 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        ctx.globalAlpha = 1;
        ctx.fillText(ramp[glyph], px, py);
      }
    }
    ctx.globalAlpha = 1;
  }

  function start() {
    if (state.raf) return;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const cooling = Math.exp((-dt * 3) / Math.max(0.1, options.trail));
      let peak = 0;
      for (let i = 0; i < state.heat.length; i++) {
        const next = state.heat[i] * cooling;
        state.heat[i] = next < 0.003 ? 0 : next;
        if (next > peak) peak = next;
      }

      state.rings = state.rings.filter((ring) => (ring.t += dt) < RING_LIFE);
      state.near += (+!!state.inside - state.near) * (1 - 0.004 ** dt);
      state.tick += dt;
      if (state.tick > 0.07) {
        state.tick = 0;
        state.deal++;
      }

      draw();

      const idle =
        peak === 0 &&
        state.rings.length === 0 &&
        Math.abs(+!!state.inside - state.near) < 0.004;
      state.raf = idle ? 0 : requestAnimationFrame(frame);
    };
    state.raf = requestAnimationFrame(frame);
  }

  function move(x: number, y: number) {
    const radius = reachRadius();
    if (Number.isNaN(state.lx)) {
      state.lx = x;
      state.ly = y;
    }
    // Interpolate along the segment so a fast flick cannot skip cells.
    const distance = Math.hypot(x - state.lx, y - state.ly);
    const steps = Math.max(1, Math.ceil(distance / (radius / 3)));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      stamp(
        state.lx + (x - state.lx) * t,
        state.ly + (y - state.ly) * t,
        radius,
        0.5,
      );
    }
    state.lx = x;
    state.ly = y;
    state.hx = x;
    state.hy = y;
    state.inside = true;
    start();
  }

  return {
    resize() {
      measure();
      draw();
    },
    draw,
    start,
    move,
    enter(x: number, y: number) {
      // A fresh entry must not stamp a line from the last exit point.
      state.lx = NaN;
      state.ly = NaN;
      move(x, y);
    },
    leave() {
      state.inside = false;
      state.lx = NaN;
      start();
    },
    ring(x: number, y: number) {
      state.rings.push({ x, y, t: 0 });
      start();
    },
    setOptions(next: WakeOptions) {
      options = next;
    },
    stop() {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    },
  };
}
