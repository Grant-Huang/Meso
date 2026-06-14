import { createInitialStreamState as u, parseSSELine as M, applyEvent as b } from "@meso.ai/types";
class O {
  constructor(e) {
    this.data = { ...(e == null ? void 0 : e.initial) ?? {} };
  }
  async getMessages(e) {
    return [...this.data[e] ?? []];
  }
  async saveMessages(e, t) {
    this.data[e] = [...t];
  }
}
class C {
  async stream(e, t) {
    const l = e.method ?? (e.body ? "POST" : "GET"), o = await fetch(e.url, {
      method: l,
      headers: {
        ...l === "POST" ? { "Content-Type": "application/json" } : {},
        ...e.headers
      },
      body: e.body ? JSON.stringify(e.body) : void 0,
      signal: e.signal
    });
    if (!o.ok) throw new Error(`HTTP ${o.status}`);
    const g = o.body.getReader(), h = new TextDecoder();
    let s = "", n = { ...u(), status: "streaming" };
    for (; ; ) {
      const { done: c, value: r } = await g.read();
      if (c) break;
      s += h.decode(r, { stream: !0 });
      const d = s.split(`
`);
      s = d.pop() ?? "";
      for (const y of d) {
        const i = M(y);
        if (i && (n = b(n, i), t(i, n), i.type === "done" || i.type === "error"))
          return n;
      }
    }
    return n;
  }
}
class I {
  constructor(e) {
    this.url = (e == null ? void 0 : e.url) ?? "/api/tools/confirm", this.headers = (e == null ? void 0 : e.headers) ?? {};
  }
  async confirm(e) {
    const t = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...this.headers },
      body: JSON.stringify(e)
    });
    if (!t.ok) throw new Error(`Tool confirm failed: HTTP ${t.status}`);
  }
}
async function P(a, e, t, l) {
  await a.confirm({
    tool_call_id: e,
    approved: t,
    session_id: l
  });
}
let T = 0;
function p(a) {
  return T += 1, `${a}-${T}`;
}
function _(a) {
  const {
    sessionId: e,
    streamUrl: t,
    transport: l = new C(),
    store: o = new O(),
    confirmChannel: g = new I(),
    headers: h,
    onStreamState: s
  } = a;
  let n = [], c = u(), r = null;
  const d = async () => {
    await o.saveMessages(e, n);
  };
  return {
    sessionId: e,
    get messages() {
      return n;
    },
    get streaming() {
      return c;
    },
    async load() {
      n = await o.getMessages(e);
    },
    resetStream() {
      r == null || r.abort(), c = u(), s == null || s(c);
    },
    async sendMessage(i) {
      r == null || r.abort(), r = new AbortController();
      const m = {
        id: p("user"),
        role: "user",
        content: i,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      n = [...n, m], await d(), c = { ...u(), status: "streaming" }, s == null || s(c);
      const f = await l.stream(
        {
          url: t,
          method: "POST",
          headers: h,
          body: { session_id: e, message: i },
          signal: r.signal
        },
        (E, w) => {
          c = w, s == null || s(w);
        }
      );
      c = f, s == null || s(f);
      const v = {
        id: p("assistant"),
        role: "assistant",
        content: f.textContent,
        streamState: f,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      n = [...n, v], await d();
    },
    async confirmToolCall(i, m) {
      await P(g, i, m, e);
    }
  };
}
function $(a) {
  return a.split(`
`).reduce(
    (t, l) => {
      const o = M(l);
      return o ? b(t, o) : t;
    },
    { ...u(), status: "streaming" }
  );
}
export {
  I as FetchConfirmChannel,
  C as FetchMesoTransport,
  O as InMemorySessionStore,
  P as confirmTool,
  _ as createMesoSession,
  $ as replayTurn
};
