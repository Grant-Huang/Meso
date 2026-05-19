import { jsxs as i, jsx as t } from "react/jsx-runtime";
import $, { useState as _, useRef as p, useEffect as y, useCallback as k } from "react";
function U({
  navItems: a = [],
  sidebarFooter: e,
  sessionColumn: s,
  children: r,
  defaultCollapsed: c = !1,
  appName: o = "Meso",
  mainHeader: m
}) {
  const [n, l] = _(c);
  return /* @__PURE__ */ i("div", { className: "meso-layout", children: [
    /* @__PURE__ */ i("aside", { className: `meso-sidebar${n ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ i("div", { className: "meso-sidebar__header", children: [
        /* @__PURE__ */ t("div", { className: "meso-sidebar__logo", children: o[0] }),
        /* @__PURE__ */ t("span", { className: "meso-sidebar__title", children: o }),
        /* @__PURE__ */ t(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => l(!n),
            "aria-label": n ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ i("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ t("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ t("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ t("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ t("nav", { className: "meso-sidebar__nav", children: a.map((d) => /* @__PURE__ */ i(
        "div",
        {
          className: `meso-sidebar__nav-item${d.active ? " meso-sidebar__nav-item--active" : ""}`,
          onClick: d.onClick,
          title: d.label,
          children: [
            /* @__PURE__ */ t("span", { className: "meso-sidebar__nav-icon", children: d.icon }),
            /* @__PURE__ */ t("span", { className: "meso-sidebar__nav-label", children: d.label })
          ]
        },
        d.id
      )) }),
      e && /* @__PURE__ */ t("div", { className: "meso-sidebar__footer", children: e })
    ] }),
    /* @__PURE__ */ t("div", { className: "meso-session-col", children: s }),
    /* @__PURE__ */ i("main", { className: "meso-main", children: [
      m && /* @__PURE__ */ t("div", { className: "meso-main__header", children: m }),
      /* @__PURE__ */ t("div", { className: "meso-main__content", children: r })
    ] })
  ] });
}
function T({ role: a, content: e, streaming: s = !1, timestamp: r }) {
  return /* @__PURE__ */ i("div", { className: `meso-bubble meso-bubble--${a}`, children: [
    a === "assistant" && /* @__PURE__ */ t("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ i("div", { className: "meso-bubble__body", children: [
      /* @__PURE__ */ i("div", { className: "meso-bubble__content", children: [
        e.split(`
`).map((c, o) => /* @__PURE__ */ i($.Fragment, { children: [
          o > 0 && /* @__PURE__ */ t("br", {}),
          c
        ] }, o)),
        s && /* @__PURE__ */ t("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      r && /* @__PURE__ */ t("div", { className: "meso-bubble__timestamp", children: r })
    ] })
  ] });
}
function j({ content: a, streaming: e = !1, autoCollapseDelay: s = 1500 }) {
  const [r, c] = _(!0), o = p(e);
  return y(() => {
    if (o.current && !e) {
      const m = setTimeout(() => c(!1), s);
      return () => clearTimeout(m);
    }
    o.current = e;
  }, [e, s]), /* @__PURE__ */ i("div", { className: `meso-think${r ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ i(
      "button",
      {
        className: "meso-think__header",
        onClick: () => c(!r),
        "aria-expanded": r,
        children: [
          /* @__PURE__ */ t("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ t("span", { className: "meso-think__label", children: "思考过程" }),
          e && /* @__PURE__ */ t("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ t("div", { className: "meso-think__body", children: /* @__PURE__ */ i("div", { className: "meso-think__content", children: [
      a,
      e && /* @__PURE__ */ t("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function H({ active: a = !0 }) {
  return a ? /* @__PURE__ */ t("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function R({ type: a, content: e, language: s = "plaintext", streaming: r = !1, onCopy: c, onDownload: o }) {
  const [m, n] = _(!1), l = () => {
    navigator.clipboard.writeText(e).catch(() => {
    }), n(!0), setTimeout(() => n(!1), 2e3), c == null || c(e);
  }, d = () => {
    if (o) {
      o(e);
      return;
    }
    const h = a === "html" ? "html" : a === "mermaid" ? "md" : s || "txt", b = new Blob([e], { type: "text/plain" }), u = document.createElement("a");
    u.href = URL.createObjectURL(b), u.download = `artifact.${h}`, u.click(), URL.revokeObjectURL(u.href);
  };
  return /* @__PURE__ */ i("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ i("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ t("div", { className: "meso-artifact__tabs", children: (a === "html" ? ["html", "code"] : [a]).map((h) => /* @__PURE__ */ t("span", { className: "meso-artifact__tab meso-artifact__tab--active", children: A(h, s) }, h)) }),
      r && /* @__PURE__ */ t("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ t(
        "button",
        {
          className: "meso-artifact__download-btn",
          onClick: d,
          title: "下载",
          "aria-label": "下载文件",
          children: /* @__PURE__ */ t("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) })
        }
      ),
      /* @__PURE__ */ t(
        "button",
        {
          className: "meso-artifact__copy-btn",
          onClick: l,
          title: "复制",
          "aria-label": "复制代码",
          children: m ? /* @__PURE__ */ t("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ i("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ t("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
            /* @__PURE__ */ t("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ t("div", { className: "meso-artifact__body", children: a === "html" ? /* @__PURE__ */ t(
      "iframe",
      {
        className: "meso-artifact__preview",
        srcDoc: e,
        sandbox: "allow-scripts",
        title: "HTML 预览"
      }
    ) : /* @__PURE__ */ i("pre", { className: "meso-artifact__code", children: [
      /* @__PURE__ */ t("code", { children: e }),
      r && /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function A(a, e) {
  return a === "html" ? "HTML 预览" : a === "mermaid" ? "图表" : e || "Code";
}
function B({ stages: a, compact: e = !1 }) {
  return a.length === 0 ? null : /* @__PURE__ */ t("div", { className: `meso-stages${e ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: a.map((s, r) => /* @__PURE__ */ i(
    "div",
    {
      className: `meso-stage meso-stage--${s.status}`,
      children: [
        /* @__PURE__ */ t("div", { className: "meso-stage__dot", children: s.status === "done" ? /* @__PURE__ */ t("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("polyline", { points: "1.5,5.5 4,8 8.5,2.5" }) }) : /* @__PURE__ */ t("span", { className: "meso-stage__dot-inner" }) }),
        r < a.length - 1 && /* @__PURE__ */ t("div", { className: `meso-stage__line${s.status === "done" ? " meso-stage__line--done" : ""}` }),
        !e && /* @__PURE__ */ t("span", { className: "meso-stage__label", children: s.label }),
        e && /* @__PURE__ */ t("span", { className: "meso-stage__label meso-stage__label--compact", children: s.label })
      ]
    },
    s.id
  )) });
}
function G({
  messages: a,
  streaming: e,
  onArtifactCopy: s,
  onArtifactDownload: r,
  emptyState: c,
  className: o
}) {
  const m = p(null);
  y(() => {
    var l;
    (l = m.current) == null || l.scrollIntoView({ behavior: "smooth" });
  }, [a, e]);
  const n = a.length > 0 || e && e.status !== "idle";
  return /* @__PURE__ */ t("div", { className: `meso-message-list${o ? ` ${o}` : ""}`, children: /* @__PURE__ */ i("div", { className: "meso-message-list__inner", children: [
    !n && c && /* @__PURE__ */ t("div", { className: "meso-message-list__empty", children: c }),
    a.map((l) => /* @__PURE__ */ t(
      T,
      {
        role: l.role,
        content: l.content,
        timestamp: l.timestamp
      },
      l.id
    )),
    e && e.status !== "idle" && /* @__PURE__ */ i("div", { className: "meso-message-list__live", children: [
      e.stages.length > 0 && !e.stages.every((l) => l.status === "done") && /* @__PURE__ */ t(
        B,
        {
          stages: e.stages.map((l) => ({
            id: l.label,
            label: l.label,
            status: l.status === "done" ? "done" : "active"
          }))
        }
      ),
      e.memoryItems.length > 0 && /* @__PURE__ */ t("div", { className: "meso-memory-chips", children: e.memoryItems.map((l, d) => /* @__PURE__ */ t("span", { className: "meso-memory-chip", children: l }, d)) }),
      e.thinkContent && /* @__PURE__ */ t(j, { content: e.thinkContent, streaming: !e.thinkDone }),
      (e.textContent || e.status === "streaming") && /* @__PURE__ */ t(
        T,
        {
          role: "assistant",
          content: e.textContent,
          streaming: e.status === "streaming" && !e.artifact
        }
      ),
      e.artifact && /* @__PURE__ */ t(
        R,
        {
          type: e.artifact.type,
          content: e.artifact.content,
          language: e.artifact.language,
          streaming: !e.artifact_done,
          onCopy: s,
          onDownload: r
        }
      )
    ] }),
    /* @__PURE__ */ t("div", { ref: m })
  ] }) });
}
const v = {
  status: "idle",
  stages: [],
  memoryItems: [],
  thinkContent: "",
  thinkDone: !1,
  textContent: "",
  artifact: null,
  artifact_done: !1,
  errorMessage: null
};
function J(a) {
  const [e, s] = _(v), r = p(null), c = k(() => {
    var n;
    (n = r.current) == null || n.abort(), s((l) => ({ ...l, status: "idle" }));
  }, []), o = k(() => {
    var n;
    (n = r.current) == null || n.abort(), s(v);
  }, []), m = k(async (n) => {
    var N;
    (N = r.current) == null || N.abort();
    const l = new AbortController();
    r.current = l, s({ ...v, status: "streaming" });
    const d = (n == null ? void 0 : n.method) ?? (n != null && n.body ? "POST" : "GET");
    try {
      const h = await fetch(a, {
        method: d,
        headers: {
          ...d === "POST" ? { "Content-Type": "application/json" } : {},
          ...n == null ? void 0 : n.headers
        },
        body: n != null && n.body ? JSON.stringify(n.body) : void 0,
        signal: l.signal
      });
      if (!h.ok)
        throw new Error(`HTTP ${h.status}`);
      const b = h.body.getReader(), u = new TextDecoder();
      let g = "";
      for (; ; ) {
        const { done: S, value: E } = await b.read();
        if (S) break;
        g += u.decode(E, { stream: !0 });
        const w = g.split(`
`);
        g = w.pop() ?? "";
        for (const x of w) {
          if (!x.startsWith("data: ")) continue;
          const C = x.slice(6).trim();
          if (C === "[DONE]") return;
          let f;
          try {
            f = JSON.parse(C);
          } catch {
            continue;
          }
          if (s((M) => I(M, f)), f.type === "done" || f.type === "error") return;
        }
      }
    } catch (h) {
      if (h.name === "AbortError") return;
      s((b) => ({
        ...b,
        status: "error",
        errorMessage: h.message
      }));
    }
  }, [a]);
  return { state: e, start: m, abort: c, reset: o };
}
function I(a, e) {
  var s;
  switch (e.type) {
    case "stage":
      return {
        ...a,
        stages: [
          ...a.stages.filter((r) => r.label !== e.label),
          e
        ]
      };
    case "memory":
      return { ...a, memoryItems: e.items };
    case "think":
      return {
        ...a,
        thinkContent: a.thinkContent + e.delta,
        thinkDone: e.done ?? !1
      };
    case "text":
      return { ...a, textContent: a.textContent + e.delta };
    case "artifact":
      return {
        ...a,
        artifact: {
          type: e.artifactType,
          language: e.language,
          content: (((s = a.artifact) == null ? void 0 : s.content) ?? "") + e.delta
        },
        artifact_done: e.done ?? !1
      };
    case "done":
      return { ...a, status: "done" };
    case "error":
      return { ...a, status: "error", errorMessage: e.message };
    default:
      return a;
  }
}
const L = "meso-theme";
function O() {
  return typeof window > "u" ? "light" : localStorage.getItem(L) ?? "light";
}
function W(a) {
  document.documentElement.setAttribute("data-theme", a), localStorage.setItem(L, a);
}
function V() {
  const [a, e] = _(O);
  y(() => {
    W(a);
  }, [a]);
  const s = k(() => {
    e((r) => r === "light" ? "dark" : "light");
  }, []);
  return { theme: a, toggle: s };
}
export {
  R as ArtifactPanel,
  T as ChatBubble,
  G as MessageList,
  B as StageTimeline,
  H as StreamingCursor,
  j as ThinkBlock,
  U as ThreeColumnLayout,
  J as useSSEStream,
  V as useTheme
};
