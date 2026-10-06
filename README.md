# Manage Products prototype

React + MUI + AG Grid prototype of the Manage Products modal (Mapping, Schedule, Product Family). Developers: start with `docs/HANDOVER.md`. See `CLAUDE.md` for behaviour rules, terminology and layout numbers.

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # static build in dist/
npm run build:artifact # single app.js + index.html for a claude.ai artifact
```

All data is in memory (`src/data/initialDb.js`). Styling lives in `src/theme/mpTheme.js` (PRIZM 3.0 dark theme plus product layer).
