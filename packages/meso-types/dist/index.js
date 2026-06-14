const u = "1.0";
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
function m(r, n) {
  const o = new Set((n == null ? void 0 : n.excludeLangs) ?? []);
  return r.artifactOrder.some((e) => {
    const a = r.artifacts[e];
    return a != null && !o.has(a.lang) && !!a.content.trim();
  });
}
function h(r) {
  const n = {}, o = [];
  for (const e of r)
    n[e.id] = { id: e.id, lang: e.lang, content: e.content, done: !0 }, o.push(e.id);
  return {
    ...f(),
    status: "done",
    artifacts: n,
    artifactOrder: o
  };
}
function O(r, n) {
  switch (n.type) {
    case "capabilities":
      return { ...r, availableCapabilities: n.payload };
    case "memory":
      return { ...r, memorySnippets: n.payload.snippets };
    case "memory_saved":
      return { ...r, memorySaved: [...r.memorySaved, n.payload] };
    case "soul":
      return { ...r, activeSoul: n.payload };
    case "skill_active":
      return { ...r, activeSkill: n.payload };
    case "tool_call": {
      const { id: o, groupId: e, groupKind: a, risk: l, requires_confirm: t } = n.payload, c = t === !0 || l === "destructive" || l === "write" ? "awaiting_confirm" : "pending";
      return {
        ...r,
        toolCallOrder: r.toolCallOrder.includes(o) ? r.toolCallOrder : [...r.toolCallOrder, o],
        toolCalls: {
          ...r.toolCalls,
          [o]: { call: n.payload, status: c, groupId: e, groupKind: a }
        }
      };
    }
    case "tool_status": {
      const { id: o, status: e } = n.payload, a = r.toolCalls[o];
      return a ? {
        ...r,
        toolCalls: {
          ...r.toolCalls,
          [o]: { ...a, status: e }
        }
      } : r;
    }
    case "tool_result": {
      const { tool_call_id: o } = n.payload, e = r.toolCalls[o], a = n.payload.error ? "error" : "done";
      return {
        ...r,
        toolCalls: {
          ...r.toolCalls,
          [o]: {
            call: (e == null ? void 0 : e.call) ?? { id: o, name: "(unknown)", args: {} },
            result: n.payload,
            status: a,
            groupId: e == null ? void 0 : e.groupId,
            groupKind: e == null ? void 0 : e.groupKind
          }
        }
      };
    }
    case "resource_read": {
      const { id: o } = n.payload;
      return {
        ...r,
        resourceReadOrder: r.resourceReadOrder.includes(o) ? r.resourceReadOrder : [...r.resourceReadOrder, o],
        resourceReads: {
          ...r.resourceReads,
          [o]: { read: n.payload, status: "pending" }
        }
      };
    }
    case "resource_content": {
      const { resource_read_id: o } = n.payload, e = r.resourceReads[o], a = n.payload.error ? "error" : "done";
      return {
        ...r,
        resourceReads: {
          ...r.resourceReads,
          [o]: {
            read: (e == null ? void 0 : e.read) ?? { id: o, uri: "(unknown)" },
            content: n.payload,
            status: a
          }
        }
      };
    }
    case "think": {
      const { delta: o, done: e, phase_id: a } = n.payload;
      if (a) {
        const l = r.phases[a];
        return l ? {
          ...r,
          phases: {
            ...r.phases,
            [a]: {
              ...l,
              thinkContent: l.thinkContent + o
            }
          }
        } : r;
      }
      return {
        ...r,
        thinkContent: r.thinkContent + o,
        thinkDone: e ?? !1
      };
    }
    case "phase": {
      const { id: o, name: e, state: a, body: l, pinned_think: t, started_at: s, ended_at: c } = n.payload, d = r.phases[o];
      return {
        ...r,
        phaseOrder: r.phaseOrder.includes(o) ? r.phaseOrder : [...r.phaseOrder, o],
        phases: {
          ...r.phases,
          [o]: {
            id: o,
            name: e,
            state: a,
            thinkContent: (d == null ? void 0 : d.thinkContent) ?? "",
            pinnedThink: t ?? (d == null ? void 0 : d.pinnedThink),
            body: l ?? (d == null ? void 0 : d.body),
            startedAt: s ?? (d == null ? void 0 : d.startedAt),
            endedAt: c ?? (d == null ? void 0 : d.endedAt)
          }
        }
      };
    }
    case "text":
      return { ...r, textContent: r.textContent + n.payload.delta };
    case "artifact": {
      const { id: o, lang: e, delta: a, done: l } = n.payload, t = r.artifacts[o], s = r.artifactOrder.includes(o) ? r.artifactOrder : [...r.artifactOrder, o];
      return {
        ...r,
        artifactOrder: s,
        artifacts: {
          ...r.artifacts,
          [o]: {
            id: o,
            lang: e,
            content: ((t == null ? void 0 : t.content) ?? "") + a,
            done: l ?? !1
          }
        }
      };
    }
    case "workflow_node": {
      const { run_id: o, node_id: e, parent_id: a, name: l, state: t, started_at: s, duration_ms: c, metadata: d } = n.payload, i = r.workflowRuns[o] ?? { nodes: {}, nodeOrder: [] }, p = i.nodeOrder.includes(e) ? i.nodeOrder : [...i.nodeOrder, e];
      return {
        ...r,
        workflowRunOrder: r.workflowRunOrder.includes(o) ? r.workflowRunOrder : [...r.workflowRunOrder, o],
        workflowRuns: {
          ...r.workflowRuns,
          [o]: {
            run_id: o,
            nodes: {
              ...i.nodes,
              [e]: { node_id: e, run_id: o, parent_id: a, name: l, state: t, started_at: s, duration_ms: c, metadata: d }
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
        errorMessage: n.payload.message,
        errorCode: n.payload.code ?? null
      };
    case "extension": {
      const { name: o } = n.payload;
      return {
        ...r,
        extensions: {
          ...r.extensions,
          [o]: [...r.extensions[o] ?? [], n]
        },
        extensionLog: [...r.extensionLog, n]
      };
    }
    default:
      return r;
  }
}
function C(r) {
  if (!r.startsWith("data: ")) return null;
  const n = r.slice(6).trim();
  if (n === "[DONE]")
    return { type: "done", schema_version: u, payload: {} };
  let o;
  try {
    o = JSON.parse(n);
  } catch {
    return null;
  }
  if (!o || typeof o != "object" || Array.isArray(o)) return null;
  const e = o;
  return typeof e.type != "string" || !e.payload || typeof e.payload != "object" || Array.isArray(e.payload) ? null : (e.schema_version || (e.schema_version = u), e);
}
function y(r) {
  const [n] = u.split(".").map(Number), [o] = (r.schema_version ?? "").split(".").map(Number);
  return o === n;
}
function k(r) {
  if (!y(r))
    throw new Error(
      `Meso protocol version mismatch: runtime expects ${u}, received ${r.schema_version}. Upgrade @meso.ai/types or your backend.`
    );
}
function w(r) {
  const n = r.state === "running" ? "active" : r.state === "pending" ? "pending" : r.state === "error" ? "error" : "done";
  return {
    id: r.id,
    label: r.name,
    status: n
  };
}
export {
  u as PROTOCOL_VERSION,
  O as applyEvent,
  k as assertCompatibleVersion,
  f as createInitialStreamState,
  h as createStreamStateWithArtifacts,
  y as isCompatibleVersion,
  C as parseSSELine,
  w as phaseRecordToStage,
  m as streamStateHasArtifacts
};
