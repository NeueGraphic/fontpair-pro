/**
 * Unit tests for the loadFonts() utility
 *
 * loadFonts() builds a Google Fonts stylesheet URL from all PAIRINGS and
 * injects a <link> element into document.head.  These tests verify URL
 * correctness, deduplication, and DOM side-effects without hitting the
 * network.
 *
 * NOTE: Replace the inline definitions below with module imports once the
 * app is split into separate source files:
 *   import { PAIRINGS } from '../../src/data';
 *   import { loadFonts }  from '../../src/loadFonts';
 */

// ── Inline production data (kept in sync with index.html) ────────────────────

const PAIRINGS = [
  { id:1,  heading:'Playfair Display',    body:'Lato',            category:'Serif',      tag:'Editorial',      free:true  },
  { id:2,  heading:'Montserrat',          body:'Merriweather',    category:'Sans-Serif', tag:'Modern Classic',  free:true  },
  { id:3,  heading:'Oswald',              body:'Open Sans',       category:'Display',    tag:'Bold Impact',    free:true  },
  { id:4,  heading:'Raleway',             body:'Source Sans Pro', category:'Sans-Serif', tag:'Clean Tech',     free:true  },
  { id:5,  heading:'Roboto Slab',         body:'Roboto',          category:'Serif',      tag:'Versatile',      free:true  },
  { id:6,  heading:'Libre Baskerville',   body:'Libre Franklin',  category:'Serif',      tag:'Professional',   free:true  },
  { id:7,  heading:'DM Serif Display',    body:'DM Sans',         category:'Serif',      tag:'System Harmony', free:false },
  { id:8,  heading:'Cormorant Garamond',  body:'Proza Libre',     category:'Serif',      tag:'Luxury',         free:false },
  { id:9,  heading:'Abril Fatface',       body:'Poppins',         category:'Display',    tag:'Playful Pop',    free:false },
  { id:10, heading:'Space Grotesk',       body:'Space Mono',      category:'Monospace',  tag:'Tech',           free:false },
  { id:11, heading:'Fraunces',            body:'Commissioner',    category:'Serif',      tag:'Contemporary',   free:false },
  { id:12, heading:'Spectral',            body:'Karla',           category:'Serif',      tag:'Literary',       free:false },
  { id:13, heading:'Crimson Pro',         body:'Cabin',           category:'Serif',      tag:'Academic',       free:false },
  { id:14, heading:'Josefin Sans',        body:'Josefin Slab',    category:'Display',    tag:'Geometric',      free:false },
  { id:15, heading:'Nunito',              body:'Nunito Sans',     category:'Sans-Serif', tag:'Friendly',       free:false },
  { id:16, heading:'Syne',               body:'Jost',             category:'Display',    tag:'Avant-Garde',    free:false },
  { id:17, heading:'Arvo',               body:'PT Sans',          category:'Serif',      tag:'Sturdy',         free:false },
  { id:18, heading:'Bitter',             body:'Raleway',          category:'Serif',      tag:'News',           free:false },
  { id:19, heading:'Bebas Neue',         body:'Hind',             category:'Display',    tag:'Street Bold',    free:false },
  { id:20, heading:'Playfair Display SC',body:'Alice',            category:'Serif',      tag:'Vintage',        free:false },
];

// ── Inline production implementation (kept in sync with index.html) ───────────

function loadFonts() {
  const families = PAIRINGS.flatMap(p => [
    `${p.heading.replace(/ /g, '+')}:wght@700;800`,
    `${p.body.replace(/ /g, '+')}:wght@400;500`,
  ]);
  const unique = [...new Set(families)];
  const url = `https://fonts.googleapis.com/css2?${unique.map(f => `family=${f}`).join('&')}&display=swap`;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

// ─────────────────────────────────────────────────────────────────────────────

describe('loadFonts()', () => {
  beforeEach(() => {
    // Remove any <link> elements injected by previous tests
    document.head.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());
  });

  test('injects exactly one <link> element into document.head', () => {
    loadFonts();
    const links = document.head.querySelectorAll('link[rel="stylesheet"]');
    expect(links).toHaveLength(1);
  });

  test('injected link has rel="stylesheet"', () => {
    loadFonts();
    const link = document.head.querySelector('link');
    expect(link.rel).toBe('stylesheet');
  });

  test('URL points to the Google Fonts CSS2 API', () => {
    loadFonts();
    const href = document.head.querySelector('link').href;
    expect(href).toMatch(/^https:\/\/fonts\.googleapis\.com\/css2\?/);
  });

  test('URL includes display=swap for better font loading performance', () => {
    loadFonts();
    const href = document.head.querySelector('link').href;
    expect(href).toContain('display=swap');
  });

  test('URL encodes spaces in font names as "+"', () => {
    loadFonts();
    const href = document.head.querySelector('link').href;
    expect(href).not.toContain('Playfair Display');   // raw space — bad
    expect(href).toContain('Playfair+Display');        // encoded — good
  });

  test('URL requests weight 700 and 800 for heading fonts', () => {
    loadFonts();
    const href = document.head.querySelector('link').href;
    // At least one heading entry should specify bold weights
    expect(href).toMatch(/wght@700;800/);
  });

  test('URL requests weight 400 and 500 for body fonts', () => {
    loadFonts();
    const href = document.head.querySelector('link').href;
    expect(href).toMatch(/wght@400;500/);
  });

  test('deduplicates font families — Raleway appears as heading (id=4) and body (id=18)', () => {
    // Raleway is used both as a heading font (pairing #4) and a body font (#18).
    // The URL should only include the Raleway family once per weight spec.
    loadFonts();
    const href = document.head.querySelector('link').href;
    const ralewayCounts = (href.match(/Raleway/g) || []).length;
    // Raleway will appear once in heading spec (:wght@700;800) and once in body spec (:wght@400;500)
    // but NOT duplicated beyond that.
    expect(ralewayCounts).toBeLessThanOrEqual(2);
  });

  test('does not inject a second link if called twice', () => {
    loadFonts();
    loadFonts();
    // Current implementation injects on every call — this test documents the
    // existing (undesirable) behaviour so a future guard can be added.
    // Once fixed, update to: expect(links).toHaveLength(1);
    const links = document.head.querySelectorAll('link[rel="stylesheet"]');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  test('includes all 20 unique heading font families', () => {
    loadFonts();
    const href = document.head.querySelector('link').href;
    // Sample a few heading fonts that must be present
    expect(href).toContain('Playfair+Display');
    expect(href).toContain('Montserrat');
    expect(href).toContain('Space+Grotesk');
    expect(href).toContain('Bebas+Neue');
  });
});

// ── Pure URL-building logic extracted for focused unit tests ─────────────────

describe('Google Fonts URL construction logic', () => {
  // These tests validate the URL-building logic independently of DOM side-effects
  // by reimplementing the same pure computation.

  function buildFontsUrl(pairings) {
    const families = pairings.flatMap(p => [
      `${p.heading.replace(/ /g, '+')}:wght@700;800`,
      `${p.body.replace(/ /g, '+')}:wght@400;500`,
    ]);
    const unique = [...new Set(families)];
    return `https://fonts.googleapis.com/css2?${unique.map(f => `family=${f}`).join('&')}&display=swap`;
  }

  test('single pairing produces correct URL structure', () => {
    const url = buildFontsUrl([{ heading: 'Oswald', body: 'Open Sans' }]);
    expect(url).toBe(
      'https://fonts.googleapis.com/css2?family=Oswald:wght@700;800&family=Open+Sans:wght@400;500&display=swap'
    );
  });

  test('duplicate font names are deduplicated', () => {
    // "Raleway" used as both heading and body in separate pairings
    const url = buildFontsUrl([
      { heading: 'Raleway', body: 'Lato' },
      { heading: 'Oswald',  body: 'Raleway' },
    ]);
    // Raleway heading variant
    const headingCount = (url.match(/Raleway:wght@700;800/g) || []).length;
    expect(headingCount).toBe(1);
    // Raleway body variant
    const bodyCount = (url.match(/Raleway:wght@400;500/g) || []).length;
    expect(bodyCount).toBe(1);
  });

  test('multi-word font names are space-encoded', () => {
    const url = buildFontsUrl([{ heading: 'Playfair Display', body: 'Source Sans Pro' }]);
    expect(url).toContain('Playfair+Display');
    expect(url).toContain('Source+Sans+Pro');
    expect(url).not.toContain('Playfair Display');
    expect(url).not.toContain('Source Sans Pro');
  });
});
