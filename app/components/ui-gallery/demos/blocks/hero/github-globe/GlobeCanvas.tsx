"use client";

/**
 * R3F canvas + three-globe port of the Aceternity HTML/JS globe.
 *
 * Kept from the original: the globe material colours, country hex polygons at
 * resolution 3 with 0.7 margin, atmosphere, arcs with the same geometry and
 * dash timing, merged point markers, rings every 2s, the OrbitControls limits
 * and auto-rotation, and the fogged transparent scene.
 *
 * Changed for the gallery: the canvas is sized by its container instead of a
 * fixed aspect ratio, the three-globe instance is disposed on unmount, the
 * ring interval is cleared, and reduced motion turns off auto-rotation, arc
 * dash animation and the ring pulse.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ThreeGlobe from "three-globe";
import {
  Color,
  Fog,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  type Group,
} from "three";

// Natural Earth 110m admin-0 countries, vendored from three-globe's example
// dataset. A degenerate duplicate-vertex ring was removed so H3 accepts every
// polygon; the rest is untouched.
import countries from "./.data/countries.json";
import { GLOBE_CONFIG, SAMPLE_ARCS, type GlobeArc } from "./data";

type CountryFeature = {
  type: string;
  properties: { name: string };
  geometry: { type: string; coordinates: number[] };
};

type GlobePoint = {
  size: number;
  order: number;
  color: string;
  lat: number;
  lng: number;
};

type RingDatum = { lat: number; lng: number; color: string };

const COUNTRY_FEATURES = countries.features as unknown as CountryFeature[];
const ARC_STROKES = [0.32, 0.28, 0.3];
const RING_INTERVAL_MS = 2000;

/** Same query the CSS layer uses; false until mounted, so SSR is stable. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduced;
}

/** Points are deduped by position, as the original does before merging. */
function buildPoints(arcs: GlobeArc[]): GlobePoint[] {
  const points: GlobePoint[] = [];

  for (const arc of arcs) {
    points.push({
      size: GLOBE_CONFIG.pointSize,
      order: arc.order,
      color: arc.color,
      lat: arc.startLat,
      lng: arc.startLng,
    });
    points.push({
      size: GLOBE_CONFIG.pointSize,
      order: arc.order,
      color: arc.color,
      lat: arc.endLat,
      lng: arc.endLng,
    });
  }

  return points.filter(
    (point, index, all) =>
      all.findIndex(
        (candidate) =>
          candidate.lat === point.lat && candidate.lng === point.lng,
      ) === index,
  );
}

function disposeGlobe(globe: Group | ThreeGlobe) {
  globe.traverse((child) => {
    const mesh = child as Mesh;
    mesh.geometry?.dispose();
    if (!mesh.material) return;
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const material of materials) material.dispose();
  });
}

function Globe({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const globe = new ThreeGlobe();
    group.add(globe);

    const material = globe.globeMaterial() as MeshPhongMaterial;
    material.color = new Color(GLOBE_CONFIG.globeColor);
    material.emissive = new Color(GLOBE_CONFIG.emissive);
    material.emissiveIntensity = GLOBE_CONFIG.emissiveIntensity;
    material.shininess = GLOBE_CONFIG.shininess;
    material.needsUpdate = true;

    globe
      .hexPolygonsData(COUNTRY_FEATURES as object[])
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(GLOBE_CONFIG.showAtmosphere)
      .atmosphereColor(GLOBE_CONFIG.atmosphereColor)
      .atmosphereAltitude(GLOBE_CONFIG.atmosphereAltitude)
      .hexPolygonColor(() => GLOBE_CONFIG.polygonColor);

    globe
      .arcsData(SAMPLE_ARCS as object[])
      .arcStartLat((datum) => (datum as GlobeArc).startLat)
      .arcStartLng((datum) => (datum as GlobeArc).startLng)
      .arcEndLat((datum) => (datum as GlobeArc).endLat)
      .arcEndLng((datum) => (datum as GlobeArc).endLng)
      .arcColor((datum: object) => (datum as GlobeArc).color)
      .arcAltitude((datum) => (datum as GlobeArc).arcAlt)
      .arcStroke(
        (datum) => ARC_STROKES[(datum as GlobeArc).order % ARC_STROKES.length],
      )
      .arcDashLength(GLOBE_CONFIG.arcLength)
      .arcDashInitialGap((datum) => (datum as GlobeArc).order)
      .arcDashGap(15)
      .arcDashAnimateTime(reducedMotion ? 0 : GLOBE_CONFIG.arcTime);

    globe
      .pointsData(buildPoints(SAMPLE_ARCS) as object[])
      .pointColor((datum) => (datum as GlobePoint).color)
      .pointsMerge(true)
      .pointAltitude(0)
      .pointRadius(2);

    globe
      .ringsData([])
      .ringColor(() => GLOBE_CONFIG.polygonColor)
      .ringMaxRadius(GLOBE_CONFIG.maxRings)
      .ringPropagationSpeed(3)
      .ringRepeatPeriod(
        (GLOBE_CONFIG.arcTime * GLOBE_CONFIG.arcLength) / GLOBE_CONFIG.rings,
      );

    let ringTimer: number | undefined;
    if (!reducedMotion) {
      let tick = 0;
      ringTimer = window.setInterval(() => {
        tick += 1;
        const rings: RingDatum[] = SAMPLE_ARCS.filter(
          (_, index) => index % 5 === tick % 5,
        ).map((arc) => ({
          lat: arc.startLat,
          lng: arc.startLng,
          color: arc.color,
        }));
        globe.ringsData(rings as object[]);
      }, RING_INTERVAL_MS);
    }

    return () => {
      if (ringTimer !== undefined) window.clearInterval(ringTimer);
      group.remove(globe);
      disposeGlobe(globe);
    };
  }, [reducedMotion]);

  return <group ref={groupRef} />;
}

export default function GlobeCanvas() {
  const reducedMotion = usePrefersReducedMotion();

  const scene = useMemo(() => {
    const value = new Scene();
    value.fog = new Fog(0xffffff, 400, 2000);
    return value;
  }, []);

  const camera = useMemo(() => new PerspectiveCamera(50, 1.2, 180, 1800), []);

  return (
    <Canvas
      camera={camera}
      scene={scene}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight color={GLOBE_CONFIG.ambientLight} intensity={0.6} />
      <directionalLight
        color={GLOBE_CONFIG.directionalLeftLight}
        position={new Vector3(-400, 100, 400)}
      />
      <directionalLight
        color={GLOBE_CONFIG.directionalTopLight}
        position={new Vector3(-200, 500, 200)}
      />
      <pointLight
        color={GLOBE_CONFIG.pointLight}
        position={new Vector3(-200, 500, 200)}
        intensity={0.8}
      />
      <Globe reducedMotion={reducedMotion} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={300}
        maxDistance={300}
        autoRotate={GLOBE_CONFIG.autoRotate && !reducedMotion}
        autoRotateSpeed={1}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI - Math.PI / 3}
      />
    </Canvas>
  );
}
