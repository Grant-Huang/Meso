const f = "1.0";
function h() {
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
    eventLog: [],
    textChunks: [],
    errorMessage: null,
    errorCode: null
  };
}
function b(r, o) {
  const d = new Set((o == null ? void 0 : o.excludeLangs) ?? []);
  return r.artifactOrder.some((a) => {
    const i = r.artifacts[a];
    return i != null && !d.has(i.lang) && !!i.content.trim();
  });
}
function g(r) {
  const o = {}, d = [];
  for (const a of r)
    o[a.id] = { id: a.id, lang: a.lang, content: a.content, done: !0 }, d.push(a.id);
  return {
    ...h(),
    status: "done",
    artifacts: o,
    artifactOrder: d
  };
}
function m(r) {
  const o = r.payload;
  switch (r.type) {
    case "tool_call":
      return o.id ?? "unknown";
    case "tool_result":
      return o.tool_call_id ?? "unknown";
    case "resource_read":
      return o.id ?? "unknown";
    case "resource_content":
      return o.resource_read_id ?? "unknown";
    case "artifact":
      return o.id ?? "unknown";
    case "phase":
      return o.id ?? "unknown";
    case "workflow_node":
      return o.node_id ?? "unknown";
    case "text":
      return `text-${w(r).textChunkIndex}`;
    case "extension":
      return `ext-${o.name ?? "unknown"}`;
    default:
      return r.type;
  }
}
function w(r) {
  return {
    textChunkIndex: 0,
    // will be updated when processing text events
    ...r.payload
  };
}
function C(r, o, d) {
  var i;
  const a = {
    timestamp: r.eventLog.length,
    type: o.type,
    id: d,
    data: o.payload ?? {}
  };
  if (o.type === "text" && typeof ((i = o.payload) == null ? void 0 : i.delta) == "string") {
    const e = o.payload.delta, n = `text-${r.textChunks.length}`;
    return {
      ...r,
      eventLog: [...r.eventLog, { ...a, id: n }],
      textChunks: [
        ...r.textChunks,
        {
          id: n,
          delta: e,
          position: r.eventLog.length
        }
      ]
    };
  }
  return {
    ...r,
    eventLog: [...r.eventLog, a]
  };
}
function _(r, o) {
  const d = o.payload;
  d && typeof d.narration == "string" && d.narration.length > 0 && (r = _(r, {
    type: "text",
    schema_version: "1.0",
    payload: { delta: d.narration + `

` }
  }));
  let a;
  switch (o.type) {
    case "capabilities":
      a = { ...r, availableCapabilities: o.payload };
      break;
    case "memory":
      a = { ...r, memorySnippets: o.payload.snippets };
      break;
    case "memory_saved":
      a = { ...r, memorySaved: [...r.memorySaved, o.payload] };
      break;
    case "soul":
      a = { ...r, activeSoul: o.payload };
      break;
    case "skill_active":
      a = { ...r, activeSkill: o.payload };
      break;
    case "tool_call": {
      const { id: e, groupId: n, groupKind: t, risk: s, requires_confirm: c } = o.payload, p = c === !0 || s === "destructive" || s === "write" ? "awaiting_confirm" : "pending";
      a = {
        ...r,
        toolCallOrder: r.toolCallOrder.includes(e) ? r.toolCallOrder : [...r.toolCallOrder, e],
        toolCalls: {
          ...r.toolCalls,
          [e]: { call: o.payload, status: p, groupId: n, groupKind: t }
        }
      };
      break;
    }
    case "tool_status": {
      const { id: e, status: n } = o.payload, t = r.toolCalls[e];
      if (!t) return r;
      a = {
        ...r,
        toolCalls: {
          ...r.toolCalls,
          [e]: { ...t, status: n }
        }
      };
      break;
    }
    case "tool_result": {
      const { tool_call_id: e } = o.payload, n = r.toolCalls[e], t = o.payload.error ? "error" : "done";
      a = {
        ...r,
        toolCalls: {
          ...r.toolCalls,
          [e]: {
            call: (n == null ? void 0 : n.call) ?? { id: e, name: "(unknown)", args: {} },
            result: o.payload,
            status: t,
            groupId: n == null ? void 0 : n.groupId,
            groupKind: n == null ? void 0 : n.groupKind
          }
        }
      };
      break;
    }
    case "resource_read": {
      const { id: e } = o.payload;
      a = {
        ...r,
        resourceReadOrder: r.resourceReadOrder.includes(e) ? r.resourceReadOrder : [...r.resourceReadOrder, e],
        resourceReads: {
          ...r.resourceReads,
          [e]: { read: o.payload, status: "pending" }
        }
      };
      break;
    }
    case "resource_content": {
      const { resource_read_id: e } = o.payload, n = r.resourceReads[e], t = o.payload.error ? "error" : "done";
      a = {
        ...r,
        resourceReads: {
          ...r.resourceReads,
          [e]: {
            read: (n == null ? void 0 : n.read) ?? { id: e, uri: "(unknown)" },
            content: o.payload,
            status: t
          }
        }
      };
      break;
    }
    case "think": {
      const { delta: e, done: n, phase_id: t } = o.payload;
      if (t) {
        const s = r.phases[t];
        if (!s) return r;
        a = {
          ...r,
          phases: {
            ...r.phases,
            [t]: {
              ...s,
              thinkContent: s.thinkContent + e
            }
          }
        };
      } else
        a = {
          ...r,
          thinkContent: r.thinkContent + e,
          thinkDone: n ?? !1
        };
      break;
    }
    case "phase": {
      const { id: e, name: n, state: t, body: s, pinned_think: c, started_at: u, ended_at: p } = o.payload, l = r.phases[e];
      a = {
        ...r,
        phaseOrder: r.phaseOrder.includes(e) ? r.phaseOrder : [...r.phaseOrder, e],
        phases: {
          ...r.phases,
          [e]: {
            id: e,
            name: n,
            state: t,
            thinkContent: (l == null ? void 0 : l.thinkContent) ?? "",
            pinnedThink: c ?? (l == null ? void 0 : l.pinnedThink),
            body: s ?? (l == null ? void 0 : l.body),
            startedAt: u ?? (l == null ? void 0 : l.startedAt),
            endedAt: p ?? (l == null ? void 0 : l.endedAt)
          }
        }
      };
      break;
    }
    case "text": {
      a = { ...r, textContent: r.textContent + o.payload.delta };
      break;
    }
    case "artifact": {
      const { id: e, lang: n, delta: t, done: s } = o.payload, c = r.artifacts[e], u = r.artifactOrder.includes(e) ? r.artifactOrder : [...r.artifactOrder, e];
      a = {
        ...r,
        artifactOrder: u,
        artifacts: {
          ...r.artifacts,
          [e]: {
            id: e,
            lang: n,
            content: ((c == null ? void 0 : c.content) ?? "") + t,
            done: s ?? !1
          }
        }
      };
      break;
    }
    case "workflow_node": {
      const { run_id: e, node_id: n, parent_id: t, name: s, state: c, started_at: u, duration_ms: p, metadata: l } = o.payload, y = r.workflowRuns[e] ?? { nodes: {}, nodeOrder: [] }, k = y.nodeOrder.includes(n) ? y.nodeOrder : [...y.nodeOrder, n];
      a = {
        ...r,
        workflowRunOrder: r.workflowRunOrder.includes(e) ? r.workflowRunOrder : [...r.workflowRunOrder, e],
        workflowRuns: {
          ...r.workflowRuns,
          [e]: {
            run_id: e,
            nodes: {
              ...y.nodes,
              [n]: { node_id: n, run_id: e, parent_id: t, name: s, state: c, started_at: u, duration_ms: p, metadata: l }
            },
            nodeOrder: k
          }
        }
      };
      break;
    }
    case "done":
      a = { ...r, status: "done" };
      break;
    case "error":
      a = {
        ...r,
        status: "error",
        errorMessage: o.payload.message,
        errorCode: o.payload.code ?? null
      };
      break;
    case "extension": {
      const { name: e } = o.payload;
      a = {
        ...r,
        extensions: {
          ...r.extensions,
          [e]: [...r.extensions[e] ?? [], o]
        },
        extensionLog: [...r.extensionLog, o]
      };
      break;
    }
    default:
      return r;
  }
  const i = m(o);
  return C(a, o, i);
}
function R(r) {
  if (!r.startsWith("data: ")) return null;
  const o = r.slice(6).trim();
  if (o === "[DONE]")
    return { type: "done", schema_version: f, payload: {} };
  let d;
  try {
    d = JSON.parse(o);
  } catch {
    return null;
  }
  if (!d || typeof d != "object" || Array.isArray(d)) return null;
  const a = d;
  return typeof a.type != "string" || !a.payload || typeof a.payload != "object" || Array.isArray(a.payload) ? null : (a.schema_version || (a.schema_version = f), a);
}
function O(r) {
  const [o] = f.split(".").map(Number), [d] = (r.schema_version ?? "").split(".").map(Number);
  return d === o;
}
function S(r) {
  if (!O(r))
    throw new Error(
      `Meso protocol version mismatch: runtime expects ${f}, received ${r.schema_version}. Upgrade @meso.ai/types or your backend.`
    );
}
function x(r) {
  const o = r.state === "running" ? "active" : r.state === "pending" ? "pending" : r.state === "error" ? "error" : "done";
  return {
    id: r.id,
    label: r.name,
    status: o
  };
}
export {
  f as PROTOCOL_VERSION,
  _ as applyEvent,
  S as assertCompatibleVersion,
  h as createInitialStreamState,
  g as createStreamStateWithArtifacts,
  O as isCompatibleVersion,
  R as parseSSELine,
  x as phaseRecordToStage,
  b as streamStateHasArtifacts
};
