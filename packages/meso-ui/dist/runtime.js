const r = "1.0";
function l() {
  return {
    status: "idle",
    stages: [],
    memorySnippets: [],
    thinkContent: "",
    thinkDone: !1,
    textContent: "",
    artifacts: {},
    artifactOrder: [],
    extensions: {},
    extensionLog: [],
    errorMessage: null
  };
}
function d(t, a) {
  switch (a.type) {
    case "stage": {
      const { name: e, state: n } = a.payload;
      return {
        ...t,
        stages: [
          ...t.stages.filter((s) => s.name !== e),
          { name: e, state: n }
        ]
      };
    }
    case "memory":
      return { ...t, memorySnippets: a.payload.snippets };
    case "think":
      return {
        ...t,
        thinkContent: t.thinkContent + a.payload.delta,
        thinkDone: a.payload.done ?? !1
      };
    case "text":
      return { ...t, textContent: t.textContent + a.payload.delta };
    case "artifact": {
      const { id: e, lang: n, delta: s, done: i } = a.payload, o = t.artifacts[e], c = t.artifactOrder.includes(e) ? t.artifactOrder : [...t.artifactOrder, e];
      return {
        ...t,
        artifactOrder: c,
        artifacts: {
          ...t.artifacts,
          [e]: {
            id: e,
            lang: n,
            content: ((o == null ? void 0 : o.content) ?? "") + s,
            done: i ?? !1
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
    return { type: "done", schema_version: r, payload: {} };
  let e;
  try {
    e = JSON.parse(a);
  } catch {
    return null;
  }
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const n = e;
  return typeof n.type != "string" || !n.payload || typeof n.payload != "object" || Array.isArray(n.payload) ? null : (n.schema_version || (n.schema_version = r), n);
}
export {
  r as PROTOCOL_VERSION,
  d as applyEvent,
  l as createInitialStreamState,
  u as parseSSELine
};
