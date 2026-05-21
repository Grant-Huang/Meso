const s = "1.0";
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
function d(r, e) {
  switch (e.type) {
    case "stage": {
      const { name: t, state: n } = e.payload;
      return {
        ...r,
        stages: [
          ...r.stages.filter((a) => a.name !== t),
          { name: t, state: n }
        ]
      };
    }
    case "memory":
      return { ...r, memorySnippets: e.payload.snippets };
    case "think":
      return {
        ...r,
        thinkContent: r.thinkContent + e.payload.delta,
        thinkDone: e.payload.done ?? !1
      };
    case "text":
      return { ...r, textContent: r.textContent + e.payload.delta };
    case "artifact": {
      const { id: t, lang: n, delta: a, done: i } = e.payload, o = r.artifacts[t], c = r.artifactOrder.includes(t) ? r.artifactOrder : [...r.artifactOrder, t];
      return {
        ...r,
        artifactOrder: c,
        artifacts: {
          ...r.artifacts,
          [t]: {
            id: t,
            lang: n,
            content: ((o == null ? void 0 : o.content) ?? "") + a,
            done: i ?? !1
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
        errorMessage: e.payload.message
      };
    case "extension": {
      const { name: t } = e.payload;
      return {
        ...r,
        extensions: {
          ...r.extensions,
          [t]: [...r.extensions[t] ?? [], e]
        },
        extensionLog: [...r.extensionLog, e]
      };
    }
    default:
      return r;
  }
}
function u(r) {
  if (!r.startsWith("data: ")) return null;
  const e = r.slice(6).trim();
  if (e === "[DONE]")
    return { type: "done", schema_version: s, payload: {} };
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return null;
  }
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const n = t;
  return typeof n.type != "string" || !n.payload || typeof n.payload != "object" || Array.isArray(n.payload) ? null : (n.schema_version || (n.schema_version = s), n);
}
export {
  s as PROTOCOL_VERSION,
  d as applyEvent,
  l as createInitialStreamState,
  u as parseSSELine
};
