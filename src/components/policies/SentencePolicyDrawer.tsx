import React from 'react';
import type { SentencePolicy, EditablePolicyField } from './policyData';
import { PolicySentence } from './PolicySentence';
import { PolicyStatusBadge, PolicyLockIcon, fieldLabel } from './PolicyStatusBadge';
import { Menu, CloseIcon } from '../membersRoles/shared';

interface Props {
  policy: SentencePolicy | null;
  onClose: () => void;
  onUpdate: (policy: SentencePolicy, field: EditablePolicyField) => void;
}

export const SentencePolicyDrawer: React.FC<Props> = ({ policy, onClose, onUpdate }) => {
  const open = !!policy;
  const rows: [string, string][] = policy ? [
    ['Actor', policy.actor],
    ['Scope', policy.scope],
    ['Trigger', policy.trigger],
    ['Condition', `${policy.condition}${policy.conditionValue ? ` ${policy.conditionValue}` : ''}`],
    ['Action', policy.policyAction],
    ['Set by', policy.setBy],
    ['Last triggered', policy.lastUsed ?? '—'],
    ['Last modified', policy.lastModified],
  ] : [];

  return (
    <div className={`dep-drawer-overlay${open ? ' open' : ''}`} onClick={onClose}>
      <div className="dep-drawer mr-drawer" onClick={e => e.stopPropagation()}>
        {policy && (
          <>
            <div className="mr-drawer-top">
              <span className="mr-drawer-eyebrow">{policy.kind === 'transactions' ? 'Transaction Policy' : 'Administrative Policy'}</span>
              <button className="dep-drawer-close" onClick={onClose}><CloseIcon /></button>
            </div>
            <div className="mr-drawer-identity">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span className="text-[20px] font-normal text-[var(--color-text)]">{policy.name}</span>
                <PolicyLockIcon policy={policy} />
                <PolicyStatusBadge policy={policy} />
              </div>
              {policy.editableFields.length > 0 && (
                <Menu
                  variant="actions"
                  items={policy.editableFields.map(f => ({ label: `Update ${fieldLabel(f)}`, onClick: () => onUpdate(policy, f) }))}
                />
              )}
            </div>

            <div className="dep-drawer-body">
              <div className="rounded-xl bg-[var(--color-level2)] p-4 mb-6">
                <PolicySentence policy={policy} />
              </div>
              {policy.organizationNote && (
                <p className="text-[14px] text-[var(--color-text-secondary)] mb-6">{policy.organizationNote}</p>
              )}
              <div className="mr-list-heading">Policy structure</div>
              <div className="mr-summary">
                {rows.map(([label, value]) => (
                  <div key={label} className="mr-summary-row">
                    <span className="mr-summary-label">{label}</span>
                    <div className="mr-summary-col2"><span className="mr-summary-value">{value}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
