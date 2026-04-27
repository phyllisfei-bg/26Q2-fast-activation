import React, { useState } from 'react';
import { Topbar }     from '../components/Topbar';
import { Portfolio }  from '../components/Portfolio';
import { GetStarted } from '../components/GetStarted';
import { ForYou }     from '../components/ForYou';
import { Balances }   from '../components/Balances';
import { TradeCard }  from '../components/TradeCard';
import type { GsTask }     from '../types';

interface DashboardProps {
  isLight:         boolean;
  onThemeToggle:   () => void;
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
  doneTasks, allDone,
  onGsLaunch, onOrderPlaced,
  tradeHighlightVer = 0,
  goAccountFunded = false,
  onOpenDeposit,
  onTradeDone,
}) => {
  const [gsDismissed, setGsDismissed] = useState(false);

  return (
    <>
      <Topbar isLight={isLight} onThemeToggle={onThemeToggle} />

      <div className="content-area">
        <div className="main-panel">
          {/* Get Started — always shown until explicitly dismissed */}
          {!gsDismissed && (
            <GetStarted
              doneTasks={doneTasks}
              onLaunch={onGsLaunch}
              allDone={allDone}
              onDismiss={() => setGsDismissed(true)}
            />
          )}

          {/* Portfolio */}
          <Portfolio onOpenDeposit={onOpenDeposit} />

          {/* For You — shown after all Get Started tasks complete */}
          {allDone && <ForYou />}

          {/* Balances */}
          <Balances onDeposit={() => onOpenDeposit?.()} />
        </div>

        {/* Sticky trade card */}
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
