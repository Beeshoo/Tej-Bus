
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_5px_15px_rgba(245,158,11,0.3)]"
      >
        {/* Bus Body */}
        <rect x="15" y="45" width="70" height="35" rx="6" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
        
        {/* Windows */}
        <rect x="22" y="50" width="12" height="12" rx="2" fill="white" fillOpacity="0.3" />
        <rect x="38" y="50" width="12" height="12" rx="2" fill="white" fillOpacity="0.3" />
        <rect x="54" y="50" width="12" height="12" rx="2" fill="white" fillOpacity="0.3" />
        <rect x="70" y="50" width="8" height="12" rx="2" fill="white" fillOpacity="0.3" />

        {/* Wheels */}
        <circle cx="30" cy="80" r="6" fill="#1e1b4b" stroke="#d97706" strokeWidth="1" />
        <circle cx="70" cy="80" r="6" fill="#1e1b4b" stroke="#d97706" strokeWidth="1" />
        <circle cx="30" cy="80" r="2.5" fill="#f59e0b" />
        <circle cx="70" cy="80" r="2.5" fill="#f59e0b" />

        {/* Crown (Taj) on top of the bus */}
        <g transform="translate(0, -10)">
          <path 
            d="M50 15 L58 30 L75 24 L68 45 H32 L25 24 L42 30 L50 15Z" 
            fill="#fbbf24" 
            stroke="#d97706" 
            strokeWidth="1.5"
            strokeLinejoin="round" 
          />
          <circle cx="50" cy="15" r="2.5" fill="#f59e0b" />
          <circle cx="75" cy="24" r="2" fill="#f59e0b" />
          <circle cx="25" cy="24" r="2" fill="#f59e0b" />
        </g>
        
        {/* Speed Lines */}
        <path d="M5 60 H12 M5 70 H10" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </svg>
    </div>
  );
};

export default Logo;