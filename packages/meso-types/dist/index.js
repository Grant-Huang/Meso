const i = "1.0";
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
    phases: {},
    phaseOrder: [],
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
function h(r) {
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
function O(r, o) {
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
    case "think": {
      const { delta: e, done: a, phase_id: n } = o.payload;
      if (n) {
        const t = r.phases[n];
        return t ? {
          ...r,
          phases: {
            ...r.phases,
            [n]: {
              ...t,
              thinkContent: t.thinkContent + e
            }
          }
        } : r;
      }
      return {
        ...r,
        thinkContent: r.thinkContent + e,
        thinkDone: a ?? !1
      };
    }
    case "phase": {
      const { id: e, name: a, state: n, body: t, pinned_think: s, started_at: l, ended_at: u } = o.payload, d = r.phases[e];
      return {
        ...r,
        phaseOrder: r.phaseOrder.includes(e) ? r.phaseOrder : [...r.phaseOrder, e],
        phases: {
          ...r.phases,
          [e]: {
            id: e,
            name: a,
            state: n,
            thinkContent: (d == null ? void 0 : d.thinkContent) ?? "",
            pinnedThink: s ?? (d == null ? void 0 : d.pinnedThink),
            body: t ?? (d == null ? void 0 : d.body),
            startedAt: l ?? (d == null ? void 0 : d.startedAt),
            endedAt: u ?? (d == null ? void 0 : d.endedAt)
          }
        }
      };
    }
    case "text":
      return { ...r, textContent: r.textContent + o.payload.delta };
    case "artifact": {
      const { id: e, lang: a, delta: n, done: t } = o.payload, s = r.artifacts[e], l = r.artifactOrder.includes(e) ? r.artifactOrder : [...r.artifactOrder, e];
      return {
        ...r,
        artifactOrder: l,
        artifacts: {
          ...r.artifacts,
          [e]: {
            id: e,
            lang: a,
            content: ((s == null ? void 0 : s.content) ?? "") + n,
            done: t ?? !1
          }
        }
      };
    }
    case "workflow_node": {
      const { run_id: e, node_id: a, parent_id: n, name: t, state: s, started_at: l, duration_ms: u, metadata: d } = o.payload, c = r.workflowRuns[e] ?? { nodes: {}, nodeOrder: [] }, p = c.nodeOrder.includes(a) ? c.nodeOrder : [...c.nodeOrder, a];
      return {
        ...r,
        workflowRunOrder: r.workflowRunOrder.includes(e) ? r.workflowRunOrder : [...r.workflowRunOrder, e],
        workflowRuns: {
          ...r.workflowRuns,
          [e]: {
            run_id: e,
            nodes: {
              ...c.nodes,
              [a]: { node_id: a, run_id: e, parent_id: n, name: t, state: s, started_at: l, duration_ms: u, metadata: d }
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
function k(r) {
  if (!r.startsWith("data: ")) return null;
  const o = r.slice(6).trim();
  if (o === "[DONE]")
    return { type: "done", schema_version: i, payload: {} };
  let e;
  try {
    e = JSON.parse(o);
  } catch {
    return null;
  }
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const a = e;
  return typeof a.type != "string" || !a.payload || typeof a.payload != "object" || Array.isArray(a.payload) ? null : (a.schema_version || (a.schema_version = i), a);
}
function y(r) {
  const [o] = i.split(".").map(Number), [e] = (r.schema_version ?? "").split(".").map(Number);
  return e === o;
}
function w(r) {
  if (!y(r))
    throw new Error(
      `Meso protocol version mismatch: runtime expects ${i}, received ${r.schema_version}. Upgrade @meso.ai/types or your backend.`
    );
}
function C(r, o) {
  return {
    id: o,
    label: r.name,
    status: r.state
  };
}
export {
  i as PROTOCOL_VERSION,
  O as applyEvent,
  w as assertCompatibleVersion,
  f as createInitialStreamState,
  h as createStreamStateWithArtifacts,
  y as isCompatibleVersion,
  k as parseSSELine,
  C as stagePayloadToStage,
  m as streamStateHasArtifacts
};
