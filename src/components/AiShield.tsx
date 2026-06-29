import { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * BitGo AI shield — faithful port of the Figma Make "AI Icon Animation Final".
 * At rest: gradient shield outline + star. On hover: the shield wipes in with a
 * clockwise arc reveal (900ms), its gradient rotates (2.4s loop), and a dual-color
 * glow fades in. On leave the glow fades and it resets so the reveal replays.
 *
 * Exact paths/gradient/colors from the Make source.
 */

// Shield outline (left + right) and the centre star.
const PATH_SHIELD_L = "M11.2757 15.3579C20.4868 11.5456 30.4772 9.72901 40.2816 10.0327C41.7505 10.077 43.2157 10.1684 44.6729 10.3054C44.6774 11.172 44.6821 12.0386 44.6865 12.9051C43.2768 13.0568 41.8749 13.239 40.4817 13.4506C31.5166 14.8126 22.9157 17.4001 14.8675 21.0748C14.9071 23.3747 14.9293 25.6654 14.9303 27.9639C14.9347 37.5542 14.6008 47.1423 13.9557 56.7322C13.7221 59.4992 14.4352 62.476 15.7241 65.3196C16.2793 66.5514 16.9358 67.7635 17.6635 68.9503C16.9763 69.4775 16.2885 70.0044 15.6013 70.5316C14.5842 69.4418 13.6238 68.2777 12.754 67.0199C10.7519 64.1295 9.18493 60.6293 8.96301 56.7322C8.31688 47.1389 8.00442 37.5493 8.00004 27.9668C7.99891 25.3859 8.02033 22.815 8.06385 20.2295C8.05234 18.18 9.34663 16.1636 11.2757 15.3579Z";
const PATH_SHIELD_R = "M80.079 32.4736C80.2234 33.7032 80.361 34.9328 80.4909 36.1624C81.2154 43.019 81.7148 49.8763 81.9905 56.733C82.1607 61.9178 80.0374 66.6448 77.4086 70.4145C70.1965 80.3017 60.0552 86.1518 49.7466 90.6301C48.6007 91.1093 47.3985 91.589 46.2505 91.9996C45.8646 91.2238 45.4782 90.4475 45.0923 89.6717C46.0699 89.0233 47.1157 88.3173 48.104 87.6281C56.9994 81.3196 65.8586 74.5926 71.7227 66.452C73.8795 63.3603 75.4081 60.0438 75.5688 56.733C75.8444 49.8764 76.3438 43.019 77.0683 36.1624C77.1983 34.9328 77.3358 33.7032 77.4802 32.4736H80.079Z";
const PATH_STAR = "M43.9049 22.6738C44.1059 21.4731 45.7728 21.4505 46.067 22.5615L46.0905 22.6728C47.582 31.4833 49.1244 36.6857 52.0768 40.1465C54.8326 43.3765 58.877 45.1561 65.5261 46.836L66.8913 47.1719L66.9948 47.2012C67.9893 47.5325 67.9893 48.9676 66.9948 49.2989L66.8913 49.3282C59.4221 51.1123 55.0163 52.9083 52.0768 56.3536C49.1246 59.8141 47.5819 65.0151 46.0905 73.8244L46.0914 73.8254C45.8846 75.0657 44.1142 75.05 43.9049 73.8273C42.4149 65.0167 40.8731 59.8143 37.9205 56.3536C34.9809 52.9084 30.5758 51.1123 23.1079 49.3282C21.977 49.0557 21.9761 47.4444 23.107 47.1719C30.5748 45.3879 34.9803 43.5917 37.9195 40.1465C40.8717 36.6857 42.4133 31.4843 43.9049 22.6738Z";

/** Pie-slice path sweeping clockwise from startDeg for sweepDeg degrees. */
function sweepArc(cx: number, cy: number, r: number, startDeg: number, sweepDeg: number): string {
  if (sweepDeg <= 0) return '';
  if (sweepDeg >= 360) {
    return [`M ${cx} ${cy - r}`, `A ${r} ${r} 0 1 1 ${cx} ${cy + r}`, `A ${r} ${r} 0 1 1 ${cx} ${cy - r}`, 'Z'].join(' ');
  }
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const s = toRad(startDeg);
  const e = toRad(startDeg + sweepDeg);
  const x1 = cx + r * Math.cos(s);
  const y1 = cy + r * Math.sin(s);
  const x2 = cx + r * Math.cos(e);
  const y2 = cy + r * Math.sin(e);
  const large = sweepDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

type Phase = 'idle' | 'revealing' | 'hovering' | 'leaving';

interface AiShieldProps {
  size?: number;
  animated?: boolean;   // enable the hover reveal/glow/rotate (default true)
  className?: string;
}

export const AiShield: React.FC<AiShieldProps> = ({ size = 18, animated = true, className }) => {
  const uid = useId().replace(/[:]/g, '');
  const shieldGradId = `sg-${uid}`, starGradId = `stg-${uid}`, glowGradId = `gg-${uid}`;
  const filterId = `f-${uid}`, revealClipId = `rc-${uid}`;

  const [phase, setPhase] = useState<Phase>('idle');
  const [revealSweep, setRevealSweep] = useState(0);
  const [glowVisible, setGlowVisible] = useState(false);

  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>('idle');
  phaseRef.current = phase;

  const cancelRaf = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const startReveal = useCallback(() => {
    const REVEAL_MS = 900;
    let t0: number | null = null;
    setRevealSweep(0);
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const raw = Math.min((now - t0) / REVEAL_MS, 1);
      const eased = raw < 0.5 ? 4 * raw ** 3 : 1 - (-2 * raw + 2) ** 3 / 2;   // ease-in-out cubic
      setRevealSweep(eased * 360);
      if (raw < 1 && phaseRef.current === 'revealing') {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        if (phaseRef.current === 'revealing') setPhase('hovering');
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (phase === 'revealing') {
      startReveal();
      const t = setTimeout(() => setGlowVisible(true), 100);
      return () => { clearTimeout(t); cancelRaf(); };
    } else if (phase === 'hovering') {
      setGlowVisible(true);
    } else if (phase === 'leaving') {
      setGlowVisible(false);
      const t = setTimeout(() => { setRevealSweep(0); setPhase('idle'); }, 700);
      return () => clearTimeout(t);
    }
    return cancelRaf;
  }, [phase, startReveal, cancelRaf]);

  const onEnter = () => {
    if (!animated) return;
    if (phase === 'idle') setPhase('revealing');
    else if (phase === 'leaving') { cancelRaf(); setRevealSweep(360); setPhase('hovering'); }
  };
  const onLeave = () => {
    if (!animated) return;
    cancelRaf();
    if (phase === 'revealing') { setRevealSweep(0); setPhase('idle'); }
    else if (phase === 'hovering') setPhase('leaving');
  };

  const revealArcD = phase === 'idle' ? '' : sweepArc(45, 51, 80, 45, revealSweep);
  const clip = revealArcD ? `url(#${revealClipId})` : undefined;
  const isAnimating = phase === 'revealing' || phase === 'hovering';

  return (
    <div
      className={`ai-shield${className ? ` ${className}` : ''}`}
      style={{ position: 'relative', width: size, height: size * 102 / 90 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <svg className="ai-shield-svg" fill="none" viewBox="0 0 90 102" preserveAspectRatio="none" aria-hidden="true"
        style={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id={shieldGradId} x1="45" y1="0" x2="45" y2="102">
            <stop offset="0" stopColor="#94AEFF" /><stop offset="0.5" stopColor="#1647DB" /><stop offset="1" stopColor="#FF8B66" />
            {isAnimating && <animateTransform attributeName="gradientTransform" type="rotate" from="0 45 51" to="360 45 51" dur="2.4s" repeatCount="indefinite" />}
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id={starGradId} x1="45" y1="20" x2="45" y2="80">
            <stop offset="0" stopColor="#94AEFF" /><stop offset="0.5" stopColor="#1647DB" /><stop offset="1" stopColor="#FF8B66" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id={glowGradId} x1="45" y1="0" x2="45" y2="102">
            <stop offset="0" stopColor="#94AEFF" /><stop offset="0.5" stopColor="#1647DB" /><stop offset="1" stopColor="#FF8B66" />
            {isAnimating && <animateTransform attributeName="gradientTransform" type="rotate" from="0 45 51" to="360 45 51" dur="2.4s" repeatCount="indefinite" />}
          </linearGradient>
          <clipPath id={revealClipId}>{revealArcD ? <path d={revealArcD} /> : null}</clipPath>
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feFlood floodOpacity="0" result="bg" />
            <feColorMatrix in="SourceAlpha" result="a1" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0" />
            <feOffset dy="2" /><feGaussianBlur stdDeviation="4" /><feComposite in2="a1" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.546  0 0 0 0 0.4  0 0 0 0.8 0" />
            <feBlend in2="bg" mode="normal" result="s1" />
            <feColorMatrix in="SourceAlpha" result="a2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0" />
            <feOffset dy="-2" /><feGaussianBlur stdDeviation="4" /><feComposite in2="a2" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.086  0 0 0 0 0.28  0 0 0 0 0.86  0 0 0 0.8 0" />
            <feBlend in2="s1" mode="normal" result="s2" />
            <feBlend in="SourceGraphic" in2="s2" mode="normal" result="shape" />
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <g clipPath={clip}>
          <path d={PATH_SHIELD_L} fill={`url(#${shieldGradId})`} />
          <path d={PATH_SHIELD_R} fill={`url(#${shieldGradId})`} />
        </g>
        <path d={PATH_STAR} fill={`url(#${starGradId})`} />
        <g clipPath={clip} filter={`url(#${filterId})`}
          style={{ opacity: glowVisible ? 1 : 0, transition: 'opacity 600ms ease-in-out', pointerEvents: 'none' }}>
          <path d={PATH_SHIELD_L} fill={`url(#${glowGradId})`} />
          <path d={PATH_SHIELD_R} fill={`url(#${glowGradId})`} />
        </g>
      </svg>
    </div>
  );
};
