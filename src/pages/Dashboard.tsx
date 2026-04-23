import React from 'react';
import { Topbar }     from '../components/Topbar';
import { Portfolio }  from '../components/Portfolio';
import { GetStarted } from '../components/GetStarted';
import { ForYou }     from '../components/ForYou';
import { Balances }   from '../components/Balances';
import { TradeCard }  from '../components/TradeCard';
import type { GsTask }     from '../types';

interface DashboardProps {
  isLight:       boolean;
  onThemeToggle: () => void;
  doneTasks:     GsTask[];
  allDone:       boolean;
  onGsLaunch:    (task: GsTask) => void;
  onOrderPlaced: (msg: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  isLight, onThemeToggle,
  doneTasks, allDone,
  onGsLaunch, onOrderPlaced,
}) => (
  <>
    <Topbar isLight={isLight} onThemeToggle={onThemeToggle} />

    <div className="content-area">
      <div className="main-panel">
        {/* Get Started (hidden once all done) */}
        {!allDone && (
          <GetStarted doneTasks={doneTasks} onLaunch={onGsLaunch} />
        )}

        {/* Portfolio */}
        <Portfolio />

        {/* For You (only shown after all Get Started tasks are complete) */}
        {allDone && <ForYou />}

        {/* Balances */}
        <Balances onDeposit={() => onGsLaunch('gsDeposit')} />
      </div>

      {/* Sticky trade card */}
      <TradeCard onOrderPlaced={onOrderPlaced} />
    </div>
  </>
);
