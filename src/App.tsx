import React, { useRef, useState, useEffect } from 'react';
import { Sidebar }            from './components/Sidebar';
import { Snackbar } from './components/Snackbar';
import type { SnackbarHandle } from './components/Snackbar';
import { RoleSwitcher }       from './components/RoleSwitcher';
import type { EnterpriseState } from './components/RoleSwitcher';
import { Dashboard }          from './pages/Dashboard';
import { WalletDetailPage }   from './pages/WalletDetailPage';
import { GoAccountPage }      from './pages/GoAccountPage';
import { DestinationsPage }   from './pages/DestinationsPage';
import { FlowPage }           from './pages/FlowPage';
import { WalletCreationFlow } from './flows/WalletCreationFlow';
import { DepositModal }       from './flows/DepositModal';
import { PolicyModal }        from './flows/PolicyModal';
import { KYBFlow }            from './flows/KYBFlow';
import { KYCFlow }            from './flows/KYCFlow';
import { useGetStarted }      from './hooks/useGetStarted';
import { useTheme }           from './hooks/useTheme';
import type { GsTask, UserRole, WalletInfo } from './types';
import { GS_TASK_META } from './types';

type ActiveFlow = 'none' | 'wallet-creation';
type TopPage = 'dashboard' | 'kyb' | 'kyc' | 'destinations' | 'flow' | 'trade';
type SecuritySubPage = 'policies' | 'destinations' | 'activity-log' | 'roles';

function getTopPage(): TopPage {
  const h = window.location.hash;
  if (h === '#kyb') return 'kyb';
  if (h === '#kyc') return 'kyc';
  if (h === '#destinations') return 'destinations';
  if (h === '#flow') return 'flow';
  if (h === '#trade') return 'trade';
  return 'dashboard';
}

export default function App() {
  const { isLight, toggle } = useTheme();
  const [topPage, setTopPage] = useState<TopPage>(getTopPage);
  const [roles, setRoles] = useState<UserRole[]>(['super_user']);
  const role = roles[0];
  const [enterpriseState, setEnterpriseState] = useState<EnterpriseState>({
    onboardingType: 'sales-led',
    entityType: 'business',
    bankAccountAdded: false,
    walletExists: false,
  });

  const navigateTo = (page: TopPage) => {
    window.location.hash = page === 'dashboard' ? '' : page;
    setTopPage(page);
  };

  useEffect(() => {
    function onHash() { setTopPage(getTopPage()); }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const { done, markDone, allDone, tasks } = useGetStarted(roles, enterpriseState);

  const [securityPage, setSecurityPage] = React.useState<SecuritySubPage | null>(null);
  const [flow, setFlow]               = React.useState<ActiveFlow>('none');
  const [walletOpen, setWalletOpen]   = React.useState(false);
  const [wallet, setWallet]           = React.useState<WalletInfo | null>(null);
  const [walletCalloutReady, setWalletCalloutReady] = React.useState(false);

  const [goAccountOpen,       setGoAccountOpen]       = React.useState(false);
  const [goAccountDepositAmt, setGoAccountDepositAmt] = React.useState(0);
  const [tradeHighlightVer, setTradeHighlightVer] = React.useState(0);
  const [goAccountFunded,   setGoAccountFunded]   = React.useState(false);
  const [depositOpen,       setDepositOpen]       = React.useState(false);
  const [depositTab,        setDepositTab]        = React.useState<'cash' | 'crypto'>('cash');
  const [policyOpen,        setPolicyOpen]        = React.useState(false);

  const snackRef = useRef<SnackbarHandle>(null);

  // ── Get Started launch routing ───────────────────────────────────
  const handleGsLaunch = (task: GsTask) => {
    const meta = GS_TASK_META[task];

    // Explore tasks: mark done immediately + show contextual snackbar
    if (meta.type === 'explore') {
      markDone(task);
      const msgs: Partial<Record<GsTask, string>> = {
        gsStaking:            'Staking earns yield on ETH, SOL, and more — available in Wallets.',
        gsReporting:          'Audit logs and reports are available under Security → Activity Log.',
        gsCompliance:         'Compliance status is current — no outstanding items.',
        gsTrading:            'Use the Go Account panel on the right to set up your trading workflow.',
        gsGoAccountStaking:   'Go Account staking earns yield on idle assets — available in the Go Account panel.',
        gsViewMembersRoles:   'Org members are managed under Security → Roles.',
        gsExploreRoles:       'User roles and permissions are defined under Security → Roles.',
        gsExplorePortfolio:   'Your portfolio overview is in the main dashboard.',
        gsUnderstandTasks:    'Pending approvals and transaction tasks are managed from your wallet.',
        gsUnderstandPolicies: 'Spending policies are configured per wallet under Security → Policies.',
        gsUnderstandStaking:  'Staking earns yield on ETH, SOL, and more — available in Wallets.',
        gsLearnDeposit:       'To deposit, open a wallet and click Deposit Funds.',
        gsTryReports:         'Reports and audit logs are available under Security → Activity Log.',
      };
      snackRef.current?.show(msgs[task] ?? 'Done.', false);
      return;
    }

    // Action tasks: launch the relevant flow
    switch (task) {
      case 'gsGoAccountFund':
        setDepositTab('cash');
        setDepositOpen(true);
        break;
      case 'gsFirstTrade':
        setTradeHighlightVer(v => v + 1);
        break;
      case 'gsInitiateTransaction':
        snackRef.current?.show('Transaction flow coming soon.', false);
        break;
      case 'gsWallet':
        setFlow('wallet-creation');
        break;
      case 'gsGoAccount':
        setTradeHighlightVer(v => v + 1);
        break;
      case 'gsPolicy':
        setPolicyOpen(true);
        break;
      case 'gsDeposit':
      case 'gsTransact':
        setDepositTab('cash');
        setDepositOpen(true);
        break;
      case 'gsInvite':
        snackRef.current?.show('Team management coming soon.', false);
        break;
      case 'gsRoles':
        snackRef.current?.show('Role & permissions management coming soon.', false);
        break;
      case 'gsVerify':
        snackRef.current?.show('Video verification coming soon.', false);
        break;
    }
  };

  // ── Deposit flow ─────────────────────────────────────────────────
  const handleDeposited = (msg: string, amount?: number) => {
    setDepositOpen(false);
    setGoAccountFunded(true);
    if (amount) setGoAccountDepositAmt(a => a + amount);
    markDone('gsGoAccountFund');
    markDone('gsDeposit');
    markDone('gsTransact');
    snackRef.current?.show(msg, false, undefined, {
      label: 'Go to Go Account',
      onClick: () => setGoAccountOpen(true),
    });
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

  // ── Callout workflow callbacks ────────────────────────────────────
  const handleCalloutDeposit = () => {
    setDepositTab('cash');
    setDepositOpen(true);
  };
  const handleCalloutInvite = () => {
    snackRef.current?.show('Team management coming soon.', false);
  };
  const handleCalloutPolicies = () => {
    setPolicyOpen(true);
  };

  if (topPage === 'flow') return <FlowPage />;
  if (topPage === 'kyb') return <KYBFlow />;
  if (topPage === 'kyc') return <KYCFlow />;
  if (topPage === 'trade') return (
    <div className="app">
      <Sidebar activeItem="trade" onNavigate={(item) => { if (item === 'home') navigateTo('dashboard'); if (item === 'trade') navigateTo('trade'); }} />
      <div className="workspace" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
        Advanced Trading — coming soon
      </div>
      <RoleSwitcher roles={roles} onChange={setRoles} enterpriseState={enterpriseState} onEnterpriseStateChange={setEnterpriseState} />
    </div>
  );
  if (topPage === 'destinations') return (
    <div className="app">
      <Sidebar
        activeItem="security"
        activeSecurity="destinations"
        onNavigate={(item) => { if (item === 'home') navigateTo('dashboard'); if (item === 'trade') navigateTo('trade'); }}
        onNavigateSecurity={(sub) => { if (sub !== 'destinations') { navigateTo('dashboard'); } }}
      />
      <div className="workspace">
        <DestinationsPage isLight={isLight} onThemeToggle={toggle} />
      </div>
      <RoleSwitcher roles={roles} onChange={setRoles} enterpriseState={enterpriseState} onEnterpriseStateChange={setEnterpriseState} />
    </div>
  );

  return (
    <>
      <div className="app">
        <Sidebar
          activeItem={securityPage ? 'security' : 'home'}
          activeSecurity={securityPage ?? undefined}
          onNavigate={(item) => { setSecurityPage(null); if (item === 'home') handleBackToDashboard(); if (item === 'trade') navigateTo('trade'); }}
          onNavigateSecurity={(sub) => {
            if (sub === 'destinations') { navigateTo('destinations'); }
            else setSecurityPage(sub);
          }}
        />
        <div className="workspace">
          {securityPage === 'destinations' ? (
            <DestinationsPage isLight={isLight} onThemeToggle={toggle} />
          ) : (
            <Dashboard
              isLight={isLight}
              onThemeToggle={toggle}
              role={role}
              tasks={tasks}
              doneTasks={done}
              allDone={allDone}
              onGsLaunch={handleGsLaunch}
              onOrderPlaced={(msg) => snackRef.current?.show(msg, false, undefined, {
                label: 'View Advanced Trading',
                onClick: () => navigateTo('trade'),
              })}
              tradeHighlightVer={tradeHighlightVer}
              goAccountFunded={goAccountFunded}
              onOpenDeposit={(tab = 'cash') => { setDepositTab(tab); setDepositOpen(true); }}
              onTradeDone={() => { markDone('gsGoAccount'); markDone('gsFirstTrade'); }}
            />
          )}
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
        role={role}
        onCalloutDeposit={handleCalloutDeposit}
        onCalloutInvite={handleCalloutInvite}
        onCalloutPolicies={handleCalloutPolicies}
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

      <GoAccountPage
        open={goAccountOpen}
        depositedAmount={goAccountDepositAmt}
        role={role}
        onBack={() => setGoAccountOpen(false)}
        onCalloutInvite={handleCalloutInvite}
        onCalloutPolicies={handleCalloutPolicies}
      />

      <Snackbar ref={snackRef} onBackToDashboard={handleBackToDashboard} />
      <RoleSwitcher roles={roles} onChange={setRoles} enterpriseState={enterpriseState} onEnterpriseStateChange={setEnterpriseState} />
    </>
  );
}
