import { jsxs as i, jsx as e } from "react/jsx-runtime";
import L, { useState as f, useRef as g, useEffect as y, useCallback as p } from "react";
import { createInitialStreamState as k, parseSSELine as R, applyEvent as $ } from "./runtime.js";
import { PROTOCOL_VERSION as z } from "./runtime.js";
function V({
  navItems: a = [],
  sidebarFooter: t,
  sessionColumn: n,
  children: l,
  defaultCollapsed: d = !1,
  appName: c = "Meso",
  mainHeader: h
}) {
  const [s, u] = f(d);
  return /* @__PURE__ */ i("div", { className: "meso-layout", children: [
    /* @__PURE__ */ i("aside", { className: `meso-sidebar${s ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ i("div", { className: "meso-sidebar__header", children: [
        /* @__PURE__ */ e("div", { className: "meso-sidebar__logo", children: c[0] }),
        /* @__PURE__ */ e("span", { className: "meso-sidebar__title", children: c }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => u(!s),
            "aria-label": s ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ i("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ e("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ e("nav", { className: "meso-sidebar__nav", children: a.map((m) => /* @__PURE__ */ i(
        "div",
        {
          className: `meso-sidebar__nav-item${m.active ? " meso-sidebar__nav-item--active" : ""}`,
          onClick: m.onClick,
          title: m.label,
          children: [
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-icon", children: m.icon }),
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-label", children: m.label })
          ]
        },
        m.id
      )) }),
      t && /* @__PURE__ */ e("div", { className: "meso-sidebar__footer", children: t })
    ] }),
    /* @__PURE__ */ e("div", { className: "meso-session-col", children: n }),
    /* @__PURE__ */ i("main", { className: "meso-main", children: [
      h && /* @__PURE__ */ e("div", { className: "meso-main__header", children: h }),
      /* @__PURE__ */ e("div", { className: "meso-main__content", children: l })
    ] })
  ] });
}
function x({ role: a, content: t, streaming: n = !1, timestamp: l }) {
  return /* @__PURE__ */ i("div", { className: `meso-bubble meso-bubble--${a}`, children: [
    a === "assistant" && /* @__PURE__ */ e("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ i("div", { className: "meso-bubble__body", children: [
      /* @__PURE__ */ i("div", { className: "meso-bubble__content", children: [
        t.split(`
`).map((d, c) => /* @__PURE__ */ i(L.Fragment, { children: [
          c > 0 && /* @__PURE__ */ e("br", {}),
          d
        ] }, c)),
        n && /* @__PURE__ */ e("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      l && /* @__PURE__ */ e("div", { className: "meso-bubble__timestamp", children: l })
    ] })
  ] });
}
function j({ content: a, streaming: t = !1, autoCollapseDelay: n = 1500 }) {
  const [l, d] = f(!0), c = g(t);
  return y(() => {
    if (c.current && !t) {
      const h = setTimeout(() => d(!1), n);
      return () => clearTimeout(h);
    }
    c.current = t;
  }, [t, n]), /* @__PURE__ */ i("div", { className: `meso-think${l ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ i(
      "button",
      {
        className: "meso-think__header",
        onClick: () => d(!l),
        "aria-expanded": l,
        children: [
          /* @__PURE__ */ e("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ e("span", { className: "meso-think__label", children: "思考过程" }),
          t && /* @__PURE__ */ e("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { className: "meso-think__body", children: /* @__PURE__ */ i("div", { className: "meso-think__content", children: [
      a,
      t && /* @__PURE__ */ e("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function G({ active: a = !0 }) {
  return a ? /* @__PURE__ */ e("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function A({ type: a, content: t, language: n = "plaintext", streaming: l = !1, onCopy: d, onDownload: c }) {
  const [h, s] = f(!1), u = () => {
    navigator.clipboard.writeText(t).catch(() => {
    }), s(!0), setTimeout(() => s(!1), 2e3), d == null || d(t);
  }, m = () => {
    if (c) {
      c(t);
      return;
    }
    const o = a === "html" ? "html" : a === "mermaid" ? "md" : n || "txt", b = new Blob([t], { type: "text/plain" }), _ = document.createElement("a");
    _.href = URL.createObjectURL(b), _.download = `artifact.${o}`, _.click(), URL.revokeObjectURL(_.href);
  };
  return /* @__PURE__ */ i("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ i("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ e("div", { className: "meso-artifact__tabs", children: (a === "html" ? ["html", "code"] : [a]).map((o) => /* @__PURE__ */ e("span", { className: "meso-artifact__tab meso-artifact__tab--active", children: B(o, n) }, o)) }),
      l && /* @__PURE__ */ e("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ e(
        "button",
        {
          className: "meso-artifact__download-btn",
          onClick: m,
          title: "下载",
          "aria-label": "下载文件",
          children: /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) })
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: "meso-artifact__copy-btn",
          onClick: u,
          title: "复制",
          "aria-label": "复制代码",
          children: h ? /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ i("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ e("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
            /* @__PURE__ */ e("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ e("div", { className: "meso-artifact__body", children: a === "html" ? /* @__PURE__ */ e(
      "iframe",
      {
        className: "meso-artifact__preview",
        srcDoc: t,
        sandbox: "allow-scripts",
        title: "HTML 预览"
      }
    ) : /* @__PURE__ */ i("pre", { className: "meso-artifact__code", children: [
      /* @__PURE__ */ e("code", { children: t }),
      l && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function B(a, t) {
  return a === "html" ? "HTML 预览" : a === "mermaid" ? "图表" : t || "Code";
}
function M({ stages: a, compact: t = !1 }) {
  return a.length === 0 ? null : /* @__PURE__ */ e("div", { className: `meso-stages${t ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: a.map((n, l) => /* @__PURE__ */ i(
    "div",
    {
      className: `meso-stage meso-stage--${n.status}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-stage__dot", children: n.status === "done" ? /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,5.5 4,8 8.5,2.5" }) }) : /* @__PURE__ */ e("span", { className: "meso-stage__dot-inner" }) }),
        l < a.length - 1 && /* @__PURE__ */ e("div", { className: `meso-stage__line${n.status === "done" ? " meso-stage__line--done" : ""}` }),
        !t && /* @__PURE__ */ e("span", { className: "meso-stage__label", children: n.label }),
        t && /* @__PURE__ */ e("span", { className: "meso-stage__label meso-stage__label--compact", children: n.label })
      ]
    },
    n.id
  )) });
}
function I(a) {
  return a === "html preview" ? { type: "html" } : a === "mermaid" ? { type: "mermaid" } : { type: "code", language: a };
}
function F({
  messages: a,
  streaming: t,
  onArtifactCopy: n,
  onArtifactDownload: l,
  emptyState: d,
  className: c,
  renderExtension: h
}) {
  const s = g(null);
  y(() => {
    var r;
    (r = s.current) == null || r.scrollIntoView({ behavior: "smooth" });
  }, [a, t]);
  const u = a.length > 0 || t && t.status !== "idle", m = t ? t.stages.every((r) => r.state === "done" || r.state === "error") : !0;
  return /* @__PURE__ */ e("div", { className: `meso-message-list${c ? ` ${c}` : ""}`, children: /* @__PURE__ */ i("div", { className: "meso-message-list__inner", children: [
    !u && d && /* @__PURE__ */ e("div", { className: "meso-message-list__empty", children: d }),
    a.map((r) => /* @__PURE__ */ e(
      x,
      {
        role: r.role,
        content: r.content,
        timestamp: r.timestamp
      },
      r.id
    )),
    t && t.status !== "idle" && /* @__PURE__ */ i("div", { className: "meso-message-list__live", children: [
      t.stages.length > 0 && !m && /* @__PURE__ */ e(
        M,
        {
          stages: t.stages.map((r) => ({
            id: r.name,
            label: r.name,
            status: r.state === "done" || r.state === "error" ? "done" : "active"
          }))
        }
      ),
      t.memorySnippets.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-chips", children: t.memorySnippets.map((r, o) => /* @__PURE__ */ i(
        "span",
        {
          className: "meso-memory-chip",
          title: r.content,
          children: [
            "[",
            r.category,
            "] ",
            r.content
          ]
        },
        o
      )) }),
      h && t.extensionLog.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__extensions", children: t.extensionLog.map((r, o) => /* @__PURE__ */ e(L.Fragment, { children: h(r) }, o)) }),
      t.thinkContent && /* @__PURE__ */ e(
        j,
        {
          content: t.thinkContent,
          streaming: !t.thinkDone
        }
      ),
      (t.textContent || t.status === "streaming") && /* @__PURE__ */ e(
        x,
        {
          role: "assistant",
          content: t.textContent,
          streaming: t.status === "streaming" && t.artifactOrder.length === 0
        }
      ),
      t.artifactOrder.map((r) => {
        const o = t.artifacts[r];
        if (!o) return null;
        const { type: b, language: _ } = I(o.lang);
        return /* @__PURE__ */ e(
          A,
          {
            type: b,
            content: o.content,
            language: _,
            streaming: !o.done,
            onCopy: n,
            onDownload: l
          },
          r
        );
      })
    ] }),
    /* @__PURE__ */ e("div", { ref: s })
  ] }) });
}
function J(a) {
  const [t, n] = f(k), l = g(null), d = p(() => {
    var s;
    (s = l.current) == null || s.abort(), n((u) => ({ ...u, status: "idle" }));
  }, []), c = p(() => {
    var s;
    (s = l.current) == null || s.abort(), n(k());
  }, []), h = p(async (s) => {
    var r;
    (r = l.current) == null || r.abort();
    const u = new AbortController();
    l.current = u, n({ ...k(), status: "streaming" });
    const m = (s == null ? void 0 : s.method) ?? (s != null && s.body ? "POST" : "GET");
    try {
      const o = await fetch(a, {
        method: m,
        headers: {
          ...m === "POST" ? { "Content-Type": "application/json" } : {},
          ...s == null ? void 0 : s.headers
        },
        body: s != null && s.body ? JSON.stringify(s.body) : void 0,
        signal: u.signal
      });
      if (!o.ok) throw new Error(`HTTP ${o.status}`);
      const b = o.body.getReader(), _ = new TextDecoder();
      let N = "";
      for (; ; ) {
        const { done: C, value: T } = await b.read();
        if (C) break;
        N += _.decode(T, { stream: !0 });
        const w = N.split(`
`);
        N = w.pop() ?? "";
        for (const E of w) {
          const v = R(E);
          if (v && (n((O) => $(O, v)), v.type === "done" || v.type === "error"))
            return;
        }
      }
    } catch (o) {
      if (o.name === "AbortError") return;
      n((b) => ({
        ...b,
        status: "error",
        errorMessage: o.message
      }));
    }
  }, [a]);
  return { state: t, start: h, abort: d, reset: c };
}
const S = "meso-theme";
function W() {
  return typeof window > "u" ? "light" : localStorage.getItem(S) ?? "light";
}
function P(a) {
  document.documentElement.setAttribute("data-theme", a), localStorage.setItem(S, a);
}
function K() {
  const [a, t] = f(W);
  y(() => {
    P(a);
  }, [a]);
  const n = p(() => {
    t((l) => l === "light" ? "dark" : "light");
  }, []);
  return { theme: a, toggle: n };
}
export {
  A as ArtifactPanel,
  x as ChatBubble,
  F as MessageList,
  z as PROTOCOL_VERSION,
  M as StageTimeline,
  G as StreamingCursor,
  j as ThinkBlock,
  V as ThreeColumnLayout,
  $ as applyEvent,
  k as createInitialStreamState,
  R as parseSSELine,
  J as useSSEStream,
  K as useTheme
};
