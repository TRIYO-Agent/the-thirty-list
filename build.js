// Zero-dependency static site builder. Run: node build.js  -> outputs ./dist
const fs = require("fs");
const path = require("path");
const cfg = require("./site.config.js");
const products = require("./products.js");

const OUT = path.join(__dirname, "dist");
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const REL = "sponsored nofollow noopener";
const CATEGORIES = ["Audio", "Charging", "Smart Home", "Everyday Carry", "Desk", "TV", "Gaming", "Travel", "Kitchen", "Fun Gadgets"];
const BANDS = ["Under $15", "Under $20", "Under $30", "Sale pick"];
const BAND_ORDER = Object.fromEntries(BANDS.map((b, i) => [b, i]));
const byId = Object.fromEntries(products.map((p) => [p.id, p]));

for (const p of products) {
  if (p.asin) {
    if (!/^[A-Z0-9]{10}$/.test(p.asin)) throw new Error("Bad ASIN for " + p.id);
  } else if (!p.search) {
    throw new Error("Need asin or search for " + p.id);
  }
  if (!CATEGORIES.includes(p.category)) throw new Error("Bad category for " + p.id);
  if (!BANDS.includes(p.band)) throw new Error("Bad band for " + p.id);
  if (!fs.existsSync(path.join(__dirname, "static/img", p.img + ".webp"))) throw new Error("Missing image for " + p.id);
}

const amazonUrl = (asin) => `${cfg.amazonDomain}/dp/${encodeURIComponent(asin)}?tag=${encodeURIComponent(cfg.amazonTag)}`;
const searchUrl = (q) => `${cfg.amazonDomain}/s?k=${encodeURIComponent(q)}&tag=${encodeURIComponent(cfg.amazonTag)}`;
const productUrl = (p) => p.asin ? amazonUrl(p.asin) : searchUrl(p.search);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function card(p, i, why) {
  const href = productUrl(p);
  return `<li class="gift" data-cat="${esc(slug(p.category))}" data-band="${esc(slug(p.band))}" data-order="${i}" data-bandorder="${BAND_ORDER[p.band]}">
  <a class="gift-img" href="${esc(href)}" rel="${REL}" target="_blank" tabindex="-1" aria-hidden="true"><img src="/img/${p.img}.webp" srcset="/img/${p.img}-sm.webp 480w, /img/${p.img}.webp 1024w" sizes="(max-width: 640px) 100vw, 360px" width="1024" height="768" alt="" loading="${i < 3 ? "eager" : "lazy"}" decoding="async"></a>
  <div class="gift-body">
    <div class="chips"><span class="chip cat">${esc(p.category)}</span><span class="chip band${p.band === "Sale pick" ? " sale" : ""}">${esc(p.band)}</span></div>
    <h3>${esc(p.name)}</h3>
    <p class="who">${esc(p.who)}</p>
    <p>${esc(why || p.note)}</p>
    <a class="btn" href="${esc(href)}" rel="${REL}" target="_blank">Check price on Amazon<span class="sr-only"> for ${esc(p.name)} (opens in a new tab)</span></a>
    <p class="imgnote">Illustrative image, not the actual product.</p>
  </div>
</li>`;
}

const nav = [["/", "Gifts"], ["/guides/", "Guides"], ["/about/", "About"], ["/affiliate-disclosure/", "Disclosure"]];

function itemListLd({ name, description, url, items }) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  })}</script>`;
}

function layout({ title, description, urlPath, body, noindex, jsonLd, ogType }) {
  const fullTitle = urlPath === "/" ? `${cfg.siteName}: ${cfg.tagline}` : `${title} | ${cfg.siteName}`;
  const canonical = cfg.baseUrl + urlPath;
  const navCurrent = (h) => h === urlPath || (h === "/guides/" && urlPath.startsWith("/guides/"));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(canonical)}">`}
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="${esc(ogType || "website")}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${cfg.baseUrl}/img/airtag.webp">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#14532d">
<meta name="p:domain_verify" content="a7a8d27a7f784c9b9b20487982c3f153"/>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/styles.css?v=2">
${jsonLd || ""}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="topnote" role="note">${esc(cfg.disclosure)} <a href="/affiliate-disclosure/">Learn more</a></div>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/"><span class="badge" aria-hidden="true">30</span><span>${esc(cfg.siteName)}</span></a>
    <nav aria-label="Main"><ul>${nav.map(([h, l]) => `<li><a href="${h}"${navCurrent(h) ? ' aria-current="page"' : ""}>${l}</a></li>`).join("")}</ul></nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <p><strong>Affiliate disclosure:</strong> ${esc(cfg.disclosure)} It never changes which gifts make the list. <a href="/affiliate-disclosure/">Full disclosure</a>.</p>
    <p>${esc(cfg.priceNote)} Product images on this site are illustrations, not photos of the actual products.</p>
    <p class="muted">${esc(cfg.siteName)} is an independent site and is not affiliated with, endorsed by or sponsored by Amazon or any brand listed here. Brand names are trademarks of their owners.</p>
    <ul class="footer-links"><li><a href="/">Gifts</a></li><li><a href="/guides/">Gift guides</a></li><li><a href="/about/">About</a></li><li><a href="/affiliate-disclosure/">Affiliate Disclosure</a></li><li><a href="/privacy/">Privacy Policy</a></li></ul>
    <p class="muted">&copy; ${new Date(cfg.published).getFullYear()} ${esc(cfg.siteName)}</p>
  </div>
</footer>
${urlPath === "/" ? '<script src="/filter.js" defer></script>' : ""}
</body>
</html>`;
}

function write(urlPath, html) {
  const file = urlPath.endsWith("/") ? path.join(OUT, urlPath, "index.html") : path.join(OUT, urlPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

const guides = fs.readdirSync(path.join(__dirname, "content/guides")).filter((f) => f.endsWith(".js")).map((f) => require(path.join(__dirname, "content/guides", f))).sort((a, b) => (a.order || 99) - (b.order || 99));
for (const g of guides) {
  if (!g.slug || !g.title || !g.description || !g.intro || !Array.isArray(g.picks) || !g.picks.length) throw new Error("Incomplete guide: " + (g.slug || "unknown"));
  for (const pick of g.picks) {
    if (!byId[pick.id]) throw new Error("Unknown product " + pick.id + " in guide " + g.slug);
  }
}

const guideCard = (g) => `<li><a href="/guides/${g.slug}/"><h3>${esc(g.title)}</h3><p>${esc(g.description)}</p></a></li>`;

const urls = [];

// Home
const chip = (group, value, label, pressed) => `<button type="button" class="fbtn" data-group="${group}" data-value="${value}" aria-pressed="${pressed}">${esc(label)}</button>`;
const home = `
<section class="hero">
  <div class="wrap">
    <p class="eyebrow">The 2026 holiday list</p>
    <h1>Tech gifts under $30 that people actually want.</h1>
    <p class="lede">${products.length} hand-picked gadgets from brands people trust, chosen because shoppers are really buying them this season. No filler, no junk drawer gifts.</p>
    <a class="btn btn-light" href="#gifts">See the gifts</a>
    <a class="btn btn-light" href="/guides/">Shop by person</a>
  </div>
</section>
<section class="wrap guides-tease" aria-labelledby="guides-h">
  <h2 id="guides-h">Shop by person or occasion</h2>
  <p>Short lists pulled from the same ${products.length} gifts, written for the person you are shopping for.</p>
  <ul class="guide-cards">${guides.map(guideCard).join("")}</ul>
</section>
<section id="gifts" class="wrap gifts" aria-labelledby="gifts-h">
  <div class="gifts-head">
    <h2 id="gifts-h">The list</h2>
    <p class="disclosure-inline">${esc(cfg.disclosure)} ${esc(cfg.priceNote)}</p>
  </div>
  <div class="filters" role="group" aria-label="Filter and sort gifts">
    <div class="frow"><span class="flabel" id="cat-l">Category</span><div role="group" aria-labelledby="cat-l">${chip("cat", "all", "All", true)}${CATEGORIES.map((c) => chip("cat", slug(c), c, false)).join("")}</div></div>
    <div class="frow"><span class="flabel" id="band-l">Price band</span><div role="group" aria-labelledby="band-l">${chip("band", "all", "Any", true)}${BANDS.map((b) => chip("band", slug(b), b, false)).join("")}</div></div>
    <div class="frow"><label class="flabel" for="sort">Sort</label><select id="sort"><option value="order">Our picks first</option><option value="band">Price band, low to high</option></select></div>
  </div>
  <p class="count" id="count" aria-live="polite">Showing all ${products.length} gifts.</p>
  <ul class="grid" id="grid">
${products.map(card).join("\n")}
  </ul>
  <p class="bandnote"><strong>About the price bands:</strong> bands are general guides based on each item's usual price, not live prices. "Sale pick" means the item usually costs more than $30 and only dips under it during sales. ${esc(cfg.priceNote)}</p>
</section>`;
write("/", layout({ title: cfg.siteName, description: `${products.length} tech holiday gifts under $30, from earbuds and chargers to smart plugs and stocking stuffers. Hand-picked gadgets people actually want.`, urlPath: "/", body: home }));
urls.push({ path: "/", lastmod: "2026-11-16" });

// Guides index
const indexBody = `
<div class="wrap guide">
  <p class="crumbs"><a href="/">Home</a> › Gift guides</p>
  <h1>Holiday gift guides under $30</h1>
  <p class="disclosure-inline">${esc(cfg.disclosure)} ${esc(cfg.priceNote)}</p>
  <p class="intro">Short, honest lists for the person or occasion you are shopping for, drawn from the same ${products.length} gifts on <a href="/">The Thirty List</a>. Sale picks are flagged, because those are not always under $30.</p>
  <ul class="guide-cards">${guides.map(guideCard).join("")}</ul>
</div>`;
write("/guides/", layout({
  title: "Holiday Gift Guides Under $30",
  description: "Tech gift guides under $30 for dad, college students, stocking stuffers, and Secret Santa or white elephant, all pulled from The Thirty List.",
  urlPath: "/guides/",
  body: indexBody,
}));
urls.push({ path: "/guides/", lastmod: "2026-11-16" });

// Guide pages
for (const g of guides) {
  const urlPath = `/guides/${g.slug}/`;
  const picks = g.picks.map((pick) => ({ ...byId[pick.id], why: pick.why }));
  const others = guides.filter((x) => x.slug !== g.slug);
  const hasSale = picks.some((p) => p.band === "Sale pick");
  const saleNote = hasSale ? `<p class="bandnote"><strong>About sale picks:</strong> items marked "Sale pick" usually cost more than $30 and only dip under it during sales. Check the current price before you buy.</p>` : "";
  const body = `
<div class="wrap guide">
  <p class="crumbs"><a href="/">Home</a> › <a href="/guides/">Gift guides</a> › ${esc(g.title)}</p>
  <h1>${esc(g.title)}</h1>
  <p class="disclosure-inline">${esc(cfg.disclosure)} ${esc(cfg.priceNote)}</p>
  ${g.intro}
  <h2>The picks</h2>
  <ul class="grid">
${picks.map((p, i) => card(p, i, p.why)).join("\n")}
  </ul>
  ${saleNote}
  <p class="bandnote">${esc(cfg.priceNote)} Bands are general guides based on each item's usual price, not live prices.</p>
  <h2>More gift guides</h2>
  <ul class="guide-cards">${others.map(guideCard).join("")}</ul>
  <p><a class="btn" href="/#gifts">See the full list of ${products.length} gifts</a></p>
</div>`;
  const jsonLd = itemListLd({
    name: g.title,
    description: g.description,
    url: cfg.baseUrl + urlPath,
    items: picks.map((p) => ({ name: p.name, url: productUrl(p) })),
  });
  write(urlPath, layout({ title: g.title, description: g.description, urlPath, body, jsonLd, ogType: "article" }));
  urls.push({ path: urlPath, lastmod: g.date || "2026-11-16" });
}

// Static pages
for (const f of fs.readdirSync(path.join(__dirname, "content/pages")).filter((x) => x.endsWith(".js"))) {
  const pg = require(path.join(__dirname, "content/pages", f));
  const body = `<div class="wrap page"><p class="disclosure-inline">${esc(cfg.disclosure)}</p>${pg.body}</div>`;
  write(pg.path, layout({ title: pg.title, description: pg.description, urlPath: pg.path, body, noindex: pg.noindex }));
  if (!pg.noindex) urls.push({ path: pg.path, lastmod: cfg.published });
}

// Static assets
for (const f of fs.readdirSync(path.join(__dirname, "static"))) {
  const src = path.join(__dirname, "static", f);
  if (fs.statSync(src).isDirectory()) fs.cpSync(src, path.join(OUT, f), { recursive: true });
  else fs.copyFileSync(src, path.join(OUT, f));
}

fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${cfg.baseUrl}${u.path}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${cfg.baseUrl}/sitemap.xml\n`);
console.log(`Built ${urls.length} indexed pages with ${products.length} gifts and ${guides.length} guides into dist/`);
