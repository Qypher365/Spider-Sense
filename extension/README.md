# Spider-Sense — Browser Extension

Chrome MV3 extension that inspects the DOM of any form on a page, extracts field metadata, and sends it to the backend for scoring.

## Folder structure

```
extension/
├── manifest.json      # MV3 manifest — permissions, content script registration
├── src/
│   ├── content.js       # Runs on the page, detects form fields
│   ├── popup.html       # Extension popup UI
│   ├── popup.js         # Popup logic — triggers scan, displays result
│   └── styles.css       # Popup styling
```

## How it works

1. `content.js` runs on the page and inspects the DOM for form fields (inputs, labels, placeholders, ARIA attributes).
2. For each field it builds a `field_id` (`name|type|position`, e.g. `"email|email|1"`) and records its `label`, `label_source` (in order of confidence: `label_for` → `aria_label` → `placeholder` → `nearby_text` → `none`), `type`, `placeholder`, `autocomplete`, and `required` state.
3. This payload — along with the page `url`, `page_title`, and `scan_timestamp` — is sent to the backend's `POST /api/scan` endpoint (see [`docs/api-contract.md`](../docs/api-contract.md) for the exact shape).
4. The backend's response (score, risk level, per-field reasoning, and a rule-based explanation) is displayed in `popup.html`. Since there's no external AI/LLM call involved, the response should return quickly and consistently.

## Loading the extension locally

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/` folder

## Pointing at the backend

Make sure `content.js`/`popup.js` point at the correct backend URL:
- Local development: `http://localhost:8000/api/scan` (or whatever port your FastAPI server runs on)
- Deployed: your production backend URL

Update this before testing against a deployed backend, and again before the final demo if the deployed URL changes.

## Demo fallback

If the extension itself fails during a live demo, use the dashboard's manual **Demo Scan** option instead (see [`docs/demo-flow.md`](../docs/demo-flow.md)) — this bypasses the extension and lets you show the backend + explanation directly using one of the sample payloads in `data/`.
