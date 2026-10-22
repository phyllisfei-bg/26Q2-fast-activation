import React, { useState } from 'react';
import type { SentencePolicy, EditablePolicyField } from './policyData';
import { PolicySentence } from './PolicySentence';
import { fieldLabel } from './PolicyStatusBadge';
import { CloseIcon, Badge } from '../membersRoles/shared';

interface Props {
  policy: SentencePolicy;
  field: EditablePolicyField;
  onClose: () => void;
  onSave: (policy: SentencePolicy) => void;
}

export const SentencePolicyUpdateModal: React.FC<Props> = ({ policy, field, onClose, onSave }) => {
  const currentValue = { scope: policy.scope, trigger: policy.trigger, condition: policy.condition, action: policy.policyAction }[field];
  const currentAmount = policy.conditionValue?.replace('$', '') ?? '';
  const [draft, setDraft] = useState(currentValue);
  const [amount, setAmount] = useState(currentAmount);
  const [approvalCount, setApprovalCount] = useState('1');
  // Approval-count actions: pick the approver role first, then how many approvals. Whitelist changes are always wallet admins.
  const lockedRole = policy.id === 'admin-whitelist' ? 'Wallet Admin' : null;
  const approvalEditor = field === 'action' && (policy.id === 'tx-unverified' || policy.id === 'admin-whitelist');
  const [approvalRole, setApprovalRole] = useState(lockedRole ?? 'Enterprise Admin');
  const label = fieldLabel(field);
  // Any action that is a video / liveness verification becomes a video vs liveness dropdown.
  const verification = (() => {
    const m = policy.policyAction.match(/^(a )?(video|liveness) verification(.*)$/);
    return m ? { article: m[1] ?? '', rest: m[3] } : null;
  })();

  const nextValue = field === 'condition' && currentAmount
    ? policy.condition
    : approvalEditor
      ? (lockedRole
          ? (approvalCount === '1' ? 'another wallet admin to approve' : `${approvalCount} other wallet admins to approve`)
          : `${approvalCount} ${approvalRole.toLowerCase()}${approvalCount === '1' ? '' : 's'} to approve`)
      : draft;
  const changes = { [field]: nextValue } as Partial<Record<EditablePolicyField, string>>;

  const save = () => {
    const updated = { ...policy, lastModified: 'Just now' };
    if (field === 'scope') updated.scope = nextValue;
    if (field === 'trigger') updated.trigger = nextValue;
    if (field === 'condition') updated.condition = nextValue;
    if (field === 'condition' && currentAmount) updated.conditionValue = `$${amount}`;
    if (field === 'action') updated.policyAction = nextValue;
    onSave(updated);
  };

  return (
    <div className="wf-overlay open" style={{ zIndex: 900 }} onClick={onClose}>
      <div className="mr-rm-modal" style={{ width: 640, height: 'auto', maxHeight: 'calc(100vh - 96px)' }} onClick={e => e.stopPropagation()}>
        <div className="mr-rm-header">
          <div className="dep-drawer-breadcrumb">
            <span className="dep-breadcrumb-current" style={{ fontWeight: 400, fontSize: 24 }}>Edit {label}</span>
          </div>
          <button className="mr-rm-close" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="px-7 pt-5">
          <div className="rounded-xl bg-[var(--color-level2)] px-4 py-3">
            <div className="mb-1.5"><Badge tone="neutral">Preview</Badge></div>
            <PolicySentence
              scopeFirst
              policy={policy}
              changes={changes}
              conditionValueChange={field === 'condition' && currentAmount ? `$${amount}` : undefined}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-6 text-left">
          <p className="text-[14px] text-[var(--color-text-secondary)] mb-5">Change the {label.toLowerCase()} of {policy.name}.</p>
          <label className="kyc-form-label">{approvalEditor ? 'Approver role' : label} <span className="text-[var(--color-danger)]">*</span></label>
          {field === 'condition' && currentAmount ? (
            <>
              <input
                className="kyc-form-input"
                inputMode="numeric"
                aria-label="Trigger amount"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^\d,]/g, ''))}
              />
              <p className="text-[13px] text-[var(--color-text-muted)] mt-1.5">Change the amount that triggers this policy.</p>
            </>
          ) : field === 'action' && verification ? (
            <>
              <select className="kyc-form-select" value={draft} onChange={e => setDraft(e.target.value)}>
                <option value={`${verification.article}video verification${verification.rest}`}>Video verification with BitGo Support</option>
                <option value={`${verification.article}liveness verification${verification.rest}`}>Liveness verification</option>
              </select>
              <p className="text-[13px] text-[var(--color-text-muted)] mt-1.5">Choose whether the policy requires video verification with BitGo Support or liveness verification.</p>
            </>
          ) : approvalEditor ? (
            <>
              <select className="kyc-form-select" value={approvalRole} disabled={!!lockedRole} onChange={e => setApprovalRole(e.target.value)} style={lockedRole ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}>
                <option>Enterprise Admin</option>
                <option>Wallet Admin</option>
                <option>Organization Admin</option>
                <option>Wallet User</option>
              </select>
              <p className="text-[13px] text-[var(--color-text-muted)] mt-1.5">{lockedRole ? 'Whitelist changes are always approved by wallet admins, so the role can’t be changed.' : 'Choose who can approve.'}</p>
              <label className="kyc-form-label" style={{ marginTop: 16 }}>Approvals required</label>
              <input className="kyc-form-input" type="number" min="1" placeholder="Minimum required number of approvers" value={approvalCount} onChange={e => setApprovalCount(String(Math.max(1, Number(e.target.value) || 1)))} />
            </>
          ) : (
            <input className="kyc-form-input" value={draft} onChange={e => setDraft(e.target.value)} />
          )}
        </div>

        <div className="mr-rm-footer" style={{ marginTop: 0 }}>
          <button className="mr-rm-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="mr-rm-btn-save" onClick={save}>Confirm</button>
        </div>
      </div>
    </div>
  );
};
