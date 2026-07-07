const y = "1.0", k = {
  precondition_unmet: { version: "1.0" },
  artifacts: { version: "1.0", aliases: ["nexus_artifacts"] },
  react_result: { version: "1.0" },
  step_trace: { version: "1.0", aliases: ["react_step_trace"] }
};
function R(r) {
  return r in k ? !0 : Object.values(k).some(
    (e) => Array.isArray(e.aliases) && e.aliases.includes(r)
  );
}
function m(r) {
  if (r in k) return r;
  for (const [e, i] of Object.entries(k))
    if (Array.isArray(i.aliases) && i.aliases.includes(r))
      return e;
  return r;
}
function _() {
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
    preconditionGaps: [],
    preconditionSummary: null,
    totalUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    lastFinishReason: null,
    errorMessage: null,
    errorCode: null
  };
}
function T(r, e) {
  const i = new Set((e == null ? void 0 : e.excludeLangs) ?? []);
  return r.artifactOrder.some((n) => {
    const p = r.artifacts[n];
    return p != null && !i.has(p.lang) && !!p.content.trim();
  });
}
function x(r) {
  const e = {}, i = [];
  for (const n of r)
    e[n.id] = { id: n.id, lang: n.lang, content: n.content, done: !0 }, i.push(n.id);
  return {
    ..._(),
    status: "done",
    artifacts: e,
    artifactOrder: i
  };
}
function w(r) {
  const e = r.payload;
  switch (r.type) {
    case "tool_call":
      return e.id ?? "unknown";
    case "tool_result":
      return e.tool_call_id ?? "unknown";
    case "resource_read":
      return e.id ?? "unknown";
    case "resource_content":
      return e.resource_read_id ?? "unknown";
    case "artifact":
      return e.id ?? "unknown";
    case "phase":
      return e.id ?? "unknown";
    case "workflow_node":
      return e.node_id ?? "unknown";
    case "text":
      return `text-${O(r).textChunkIndex}`;
    case "extension":
      return `ext-${m(e.name ?? "unknown")}`;
    default:
      return r.type;
  }
}
function O(r) {
  return {
    textChunkIndex: 0,
    // will be updated when processing text events
    ...r.payload
  };
}
function b(r, e, i) {
  var p;
  const n = {
    timestamp: r.eventLog.length,
    type: e.type,
    id: i,
    data: e.payload ?? {}
  };
  if (e.type === "text" && typeof ((p = e.payload) == null ? void 0 : p.delta) == "string") {
    const o = e.payload.delta, a = `text-${r.textChunks.length}`;
    return {
      ...r,
      eventLog: [...r.eventLog, { ...n, id: a }],
      textChunks: [
        ...r.textChunks,
        {
          id: a,
          delta: o,
          position: r.eventLog.length
        }
      ]
    };
  }
  return {
    ...r,
    eventLog: [...r.eventLog, n]
  };
}
function C(r, e) {
  const i = e.payload;
  i && typeof i.narration == "string" && i.narration.length > 0 && (r = C(r, {
    type: "text",
    schema_version: "1.0",
    payload: { delta: i.narration + `

` }
  }));
  let n;
  switch (e.type) {
    case "capabilities":
      n = { ...r, availableCapabilities: e.payload };
      break;
    case "memory":
      n = { ...r, memorySnippets: e.payload.snippets };
      break;
    case "memory_saved":
      n = { ...r, memorySaved: [...r.memorySaved, e.payload] };
      break;
    case "soul":
      n = { ...r, activeSoul: e.payload };
      break;
    case "skill_active":
      n = { ...r, activeSkill: e.payload };
      break;
    case "tool_call": {
      const { id: o, groupId: a, groupKind: t, risk: d, requires_confirm: l } = e.payload, u = l === !0 || d === "destructive" || d === "write" ? "awaiting_confirm" : "pending";
      n = {
        ...r,
        toolCallOrder: r.toolCallOrder.includes(o) ? r.toolCallOrder : [...r.toolCallOrder, o],
        toolCalls: {
          ...r.toolCalls,
          [o]: { call: e.payload, status: u, groupId: a, groupKind: t }
        }
      };
      break;
    }
    case "tool_status": {
      const { id: o, status: a } = e.payload, t = r.toolCalls[o];
      if (!t) return r;
      n = {
        ...r,
        toolCalls: {
          ...r.toolCalls,
          [o]: { ...t, status: a }
        }
      };
      break;
    }
    case "tool_result": {
      const { tool_call_id: o } = e.payload, a = r.toolCalls[o], t = e.payload.error ? "error" : "done";
      n = {
        ...r,
        toolCalls: {
          ...r.toolCalls,
          [o]: {
            call: (a == null ? void 0 : a.call) ?? { id: o, name: "(unknown)", args: {} },
            result: e.payload,
            status: t,
            groupId: a == null ? void 0 : a.groupId,
            groupKind: a == null ? void 0 : a.groupKind
          }
        }
      };
      break;
    }
    case "resource_read": {
      const { id: o } = e.payload;
      n = {
        ...r,
        resourceReadOrder: r.resourceReadOrder.includes(o) ? r.resourceReadOrder : [...r.resourceReadOrder, o],
        resourceReads: {
          ...r.resourceReads,
          [o]: { read: e.payload, status: "pending" }
        }
      };
      break;
    }
    case "resource_content": {
      const { resource_read_id: o } = e.payload, a = r.resourceReads[o], t = e.payload.error ? "error" : "done";
      n = {
        ...r,
        resourceReads: {
          ...r.resourceReads,
          [o]: {
            read: (a == null ? void 0 : a.read) ?? { id: o, uri: "(unknown)" },
            content: e.payload,
            status: t
          }
        }
      };
      break;
    }
    case "think": {
      const { delta: o, done: a, phase_id: t } = e.payload;
      if (t) {
        const d = r.phases[t];
        if (!d) return r;
        n = {
          ...r,
          phases: {
            ...r.phases,
            [t]: {
              ...d,
              thinkContent: d.thinkContent + o
            }
          }
        };
      } else
        n = {
          ...r,
          thinkContent: r.thinkContent + o,
          thinkDone: a ?? !1
        };
      break;
    }
    case "phase": {
      const { id: o, name: a, state: t, body: d, pinned_think: l, started_at: c, ended_at: u } = e.payload, s = r.phases[o];
      n = {
        ...r,
        phaseOrder: r.phaseOrder.includes(o) ? r.phaseOrder : [...r.phaseOrder, o],
        phases: {
          ...r.phases,
          [o]: {
            id: o,
            name: a,
            state: t,
            thinkContent: (s == null ? void 0 : s.thinkContent) ?? "",
            pinnedThink: l ?? (s == null ? void 0 : s.pinnedThink),
            body: d ?? (s == null ? void 0 : s.body),
            startedAt: c ?? (s == null ? void 0 : s.startedAt),
            endedAt: u ?? (s == null ? void 0 : s.endedAt)
          }
        }
      };
      break;
    }
    case "text": {
      n = { ...r, textContent: r.textContent + e.payload.delta };
      break;
    }
    case "artifact": {
      const { id: o, lang: a, delta: t, done: d } = e.payload, l = r.artifacts[o], c = r.artifactOrder.includes(o) ? r.artifactOrder : [...r.artifactOrder, o];
      n = {
        ...r,
        artifactOrder: c,
        artifacts: {
          ...r.artifacts,
          [o]: {
            id: o,
            lang: a,
            content: ((l == null ? void 0 : l.content) ?? "") + t,
            done: d ?? !1
          }
        }
      };
      break;
    }
    case "workflow_node": {
      const { run_id: o, node_id: a, parent_id: t, name: d, state: l, started_at: c, duration_ms: u, metadata: s } = e.payload, f = r.workflowRuns[o] ?? { nodes: {}, nodeOrder: [] }, h = f.nodeOrder.includes(a) ? f.nodeOrder : [...f.nodeOrder, a];
      n = {
        ...r,
        workflowRunOrder: r.workflowRunOrder.includes(o) ? r.workflowRunOrder : [...r.workflowRunOrder, o],
        workflowRuns: {
          ...r.workflowRuns,
          [o]: {
            run_id: o,
            nodes: {
              ...f.nodes,
              [a]: { node_id: a, run_id: o, parent_id: t, name: d, state: l, started_at: c, duration_ms: u, metadata: s }
            },
            nodeOrder: h
          }
        }
      };
      break;
    }
    case "done":
      n = { ...r, status: "done" };
      break;
    case "error":
      n = {
        ...r,
        status: "error",
        errorMessage: e.payload.message,
        errorCode: e.payload.code ?? null
      };
      break;
    case "extension": {
      const o = e.payload.name, a = m(o);
      let t = {
        ...r,
        extensions: {
          ...r.extensions,
          [a]: [
            ...r.extensions[a] ?? [],
            { ...e, payload: { ...e.payload, name: a } }
          ]
        },
        extensionLog: [...r.extensionLog, e]
      };
      const d = e.payload.data ?? {};
      switch (a) {
        case "precondition_unmet": {
          t = {
            ...t,
            preconditionGaps: Array.isArray(d.missingDomains) ? d.missingDomains : [],
            preconditionSummary: typeof d.finalText == "string" ? d.finalText : null
          };
          break;
        }
        case "artifacts": {
          const l = Array.isArray(d.items) ? d.items : [], c = { ...t.artifacts }, u = [...t.artifactOrder];
          for (const s of l)
            s != null && s.id && (u.includes(s.id) || u.push(s.id), c[s.id] = {
              id: s.id,
              lang: s.type ?? "unknown",
              content: s.description ?? "",
              done: !0
            });
          t = { ...t, artifacts: c, artifactOrder: u };
          break;
        }
        case "react_result": {
          const l = d.usage ?? {}, c = t.totalUsage ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
          t = {
            ...t,
            totalUsage: {
              inputTokens: (c.inputTokens ?? 0) + (l.inputTokens ?? 0),
              outputTokens: (c.outputTokens ?? 0) + (l.outputTokens ?? 0),
              totalTokens: (c.totalTokens ?? 0) + (l.totalTokens ?? 0)
            },
            lastFinishReason: typeof d.finishReason == "string" ? d.finishReason : null
          };
          break;
        }
      }
      n = t;
      break;
    }
    default:
      return r;
  }
  const p = w(e);
  return b(n, e, p);
}
function S(r) {
  if (!r.startsWith("data: ")) return null;
  const e = r.slice(6).trim();
  if (e === "[DONE]")
    return { type: "done", schema_version: y, payload: {} };
  let i;
  try {
    i = JSON.parse(e);
  } catch {
    return null;
  }
  if (!i || typeof i != "object" || Array.isArray(i)) return null;
  const n = i;
  return typeof n.type != "string" || !n.payload || typeof n.payload != "object" || Array.isArray(n.payload) ? null : (n.schema_version || (n.schema_version = y), n);
}
function g(r) {
  const [e] = y.split(".").map(Number), [i] = (r.schema_version ?? "").split(".").map(Number);
  return i === e;
}
function A(r) {
  if (!g(r))
    throw new Error(
      `Meso protocol version mismatch: runtime expects ${y}, received ${r.schema_version}. Upgrade @meso.ai/types or your backend.`
    );
}
function E(r) {
  const e = r.state === "running" ? "active" : r.state === "pending" ? "pending" : r.state === "error" ? "error" : "done";
  return {
    id: r.id,
    label: r.name,
    status: e
  };
}
export {
  k as EXTENSION_PRESETS,
  y as PROTOCOL_VERSION,
  C as applyEvent,
  A as assertCompatibleVersion,
  _ as createInitialStreamState,
  x as createStreamStateWithArtifacts,
  g as isCompatibleVersion,
  R as isPresetExtension,
  S as parseSSELine,
  E as phaseRecordToStage,
  m as resolveExtensionAlias,
  T as streamStateHasArtifacts
};
