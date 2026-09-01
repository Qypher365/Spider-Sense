# Spider-Sense — Backend

FastAPI service that receives detected form fields from the extension, runs them through the rule engine (classification → sensitivity → context → scoring), and generates a plain-English explanation from the results — no external AI/LLM calls, purely rule-based.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Run the server:

```bash
uvicorn main:app --reload
```

> **Note:** confirm whether your app object lives in `backend/main.py` or `backend/app/main.py` and adjust the command above accordingly (e.g. `uvicorn app.main:app --reload`) — check whichever one actually defines the FastAPI `app` instance.

## Folder structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app + routes
│   ├── models.py        # Pydantic request/response models
│   ├── classifier.py    # Field type classification
│   ├── sensitivity.py   # Sensitivity scoring per field
│   ├── rules.py         # Context/reasonableness rules
│   ├── scorer.py        # Overall score + risk_level calculation
│   └── utils.py         # Shared helpers
├── tests/
│   ├── test_scan.py
│   ├── test_classifier.py
│   └── test_scorer.py
├── mock/
│   ├── safe.json          # Sample scan response (low risk)
│   ├── medium.json        # Sample scan response (medium risk)
│   └── critical.json      # Sample scan response (critical risk)
```

## Explanation engine

Once the rule engine produces `overall_score`, `risk_level`, and `field_results`, a small formatting function builds the `explanation` object merged into the final response:

- `summary` — restates `overall_score` and `risk_level` in plain language
- `evidence` — one line per field, prioritizing fields where `reasonable: false` or `sensitivity` is high/critical, built directly from that field's `notes`
- `recommendation` — a short actionable sentence (e.g. "Decline the Government ID field")

This is deterministic template logic, not a live AI/LLM call — no external API, no network dependency, no retry/fallback handling needed. See [`docs/ai-input-output-plan.md`](../docs/ai-input-output-plan.md) for the full field-by-field mapping rules.

## Testing

```bash
pytest tests/
```

Use the sample payloads in [`data/`](../data) to test the full pipeline against known safe/medium/critical scenarios without needing a live extension.
