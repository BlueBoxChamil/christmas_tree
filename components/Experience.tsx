import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import TreeParticles from './TreeParticles';
import Ornaments from './Ornaments';
import TopStar from './TopStar';
import { COLORS, CONFIG } from '../constants';

interface ExperienceProps {
  isFormed: boolean;
}

const SceneController = ({ isFormed }: { isFormed: boolean }) => {
    // The single source of truth for the animation value
    const progress = useRef(0);
    
    useFrame((state, delta) => {
        const target = isFormed ? 1 : 0;
        const speed = isFormed ? 0.6 : 1.0; // Slightly grander slow motion formation
        progress.current = THREE.MathUtils.damp(progress.current, target, speed, delta);
    });

    return (
        <>
            <Environment preset="lobby" />
            
            {/* Positioned at 0,0,0 to be dead center in the viewport */}
            <group position={[0, 0, 0]}>
                {/* We pass the MUTABLE ref. The components must read .current in their useFrame */}
                <TreeParticles progressRef={progress} />
                
                {/* The Grand Star */}
                <TopStar progressRef={progress} />
                
                {/* Replacement for the Bear: White, Yellow, Green Elements */}
                 <Ornaments 
                    progressRef={progress} 
                    type="box" 
                    count={200} 
                    colors={['#ffffff', COLORS.GOLD, COLORS.EMERALD]}
                    baseScale={0.9}
                    weightFactor={1.3} 
                />
                
                {/* Gifts (Heavy, Box) */}
                <Ornaments 
                    progressRef={progress} 
                    type="box" 
                    count={CONFIG.GIFT_COUNT} 
                    colors={[COLORS.GOLD, COLORS.RED_VELVET, '#ffffff']}
                    baseScale={0.8}
                    weightFactor={1.5} // Slower/Heavier
                />

                {/* Green Balls (Medium, Sphere) - Original Size */}
                <Ornaments 
                    progressRef={progress} 
                    type="sphere" 
                    count={200} 
                    colors={[COLORS.EMERALD]}
                    baseScale={0.5}
                    weightFactor={1.0}
                />

                {/* Yellow/Gold Balls (Medium, Sphere) - Half Size */}
                <Ornaments 
                    progressRef={progress} 
                    type="sphere" 
                    count={400} 
                    colors={[COLORS.GOLD, COLORS.CHAMPAGNE]}
                    baseScale={0.25}
                    weightFactor={1.0}
                />
                
                {/* Lights (Light, Small Sphere) - BLINK ENABLED */}
                 <Ornaments 
                    progressRef={progress} 
                    type="sphere" 
                    count={150} 
                    colors={[COLORS.WARM_LIGHT]}
                    baseScale={0.15}
                    weightFactor={0.5} // Fast
                    blink={true}
                />
            </group>

            {/* Lighting */}
            <ambientLight intensity={0.1} />
            
            {/* Main Key Light */}
            <spotLight 
                position={[15, 25, 15]} 
                angle={0.4} 
                penumbra={0.5} 
                intensity={40} 
                color={COLORS.CHAMPAGNE} 
                castShadow 
                shadow-bias={-0.0001}
            />
            
            {/* Rim Light for outline */}
             <spotLight position={[-15, 10, -5]} intensity={20} color={COLORS.EMERALD} angle={0.5} />
             
             {/* Fill */}
             <pointLight position={[0, 0, 10]} intensity={5} color={COLORS.GOLD} />

            {/* Post Processing */}
            <EffectComposer disableNormalPass>
                <Bloom 
                    luminanceThreshold={0.75} 
                    mipmapBlur 
                    intensity={1.5} 
                    radius={0.5}
                />
                <Vignette eskil={false} offset={0.1} darkness={0.6} />
            </EffectComposer>
            
            <OrbitControls 
                enablePan={false} 
                minPolarAngle={Math.PI / 4} 
                maxPolarAngle={Math.PI / 1.7}
                minDistance={15}
                maxDistance={50}
                autoRotate={isFormed}
                autoRotateSpeed={0.8}
            />
        </>
    )
}

const Experience: React.FC<ExperienceProps> = ({ isFormed }) => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 35], fov: 45 }}
      gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
      className="bg-black"
    >
        <SceneController isFormed={isFormed} />
    </Canvas>
  );
};

export default Experience;