"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

// 调试用：集中管理参数，便于查看和调整
const MODEL_CONFIG = {
  scale: 0.38,
  position: [0, -0.2, 0] as [number, number, number],
  rotation: [0, 0.4712, 0] as [number, number, number],
};

const CAMERA_CONFIG = {
  position: [3.487, 0.581, -0.059] as [number, number, number],
  target: [0, 0, 0] as [number, number, number],
  fov: 45,
};

function Model() {
  const { scene } = useGLTF("/models/tesla_cybertruck.glb");
  return (
    <primitive
      object={scene}
      scale={MODEL_CONFIG.scale}
      position={MODEL_CONFIG.position}
      rotation={MODEL_CONFIG.rotation}
    />
  );
}

function CameraTracker({
  onUpdate,
}: {
  onUpdate: (data: { position: number[]; target: number[] }) => void;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const hasInitialized = useRef(false);

  const syncCamera = useCallback(() => {
    const controls = controlsRef.current;
    if (controls) {
      onUpdate({
        position: camera.position.toArray(),
        target: controls.target.toArray(),
      });
    }
  }, [camera, onUpdate]);

  useFrame(() => {
    if (!hasInitialized.current && controlsRef.current) {
      hasInitialized.current = true;
      syncCamera();
    }
  });

  const handleChange = useCallback(() => {
    syncCamera();
  }, [syncCamera]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={CAMERA_CONFIG.target}
      enableZoom={false}
      enablePan={false}
      enableRotate={true}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2}
      onChange={handleChange}
    />
  );
}

export default function Hero3DScene() {
  const [isMobile, setIsMobile] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [liveCamera, setLiveCamera] = useState<{
    position: number[];
    target: number[];
  } | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const bgColor = resolvedTheme === "dark" ? "#18181b" : "#f4f4f5";

  const radToDeg = (rad: number) => Math.round((rad * 180) / Math.PI);

  return (
    <div className="relative w-full h-full min-h-0 bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950">
      <Canvas
        camera={{
          position: CAMERA_CONFIG.position,
          fov: CAMERA_CONFIG.fov,
        }}
        gl={{
          antialias: !isMobile,
          alpha: false,
          powerPreference: isMobile ? "low-power" : "default",
        }}
        dpr={isMobile ? 1 : [1, 2]}
      >
        <color attach="background" args={[bgColor]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} />
        <pointLight position={[0, 3, 2]} intensity={0.8} color="#f59e0b" />
        <Model />
        <CameraTracker onUpdate={setLiveCamera} />
      </Canvas>

      {/* 调试开关：点击显示/隐藏参数 */}
      <button
        type="button"
        onClick={() => setShowDebug((v) => !v)}
        className="absolute top-2 right-2 z-10 px-2 py-1 text-xs rounded bg-zinc-800/80 text-zinc-200 hover:bg-zinc-700/80 transition-colors"
      >
        {showDebug ? "隐藏参数" : "显示参数"}
      </button>

      {showDebug && (
        <div className="absolute bottom-2 left-2 right-2 z-10 p-3 rounded-lg bg-zinc-900/95 text-zinc-200 text-xs font-mono overflow-auto max-h-[40%]">
          <div className="font-semibold mb-2 text-amber-400">模型参数</div>
          <pre className="whitespace-pre-wrap break-all">
            {`scale: ${MODEL_CONFIG.scale}
position: [${MODEL_CONFIG.position.join(", ")}]
rotation (rad): [${MODEL_CONFIG.rotation.map((r) => r.toFixed(4)).join(", ")}]
rotation (deg): [${MODEL_CONFIG.rotation.map(radToDeg).join("°, ")}°]

相机参数 ${liveCamera ? "(实时，拖拽后更新)" : "(初始值)"}
camera position: [${(liveCamera?.position ?? CAMERA_CONFIG.position).map((n) => n.toFixed(3)).join(", ")}]
camera target: [${(liveCamera?.target ?? CAMERA_CONFIG.target).map((n) => n.toFixed(3)).join(", ")}]
camera fov: ${CAMERA_CONFIG.fov}`}
          </pre>
        </div>
      )}
    </div>
  );
}
