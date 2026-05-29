# DAG 工作流可观测性

Meso 通过 `workflow_node` 事件为后端 DAG 工作流提供**开发者可观测性**。平台不内置执行引擎——后端的 LangGraph、Temporal 或自研调度器通过现有 SSE 出口推送节点状态，Meso 负责接收、聚合和渲染。

---

## 两层信号的分工

| 信号 | 事件类型 | 受众 | 示例 |
|------|---------|------|------|
| 粗粒度阶段 | `stage` | **用户** | "召回记忆"、"搜索网络"、"生成回复" |
| 细粒度节点 | `workflow_node` | **开发者** | `intent_router`、`web_search`、`fetch_batch_3` |

两种信号完全独立，可以同时使用，也可以只用其中一个。`stage` 驱动用户可见的 `StageTimeline`；`workflow_node` 驱动开发者可见的 `WorkflowTimeline`，默认不向终端用户展示。

---

## workflow_node 事件

### 基本格式

```json
{
  "type": "workflow_node",
  "schema_version": "1.0",
  "payload": {
    "run_id":     "run-abc123",
    "node_id":    "n_web_search",
    "parent_id":  "n_router",
    "name":       "web_search",
    "state":      "done",
    "started_at": 1700000000000,
    "duration_ms": 312,
    "metadata": {
      "url":   "https://example.com",
      "chars": 4200
    }
  }
}
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `run_id` | ✅ | 标识同一次工作流执行，同一 run 的所有节点共享 |
| `node_id` | ✅ | run 内的唯一节点标识 |
| `parent_id` | ❌ | 父节点 id，表达树形/子图层级。省略或 null = 根节点 |
| `name` | ✅ | 开发者可读的节点名（对应代码中的函数、节点、步骤名） |
| `state` | ✅ | `"active"` \| `"done"` \| `"error"` \| `"skipped"` |
| `started_at` | ❌ | Unix ms 时间戳，节点开始时 |
| `duration_ms` | ❌ | 耗时（毫秒），done / error 时携带 |
| `metadata` | ❌ | 任意领域数据（输入摘要、URL、错误详情等） |

### 节点状态机

```
active ──► done      正常完成
active ──► error     执行失败
active ──► skipped   条件分支跳过
```

同一 `node_id` 可收到多次事件（`active` 后跟 `done`），后到事件原地覆盖，`nodeOrder` 不重复追加。

---

## 树形结构与 run_id

### 单次 run（线性 + 树形子步骤）

```
stage: "搜索网络" → active
  [workflow_node] intent_router    → active → done (42ms)
  [workflow_node] web_search       → active
      [workflow_node] fetch_batch_1  → active → done (310ms)
      [workflow_node] fetch_batch_2  → active → error (205ms)
  [workflow_node] web_search       → done (520ms)
stage: "搜索网络" → done
```

`fetch_batch_1` 和 `fetch_batch_2` 的 `parent_id` 都指向 `web_search`，前端自动渲染为缩进子节点。

### 多个 run（并行子图）

单次响应可包含多个 `run_id`，适用于并行子图（如同时发起多个数据源查询）：

```json
{ "run_id": "run-main",  "node_id": "n1", "name": "orchestrator", "state": "active" }
{ "run_id": "run-sub-a", "node_id": "s1", "name": "db_query",     "state": "active" }
{ "run_id": "run-sub-b", "node_id": "s2", "name": "api_call",     "state": "active" }
{ "run_id": "run-sub-a", "node_id": "s1", "name": "db_query",     "state": "done",  "duration_ms": 88 }
{ "run_id": "run-sub-b", "node_id": "s2", "name": "api_call",     "state": "done",  "duration_ms": 211 }
{ "run_id": "run-main",  "node_id": "n1", "name": "orchestrator", "state": "done",  "duration_ms": 250 }
```

`WorkflowTimeline` 按 `workflowRunOrder`（首次出现顺序）分组渲染每个 run。

---

## 前端：WorkflowTimeline 组件

### 基本用法

```tsx
import { WorkflowTimeline } from '@meso.ai/ui'
import { useSSEStream } from '@meso.ai/ui'

function DevPanel() {
  const { state } = useSSEStream('/api/chat/stream')
  const runs = state.workflowRunOrder.map(id => state.workflowRuns[id])

  if (runs.length === 0) return null

  return (
    <aside className="dev-panel">
      <h4>工作流节点</h4>
      <WorkflowTimeline runs={runs} />
    </aside>
  )
}
```

### Props

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| `runs` | `WorkflowRunState[]` | — | 要渲染的 run 列表，建议按 `workflowRunOrder` 顺序传入 |
| `showRunId` | `boolean` | `true` | 多 run 时是否显示 run_id 标签 |

### 视觉规范

| 节点状态 | 图标 | 颜色 |
|---------|------|------|
| `active` | 跳动圆点 | `--color-accent` |
| `done` | 勾 ✓ | `--color-success` |
| `error` | 叉 ✗ | `--color-error` |
| `skipped` | 横线 — | `--color-border` |

- `duration_ms` 自动格式化：`42ms` / `1.2s`
- 有 `metadata` 时右侧出现展开箭头，点击展开 JSON 详情
- 子节点按 `parent_id` 层级缩进（每层 16px）
- 组件为只读，无用户交互

### 与 StreamState 的对应

```typescript
// state.workflowRunOrder: string[]         run_id 按首次出现顺序
// state.workflowRuns:     Record<string, WorkflowRunState>

interface WorkflowRunState {
  run_id:    string
  nodes:     Record<string, WorkflowNodeRecord>  // 按 node_id 键入
  nodeOrder: string[]                            // node_id 按首次出现顺序
}

interface WorkflowNodeRecord {
  node_id:     string
  run_id:      string
  parent_id?:  string | null
  name:        string
  state:       'active' | 'done' | 'error' | 'skipped'
  started_at?: number
  duration_ms?: number
  metadata?:   Record<string, unknown>
}
```

---

## 后端：如何发送 workflow_node

### Python（FastAPI / 自研）

```python
import json, time

def wf_event(run_id, node_id, name, state, parent_id=None, **extra):
    payload = {
        "run_id": run_id, "node_id": node_id,
        "name": name, "state": state,
    }
    if parent_id: payload["parent_id"] = parent_id
    payload.update(extra)
    return f'data: {json.dumps({"type":"workflow_node","schema_version":"1.0","payload":payload})}\n\n'

async def stream_response():
    t0 = int(time.time() * 1000)

    # 节点开始
    yield wf_event("run-1", "n1", "intent_router", "active", started_at=t0)

    # ... 执行逻辑 ...
    elapsed = int(time.time() * 1000) - t0

    # 节点完成
    yield wf_event("run-1", "n1", "intent_router", "done", duration_ms=elapsed)
```

### LangGraph 适配器

```python
from langgraph.graph import StateGraph

async def meso_langgraph_stream(graph, input, config):
    run_id = config.get("run_id", str(uuid4()))
    parent_map = {}  # node_name → node_id

    async for event in graph.astream_events(input, config, version="v2"):
        kind = event["event"]
        name = event.get("name", "")
        node_id = f"n_{name}_{event.get('run_id','')[:6]}"

        if kind == "on_chain_start":
            parent_map[name] = node_id
            yield wf_event(run_id, node_id, name, "active",
                           started_at=int(time.time()*1000))

        elif kind == "on_chain_end":
            t = event.get("metadata", {}).get("duration_ms")
            yield wf_event(run_id, node_id, name, "done", duration_ms=t)

        elif kind == "on_chain_error":
            yield wf_event(run_id, node_id, name, "error",
                           metadata={"error": str(event.get("data", {}).get("error"))})
```

### Temporal 工作流（伪代码）

```python
class MesoWorkflowActivities:
    def __init__(self, sse_emitter):
        self.emit = sse_emitter

    async def tracked_activity(self, run_id, node_id, name, fn, *args):
        await self.emit(wf_event(run_id, node_id, name, "active"))
        try:
            result = await fn(*args)
            await self.emit(wf_event(run_id, node_id, name, "done"))
            return result
        except Exception as e:
            await self.emit(wf_event(run_id, node_id, name, "error",
                                     metadata={"error": str(e)}))
            raise
```

---

## 常见模式

### 与 stage 协作（推荐）

```
← 用户视角 →              ← 开发者视角 →
stage: "搜索网络" active
                           workflow_node: intent_router  active
                           workflow_node: intent_router  done (42ms)
                           workflow_node: web_search     active
                           workflow_node: fetch_batch_1  active (子节点)
                           workflow_node: fetch_batch_2  active (子节点)
                           workflow_node: fetch_batch_1  done (310ms)
                           workflow_node: fetch_batch_2  error (205ms)
                           workflow_node: web_search     done (520ms)
stage: "搜索网络" done
```

### 只用 workflow_node（纯开发者模式）

适合内部工具或调试面板，不需要向用户展示进度。此时不发送 `stage`，只发送 `workflow_node`，`StageTimeline` 不出现。

### metadata 的建议字段

```json
{
  "input_summary":  "用户查询前 50 字",
  "output_summary": "结果摘要前 50 字",
  "url":            "https://...",
  "chars":          4200,
  "error":          "timeout after 5000ms",
  "retry_count":    2
}
```

`metadata` 无固定 schema，`WorkflowTimeline` 展开后原样显示 JSON。

---

## 与 extension 的选择

如果后端已有 `extension` 事件用于自定义工具进度，**不需要迁移**——两者共存。选择建议：

| 场景 | 推荐 |
|------|------|
| 需要树形结构（parent_id）| `workflow_node` |
| 需要 `WorkflowTimeline` 组件 | `workflow_node` |
| 需要在 `workflowRuns` 中做状态查询 | `workflow_node` |
| 完全自定义渲染（renderExtension） | `extension` |
| 已有 extension 逻辑，只需加进度条 | 继续用 `extension` |
