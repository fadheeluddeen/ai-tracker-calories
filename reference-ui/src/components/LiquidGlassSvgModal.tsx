import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Download, Check, Code, Sparkles, Layers, Eye } from 'lucide-react';
import { hapticMedium, hapticSuccess, hapticSelection } from '../utils/haptics';
import { LiquidGlassEmblem } from './LiquidGlassEmblem';

interface LiquidGlassSvgModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiquidGlassSvgModal: React.FC<LiquidGlassSvgModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeAsset, setActiveAsset] = useState<'icon' | 'rings'>('icon');
  const [backdrop, setBackdrop] = useState<'glass' | 'dark' | 'light'>('glass');
  const [copied, setCopied] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);

  // SVG Source Code strings for fast copy/download
  const iconSvgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <filter id="ios-drop-shadow" x="-15%" y="-15%" width="130%" height="135%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#000000" flood-opacity="0.32" />
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.18" />
    </filter>
    <filter id="liquid-bead-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <linearGradient id="squircle-glass" x1="15%" y1="10%" x2="85%" y2="90%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.88" />
      <stop offset="35%" stop-color="#f4f4f6" stop-opacity="0.65" />
      <stop offset="70%" stop-color="#e4e4e7" stop-opacity="0.55" />
      <stop offset="100%" stop-color="#d4d4d8" stop-opacity="0.75" />
    </linearGradient>
    <linearGradient id="razor-rim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="25%" stop-color="#ffffff" stop-opacity="0.5" />
      <stop offset="50%" stop-color="#a1a1aa" stop-opacity="0.25" />
      <stop offset="75%" stop-color="#ffffff" stop-opacity="0.7" />
      <stop offset="100%" stop-color="#71717a" stop-opacity="0.4" />
    </linearGradient>
    <radialGradient id="caustic-warm" cx="30%" cy="32%" r="45%">
      <stop offset="0%" stop-color="#ffedd5" stop-opacity="0.75" />
      <stop offset="55%" stop-color="#fed7aa" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#ffedd5" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="caustic-cool" cx="70%" cy="68%" r="45%">
      <stop offset="0%" stop-color="#ccfbf1" stop-opacity="0.6" />
      <stop offset="60%" stop-color="#e0f2fe" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#bae6fd" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="ring-calorie" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff3b30" />
      <stop offset="45%" stop-color="#ff6b22" />
      <stop offset="90%" stop-color="#ff9500" />
    </linearGradient>
    <linearGradient id="ring-protein" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#34c759" />
      <stop offset="50%" stop-color="#30d158" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <linearGradient id="ring-water" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#007aff" />
      <stop offset="55%" stop-color="#0ea5e9" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="specular-lens" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55" />
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.25" />
      <stop offset="85%" stop-color="#ffffff" stop-opacity="0.0" />
    </linearGradient>
    <radialGradient id="droplet-core" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="35%" stop-color="#f8fafc" stop-opacity="0.8" />
      <stop offset="70%" stop-color="#cbd5e1" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#94a3b8" stop-opacity="0.75" />
    </radialGradient>
  </defs>
  <g filter="url(#ios-drop-shadow)">
    <path d="M 256 24 C 384 24, 464 24, 488 48 C 512 72, 512 152, 512 256 C 512 360, 512 440, 488 464 C 464 488, 384 488, 256 488 C 128 488, 48 488, 24 464 C 0 440, 0 360, 0 256 C 0 152, 0 72, 24 48 C 48 24, 128 24, 256 24 Z" fill="url(#squircle-glass)" stroke="url(#razor-rim)" stroke-width="3" />
  </g>
  <g opacity="0.8" style="mix-blend-mode: overlay;">
    <circle cx="170" cy="180" r="140" fill="url(#caustic-warm)" />
    <circle cx="340" cy="330" r="140" fill="url(#caustic-cool)" />
  </g>
  <g transform="rotate(-90 256 256)">
    <circle cx="256" cy="256" r="164" fill="none" stroke="#18181b" stroke-opacity="0.08" stroke-width="28" />
    <circle cx="256" cy="256" r="164" fill="none" stroke="url(#ring-calorie)" stroke-width="28" stroke-linecap="round" stroke-dasharray="1030" stroke-dashoffset="230" filter="url(#liquid-bead-glow)" />
    <circle cx="420" cy="256" r="6" fill="#ffffff" opacity="0.9" filter="url(#liquid-bead-glow)" />
    <circle cx="256" cy="256" r="124" fill="none" stroke="#18181b" stroke-opacity="0.08" stroke-width="24" />
    <circle cx="256" cy="256" r="124" fill="none" stroke="url(#ring-protein)" stroke-width="24" stroke-linecap="round" stroke-dasharray="779" stroke-dashoffset="210" filter="url(#liquid-bead-glow)" />
    <circle cx="380" cy="256" r="5" fill="#ffffff" opacity="0.85" filter="url(#liquid-bead-glow)" />
    <circle cx="256" cy="256" r="88" fill="none" stroke="#18181b" stroke-opacity="0.08" stroke-width="20" />
    <circle cx="256" cy="256" r="88" fill="none" stroke="url(#ring-water)" stroke-width="20" stroke-linecap="round" stroke-dasharray="553" stroke-dashoffset="75" filter="url(#liquid-bead-glow)" />
    <circle cx="344" cy="256" r="4.5" fill="#ffffff" opacity="0.85" filter="url(#liquid-bead-glow)" />
  </g>
  <g transform="translate(256, 256)">
    <ellipse cx="0" cy="18" rx="28" ry="10" fill="#000000" opacity="0.18" filter="url(#liquid-bead-glow)" />
    <path d="M 0 -36 C 18 -12, 38 10, 38 28 A 38 38 0 0 1 -38 28 C -38 10, -18 -12, 0 -36 Z" fill="url(#droplet-core)" stroke="#ffffff" stroke-width="2.5" stroke-opacity="0.9" />
    <ellipse cx="0" cy="30" rx="20" ry="12" fill="#ffffff" opacity="0.75" />
    <path d="M 0 -14 C 5 -5, 12 3, 12 12 A 12 12 0 0 1 -12 12 C -12 4, -4 -5, 0 -14 Z" fill="#18181b" opacity="0.85" />
    <ellipse cx="-10" cy="10" rx="6" ry="10" transform="rotate(-30 -10 10)" fill="#ffffff" opacity="0.9" />
  </g>
  <path d="M 28 52 C 52 28, 130 28, 256 28 C 382 28, 460 28, 484 52 C 500 68, 506 112, 508 176 C 370 216, 142 216, 4 176 C 6 112, 12 68, 28 52 Z" fill="url(#specular-lens)" pointer-events="none" />
  <line x1="140" y1="26" x2="372" y2="26" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.95" />
</svg>`;

  const ringsSvgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 380" width="380" height="380">
  <defs>
    <filter id="ring-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <linearGradient id="cal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff3b30" /><stop offset="50%" stop-color="#ff6a20" /><stop offset="100%" stop-color="#ff9500" />
    </linearGradient>
    <linearGradient id="pro-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#34c759" /><stop offset="60%" stop-color="#30d158" /><stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <linearGradient id="carb-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#007aff" /><stop offset="50%" stop-color="#0ea5e9" /><stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <radialGradient id="lens-plate" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" /><stop offset="45%" stop-color="#f4f4f5" stop-opacity="0.5" /><stop offset="100%" stop-color="#d4d4d8" stop-opacity="0.6" />
    </radialGradient>
  </defs>
  <circle cx="190" cy="190" r="180" fill="url(#lens-plate)" stroke="#ffffff" stroke-width="2" />
  <g transform="rotate(-90 190 190)">
    <circle cx="190" cy="190" r="142" fill="none" stroke="#18181b" stroke-opacity="0.08" stroke-width="22" />
    <circle cx="190" cy="190" r="142" fill="none" stroke="url(#cal-gradient)" stroke-width="22" stroke-linecap="round" stroke-dasharray="892" stroke-dashoffset="190" filter="url(#ring-glow)" />
    <circle cx="190" cy="190" r="108" fill="none" stroke="#18181b" stroke-opacity="0.08" stroke-width="19" />
    <circle cx="190" cy="190" r="108" fill="none" stroke="url(#pro-gradient)" stroke-width="19" stroke-linecap="round" stroke-dasharray="678" stroke-dashoffset="170" filter="url(#ring-glow)" />
    <circle cx="190" cy="190" r="76" fill="none" stroke="#18181b" stroke-opacity="0.08" stroke-width="17" />
    <circle cx="190" cy="190" r="76" fill="none" stroke="url(#carb-gradient)" stroke-width="17" stroke-linecap="round" stroke-dasharray="477" stroke-dashoffset="95" filter="url(#ring-glow)" />
  </g>
  <circle cx="190" cy="190" r="54" fill="#ffffff" fill-opacity="0.75" stroke="#ffffff" stroke-width="1.5" />
  <text x="190" y="178" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" fill="#71717a" text-anchor="middle">REMAINING</text>
  <text x="190" y="202" font-family="-apple-system, sans-serif" font-size="22" font-weight="800" fill="#18181b" text-anchor="middle">1,420</text>
  <text x="190" y="216" font-family="-apple-system, sans-serif" font-size="9" font-weight="700" fill="#a1a1aa" text-anchor="middle">KCAL</text>
</svg>`;

  const currentSvg = activeAsset === 'icon' ? iconSvgCode : ringsSvgCode;
  const fileName = activeAsset === 'icon' ? 'liquid-glass-icon.svg' : 'liquid-glass-macro-rings.svg';

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentSvg);
      hapticSuccess();
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleDownload = () => {
    hapticSuccess();
    const blob = new Blob([currentSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md max-h-[85vh] flex flex-col rounded-[32px] liquid-glass liquid-sheen border border-white/80 shadow-2xl overflow-hidden bg-white/85 text-neutral-900"
        >
          {/* Top razor specular line */}
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-20" />

          {/* Modal Header */}
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-neutral-200/60 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl liquid-glass-subtle border border-white/70 flex items-center justify-center shadow-sm text-neutral-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                  iOS Liquid Glass SVG
                </h3>
                <span className="text-[10px] font-semibold text-neutral-500">
                  Scalable Vector Graphic (Pure SVG)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                hapticMedium();
                onClose();
              }}
              className="w-8 h-8 rounded-full liquid-glass-subtle flex items-center justify-center text-neutral-700 hover:text-neutral-950 border border-white/70 active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto no-scrollbar space-y-4 flex-1">
            {/* Asset Selector Tabs */}
            <div className="flex gap-2 p-1 rounded-2xl liquid-glass-subtle border border-white/60">
              <button
                type="button"
                onClick={() => {
                  hapticSelection();
                  setActiveAsset('icon');
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeAsset === 'icon'
                    ? 'liquid-droplet-dark text-white shadow-md'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                App Icon Squircle (512x512)
              </button>
              <button
                type="button"
                onClick={() => {
                  hapticSelection();
                  setActiveAsset('rings');
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeAsset === 'rings'
                    ? 'liquid-droplet-dark text-white shadow-md'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Macro Rings Lens (380x380)
              </button>
            </div>

            {/* Backdrop preview switcher */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Preview Canvas
              </span>
              <div className="flex gap-1.5 items-center">
                <button
                  type="button"
                  onClick={() => setBackdrop('glass')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                    backdrop === 'glass'
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'liquid-glass text-neutral-600 border-white/60'
                  }`}
                >
                  Glass Wall
                </button>
                <button
                  type="button"
                  onClick={() => setBackdrop('dark')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                    backdrop === 'dark'
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'liquid-glass text-neutral-600 border-white/60'
                  }`}
                >
                  Obsidian
                </button>
                <button
                  type="button"
                  onClick={() => setBackdrop('light')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                    backdrop === 'light'
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'liquid-glass text-neutral-600 border-white/60'
                  }`}
                >
                  White
                </button>
              </div>
            </div>

            {/* SVG Visual Stage */}
            <div
              className={`relative rounded-3xl p-6 flex items-center justify-center overflow-hidden transition-colors duration-300 border border-white/70 shadow-inner ${
                backdrop === 'glass'
                  ? 'bg-gradient-to-br from-zinc-300 via-stone-200 to-neutral-400'
                  : backdrop === 'dark'
                  ? 'bg-neutral-950 text-white'
                  : 'bg-white'
              }`}
            >
              {backdrop === 'glass' && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-orange-300/40 blur-2xl" />
                  <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-sky-300/40 blur-2xl" />
                </div>
              )}

              <div className="relative z-10 w-52 h-52 flex items-center justify-center drop-shadow-xl transition-transform hover:scale-105 duration-300">
                {activeAsset === 'icon' ? (
                  <LiquidGlassEmblem size={208} />
                ) : (
                  <img
                    src="/liquid-glass-macro-rings.svg"
                    alt="Liquid Glass Macro Rings SVG"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>

            {/* Action Buttons: Copy Code & Download */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleCopyCode}
                className="py-2.5 px-3 rounded-2xl liquid-glass border border-white/80 font-bold text-xs text-neutral-800 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all hover:bg-white/90"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    <span className="text-emerald-700">Copied SVG!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-neutral-600" />
                    <span>Copy SVG Code</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="py-2.5 px-3 rounded-2xl liquid-droplet-dark text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all hover:brightness-110"
              >
                <Download className="w-4 h-4" />
                <span>Download .svg</span>
              </button>
            </div>

            {/* Code Toggle & Code Inspector */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  hapticSelection();
                  setShowCodePreview(!showCodePreview);
                }}
                className="w-full py-1.5 px-3 rounded-xl liquid-glass-subtle border border-white/50 text-[11px] font-bold text-neutral-600 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" />
                  {showCodePreview ? 'Hide Raw SVG Markup' : 'View Raw SVG XML'}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {showCodePreview ? '▲' : '▼'}
                </span>
              </button>

              {showCodePreview && (
                <pre className="p-3 rounded-2xl bg-neutral-950 text-neutral-300 font-mono text-[10px] leading-relaxed max-h-44 overflow-y-auto overflow-x-auto no-scrollbar border border-neutral-800 selection:bg-neutral-800">
                  {currentSvg}
                </pre>
              )}
            </div>

            {/* Design Craft Breakdown */}
            <div className="p-3 rounded-2xl liquid-glass-subtle border border-white/60 space-y-1.5 text-[11px] text-neutral-600">
              <span className="font-bold text-neutral-900 block flex items-center gap-1">
                <Layers className="w-3 h-3 text-neutral-700" />
                Liquid Glass SVG Architecture
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[10.5px] leading-relaxed text-neutral-600">
                <li><strong className="text-neutral-800">Continuous Squircle:</strong> Mathematically continuous iOS superellipse curve.</li>
                <li><strong className="text-neutral-800">Dual Razor Rim:</strong> Specular multi-stop linear gradient simulate surface tension.</li>
                <li><strong className="text-neutral-800">Caustic Light Refraction:</strong> Dual radial gradients mimic light traveling through dense curved glass.</li>
                <li><strong className="text-neutral-800">Concentric Macro Arcs:</strong> Animated liquid calorie, protein, and water tracks.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
