"use client";

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
  return (
    <div className="w-full h-full bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950">
      <Canvas
        camera={{ position: [2, 1.5, 2.5], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} />
        <pointLight position={[0, 3, 2]} intensity={0.8} color="#f59e0b" />
        <Model />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}
