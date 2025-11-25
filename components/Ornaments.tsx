import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS, _tempVec, _tempObj, _tempColor } from '../constants';

interface OrnamentProps {
  progressRef: React.MutableRefObject<number>;
  type: 'sphere' | 'box';
  count: number;
  colors: string[];
  baseScale: number;
  weightFactor: number;
  blink?: boolean;
}

export const OrnamentsRef: React.FC<OrnamentProps> = ({ 
  progressRef,
  type, 
  count, 
  colors, 
  baseScale, 
  weightFactor,
  blink = false
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const data = useMemo(() => {
    const chaos = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const rotations = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colorArray = new Float32Array(count * 3);
    const _colors = colors.map(c => new THREE.Color(c));

    for (let i = 0; i < count; i++) {
      // Chaos
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = (Math.random() * 0.5 + 0.5) * CONFIG.CHAOS_RADIUS;
      chaos[i*3] = r * Math.sin(phi) * Math.cos(theta);
      chaos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      chaos[i*3+2] = r * Math.cos(phi);

      // Target - Cone Volumetric Distribution
      const h = (Math.random() * CONFIG.TREE_HEIGHT * 0.95) - (CONFIG.TREE_HEIGHT / 2) + 0.2; 
      const normH = (h + (CONFIG.TREE_HEIGHT / 2)) / CONFIG.TREE_HEIGHT;
      
      const maxR = CONFIG.TREE_RADIUS_BOTTOM * (1.0 - normH);
      const depthBias = 0.5 + (Math.sqrt(Math.random()) * 0.55); 
      const rDist = maxR * depthBias;
      
      const treeTheta = Math.random() * Math.PI * 2;
      target[i*3] = rDist * Math.cos(treeTheta);
      target[i*3+1] = h;
      target[i*3+2] = rDist * Math.sin(treeTheta);

      rotations[i*3] = Math.random() * Math.PI;
      rotations[i*3+1] = Math.random() * Math.PI;
      rotations[i*3+2] = Math.random() * Math.PI;

      // Scale variation
      scales[i] = baseScale * (0.6 + Math.random() * 0.8);

      const c = _colors[Math.floor(Math.random() * _colors.length)];
      colorArray[i*3] = c.r; colorArray[i*3+1] = c.g; colorArray[i*3+2] = c.b;
    }
    return { chaos, target, rotations, scales, colorArray };
  }, [count, colors, baseScale]);

  useLayoutEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < count; i++) {
        _tempColor.setRGB(data.colorArray[i*3], data.colorArray[i*3+1], data.colorArray[i*3+2]);
        meshRef.current.setColorAt(i, _tempColor);
      }
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [data, count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    let t = progressRef.current;
    let effectiveT = Math.pow(t, weightFactor);
    const ease = effectiveT < 0.5 ? 4 * effectiveT * effectiveT * effectiveT : 1 - Math.pow(-2 * effectiveT + 2, 3) / 2;
    
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const cx = data.chaos[i3];
      const cy = data.chaos[i3+1];
      const cz = data.chaos[i3+2];
      const tx = data.target[i3];
      const ty = data.target[i3+1];
      const tz = data.target[i3+2];

      _tempVec.set(cx, cy, cz).lerp(new THREE.Vector3(tx, ty, tz), ease);

      const spin = (1 - ease) * 1.5;
      
      _tempObj.position.copy(_tempVec);
      _tempObj.rotation.set(
        data.rotations[i3] + time * spin,
        data.rotations[i3+1] + time * spin,
        data.rotations[i3+2]
      );
      
      let s = data.scales[i];
      if (blink) {
        // High frequency twinkling
        const flash = Math.sin(time * 5.0 + i * 42.0); // Faster blink
        const sparkle = Math.pow(Math.max(0, flash), 6.0); // Sharper peak
        s = s * (0.8 + sparkle * 2.5); // Bigger pop to simulate glowing flash
      }

      _tempObj.scale.setScalar(s);
      _tempObj.updateMatrix();
      meshRef.current.setMatrixAt(i, _tempObj.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      {type === 'box' ? <boxGeometry /> : <sphereGeometry args={[1, 16, 16]} />}
      <meshStandardMaterial 
        roughness={blink ? 0.1 : 0.25} 
        metalness={0.9} 
        emissive={COLORS.GOLD}
        emissiveIntensity={blink ? 2.0 : 0.15} // High native emissive for lights
      />
    </instancedMesh>
  );
};
export default OrnamentsRef;