# GitHub Pages preparation — 2026-10-15

This portfolio is static HTML/CSS/JavaScript with local assets and no required backend. Internal links are relative, supporting a GitHub project subpath. Production publishes the `main` branch at `/` with `.nojekyll`; no custom workflow authorization or backend is required. `docs/pages-workflow.example.yml` is an inactive optional alternative.

Run `node scripts/audit-pages.cjs` before publication. The current audit finds approximately 703 MB of runtime files including CV and local PDF.js, below the documented 1 GB Pages limit. The unfiltered asset collection is approximately 1.10 GB: do not deploy the workspace wholesale. `node scripts/build-pages.cjs` stages the audited runtime into a new `dist` directory; it stops on missing assets rather than publishing broken pages.

Confirmed requirements:
- Original CV is `assets/cv.pdf`, copied unchanged and SHA-256 verified, rendered by local PDF.js on desktop and mobile.
- Public repository: `Kiran-ZQR/kiranzhang-portfolio`, explicitly approved by the user.
- Standard GitHub CLI device authorization is complete. The system proxy is used for CLI networking in this environment. Credentials and local browser profiles are outside this repository and never published.

The public repository is https://github.com/Kiran-ZQR/kiranzhang-portfolio. Final public URL validation must follow a successful deployment; a prepared local build alone is not evidence that the site is live.

The opening uses the supplied billboard reference's right panel through an SVG viewport and color filter. No generated alternative motif is used. The logo and original copy are outside the displayed viewport, replaced by HTML copy and a direct-entry button. No automatic timeout or fade is applied. Source references remain subject to their original rights and are not covered by the template's code license.

References: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits and https://github.com/actions/starter-workflows/blob/main/pages/static.yml
