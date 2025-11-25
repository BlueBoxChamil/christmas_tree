import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';

interface BearProps {
  progressRef: React.MutableRefObject<number>;
}

export const Bear: React.FC<BearProps> = ({ progressRef }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const { startPos, endPos } = useMemo(() => {
    // Start from random chaos
    const r = CONFIG.CHAOS_RADIUS;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    // End at the base of the tree
    return {
        startPos: new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        ),
        endPos: new THREE.Vector3(4, -CONFIG.TREE_HEIGHT/2 + 1.5, 4) // Bottom right offset
    };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = progressRef.current;
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    groupRef.current.position.lerpVectors(startPos, endPos, ease);
    
    // Look at center
    groupRef.current.lookAt(0, -CONFIG.TREE_HEIGHT/2, 0);
    
    // Chaos rotation to formed stability
    const chaosRot = state.clock.elapsedTime * 5;
    if (t < 0.9) {
        groupRef.current.rotation.x += (Math.sin(chaosRot) * 0.1) * (1-t);
        groupRef.current.rotation.z += (Math.cos(chaosRot) * 0.1) * (1-t);
    }
    
    // Pop in scale
    groupRef.current.scale.setScalar(ease * 1.5);
  });

  const bearMaterial = new THREE.MeshStandardMaterial({ 
    color: '#8B4513', 
    roughness: 0.8, 
    metalness: 0.1 
  });
  
  const snoutMaterial = new THREE.MeshStandardMaterial({
    color: '#D2B48C',
    roughness: 0.8
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]} material={bearMaterial} castShadow>
         <capsuleGeometry args={[0.8, 1.2, 4, 8]} />
      </mesh>
      
      {/* Head */}
      <group position={[0, 1.2, 0]}>
         <mesh material={bearMaterial} castShadow>
            <boxGeometry args={[1.1, 0.9, 1.0]} />
         </mesh>
         {/* Snout */}
         <mesh position={[0, -0.1, 0.5]} material={snoutMaterial}>
            <boxGeometry args={[0.5, 0.4, 0.2]} />
         </mesh>
         {/* Ears */}
         <mesh position={[0.4, 0.5, 0]} material={bearMaterial}>
            <sphereGeometry args={[0.25]} />
         </mesh>
         <mesh position={[-0.4, 0.5, 0]} material={bearMaterial}>
             <sphereGeometry args={[0.25]} />
         </mesh>
      </group>

      {/* Arms */}
      <mesh position={[0.9, 0.2, 0.2]} rotation={[0, 0, -0.5]} material={bearMaterial} castShadow>
         <capsuleGeometry args={[0.3, 1.0, 4, 8]} />
      </mesh>
      <mesh position={[-0.9, 0.2, 0.2]} rotation={[0, 0, 0.5]} material={bearMaterial} castShadow>
         <capsuleGeometry args={[0.3, 1.0, 4, 8]} />
      </mesh>

      {/* Legs */}
      <mesh position={[0.4, -0.8, 0.3]} rotation={[-1, 0, 0]} material={bearMaterial} castShadow>
         <capsuleGeometry args={[0.35, 1.0, 4, 8]} />
      </mesh>
       <mesh position={[-0.4, -0.8, 0.3]} rotation={[-1, 0, 0]} material={bearMaterial} castShadow>
         <capsuleGeometry args={[0.35, 1.0, 4, 8]} />
      </mesh>
      
      {/* Bow Tie */}
      <mesh position={[0, 0.7, 0.6]} rotation={[0,0,0]}>
         <boxGeometry args={[0.6, 0.2, 0.1]} />
         <meshStandardMaterial color={COLORS.RED_VELVET} />
      </mesh>
    </group>
  );
};
export default Bear;