import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Comet-ring spin + glow — faithful port of the Figma Make
 * "AI Chip & Search Modal Animation". A rotating conic-gradient "comet" stroke
 * masked to a 1px border, plus a dual-color glow box-shadow that ramps in synced
 * to the comet's first revolution.
 *
 * Requires the global @property --rotation + @keyframes bitgo-comet-spin
 * (defined in globals.css).
 */

export const SPIN_MS = 850;
const GLOW_DELAY_MS = 10;

export const COMET = `conic-gradient(from var(--rotation, -45deg),
  #94AEFF 0deg, #94AEFF 3deg, #1647DB 20deg, #FF8B66 42deg,
  rgba(255,139,102,0.45) 62deg, rgba(22,71,219,0.22) 105deg,
  rgba(148,174,255,0.10) 160deg, rgba(148,174,255,0.04) 230deg,
  transparent 310deg, transparent 355deg, #94AEFF 360deg)`;

const RING_MASK: React.CSSProperties = {
  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
  WebkitMaskComposite: 'xor',
  maskComposite: 'exclude',
};

export const GLOW_SHADOW =
  '0px -3px 16px 0px rgba(255,139,102,0.78), 0px 3px 16px 0px rgba(22,71,219,0.78)';

export type SpinGlow = ReturnType<typeof useSpinGlow>;

export function useSpinGlow(opts?: { initialSpin?: boolean; initialRevs?: number }) {
  const [spinning, setSpinning] = useState(opts?.initialSpin ?? false);
  const [animKey, setAnimKey] = useState(opts?.initialSpin ? 1 : 0);
  const [glowAngle, setGlowAngle] = useState(0);
  const [isHoverSpin, setIsHoverSpin] = useState(false);
  const spinTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rafRef = useRef<number | undefined>(undefined);
  const startRef = useRef(0);

  const trigger = useCallback((withGlow: boolean, revolutions = 1) => {
    clearTimeout(spinTimer.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setSpinning(true);
    setIsHoverSpin(withGlow);
    setAnimKey((k) => k + 1);
    setGlowAngle(0);

    if (withGlow) {
      startRef.current = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startRef.current - GLOW_DELAY_MS;
        setGlowAngle(elapsed > 0 ? Math.min((elapsed / SPIN_MS) * 360, 360) : 0);
        if (now - startRef.current < SPIN_MS * revolutions)
          rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }

    spinTimer.current = setTimeout(() => {
      setSpinning(false);
      setGlowAngle(0);
    }, SPIN_MS * revolutions);
  }, []);

  useEffect(() => {
    if (opts?.initialSpin) {
      spinTimer.current = setTimeout(() => setSpinning(false), SPIN_MS * (opts.initialRevs ?? 1));
    }
    return () => {
      clearTimeout(spinTimer.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { spinning, animKey, glowAngle, isHoverSpin, trigger };
}

/**
 * Comet stroke + glow rendered absolutely over a position:relative parent.
 * `br` is the parent's border-radius (px). The ring sits at inset:-1 (just
 * outside the border-box).
 */
export const CometRing: React.FC<{
  spinning: boolean;
  animKey: number;
  glowAngle: number;
  isHoverSpin: boolean;
  br?: number;
  idleGlow?: boolean;   // steady soft glow while hovered + not spinning
}> = ({ spinning, animKey, glowAngle, isHoverSpin, br = 100, idleGlow = false }) => (
  <>
    {/* Comet stroke */}
    <div
      key={`comet-${animKey}`}
      style={{
        position: 'absolute', inset: -1, borderRadius: br + 1,
        background: COMET, padding: 1,
        ...RING_MASK,
        opacity: spinning ? 1 : 0,
        transition: 'opacity 260ms ease',
        animation: `bitgo-comet-spin ${SPIN_MS}ms linear infinite`,
        pointerEvents: 'none',
      }}
    />
    {/* Glow sweep — ramps in over the first revolution */}
    <div
      style={{
        position: 'absolute', inset: 0, borderRadius: br,
        boxShadow: GLOW_SHADOW,
        opacity: spinning && isHoverSpin ? glowAngle / 360 : idleGlow ? 1 : 0,
        transition: spinning && isHoverSpin ? 'none' : 'opacity 260ms ease',
        pointerEvents: 'none',
      }}
    />
  </>
);
