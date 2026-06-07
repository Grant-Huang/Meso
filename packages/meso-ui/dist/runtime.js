const l = "1.0";
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
    extensions: {},
    extensionLog: [],
    errorMessage: null
  };
}
function m(e, t) {
  const a = new Set((t == null ? void 0 : t.excludeLangs) ?? []);
  return e.artifactOrder.some((n) => {
    const r = e.artifacts[n];
    return r != null && !a.has(r.lang) && !!r.content.trim();
  });
}
function O(e) {
  const t = {}, a = [];
  for (const n of e)
    t[n.id] = { id: n.id, lang: n.lang, content: n.content, done: !0 }, a.push(n.id);
  return {
    ...y(),
    status: "done",
    artifacts: t,
    artifactOrder: a
  };
}
function _(e, t) {
  switch (t.type) {
    case "capabilities":
      return { ...e, availableCapabilities: t.payload };
    case "stage": {
      const { name: a, state: n } = t.payload;
      return {
        ...e,
        stages: [
          ...e.stages.filter((r) => r.name !== a),
          { name: a, state: n }
        ]
      };
    }
    case "memory":
      return { ...e, memorySnippets: t.payload.snippets };
    case "memory_saved":
      return { ...e, memorySaved: [...e.memorySaved, t.payload] };
    case "soul":
      return { ...e, activeSoul: t.payload };
    case "skill_active":
      return { ...e, activeSkill: t.payload };
    case "tool_call": {
      const { id: a } = t.payload;
      return {
        ...e,
        toolCallOrder: e.toolCallOrder.includes(a) ? e.toolCallOrder : [...e.toolCallOrder, a],
        toolCalls: {
          ...e.toolCalls,
          [a]: { call: t.payload, status: "pending" }
        }
      };
    }
    case "tool_result": {
      const { tool_call_id: a } = t.payload, n = e.toolCalls[a], r = t.payload.error ? "error" : "done";
      return {
        ...e,
        toolCalls: {
          ...e.toolCalls,
          [a]: {
            call: (n == null ? void 0 : n.call) ?? { id: a, name: "(unknown)", args: {} },
            result: t.payload,
            status: r
          }
        }
      };
    }
    case "resource_read": {
      const { id: a } = t.payload;
      return {
        ...e,
        resourceReadOrder: e.resourceReadOrder.includes(a) ? e.resourceReadOrder : [...e.resourceReadOrder, a],
        resourceReads: {
          ...e.resourceReads,
          [a]: { read: t.payload, status: "pending" }
        }
      };
    }
    case "resource_content": {
      const { resource_read_id: a } = t.payload, n = e.resourceReads[a], r = t.payload.error ? "error" : "done";
      return {
        ...e,
        resourceReads: {
          ...e.resourceReads,
          [a]: {
            read: (n == null ? void 0 : n.read) ?? { id: a, uri: "(unknown)" },
            content: t.payload,
            status: r
          }
        }
      };
    }
    case "think":
      return {
        ...e,
        thinkContent: e.thinkContent + t.payload.delta,
        thinkDone: t.payload.done ?? !1
      };
    case "text":
      return { ...e, textContent: e.textContent + t.payload.delta };
    case "artifact": {
      const { id: a, lang: n, delta: r, done: d } = t.payload, s = e.artifacts[a], i = e.artifactOrder.includes(a) ? e.artifactOrder : [...e.artifactOrder, a];
      return {
        ...e,
        artifactOrder: i,
        artifacts: {
          ...e.artifacts,
          [a]: {
            id: a,
            lang: n,
            content: ((s == null ? void 0 : s.content) ?? "") + r,
            done: d ?? !1
          }
        }
      };
    }
    case "workflow_node": {
      const { run_id: a, node_id: n, parent_id: r, name: d, state: s, started_at: i, duration_ms: c, metadata: u } = t.payload, o = e.workflowRuns[a] ?? { nodes: {}, nodeOrder: [] }, p = o.nodeOrder.includes(n) ? o.nodeOrder : [...o.nodeOrder, n];
      return {
        ...e,
        workflowRunOrder: e.workflowRunOrder.includes(a) ? e.workflowRunOrder : [...e.workflowRunOrder, a],
        workflowRuns: {
          ...e.workflowRuns,
          [a]: {
            run_id: a,
            nodes: {
              ...o.nodes,
              [n]: { node_id: n, run_id: a, parent_id: r, name: d, state: s, started_at: i, duration_ms: c, metadata: u }
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
        errorMessage: t.payload.message
      };
    case "extension": {
      const { name: a } = t.payload;
      return {
        ...e,
        extensions: {
          ...e.extensions,
          [a]: [...e.extensions[a] ?? [], t]
        },
        extensionLog: [...e.extensionLog, t]
      };
    }
    default:
      return e;
  }
}
function w(e) {
  if (!e.startsWith("data: ")) return null;
  const t = e.slice(6).trim();
  if (t === "[DONE]")
    return { type: "done", schema_version: l, payload: {} };
  let a;
  try {
    a = JSON.parse(t);
  } catch {
    return null;
  }
  if (!a || typeof a != "object" || Array.isArray(a)) return null;
  const n = a;
  return typeof n.type != "string" || !n.payload || typeof n.payload != "object" || Array.isArray(n.payload) ? null : (n.schema_version || (n.schema_version = l), n);
}
function f(e) {
  const [t] = l.split(".").map(Number), [a] = (e.schema_version ?? "").split(".").map(Number);
  return a === t;
}
function g(e) {
  if (!f(e))
    throw new Error(
      `Meso protocol version mismatch: runtime expects ${l}, received ${e.schema_version}. Upgrade @meso.ai/types or your backend.`
    );
}
function k(e, t) {
  return {
    id: t,
    label: e.name,
    status: e.state
  };
}
export {
  l as PROTOCOL_VERSION,
  _ as applyEvent,
  g as assertCompatibleVersion,
  y as createInitialStreamState,
  O as createStreamStateWithArtifacts,
  f as isCompatibleVersion,
  w as parseSSELine,
  k as stagePayloadToStage,
  m as streamStateHasArtifacts
};
