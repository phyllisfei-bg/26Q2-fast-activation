import { EditIcon, CopyIcon, TrashIcon, TaskIcon } from '../membersRoles/shared';
import type { MenuItem } from '../membersRoles/shared';
import { isCustomPolicy } from './policyData';
import type { SentencePolicy } from './policyData';

interface Handlers { onEdit: () => void; onCopy: () => void; onArchive: () => void; onViewTask: () => void }

/** Action menu for a policy — same items and order in the table row and the drawer.
 *  Pending-approval policies can only open their approval task. */
export const policyMenuItems = (policy: SentencePolicy, h: Handlers): MenuItem[] => {
  // A default policy with nothing the user may change is fully read-only: every action stays visible but disabled.
  if (policy.editableFields.length === 0 && !isCustomPolicy(policy)) {
    const tooltip = "This policy is set by BitGo and can't be modified.";
    return [
      { label: 'Edit', icon: <EditIcon />, disabled: true, tooltip, onClick: h.onEdit },
      { label: 'Copy to Other Enterprise', icon: <CopyIcon />, disabled: true, tooltip, onClick: h.onCopy },
      { label: 'Archive', icon: <TrashIcon />, disabled: true, tooltip, dividerBefore: true, onClick: h.onArchive },
    ];
  }
  return policy.policyState === 'Pending approval'
    ? [
        { label: 'View Task', icon: <TaskIcon />, onClick: h.onViewTask },
        { label: 'Edit', icon: <EditIcon />, disabled: true, onClick: h.onEdit },
        { label: 'Archive', icon: <TrashIcon />, disabled: true, dividerBefore: true, onClick: h.onArchive },
      ]
    : [
        { label: 'Edit', icon: <EditIcon />, onClick: h.onEdit },
        { label: 'Copy to Other Enterprise', icon: <CopyIcon />, onClick: h.onCopy },
        { label: 'Archive', icon: <TrashIcon />, dividerBefore: true, onClick: h.onArchive },
      ];
};
