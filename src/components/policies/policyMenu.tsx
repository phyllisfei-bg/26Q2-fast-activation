import { EditIcon, CopyIcon, TrashIcon, TaskIcon } from '../membersRoles/shared';
import type { MenuItem } from '../membersRoles/shared';
import type { SentencePolicy } from './policyData';

interface Handlers { onEdit: () => void; onCopy: () => void; onArchive: () => void; onViewTask: () => void }

/** Action menu for a policy — same items and order in the table row and the drawer.
 *  Pending-approval policies can only open their approval task. */
export const policyMenuItems = (policy: SentencePolicy, h: Handlers): MenuItem[] =>
  policy.policyState === 'Pending approval'
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
