import React from 'react';
import { Badge } from '../membersRoles/shared';
import type { BadgeTone } from '../membersRoles/shared';
import type { SentencePolicy } from './policyData';

const TONE: Partial<Record<SentencePolicy['policyState'], BadgeTone>> = {
  'Pending approval': 'warning',
  'Planned': 'invited',
  'Paused': 'danger',
};

/** Badge for non-lock states only — lock state is shown by PolicyLockIcon. */
export const PolicyStatusBadge: React.FC<{ policy: SentencePolicy }> = ({ policy }) => {
  const tone = TONE[policy.policyState];
  return tone ? <Badge tone={tone}>{policy.policyState}</Badge> : null;
};

const svgProps = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Inline unlock glyph next to the policy name — shown only while a policy is unlocked. */
export const PolicyLockIcon: React.FC<{ policy: SentencePolicy }> = ({ policy }) => {
  if (!policy.policyState.startsWith('Unlocked')) return null;
  return (
    <span
      className="inline-flex shrink-0 text-[var(--color-text-muted)]"
      title={policy.policyState}
      aria-label={policy.policyState}
    >
      <svg {...svgProps}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.5-2" /></svg>
    </span>
  );
};

export const fieldLabel = (f: string) => f.charAt(0).toUpperCase() + f.slice(1);
