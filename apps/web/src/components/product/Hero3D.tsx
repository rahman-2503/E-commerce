import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Box, TorusKnot, Environment, Lightformer } from '@react-three/drei'

function FloatingShapes() {
  const groupRef = useRef<any>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={1.5}>
        <TorusKnot args={[1, 0.3, 128, 16]} scale={1.8}>
          <MeshDistortMaterial
            color="#22c55e"
            roughness={0.1}
            metalness={0.9}
            distort={0.15}
            speed={2}
            envMapIntensity={2}
          />
        </TorusKnot>
      </Float>

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[0.3, 32, 32]} position={[2.5, 1.5, -1]}>
          <MeshDistortMaterial color="#166534" roughness={0} metalness={0.5} distort={0.1} />
        </Sphere>
      </Float>

      <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <Box args={[0.4, 0.4, 0.4]} position={[-2.2, -1, 0.5]}>
          <MeshDistortMaterial color="#15803d" roughness={0.2} metalness={0.8} distort={0.05} />
        </Box>
      </Float>

      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={1.2}>
        <TorusKnot args={[0.5, 0.15, 64, 8]} position={[0, -1.8, -0.5]}>
          <MeshDistortMaterial color="#4ade80" roughness={0} metalness={0.3} distort={0.1} />
        </TorusKnot>
      </Float>
    </group>
  )
}

export default function Hero3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} />
        <pointLight position={[0, 3, 2]} intensity={2} color="#22c55e" />
        <FloatingShapes />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
