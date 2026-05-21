const t = "1.0";
function i() {
  return {
    status: "idle",
    stages: [],
    memorySnippets: [],
    memorySaved: [],
    activeSoul: null,
    thinkContent: "",
    thinkDone: !1,
    textContent: "",
    artifacts: {},
    artifactOrder: [],
    toolCalls: {},
    toolCallOrder: [],
    extensions: {},
    extensionLog: [],
    errorMessage: null
  };
}
function d(r, a) {
  switch (a.type) {
    case "stage": {
      const { name: o, state: l } = a.payload;
      return {
        ...r,
        stages: [
          ...r.stages.filter((n) => n.name !== o),
          { name: o, state: l }
        ]
      };
    }
    case "memory":
      return { ...r, memorySnippets: a.payload.snippets };
    case "memory_saved":
      return { ...r, memorySaved: [...r.memorySaved, a.payload] };
    case "soul":
      return { ...r, activeSoul: a.payload };
    case "tool_call": {
      const { id: o } = a.payload;
      return {
        ...r,
        toolCallOrder: r.toolCallOrder.includes(o) ? r.toolCallOrder : [...r.toolCallOrder, o],
        toolCalls: {
          ...r.toolCalls,
          [o]: { call: a.payload, status: "pending" }
        }
      };
    }
    case "tool_result": {
      const { tool_call_id: o } = a.payload, l = r.toolCalls[o], n = a.payload.error ? "error" : "done";
      return {
        ...r,
        toolCalls: {
          ...r.toolCalls,
          [o]: {
            call: (l == null ? void 0 : l.call) ?? { id: o, name: "(unknown)", args: {} },
            result: a.payload,
            status: n
          }
        }
      };
    }
    case "think":
      return {
        ...r,
        thinkContent: r.thinkContent + a.payload.delta,
        thinkDone: a.payload.done ?? !1
      };
    case "text":
      return { ...r, textContent: r.textContent + a.payload.delta };
    case "artifact": {
      const { id: o, lang: l, delta: n, done: s } = a.payload, e = r.artifacts[o], c = r.artifactOrder.includes(o) ? r.artifactOrder : [...r.artifactOrder, o];
      return {
        ...r,
        artifactOrder: c,
        artifacts: {
          ...r.artifacts,
          [o]: {
            id: o,
            lang: l,
            content: ((e == null ? void 0 : e.content) ?? "") + n,
            done: s ?? !1
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
        errorMessage: a.payload.message
      };
    case "extension": {
      const { name: o } = a.payload;
      return {
        ...r,
        extensions: {
          ...r.extensions,
          [o]: [...r.extensions[o] ?? [], a]
        },
        extensionLog: [...r.extensionLog, a]
      };
    }
    default:
      return r;
  }
}
function u(r) {
  if (!r.startsWith("data: ")) return null;
  const a = r.slice(6).trim();
  if (a === "[DONE]")
    return { type: "done", schema_version: t, payload: {} };
  let o;
  try {
    o = JSON.parse(a);
  } catch {
    return null;
  }
  if (!o || typeof o != "object" || Array.isArray(o)) return null;
  const l = o;
  return typeof l.type != "string" || !l.payload || typeof l.payload != "object" || Array.isArray(l.payload) ? null : (l.schema_version || (l.schema_version = t), l);
}
export {
  t as PROTOCOL_VERSION,
  d as applyEvent,
  i as createInitialStreamState,
  u as parseSSELine
};
