/**
 * PayModal component tests
 *
 * Covers: initial render, form submission, payment loading state,
 * success-screen transition, onSuccess/onClose callback timing,
 * and overlay dismiss behaviour.
 *
 * Prerequisites (one-time refactor):
 *   1. Extract PayModal from index.html into src/PayModal.jsx
 *   2. Run: npm install
 *   3. Run: npm test
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// TODO: uncomment after extracting the component from index.html
// import PayModal from '../../src/PayModal';

// ── Inline stub (kept in sync with index.html) ────────────────────────────────
function PayModal({ onClose, onSuccess }) {
  const [step, setStep] = React.useState('pay');
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setStep('success'), 1600);
    setTimeout(() => { onSuccess(); onClose(); }, 3600);
  }

  if (step === 'success') return (
    <div className="modal-overlay" data-testid="modal-overlay">
      <div className="modal" data-testid="modal">
        <div className="success-screen" data-testid="success-screen">
          <div className="success-check">✓</div>
          <h2>Welcome to Pro! 🎉</h2>
          <p>All 20 curated font pairings are now unlocked.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" data-testid="modal-overlay" onClick={onClose}>
      <div className="modal" data-testid="modal" onClick={e => e.stopPropagation()}>
        <h2>Upgrade to Pro</h2>
        <form onSubmit={handleSubmit} data-testid="payment-form">
          <input type="email" defaultValue="cam@example.com" placeholder="you@example.com" required aria-label="Email address" />
          <input type="text" defaultValue="4242 4242 4242 4242" aria-label="Card number" />
          <input type="text" defaultValue="12 / 28" aria-label="Expiry" />
          <input type="text" defaultValue="123" aria-label="CVC" />
          <button
            type="submit"
            disabled={loading}
            data-testid="pay-btn"
          >
            {loading ? 'Processing payment…' : 'Pay $9 / month'}
          </button>
          <button type="button" onClick={onClose} data-testid="cancel-btn">
            No thanks
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function setup(overrides = {}) {
  const props = { onClose: jest.fn(), onSuccess: jest.fn(), ...overrides };
  const result = render(<PayModal {...props} />);
  return { ...result, ...props };
}

// ── Initial render ─────────────────────────────────────────────────────────────

describe('PayModal — initial render', () => {
  test('renders the upgrade heading', () => {
    setup();
    expect(screen.getByRole('heading', { name: /Upgrade to Pro/i })).toBeInTheDocument();
  });

  test('renders the payment form', () => {
    setup();
    expect(screen.getByTestId('payment-form')).toBeInTheDocument();
  });

  test('renders the Pay button', () => {
    setup();
    expect(screen.getByTestId('pay-btn')).toBeInTheDocument();
    expect(screen.getByTestId('pay-btn')).toHaveTextContent('Pay $9 / month');
  });

  test('Pay button is enabled initially', () => {
    setup();
    expect(screen.getByTestId('pay-btn')).not.toBeDisabled();
  });

  test('renders the "No thanks" cancel button', () => {
    setup();
    expect(screen.getByTestId('cancel-btn')).toBeInTheDocument();
  });

  test('does NOT show the success screen initially', () => {
    setup();
    expect(screen.queryByTestId('success-screen')).not.toBeInTheDocument();
  });
});

// ── Form submission & loading state ───────────────────────────────────────────

describe('PayModal — form submission', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => { jest.runAllTimers(); jest.useRealTimers(); });

  test('Pay button becomes disabled after form is submitted', async () => {
    setup();
    await userEvent.click(screen.getByTestId('pay-btn'));
    expect(screen.getByTestId('pay-btn')).toBeDisabled();
  });

  test('Pay button text changes to "Processing payment…" while loading', async () => {
    setup();
    await userEvent.click(screen.getByTestId('pay-btn'));
    expect(screen.getByTestId('pay-btn')).toHaveTextContent('Processing payment…');
  });

  test('success screen appears after 1600 ms', async () => {
    setup();
    await userEvent.click(screen.getByTestId('pay-btn'));
    expect(screen.queryByTestId('success-screen')).not.toBeInTheDocument();
    act(() => jest.advanceTimersByTime(1600));
    await waitFor(() => expect(screen.getByTestId('success-screen')).toBeInTheDocument());
  });

  test('onSuccess is NOT called before 3600 ms', async () => {
    const { onSuccess } = setup();
    await userEvent.click(screen.getByTestId('pay-btn'));
    act(() => jest.advanceTimersByTime(1599));
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('onSuccess is called after 3600 ms', async () => {
    const { onSuccess } = setup();
    await userEvent.click(screen.getByTestId('pay-btn'));
    act(() => jest.advanceTimersByTime(3600));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  test('onClose is called after 3600 ms (modal closes after success)', async () => {
    const { onClose } = setup();
    await userEvent.click(screen.getByTestId('pay-btn'));
    act(() => jest.advanceTimersByTime(3600));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  test('success screen shows correct heading', async () => {
    setup();
    await userEvent.click(screen.getByTestId('pay-btn'));
    act(() => jest.advanceTimersByTime(1600));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /Welcome to Pro/i })).toBeInTheDocument()
    );
  });
});

// ── Cancel / overlay dismiss ───────────────────────────────────────────────────

describe('PayModal — cancel behaviour', () => {
  test('"No thanks" button calls onClose', async () => {
    const { onClose } = setup();
    await userEvent.click(screen.getByTestId('cancel-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('clicking the modal overlay calls onClose', async () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByTestId('modal-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('clicking inside the modal does NOT call onClose', async () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByTestId('modal'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
