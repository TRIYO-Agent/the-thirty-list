# The Thirty List

Static affiliate site: tech holiday gifts under $30. Zero dependencies.

- Build: `node build.js` writes `dist/`.
- Gifts live in `products.js`. Images in `static/img` are generated, unbranded illustrations (full + `-sm`).
- Site settings (name, base URL, Amazon tag, disclosure) in `site.config.js`.
- Rules: every Amazon link uses `?tag=dial54-20` and `rel="sponsored nofollow noopener"`; the disclosure shows on every page; no Amazon prices, ratings or images.
- Hosted as a Render static site; pushes to `main` auto-deploy.
