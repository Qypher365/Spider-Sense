# Spider-Sense

**Browser Privacy Guard**

Detects when websites ask for more personal data than they need — and explains why, in plain English.

Built at **IEEE RAS HackVerse** as a 24-hour prototype.

---

## The problem

Websites routinely ask for more personal information than the service actually requires — a resume builder asking for your Government ID, a newsletter signup asking for your date of birth. Most users have no way to tell which requests are reasonable and which aren't.

**Spider-Sense** watches forms as you fill them, scores how risky each requested field is, and explains — in one or two plain sentences — whether the request makes sense for that site.

## How it works

1. **Detect** — the browser extension inspects the DOM of any form on the page
2. **Classify** — detected fields are sent to the backend and classified by type
3. **Assess sensitivity** — each field is scored low / medium / high / critical
4. **Check context** — is this field reasonable for what the page is actually asking you to do?
5. **Calculate risk** — an overall privacy score and risk level for the whole form
6. **Explain** — a rule-based explanation engine turns the score and per-field reasoning into a short, human-readable summary and recommendation

```
Extension (DOM Inspection)
        ↓
Backend Rule Engine (Classify → Sensitivity → Context → Score)
        ↓
Explanation Engine (templates field notes into plain-English summary/evidence/recommendation)
        ↓
Dashboard (risk score, sensitivity matrix, explanation)
```

## Tech stack

- **Extension:** Chrome MV3, content scripts
- **Backend:** Python, FastAPI, rule-based classification/scoring/explanation
- **Dashboard:** Next.js

## Project structure

| Folder | What's in it |
|---|---|
| [`extension/`](./extension/README.md) | Chrome MV3 extension — detects form fields, sends them to the backend |
| [`backend/`](./backend/README.md) | FastAPI service — rule-based classification, sensitivity/context scoring, explanation engine |
| [`dashboard/`](./dashboard/README.md) | Next.js dashboard — visualizes the risk score and explanation |
| [`data/`](./data) | Sample scan payloads used for testing and demos |
| [`docs/`](./docs) | Architecture notes, demo flow, screenshots |

Each subfolder has its own README with setup instructions specific to that part.

## Getting started

Clone the repo, then follow the setup steps in each part:

```bash
git clone https://github.com/Qypher365/Spider-Sense.git
cd Spider-Sense
```

1. [Set up the backend](./backend/README.md)
2. [Set up the dashboard](./dashboard/README.md)
3. [Load the extension](./extension/README.md)

## Team — Team Qubit

Shlok · Himanshu · Sameer · Swastik · Divyansh

| Area | Owner(s) |
|---|---|
| Browser extension | Shlok, Himanshu |
| Detection & risk engine | Sameer, Divyansh |
| Backend | Shlok, Himanshu |
| Explanation logic | Sameer, Divyansh |
| Dashboard & experience | Swastik |

## License

MIT — see [LICENSE](./LICENSE).
