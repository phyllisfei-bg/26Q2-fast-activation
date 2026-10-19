import React from 'react';
import { Badge } from '../membersRoles/shared';
import type { BadgeTone } from '../membersRoles/shared';
import type { SentencePolicy } from './policyData';

const TONE: Record<SentencePolicy['policyState'], BadgeTone> = {
  'Locked': 'neutral',
  'Unlocked · 47h left': 'brand',
  'Pending approval': 'warning',
  'Planned': 'invited',
  'Paused': 'danger',
};

export const PolicyStatusBadge: React.FC<{ policy: SentencePolicy }> = ({ policy }) => (
  <Badge tone={TONE[policy.policyState]}>{policy.policyState}</Badge>
);

export const fieldLabel = (f: string) => f.charAt(0).toUpperCase() + f.slice(1);
