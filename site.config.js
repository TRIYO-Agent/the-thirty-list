// Site-wide settings. Edit here; every page picks these up on the next build.
module.exports = {
  siteName: "The Thirty List",
  tagline: "Tech holiday gifts under $30 that people actually want",
  // Live URL, no trailing slash. Used for canonical links and the sitemap.
  baseUrl: process.env.SITE_URL || "https://the-thirty-list.onrender.com",
  amazonTag: "dial54-20",
  amazonDomain: "https://www.amazon.com",
  disclosure: "As an Amazon Associate I earn from qualifying purchases.",
  priceNote: "Prices change often, especially during holiday sales. Check Amazon for the current price before you buy.",
  published: "2026-11-11",
};
