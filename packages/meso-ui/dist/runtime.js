const s = "1.0";
function d() {
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
function c(t, a) {
  switch (a.type) {
    case "stage": {
      const { name: e, state: o } = a.payload;
      return {
        ...t,
        stages: [
          ...t.stages.filter((n) => n.name !== e),
          { name: e, state: o }
        ]
      };
    }
    case "memory":
      return { ...t, memorySnippets: a.payload.snippets };
    case "memory_saved":
      return { ...t, memorySaved: [...t.memorySaved, a.payload] };
    case "soul":
      return { ...t, activeSoul: a.payload };
    case "tool_call": {
      const { id: e } = a.payload;
      return {
        ...t,
        toolCallOrder: t.toolCallOrder.includes(e) ? t.toolCallOrder : [...t.toolCallOrder, e],
        toolCalls: {
          ...t.toolCalls,
          [e]: { call: a.payload, status: "pending" }
        }
      };
    }
    case "tool_result": {
      const { tool_call_id: e } = a.payload, o = t.toolCalls[e], n = a.payload.error ? "error" : "done";
      return {
        ...t,
        toolCalls: {
          ...t.toolCalls,
          [e]: {
            call: (o == null ? void 0 : o.call) ?? { id: e, name: "(unknown)", args: {} },
            result: a.payload,
            status: n
          }
        }
      };
    }
    case "think":
      return {
        ...t,
        thinkContent: t.thinkContent + a.payload.delta,
        thinkDone: a.payload.done ?? !1
      };
    case "text":
      return { ...t, textContent: t.textContent + a.payload.delta };
    case "artifact": {
      const { id: e, lang: o, delta: n, done: r } = a.payload, l = t.artifacts[e], i = t.artifactOrder.includes(e) ? t.artifactOrder : [...t.artifactOrder, e];
      return {
        ...t,
        artifactOrder: i,
        artifacts: {
          ...t.artifacts,
          [e]: {
            id: e,
            lang: o,
            content: ((l == null ? void 0 : l.content) ?? "") + n,
            done: r ?? !1
          }
        }
      };
    }
    case "done":
      return { ...t, status: "done" };
    case "error":
      return {
        ...t,
        status: "error",
        errorMessage: a.payload.message
      };
    case "extension": {
      const { name: e } = a.payload;
      return {
        ...t,
        extensions: {
          ...t.extensions,
          [e]: [...t.extensions[e] ?? [], a]
        },
        extensionLog: [...t.extensionLog, a]
      };
    }
    default:
      return t;
  }
}
function u(t) {
  if (!t.startsWith("data: ")) return null;
  const a = t.slice(6).trim();
  if (a === "[DONE]")
    return { type: "done", schema_version: s, payload: {} };
  let e;
  try {
    e = JSON.parse(a);
  } catch {
    return null;
  }
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const o = e;
  return typeof o.type != "string" || !o.payload || typeof o.payload != "object" || Array.isArray(o.payload) ? null : (o.schema_version || (o.schema_version = s), o);
}
export {
  s as PROTOCOL_VERSION,
  c as applyEvent,
  d as createInitialStreamState,
  u as parseSSELine
};
