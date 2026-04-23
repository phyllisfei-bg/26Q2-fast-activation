import React, { useState, useCallback } from 'react';
import { TRADE_PAIRS } from '../types';

interface TradeCardProps {
  onOrderPlaced?: (msg: string) => void;
}

type TradeMode = 'buy' | 'sell';
type OrderType = 'Market' | 'Limit' | 'Stop';

const MOCK_BALANCE = 12500;

export const TradeCard: React.FC<TradeCardProps> = ({ onOrderPlaced }) => {
  const [pairIdx, setPairIdx] = useState(0);
  const [mode, setMode]       = useState<TradeMode>('buy');
  const [orderType, setOrderType] = useState<OrderType>('Market');
  const [amount, setAmount]   = useState('');
  const [currency, setCurrency] = useState<'USD' | string>('USD');

  const pair = TRADE_PAIRS[pairIdx];
  const coin = pair.name.split(' / ')[0];

  const cyclePair = () => {
    const next = (pairIdx + 1) % TRADE_PAIRS.length;
    setPairIdx(next);
    setCurrency('USD');
    setAmount('');
  };

  const flipCurrency = () => {
    setCurrency(c => c === 'USD' ? coin : 'USD');
    setAmount('');
  };

  const handleQuick = (pct: number) => {
    const val = currency === 'USD'
      ? (MOCK_BALANCE * pct).toFixed(2)
      : (MOCK_BALANCE * pct / pair.price).toFixed(6);
    setAmount(val);
  };

  const raw   = parseFloat(amount) || 0;
  const usd   = currency === 'USD' ? raw : raw * pair.price;
  const fee   = usd * 0.002;
  const total = usd + fee;
  const fmt   = (v: number) => v > 0 ? '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';

  const handleSubmit = useCallback(() => {
    if (!raw) return;
    const dir = mode === 'buy' ? 'purchased' : 'sold';
    const msg = `Order placed — ${dir} ${coin} · ${fmt(usd)}`;
    onOrderPlaced?.(msg);
    setAmount('');
  }, [raw, mode, coin, usd, onOrderPlaced]);

  return (
    <aside className="right-panel">
      <div className="trade-tabs">
        <button
          className={`trade-tab buy${mode === 'buy' ? ' active' : ''}`}
          onClick={() => setMode('buy')}
        >Buy</button>
        <button
          className={`trade-tab sell${mode === 'sell' ? ' active' : ''}`}
          onClick={() => setMode('sell')}
        >Sell</button>
      </div>
      <div className="trade-tabs-divider" />

      <div className="trade-body">
        {/* Pair */}
        <div className="trade-pair" onClick={cyclePair}>
          <div className="trade-pair-left">
            <div className="trade-coin-icon" style={{ background: pair.iconBg }}>{pair.icon}</div>
            <div>
              <div className="trade-pair-name">{pair.name}</div>
              <div className="trade-pair-sub">{pair.sub}</div>
            </div>
          </div>
          <div className="trade-pair-right">
            <div className="trade-current-price">${pair.price.toLocaleString()}</div>
            <div className={`trade-price-change${pair.pos ? '' : ' neg'}`}>{pair.change} today</div>
          </div>
        </div>

        {/* Order type */}
        <div className="trade-order-toggle">
          {(['Market', 'Limit', 'Stop'] as OrderType[]).map(t => (
            <button
              key={t}
              className={`trade-order-btn${orderType === t ? ' active' : ''}`}
              onClick={() => setOrderType(t)}
            >{t}</button>
          ))}
        </div>

        {/* Amount */}
        <div className="trade-amount-wrap">
          <div className="trade-amount-label">Amount</div>
          <div className="trade-amount-row">
            <input
              className="trade-amount-input"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <div className="trade-currency-toggle" onClick={flipCurrency}>
              <span>{currency === 'USD' ? 'USD' : coin}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="8 3 21 3 21 16" /><polyline points="3 21 21 3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick % */}
        <div className="trade-quick-row">
          {[0.25, 0.5, 0.75, 1].map((pct, i) => (
            <button key={i} className="trade-quick-btn" onClick={() => handleQuick(pct)}>
              {pct === 1 ? 'Max' : `${pct * 100}%`}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="trade-summary">
          <div className="trade-summary-row">
            <span className="trade-summary-label">Price</span>
            <span className="trade-summary-value">${pair.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="trade-summary-row">
            <span className="trade-summary-label">Fee (0.20%)</span>
            <span className="trade-summary-value">{fmt(fee)}</span>
          </div>
          <hr className="trade-summary-divider" />
          <div className="trade-summary-row trade-summary-total">
            <span className="trade-summary-label">Total</span>
            <span className="trade-summary-value">{fmt(total)}</span>
          </div>
        </div>

        {/* CTA */}
        <button
          className={`trade-cta-btn ${mode === 'buy' ? 'buy-cta' : 'sell-cta'}`}
          onClick={handleSubmit}
        >{mode === 'buy' ? 'Buy' : 'Sell'} {coin}</button>
      </div>
    </aside>
  );
};
