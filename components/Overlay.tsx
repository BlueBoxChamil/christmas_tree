import React from 'react';

interface OverlayProps {
  isFormed: boolean;
  toggleFormed: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ isFormed, toggleFormed }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-10">
      
      {/* Header - Pinned Top-Left */}
      <header className="text-left self-start max-w-[60%] md:max-w-none">
        <h1 className="text-3xl md:text-6xl text-[#D4AF37] font-bold tracking-widest luxury-font drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight">
          GRAND <br/> LUXURY
        </h1>
        <p className="text-[#024b28] uppercase tracking-[0.2em] font-semibold mt-2 bg-[#D4AF37] inline-block px-2 py-1 shadow-lg text-[10px] md:text-base">
          Interactive Tree
        </p>
      </header>

      {/* Footer / Controls - Pinned Bottom-Right */}
      <div className="flex flex-col items-end self-end max-w-[60%] md:max-w-none">
        <div className="pointer-events-auto">
          <button
            onClick={toggleFormed}
            className={`
              relative group overflow-hidden px-5 py-3 md:px-10 md:py-4 
              border-2 border-[#D4AF37] 
              text-[#D4AF37] 
              transition-all duration-500 ease-out
              ${isFormed ? 'bg-[#022D19]/80' : 'bg-black/50'}
              hover:shadow-[0_0_20px_#D4AF37]
              text-right
            `}
          >
            <span className={`
              absolute inset-0 w-full h-full bg-[#D4AF37] 
              transform transition-transform duration-300 ease-in-out
              ${isFormed ? '-translate-x-full' : 'translate-x-0'}
              opacity-10
            `}></span>
            
            <span className="relative z-10 font-bold text-xs md:text-xl tracking-widest uppercase luxury-font whitespace-nowrap">
              {isFormed ? "Unleash Chaos" : "Assemble"}
            </span>
          </button>
        </div>
        
        <div className="mt-4 text-[#F7E7CE] text-[10px] md:text-xs tracking-widest opacity-60 text-right">
          <p>EST. 2024</p>
          <p>THE GOLD STANDARD</p>
        </div>
      </div>
    </div>
  );
};

export default Overlay;