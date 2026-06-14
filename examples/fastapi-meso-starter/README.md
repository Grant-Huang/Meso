# FastAPI Meso Starter

Minimal runnable backend emitting Meso v1.0 SSE events.

```bash
cd examples/fastapi-meso-starter
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

Endpoints:
- `POST /api/chat/stream` — Meso SSE stream
- `POST /api/tools/confirm` — tool confirmation channel

Uses `@meso_sse_handler` from `tools/meso-py` for disconnect cleanup.
