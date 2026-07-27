import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Environment, ContactShadows } from '@react-three/drei'

function RotatingProduct() {
  const meshRef = useRef<any>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.05
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={2.2}>
        <torusKnotGeometry args={[1, 0.4, 128, 16]} />
        <MeshDistortMaterial
          color="#22c55e"
          roughness={0.1}
          metalness={0.8}
          distort={0.1}
          speed={1.5}
          envMapIntensity={1.5}
        />
      </mesh>
    </Float>
  )
}

export default function Product3DViewer() {
  return (
    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 40 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} />
        <pointLight position={[0, 3, 2]} intensity={3} color="#22c55e" />
        <RotatingProduct />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={4} blur={2} />
        <Environment preset="studio" />
      </Canvas>
    </div>
  )
}
