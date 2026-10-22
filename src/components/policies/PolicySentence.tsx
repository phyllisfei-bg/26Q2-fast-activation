import React from 'react';
import { scopeFirst } from './policyData';
import type { SentencePolicy, EditablePolicyField } from './policyData';

interface Props {
  policy: SentencePolicy;
  changes?: Partial<Record<EditablePolicyField, string>>;
  conditionValueChange?: string;
  onRequirementClick?: () => void;
  /** Put the wallet scope before the condition (used in edit views). */
  scopeFirst?: boolean;
}

const OLD = 'line-through text-[var(--color-text-muted)]';
const NEW = 'text-[var(--brand-500)]';

/** A policy rendered as one plain-language sentence. The requirement is the
 *  emphasised part; pass `changes` to show a before → after diff. */
export const PolicySentence: React.FC<Props> = ({ policy, changes, conditionValueChange, onRequirementClick, scopeFirst: scopeFirstOrder }) => {
  const actionChange = changes?.action;
  const requirement = actionChange && actionChange !== policy.policyAction
    ? <><span className={OLD}>{policy.policyAction}</span> <span className={NEW}>{actionChange}</span></>
    : <span>{policy.policyAction}</span>;
  const threshold = policy.conditionValue && (
    conditionValueChange && conditionValueChange !== policy.conditionValue
      ? <><span className={OLD}>{policy.conditionValue}</span> <span className={NEW}>{conditionValueChange}</span></>
      : <span>{policy.conditionValue}</span>
  );
  const [before, after] = (scopeFirstOrder ? scopeFirst(policy.summary) : policy.summary).split('{conditionValue}');
  const requirementControl = onRequirementClick
    ? (
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onRequirementClick(); }}
        style={{ font: 'inherit' }}
        className="px-0.5 -mx-0.5 rounded border-none bg-transparent cursor-pointer text-inherit underline decoration-dotted underline-offset-4 decoration-[var(--color-text-muted)] hover:bg-[var(--brand-a100)] hover:decoration-[var(--brand-500)] transition-colors"
      >{requirement}</button>
    )
    : requirement;
  if (policy.description) {
    return <p className="text-[14px] leading-relaxed text-[var(--color-text-secondary)]">{policy.description}</p>;
  }
  return (
    <p className="text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
      {before}{policy.conditionValue && threshold}{after}
      {policy.sentenceMode === 'accepted' ? <> {requirementControl}</> : <> requires {requirementControl}</>}
      {policy.sentenceSuffix}
    </p>
  );
};
