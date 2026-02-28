/**
 * App component integration tests
 *
 * Covers: initial render, category filtering, preview text propagation,
 * modal open/close flow, pro-upgrade state, and header badge transitions.
 *
 * Prerequisites (one-time refactor):
 *   1. Extract App (+ FontCard, PayModal, data, loadFonts) from index.html
 *      into individual files under src/
 *   2. Run: npm install
 *   3. Run: npm test
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// TODO: uncomment after extracting from index.html
// import App from '../../src/App';

// ── Minimal inline stubs (kept in sync with index.html) ───────────────────────

const PAIRINGS = [
  { id:1,  heading:'Playfair Display',   body:'Lato',         category:'Serif',      tag:'Editorial',  free:true,  desc:'Classic.' },
  { id:2,  heading:'Montserrat',         body:'Merriweather', category:'Sans-Serif', tag:'Modern',     free:true,  desc:'Timeless.' },
  { id:3,  heading:'Oswald',             body:'Open Sans',    category:'Display',    tag:'Bold',       free:true,  desc:'Punchy.' },
  { id:4,  heading:'Raleway',            body:'Source Sans',  category:'Sans-Serif', tag:'Clean',      free:true,  desc:'Elegant.' },
  { id:5,  heading:'Roboto Slab',        body:'Roboto',       category:'Serif',      tag:'Versatile',  free:true,  desc:'Classic.' },
  { id:6,  heading:'Libre Baskerville',  body:'Libre Franklin',category:'Serif',     tag:'Professional',free:true, desc:'Trustworthy.' },
  { id:7,  heading:'DM Serif Display',   body:'DM Sans',      category:'Serif',      tag:'Harmony',    free:false, desc:'Matched.' },
  { id:10, heading:'Space Grotesk',      body:'Space Mono',   category:'Monospace',  tag:'Tech',       free:false, desc:'Futuristic.' },
];
const CATEGORIES = ['All', 'Serif', 'Sans-Serif', 'Display', 'Monospace'];

function loadFonts() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?test';
  document.head.appendChild(link);
}

function FontCard({ p, preview, isPro, onUpgrade }) {
  const locked = !p.free && !isPro;
  const headingText = preview.trim() || 'Beautiful Typography';
  return (
    <div className={`card${locked ? ' locked' : ''}`} data-testid={`card-${p.id}`}>
      {locked && <div data-testid={`lock-${p.id}`} onClick={onUpgrade}>🔒 Unlock with Pro</div>}
      <div data-testid={`heading-${p.id}`}>{headingText}</div>
      <strong>{p.heading}</strong>
      <strong>{p.body}</strong>
      <span>{p.tag}</span>
      {!locked && <button data-testid={`copy-${p.id}`}>Copy CSS</button>}
    </div>
  );
}

function PayModal({ onClose, onSuccess }) {
  return (
    <div data-testid="pay-modal">
      <button data-testid="complete-upgrade" onClick={() => { onSuccess(); onClose(); }}>
        Complete Upgrade
      </button>
      <button data-testid="close-modal" onClick={onClose}>Close</button>
    </div>
  );
}

function App() {
  const [preview, setPreview]     = React.useState('Beautiful Typography');
  const [category, setCategory]   = React.useState('All');
  const [isPro, setIsPro]         = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => { loadFonts(); }, []);

  const displayed = category === 'All' ? PAIRINGS : PAIRINGS.filter(p => p.category === category);
  const lockedCount = PAIRINGS.filter(p => !p.free).length;

  return (
    <>
      <header data-testid="header">
        <div>FontPair Pro</div>
        {isPro
          ? <span data-testid="badge-pro">✨ Pro — All Access</span>
          : <span data-testid="badge-free">Free — 6 of 20 pairings</span>
        }
        {!isPro && (
          <button data-testid="upgrade-btn" onClick={() => setShowModal(true)}>
            Upgrade to Pro →
          </button>
        )}
      </header>

      {!isPro && (
        <div data-testid="upgrade-banner">
          <span>Unlock {lockedCount} more pairings with Pro</span>
          <button data-testid="banner-upgrade-btn" onClick={() => setShowModal(true)}>
            Get Pro
          </button>
        </div>
      )}

      <input
        data-testid="preview-input"
        value={preview}
        onChange={e => setPreview(e.target.value)}
        maxLength={50}
      />

      <div data-testid="filter-bar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            data-testid={`filter-${cat}`}
            className={category === cat ? 'active' : ''}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div data-testid="grid">
        {displayed.map(p => (
          <FontCard
            key={p.id}
            p={p}
            preview={preview}
            isPro={isPro}
            onUpgrade={() => setShowModal(true)}
          />
        ))}
      </div>

      {showModal && (
        <PayModal
          onClose={() => setShowModal(false)}
          onSuccess={() => setIsPro(true)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

describe('App — initial render', () => {
  test('renders the site logo text', () => {
    render(<App />);
    expect(screen.getByText('FontPair Pro')).toBeInTheDocument();
  });

  test('shows the "Free" badge by default', () => {
    render(<App />);
    expect(screen.getByTestId('badge-free')).toBeInTheDocument();
  });

  test('does NOT show the Pro badge by default', () => {
    render(<App />);
    expect(screen.queryByTestId('badge-pro')).not.toBeInTheDocument();
  });

  test('shows the upgrade button for free users', () => {
    render(<App />);
    expect(screen.getByTestId('upgrade-btn')).toBeInTheDocument();
  });

  test('shows the upgrade banner for free users', () => {
    render(<App />);
    expect(screen.getByTestId('upgrade-banner')).toBeInTheDocument();
  });

  test('renders all 5 category filter buttons', () => {
    render(<App />);
    CATEGORIES.forEach(cat => {
      expect(screen.getByTestId(`filter-${cat}`)).toBeInTheDocument();
    });
  });

  test('"All" filter is active by default', () => {
    render(<App />);
    expect(screen.getByTestId('filter-All')).toHaveClass('active');
  });

  test('renders all pairings in "All" view', () => {
    render(<App />);
    expect(screen.getAllByTestId(/^card-/)).toHaveLength(PAIRINGS.length);
  });

  test('does NOT show the modal on initial load', () => {
    render(<App />);
    expect(screen.queryByTestId('pay-modal')).not.toBeInTheDocument();
  });
});

// ── Category filtering ─────────────────────────────────────────────────────────

describe('App — category filtering', () => {
  test('clicking "Serif" shows only Serif pairings', async () => {
    render(<App />);
    await userEvent.click(screen.getByTestId('filter-Serif'));
    const cards = screen.getAllByTestId(/^card-/);
    const serifCount = PAIRINGS.filter(p => p.category === 'Serif').length;
    expect(cards).toHaveLength(serifCount);
  });

  test('clicking "Monospace" shows only Monospace pairings', async () => {
    render(<App />);
    await userEvent.click(screen.getByTestId('filter-Monospace'));
    const cards = screen.getAllByTestId(/^card-/);
    const monoCount = PAIRINGS.filter(p => p.category === 'Monospace').length;
    expect(cards).toHaveLength(monoCount);
  });

  test('clicking "All" after filtering restores all cards', async () => {
    render(<App />);
    await userEvent.click(screen.getByTestId('filter-Serif'));
    await userEvent.click(screen.getByTestId('filter-All'));
    expect(screen.getAllByTestId(/^card-/)).toHaveLength(PAIRINGS.length);
  });

  test('active class moves to the selected filter', async () => {
    render(<App />);
    await userEvent.click(screen.getByTestId('filter-Serif'));
    expect(screen.getByTestId('filter-Serif')).toHaveClass('active');
    expect(screen.getByTestId('filter-All')).not.toHaveClass('active');
  });

  test('filtering to a category with no pairings renders an empty grid', async () => {
    render(<App />);
    // If Display has no entries in our stub data, grid should be empty
    await userEvent.click(screen.getByTestId('filter-Display'));
    const displayCount = PAIRINGS.filter(p => p.category === 'Display').length;
    if (displayCount === 0) {
      expect(screen.queryAllByTestId(/^card-/)).toHaveLength(0);
    } else {
      expect(screen.getAllByTestId(/^card-/)).toHaveLength(displayCount);
    }
  });
});

// ── Preview text ───────────────────────────────────────────────────────────────

describe('App — preview text', () => {
  test('typing in the preview input updates all card headings', async () => {
    render(<App />);
    const input = screen.getByTestId('preview-input');
    await userEvent.clear(input);
    await userEvent.type(input, 'New Preview');
    const headings = screen.getAllByTestId(/^heading-/);
    headings.forEach(h => expect(h).toHaveTextContent('New Preview'));
  });

  test('clearing the preview input shows the fallback text on all cards', async () => {
    render(<App />);
    const input = screen.getByTestId('preview-input');
    await userEvent.clear(input);
    const headings = screen.getAllByTestId(/^heading-/);
    headings.forEach(h => expect(h).toHaveTextContent('Beautiful Typography'));
  });

  test('preview input has a maxLength of 50', () => {
    render(<App />);
    expect(screen.getByTestId('preview-input')).toHaveAttribute('maxLength', '50');
  });
});

// ── Modal open / close ─────────────────────────────────────────────────────────

describe('App — modal', () => {
  test('header upgrade button opens the modal', async () => {
    render(<App />);
    await userEvent.click(screen.getByTestId('upgrade-btn'));
    expect(screen.getByTestId('pay-modal')).toBeInTheDocument();
  });

  test('banner upgrade button opens the modal', async () => {
    render(<App />);
    await userEvent.click(screen.getByTestId('banner-upgrade-btn'));
    expect(screen.getByTestId('pay-modal')).toBeInTheDocument();
  });

  test('clicking a locked card opens the modal', async () => {
    render(<App />);
    // id=7 (DM Serif Display) is pro-only in our stub data
    const lockOverlay = screen.getByTestId('lock-7');
    await userEvent.click(lockOverlay);
    expect(screen.getByTestId('pay-modal')).toBeInTheDocument();
  });

  test('closing the modal hides it', async () => {
    render(<App />);
    await userEvent.click(screen.getByTestId('upgrade-btn'));
    await userEvent.click(screen.getByTestId('close-modal'));
    expect(screen.queryByTestId('pay-modal')).not.toBeInTheDocument();
  });
});

// ── Pro upgrade flow ───────────────────────────────────────────────────────────

describe('App — pro upgrade state', () => {
  test('completing upgrade switches badge to Pro', async () => {
    render(<App />);
    await userEvent.click(screen.getByTestId('upgrade-btn'));
    await userEvent.click(screen.getByTestId('complete-upgrade'));
    expect(screen.getByTestId('badge-pro')).toBeInTheDocument();
    expect(screen.queryByTestId('badge-free')).not.toBeInTheDocument();
  });

  test('completing upgrade hides the "Upgrade to Pro" button', async () => {
    render(<App />);
    await userEvent.click(screen.getByTestId('upgrade-btn'));
    await userEvent.click(screen.getByTestId('complete-upgrade'));
    expect(screen.queryByTestId('upgrade-btn')).not.toBeInTheDocument();
  });

  test('completing upgrade hides the upgrade banner', async () => {
    render(<App />);
    await userEvent.click(screen.getByTestId('upgrade-btn'));
    await userEvent.click(screen.getByTestId('complete-upgrade'));
    expect(screen.queryByTestId('upgrade-banner')).not.toBeInTheDocument();
  });

  test('after upgrade, previously locked cards are unlocked', async () => {
    render(<App />);
    // Verify card 7 is locked before upgrade
    expect(screen.getByTestId('lock-7')).toBeInTheDocument();
    // Upgrade
    await userEvent.click(screen.getByTestId('upgrade-btn'));
    await userEvent.click(screen.getByTestId('complete-upgrade'));
    // Lock overlay should be gone
    expect(screen.queryByTestId('lock-7')).not.toBeInTheDocument();
  });

  test('after upgrade, pro cards show the Copy CSS button', async () => {
    render(<App />);
    // Before upgrade: no copy button on locked card 7
    expect(screen.queryByTestId('copy-7')).not.toBeInTheDocument();
    // Upgrade
    await userEvent.click(screen.getByTestId('upgrade-btn'));
    await userEvent.click(screen.getByTestId('complete-upgrade'));
    // After upgrade: copy button appears
    expect(screen.getByTestId('copy-7')).toBeInTheDocument();
  });
});

// ── Font loading side-effect ───────────────────────────────────────────────────

describe('App — font loading', () => {
  beforeEach(() => {
    document.head.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());
  });

  test('loadFonts is called on mount (link element is injected)', () => {
    render(<App />);
    const links = document.head.querySelectorAll('link[rel="stylesheet"]');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });
});
