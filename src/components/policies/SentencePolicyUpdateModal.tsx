import React, { useState } from 'react';
import type { SentencePolicy, EditablePolicyField } from './policyData';
import { PolicySentence } from './PolicySentence';
import { fieldLabel } from './PolicyStatusBadge';
import { CloseIcon } from '../membersRoles/shared';

interface Props {
  policy: SentencePolicy;
  field: EditablePolicyField;
  onClose: () => void;
  onSave: (policy: SentencePolicy) => void;
}

export const SentencePolicyUpdateModal: React.FC<Props> = ({ policy, field, onClose, onSave }) => {
  const isIpAllowlistCondition = policy.id === 'admin-approve-tx' && field === 'condition';
  const currentValue = isIpAllowlistCondition
    ? policy.policyAction
    : { scope: policy.scope, trigger: policy.trigger, condition: policy.condition, action: policy.policyAction }[field];
  const currentAmount = policy.conditionValue?.replace('$', '') ?? '';
  const [draft, setDraft] = useState(currentValue);
  const [amount, setAmount] = useState(currentAmount);
  const [approvalCount, setApprovalCount] = useState('1');
  const [approvalRole, setApprovalRole] = useState('Enterprise Admin');
  const label = fieldLabel(field);

  const nextValue = field === 'condition' && currentAmount
    ? policy.condition
    : field === 'action' && policy.id === 'tx-unverified'
      ? `${approvalCount} ${approvalRole.toLowerCase()}${approvalCount === '1' ? '' : 's'} to approve`
      : draft;
  const changes = { [isIpAllowlistCondition ? 'action' : field]: nextValue } as Partial<Record<EditablePolicyField, string>>;

  const save = () => {
    const updated = { ...policy, lastModified: 'Just now' };
    if (field === 'scope') updated.scope = nextValue;
    if (field === 'trigger') updated.trigger = nextValue;
    if (field === 'condition' && !isIpAllowlistCondition) updated.condition = nextValue;
    if (isIpAllowlistCondition) updated.policyAction = nextValue;
    if (field === 'condition' && currentAmount) updated.conditionValue = `$${amount}`;
    if (field === 'action') updated.policyAction = nextValue;
    onSave(updated);
  };

  return (
    <div className="wf-overlay open" onClick={onClose}>
      <div className="mr-rm-modal" style={{ height: 'auto', width: 560 }} onClick={e => e.stopPropagation()}>
        <div className="mr-rm-header">
          <span className="mr-rm-title">Update {label}</span>
          <button className="mr-rm-close" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="mr-rm-meta" style={{ paddingBottom: 18 }}>
          <div>
            <div className="mr-rm-meta-label">Policy</div>
            <div className="mr-rm-meta-value">{policy.name}</div>
          </div>
        </div>
        <div className="mr-rm-divider" />

        <div className="px-7 pt-5">
          <div className="rounded-xl bg-[var(--color-level2)] p-4 mb-6">
            <div className="mr-list-heading">Policy preview</div>
            <PolicySentence
              policy={policy}
              changes={changes}
              conditionValueChange={field === 'condition' && currentAmount ? `$${amount}` : undefined}
            />
          </div>

          <label className="kyc-form-label">{label}</label>
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
          ) : field === 'action' && policy.id === 'tx-video-id' ? (
            <>
              <select className="kyc-form-select" value={draft} onChange={e => setDraft(e.target.value)}>
                <option value="video verification with BitGo Support">Video verification</option>
                <option value="liveness verification with BitGo Support">Liveness verification</option>
              </select>
              <p className="text-[13px] text-[var(--color-text-muted)] mt-1.5">Choose whether the policy requires liveness or video verification.</p>
            </>
          ) : field === 'action' && policy.id === 'tx-unverified' ? (
            <div className="kyc-form-row" style={{ marginBottom: 0 }}>
              <div>
                <label className="kyc-form-label">Number of approvals</label>
                <input className="kyc-form-input" type="number" min="1" value={approvalCount} onChange={e => setApprovalCount(e.target.value)} />
              </div>
              <div>
                <label className="kyc-form-label">Approver role</label>
                <select className="kyc-form-select" value={approvalRole} onChange={e => setApprovalRole(e.target.value)}>
                  <option>Enterprise Admin</option>
                  <option>Wallet Admin</option>
                  <option>Organization Admin</option>
                  <option>Wallet User</option>
                </select>
              </div>
            </div>
          ) : (
            <input className="kyc-form-input" value={draft} onChange={e => setDraft(e.target.value)} />
          )}
        </div>

        <div className="mr-rm-footer" style={{ marginTop: 24 }}>
          <button className="mr-rm-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="mr-rm-btn-save" onClick={save}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};
