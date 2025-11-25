import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';

interface TopStarProps {
  progressRef: React.MutableRefObject<number>;
}

const StarGeometry = () => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const points = 5;
    // Sharper, thinner star: Outer radius same, inner radius reduced significantly
    const outerRadius = 1.8;
    const innerRadius = 0.5; 
    
    // Draw 5-pointed star
    for (let i = 0; i < points * 2; i++) {
        const l = i % 2 === 0 ? outerRadius : innerRadius;
        // Offset angle by PI/2 so the top point is straight up
        const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2; 
        const x = Math.cos(a) * l;
        const y = Math.sin(a) * l;
        if (i === 0) s.moveTo(x, y);
        else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.25, // Thinner profile
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.05,
    bevelSegments: 2, 
  }), []);
  
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Twinkle pattern: slow pulse + fast sparkle
    const glow = Math.sin(t * 2.0) * 0.3 + 0.7; // Base breather
    const sparkle = Math.pow(Math.max(0, Math.sin(t * 8.0 + 1.0)), 8.0); // Sharp flashes
    
    const intensity = 1.0 + sparkle * 4.0; 
    
    if (matRef.current) {
        matRef.current.emissiveIntensity = 0.5 + intensity;
    }
    if (lightRef.current) {
        // Light intensity fluctuates with the material
        lightRef.current.intensity = 2.0 + intensity * 1.5;
    }
  });

  return (
    <group>
        {/* Centered extrusion */}
        <mesh position={[0, 0, -0.125]}>
            <extrudeGeometry args={[shape, extrudeSettings]} />
            <meshStandardMaterial 
                ref={matRef}
                color={COLORS.STAR_WHITE} 
                emissive={COLORS.GOLD}
                emissiveIntensity={2.0}
                roughness={0.1}
                metalness={1.0}
            />
        </mesh>
        {/* Central glow point light */}
        <pointLight ref={lightRef} color={COLORS.WARM_LIGHT} distance={15} decay={2.5} />
    </group>
  );
};

export const TopStar: React.FC<TopStarProps> = ({ progressRef }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const { startPos, endPos } = useMemo(() => {
    const r = CONFIG.CHAOS_RADIUS;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    // Position exactly at tip of tree (Height/2)
    // Decreased offset to 1.25 (half of previous 2.5) to bring star closer to tree tip
    const TIP_OFFSET = 1.25;
    
    return {
        startPos: new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta) + 10,
            r * Math.cos(phi)
        ),
        endPos: new THREE.Vector3(0, (CONFIG.TREE_HEIGHT / 2) + TIP_OFFSET, 0) 
    };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const t = progressRef.current;
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    groupRef.current.position.lerpVectors(startPos, endPos, ease);
    
    // Rotate the star slowly
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    
    const baseScale = ease;
    groupRef.current.scale.setScalar(baseScale);
  });

  return (
    <group ref={groupRef}>
        <StarGeometry />
    </group>
  );
};
export default TopStar;