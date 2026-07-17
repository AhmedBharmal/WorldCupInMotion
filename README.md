# WorldCupInMotion

## Structure

- `wc26_full_optimized.html` - main page
- `css/` - styles
- `js/` - app logic and data
- `assets/images/brand/` - favicon and hero/trophy images
- `assets/images/history/` - World Cup history card images
- `api/fd.js` - football-data.org proxy for deployed hosting

## Live API

Set `FOOTBALL_DATA_TOKEN` or `FD_API_TOKEN` before running or deploying. The app calls `/api/fd`, which proxies football-data.org without exposing the token in the browser.
