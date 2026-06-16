import React from 'react';

/** The single search-input component used across every workflow.
 *  Do not create other search-bar variants — extend this one. */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  className?: string;
  chips?: React.ReactNode;     // tokens rendered before the input (e.g. selected items)
  popover?: React.ReactNode;   // absolutely-positioned dropdown rendered below
  wrapRef?: React.Ref<HTMLDivElement>;
  inputRef?: React.Ref<HTMLInputElement>;
}

export const SearchField: React.FC<Props> = ({
  value, onChange, placeholder, onFocus, className, chips, popover, wrapRef, inputRef,
}) => (
  <div ref={wrapRef} className={`search-field${className ? ' ' + className : ''}`}>
    <span className="search-field-icon"><SearchIcon /></span>
    {chips}
    <input
      ref={inputRef}
      className="search-field-input"
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={onFocus}
    />
    {popover}
  </div>
);
