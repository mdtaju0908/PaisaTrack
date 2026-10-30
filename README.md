# PaisaTrack — Smart Daily Expense Manager

A responsive, mobile-friendly daily expense and friends ledger built with HTML, CSS and vanilla JavaScript. It stores data locally first and can sync transaction records with the Google Spreadsheet supplied for this project.

## Project structure

```text
PaisaTrack/
├── index.html
├── styles.css
├── app.js
├── google-apps-script/
│   └── Code.gs
└── README.md
```

## Features

- Dashboard with monthly totals for personal, friend and shared expenses.
- Add, edit and delete expense records with item, date, category, payer, person and notes.
- Friends register and person-wise spending comparison.
- Monthly overall and category budgets with progress/over-budget indicators.
- Spending trend, category split, quick insights and reports.
- Transaction search, type/category/month filters.
- CSV export and complete JSON backup/restore.
- Local-first storage so the app works without a backend.
- Optional Google Sheets sync for transaction rows using Apps Script.
- Responsive layout for phones and desktops.

## Run locally

Open `index.html` in a modern browser. For local development, from this directory run:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Connect the supplied Google Sheet

Target spreadsheet:

`https://docs.google.com/spreadsheets/d/1IQwbDOfB_Ffu89w16mv_Xl4MIvpRD2V8_li8XJuFcRg/edit`

1. Open the spreadsheet and select **Extensions → Apps Script**.
2. Replace the editor content with `google-apps-script/Code.gs` and save.
3. Select **Deploy → New deployment → Web app**.
4. Choose **Execute as: Me** and choose the most restrictive access setting that still works for your use.
5. Deploy and complete Google's authorization prompts.
6. Copy the web-app URL ending in `/exec`.
7. Open PaisaTrack → **Settings & data**, paste the `/exec` URL, select **Save connection**, then **Test connection**.
8. Select **Sync now** to reconcile this browser's data with the sheet.

The script creates a `Transactions` tab with the following columns:

`id, date, item, amount, type, person, category, paidBy, notes, createdAt, updatedAt`

## Important security and sync limitations

This is a static frontend. It cannot keep a shared credential secret, and the Apps Script example does not implement per-user authentication. If deployed with public/"Anyone" access, someone who obtains its URL may be able to read and modify the ledger. Do not put sensitive financial details behind a public endpoint. For private multi-device use, put an authenticated service (for example, Firebase or Supabase with strict user-level rules) between the browser and data store.

Apps Script ContentService may redirect responses; browser CORS and Google sign-in behaviour depend on deployment and browser configuration. The frontend sends a `text/plain` JSON POST to avoid a common preflight, but this is not a guarantee. Always use **Test connection** after deployment. Local browser storage is device/browser-specific. The manual sync merges missing rows by ID; it is not a multi-user conflict-resolution system and deletions made offline on another device are not tombstoned. Keep JSON backups.

## GitHub Pages

Push the contents of this folder to the repository root. In GitHub, open **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save. GitHub will show the public Pages URL after deployment.
