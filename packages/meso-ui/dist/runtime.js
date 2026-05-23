const i = "1.0";
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
function f(e, t) {
  switch (t.type) {
    case "capabilities":
      return { ...e, availableCapabilities: t.payload };
    case "stage": {
      const { name: a, state: o } = t.payload;
      return {
        ...e,
        stages: [
          ...e.stages.filter((n) => n.name !== a),
          { name: a, state: o }
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
      const { tool_call_id: a } = t.payload, o = e.toolCalls[a], n = t.payload.error ? "error" : "done";
      return {
        ...e,
        toolCalls: {
          ...e.toolCalls,
          [a]: {
            call: (o == null ? void 0 : o.call) ?? { id: a, name: "(unknown)", args: {} },
            result: t.payload,
            status: n
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
      const { resource_read_id: a } = t.payload, o = e.resourceReads[a], n = t.payload.error ? "error" : "done";
      return {
        ...e,
        resourceReads: {
          ...e.resourceReads,
          [a]: {
            read: (o == null ? void 0 : o.read) ?? { id: a, uri: "(unknown)" },
            content: t.payload,
            status: n
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
      const { id: a, lang: o, delta: n, done: l } = t.payload, r = e.artifacts[a], d = e.artifactOrder.includes(a) ? e.artifactOrder : [...e.artifactOrder, a];
      return {
        ...e,
        artifactOrder: d,
        artifacts: {
          ...e.artifacts,
          [a]: {
            id: a,
            lang: o,
            content: ((r == null ? void 0 : r.content) ?? "") + n,
            done: l ?? !1
          }
        }
      };
    }
    case "workflow_node": {
      const { run_id: a, node_id: o, parent_id: n, name: l, state: r, started_at: d, duration_ms: u, metadata: c } = t.payload, s = e.workflowRuns[a] ?? { nodes: {}, nodeOrder: [] }, p = s.nodeOrder.includes(o) ? s.nodeOrder : [...s.nodeOrder, o];
      return {
        ...e,
        workflowRunOrder: e.workflowRunOrder.includes(a) ? e.workflowRunOrder : [...e.workflowRunOrder, a],
        workflowRuns: {
          ...e.workflowRuns,
          [a]: {
            run_id: a,
            nodes: {
              ...s.nodes,
              [o]: { node_id: o, run_id: a, parent_id: n, name: l, state: r, started_at: d, duration_ms: u, metadata: c }
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
function O(e) {
  if (!e.startsWith("data: ")) return null;
  const t = e.slice(6).trim();
  if (t === "[DONE]")
    return { type: "done", schema_version: i, payload: {} };
  let a;
  try {
    a = JSON.parse(t);
  } catch {
    return null;
  }
  if (!a || typeof a != "object" || Array.isArray(a)) return null;
  const o = a;
  return typeof o.type != "string" || !o.payload || typeof o.payload != "object" || Array.isArray(o.payload) ? null : (o.schema_version || (o.schema_version = i), o);
}
export {
  i as PROTOCOL_VERSION,
  f as applyEvent,
  y as createInitialStreamState,
  O as parseSSELine
};
