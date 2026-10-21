import React, { useState, useEffect } from 'react';
import type { SentencePolicy, EditablePolicyField } from './policyData';
import { PolicySentence } from './PolicySentence';
import { PolicyStatusBadge, PolicyLockIcon, fieldLabel } from './PolicyStatusBadge';
import { Menu, Badge, CloseIcon } from '../membersRoles/shared';

type Tab = 'Overview' | 'Activity Log';

interface Props {
  policy: SentencePolicy | null;
  onClose: () => void;
  onUpdate: (policy: SentencePolicy, field: EditablePolicyField) => void;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Deterministic short id, e.g. "4821…0937". */
const shortId = (id: string) => {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const a = String(h % 10000).padStart(4, '0');
  const b = String((h >>> 7) % 10000).padStart(4, '0');
  return `${a}…${b}`;
};

const relativeDays = (dateStr: string) => {
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return '';
  const days = Math.max(0, Math.floor((Date.now() - t) / 86400000));
  return days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`;
};

const Row: React.FC<{ label: string; noDivider?: boolean; children: React.ReactNode }> = ({ label, noDivider, children }) => (
  <div className="mr-summary-row" style={noDivider ? { borderBottom: 'none' } : undefined}>
    <span className="mr-summary-label">{label}</span>
    <div className="mr-summary-col2"><span className="mr-summary-value">{children}</span></div>
  </div>
);

const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="block text-[13px] text-[var(--color-text-secondary)] mt-0.5">{children}</span>
);

export const SentencePolicyDrawer: React.FC<Props> = ({ policy, onClose, onUpdate }) => {
  const [tab, setTab] = useState<Tab>('Overview');
  useEffect(() => { if (policy) setTab('Overview'); }, [policy?.id]);

  const open = !!policy;
  const unlocked = !!policy?.policyState.startsWith('Unlocked');

  return (
    <div className={`dep-drawer-overlay${open ? ' open' : ''}`} onClick={onClose}>
      <div className="dep-drawer mr-drawer" onClick={e => e.stopPropagation()}>
        {policy && (
          <>
            <div className="mr-drawer-top">
              <span className="mr-drawer-eyebrow">Policy Detail</span>
              <button className="dep-drawer-close" onClick={onClose}><CloseIcon /></button>
            </div>

            <div className="mr-drawer-identity">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[20px] font-normal text-[var(--color-text)]">{policy.name}</span>
                  <PolicyLockIcon policy={policy} />
                  <PolicyStatusBadge policy={policy} />
                </div>
                <div className="mt-1"><PolicySentence policy={policy} /></div>
              </div>
              {policy.editableFields.length > 0 && (
                <Menu
                  variant="actions"
                  items={policy.editableFields.map(f => ({ label: `Update ${fieldLabel(f)}`, onClick: () => onUpdate(policy, f) }))}
                />
              )}
            </div>

            <div className="mr-drawer-tabs">
              {(['Overview', 'Activity Log'] as Tab[]).map(t => (
                <div key={t} className={`mr-drawer-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</div>
              ))}
            </div>

            <div className="dep-drawer-body">
              {tab === 'Overview' && (
                <div className="mr-summary">
                  <Row label="Policy Lock">
                    <Badge tone="neutral">{unlocked ? 'Unlocked' : 'Locked'}</Badge>
                    <Sub>{unlocked ? 'Editing or archiving enabled' : 'Unlock to edit or archive'}</Sub>
                  </Row>
                  <Row label="Trigger" noDivider>{cap(policy.trigger)}</Row>
                  <Row label="Condition" noDivider>
                    <span className="block">When all following conditions are met:</span>
                    <ul className="list-disc pl-5 mt-0.5">
                      <li>{cap(policy.condition)}{policy.conditionValue ? ` ${policy.conditionValue}` : ''}</li>
                    </ul>
                  </Row>
                  <Row label="Scope" noDivider>{cap(policy.scope)}</Row>
                  <Row label="Action">
                    {policy.sentenceMode === 'accepted' ? cap(policy.policyAction) : `Require ${policy.policyAction}`}
                  </Row>
                  <Row label="Last Triggered">
                    {policy.lastUsed ? (<>{relativeDays(policy.lastUsed)}<Sub>{policy.lastUsed}</Sub></>) : 'Never'}
                  </Row>
                  <Row label="ID"><span className="font-mono">{shortId(policy.id)}</span></Row>
                </div>
              )}

              {tab === 'Activity Log' && (
                <div className="mr-summary">
                  <Row label="Modified">{policy.lastModified}<Sub>By {policy.setBy}</Sub></Row>
                  {policy.lastUsed && <Row label="Triggered">{policy.lastUsed}</Row>}
                  {policy.policyState === 'Pending approval' && <Row label="Submitted">Awaiting approval</Row>}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
