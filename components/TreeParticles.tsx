import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';

const fragmentShader = `
  uniform float uTime;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    // Sparkle effect
    float sparkle = sin(uTime * 3.0 + vColor.x * 10.0) * 0.5 + 0.5;
    
    // Mix slightly with gold for a luxury sheen on everything
    vec3 luxuryTint = mix(vColor, vec3(1.0, 0.9, 0.6), sparkle * 0.2); 
    
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 2.0);
    
    gl_FragColor = vec4(luxuryTint, vAlpha * glow);
  }
`;

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  attribute vec3 aChaosPos;
  attribute vec3 aTargetPos;
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  float easeInOutCubic(float x) {
    return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
  }

  void main() {
    vColor = aColor;
    vAlpha = 1.0;
    float t = easeInOutCubic(uProgress);
    
    vec3 pos = mix(aChaosPos, aTargetPos, t);

    // Wind/Breathing
    if (uProgress > 0.8) {
        float wind = sin(uTime * 0.5 + pos.y * 0.2) * 0.1;
        pos.x += wind;
        pos.z += cos(uTime * 0.3 + pos.x) * 0.05;
    }

    // Chaos Swirl
    if (uProgress < 0.3) {
        float angle = uTime * 0.2;
        float x = pos.x * cos(angle) - pos.z * sin(angle);
        float z = pos.x * sin(angle) + pos.z * cos(angle);
        pos.x = x;
        pos.z = z;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Scale size by distance
    gl_PointSize = aSize * (450.0 / -mvPosition.z);
  }
`;

interface TreeParticlesProps {
  progressRef: React.MutableRefObject<number>;
}

export const TreeParticlesRef: React.FC<TreeParticlesProps> = ({ progressRef }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { chaosPositions, targetPositions, colors, sizes } = useMemo(() => {
    const count = CONFIG.PARTICLE_COUNT;
    const chaosPos = new Float32Array(count * 3);
    const targetPos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const s = new Float32Array(count);
    
    const green = new THREE.Color(COLORS.EMERALD);
    const deepGreen = new THREE.Color(COLORS.DEEP_GREEN);
    const gold = new THREE.Color(COLORS.GOLD);

    for (let i = 0; i < count; i++) {
      // Chaos
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * CONFIG.CHAOS_RADIUS;
      chaosPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
      chaosPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      chaosPos[i*3+2] = r * Math.cos(phi);

      // Target - Cone Shape
      const h = (Math.random() * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
      const normH = (h + (CONFIG.TREE_HEIGHT / 2)) / CONFIG.TREE_HEIGHT;
      
      const maxR = CONFIG.TREE_RADIUS_BOTTOM * (1.0 - normH);
      
      // Volume Filling
      const distBias = Math.pow(Math.random(), 0.3); 
      const rDist = distBias * maxR; 
      
      const treeTheta = Math.random() * Math.PI * 2;
      targetPos[i*3] = rDist * Math.cos(treeTheta);
      targetPos[i*3+1] = h;
      targetPos[i*3+2] = rDist * Math.sin(treeTheta);

      // Color Strategy:
      // With 135k particles, we must reduce the ratio of bright elements 
      // to prevent the tree from looking like a light bulb.
      // We want a massive block of Deep Emerald.
      const rand = Math.random();
      let c;
      if (rand > 0.985) { // Only top 1.5% are gold (approx 2000 sparkles)
        c = gold;
        s[i] = Math.random() * 0.4 + 0.4;
      } else if (rand > 0.90) { // Next 8.5% are emerald highlights
        c = green; 
        s[i] = Math.random() * 0.3 + 0.1;
      } else {
        c = deepGreen; // 90% are Deep Green (The requested "Tripled" foundation)
        s[i] = Math.random() * 0.35 + 0.15;
      }
      
      cols[i*3] = c.r; cols[i*3+1] = c.g; cols[i*3+2] = c.b;
    }
    return { chaosPositions: chaosPos, targetPositions: targetPos, colors: cols, sizes: s };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uProgress.value = progressRef.current;
    }
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
  }), []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={chaosPositions.length/3} array={chaosPositions} itemSize={3} />
        <bufferAttribute attach="attributes-aChaosPos" count={chaosPositions.length/3} array={chaosPositions} itemSize={3} />
        <bufferAttribute attach="attributes-aTargetPos" count={targetPositions.length/3} array={targetPositions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={colors.length/3} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={sizes.length} array={sizes} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
};
export default TreeParticlesRef;