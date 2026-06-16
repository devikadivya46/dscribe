import React from 'react';

interface LogoProps {
  className?: string;
  dotClassName?: string;
  strokeColor?: string;
  imageSrc?: string; // optional external image path
}

export default function Logo({ 
  className = "h-8", 
  dotClassName = "animate-pulse", 
  strokeColor = "stroke-slate-900",
  imageSrc
}: LogoProps) {
  const [imgFailed, setImgFailed] = React.useState(false);

  const src = imageSrc || '/assets/images/dscribe-logo.svg';

  if (!imgFailed) {
    return (
      // try external raster/logo image first; fall back to SVG on error
      // keep `className` for sizing consistency
      // the `/assets/images/dscribe-logo.png` path should be placed in the project's `assets/images` folder or public static assets
      <img
        src={src}
        alt="DScribe"
        className={className}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 360 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="DScribe"
    >
      <title>DScribe</title>
      <text x="8" y="64" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" fontWeight="800" fontSize="56" fill="currentColor">
        DScribe
      </text>
      <circle cx="320" cy="68" r="8" fill="#0066ff" className={dotClassName} />
      <text x="288" y="64" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" fontWeight="800" fontSize="56" fill="currentColor">.</text>
    </svg>
  );
}
