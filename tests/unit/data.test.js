/**
 * Data Integrity Tests — PAIRINGS & CATEGORIES
 *
 * These tests guard against silent breakage in the static data that drives
 * the whole app.  They require no component rendering and run in plain Node.
 *
 * NOTE: Once the app is split into proper modules, replace the inline
 * definitions below with:
 *   import { PAIRINGS, CATEGORIES } from '../../src/data';
 */

// ── Inline copies of the production data (kept in sync with index.html) ──────

const PAIRINGS = [
  { id:1,  heading:'Playfair Display',    body:'Lato',            category:'Serif',      tag:'Editorial',      free:true,  desc:'Classic and authoritative. Perfect for magazines, luxury brands, and editorial content.' },
  { id:2,  heading:'Montserrat',          body:'Merriweather',    category:'Sans-Serif', tag:'Modern Classic',  free:true,  desc:'A timeless combination for blogs, portfolios, and professional websites.' },
  { id:3,  heading:'Oswald',              body:'Open Sans',       category:'Display',    tag:'Bold Impact',    free:true,  desc:'High contrast and punchy. Great for sports, news sites, and bold brands.' },
  { id:4,  heading:'Raleway',             body:'Source Sans Pro', category:'Sans-Serif', tag:'Clean Tech',     free:true,  desc:'Elegant and functional. Ideal for SaaS products and tech startups.' },
  { id:5,  heading:'Roboto Slab',         body:'Roboto',          category:'Serif',      tag:'Versatile',      free:true,  desc:'A Google classic. Works across virtually any project or industry.' },
  { id:6,  heading:'Libre Baskerville',   body:'Libre Franklin',  category:'Serif',      tag:'Professional',   free:true,  desc:'Trustworthy and structured. Perfect for corporate, legal and financial content.' },
  { id:7,  heading:'DM Serif Display',    body:'DM Sans',         category:'Serif',      tag:'System Harmony', free:false, desc:'Designed as a matched system. Beautiful harmony between display and UI type.' },
  { id:8,  heading:'Cormorant Garamond',  body:'Proza Libre',     category:'Serif',      tag:'Luxury',         free:false, desc:'Refined and aristocratic. Exceptional for luxury fashion and high-end beauty brands.' },
  { id:9,  heading:'Abril Fatface',       body:'Poppins',         category:'Display',    tag:'Playful Pop',    free:false, desc:'Fun and energetic. Great for creative agencies and youthful consumer brands.' },
  { id:10, heading:'Space Grotesk',       body:'Space Mono',      category:'Monospace',  tag:'Tech',           free:false, desc:'Futuristic and technical. Perfect for developer tools, crypto, and fintech projects.' },
  { id:11, heading:'Fraunces',            body:'Commissioner',    category:'Serif',      tag:'Contemporary',   free:false, desc:'Warm and contemporary. Outstanding for food, hospitality, and lifestyle brands.' },
  { id:12, heading:'Spectral',            body:'Karla',           category:'Serif',      tag:'Literary',       free:false, desc:'Intellectual and clear. Ideal for publishing, essays, and long-form reading experiences.' },
  { id:13, heading:'Crimson Pro',         body:'Cabin',           category:'Serif',      tag:'Academic',       free:false, desc:'Scholarly yet approachable. Perfect for education and academic platforms.' },
  { id:14, heading:'Josefin Sans',        body:'Josefin Slab',    category:'Display',    tag:'Geometric',      free:false, desc:'Perfectly geometric symmetry. A unique and cohesive typeface pairing system.' },
  { id:15, heading:'Nunito',              body:'Nunito Sans',     category:'Sans-Serif', tag:'Friendly',       free:false, desc:'Rounded and welcoming. Ideal for apps, dashboards, and B2C SaaS products.' },
  { id:16, heading:'Syne',               body:'Jost',             category:'Display',    tag:'Avant-Garde',    free:false, desc:'Experimental and distinctive. For bold creative studios and art platforms.' },
  { id:17, heading:'Arvo',               body:'PT Sans',          category:'Serif',      tag:'Sturdy',         free:false, desc:'Reliable and highly legible. Works well for news sites and long-form content.' },
  { id:18, heading:'Bitter',             body:'Raleway',          category:'Serif',      tag:'News',           free:false, desc:'Crisp and journalistic. Great for editorial and news publications.' },
  { id:19, heading:'Bebas Neue',         body:'Hind',             category:'Display',    tag:'Street Bold',    free:false, desc:'Strong and impactful. Perfect for fitness brands, events, and streetwear.' },
  { id:20, heading:'Playfair Display SC',body:'Alice',            category:'Serif',      tag:'Vintage',        free:false, desc:'Elegant small caps with timeless body type. Exceptional for weddings and stationery.' },
];

const CATEGORIES = ['All', 'Serif', 'Sans-Serif', 'Display', 'Monospace'];

// ─────────────────────────────────────────────────────────────────────────────

describe('PAIRINGS data integrity', () => {
  const REQUIRED_FIELDS = ['id', 'heading', 'body', 'category', 'tag', 'free', 'desc'];

  test('has exactly 20 pairings', () => {
    expect(PAIRINGS).toHaveLength(20);
  });

  test('has exactly 6 free pairings', () => {
    const freePairings = PAIRINGS.filter(p => p.free);
    expect(freePairings).toHaveLength(6);
  });

  test('has exactly 14 pro (non-free) pairings', () => {
    const proPairings = PAIRINGS.filter(p => !p.free);
    expect(proPairings).toHaveLength(14);
  });

  test('every pairing has all required fields', () => {
    PAIRINGS.forEach(p => {
      REQUIRED_FIELDS.forEach(field => {
        expect(p).toHaveProperty(field);
      });
    });
  });

  test('every pairing has a non-empty heading and body', () => {
    PAIRINGS.forEach(p => {
      expect(p.heading.trim()).not.toBe('');
      expect(p.body.trim()).not.toBe('');
    });
  });

  test('every pairing has a non-empty desc', () => {
    PAIRINGS.forEach(p => {
      expect(p.desc.trim().length).toBeGreaterThan(10);
    });
  });

  test('IDs are unique and sequential from 1 to 20', () => {
    const ids = PAIRINGS.map(p => p.id);
    expect(ids).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);
  });

  test('every category value exists in the CATEGORIES list', () => {
    const validCategories = new Set(CATEGORIES.filter(c => c !== 'All'));
    PAIRINGS.forEach(p => {
      expect(validCategories).toContain(p.category);
    });
  });

  test('free field is a boolean on every pairing', () => {
    PAIRINGS.forEach(p => {
      expect(typeof p.free).toBe('boolean');
    });
  });

  test('heading and body font names contain no leading/trailing whitespace', () => {
    PAIRINGS.forEach(p => {
      expect(p.heading).toBe(p.heading.trim());
      expect(p.body).toBe(p.body.trim());
    });
  });

  test('no duplicate heading+body combinations', () => {
    const keys = PAIRINGS.map(p => `${p.heading}||${p.body}`);
    const unique = new Set(keys);
    expect(unique.size).toBe(PAIRINGS.length);
  });

  test('all Monospace pairings are pro-only', () => {
    // Monospace is a niche category — should only appear in pro tier
    const monoFree = PAIRINGS.filter(p => p.category === 'Monospace' && p.free);
    expect(monoFree).toHaveLength(0);
  });
});

describe('CATEGORIES list', () => {
  test('starts with "All" as the first entry', () => {
    expect(CATEGORIES[0]).toBe('All');
  });

  test('contains the four expected style categories', () => {
    expect(CATEGORIES).toContain('Serif');
    expect(CATEGORIES).toContain('Sans-Serif');
    expect(CATEGORIES).toContain('Display');
    expect(CATEGORIES).toContain('Monospace');
  });

  test('has no duplicate entries', () => {
    expect(new Set(CATEGORIES).size).toBe(CATEGORIES.length);
  });

  test('every PAIRINGS category is represented in CATEGORIES', () => {
    const pairingCategories = new Set(PAIRINGS.map(p => p.category));
    pairingCategories.forEach(cat => {
      expect(CATEGORIES).toContain(cat);
    });
  });
});
