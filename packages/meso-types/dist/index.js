const p = "1.0";
function y() {
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
function O(r, e) {
  const d = new Set((e == null ? void 0 : e.excludeLangs) ?? []);
  return r.artifactOrder.some((o) => {
    const n = r.artifacts[o];
    return n != null && !d.has(n.lang) && !!n.content.trim();
  });
}
function C(r) {
  const e = {}, d = [];
  for (const o of r)
    e[o.id] = { id: o.id, lang: o.lang, content: o.content, done: !0 }, d.push(o.id);
  return {
    ...y(),
    status: "done",
    artifacts: e,
    artifactOrder: d
  };
}
function m(r, e) {
  const d = e.payload;
  switch (d && typeof d.narration == "string" && d.narration.length > 0 && (r = m(r, {
    type: "text",
    schema_version: "1.0",
    payload: { delta: d.narration + `

` }
  })), e.type) {
    case "capabilities":
      return { ...r, availableCapabilities: e.payload };
    case "memory":
      return { ...r, memorySnippets: e.payload.snippets };
    case "memory_saved":
      return { ...r, memorySaved: [...r.memorySaved, e.payload] };
    case "soul":
      return { ...r, activeSoul: e.payload };
    case "skill_active":
      return { ...r, activeSkill: e.payload };
    case "tool_call": {
      const { id: o, groupId: n, groupKind: a, risk: t, requires_confirm: s } = e.payload, i = s === !0 || t === "destructive" || t === "write" ? "awaiting_confirm" : "pending";
      return {
        ...r,
        toolCallOrder: r.toolCallOrder.includes(o) ? r.toolCallOrder : [...r.toolCallOrder, o],
        toolCalls: {
          ...r.toolCalls,
          [o]: { call: e.payload, status: i, groupId: n, groupKind: a }
        }
      };
    }
    case "tool_status": {
      const { id: o, status: n } = e.payload, a = r.toolCalls[o];
      return a ? {
        ...r,
        toolCalls: {
          ...r.toolCalls,
          [o]: { ...a, status: n }
        }
      } : r;
    }
    case "tool_result": {
      const { tool_call_id: o } = e.payload, n = r.toolCalls[o], a = e.payload.error ? "error" : "done";
      return {
        ...r,
        toolCalls: {
          ...r.toolCalls,
          [o]: {
            call: (n == null ? void 0 : n.call) ?? { id: o, name: "(unknown)", args: {} },
            result: e.payload,
            status: a,
            groupId: n == null ? void 0 : n.groupId,
            groupKind: n == null ? void 0 : n.groupKind
          }
        }
      };
    }
    case "resource_read": {
      const { id: o } = e.payload;
      return {
        ...r,
        resourceReadOrder: r.resourceReadOrder.includes(o) ? r.resourceReadOrder : [...r.resourceReadOrder, o],
        resourceReads: {
          ...r.resourceReads,
          [o]: { read: e.payload, status: "pending" }
        }
      };
    }
    case "resource_content": {
      const { resource_read_id: o } = e.payload, n = r.resourceReads[o], a = e.payload.error ? "error" : "done";
      return {
        ...r,
        resourceReads: {
          ...r.resourceReads,
          [o]: {
            read: (n == null ? void 0 : n.read) ?? { id: o, uri: "(unknown)" },
            content: e.payload,
            status: a
          }
        }
      };
    }
    case "think": {
      const { delta: o, done: n, phase_id: a } = e.payload;
      if (a) {
        const t = r.phases[a];
        return t ? {
          ...r,
          phases: {
            ...r.phases,
            [a]: {
              ...t,
              thinkContent: t.thinkContent + o
            }
          }
        } : r;
      }
      return {
        ...r,
        thinkContent: r.thinkContent + o,
        thinkDone: n ?? !1
      };
    }
    case "phase": {
      const { id: o, name: n, state: a, body: t, pinned_think: s, started_at: c, ended_at: i } = e.payload, l = r.phases[o];
      return {
        ...r,
        phaseOrder: r.phaseOrder.includes(o) ? r.phaseOrder : [...r.phaseOrder, o],
        phases: {
          ...r.phases,
          [o]: {
            id: o,
            name: n,
            state: a,
            thinkContent: (l == null ? void 0 : l.thinkContent) ?? "",
            pinnedThink: s ?? (l == null ? void 0 : l.pinnedThink),
            body: t ?? (l == null ? void 0 : l.body),
            startedAt: c ?? (l == null ? void 0 : l.startedAt),
            endedAt: i ?? (l == null ? void 0 : l.endedAt)
          }
        }
      };
    }
    case "text":
      return { ...r, textContent: r.textContent + e.payload.delta };
    case "artifact": {
      const { id: o, lang: n, delta: a, done: t } = e.payload, s = r.artifacts[o], c = r.artifactOrder.includes(o) ? r.artifactOrder : [...r.artifactOrder, o];
      return {
        ...r,
        artifactOrder: c,
        artifacts: {
          ...r.artifacts,
          [o]: {
            id: o,
            lang: n,
            content: ((s == null ? void 0 : s.content) ?? "") + a,
            done: t ?? !1
          }
        }
      };
    }
    case "workflow_node": {
      const { run_id: o, node_id: n, parent_id: a, name: t, state: s, started_at: c, duration_ms: i, metadata: l } = e.payload, u = r.workflowRuns[o] ?? { nodes: {}, nodeOrder: [] }, f = u.nodeOrder.includes(n) ? u.nodeOrder : [...u.nodeOrder, n];
      return {
        ...r,
        workflowRunOrder: r.workflowRunOrder.includes(o) ? r.workflowRunOrder : [...r.workflowRunOrder, o],
        workflowRuns: {
          ...r.workflowRuns,
          [o]: {
            run_id: o,
            nodes: {
              ...u.nodes,
              [n]: { node_id: n, run_id: o, parent_id: a, name: t, state: s, started_at: c, duration_ms: i, metadata: l }
            },
            nodeOrder: f
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
        errorMessage: e.payload.message,
        errorCode: e.payload.code ?? null
      };
    case "extension": {
      const { name: o } = e.payload;
      return {
        ...r,
        extensions: {
          ...r.extensions,
          [o]: [...r.extensions[o] ?? [], e]
        },
        extensionLog: [...r.extensionLog, e]
      };
    }
    default:
      return r;
  }
}
function k(r) {
  if (!r.startsWith("data: ")) return null;
  const e = r.slice(6).trim();
  if (e === "[DONE]")
    return { type: "done", schema_version: p, payload: {} };
  let d;
  try {
    d = JSON.parse(e);
  } catch {
    return null;
  }
  if (!d || typeof d != "object" || Array.isArray(d)) return null;
  const o = d;
  return typeof o.type != "string" || !o.payload || typeof o.payload != "object" || Array.isArray(o.payload) ? null : (o.schema_version || (o.schema_version = p), o);
}
function h(r) {
  const [e] = p.split(".").map(Number), [d] = (r.schema_version ?? "").split(".").map(Number);
  return d === e;
}
function _(r) {
  if (!h(r))
    throw new Error(
      `Meso protocol version mismatch: runtime expects ${p}, received ${r.schema_version}. Upgrade @meso.ai/types or your backend.`
    );
}
function w(r) {
  const e = r.state === "running" ? "active" : r.state === "pending" ? "pending" : r.state === "error" ? "error" : "done";
  return {
    id: r.id,
    label: r.name,
    status: e
  };
}
export {
  p as PROTOCOL_VERSION,
  m as applyEvent,
  _ as assertCompatibleVersion,
  y as createInitialStreamState,
  C as createStreamStateWithArtifacts,
  h as isCompatibleVersion,
  k as parseSSELine,
  w as phaseRecordToStage,
  O as streamStateHasArtifacts
};
