import React, { useState, useEffect, useRef } from 'react';
import type { Role } from '../../types';
import type { MembersRolesApi } from '../../hooks/useMembersRoles';
import { CloseIcon, Chip, Avatar, Badge } from './shared';
import { SearchField } from '../SearchField';

/* ── Small icons (same as the Manage Roles modal) ── */
const RemoveXIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const UndoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v6h6" /><path d="M3.5 9a9 9 0 1 1-1.4 5" />
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface Props {
  role: Role | null;
  api: MembersRolesApi;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

export const ManageMembersModal: React.FC<Props> = ({ role, api, onClose, onSaved }) => {
  const [stagedRemovals, setStagedRemovals] = useState<string[]>([]);
  const [stagedAdditions, setStagedAdditions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);   // chosen in search, before "Assign"
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStagedRemovals([]); setStagedAdditions([]); setSelected([]); setQuery(''); setFocused(false);
  }, [role?.id]);

  useEffect(() => {
    if (!focused) return;
    const onDoc = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [focused]);

  if (!role) return null;

  const initial = api.membersForRole(role.id).map(m => m.id);
  const byId = (id: string) => api.members.find(m => m.id === id);

  const assignedIds = [...stagedAdditions, ...initial];   // newly added appear at the top
  const assignedCount = assignedIds.filter(id => !stagedRemovals.includes(id)).length;

  const available = api.members.filter(m => !initial.includes(m.id) && !stagedAdditions.includes(m.id));
  const q = query.trim().toLowerCase();
  const availableFiltered = available.filter(m =>
    !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));

  const hasChanges = stagedRemovals.length > 0 || stagedAdditions.length > 0;

  const removeAssigned = (id: string) => {
    if (stagedAdditions.includes(id)) setStagedAdditions(p => p.filter(x => x !== id));
    else setStagedRemovals(p => [...p, id]);
  };
  const restoreAssigned = (id: string) => setStagedRemovals(p => p.filter(x => x !== id));
  const toggleSelect = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const assign = () => {
    if (selected.length === 0) return;
    setStagedAdditions(p => [...p, ...selected]);
    setSelected([]); setQuery(''); setFocused(false);
  };

  const save = () => {
    const newIds = assignedIds.filter(id => !stagedRemovals.includes(id));
    api.setRoleMembers(role.id, newIds);
    onSaved(`Members updated for ${role.name}.`);
    onClose();
  };

  const MemberMain: React.FC<{ id: string; added?: boolean }> = ({ id, added }) => {
    const m = byId(id);
    if (!m) return null;
    return (
      <div className="mr-rm-member-main">
        <Avatar name={m.name} color={m.avatarColor} size={36} />
        <div className="min-w-0">
          <div className="mr-rm-member-name">{m.name}{added && <Badge tone="brand">Added</Badge>}</div>
          <div className="mr-rm-member-email">{m.email}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="wf-overlay open" onClick={onClose}>
      <div className="mr-rm-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="mr-rm-header">
          <span className="mr-rm-title">Manage Members Assigned</span>
          <button className="mr-rm-close" onClick={onClose}><CloseIcon /></button>
        </div>

        {/* Role meta */}
        <div className="mr-rm-meta">
          <div>
            <div className="mr-rm-meta-label">Role Name</div>
            <div className="mr-rm-meta-value">{role.name}</div>
          </div>
          <div>
            <div className="mr-rm-meta-label">Role Type</div>
            <div className="mr-rm-meta-value">{role.kind}</div>
          </div>
        </div>
        <div className="mr-rm-divider" />

        {/* Search + Assign */}
        <div className="mr-rm-search-row">
          <SearchField
            wrapRef={searchWrapRef}
            value={query}
            onChange={setQuery}
            onFocus={() => setFocused(true)}
            placeholder={selected.length ? '' : 'Search members in your organization'}
            chips={selected.map(id => {
              const m = byId(id);
              return m ? <Chip key={id} label={m.name} onDelete={() => toggleSelect(id)} /> : null;
            })}
            popover={focused && (
              <div className="mr-rm-dropdown" onMouseDown={e => e.preventDefault()}>
                <div className="mr-rm-section-head">
                  Available to Assign <span className="mr-rm-count">{availableFiltered.length}</span>
                </div>
                {availableFiltered.length === 0 && (
                  <div className="mr-rm-empty">No matching members.</div>
                )}
                {availableFiltered.map(m => {
                  const isSel = selected.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`mr-rm-role${isSel ? ' selected' : ''}`}
                      onClick={() => toggleSelect(m.id)}
                    >
                      <MemberMain id={m.id} />
                      {isSel ? (
                        <span className="mr-rm-check"><CheckIcon /></span>
                      ) : (
                        <div className="mr-rm-role-actions">
                          <button className="mr-rm-icon-btn" title="Add" onClick={e => { e.stopPropagation(); toggleSelect(m.id); }}><PlusIcon /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          />
          <button className="mr-rm-assign" disabled={selected.length === 0} onClick={assign}>Assign</button>
        </div>

        {/* Assigned list */}
        <div className="mr-rm-section-head mr-rm-section-head--list">
          Assigned <span className="mr-rm-count">{assignedCount}</span>
        </div>
        <div className="mr-rm-list">
          {assignedIds.map(id => {
            const m = byId(id);
            if (!m) return null;
            const removed = stagedRemovals.includes(id);
            const added = stagedAdditions.includes(id);
            return (
              <div key={id} className={`mr-rm-role${removed ? ' removed' : ''}${added ? ' added' : ''}`}>
                <MemberMain id={id} added={added && !removed} />
                {removed ? (
                  <button className="mr-rm-icon-btn always" title="Undo" onClick={() => restoreAssigned(id)}><UndoIcon /></button>
                ) : (
                  <div className="mr-rm-role-actions">
                    <button className="mr-rm-icon-btn" title="Remove" onClick={() => removeAssigned(id)}><RemoveXIcon /></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mr-rm-footer">
          <button className="mr-rm-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="mr-rm-btn-save" disabled={!hasChanges} onClick={save}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};
