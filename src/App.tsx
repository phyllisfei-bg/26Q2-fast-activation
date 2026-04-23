import React, { useRef, useState, useEffect } from 'react';
import { Sidebar }            from './components/Sidebar';
import { Snackbar } from './components/Snackbar';
import type { SnackbarHandle } from './components/Snackbar';
import { Dashboard }          from './pages/Dashboard';
import { WalletDetailPage }   from './pages/WalletDetailPage';
import { WalletCreationFlow } from './flows/WalletCreationFlow';
import { KYBFlow }            from './flows/KYBFlow';
import { KYCFlow }            from './flows/KYCFlow';
import { useGetStarted }      from './hooks/useGetStarted';
import { useTheme }           from './hooks/useTheme';
import type { GsTask, WalletInfo } from './types';

type ActiveFlow = 'none' | 'wallet-creation' | 'go-account';
type TopPage = 'dashboard' | 'kyb' | 'kyc';

function getTopPage(): TopPage {
  const h = window.location.hash;
  if (h === '#kyb') return 'kyb';
  if (h === '#kyc') return 'kyc';
  return 'dashboard';
}

export default function App() {
  const { isLight, toggle } = useTheme();
  const [topPage, setTopPage] = useState<TopPage>(getTopPage);

  useEffect(() => {
    function onHash() { setTopPage(getTopPage()); }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const { done, markDone, allDone } = useGetStarted();

  const [flow, setFlow]             = React.useState<ActiveFlow>('none');
  const [walletOpen, setWalletOpen] = React.useState(false);
  const [wallet, setWallet]         = React.useState<WalletInfo | null>(null);

  const snackRef = useRef<SnackbarHandle>(null);

  // ── Get Started launch routing ───────────────────────────────────
  const handleGsLaunch = (task: GsTask) => {
    if (task === 'gsWallet') {
      setFlow('wallet-creation');
    } else if (task === 'gsDeposit') {
      const panel = document.querySelector('.right-panel') as HTMLElement | null;
      if (panel) {
        panel.classList.add('deposit-highlight');
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => panel.classList.remove('deposit-highlight'), 2200);
      }
      setTimeout(() => markDone('gsDeposit'), 600);
    } else if (task === 'gsGoAccount') {
      setFlow('go-account');
      setTimeout(() => { markDone('gsGoAccount'); setFlow('none'); }, 800);
    }
  };

  // ── Wallet created callback ───────────────────────────────────────
  const handleWalletCreated = (w: WalletInfo) => {
    setWallet(w);
    setFlow('none');
    setWalletOpen(true);
    markDone('gsWallet');
    setTimeout(() => snackRef.current?.show('Wallet created.', true), 300);
  };

  // ── Back to dashboard ─────────────────────────────────────────────
  const handleBackToDashboard = () => {
    setWalletOpen(false);
    snackRef.current?.dismiss();
  };

  if (topPage === 'kyb') return <KYBFlow />;
  if (topPage === 'kyc') return <KYCFlow />;

  return (
    <>
      <div className="app">
        <Sidebar activeItem="home" onNavigate={handleBackToDashboard} />
        <div className="workspace">
          <Dashboard
            isLight={isLight}
            onThemeToggle={toggle}
            doneTasks={done}
            allDone={allDone}
            onGsLaunch={handleGsLaunch}
            onOrderPlaced={(msg) => snackRef.current?.show(msg, false)}
          />
        </div>
      </div>

      <WalletCreationFlow
        open={flow === 'wallet-creation'}
        onClose={() => setFlow('none')}
        onCreated={handleWalletCreated}
      />

      <WalletDetailPage
        open={walletOpen}
        wallet={wallet}
        onBack={handleBackToDashboard}
      />

      <Snackbar ref={snackRef} onBackToDashboard={handleBackToDashboard} />
    </>
  );
}
