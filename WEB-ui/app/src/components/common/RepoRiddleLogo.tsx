import React, { useId } from 'react';

interface RepoRiddleLogoProps {
  className?: string;
  size?: number;
}

/**
 * Custom isometric AST & Tactical Graph Prism Emblem for RepoRiddle.
 * Combines a faceted cyber-shield hexagon, an isometric AST cube, and glowing dependency nodes.
 */
export const RepoRiddleLogo: React.FC<RepoRiddleLogoProps> = ({ className = '', size = 28 }) => {
  const uid = useId().replace(/:/g, '');
  const bgGradId = `rr-hex-bg-${uid}`;
  const edgeGradId = `rr-edge-grad-${uid}`;
  const coreGlowId = `rr-core-glow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id={bgGradId} x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#162238" />
          <stop offset="100%" stopColor="#080D18" />
        </linearGradient>
        <linearGradient id={edgeGradId} x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7695FF" />
          <stop offset="50%" stopColor="#45D9CF" />
          <stop offset="100%" stopColor="#43D8A8" />
        </linearGradient>
        <radialGradient id={coreGlowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#45D9CF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#45D9CF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer Tactical Hexagon Shield */}
      <polygon
        points="18,2 32,10 32,26 18,34 4,26 4,10"
        fill={`url(#${bgGradId})`}
        stroke={`url(#${edgeGradId})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Ambient Core Pulse */}
      <circle cx="18" cy="18" r="11" fill={`url(#${coreGlowId})`} />

      {/* Inner Isometric AST Cube Wireframe */}
      <path
        d="M18 8.5L26.5 13.2V22.8L18 27.5L9.5 22.8V13.2L18 8.5Z"
        stroke="#7695FF"
        strokeOpacity="0.4"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />

      {/* Directed Dependency & Workflow Edges */}
      <path
        d="M18 10V18M18 18L11.2 22.2M18 18L24.8 22.2M11.2 13.8L18 18L24.8 13.8"
        stroke={`url(#${edgeGradId})`}
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Peripheral Module Nodes */}
      <circle cx="11.2" cy="13.8" r="2.1" fill="#7695FF" />
      <circle cx="24.8" cy="13.8" r="2.1" fill="#45D9CF" />
      <circle cx="11.2" cy="22.2" r="2.1" fill="#43D8A8" />
      <circle cx="24.8" cy="22.2" r="2.1" fill="#B49AFF" />

      {/* Apex Quest / Riddle Crown Node */}
      <circle cx="18" cy="9.5" r="2.4" fill="#F4C66E" />

      {/* Central Nexus Node */}
      <circle cx="18" cy="18" r="3.2" fill="#080D18" stroke="#45D9CF" strokeWidth="1.8" />
      <circle cx="18" cy="18" r="1.25" fill="#F2F6FF" />
    </svg>
  );
};

export default RepoRiddleLogo;
