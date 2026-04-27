import React, { useRef, useState, useEffect } from 'react';
import { Sidebar }            from './components/Sidebar';
import { Snackbar } from './components/Snackbar';
import type { SnackbarHandle } from './components/Snackbar';
import { Dashboard }          from './pages/Dashboard';
import { WalletDetailPage }   from './pages/WalletDetailPage';
import { DestinationsPage }   from './pages/DestinationsPage';
import { WalletCreationFlow } from './flows/WalletCreationFlow';
import { DepositModal }       from './flows/DepositModal';
import { PolicyModal }        from './flows/PolicyModal';
import { KYBFlow }            from './flows/KYBFlow';
import { KYCFlow }            from './flows/KYCFlow';
import { useGetStarted }      from './hooks/useGetStarted';
import { useTheme }           from './hooks/useTheme';
import type { GsTask, WalletInfo } from './types';

type ActiveFlow = 'none' | 'wallet-creation';
type TopPage = 'dashboard' | 'kyb' | 'kyc' | 'destinations';
type SecuritySubPage = 'policies' | 'destinations' | 'activity-log' | 'roles';

function getTopPage(): TopPage {
  const h = window.location.hash;
  if (h === '#kyb') return 'kyb';
  if (h === '#kyc') return 'kyc';
  if (h === '#destinations') return 'destinations';
  return 'dashboard';
}

export default function App() {
  const { isLight, toggle } = useTheme();
  const [topPage, setTopPage] = useState<TopPage>(getTopPage);

  const navigateTo = (page: TopPage) => {
    window.location.hash = page === 'dashboard' ? '' : page;
    setTopPage(page);
  };

  useEffect(() => {
    function onHash() { setTopPage(getTopPage()); }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const { done, markDone, allDone } = useGetStarted();

  const [securityPage, setSecurityPage] = React.useState<SecuritySubPage | null>(null);
  const [flow, setFlow]               = React.useState<ActiveFlow>('none');
  const [walletOpen, setWalletOpen]   = React.useState(false);
  const [wallet, setWallet]           = React.useState<WalletInfo | null>(null);
  const [walletCalloutReady, setWalletCalloutReady] = React.useState(false);

  // ── Trade / Go Account state ─────────────────────────────────────
  const [tradeHighlightVer, setTradeHighlightVer] = React.useState(0);
  const [goAccountFunded,   setGoAccountFunded]   = React.useState(false);
  const [depositOpen,       setDepositOpen]       = React.useState(false);
  const [depositTab,        setDepositTab]        = React.useState<'cash' | 'crypto'>('cash');
  const [policyOpen,        setPolicyOpen]        = React.useState(false);

  const snackRef = useRef<SnackbarHandle>(null);

  // ── Get Started launch routing ───────────────────────────────────
  const handleGsLaunch = (task: GsTask) => {
    if (task === 'gsWallet') {
      setFlow('wallet-creation');
    } else if (task === 'gsGoAccount') {
      // Pulse the trade panel and scroll it into view
      setTradeHighlightVer(v => v + 1);
    } else if (task === 'gsPolicy') {
      setPolicyOpen(true);
    }
  };

  // ── Deposit flow ─────────────────────────────────────────────────
  const handleDeposited = (msg: string) => {
    setDepositOpen(false);
    setGoAccountFunded(true);
    snackRef.current?.show(msg, false);
  };

  // ── Wallet created callback ───────────────────────────────────────
  const handleWalletCreated = (w: WalletInfo) => {
    setWallet(w);
    setFlow('none');
    setWalletOpen(true);
    markDone('gsWallet');
    setTimeout(() => snackRef.current?.show('Wallet created.', true, () => setWalletCalloutReady(true)), 300);
  };

  // ── Back to dashboard ─────────────────────────────────────────────
  const handleBackToDashboard = () => {
    setWalletOpen(false);
    setWalletCalloutReady(false);
    snackRef.current?.dismiss();
  };

  if (topPage === 'kyb') return <KYBFlow />;
  if (topPage === 'kyc') return <KYCFlow />;
  if (topPage === 'destinations') return (
    <div className="app">
      <Sidebar
        activeItem="security"
        activeSecurity="destinations"
        onNavigate={(item) => { if (item === 'home') navigateTo('dashboard'); }}
        onNavigateSecurity={(sub) => { if (sub !== 'destinations') { navigateTo('dashboard'); } }}
      />
      <div className="workspace">
        <DestinationsPage isLight={isLight} onThemeToggle={toggle} />
      </div>
    </div>
  );

  return (
    <>
      <div className="app">
        <Sidebar
          activeItem={securityPage ? 'security' : 'home'}
          activeSecurity={securityPage ?? undefined}
          onNavigate={(item) => { setSecurityPage(null); if (item === 'home') handleBackToDashboard(); }}
          onNavigateSecurity={(sub) => {
            if (sub === 'destinations') { navigateTo('destinations'); }
            else setSecurityPage(sub);
          }}
        />
        <div className="workspace">
          {securityPage === 'destinations' ? (
            <DestinationsPage
              isLight={isLight}
              onThemeToggle={toggle}
            />
          ) : <Dashboard
            isLight={isLight}
            onThemeToggle={toggle}
            doneTasks={done}
            allDone={allDone}
            onGsLaunch={handleGsLaunch}
            onOrderPlaced={(msg) => snackRef.current?.show(msg, false)}
            tradeHighlightVer={tradeHighlightVer}
            goAccountFunded={goAccountFunded}
            onOpenDeposit={(tab = 'cash') => { setDepositTab(tab); setDepositOpen(true); }}
            onTradeDone={() => markDone('gsGoAccount')}
          />}
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
        calloutReady={walletCalloutReady}
        onBack={handleBackToDashboard}
      />

      <DepositModal
        open={depositOpen}
        initialTab={depositTab}
        onClose={() => setDepositOpen(false)}
        onDeposited={handleDeposited}
      />

      <PolicyModal
        open={policyOpen}
        onClose={() => setPolicyOpen(false)}
        onPublished={() => {
          setPolicyOpen(false);
          markDone('gsPolicy');
          snackRef.current?.show('Policies published.', false);
        }}
      />

      <Snackbar ref={snackRef} onBackToDashboard={handleBackToDashboard} />
    </>
  );
}
