import React, { useState } from 'react';
import { Topbar }     from '../components/Topbar';
import { Portfolio }  from '../components/Portfolio';
import { GetStarted } from '../components/GetStarted';
import { ForYou }     from '../components/ForYou';
import { Balances }   from '../components/Balances';
import { TradeCard }  from '../components/TradeCard';
import type { GsTask, UserRole } from '../types';

interface DashboardProps {
  isLight:         boolean;
  onThemeToggle:   () => void;
  role:            UserRole;
  tasks:           GsTask[];
  doneTasks:       GsTask[];
  allDone:         boolean;
  onGsLaunch:      (task: GsTask) => void;
  onOrderPlaced:   (msg: string) => void;
  tradeHighlightVer?: number;
  goAccountFunded?:   boolean;
  onOpenDeposit?:     (tab?: 'cash' | 'crypto') => void;
  onTradeDone?:       () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  isLight, onThemeToggle,
  role, tasks,
  doneTasks, allDone,
  onGsLaunch, onOrderPlaced,
  tradeHighlightVer = 0,
  goAccountFunded = false,
  onOpenDeposit,
  onTradeDone,
}) => {
  const [gsDismissed, setGsDismissed] = useState(false);

  // Reset dismissed state when role changes so the card re-appears
  const prevRoleRef = React.useRef(role);
  React.useEffect(() => {
    if (prevRoleRef.current !== role) {
      setGsDismissed(false);
      prevRoleRef.current = role;
    }
  }, [role]);

  return (
    <>
      <Topbar isLight={isLight} onThemeToggle={onThemeToggle} />

      <div className="content-area">
        <div className="main-panel">
          {!gsDismissed && (
            <GetStarted
              tasks={tasks}
              role={role}
              doneTasks={doneTasks}
              onLaunch={onGsLaunch}
              allDone={allDone}
              onDismiss={() => setGsDismissed(true)}
            />
          )}

          <Portfolio onOpenDeposit={onOpenDeposit} />

          <ForYou allDone={allDone} />

          <Balances onDeposit={() => onOpenDeposit?.()} />
        </div>

        <TradeCard
          highlightVer={tradeHighlightVer}
          funded={goAccountFunded}
          onOpenDeposit={onOpenDeposit}
          onOrderPlaced={onOrderPlaced}
          onTradeDone={onTradeDone}
        />
      </div>
    </>
  );
};
