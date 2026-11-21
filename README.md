DROPDEX EDITORIAL REDESIGN — 13 PAGES

This is a structural editorial redesign, not a palette-only reskin.
Homepage, Investigation, and Archive are the previously approved distinct layouts.
Other 10 pages have new full-width editorial heroes, cyan oscilloscope graphics, and rebuilt shared layout CSS while retaining existing JS and forms.

Deployment: copy all HTML/CSS/JS and assets/logos into the GitHub Pages repository. Keep existing assets/ and data/ folders. The included data/archive.json is the provided archive. Arena also requires your original battle CSVs under data/. The trading card and cover art paths in JSON require their original assets.

Run a local HTTP server (python3 -m http.server 8000) and open http://localhost:8000. Do not open file:// because fetch requests will fail. Test all pages and forms before production deployment.


## Balanced Neon update (November 2026)

Every HTML page now imports `balanced-neon.css` as the final stylesheet.
The original editorial HTML, data loading, battle logic, navigation and form actions remain in place.
Green (#BAFF59) leads; cyan (#00E5FF) signals data, hover and focus; pink (#FF3D9A) marks Arena, rarity and selected editorial details.

To tune the colors globally, edit the three CSS variables at the top of `balanced-neon.css`.
To revert this color pass, remove the `balanced-neon.css` link from each HTML page.

Test through a web server, not by opening HTML directly from disk, because archive JSON and battle CSVs are loaded with fetch/PapaParse.
