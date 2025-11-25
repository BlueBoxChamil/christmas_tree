import React, { useState } from 'react';
import Experience from './components/Experience';
import Overlay from './components/Overlay';

const App: React.FC = () => {
  // Master State
  const [isFormed, setIsFormed] = useState(false);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Experience isFormed={isFormed} />
      </div>

      {/* UI Overlay Layer */}
      <Overlay 
        isFormed={isFormed} 
        toggleFormed={() => setIsFormed(prev => !prev)} 
      />
      
      {/* Gradient Vignette Overlay for extra cinematic depth */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
};

export default App;