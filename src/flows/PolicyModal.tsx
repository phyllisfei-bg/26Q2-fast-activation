import React, { useState, useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onPublished: () => void;
}

type PolicyView = 'recommended' | 'manual';

const POLICY_PREVIEWS: Record<string, string> = {
  spending: 'Cap the maximum amount that can be spent in a single day or per transaction. Exceeding the limit triggers an alert or blocks the transaction.',
  approval: 'Require a configurable number of co-signers to approve transactions before they are broadcast. Great for high-value or sensitive operations.',
  allowlist: 'Restrict withdrawals to a pre-approved set of addresses. Any transaction to an unknown address is automatically blocked.',
  velocity: 'Flag or pause activity when transactions exceed a set frequency threshold within a rolling time window.',
};

interface PolicyCard {
  id: string;
  title: string;
  desc: string;
  insight: string;
  meta: { label: string; value: string; pill?: boolean }[];
}

const CARDS: PolicyCard[] = [
  {
    id: 'prc1',
    title: 'High-Value Transaction Approval',
    desc: 'Require Video ID for transactions over $100,000',
    insight: 'Recommended based on your enterprise\'s expected transaction patterns',
    meta: [
      { label: 'Trigger',   value: 'Transaction submission' },
      { label: 'Condition', value: 'Amount above $100,000' },
      { label: 'Scope',     value: 'All wallets', pill: true },
      { label: 'Action',    value: 'Require Video ID' },
    ],
  },
  {
    id: 'prc2',
    title: 'Multi-Signature for Cold Wallets',
    desc: 'Require 3 approvals from Wallet Admin for cold wallet transactions above 10% of wallet balance',
    insight: 'Best practice for securing high-value cold storage assets',
    meta: [
      { label: 'Trigger',   value: 'Withdrawal' },
      { label: 'Condition', value: 'Amount above 10% of wallet balance' },
      { label: 'Scope',     value: 'Cold Wallets', pill: true },
      { label: 'Action',    value: 'Require 3 approvals from Wallet Admin' },
    ],
  },
  {
    id: 'prc3',
    title: 'Weekend Transaction Freeze',
    desc: 'Block all transactions during weekends',
    insight: 'Reduces risk during low-supervision periods',
    meta: [
      { label: 'Trigger',   value: 'Any transaction' },
      { label: 'Condition', value: 'Weekend (Sat–Sun)' },
      { label: 'Scope',     value: 'All wallets', pill: true },
      { label: 'Action',    value: 'Block transaction' },
    ],
  },
];

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PolicyModal: React.FC<Props> = ({ open, onClose, onPublished }) => {
  const [view, setView]         = useState<PolicyView>('recommended');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [policyName, setPolicyName] = useState('');
  const [policyType, setPolicyType] = useState('spending');

  useEffect(() => {
    if (open) { setView('recommended'); setSelected(new Set()); setExpanded(new Set()); }
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handlePublish = () => {
    onPublished();
    setSelected(new Set());
    setExpanded(new Set());
  };

  const handleCreate = () => {
    onPublished();
    setPolicyName('');
    setPolicyType('spending');
  };

  const switchToManual = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    setTimeout(() => setView('manual'), 120);
  };

  if (!open) return null;

  return (
    <>
      {/* Recommended Policies */}
      {view === 'recommended' && (
        <div className="wf-overlay open" onClick={handleOverlayClick}>
          <div className="wf-modal" style={{ maxWidth: 520 }}>
            <div className="wf-modal-header">
              <div className="wf-modal-title">Recommended Policies</div>
              <button className="wf-modal-close" onClick={onClose}>✕</button>
            </div>
            <div className="wf-modal-body">
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
                Tailored to your enterprise profile and practices from similar organizations. Review or modify as needed, then choose which ones to publish.
              </p>

              {CARDS.map(card => {
                const isSelected = selected.has(card.id);
                const isExpanded = expanded.has(card.id);
                return (
                  <div
                    key={card.id}
                    className={`policy-rec-card${isSelected ? ' selected' : ''}`}
                    onClick={() => toggleSelect(card.id)}
                  >
                    {/* Checkbox column */}
                    <div className="policy-rec-checkbox-col">
                      <div className="policy-rec-checkbox"><CheckIcon /></div>
                    </div>

                    {/* Content column */}
                    <div className="policy-rec-content">
                      {/* Title row + chevron */}
                      <div className="policy-rec-card-header">
                        <div className="policy-rec-card-title-group">
                          <div className="policy-rec-card-title">{card.title}</div>
                          <div className="policy-rec-card-desc">{card.desc}</div>
                        </div>
                        <button
                          className="policy-rec-chevron-btn"
                          onClick={e => toggleExpand(e, card.id)}
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <svg
                            width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}
                          >
                            <path d="M6 9l6 6 6-6"/>
                          </svg>
                        </button>
                      </div>

                      {/* Insight — always visible */}
                      <div className="policy-rec-insight">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-400)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {card.insight}
                      </div>

                      {/* Expanded: metadata rows */}
                      {isExpanded && (
                        <div className="policy-rec-meta">
                          {card.meta.map(row => (
                            <div key={row.label} className="policy-rec-meta-row">
                              <span className="policy-rec-meta-label">{row.label}</span>
                              {row.pill
                                ? <span className="policy-rec-meta-pill">{row.value}</span>
                                : <span className="policy-rec-meta-value">{row.value}</span>
                              }
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Edit button — always visible, aligned right */}
                      <div className="policy-rec-edit-row">
                        <button
                          className="policy-rec-edit-btn"
                          onClick={e => e.stopPropagation()}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button className="policy-create-manually" onClick={switchToManual}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Create Manually
              </button>

              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                <button className="wf-btn-cancel" onClick={onClose}>Cancel</button>
                <button
                  className="wf-btn-primary"
                  disabled={selected.size === 0}
                  onClick={handlePublish}
                >Publish</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Policy Builder */}
      {view === 'manual' && open && (
        <div className="wf-overlay open" onClick={handleOverlayClick}>
          <div className="wf-modal">
            <div className="wf-modal-header">
              <div className="wf-modal-title">Create a Policy</div>
              <button className="wf-modal-close" onClick={onClose}>✕</button>
            </div>
            <div className="wf-modal-body">
              <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                Policies automatically enforce rules on wallet activity — like spending limits, required approvals, and allowed addresses.
              </p>
              <div className="wf-field">
                <label className="wf-label">Policy name</label>
                <input
                  className="wf-input"
                  type="text"
                  placeholder="e.g. Daily spending limit"
                  value={policyName}
                  onChange={e => setPolicyName(e.target.value)}
                />
              </div>
              <div className="wf-field">
                <label className="wf-label">Policy type</label>
                <select className="wf-select" value={policyType} onChange={e => setPolicyType(e.target.value)}>
                  <option value="spending">Spending Limit — cap daily or per-transaction spend</option>
                  <option value="approval">Approval Workflow — require N-of-M co-signers</option>
                  <option value="allowlist">Address Allowlist — restrict withdrawals to known addresses</option>
                  <option value="velocity">Velocity Limit — flag unusual transaction frequency</option>
                </select>
              </div>
              <div className="wf-field" style={{ background: 'var(--color-level2)', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {POLICY_PREVIEWS[policyType]}
              </div>
              <div className="wf-field">
                <label className="wf-label">Apply to</label>
                <select className="wf-select">
                  <option>This wallet only</option>
                  <option>All wallets in this organization</option>
                  <option>Enterprise-wide</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="wf-btn-cancel" onClick={onClose}>Cancel</button>
                <button className="wf-btn-primary" onClick={handleCreate}>Create Policy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
