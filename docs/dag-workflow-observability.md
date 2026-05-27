# DAG 工作流可观测性

Meso 在协议层预留了工作流可观测性支持，让后端 DAG 执行器（自研、LangGraph、Temporal 等）能将节点级进度通过现有 SSE 出口推送到前端，无需在平台侧内置执行引擎。

## 分层设计

| 信号 | 事件类型 | 受众 | 粒度示例 |
|------|---------|------|---------|
| 粗阶段 | `stage` | **用户** | "召回记忆"、"搜索网络"、"生成回复" |
| 细节点 | `workflow_node` | **开发者** | `intent_router`、`web_search`、`fetch_batch_3` |

两者独立发送，互不干扰。`stage` 驱动用户侧 `StageTimeline`；`workflow_node` 驱动开发者侧 `WorkflowTimeline`，默认不对终端用户展示。

## workflow_node 事件

```jsonc
{
  "type": "workflow_node",
  "schema_version": "1.0",
  "payload": {
    "run_id": "run-abc123",      // 标识同一次 workflow 执行
    "node_id": "n_web_search",   // run 内唯一
    "parent_id": "n_router",     // 父节点 id，null 或省略 = 根节点
    "name": "web_search",        // 开发者可读的节点名
    "state": "active",           // active | done | error | skipped
    "started_at": 1700000000000, // Unix ms，可选
    "duration_ms": 312,          // 耗时，done/error 时携带
    "metadata": {                // 任意域特定数据，可选
      "url": "https://...",
      "chars": 4200
    }
  }
}
```

### 状态机

```
active → done
active → error
active → skipped   // 条件分支跳过
```

同一 `node_id` 可收到多次事件（active → done），后到事件覆盖前一状态，`nodeOrder` 不重复。

## run_id 语义

- 同一次 workflow 执行的所有节点共享一个 `run_id`
- 单次响应可包含多个 run（如并行子图）
- `run_id` 格式由后端决定（UUID、`{skill}-{ts}` 等皆可）

## parent_id 树形结构

`parent_id` 允许表达子图层级：

```
n_router  (根)
  └─ n_web_search
       ├─ n_fetch_1
       └─ n_fetch_2
  └─ n_rerank
```

前端 `WorkflowTimeline` 按 `nodeOrder`（到达顺序）+ `parent_id` 深度渲染缩进树，无需 YAML 或图拓扑描述。

## StreamState

```typescript
// 通过 workflowRuns 访问所有 run
state.workflowRunOrder  // run_id[]，按首次出现排序
state.workflowRuns      // Record<run_id, WorkflowRunState>

// 访问单个 run
const run = state.workflowRuns['run-abc123']
run.nodeOrder           // node_id[]，按首次出现排序
run.nodes               // Record<node_id, WorkflowNodeRecord>
```

## WorkflowTimeline 组件

只读 UI 组件，数据来自事件流，不解析 YAML：

```tsx
import { WorkflowTimeline } from '@meso.ai/ui'

// 从 StreamState 取出要展示的 run
const runs = state.workflowRunOrder.map(id => state.workflowRuns[id])

<WorkflowTimeline runs={runs} />
```

- 按 `nodeOrder` 顺序渲染，`parent_id` 控制缩进层级
- 节点状态用图标区分：active 跳动点、done 勾、error 叉、skipped 横线
- `duration_ms` 自动格式化（`42ms` / `1.2s`）
- `metadata` 可展开查看（点击右侧箭头）
- 多 run 时显示 `run_id` 标签分组

## 后端接入示例

### 自研 DAG

```python
async def emit_node(run_id, node_id, name, state, parent_id=None, **kwargs):
    yield f'data: {json.dumps({"type": "workflow_node", "schema_version": "1.0", "payload": {"run_id": run_id, "node_id": node_id, "name": name, "state": state, "parent_id": parent_id, **kwargs}})}\n\n'

# 节点开始
yield emit_node("run-1", "web_search", "web_search", "active", parent_id="router", started_at=int(time()*1000))
# ... 执行 ...
# 节点完成
yield emit_node("run-1", "web_search", "web_search", "done", duration_ms=312)
```

### LangGraph / Temporal

通过 `extension` 事件或直接发送 `workflow_node` 接入现有 SSE 出口：

```python
# LangGraph stream_events 适配器示例
for event in graph.stream_events(input, config):
    if event["event"] == "on_chain_start":
        yield format_workflow_node(run_id, event["name"], "active", ...)
    elif event["event"] == "on_chain_end":
        yield format_workflow_node(run_id, event["name"], "done", duration_ms=...)
```

## 与 stage 的协作

推荐模式：`stage` 对应用户可理解的粗粒度阶段，每个阶段内部可有多个 `workflow_node`：

```
stage: "搜索网络" → active
  workflow_node: intent_router → active → done
  workflow_node: web_search    → active
    workflow_node: fetch_batch_1 → active → done
    workflow_node: fetch_batch_2 → active → error
  workflow_node: web_search    → done
stage: "搜索网络" → done
```

两者不强绑定，后端可以只用其中一个，也可以都用。
