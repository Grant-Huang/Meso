const y = "1.0";
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
function O(e, t) {
  const s = new Set((t == null ? void 0 : t.excludeLangs) ?? []);
  return e.artifactOrder.some((n) => {
    const i = e.artifacts[n];
    return i != null && !s.has(i.lang) && !!i.content.trim();
  });
}
function C(e) {
  const t = {}, s = [];
  for (const n of e)
    t[n.id] = { id: n.id, lang: n.lang, content: n.content, done: !0 }, s.push(n.id);
  return {
    ...h(),
    status: "done",
    artifacts: t,
    artifactOrder: s
  };
}
function m(e) {
  const t = e.payload;
  switch (e.type) {
    case "tool_call":
      return t.id ?? "unknown";
    case "tool_result":
      return t.tool_call_id ?? "unknown";
    case "resource_read":
      return t.id ?? "unknown";
    case "resource_content":
      return t.resource_read_id ?? "unknown";
    case "artifact":
      return t.id ?? "unknown";
    case "phase":
      return t.id ?? "unknown";
    case "workflow_node":
      return t.node_id ?? "unknown";
    case "text":
      return `text-${_(e).textChunkIndex}`;
    case "extension":
      return `ext-${t.name ?? "unknown"}`;
    default:
      return e.type;
  }
}
function _(e) {
  return {
    textChunkIndex: 0,
    // will be updated when processing text events
    ...e.payload
  };
}
function g(e, t, s) {
  var n;
  const i = {
    timestamp: e.eventLog.length,
    type: t.type,
    id: s,
    data: t.payload ?? {}
  };
  if (t.type === "text" && typeof ((n = t.payload) == null ? void 0 : n.delta) == "string") {
    const a = t.payload.delta, o = `text-${e.textChunks.length}`;
    return {
      ...e,
      eventLog: [...e.eventLog, { ...i, id: o }],
      textChunks: [
        ...e.textChunks,
        {
          id: o,
          delta: a,
          position: e.eventLog.length
        }
      ]
    };
  }
  return {
    ...e,
    eventLog: [...e.eventLog, i]
  };
}
function v(e, t) {
  const s = t.payload;
  s && typeof s.narration == "string" && s.narration.length > 0 && (e = v(e, {
    type: "text",
    schema_version: "1.0",
    payload: { delta: s.narration + `

` }
  }));
  let n;
  switch (t.type) {
    case "capabilities":
      n = { ...e, availableCapabilities: t.payload };
      break;
    case "memory":
      n = { ...e, memorySnippets: t.payload.snippets };
      break;
    case "memory_saved":
      n = { ...e, memorySaved: [...e.memorySaved, t.payload] };
      break;
    case "soul":
      n = { ...e, activeSoul: t.payload };
      break;
    case "skill_active":
      n = { ...e, activeSkill: t.payload };
      break;
    case "tool_call": {
      const { id: a, groupId: o, groupKind: r, risk: d, requires_confirm: u } = t.payload, c = u === !0 || d === "destructive" || d === "write" ? "awaiting_confirm" : "pending";
      n = {
        ...e,
        toolCallOrder: e.toolCallOrder.includes(a) ? e.toolCallOrder : [...e.toolCallOrder, a],
        toolCalls: {
          ...e.toolCalls,
          [a]: { call: t.payload, status: c, groupId: o, groupKind: r }
        }
      };
      break;
    }
    case "tool_status": {
      const { id: a, status: o } = t.payload, r = e.toolCalls[a];
      if (!r) return e;
      n = {
        ...e,
        toolCalls: {
          ...e.toolCalls,
          [a]: { ...r, status: o }
        }
      };
      break;
    }
    case "tool_result": {
      const { tool_call_id: a } = t.payload, o = e.toolCalls[a], r = t.payload.error ? "error" : "done";
      n = {
        ...e,
        toolCalls: {
          ...e.toolCalls,
          [a]: {
            call: (o == null ? void 0 : o.call) ?? { id: a, name: "(unknown)", args: {} },
            result: t.payload,
            status: r,
            groupId: o == null ? void 0 : o.groupId,
            groupKind: o == null ? void 0 : o.groupKind
          }
        }
      };
      break;
    }
    case "resource_read": {
      const { id: a } = t.payload;
      n = {
        ...e,
        resourceReadOrder: e.resourceReadOrder.includes(a) ? e.resourceReadOrder : [...e.resourceReadOrder, a],
        resourceReads: {
          ...e.resourceReads,
          [a]: { read: t.payload, status: "pending" }
        }
      };
      break;
    }
    case "resource_content": {
      const { resource_read_id: a } = t.payload, o = e.resourceReads[a], r = t.payload.error ? "error" : "done";
      n = {
        ...e,
        resourceReads: {
          ...e.resourceReads,
          [a]: {
            read: (o == null ? void 0 : o.read) ?? { id: a, uri: "(unknown)" },
            content: t.payload,
            status: r
          }
        }
      };
      break;
    }
    case "think": {
      const { delta: a, done: o, phase_id: r } = t.payload;
      if (r) {
        const d = e.phases[r];
        if (!d) return e;
        n = {
          ...e,
          phases: {
            ...e.phases,
            [r]: {
              ...d,
              thinkContent: d.thinkContent + a
            }
          }
        };
      } else
        n = {
          ...e,
          thinkContent: e.thinkContent + a,
          thinkDone: o ?? !1
        };
      break;
    }
    case "phase": {
      const { id: a, name: o, state: r, body: d, pinned_think: u, started_at: c, ended_at: k } = t.payload, l = e.phases[a];
      n = {
        ...e,
        phaseOrder: e.phaseOrder.includes(a) ? e.phaseOrder : [...e.phaseOrder, a],
        phases: {
          ...e.phases,
          [a]: {
            id: a,
            name: o,
            state: r,
            thinkContent: (l == null ? void 0 : l.thinkContent) ?? "",
            pinnedThink: u ?? (l == null ? void 0 : l.pinnedThink),
            body: d ?? (l == null ? void 0 : l.body),
            startedAt: c ?? (l == null ? void 0 : l.startedAt),
            endedAt: k ?? (l == null ? void 0 : l.endedAt)
          }
        }
      };
      break;
    }
    case "text": {
      n = { ...e, textContent: e.textContent + t.payload.delta };
      break;
    }
    case "artifact": {
      const { id: a, lang: o, delta: r, done: d } = t.payload, u = e.artifacts[a], c = e.artifactOrder.includes(a) ? e.artifactOrder : [...e.artifactOrder, a];
      n = {
        ...e,
        artifactOrder: c,
        artifacts: {
          ...e.artifacts,
          [a]: {
            id: a,
            lang: o,
            content: ((u == null ? void 0 : u.content) ?? "") + r,
            done: d ?? !1
          }
        }
      };
      break;
    }
    case "workflow_node": {
      const { run_id: a, node_id: o, parent_id: r, name: d, state: u, started_at: c, duration_ms: k, metadata: l } = t.payload, p = e.workflowRuns[a] ?? { nodes: {}, nodeOrder: [] }, f = p.nodeOrder.includes(o) ? p.nodeOrder : [...p.nodeOrder, o];
      n = {
        ...e,
        workflowRunOrder: e.workflowRunOrder.includes(a) ? e.workflowRunOrder : [...e.workflowRunOrder, a],
        workflowRuns: {
          ...e.workflowRuns,
          [a]: {
            run_id: a,
            nodes: {
              ...p.nodes,
              [o]: { node_id: o, run_id: a, parent_id: r, name: d, state: u, started_at: c, duration_ms: k, metadata: l }
            },
            nodeOrder: f
          }
        }
      };
      break;
    }
    case "done":
      n = { ...e, status: "done" };
      break;
    case "error":
      n = {
        ...e,
        status: "error",
        errorMessage: t.payload.message,
        errorCode: t.payload.code ?? null
      };
      break;
    case "extension": {
      const { name: a } = t.payload;
      n = {
        ...e,
        extensions: {
          ...e.extensions,
          [a]: [...e.extensions[a] ?? [], t]
        },
        extensionLog: [...e.extensionLog, t]
      };
      break;
    }
    default:
      return e;
  }
  const i = m(t);
  return g(n, t, i);
}
function b(e) {
  if (!e.startsWith("data: ")) return null;
  const t = e.slice(6).trim();
  if (t === "[DONE]")
    return { type: "done", schema_version: y, payload: {} };
  let s;
  try {
    s = JSON.parse(t);
  } catch {
    return null;
  }
  if (!s || typeof s != "object" || Array.isArray(s)) return null;
  const n = s;
  return typeof n.type != "string" || !n.payload || typeof n.payload != "object" || Array.isArray(n.payload) ? null : (n.schema_version || (n.schema_version = y), n);
}
function w(e) {
  const [t] = y.split(".").map(Number), [s] = (e.schema_version ?? "").split(".").map(Number);
  return s === t;
}
function x(e) {
  if (!w(e))
    throw new Error(
      `Meso protocol version mismatch: runtime expects ${y}, received ${e.schema_version}. Upgrade @meso.ai/types or your backend.`
    );
}
function R(e) {
  const t = e.state === "running" ? "active" : e.state === "pending" ? "pending" : e.state === "error" ? "error" : "done";
  return {
    id: e.id,
    label: e.name,
    status: t
  };
}
export {
  y as PROTOCOL_VERSION,
  v as applyEvent,
  x as assertCompatibleVersion,
  h as createInitialStreamState,
  C as createStreamStateWithArtifacts,
  w as isCompatibleVersion,
  b as parseSSELine,
  R as phaseRecordToStage,
  O as streamStateHasArtifacts
};
