# 统一能力系统

本文描述 Meso 的统一能力模型（Soul / Skill / Tools / MCP）——这套系统是平台的核心设计，决定了如何以通用方式支持不同来源的 AI 能力。

---

## 一、设计原则

**平台定义协议，应用定义实现，后端负责执行。**

平台（`@meso.ai/ui`）：
- 定义所有能力类型的 SSE 事件格式
- 维护 `StreamState` 中的能力状态
- 渲染对应的 UI 组件
- **不假设**任何能力的具体实现

后端：
- 决定哪些能力可用（通过 `capabilities` 事件宣告）
- 执行工具调用、资源读取
- 激活 Soul 和 Skill
- 通过 SSE 事件通知前端状态变化

---

## 二、能力三维模型

每个能力都有三个维度：

```
┌─────────────────────────────────────────────────────────────┐
│                       能力维度模型                           │
│                                                             │
│  维度 1：提供方（Provider）                                  │
│    builtin  ← 平台内置（search_knowledge, save_memory）      │
│    local    ← App 定义（同进程函数）                         │
│    mcp      ← MCP 服务器（任意第三方协议兼容服务）            │
│    api      ← 外部 REST/gRPC 端点                           │
│                                                             │
│  维度 2：类型（Type）                                        │
│    soul     ← WHO：身份人格（稳定）                          │
│    skill    ← HOW：操作模式（可切换）                        │
│    tool     ← DO：执行有结果的操作                           │
│    resource ← READ：读取文档/数据（只读，URI 寻址）           │
│                                                             │
│  维度 3：生命周期（Lifecycle）                               │
│    session  ← 整个会话期间有效（soul / capabilities）        │
│    turn     ← 单轮响应内有效（tool_call, resource_read）     │
│    switchable ← 可在会话中切换（skill）                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、Soul vs Skill

这是最容易混淆的一对概念：

| 维度 | Soul | Skill |
|------|------|-------|
| **语义** | WHO：这个助手是谁 | HOW：此刻如何运作 |
| **类比** | 人的性格 | 人当前的工作模式 |
| **稳定性** | 会话内固定 | 可以切换 |
| **内容** | 名字、头像、特质标签 | 任务焦点、提示词注入 |
| **SSE 事件** | `soul` | `skill_active` |
| **UI 组件** | `SoulIndicator` | `SkillIndicator` |
| **MCP 映射** | 无直接映射 | MCP Prompts → `skill_active` |
| **系统提示词** | 性格基底（相对稳定） | 任务指令（随焦点变化） |

**示例**：
- Soul: "Aria"，严谨、好奇的技术助手人格 → 整个会话不变
- Skill: "代码审查/安全焦点" → 用户可切换到 "性能焦点" 或 "通用模式"

---

## 四、MCP 能力映射

MCP（Model Context Protocol）定义了三种能力类型，全部映射到 Meso 标准事件：

```
MCP Tools ──────────→ tool_call + tool_result
  (函数调用，有 I/O)    (显示 ToolCallBlock，支持风险控制和确认门)

MCP Resources ──────→ resource_read + resource_content
  (文档读取，URI 寻址)  (显示 ResourceReadBlock，可展开内容)

MCP Prompts ────────→ skill_active
  (提示词注入)          (注入 system prompt 后发信号，显示 SkillIndicator)

MCP Sampling ───────→ 后端处理，不透传前端
  (LLM 采样请求)        (后端代理给 LLM Provider，前端不感知)
```

这个映射保证了：无论能力来自哪个 MCP 服务器，前端 UI 都用相同的组件渲染，
用户体验统一，应用代码不需要知道能力的来源。

---

## 五、能力发现协议（capabilities 事件）

每次流式响应开始时，后端发送一次 `capabilities` 事件宣告本次会话所有可用能力：

```
SSE 流开始
    ↓
capabilities 事件  ← 宣告所有可用工具/技能/资源/MCP服务器
    ↓
soul 事件          ← 激活本次使用的 Soul
    ↓
skill_active 事件  ← 激活当前 Skill（若有）
    ↓
... 正常流式内容 ...
```

**前端消费 capabilities 的方式**：
- `state.availableCapabilities` 供 App 层渲染技能选择器、工具开关、MCP 面板
- 平台组件（ToolCallBlock 等）直接从 `tool_call` 事件中读取元数据，不依赖 `capabilities`
- `capabilities` 是给**应用层 UI**用的，不是给平台组件用的

```typescript
const { state } = useSSEStream(url, {
  onCapabilities: (caps) => {
    // 应用层可在这里更新 UI（如渲染技能下拉菜单）
    setAvailableSkills(caps.skills ?? [])
    setMCPServers(caps.mcp_servers ?? [])
  }
})
```

---

## 六、工具风险控制

工具调用有三个风险等级，平台在 UI 层自动处理：

| 风险等级 | `tool_call` 中的 `risk` | 前端行为 |
|---------|------------------------|----------|
| 只读 | `"safe"` 或省略 | 无风险徽章，自动执行 |
| 写入 | `"write"` | 黄色"写入"徽章，自动执行 |
| 危险 | `"destructive"` | 红色"危险"徽章，**暂停等待用户确认** |

确认门触发时，`ToolCallState.status` 为 `"awaiting_confirm"`，
`ToolCallBlock` 渲染内联确认按钮，用户确认后调用 `onToolConfirm`，
应用层发送确认信号到后端继续执行。

---

## 七、StreamState 中的能力状态

```typescript
interface StreamState {
  // 能力元信息（流开始时一次性填充）
  availableCapabilities: CapabilitiesPayload | null

  // 当前激活的 Soul / Skill
  activeSoul: SoulPayload | null
  activeSkill: SkillPayload | null

  // 工具调用（按 id 索引，toolCallOrder 维护插入顺序）
  toolCalls: Record<string, ToolCallState>
  toolCallOrder: string[]

  // MCP 资源读取（按 id 索引）
  resourceReads: Record<string, ResourceReadState>
  resourceReadOrder: string[]

  // ... 其余字段（textContent, artifacts, etc.)
}
```

工具调用状态机：
```
pending ──→ running ──→ done
                  └──→ awaiting_confirm ──→ (user confirms) ──→ running ──→ done
                                       └──→ error (user cancels)
                  └──→ error
```

资源读取状态机：
```
pending ──→ done
       └──→ error
```

---

## 八、MCP 与 ToolRisk 的对应关系

MCP 工具注解（annotations）映射到 Meso `risk` 字段：

| MCP 注解 | Meso risk | 说明 |
|---------|-----------|------|
| `readOnlyHint: true` | `"safe"` | 只读操作 |
| 无注解 | `"safe"` | 默认安全 |
| `destructiveHint: true` | `"destructive"` | 不可逆操作 |
| 其他 | `"write"` | 有副作用但可逆 |

MCP `openWorldHint` 映射到 `annotations.open_world`，前端渲染 🌐 图标。
MCP `idempotentHint` 映射到 `annotations.idempotent`，前端目前不展示，仅供参考。

---

## 九、协议包（@meso.ai/types）

`@meso.ai/types` 是零依赖的协议包，包含：

| 模块 | 内容 |
|------|------|
| `protocol.ts` | 所有 SSE 事件类型定义（单一事实来源） |
| `streamState.ts` | `StreamState` 接口和 `createInitialStreamState()` |
| `applyEvent.ts` | 纯函数状态机 reducer |

```typescript
// 无 React 使用（测试、边缘函数、后端验证）
import {
  parseSSELine,
  applyEvent,
  createInitialStreamState,
  PROTOCOL_VERSION,
} from '@meso.ai/ui/runtime'
// 或直接从 @meso.ai/types（如果单独安装）
```

`applyEvent` 是纯函数（无 side effects），可在任何环境中使用：Node.js、浏览器、Deno、边缘函数。

---

## 十、扩展能力边界

平台能力系统**不会**处理的内容（属于应用/后端域）：

- 工具的实际执行逻辑
- MCP 服务器的连接管理
- Soul 和 Skill 的提示词内容
- 记忆的存储和召回算法
- 用户权限和工具授权检查

这些都是后端责任。平台只负责：接收事件 → 维护状态 → 渲染 UI → 回调应用层。
