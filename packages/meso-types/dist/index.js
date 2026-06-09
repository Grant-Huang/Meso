const s = "1.0";
function f() {
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
function m(r, o) {
  const e = new Set((o == null ? void 0 : o.excludeLangs) ?? []);
  return r.artifactOrder.some((a) => {
    const n = r.artifacts[a];
    return n != null && !e.has(n.lang) && !!n.content.trim();
  });
}
function O(r) {
  const o = {}, e = [];
  for (const a of r)
    o[a.id] = { id: a.id, lang: a.lang, content: a.content, done: !0 }, e.push(a.id);
  return {
    ...f(),
    status: "done",
    artifacts: o,
    artifactOrder: e
  };
}
function w(r, o) {
  switch (o.type) {
    case "capabilities":
      return { ...r, availableCapabilities: o.payload };
    case "stage": {
      const { name: e, state: a } = o.payload;
      return {
        ...r,
        stages: [
          ...r.stages.filter((n) => n.name !== e),
          { name: e, state: a }
        ]
      };
    }
    case "memory":
      return { ...r, memorySnippets: o.payload.snippets };
    case "memory_saved":
      return { ...r, memorySaved: [...r.memorySaved, o.payload] };
    case "soul":
      return { ...r, activeSoul: o.payload };
    case "skill_active":
      return { ...r, activeSkill: o.payload };
    case "tool_call": {
      const { id: e, groupId: a, groupKind: n } = o.payload;
      return {
        ...r,
        toolCallOrder: r.toolCallOrder.includes(e) ? r.toolCallOrder : [...r.toolCallOrder, e],
        toolCalls: {
          ...r.toolCalls,
          [e]: { call: o.payload, status: "pending", groupId: a, groupKind: n }
        }
      };
    }
    case "tool_result": {
      const { tool_call_id: e } = o.payload, a = r.toolCalls[e], n = o.payload.error ? "error" : "done";
      return {
        ...r,
        toolCalls: {
          ...r.toolCalls,
          [e]: {
            call: (a == null ? void 0 : a.call) ?? { id: e, name: "(unknown)", args: {} },
            result: o.payload,
            status: n
          }
        }
      };
    }
    case "resource_read": {
      const { id: e } = o.payload;
      return {
        ...r,
        resourceReadOrder: r.resourceReadOrder.includes(e) ? r.resourceReadOrder : [...r.resourceReadOrder, e],
        resourceReads: {
          ...r.resourceReads,
          [e]: { read: o.payload, status: "pending" }
        }
      };
    }
    case "resource_content": {
      const { resource_read_id: e } = o.payload, a = r.resourceReads[e], n = o.payload.error ? "error" : "done";
      return {
        ...r,
        resourceReads: {
          ...r.resourceReads,
          [e]: {
            read: (a == null ? void 0 : a.read) ?? { id: e, uri: "(unknown)" },
            content: o.payload,
            status: n
          }
        }
      };
    }
    case "think":
      return {
        ...r,
        thinkContent: r.thinkContent + o.payload.delta,
        thinkDone: o.payload.done ?? !1
      };
    case "text":
      return { ...r, textContent: r.textContent + o.payload.delta };
    case "artifact": {
      const { id: e, lang: a, delta: n, done: d } = o.payload, l = r.artifacts[e], c = r.artifactOrder.includes(e) ? r.artifactOrder : [...r.artifactOrder, e];
      return {
        ...r,
        artifactOrder: c,
        artifacts: {
          ...r.artifacts,
          [e]: {
            id: e,
            lang: a,
            content: ((l == null ? void 0 : l.content) ?? "") + n,
            done: d ?? !1
          }
        }
      };
    }
    case "workflow_node": {
      const { run_id: e, node_id: a, parent_id: n, name: d, state: l, started_at: c, duration_ms: i, metadata: u } = o.payload, t = r.workflowRuns[e] ?? { nodes: {}, nodeOrder: [] }, p = t.nodeOrder.includes(a) ? t.nodeOrder : [...t.nodeOrder, a];
      return {
        ...r,
        workflowRunOrder: r.workflowRunOrder.includes(e) ? r.workflowRunOrder : [...r.workflowRunOrder, e],
        workflowRuns: {
          ...r.workflowRuns,
          [e]: {
            run_id: e,
            nodes: {
              ...t.nodes,
              [a]: { node_id: a, run_id: e, parent_id: n, name: d, state: l, started_at: c, duration_ms: i, metadata: u }
            },
            nodeOrder: p
          }
        }
      };
    }
    case "done":
      return { ...r, status: "done" };
    case "error":
      return {
        ...r,
        status: "error",
        errorMessage: o.payload.message
      };
    case "extension": {
      const { name: e } = o.payload;
      return {
        ...r,
        extensions: {
          ...r.extensions,
          [e]: [...r.extensions[e] ?? [], o]
        },
        extensionLog: [...r.extensionLog, o]
      };
    }
    default:
      return r;
  }
}
function R(r) {
  if (!r.startsWith("data: ")) return null;
  const o = r.slice(6).trim();
  if (o === "[DONE]")
    return { type: "done", schema_version: s, payload: {} };
  let e;
  try {
    e = JSON.parse(o);
  } catch {
    return null;
  }
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const a = e;
  return typeof a.type != "string" || !a.payload || typeof a.payload != "object" || Array.isArray(a.payload) ? null : (a.schema_version || (a.schema_version = s), a);
}
function y(r) {
  const [o] = s.split(".").map(Number), [e] = (r.schema_version ?? "").split(".").map(Number);
  return e === o;
}
function g(r) {
  if (!y(r))
    throw new Error(
      `Meso protocol version mismatch: runtime expects ${s}, received ${r.schema_version}. Upgrade @meso.ai/types or your backend.`
    );
}
function k(r, o) {
  return {
    id: o,
    label: r.name,
    status: r.state
  };
}
export {
  s as PROTOCOL_VERSION,
  w as applyEvent,
  g as assertCompatibleVersion,
  f as createInitialStreamState,
  O as createStreamStateWithArtifacts,
  y as isCompatibleVersion,
  R as parseSSELine,
  k as stagePayloadToStage,
  m as streamStateHasArtifacts
};
