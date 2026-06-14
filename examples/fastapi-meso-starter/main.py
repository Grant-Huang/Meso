"""Minimal FastAPI Meso SSE starter."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from fastapi import FastAPI, Request
from pydantic import BaseModel

# Allow importing meso-py from repo tools/
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'tools' / 'meso-py'))

from meso import meso_sse_handler  # noqa: E402

app = FastAPI(title='Meso FastAPI Starter')


class ChatBody(BaseModel):
    session_id: str
    message: str


def sse_line(event_type: str, payload: dict) -> str:
    return (
        'data: '
        + json.dumps({
            'type': event_type,
            'schema_version': '1.0',
            'payload': payload,
        }, ensure_ascii=False)
        + '\n\n'
    )


@app.post('/api/chat/stream')
@meso_sse_handler
async def chat_stream(request: Request, body: ChatBody):
    yield sse_line('phase', {'id': 'understand', 'name': '理解需求', 'state': 'running'})
    yield sse_line('think', {'delta': f'用户说：{body.message}'})
    yield sse_line('phase', {'id': 'understand', 'name': '理解需求', 'state': 'done'})
    yield sse_line('text', {'delta': f'收到（session={body.session_id}）：{body.message}'})
    yield sse_line('done', {})


class ToolConfirmBody(BaseModel):
    tool_call_id: str
    approved: bool
    session_id: str | None = None


@app.post('/api/tools/confirm')
async def tools_confirm(body: ToolConfirmBody):
    return {
        'status': 'success',
        'data': {
            'tool_call_id': body.tool_call_id,
            'approved': body.approved,
            'session_id': body.session_id,
        },
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
