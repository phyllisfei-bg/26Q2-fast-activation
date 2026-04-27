import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { TRADE_PAIRS } from '../types';

interface TradeCardProps {
  highlightVer?:  number;
  funded?:        boolean;
  onOpenDeposit?: () => void;
  onOrderPlaced?: (msg: string) => void;
  onTradeDone?:   () => void;
}

type TradeMode = 'buy' | 'sell';

const MOCK_BALANCE = 12500;

export const TradeCard: React.FC<TradeCardProps> = ({
  highlightVer = 0,
  funded = false,
  onOpenDeposit,
  onOrderPlaced,
  onTradeDone,
}) => {
  const [pairIdx, setPairIdx]       = useState(0);
  const [mode, setMode]             = useState<TradeMode>('buy');
  const [amount, setAmount]         = useState('');
  const [currency, setCurrency]     = useState<'USD' | string>('USD');
  const [paymentSelected, setPaymentSelected] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const inputRef   = useRef<HTMLInputElement>(null);
  const panelRef   = useRef<HTMLElement>(null);
  const prevVerRef = useRef(0);

  const pair = TRADE_PAIRS[pairIdx];
  const coin = pair.name.split(' / ')[0];

  // Pulse animation + scroll when GS "Start" is clicked
  useEffect(() => {
    if (highlightVer === 0 || highlightVer === prevVerRef.current) return;
    prevVerRef.current = highlightVer;
    setHighlighted(true);
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const t = setTimeout(() => setHighlighted(false), 1600);
    return () => clearTimeout(t);
  }, [highlightVer]);

  const cyclePair = () => {
    setPairIdx((pairIdx + 1) % TRADE_PAIRS.length);
    setCurrency('USD');
    setAmount('');
  };

  const flipCurrency = () => {
    setCurrency(c => c === 'USD' ? coin : 'USD');
    setAmount('');
  };

  const raw = parseFloat(amount) || 0;
  const usd = currency === 'USD' ? raw : raw * pair.price;
  const btcEquiv = currency === 'USD' ? (raw / pair.price) : raw;

  const convText = currency === 'USD'
    ? `= ${btcEquiv > 0 ? btcEquiv.toFixed(6) : '0'} ${coin}`
    : `= $${usd > 0 ? usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0'}`;

  const handleMax = () => {
    const val = currency === 'USD'
      ? MOCK_BALANCE.toFixed(2)
      : (MOCK_BALANCE / pair.price).toFixed(6);
    setAmount(val);
    inputRef.current?.focus();
  };

  // Selecting payment also counts as funded — hide nudge
  const handleSelectPayment = () => {
    setPaymentSelected(true);
  };

  const handleSubmit = useCallback(() => {
    if (!raw || !paymentSelected) return;
    const dir = mode === 'buy' ? 'purchased' : 'sold';
    const msg = `Order placed — ${dir} ${coin} · $${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    onOrderPlaced?.(msg);
    onTradeDone?.();
    setAmount('');
    setPaymentSelected(false);
  }, [raw, paymentSelected, mode, coin, usd, onOrderPlaced, onTradeDone]);

  const displayVal = amount || '0';

  const mobileBar = ReactDOM.createPortal(
    <div className="mobile-trade-bar">
      <button className="mobile-trade-btn deposit" onClick={() => onOpenDeposit?.()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: 6 }}>
          <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 19 19 12"/>
        </svg>
        Deposit
      </button>
      <button className="mobile-trade-btn buy" onClick={() => inputRef.current?.focus()}>
        Buy / Sell
      </button>
    </div>,
    document.body
  );

  return (
    <>
    <aside ref={panelRef} className={`right-panel${highlighted ? ' trade-highlight' : ''}`}>
      {/* Top bar: pill toggle + order type */}
      <div className="trade-topbar">
        <div className="trade-pill-toggle">
          <button
            className={`trade-tab${mode === 'buy' ? ' active' : ''}`}
            onClick={() => setMode('buy')}
          >Buy</button>
          <button
            className={`trade-tab${mode === 'sell' ? ' active' : ''}`}
            onClick={() => setMode('sell')}
          >Sell</button>
        </div>
        <button className="trade-order-pill">
          Market
          <svg width="10" height="7" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l5 5 5-5"/>
          </svg>
        </button>
      </div>

      <div className="trade-body">
        {/* Fund nudge — shown until funded or payment selected */}
        {!funded && !paymentSelected && (
          <div className="trade-fund-nudge visible">
            <div className="trade-fund-nudge-title">Fund your Go Account first</div>
            <div className="trade-fund-nudge-body">You need funds in your Go Account to place trades. Deposit cash or crypto to get started.</div>
            <button
              className="trade-fund-nudge-cta"
              onClick={() => onOpenDeposit?.()}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 19 19 12"/>
              </svg>
              Deposit
            </button>
          </div>
        )}

        {/* Asset selector */}
        <div className="trade-section-label">{mode === 'buy' ? 'Buy' : 'Sell'}</div>
        <div className="trade-selector-row" onClick={cyclePair}>
          <div className="trade-coin-icon" style={{ background: pair.iconBg }}>{pair.icon}</div>
          <div className="trade-selector-info">
            <div className="trade-selector-name">{pair.sub}</div>
            <div className="trade-selector-sub">{coin}</div>
          </div>
          <div className="trade-selector-right">
            <div className="trade-selector-price">${pair.price.toLocaleString()}</div>
            <div className="trade-selector-price-label">Price</div>
          </div>
          <svg className="trade-selector-chevron" width="7" height="12" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l6 6-6 6"/>
          </svg>
        </div>

        {/* Pay with */}
        <div className="trade-section-label">Pay with</div>
        <div className="trade-selector-row" onClick={handleSelectPayment} style={{ cursor: 'pointer' }}>
          <span className="trade-pay-label" style={paymentSelected ? { color: 'var(--color-text)', fontWeight: 500 } : undefined}>
            {paymentSelected ? 'USD · Checking ····4242' : 'Select Payment Method'}
          </span>
          <svg className="trade-selector-chevron" width="7" height="12" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l6 6-6 6"/>
          </svg>
        </div>

        {/* Large amount display */}
        <div className="trade-amount-area" onClick={() => inputRef.current?.focus()}>
          <div className="trade-amount-display">
            <span className={`trade-amount-number${raw > 0 ? ' has-value' : ''}`}>{displayVal}</span>
            <span className="trade-amount-currency">{currency === 'USD' ? 'USD' : coin}</span>
            <input
              ref={inputRef}
              className="trade-amount-input-hidden"
              type="number"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Conv + swap + Max */}
        <div className="trade-conv-row">
          <span className="trade-conv-text">{convText}</span>
          <button className="trade-swap-btn" onClick={flipCurrency} title="Swap currency">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
          </button>
          <button className="trade-max-pill" onClick={handleMax}>Max</button>
        </div>

        {/* Advanced link */}
        <button className="trade-advanced-link">Advanced Trading</button>

        {/* CTA */}
        <button
          className={`trade-cta-btn${mode === 'sell' ? ' sell-cta' : ''}`}
          disabled={!raw || !paymentSelected}
          onClick={handleSubmit}
        >Review Order</button>
      </div>
    </aside>
    {mobileBar}
    </>
  );
};
