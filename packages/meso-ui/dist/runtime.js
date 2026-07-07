const f = "1.0", k = {
  precondition_unmet: { version: "1.0" },
  artifacts: { version: "1.0", aliases: ["nexus_artifacts"] },
  react_result: { version: "1.0" },
  step_trace: { version: "1.0", aliases: ["react_step_trace"] }
};
function C(e) {
  return e in k ? !0 : Object.values(k).some(
    (t) => Array.isArray(t.aliases) && t.aliases.includes(e)
  );
}
function m(e) {
  if (e in k) return e;
  for (const [t, r] of Object.entries(k))
    if (Array.isArray(r.aliases) && r.aliases.includes(e))
      return t;
  return e;
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
function x(e, t) {
  const r = new Set((t == null ? void 0 : t.excludeLangs) ?? []);
  return e.artifactOrder.some((n) => {
    const c = e.artifacts[n];
    return c != null && !r.has(c.lang) && !!c.content.trim();
  });
}
function R(e) {
  const t = {}, r = [];
  for (const n of e)
    t[n.id] = { id: n.id, lang: n.lang, content: n.content, done: !0 }, r.push(n.id);
  return {
    ..._(),
    status: "done",
    artifacts: t,
    artifactOrder: r
  };
}
function g(e) {
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
      return `text-${v(e).textChunkIndex}`;
    case "extension":
      return `ext-${m(t.name ?? "unknown")}`;
    default:
      return e.type;
  }
}
function v(e) {
  return {
    textChunkIndex: 0,
    // will be updated when processing text events
    ...e.payload
  };
}
function O(e, t, r) {
  var n;
  const c = {
    timestamp: e.eventLog.length,
    type: t.type,
    id: r,
    data: t.payload ?? {}
  };
  if (t.type === "text" && typeof ((n = t.payload) == null ? void 0 : n.delta) == "string") {
    const a = t.payload.delta, o = `text-${e.textChunks.length}`;
    return {
      ...e,
      eventLog: [...e.eventLog, { ...c, id: o }],
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
    eventLog: [...e.eventLog, c]
  };
}
function w(e, t) {
  const r = t.payload;
  r && typeof r.narration == "string" && r.narration.length > 0 && (e = w(e, {
    type: "text",
    schema_version: "1.0",
    payload: { delta: r.narration + `

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
      const { id: a, groupId: o, groupKind: s, risk: i, requires_confirm: d } = t.payload, u = d === !0 || i === "destructive" || i === "write" ? "awaiting_confirm" : "pending";
      n = {
        ...e,
        toolCallOrder: e.toolCallOrder.includes(a) ? e.toolCallOrder : [...e.toolCallOrder, a],
        toolCalls: {
          ...e.toolCalls,
          [a]: { call: t.payload, status: u, groupId: o, groupKind: s }
        }
      };
      break;
    }
    case "tool_status": {
      const { id: a, status: o } = t.payload, s = e.toolCalls[a];
      if (!s) return e;
      n = {
        ...e,
        toolCalls: {
          ...e.toolCalls,
          [a]: { ...s, status: o }
        }
      };
      break;
    }
    case "tool_result": {
      const { tool_call_id: a } = t.payload, o = e.toolCalls[a], s = t.payload.error ? "error" : "done";
      n = {
        ...e,
        toolCalls: {
          ...e.toolCalls,
          [a]: {
            call: (o == null ? void 0 : o.call) ?? { id: a, name: "(unknown)", args: {} },
            result: t.payload,
            status: s,
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
      const { resource_read_id: a } = t.payload, o = e.resourceReads[a], s = t.payload.error ? "error" : "done";
      n = {
        ...e,
        resourceReads: {
          ...e.resourceReads,
          [a]: {
            read: (o == null ? void 0 : o.read) ?? { id: a, uri: "(unknown)" },
            content: t.payload,
            status: s
          }
        }
      };
      break;
    }
    case "think": {
      const { delta: a, done: o, phase_id: s } = t.payload;
      if (s) {
        const i = e.phases[s];
        if (!i) return e;
        n = {
          ...e,
          phases: {
            ...e.phases,
            [s]: {
              ...i,
              thinkContent: i.thinkContent + a
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
      const { id: a, name: o, state: s, body: i, pinned_think: d, started_at: u, ended_at: p } = t.payload, l = e.phases[a];
      n = {
        ...e,
        phaseOrder: e.phaseOrder.includes(a) ? e.phaseOrder : [...e.phaseOrder, a],
        phases: {
          ...e.phases,
          [a]: {
            id: a,
            name: o,
            state: s,
            thinkContent: (l == null ? void 0 : l.thinkContent) ?? "",
            pinnedThink: d ?? (l == null ? void 0 : l.pinnedThink),
            body: i ?? (l == null ? void 0 : l.body),
            startedAt: u ?? (l == null ? void 0 : l.startedAt),
            endedAt: p ?? (l == null ? void 0 : l.endedAt)
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
      const { id: a, lang: o, delta: s, done: i } = t.payload, d = e.artifacts[a], u = e.artifactOrder.includes(a) ? e.artifactOrder : [...e.artifactOrder, a];
      n = {
        ...e,
        artifactOrder: u,
        artifacts: {
          ...e.artifacts,
          [a]: {
            id: a,
            lang: o,
            content: ((d == null ? void 0 : d.content) ?? "") + s,
            done: i ?? !1
          }
        }
      };
      break;
    }
    case "workflow_node": {
      const { run_id: a, node_id: o, parent_id: s, name: i, state: d, started_at: u, duration_ms: p, metadata: l } = t.payload, y = e.workflowRuns[a] ?? { nodes: {}, nodeOrder: [] }, h = y.nodeOrder.includes(o) ? y.nodeOrder : [...y.nodeOrder, o];
      n = {
        ...e,
        workflowRunOrder: e.workflowRunOrder.includes(a) ? e.workflowRunOrder : [...e.workflowRunOrder, a],
        workflowRuns: {
          ...e.workflowRuns,
          [a]: {
            run_id: a,
            nodes: {
              ...y.nodes,
              [o]: { node_id: o, run_id: a, parent_id: s, name: i, state: d, started_at: u, duration_ms: p, metadata: l }
            },
            nodeOrder: h
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
      const a = t.payload.name, o = m(a);
      let s = {
        ...e,
        extensions: {
          ...e.extensions,
          [o]: [
            ...e.extensions[o] ?? [],
            { ...t, payload: { ...t.payload, name: o } }
          ]
        },
        extensionLog: [...e.extensionLog, t]
      };
      const i = t.payload.data ?? {};
      switch (o) {
        case "precondition_unmet": {
          s = {
            ...s,
            preconditionGaps: Array.isArray(i.missingDomains) ? i.missingDomains : [],
            preconditionSummary: typeof i.finalText == "string" ? i.finalText : null
          };
          break;
        }
        case "artifacts": {
          const d = Array.isArray(i.items) ? i.items : [], u = { ...s.artifacts }, p = [...s.artifactOrder];
          for (const l of d)
            l != null && l.id && (p.includes(l.id) || p.push(l.id), u[l.id] = {
              id: l.id,
              lang: l.type ?? "unknown",
              content: l.description ?? "",
              done: !0
            });
          s = { ...s, artifacts: u, artifactOrder: p };
          break;
        }
        case "react_result": {
          const d = i.usage ?? {}, u = s.totalUsage ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
          s = {
            ...s,
            totalUsage: {
              inputTokens: (u.inputTokens ?? 0) + (d.inputTokens ?? 0),
              outputTokens: (u.outputTokens ?? 0) + (d.outputTokens ?? 0),
              totalTokens: (u.totalTokens ?? 0) + (d.totalTokens ?? 0)
            },
            lastFinishReason: typeof i.finishReason == "string" ? i.finishReason : null
          };
          break;
        }
      }
      n = s;
      break;
    }
    default:
      return e;
  }
  const c = g(t);
  return O(n, t, c);
}
function S(e) {
  if (!e.startsWith("data: ")) return null;
  const t = e.slice(6).trim();
  if (t === "[DONE]")
    return { type: "done", schema_version: f, payload: {} };
  let r;
  try {
    r = JSON.parse(t);
  } catch {
    return null;
  }
  if (!r || typeof r != "object" || Array.isArray(r)) return null;
  const n = r;
  return typeof n.type != "string" || !n.payload || typeof n.payload != "object" || Array.isArray(n.payload) ? null : (n.schema_version || (n.schema_version = f), n);
}
function b(e) {
  const [t] = f.split(".").map(Number), [r] = (e.schema_version ?? "").split(".").map(Number);
  return r === t;
}
function T(e) {
  if (!b(e))
    throw new Error(
      `Meso protocol version mismatch: runtime expects ${f}, received ${e.schema_version}. Upgrade @meso.ai/types or your backend.`
    );
}
function A(e) {
  const t = e.state === "running" ? "active" : e.state === "pending" ? "pending" : e.state === "error" ? "error" : "done";
  return {
    id: e.id,
    label: e.name,
    status: t
  };
}
export {
  k as EXTENSION_PRESETS,
  f as PROTOCOL_VERSION,
  w as applyEvent,
  T as assertCompatibleVersion,
  _ as createInitialStreamState,
  R as createStreamStateWithArtifacts,
  b as isCompatibleVersion,
  C as isPresetExtension,
  S as parseSSELine,
  A as phaseRecordToStage,
  m as resolveExtensionAlias,
  x as streamStateHasArtifacts
};
