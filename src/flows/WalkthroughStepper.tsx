import React, { useState } from 'react';
import type { WalkthroughKey } from '../types';
import { WALKTHROUGHS } from '../types';

interface Props {
  goalKey: WalkthroughKey | null;
  onDismiss: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
  lock:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-400)" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  chart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-400)" strokeWidth="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  dollar:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-400)" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
};

export const WalkthroughStepper: React.FC<Props> = ({ goalKey, onDismiss }) => {
  const [stepIdx, setStepIdx] = useState(0);

  if (!goalKey) return null;
  const goal  = WALKTHROUGHS[goalKey];
  const steps = goal.steps;
  const step  = steps[stepIdx];

  return (
    <div className="stepper-card">
      <div className="stepper-header">
        <div className="stepper-goal-icon">{ICONS[goal.icon]}</div>
        <span className="stepper-goal-label">{goal.label}</span>
        <span className="stepper-goal-counter">{stepIdx + 1}/{steps.length}</span>
        <button className="stepper-dismiss-btn" onClick={onDismiss} title="Dismiss">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="stepper-body">
        <div className="stepper-progress">
          <div className="stepper-dots">
            {steps.map((_, i) => (
              <div key={i} className={`stepper-dot${i === stepIdx ? ' active' : ''}`} />
            ))}
          </div>
          <span className="stepper-step-label">Step {stepIdx + 1}</span>
        </div>
        <div className="stepper-step-title">{step.title}</div>
        <div className="stepper-step-body">{step.body}</div>
        <button className="stepper-cta">
          {step.cta}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      <div className="stepper-footer">
        <button
          className="stepper-nav-btn"
          disabled={stepIdx === 0}
          onClick={() => setStepIdx(i => i - 1)}
        >← Prev</button>
        <button
          className="stepper-nav-btn"
          disabled={stepIdx === steps.length - 1}
          onClick={() => setStepIdx(i => i + 1)}
        >Next →</button>
        <div className="stepper-footer-spacer" />
        <button className="stepper-skip-btn" onClick={onDismiss}>Skip this walkthrough</button>
      </div>
    </div>
  );
};
