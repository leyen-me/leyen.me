"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";

function Model() {
  const { scene } = useGLTF("/models/cyberpunk_bar.glb");
  return (
    <primitive
      object={scene}
      scale={1.2}
      position={[0, -0.5, 0]}
      rotation={[0, Math.PI * 0.15, 0]}
    />
  );
}

export default function Hero3DScene() {
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const bgColor = resolvedTheme === "dark" ? "#18181b" : "#f4f4f5";

  return (
    <div className="w-full h-full min-h-0 bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950">
      <Canvas
        camera={{ position: [2, 1.5, 2.5], fov: 45 }}
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
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={!isMobile}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}
