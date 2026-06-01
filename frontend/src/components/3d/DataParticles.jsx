import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export default function DataParticles() {
  const pointsRef = useRef();
  
  const particlesCount = 400;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const seed = Math.sin(i * 12.9898) * 43758.5453;
      const seed2 = Math.sin((i + 17) * 78.233) * 24634.6345;
      const seed3 = Math.sin((i + 43) * 37.719) * 13515.8732;
      pos[i * 3] = (seed - Math.floor(seed) - 0.5) * 12;
      pos[i * 3 + 1] = (seed2 - Math.floor(seed2) - 0.5) * 8;
      pos[i * 3 + 2] = (seed3 - Math.floor(seed3) - 0.5) * 4;
    }
    return pos;
  }, [particlesCount]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3 + 1] += 0.005; // drift upward
      if (positions[i * 3 + 1] > 4) {
        positions[i * 3 + 1] = -4; // wrap around
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={particlesCount} 
          array={positions} 
          itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.04} 
        color="#1a1a1a" 
        transparent 
        opacity={0.25} 
      />
    </points>
  );
}
