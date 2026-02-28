/**
 * FontCard component tests
 *
 * Covers: rendering, locked/unlocked states, copy-CSS interaction,
 * clipboard integration, and preview-text fallback.
 *
 * Prerequisites (one-time refactor):
 *   1. Extract FontCard from index.html into src/FontCard.jsx
 *   2. Run: npm install
 *   3. Run: npm test
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// TODO: uncomment after extracting the component from index.html
// import FontCard from '../../src/FontCard';

// ── Minimal inline stub so the test file is parseable before the extract ──────
function FontCard({ p, preview, isPro, onUpgrade }) {
  const [copied, setCopied] = React.useState(false);
  const locked = !p.free && !isPro;
  const headingText = preview.trim() || 'Beautiful Typography';
  const bodyText = 'Great design starts with the right typeface.';

  function copyCSS(e) {
    e.stopPropagation();
    const css = `/* FontPair Pro — ${p.heading} + ${p.body} */`;
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={`card ${locked ? 'locked' : ''}`} data-testid="font-card">
      {locked && (
        <div className="lock-overlay" onClick={onUpgrade} data-testid="lock-overlay">
          <div className="lock-circle">🔒</div>
          <div className="lock-label">Unlock with Pro</div>
        </div>
      )}
      <div className="card-preview">
        <div className="card-heading" style={{ fontFamily: `'${p.heading}', serif` }}>
          {headingText}
        </div>
        <div className="card-body-text" style={{ fontFamily: `'${p.body}', sans-serif` }}>
          {bodyText}
        </div>
      </div>
      <div className="card-footer">
        <div>
          <div className="card-font-name">Heading: <strong>{p.heading}</strong></div>
          <div className="card-font-name">Body: <strong>{p.body}</strong></div>
        </div>
        <div className="card-actions">
          <span className="card-tag">{p.tag}</span>
          {!locked && (
            <button
              className={`btn-copy ${copied ? 'copied' : ''}`}
              onClick={copyCSS}
              data-testid="copy-btn"
            >
              {copied ? '✓ Copied!' : 'Copy CSS'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const FREE_PAIRING  = { id: 1, heading: 'Playfair Display', body: 'Lato', category: 'Serif', tag: 'Editorial', free: true, desc: 'Classic.' };
const PRO_PAIRING   = { id: 7, heading: 'DM Serif Display', body: 'DM Sans', category: 'Serif', tag: 'System Harmony', free: false, desc: 'Matched system.' };

function setup(props) {
  const defaults = { p: FREE_PAIRING, preview: 'Hello World', isPro: false, onUpgrade: jest.fn() };
  return render(<FontCard {...defaults} {...props} />);
}

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('FontCard — rendering', () => {
  test('renders the heading font name', () => {
    setup({ p: FREE_PAIRING });
    expect(screen.getByText('Playfair Display')).toBeInTheDocument();
  });

  test('renders the body font name', () => {
    setup({ p: FREE_PAIRING });
    expect(screen.getByText('Lato')).toBeInTheDocument();
  });

  test('renders the pairing tag', () => {
    setup({ p: FREE_PAIRING });
    expect(screen.getByText('Editorial')).toBeInTheDocument();
  });

  test('renders the custom preview text as the heading', () => {
    setup({ preview: 'My Custom Headline' });
    expect(screen.getByText('My Custom Headline')).toBeInTheDocument();
  });

  test('falls back to "Beautiful Typography" when preview is empty', () => {
    setup({ preview: '' });
    expect(screen.getByText('Beautiful Typography')).toBeInTheDocument();
  });

  test('falls back to "Beautiful Typography" when preview is only whitespace', () => {
    setup({ preview: '   ' });
    expect(screen.getByText('Beautiful Typography')).toBeInTheDocument();
  });

  test('applies heading font family via inline style', () => {
    setup({ p: FREE_PAIRING });
    const heading = screen.getByText('Hello World');
    expect(heading).toHaveStyle({ fontFamily: "'Playfair Display', serif" });
  });

  test('applies body font family via inline style', () => {
    setup({ p: FREE_PAIRING });
    const body = screen.getByText(/Great design starts/);
    expect(body).toHaveStyle({ fontFamily: "'Lato', sans-serif" });
  });
});

// ── Lock state ────────────────────────────────────────────────────────────────

describe('FontCard — lock state', () => {
  test('free pairing without pro is NOT locked', () => {
    setup({ p: FREE_PAIRING, isPro: false });
    const card = screen.getByTestId('font-card');
    expect(card).not.toHaveClass('locked');
    expect(screen.queryByTestId('lock-overlay')).not.toBeInTheDocument();
  });

  test('pro pairing without isPro IS locked', () => {
    setup({ p: PRO_PAIRING, isPro: false });
    const card = screen.getByTestId('font-card');
    expect(card).toHaveClass('locked');
    expect(screen.getByTestId('lock-overlay')).toBeInTheDocument();
  });

  test('pro pairing WITH isPro is NOT locked', () => {
    setup({ p: PRO_PAIRING, isPro: true });
    const card = screen.getByTestId('font-card');
    expect(card).not.toHaveClass('locked');
    expect(screen.queryByTestId('lock-overlay')).not.toBeInTheDocument();
  });

  test('free pairing with isPro is NOT locked (free stays free)', () => {
    setup({ p: FREE_PAIRING, isPro: true });
    expect(screen.queryByTestId('lock-overlay')).not.toBeInTheDocument();
  });

  test('clicking the lock overlay calls onUpgrade', () => {
    const onUpgrade = jest.fn();
    setup({ p: PRO_PAIRING, isPro: false, onUpgrade });
    fireEvent.click(screen.getByTestId('lock-overlay'));
    expect(onUpgrade).toHaveBeenCalledTimes(1);
  });

  test('Copy CSS button is hidden when card is locked', () => {
    setup({ p: PRO_PAIRING, isPro: false });
    expect(screen.queryByTestId('copy-btn')).not.toBeInTheDocument();
  });

  test('Copy CSS button is visible when card is unlocked', () => {
    setup({ p: FREE_PAIRING, isPro: false });
    expect(screen.getByTestId('copy-btn')).toBeInTheDocument();
  });
});

// ── Copy CSS interaction ───────────────────────────────────────────────────────

describe('FontCard — Copy CSS button', () => {
  beforeEach(() => {
    // Mock the Clipboard API
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runAllTimers();
    jest.useRealTimers();
  });

  test('calls navigator.clipboard.writeText on click', async () => {
    setup({ p: FREE_PAIRING });
    await userEvent.click(screen.getByTestId('copy-btn'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
  });

  test('clipboard receives a CSS string containing both font names', async () => {
    setup({ p: FREE_PAIRING });
    await userEvent.click(screen.getByTestId('copy-btn'));
    const [css] = navigator.clipboard.writeText.mock.calls[0];
    expect(css).toContain('Playfair Display');
    expect(css).toContain('Lato');
  });

  test('button text changes to "✓ Copied!" after click', async () => {
    setup({ p: FREE_PAIRING });
    await userEvent.click(screen.getByTestId('copy-btn'));
    await waitFor(() => expect(screen.getByTestId('copy-btn')).toHaveTextContent('✓ Copied!'));
  });

  test('button text resets to "Copy CSS" after 2 seconds', async () => {
    setup({ p: FREE_PAIRING });
    await userEvent.click(screen.getByTestId('copy-btn'));
    await waitFor(() => screen.getByText('✓ Copied!'));
    act(() => jest.advanceTimersByTime(2000));
    await waitFor(() => expect(screen.getByTestId('copy-btn')).toHaveTextContent('Copy CSS'));
  });

  test('button receives "copied" class while in copied state', async () => {
    setup({ p: FREE_PAIRING });
    await userEvent.click(screen.getByTestId('copy-btn'));
    await waitFor(() => expect(screen.getByTestId('copy-btn')).toHaveClass('copied'));
  });

  test('click does not bubble up to parent elements', async () => {
    const parentHandler = jest.fn();
    render(
      <div onClick={parentHandler}>
        <FontCard p={FREE_PAIRING} preview="Test" isPro={false} onUpgrade={jest.fn()} />
      </div>
    );
    await userEvent.click(screen.getByTestId('copy-btn'));
    expect(parentHandler).not.toHaveBeenCalled();
  });
});
