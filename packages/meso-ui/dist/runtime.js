const u = "1.0";
function y() {
  return {
    status: "idle",
    availableCapabilities: null,
    activeSoul: null,
    activeSkill: null,
    stages: [],
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
    phases: {},
    phaseOrder: [],
    extensions: {},
    extensionLog: [],
    errorMessage: null
  };
}
function f(e, a) {
  const t = new Set((a == null ? void 0 : a.excludeLangs) ?? []);
  return e.artifactOrder.some((n) => {
    const s = e.artifacts[n];
    return s != null && !t.has(s.lang) && !!s.content.trim();
  });
}
function h(e) {
  const a = {}, t = [];
  for (const n of e)
    a[n.id] = { id: n.id, lang: n.lang, content: n.content, done: !0 }, t.push(n.id);
  return {
    ...y(),
    status: "done",
    artifacts: a,
    artifactOrder: t
  };
}
function O(e, a) {
  switch (a.type) {
    case "capabilities":
      return { ...e, availableCapabilities: a.payload };
    case "stage": {
      const { name: t, state: n } = a.payload;
      return {
        ...e,
        stages: [
          ...e.stages.filter((s) => s.name !== t),
          { name: t, state: n }
        ]
      };
    }
    case "memory":
      return { ...e, memorySnippets: a.payload.snippets };
    case "memory_saved":
      return { ...e, memorySaved: [...e.memorySaved, a.payload] };
    case "soul":
      return { ...e, activeSoul: a.payload };
    case "skill_active":
      return { ...e, activeSkill: a.payload };
    case "tool_call": {
      const { id: t, groupId: n, groupKind: s } = a.payload;
      return {
        ...e,
        toolCallOrder: e.toolCallOrder.includes(t) ? e.toolCallOrder : [...e.toolCallOrder, t],
        toolCalls: {
          ...e.toolCalls,
          [t]: { call: a.payload, status: "pending", groupId: n, groupKind: s }
        }
      };
    }
    case "tool_result": {
      const { tool_call_id: t } = a.payload, n = e.toolCalls[t], s = a.payload.error ? "error" : "done";
      return {
        ...e,
        toolCalls: {
          ...e.toolCalls,
          [t]: {
            call: (n == null ? void 0 : n.call) ?? { id: t, name: "(unknown)", args: {} },
            result: a.payload,
            status: s
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
      const { resource_read_id: t } = a.payload, n = e.resourceReads[t], s = a.payload.error ? "error" : "done";
      return {
        ...e,
        resourceReads: {
          ...e.resourceReads,
          [t]: {
            read: (n == null ? void 0 : n.read) ?? { id: t, uri: "(unknown)" },
            content: a.payload,
            status: s
          }
        }
      };
    }
    case "think": {
      const { delta: t, done: n, phase_id: s } = a.payload;
      if (s) {
        const o = e.phases[s];
        return o ? {
          ...e,
          phases: {
            ...e.phases,
            [s]: {
              ...o,
              thinkContent: o.thinkContent + t
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
      const { id: t, name: n, state: s, body: o, pinned_think: d, started_at: l, ended_at: c } = a.payload, r = e.phases[t];
      return {
        ...e,
        phaseOrder: e.phaseOrder.includes(t) ? e.phaseOrder : [...e.phaseOrder, t],
        phases: {
          ...e.phases,
          [t]: {
            id: t,
            name: n,
            state: s,
            thinkContent: (r == null ? void 0 : r.thinkContent) ?? "",
            pinnedThink: d ?? (r == null ? void 0 : r.pinnedThink),
            body: o ?? (r == null ? void 0 : r.body),
            startedAt: l ?? (r == null ? void 0 : r.startedAt),
            endedAt: c ?? (r == null ? void 0 : r.endedAt)
          }
        }
      };
    }
    case "text":
      return { ...e, textContent: e.textContent + a.payload.delta };
    case "artifact": {
      const { id: t, lang: n, delta: s, done: o } = a.payload, d = e.artifacts[t], l = e.artifactOrder.includes(t) ? e.artifactOrder : [...e.artifactOrder, t];
      return {
        ...e,
        artifactOrder: l,
        artifacts: {
          ...e.artifacts,
          [t]: {
            id: t,
            lang: n,
            content: ((d == null ? void 0 : d.content) ?? "") + s,
            done: o ?? !1
          }
        }
      };
    }
    case "workflow_node": {
      const { run_id: t, node_id: n, parent_id: s, name: o, state: d, started_at: l, duration_ms: c, metadata: r } = a.payload, i = e.workflowRuns[t] ?? { nodes: {}, nodeOrder: [] }, p = i.nodeOrder.includes(n) ? i.nodeOrder : [...i.nodeOrder, n];
      return {
        ...e,
        workflowRunOrder: e.workflowRunOrder.includes(t) ? e.workflowRunOrder : [...e.workflowRunOrder, t],
        workflowRuns: {
          ...e.workflowRuns,
          [t]: {
            run_id: t,
            nodes: {
              ...i.nodes,
              [n]: { node_id: n, run_id: t, parent_id: s, name: o, state: d, started_at: l, duration_ms: c, metadata: r }
            },
            nodeOrder: p
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
        errorMessage: a.payload.message
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
function _(e) {
  if (!e.startsWith("data: ")) return null;
  const a = e.slice(6).trim();
  if (a === "[DONE]")
    return { type: "done", schema_version: u, payload: {} };
  let t;
  try {
    t = JSON.parse(a);
  } catch {
    return null;
  }
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const n = t;
  return typeof n.type != "string" || !n.payload || typeof n.payload != "object" || Array.isArray(n.payload) ? null : (n.schema_version || (n.schema_version = u), n);
}
function m(e) {
  const [a] = u.split(".").map(Number), [t] = (e.schema_version ?? "").split(".").map(Number);
  return t === a;
}
function k(e) {
  if (!m(e))
    throw new Error(
      `Meso protocol version mismatch: runtime expects ${u}, received ${e.schema_version}. Upgrade @meso.ai/types or your backend.`
    );
}
function v(e, a) {
  return {
    id: a,
    label: e.name,
    status: e.state
  };
}
export {
  u as PROTOCOL_VERSION,
  O as applyEvent,
  k as assertCompatibleVersion,
  y as createInitialStreamState,
  h as createStreamStateWithArtifacts,
  m as isCompatibleVersion,
  _ as parseSSELine,
  v as stagePayloadToStage,
  f as streamStateHasArtifacts
};
