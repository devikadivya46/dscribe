import React from 'react';

interface LogoProps {
  className?: string;
  dotClassName?: string;
  strokeColor?: string;
}

export default function Logo({ 
  className = "h-8", 
  dotClassName = "animate-pulse", 
  strokeColor = "stroke-slate-900" 
}: LogoProps) {
  return (
    <svg 
      viewBox="0 0 310 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      id="dscribe-svg-logo"
    >
      {/* Letter 'D' */}
      <path 
        d="M 40,25 C 38,45 38,70 41,88" 
        className={strokeColor} 
        strokeWidth="9" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 40,26 C 65,22 80,35 80,56 C 80,78 62,87 41,88" 
        className={strokeColor} 
        strokeWidth="9" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Letter 'S' */}
      <path 
        d="M 115,36 C 115,25 93,24 93,38 C 93,48 114,51 114,66 C 114,80 91,82 85,73" 
        className={strokeColor} 
        strokeWidth="9" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Letter 'c' */}
      <path 
        d="M 148,54 C 144,44 127,45 127,62 C 127,78 141,80 148,70" 
        className={strokeColor} 
        strokeWidth="9.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Letter 'r' */}
      <path 
        d="M 160,52 V 88" 
        className={strokeColor} 
        strokeWidth="8.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 160,63 C 168,51 178,51 181,59" 
        className={strokeColor} 
        strokeWidth="8.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Letter 'i' */}
      <path 
        d="M 194,52 V 88" 
        className={strokeColor} 
        strokeWidth="8.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <circle 
        cx="194" 
        cy="36" 
        r="5.5" 
        fill="currentColor"
        className="fill-slate-900"
      />

      {/* Letter 'b' */}
      <path 
        d="M 208,25 V 88" 
        className={strokeColor} 
        strokeWidth="8.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M 208,66 C 216,53 234,53 234,71 C 234,88 217,88 208,88" 
        className={strokeColor} 
        strokeWidth="9" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Letter 'e' */}
      <path 
        d="M 246,71 C 246,55 268,54 268,69 C 268,82 249,85 246,73" 
        className={strokeColor} 
        strokeWidth="8.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* The Brilliant Electric Blue Dot */}
      <circle 
        cx="284" 
        cy="81" 
        r="8" 
        fill="#0066ff" 
        className={dotClassName}
      />
    </svg>
  );
}
