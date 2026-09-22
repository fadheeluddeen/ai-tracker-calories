import React from 'react';

interface LiquidGlassEmblemProps {
  size?: number;
  className?: string;
  showRings?: boolean;
}

export const LiquidGlassEmblem: React.FC<LiquidGlassEmblemProps> = ({
  size = 64,
  className = '',
  showRings = true,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`select-none ${className}`}
    >
      <defs>
        {/* Ambient Drop Shadow */}
        <filter id="emblem-shadow" x="-15%" y="-15%" width="130%" height="135%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#000000" floodOpacity="0.28" />
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.14" />
        </filter>

        {/* Specular Glow */}
        <filter id="emblem-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Liquid Frosted Titanium Background */}
        <linearGradient id="emblem-bg" x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#f4f4f6" stopOpacity="0.7" />
          <stop offset="70%" stopColor="#e4e4e7" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#d4d4d8" stopOpacity="0.8" />
        </linearGradient>

        {/* Razor Rim Border */}
        <linearGradient id="emblem-rim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#a1a1aa" stopOpacity="0.2" />
          <stop offset="85%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#71717a" stopOpacity="0.4" />
        </linearGradient>

        {/* Caustic Blooms */}
        <radialGradient id="emblem-caustic-warm" cx="30%" cy="30%" r="45%">
          <stop offset="0%" stopColor="#ffedd5" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#fed7aa" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffedd5" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="emblem-caustic-cool" cx="70%" cy="70%" r="45%">
          <stop offset="0%" stopColor="#ccfbf1" stopOpacity="0.65" />
          <stop offset="60%" stopColor="#e0f2fe" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
        </radialGradient>

        {/* Macro Rings Gradients */}
        <linearGradient id="emblem-cal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff3b30" />
          <stop offset="50%" stopColor="#ff6b22" />
          <stop offset="100%" stopColor="#ff9500" />
        </linearGradient>

        <linearGradient id="emblem-pro-grad" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34c759" />
          <stop offset="50%" stopColor="#30d158" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        <linearGradient id="emblem-carb-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#007aff" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        {/* Lens Specular Sheen */}
        <linearGradient id="emblem-lens" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="80%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Droplet Core */}
        <radialGradient id="emblem-droplet-core" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#f8fafc" stopOpacity="0.85" />
          <stop offset="75%" stopColor="#cbd5e1" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.8" />
        </radialGradient>
      </defs>

      {/* SQUIRCLE BASE */}
      <g filter="url(#emblem-shadow)">
        <path
          d="M 256 24
             C 384 24, 464 24, 488 48
             C 512 72, 512 152, 512 256
             C 512 360, 512 440, 488 464
             C 464 488, 384 488, 256 488
             C 128 488, 48 488, 24 464
             C 0 440, 0 360, 0 256
             C 0 152, 0 72, 24 48
             C 48 24, 128 24, 256 24 Z"
          fill="url(#emblem-bg)"
          stroke="url(#emblem-rim)"
          strokeWidth="3"
        />
      </g>

      {/* CAUSTIC REFRACTIONS */}
      <g opacity="0.85" style={{ mixBlendMode: 'overlay' }}>
        <circle cx="170" cy="180" r="140" fill="url(#emblem-caustic-warm)" />
        <circle cx="340" cy="330" r="140" fill="url(#emblem-caustic-cool)" />
      </g>

      {/* MACRO RINGS */}
      {showRings && (
        <g transform="rotate(-90 256 256)">
          {/* Calorie Ring */}
          <circle cx="256" cy="256" r="164" fill="none" stroke="#18181b" strokeOpacity="0.08" strokeWidth="28" />
          <circle
            cx="256"
            cy="256"
            r="164"
            fill="none"
            stroke="url(#emblem-cal-grad)"
            strokeWidth="28"
            strokeLinecap="round"
            strokeDasharray="1030"
            strokeDashoffset="230"
            filter="url(#emblem-glow)"
          />
          <circle cx="420" cy="256" r="6" fill="#ffffff" opacity="0.9" filter="url(#emblem-glow)" />

          {/* Protein Ring */}
          <circle cx="256" cy="256" r="124" fill="none" stroke="#18181b" strokeOpacity="0.08" strokeWidth="24" />
          <circle
            cx="256"
            cy="256"
            r="124"
            fill="none"
            stroke="url(#emblem-pro-grad)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeDasharray="779"
            strokeDashoffset="210"
            filter="url(#emblem-glow)"
          />
          <circle cx="380" cy="256" r="5" fill="#ffffff" opacity="0.85" filter="url(#emblem-glow)" />

          {/* Carbs Ring */}
          <circle cx="256" cy="256" r="88" fill="none" stroke="#18181b" strokeOpacity="0.08" strokeWidth="20" />
          <circle
            cx="256"
            cy="256"
            r="88"
            fill="none"
            stroke="url(#emblem-carb-grad)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray="553"
            strokeDashoffset="75"
            filter="url(#emblem-glow)"
          />
          <circle cx="344" cy="256" r="4.5" fill="#ffffff" opacity="0.85" filter="url(#emblem-glow)" />
        </g>
      )}

      {/* CENTER DROPLET JEWEL */}
      <g transform="translate(256, 256)">
        <ellipse cx="0" cy="18" rx="28" ry="10" fill="#000000" opacity="0.16" filter="url(#emblem-glow)" />
        <path
          d="M 0 -36
             C 18 -12, 38 10, 38 28
             A 38 38 0 0 1 -38 28
             C -38 10, -18 -12, 0 -36 Z"
          fill="url(#emblem-droplet-core)"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeOpacity="0.9"
        />
        <ellipse cx="0" cy="30" rx="20" ry="12" fill="#ffffff" opacity="0.75" />
        <path
          d="M 0 -14
             C 5 -5, 12 3, 12 12
             A 12 12 0 0 1 -12 12
             C -12 4, -4 -5, 0 -14 Z"
          fill="#18181b"
          opacity="0.85"
        />
        <ellipse cx="-10" cy="10" rx="6" ry="10" transform="rotate(-30 -10 10)" fill="#ffffff" opacity="0.9" />
        <circle cx="8" cy="34" r="3" fill="#ffffff" opacity="0.8" />
      </g>

      {/* UPPER GLASS LENS SPECULAR CRESCENT */}
      <path
        d="M 28 52
           C 52 28, 130 28, 256 28
           C 382 28, 460 28, 484 52
           C 500 68, 506 112, 508 176
           C 370 216, 142 216, 4 176
           C 6 112, 12 68, 28 52 Z"
        fill="url(#emblem-lens)"
        pointerEvents="none"
      />
      <line x1="140" y1="26" x2="372" y2="26" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
    </svg>
  );
};
