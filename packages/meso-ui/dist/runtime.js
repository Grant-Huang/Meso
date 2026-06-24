const c = "1.0";
function f() {
  return {
    status: "idle",
    availableCapabilities: null,
    activeSoul: null,
    activeSkill: null,
    phases: {},
    phaseOrder: [],
    memorySnippets: [],
    memorySaved: [],
    toolCalls: {},
    toolCallOrder: [],
    resourceReads: {},
    resourceReadOrder: [],
    thinkContent: "",
    thinkDone: !1,
    textContent: "",
    artifacts: {},
    artifactOrder: [],
    workflowRuns: {},
    workflowRunOrder: [],
    extensions: {},
    extensionLog: [],
    errorMessage: null,
    errorCode: null
  };
}
function O(e, a) {
  const r = new Set((a == null ? void 0 : a.excludeLangs) ?? []);
  return e.artifactOrder.some((t) => {
    const n = e.artifacts[t];
    return n != null && !r.has(n.lang) && !!n.content.trim();
  });
}
function _(e) {
  const a = {}, r = [];
  for (const t of e)
    a[t.id] = { id: t.id, lang: t.lang, content: t.content, done: !0 }, r.push(t.id);
  return {
    ...f(),
    status: "done",
    artifacts: a,
    artifactOrder: r
  };
}
function m(e, a) {
  const r = a.payload;
  switch (r && typeof r.narration == "string" && r.narration.length > 0 && (e = m(e, {
    type: "text",
    schema_version: "1.0",
    payload: { delta: r.narration + `

` }
  })), a.type) {
    case "capabilities":
      return { ...e, availableCapabilities: a.payload };
    case "memory":
      return { ...e, memorySnippets: a.payload.snippets };
    case "memory_saved":
      return { ...e, memorySaved: [...e.memorySaved, a.payload] };
    case "soul":
      return { ...e, activeSoul: a.payload };
    case "skill_active":
      return { ...e, activeSkill: a.payload };
    case "tool_call": {
      const { id: t, groupId: n, groupKind: o, risk: s, requires_confirm: l } = a.payload, i = l === !0 || s === "destructive" || s === "write" ? "awaiting_confirm" : "pending";
      return {
        ...e,
        toolCallOrder: e.toolCallOrder.includes(t) ? e.toolCallOrder : [...e.toolCallOrder, t],
        toolCalls: {
          ...e.toolCalls,
          [t]: { call: a.payload, status: i, groupId: n, groupKind: o }
        }
      };
    }
    case "tool_status": {
      const { id: t, status: n } = a.payload, o = e.toolCalls[t];
      return o ? {
        ...e,
        toolCalls: {
          ...e.toolCalls,
          [t]: { ...o, status: n }
        }
      } : e;
    }
    case "tool_result": {
      const { tool_call_id: t } = a.payload, n = e.toolCalls[t], o = a.payload.error ? "error" : "done";
      return {
        ...e,
        toolCalls: {
          ...e.toolCalls,
          [t]: {
            call: (n == null ? void 0 : n.call) ?? { id: t, name: "(unknown)", args: {} },
            result: a.payload,
            status: o,
            groupId: n == null ? void 0 : n.groupId,
            groupKind: n == null ? void 0 : n.groupKind
          }
        }
      };
    }
    case "resource_read": {
      const { id: t } = a.payload;
      return {
        ...e,
        resourceReadOrder: e.resourceReadOrder.includes(t) ? e.resourceReadOrder : [...e.resourceReadOrder, t],
        resourceReads: {
          ...e.resourceReads,
          [t]: { read: a.payload, status: "pending" }
        }
      };
    }
    case "resource_content": {
      const { resource_read_id: t } = a.payload, n = e.resourceReads[t], o = a.payload.error ? "error" : "done";
      return {
        ...e,
        resourceReads: {
          ...e.resourceReads,
          [t]: {
            read: (n == null ? void 0 : n.read) ?? { id: t, uri: "(unknown)" },
            content: a.payload,
            status: o
          }
        }
      };
    }
    case "think": {
      const { delta: t, done: n, phase_id: o } = a.payload;
      if (o) {
        const s = e.phases[o];
        return s ? {
          ...e,
          phases: {
            ...e.phases,
            [o]: {
              ...s,
              thinkContent: s.thinkContent + t
            }
          }
        } : e;
      }
      return {
        ...e,
        thinkContent: e.thinkContent + t,
        thinkDone: n ?? !1
      };
    }
    case "phase": {
      const { id: t, name: n, state: o, body: s, pinned_think: l, started_at: i, ended_at: p } = a.payload, d = e.phases[t];
      return {
        ...e,
        phaseOrder: e.phaseOrder.includes(t) ? e.phaseOrder : [...e.phaseOrder, t],
        phases: {
          ...e.phases,
          [t]: {
            id: t,
            name: n,
            state: o,
            thinkContent: (d == null ? void 0 : d.thinkContent) ?? "",
            pinnedThink: l ?? (d == null ? void 0 : d.pinnedThink),
            body: s ?? (d == null ? void 0 : d.body),
            startedAt: i ?? (d == null ? void 0 : d.startedAt),
            endedAt: p ?? (d == null ? void 0 : d.endedAt)
          }
        }
      };
    }
    case "text":
      return { ...e, textContent: e.textContent + a.payload.delta };
    case "artifact": {
      const { id: t, lang: n, delta: o, done: s } = a.payload, l = e.artifacts[t], i = e.artifactOrder.includes(t) ? e.artifactOrder : [...e.artifactOrder, t];
      return {
        ...e,
        artifactOrder: i,
        artifacts: {
          ...e.artifacts,
          [t]: {
            id: t,
            lang: n,
            content: ((l == null ? void 0 : l.content) ?? "") + o,
            done: s ?? !1
          }
        }
      };
    }
    case "workflow_node": {
      const { run_id: t, node_id: n, parent_id: o, name: s, state: l, started_at: i, duration_ms: p, metadata: d } = a.payload, u = e.workflowRuns[t] ?? { nodes: {}, nodeOrder: [] }, y = u.nodeOrder.includes(n) ? u.nodeOrder : [...u.nodeOrder, n];
      return {
        ...e,
        workflowRunOrder: e.workflowRunOrder.includes(t) ? e.workflowRunOrder : [...e.workflowRunOrder, t],
        workflowRuns: {
          ...e.workflowRuns,
          [t]: {
            run_id: t,
            nodes: {
              ...u.nodes,
              [n]: { node_id: n, run_id: t, parent_id: o, name: s, state: l, started_at: i, duration_ms: p, metadata: d }
            },
            nodeOrder: y
          }
        }
      };
    }
    case "done":
      return { ...e, status: "done" };
    case "error":
      return {
        ...e,
        status: "error",
        errorMessage: a.payload.message,
        errorCode: a.payload.code ?? null
      };
    case "extension": {
      const { name: t } = a.payload;
      return {
        ...e,
        extensions: {
          ...e.extensions,
          [t]: [...e.extensions[t] ?? [], a]
        },
        extensionLog: [...e.extensionLog, a]
      };
    }
    default:
      return e;
  }
}
function v(e) {
  if (!e.startsWith("data: ")) return null;
  const a = e.slice(6).trim();
  if (a === "[DONE]")
    return { type: "done", schema_version: c, payload: {} };
  let r;
  try {
    r = JSON.parse(a);
  } catch {
    return null;
  }
  if (!r || typeof r != "object" || Array.isArray(r)) return null;
  const t = r;
  return typeof t.type != "string" || !t.payload || typeof t.payload != "object" || Array.isArray(t.payload) ? null : (t.schema_version || (t.schema_version = c), t);
}
function h(e) {
  const [a] = c.split(".").map(Number), [r] = (e.schema_version ?? "").split(".").map(Number);
  return r === a;
}
function g(e) {
  if (!h(e))
    throw new Error(
      `Meso protocol version mismatch: runtime expects ${c}, received ${e.schema_version}. Upgrade @meso.ai/types or your backend.`
    );
}
function C(e) {
  const a = e.state === "running" ? "active" : e.state === "pending" ? "pending" : e.state === "error" ? "error" : "done";
  return {
    id: e.id,
    label: e.name,
    status: a
  };
}
export {
  c as PROTOCOL_VERSION,
  m as applyEvent,
  g as assertCompatibleVersion,
  f as createInitialStreamState,
  _ as createStreamStateWithArtifacts,
  h as isCompatibleVersion,
  v as parseSSELine,
  C as phaseRecordToStage,
  O as streamStateHasArtifacts
};
