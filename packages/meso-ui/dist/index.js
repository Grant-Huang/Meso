import { jsxs as n, jsx as r, Fragment as P } from "react/jsx-runtime";
import F, { useState as C, useRef as R, useEffect as I, useMemo as ge, useCallback as V, createContext as Ne, useContext as ne } from "react";
import { phaseRecordToStage as we, createInitialStreamState as G, parseSSELine as ke, applyEvent as be } from "./runtime.js";
import { PROTOCOL_VERSION as Nr, assertCompatibleVersion as wr, createStreamStateWithArtifacts as kr, isCompatibleVersion as br, streamStateHasArtifacts as yr } from "./runtime.js";
function ar({
  navItems: e = [],
  sidebarFooter: t,
  sessionColumn: s,
  children: o,
  defaultCollapsed: l = !1,
  appName: a = "Meso",
  sidebarLogo: c,
  sidebarTitle: i,
  mainHeader: u,
  artifactPanel: f,
  defaultArtifactVisible: d = !1,
  onArtifactToggle: h,
  artifactVisible: N,
  showArtifactToggle: g = !0,
  showSessionColumn: y = !0,
  contentMaxWidth: p,
  artifactPanelWidth: v,
  onCollapsedChange: m
}) {
  const [_, w] = C(l), [S, E] = C(d), L = N !== void 0 ? N : S, k = () => {
    const b = !L;
    N === void 0 && E(b), h == null || h(b);
  };
  return /* @__PURE__ */ n("div", { className: "meso-layout", children: [
    /* @__PURE__ */ n("aside", { className: `meso-sidebar${_ ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ n("div", { className: "meso-sidebar__header", children: [
        c ? /* @__PURE__ */ r("div", { className: "meso-sidebar__logo meso-sidebar__logo--custom", children: c }) : /* @__PURE__ */ r("div", { className: "meso-sidebar__logo", children: a[0] }),
        i ? /* @__PURE__ */ r("span", { className: "meso-sidebar__title meso-sidebar__title--brand", children: i }) : /* @__PURE__ */ r("span", { className: "meso-sidebar__title", children: a }),
        /* @__PURE__ */ r(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => {
              const b = !_;
              w(b), m == null || m(b);
            },
            "aria-label": _ ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ n("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ r("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ r("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ r("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ r("nav", { className: "meso-sidebar__nav", children: e.map((b) => /* @__PURE__ */ n(
        "div",
        {
          className: `meso-sidebar__nav-item${b.active ? " meso-sidebar__nav-item--active" : ""}`,
          onClick: b.onClick,
          title: b.label,
          children: [
            /* @__PURE__ */ r("span", { className: "meso-sidebar__nav-icon", children: b.icon }),
            /* @__PURE__ */ r("span", { className: "meso-sidebar__nav-label", children: b.label })
          ]
        },
        b.id
      )) }),
      t && /* @__PURE__ */ r("div", { className: "meso-sidebar__footer", children: t })
    ] }),
    y !== !1 && /* @__PURE__ */ r("div", { className: "meso-session-col", children: s }),
    /* @__PURE__ */ n("main", { className: "meso-main", children: [
      /* @__PURE__ */ n("div", { className: "meso-main__header", children: [
        /* @__PURE__ */ r("div", { className: "meso-main__header-content", children: u }),
        g !== !1 && /* @__PURE__ */ r(
          "button",
          {
            className: `meso-artifact-toggle${L ? " meso-artifact-toggle--active" : ""}`,
            onClick: k,
            title: L ? "关闭 Artifact" : "打开 Artifact",
            "aria-label": L ? "关闭 Artifact" : "打开 Artifact",
            children: L ? (
              /* X / close icon */
              /* @__PURE__ */ n("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ r("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                /* @__PURE__ */ r("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
              ] })
            ) : (
              /* Panel / artifact icon */
              /* @__PURE__ */ n("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ r("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                /* @__PURE__ */ r("line", { x1: "14", y1: "3", x2: "14", y2: "21" })
              ] })
            )
          }
        )
      ] }),
      /* @__PURE__ */ n("div", { className: "meso-main__content", children: [
        /* @__PURE__ */ r("div", { className: "meso-main__chat", style: p ? { maxWidth: p, margin: "0 auto", width: "100%" } : void 0, children: o }),
        L && /* @__PURE__ */ n(P, { children: [
          /* @__PURE__ */ r("div", { className: "meso-artifact-divider", "aria-hidden": "true" }),
          /* @__PURE__ */ r(
            "div",
            {
              className: "meso-artifact-pane",
              style: v != null ? { width: v, minWidth: v, maxWidth: v } : void 0,
              children: f
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function re({
  role: e,
  content: t,
  streaming: s = !1,
  timestamp: o,
  markdown: l = !1,
  renderMarkdown: a
}) {
  const c = l && typeof a == "function";
  return /* @__PURE__ */ n("div", { className: `meso-bubble meso-bubble--${e}`, children: [
    e === "assistant" && /* @__PURE__ */ r("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ n("div", { className: "meso-bubble__body", children: [
      c ? /* @__PURE__ */ r(
        "div",
        {
          className: "meso-bubble__content meso-bubble__md",
          dangerouslySetInnerHTML: { __html: a(t) }
        }
      ) : /* @__PURE__ */ n("div", { className: "meso-bubble__content", children: [
        t.split(`
`).map((i, u) => /* @__PURE__ */ n(F.Fragment, { children: [
          u > 0 && /* @__PURE__ */ r("br", {}),
          i
        ] }, u)),
        s && /* @__PURE__ */ r("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      o && /* @__PURE__ */ r("div", { className: "meso-bubble__timestamp", children: o })
    ] })
  ] });
}
function le({
  content: e,
  pinnedContent: t,
  streaming: s = !1,
  turnStreaming: o,
  autoCollapseDelay: l = 1500,
  defaultOpen: a = !0,
  open: c,
  onOpenChange: i,
  collapseWhen: u = "streamEnd",
  summary: f = "已思考"
}) {
  const d = c !== void 0, [h, N] = C(a), [g, y] = C(null), p = R(null);
  p.current = g;
  const v = d ? c : g !== null ? g : h, m = R(s), _ = R(o), w = () => {
    const L = !v;
    d || y(L), i == null || i(L);
  };
  return I(() => {
    if (u !== "never" && l !== null) {
      if (m.current && !s) {
        const L = setTimeout(() => {
          d || N(!1), p.current === null && (i == null || i(!1));
        }, l);
        return () => clearTimeout(L);
      }
      m.current = s;
    }
  }, [s, l, u, d, i]), I(() => {
    o !== void 0 && (_.current && !o && y(null), _.current = o);
  }, [o]), /* @__PURE__ */ n("div", { className: `meso-think${v ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ n(
      "button",
      {
        className: "meso-think__header",
        onClick: w,
        "aria-expanded": v,
        children: [
          /* @__PURE__ */ r("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ r("span", { className: "meso-think__label", children: v ? "思考过程" : f }),
          s && /* @__PURE__ */ r("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ r("div", { className: "meso-think__body", children: /* @__PURE__ */ n("div", { className: "meso-think__content", children: [
      !s && t !== void 0 ? t : e,
      s && /* @__PURE__ */ r("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function or({ active: e = !0 }) {
  return e ? /* @__PURE__ */ r("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function ye(e) {
  try {
    const t = JSON.parse(e);
    return Array.isArray(t.headers) && Array.isArray(t.rows) ? t : null;
  } catch {
    return null;
  }
}
function se({
  type: e,
  content: t,
  language: s = "plaintext",
  streaming: o = !1,
  onCopy: l,
  onDownload: a,
  renderMermaid: c,
  highlightCode: i,
  renderMarkdown: u
}) {
  const [f, d] = C(!1), [h, N] = C(e), [g, y] = C(null), [p, v] = C(!1), [m, _] = C(null), w = R("");
  I(() => {
    N(e);
  }, [e]), I(() => {
    e !== "mermaid" || o || !c || t === w.current || (w.current = t, y(null), v(!1), c(t).then((k) => y(k)).catch(() => v(!0)));
  }, [e, o, t, c]), I(() => {
    e !== "code" || o || !i || t === w.current && m || (w.current = t, _(i(t, s)));
  }, [e, o, t, s, i, m]);
  const S = () => {
    navigator.clipboard.writeText(t).catch(() => {
    }), d(!0), setTimeout(() => d(!1), 2e3), l == null || l(t);
  }, E = () => {
    if (a) {
      a(t);
      return;
    }
    const k = {
      html: "html",
      mermaid: "md",
      markdown: "md",
      table: "json",
      code: s || "txt"
    }, b = new Blob([t], { type: "text/plain" }), T = document.createElement("a");
    T.href = URL.createObjectURL(b), T.download = `artifact.${k[e]}`, T.click(), URL.revokeObjectURL(T.href);
  };
  return /* @__PURE__ */ n("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ n("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ r("div", { className: "meso-artifact__tabs", children: (e === "html" ? ["html", "code"] : [e]).map((k) => /* @__PURE__ */ r(
        "span",
        {
          className: `meso-artifact__tab${h === k ? " meso-artifact__tab--active" : ""}`,
          onClick: () => N(k),
          children: Ce(k, s)
        },
        k
      )) }),
      o && /* @__PURE__ */ r("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ r("button", { className: "meso-artifact__download-btn", onClick: E, title: "下载", "aria-label": "下载文件", children: /* @__PURE__ */ r("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) }) }),
      /* @__PURE__ */ r("button", { className: "meso-artifact__copy-btn", onClick: S, title: "复制", "aria-label": "复制代码", children: f ? /* @__PURE__ */ r("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ n("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ r("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
        /* @__PURE__ */ r("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
      ] }) })
    ] }),
    /* @__PURE__ */ n("div", { className: "meso-artifact__body", children: [
      h === "html" && /* @__PURE__ */ r("iframe", { className: "meso-artifact__preview", srcDoc: t, sandbox: "allow-scripts", title: "HTML 预览" }),
      h === "mermaid" && /* @__PURE__ */ n(P, { children: [
        o && /* @__PURE__ */ n("pre", { className: "meso-artifact__code", children: [
          /* @__PURE__ */ r("code", { children: t }),
          /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
        ] }),
        !o && g && /* @__PURE__ */ r(
          "div",
          {
            className: "meso-artifact__mermaid",
            dangerouslySetInnerHTML: { __html: g }
          }
        ),
        !o && !g && !p && !c && /* @__PURE__ */ n("div", { className: "meso-artifact__mermaid-placeholder", children: [
          /* @__PURE__ */ r("span", { children: "图表预览需要集成 Mermaid 渲染器" }),
          /* @__PURE__ */ r("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ r("code", { children: t }) })
        ] }),
        !o && p && /* @__PURE__ */ n("div", { className: "meso-artifact__mermaid-placeholder meso-artifact__mermaid-placeholder--error", children: [
          /* @__PURE__ */ r("span", { children: "图表渲染失败，请检查语法" }),
          /* @__PURE__ */ r("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ r("code", { children: t }) })
        ] }),
        !o && !g && !p && c && /* @__PURE__ */ r("div", { className: "meso-artifact__mermaid-placeholder", children: /* @__PURE__ */ r("span", { children: "渲染中…" }) })
      ] }),
      h === "markdown" && /* @__PURE__ */ r(P, { children: u ? /* @__PURE__ */ r(
        "div",
        {
          className: "meso-artifact__markdown",
          dangerouslySetInnerHTML: { __html: u(t) }
        }
      ) : /* @__PURE__ */ n("pre", { className: "meso-artifact__code", children: [
        /* @__PURE__ */ r("code", { children: t }),
        o && /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] }) }),
      h === "table" && /* @__PURE__ */ r(xe, { content: t, streaming: o }),
      (h === "code" || h === "html" && !1) && /* @__PURE__ */ n("pre", { className: "meso-artifact__code", children: [
        m && !o ? /* @__PURE__ */ r("code", { dangerouslySetInnerHTML: { __html: m } }) : /* @__PURE__ */ r("code", { children: t }),
        o && /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] })
    ] })
  ] });
}
function xe({ content: e, streaming: t }) {
  const s = ye(e);
  return s ? /* @__PURE__ */ r("div", { className: "meso-artifact__table-wrap", children: /* @__PURE__ */ n("table", { className: "meso-artifact__table", children: [
    /* @__PURE__ */ r("thead", { children: /* @__PURE__ */ r("tr", { children: s.headers.map((o, l) => /* @__PURE__ */ r("th", { children: o }, l)) }) }),
    /* @__PURE__ */ r("tbody", { children: s.rows.map((o, l) => /* @__PURE__ */ r("tr", { children: o.map((a, c) => /* @__PURE__ */ r("td", { children: String(a) }, c)) }, l)) })
  ] }) }) : /* @__PURE__ */ n("pre", { className: "meso-artifact__code", children: [
    /* @__PURE__ */ r("code", { children: e }),
    t && /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
  ] });
}
function Ce(e, t) {
  return e === "html" ? "HTML 预览" : e === "mermaid" ? "图表" : e === "markdown" ? "Markdown" : e === "table" ? "表格" : t || "Code";
}
const Se = {
  running: "进行中",
  done: "完成",
  error: "失败",
  pending: "等待",
  warning: "警告"
};
function W({
  status: e,
  size: t = 16,
  className: s,
  "aria-label": o
}) {
  const l = o ?? Se[e];
  return /* @__PURE__ */ n(
    "span",
    {
      className: `meso-status-icon meso-status-icon--${e}${s ? ` ${s}` : ""}`,
      style: { width: t, height: t },
      role: "img",
      "aria-label": l,
      children: [
        e === "running" && /* @__PURE__ */ n("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeDasharray: "3 3", className: "meso-status-icon__spin" }),
          /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "2.5", fill: "currentColor", className: "meso-status-icon__pulse" })
        ] }),
        e === "done" && /* @__PURE__ */ n("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ r("polyline", { points: "4.5,8 7,10.5 11.5,5.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
        ] }),
        e === "error" && /* @__PURE__ */ n("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ r("line", { x1: "5.5", y1: "5.5", x2: "10.5", y2: "10.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" }),
          /* @__PURE__ */ r("line", { x1: "10.5", y1: "5.5", x2: "5.5", y2: "10.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" })
        ] }),
        e === "pending" && /* @__PURE__ */ r("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "6.25", stroke: "currentColor", strokeWidth: "1.5" }) }),
        e === "warning" && /* @__PURE__ */ n("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ r("line", { x1: "8", y1: "5", x2: "8", y2: "9", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" }),
          /* @__PURE__ */ r("circle", { cx: "8", cy: "11.5", r: "0.75", fill: "white" })
        ] })
      ]
    }
  );
}
function Le(e) {
  switch (e) {
    case "pending":
      return "pending";
    case "active":
      return "running";
    case "done":
      return "done";
    case "error":
      return "error";
  }
}
function $e({ stages: e, compact: t = !1 }) {
  return e.length === 0 ? null : /* @__PURE__ */ r("div", { className: `meso-stages${t ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: e.map((s, o) => /* @__PURE__ */ n(
    "div",
    {
      className: `meso-stage meso-stage--${s.status}`,
      children: [
        /* @__PURE__ */ r("div", { className: "meso-stage__dot", children: /* @__PURE__ */ r(W, { status: Le(s.status), size: 10 }) }),
        o < e.length - 1 && /* @__PURE__ */ r("div", { className: `meso-stage__line${s.status === "done" ? " meso-stage__line--done" : ""}` }),
        /* @__PURE__ */ r("span", { className: `meso-stage__label${t ? " meso-stage__label--compact" : ""}`, children: s.label })
      ]
    },
    s.id
  )) });
}
function Te(e) {
  const { nodes: t, nodeOrder: s } = e, o = /* @__PURE__ */ new Map();
  for (const i of s) {
    const u = t[i];
    if (!u) continue;
    const f = u.parent_id ?? null;
    o.has(f) || o.set(f, []), o.get(f).push(i);
  }
  const l = /* @__PURE__ */ new Map();
  for (const [, i] of o)
    if (i.length > 1)
      for (const u of i) l.set(u, i);
  const a = [], c = /* @__PURE__ */ new Set();
  for (const i of s) {
    if (c.has(i)) continue;
    const u = t[i];
    if (!u) continue;
    const f = l.get(i);
    if (f) {
      const d = f.map((h) => t[h]).filter((h) => !!h);
      for (const h of d) c.add(h.node_id);
      a.push({ kind: "parallel", nodes: d, isLast: !1 });
    } else
      c.add(i), a.push({ kind: "node", node: u, isLast: !1 });
  }
  return a.length > 0 && (a[a.length - 1] = { ...a[a.length - 1], isLast: !0 }), a;
}
function Ee(e) {
  switch (e) {
    case "active":
      return "running";
    case "done":
      return "done";
    case "error":
      return "error";
    case "skipped":
      return "warning";
  }
}
function ce({ state: e }) {
  return /* @__PURE__ */ r(
    W,
    {
      status: Ee(e),
      size: 12,
      className: `meso-wf-node__icon meso-wf-node__icon--${e}`
    }
  );
}
function ie(e) {
  return e < 1e3 ? `${e}ms` : `${(e / 1e3).toFixed(1)}s`;
}
function Oe({ node: e, isLast: t }) {
  var a;
  const [s, o] = C(!1), l = e.metadata && Object.keys(e.metadata).length > 0;
  return /* @__PURE__ */ n("div", { className: `meso-wf-node meso-wf-node--${e.state}`, children: [
    /* @__PURE__ */ n("div", { className: "meso-wf-node__track", children: [
      /* @__PURE__ */ r("div", { className: "meso-wf-node__dot", children: /* @__PURE__ */ r(ce, { state: e.state }) }),
      !t && /* @__PURE__ */ r("div", { className: "meso-wf-node__line" })
    ] }),
    /* @__PURE__ */ n("div", { className: "meso-wf-node__body", children: [
      /* @__PURE__ */ n("div", { className: "meso-wf-node__header", children: [
        /* @__PURE__ */ r("code", { className: "meso-wf-node__name", children: e.name }),
        e.duration_ms !== void 0 && /* @__PURE__ */ r("span", { className: "meso-wf-node__duration", children: ie(e.duration_ms) }),
        l && /* @__PURE__ */ r(
          "button",
          {
            className: "meso-wf-node__expand",
            onClick: () => o((c) => !c),
            "aria-expanded": s,
            "aria-label": s ? "收起详情" : "展开详情",
            children: /* @__PURE__ */ r("svg", { viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", style: { transform: s ? "rotate(180deg)" : void 0 }, children: /* @__PURE__ */ r("polyline", { points: "2,3.5 5,6.5 8,3.5" }) })
          }
        )
      ] }),
      e.state === "error" && !!((a = e.metadata) != null && a.error) && /* @__PURE__ */ r("div", { className: "meso-wf-node__error", children: String(e.metadata.error) }),
      s && l && /* @__PURE__ */ r("pre", { className: "meso-wf-node__meta", children: JSON.stringify(e.metadata, null, 2) })
    ] })
  ] });
}
function Re({ nodes: e, isLast: t }) {
  return /* @__PURE__ */ n("div", { className: "meso-wf-parallel", children: [
    /* @__PURE__ */ r("div", { className: "meso-wf-parallel__row", children: e.map((s, o) => {
      var l;
      return /* @__PURE__ */ n("div", { className: `meso-wf-parallel__branch meso-wf-parallel__branch--${s.state}`, children: [
        /* @__PURE__ */ r("div", { className: "meso-wf-parallel__branch-dot", children: /* @__PURE__ */ r(ce, { state: s.state }) }),
        /* @__PURE__ */ n("div", { className: "meso-wf-parallel__branch-body", children: [
          /* @__PURE__ */ n("div", { className: "meso-wf-parallel__branch-label", children: [
            "并行分支 ",
            String.fromCharCode(65 + o)
          ] }),
          /* @__PURE__ */ r("code", { className: "meso-wf-node__name", children: s.name }),
          s.state === "error" && !!((l = s.metadata) != null && l.error) && /* @__PURE__ */ r("div", { className: "meso-wf-node__error", children: String(s.metadata.error) }),
          s.duration_ms !== void 0 && /* @__PURE__ */ r("span", { className: "meso-wf-node__duration", style: { display: "block", marginTop: 2 }, children: ie(s.duration_ms) })
        ] })
      ] }, s.node_id);
    }) }),
    !t && /* @__PURE__ */ r("div", { className: "meso-wf-parallel__merge" })
  ] });
}
function Ie({ runs: e, showRunId: t = !0, hidden: s }) {
  if (e.length === 0 || s) return null;
  const o = e.length > 1;
  return /* @__PURE__ */ r("div", { className: "meso-wf", role: "status", "aria-label": "工作流进度", children: e.map((l) => {
    const a = Te(l);
    return /* @__PURE__ */ n("div", { className: "meso-wf-run", children: [
      o && t && /* @__PURE__ */ r("div", { className: "meso-wf-run__label", children: l.run_id }),
      a.map(
        (c, i) => c.kind === "parallel" ? /* @__PURE__ */ r(Re, { nodes: c.nodes, isLast: c.isLast }, `parallel-${i}`) : /* @__PURE__ */ r(Oe, { node: c.node, isLast: c.isLast }, c.node.node_id)
      )
    ] }, l.run_id);
  }) });
}
function Me({ soul: e, compact: t = !1 }) {
  const s = e.name.charAt(0);
  return /* @__PURE__ */ n(
    "div",
    {
      className: `meso-soul${t ? " meso-soul--compact" : ""}`,
      title: `${e.name} v${e.version}`,
      role: "status",
      "aria-label": `当前 Soul: ${e.name}`,
      children: [
        /* @__PURE__ */ r("div", { className: "meso-soul__avatar", children: e.avatar ? /* @__PURE__ */ r("img", { src: e.avatar, alt: e.name, className: "meso-soul__img" }) : /* @__PURE__ */ r("span", { className: "meso-soul__initial", children: s }) }),
        !t && /* @__PURE__ */ n(P, { children: [
          /* @__PURE__ */ r("span", { className: "meso-soul__name", children: e.name }),
          e.traits && e.traits.length > 0 && /* @__PURE__ */ r("div", { className: "meso-soul__traits", children: e.traits.map((o) => /* @__PURE__ */ r("span", { className: "meso-soul__trait", children: o }, o)) })
        ] })
      ]
    }
  );
}
const Ae = {
  mcp: "MCP",
  api: "API"
};
function Be({ skill: e }) {
  const t = e.provider ? Ae[e.provider] : null;
  return /* @__PURE__ */ n(
    "div",
    {
      className: "meso-skill",
      title: e.description ?? e.name,
      role: "status",
      "aria-label": `当前技能: ${e.name}`,
      children: [
        /* @__PURE__ */ r("svg", { className: "meso-skill__icon", width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ r(
          "path",
          {
            d: "M6 1L7.5 4.5H11L8 6.5L9 10L6 8L3 10L4 6.5L1 4.5H4.5L6 1Z",
            stroke: "currentColor",
            strokeWidth: "1.2",
            strokeLinejoin: "round"
          }
        ) }),
        /* @__PURE__ */ r("span", { className: "meso-skill__name", children: e.name }),
        e.focus && e.focus.length > 0 && /* @__PURE__ */ n("span", { className: "meso-skill__focus", children: [
          "· ",
          e.focus.join(", ")
        ] }),
        t && /* @__PURE__ */ r("span", { className: "meso-skill__provider", children: t })
      ]
    }
  );
}
const De = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function Pe({ toolCall: e, onConfirm: t, onCancel: s }) {
  const o = e.risk ?? "safe", l = De[o], a = Object.keys(e.args).length > 0;
  return /* @__PURE__ */ n("div", { className: `meso-confirm-gate meso-confirm-gate--${o}`, role: "alertdialog", "aria-label": "工具执行确认", "data-testid": "meso-confirm-gate", children: [
    /* @__PURE__ */ r("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ n("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ r("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ r("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ n("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ n("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ r("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${o}`, children: l.label }),
        /* @__PURE__ */ r("code", { className: "meso-confirm-gate__tool-name", children: e.name })
      ] }),
      a && /* @__PURE__ */ r("pre", { className: "meso-confirm-gate__args", children: JSON.stringify(e.args, null, 2) }),
      /* @__PURE__ */ n("div", { className: "meso-confirm-gate__actions", children: [
        /* @__PURE__ */ r(
          "button",
          {
            className: "meso-confirm-gate__btn meso-confirm-gate__btn--cancel",
            onClick: () => s(e.id),
            children: "取消"
          }
        ),
        /* @__PURE__ */ r(
          "button",
          {
            className: `meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${o}`,
            onClick: () => t(e.id),
            children: l.confirmText
          }
        )
      ] })
    ] })
  ] });
}
function We(e) {
  switch (e) {
    case "pending":
      return "pending";
    case "running":
      return "running";
    case "awaiting_confirm":
      return "warning";
    case "done":
      return "done";
    case "error":
      return "error";
  }
}
function je(e) {
  switch (e) {
    case "pending":
      return "pending";
    case "done":
      return "done";
    case "error":
      return "error";
  }
}
function He(e) {
  switch (e) {
    case "pending":
      return "pending";
    case "running":
      return "running";
    case "done":
      return "done";
    case "error":
      return "error";
  }
}
const ze = {
  safe: "只读",
  write: "写入",
  destructive: "危险"
}, te = {
  mcp: "MCP",
  api: "API",
  local: "本地"
};
function de({ toolCall: e, onConfirm: t, onCancel: s, className: o, "data-testid": l, simplify: a }) {
  var H, D;
  const { call: c, result: i, status: u } = e, f = c.risk ?? "safe", d = Object.keys(c.args).length > 0, h = (a == null ? void 0 : a.verbosity) ?? (a != null && a.compact ? "compact" : "standard"), N = (a == null ? void 0 : a.hideMetadata) ?? !1, g = h === "compact", y = h === "standard", p = h === "detailed", v = (a == null ? void 0 : a.showDuration) ?? !g, m = (a == null ? void 0 : a.showProvider) ?? !g, _ = (a == null ? void 0 : a.showRiskLevel) ?? !g, w = (a == null ? void 0 : a.showExecutionTimeline) ?? p, S = (a == null ? void 0 : a.defaultParamsCollapsed) ?? (y || g), E = (a == null ? void 0 : a.defaultOutputCollapsed) ?? (y || g), L = (a == null ? void 0 : a.defaultMetadataCollapsed) ?? (y || g), [k, b] = C(
    N || a != null && a.hideResultDetails ? !1 : !S
  ), [T, K] = C(!E), [B, j] = C(!L), M = (H = i == null ? void 0 : i.metadata) == null ? void 0 : H.resultCount;
  return /* @__PURE__ */ n(
    "div",
    {
      className: `meso-tool meso-tool--${u} meso-tool--risk-${f} meso-tool--${h}${o ? ` ${o}` : ""}`,
      "data-testid": l ?? "meso-tool-call-block",
      children: [
        /* @__PURE__ */ n("div", { className: "meso-tool__header", children: [
          /* @__PURE__ */ r(W, { status: We(u), size: 14, className: "meso-tool__status-icon" }),
          /* @__PURE__ */ r("span", { className: "meso-tool__name", children: c.name }),
          g && M !== void 0 && /* @__PURE__ */ n("span", { className: "meso-tool__summary", children: [
            "— ",
            M,
            " 项"
          ] }),
          g && (i == null ? void 0 : i.duration_ms) !== void 0 && /* @__PURE__ */ n("span", { className: "meso-tool__duration", children: [
            "(",
            i.duration_ms,
            "ms)"
          ] }),
          !g && M !== void 0 && /* @__PURE__ */ n("span", { className: "meso-tool__summary", children: [
            "— ",
            M,
            " 项"
          ] }),
          !g && v && (i == null ? void 0 : i.duration_ms) !== void 0 && /* @__PURE__ */ n("span", { className: "meso-tool__duration", children: [
            "(",
            i.duration_ms,
            "ms)"
          ] }),
          !g && _ && f !== "safe" && /* @__PURE__ */ r("span", { className: `meso-tool__risk meso-tool__risk--${f}`, children: ze[f] }),
          m && c.provider && te[c.provider] && /* @__PURE__ */ r("span", { className: `meso-tool__provider meso-tool__provider--${c.provider}`, children: te[c.provider] }),
          ((D = c.annotations) == null ? void 0 : D.open_world) && /* @__PURE__ */ r("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", children: "🌐" }),
          !g && d && /* @__PURE__ */ n(
            "button",
            {
              className: "meso-tool__toggle",
              onClick: () => b(($) => !$),
              "aria-expanded": k,
              "aria-label": k ? "折叠参数" : "展开参数",
              children: [
                k ? "▾" : "▸",
                " 参数"
              ]
            }
          )
        ] }),
        !g && d && /* @__PURE__ */ n("details", { className: "meso-tool__params-details", open: k, children: [
          /* @__PURE__ */ r(
            "summary",
            {
              className: "meso-tool__params-summary",
              onClick: ($) => {
                $.preventDefault(), b((A) => !A);
              },
              children: /* @__PURE__ */ n("span", { className: "meso-tool__params-toggle", children: [
                k ? "▾" : "▸",
                " Input Parameters"
              ] })
            }
          ),
          k && /* @__PURE__ */ r("pre", { className: "meso-tool__args", children: JSON.stringify(c.args, null, p ? 2 : 1) })
        ] }),
        u === "awaiting_confirm" && t && s && /* @__PURE__ */ r(
          Pe,
          {
            toolCall: c,
            onConfirm: t,
            onCancel: s
          }
        ),
        (u === "done" || u === "error") && i && !g && /* @__PURE__ */ n("details", { className: "meso-tool__result-details", open: T, children: [
          /* @__PURE__ */ r(
            "summary",
            {
              className: "meso-tool__result-summary",
              onClick: ($) => {
                $.preventDefault(), K((A) => !A);
              },
              children: /* @__PURE__ */ n("span", { className: "meso-tool__result-toggle", children: [
                T ? "▾" : "▸",
                " ",
                u === "error" ? "Error" : "Output"
              ] })
            }
          ),
          T && /* @__PURE__ */ r("pre", { className: `meso-tool__output${u === "error" ? " meso-tool__output--error" : ""}`, children: u === "error" ? i.error : p ? i.output : i.output.slice(0, 200) + (i.output.length > 200 ? "..." : "") })
        ] }),
        !g && (i == null ? void 0 : i.metadata) && /* @__PURE__ */ n("details", { className: "meso-tool__metadata-details", open: B, children: [
          /* @__PURE__ */ r(
            "summary",
            {
              className: "meso-tool__metadata-summary",
              onClick: ($) => {
                $.preventDefault(), j((A) => !A);
              },
              children: /* @__PURE__ */ n("span", { className: "meso-tool__metadata-toggle", children: [
                B ? "▾" : "▸",
                " Metadata"
              ] })
            }
          ),
          B && /* @__PURE__ */ n("div", { className: "meso-tool__metadata", children: [
            i.metadata.resultCount !== void 0 && /* @__PURE__ */ n("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ r("span", { className: "meso-tool__metadata-key", children: "resultCount:" }),
              /* @__PURE__ */ r("span", { className: "meso-tool__metadata-value", children: i.metadata.resultCount })
            ] }),
            i.metadata.category !== void 0 && /* @__PURE__ */ n("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ r("span", { className: "meso-tool__metadata-key", children: "category:" }),
              /* @__PURE__ */ r("span", { className: "meso-tool__metadata-value", children: i.metadata.category })
            ] }),
            p && i.metadata.custom && /* @__PURE__ */ n("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ r("span", { className: "meso-tool__metadata-key", children: "custom:" }),
              /* @__PURE__ */ r("pre", { className: "meso-tool__metadata-custom", children: JSON.stringify(i.metadata.custom, null, 2) })
            ] })
          ] })
        ] }),
        p && w && (i == null ? void 0 : i.duration_ms) && /* @__PURE__ */ n("details", { className: "meso-tool__timeline-details", open: !1, children: [
          /* @__PURE__ */ r("summary", { className: "meso-tool__timeline-summary", children: "Execution Timeline" }),
          /* @__PURE__ */ r("div", { className: "meso-tool__timeline", children: /* @__PURE__ */ n("div", { className: "meso-tool__timeline-row", children: [
            /* @__PURE__ */ r("span", { className: "meso-tool__timeline-label", children: "Duration:" }),
            /* @__PURE__ */ n("span", { className: "meso-tool__timeline-value", children: [
              i.duration_ms,
              "ms"
            ] })
          ] }) })
        ] })
      ]
    }
  );
}
function ae({
  stream: e,
  defaultExpanded: t = "none",
  expandCount: s = 2,
  onlyShowCurrent: o = !1,
  simplify: l,
  onToolClick: a,
  onToolConfirm: c,
  onToolCancel: i,
  renderSummary: u
}) {
  const f = e.toolCallOrder, d = o && f.length > 0 ? [f[f.length - 1]] : f, [h, N] = C(() => {
    if (t === "none") return /* @__PURE__ */ new Set();
    if (t === "all") return new Set(d);
    if (t === "current" && d.length > 0)
      return /* @__PURE__ */ new Set([d[d.length - 1]]);
    if (t === "last-n" && d.length > 0) {
      const p = d.slice(-s);
      return new Set(p);
    }
    return /* @__PURE__ */ new Set();
  }), g = (p) => {
    const v = new Set(h);
    v.has(p) ? v.delete(p) : v.add(p), N(v), a == null || a(p);
  }, y = (p, v) => {
    var b;
    const { call: m, result: _, status: w } = p;
    if (u)
      return String(u(p, v) ?? "");
    const S = w === "error" ? "✗" : "✓", E = m.name, L = (b = _ == null ? void 0 : _.metadata) != null && b.resultCount ? ` — ${_.metadata.resultCount} 项` : "", k = _ != null && _.duration_ms ? ` (${_.duration_ms}ms)` : "";
    return `${S} ${E}${L}${k}`;
  };
  return d.length === 0 ? null : /* @__PURE__ */ r("div", { className: "meso-collapsible-tool-trace", children: d.map((p, v) => {
    const m = e.toolCalls[p];
    if (!m) return null;
    const _ = h.has(p), { status: w } = m;
    return /* @__PURE__ */ n("div", { className: `meso-collapsible-tool__item meso-collapsible-tool__item--${w}`, children: [
      /* @__PURE__ */ n(
        "button",
        {
          className: "meso-collapsible-tool__summary",
          onClick: () => g(p),
          "aria-expanded": _,
          children: [
            /* @__PURE__ */ r("span", { className: "meso-collapsible-tool__toggle", children: _ ? "▼" : "▶" }),
            /* @__PURE__ */ r("span", { className: "meso-collapsible-tool__text", children: y(m, v) })
          ]
        }
      ),
      _ && /* @__PURE__ */ r("div", { className: "meso-collapsible-tool__details", children: /* @__PURE__ */ r(
        de,
        {
          toolCall: m,
          onConfirm: c,
          onCancel: i,
          simplify: l
        }
      ) })
    ] }, p);
  }) });
}
function oe(e) {
  return e === "html" || e === "html preview" ? { type: "html" } : e === "mermaid" ? { type: "mermaid" } : e === "markdown" ? { type: "markdown" } : e === "table" ? { type: "table" } : { type: "code", language: e };
}
function Ke(e) {
  const t = e.toolCallOrder, s = t.length - 1, o = t.slice(0, s).filter((a) => e.toolCalls[a].result !== void 0), l = t[s];
  return { frozenIds: o, currentId: l };
}
function Ue({
  stream: e,
  onToolConfirm: t,
  onToolCancel: s
}) {
  const { frozenIds: o, currentId: l } = ge(
    () => Ke(e),
    [e.toolCallOrder, e.toolCalls]
  );
  return e.toolCallOrder.length === 0 ? null : /* @__PURE__ */ n(P, { children: [
    o.length > 0 && /* @__PURE__ */ r("div", { className: "meso-message-list__frozen-tools", children: /* @__PURE__ */ r(
      ae,
      {
        stream: {
          ...e,
          toolCallOrder: o
        },
        streaming: !1,
        defaultExpanded: "all",
        simplify: void 0
      }
    ) }),
    l && /* @__PURE__ */ r("div", { className: "meso-message-list__current-tool", children: /* @__PURE__ */ r(
      ae,
      {
        stream: {
          ...e,
          toolCallOrder: [l]
        },
        streaming: e.status === "streaming",
        defaultExpanded: "all",
        simplify: void 0,
        onToolConfirm: t,
        onToolCancel: s
      }
    ) })
  ] });
}
function nr({
  messages: e,
  streaming: t,
  onArtifactCopy: s,
  onArtifactDownload: o,
  onToolConfirm: l,
  onToolCancel: a,
  emptyState: c,
  emptyStateAlign: i = "center",
  className: u,
  renderExtension: f,
  renderLiveTrace: d,
  renderMarkdown: h,
  renderMermaid: N,
  highlightCode: g,
  hiddenArtifactLangs: y
}) {
  const p = R(null);
  I(() => {
    var m;
    (m = p.current) == null || m.scrollIntoView({ behavior: "smooth" });
  }, [e, t]);
  const v = e.length > 0 || t && t.status !== "idle";
  return /* @__PURE__ */ r("div", { className: `meso-message-list${u ? ` ${u}` : ""}`, children: /* @__PURE__ */ n("div", { className: "meso-message-list__inner", children: [
    !v && c && /* @__PURE__ */ r("div", { className: `meso-message-list__empty${i === "top" ? " meso-message-list__empty--top" : ""}`, children: c }),
    e.map((m) => /* @__PURE__ */ n(F.Fragment, { children: [
      /* @__PURE__ */ r(
        re,
        {
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          markdown: m.role === "assistant",
          renderMarkdown: h
        }
      ),
      m.artifacts && m.artifacts.length > 0 && m.artifacts.map((_) => {
        const { type: w, language: S } = oe(_.lang);
        return /* @__PURE__ */ r(
          se,
          {
            type: w,
            content: _.content,
            language: S,
            onCopy: s,
            onDownload: o,
            renderMermaid: N,
            highlightCode: g,
            renderMarkdown: h
          },
          _.id
        );
      })
    ] }, m.id)),
    t && t.status !== "idle" && /* @__PURE__ */ r("div", { className: "meso-message-list__live", children: d ? d(t) : /* @__PURE__ */ n(P, { children: [
      (t.activeSoul || t.activeSkill) && /* @__PURE__ */ n("div", { className: "meso-message-list__context-row", children: [
        t.activeSoul && /* @__PURE__ */ r(Me, { soul: t.activeSoul }),
        t.activeSkill && /* @__PURE__ */ r(Be, { skill: t.activeSkill })
      ] }),
      /* @__PURE__ */ r(
        Ue,
        {
          stream: t,
          onToolConfirm: l,
          onToolCancel: a
        }
      ),
      f && t.extensionLog.length > 0 && /* @__PURE__ */ r("div", { className: "meso-message-list__extensions", children: t.extensionLog.map((m, _) => /* @__PURE__ */ r(F.Fragment, { children: f(m) }, _)) }),
      (t.textContent || t.status === "streaming") && /* @__PURE__ */ r(
        re,
        {
          role: "assistant",
          content: t.textContent,
          streaming: t.status === "streaming" && t.artifactOrder.length === 0,
          markdown: !0,
          renderMarkdown: h
        }
      ),
      t.artifactOrder.map((m) => {
        const _ = t.artifacts[m];
        if (!_ || y != null && y.includes(_.lang)) return null;
        const { type: w, language: S } = oe(_.lang);
        return /* @__PURE__ */ r(
          se,
          {
            type: w,
            content: _.content,
            language: S,
            streaming: !_.done,
            onCopy: s,
            onDownload: o,
            renderMermaid: N,
            highlightCode: g,
            renderMarkdown: h
          },
          m
        );
      }),
      t.memorySaved.length > 0 && /* @__PURE__ */ r("div", { className: "meso-memory-saved", children: t.memorySaved.map((m) => /* @__PURE__ */ n("span", { className: "meso-memory-saved__chip", title: m.preview, children: [
        /* @__PURE__ */ r("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ r("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        m.category,
        "]"
      ] }, m.id)) })
    ] }) }),
    /* @__PURE__ */ r("div", { ref: p })
  ] }) });
}
function Ve({ resourceRead: e, className: t }) {
  const [s, o] = C(!1), { read: l, content: a, status: c } = e, i = l.name ?? l.uri, u = l.server;
  return /* @__PURE__ */ n("div", { className: `meso-resource meso-resource--${c}${t ? ` ${t}` : ""}`, children: [
    /* @__PURE__ */ n("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ r(W, { status: je(c), size: 13, className: "meso-resource__status-icon" }),
      /* @__PURE__ */ r("span", { className: "meso-resource__uri", title: l.uri, children: i }),
      u && /* @__PURE__ */ r("span", { className: "meso-resource__server", children: u }),
      (a == null ? void 0 : a.duration_ms) !== void 0 && /* @__PURE__ */ n("span", { className: "meso-resource__duration", children: [
        a.duration_ms,
        "ms"
      ] }),
      (c === "done" || c === "error") && a && /* @__PURE__ */ n(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => o((f) => !f),
          "aria-expanded": s,
          "aria-label": s ? "折叠内容" : "展开内容",
          children: [
            s ? "▾" : "▸",
            " ",
            c === "error" ? "错误" : "内容"
          ]
        }
      )
    ] }),
    s && a && /* @__PURE__ */ r("div", { className: "meso-resource__content", children: c === "error" ? /* @__PURE__ */ r("pre", { className: "meso-resource__text meso-resource__text--error", children: a.error }) : a.contents.map((f, d) => /* @__PURE__ */ n("div", { children: [
      f.type === "text" && /* @__PURE__ */ r("pre", { className: "meso-resource__text", children: f.text }),
      f.type === "image" && f.data && /* @__PURE__ */ r(
        "img",
        {
          className: "meso-resource__image",
          src: `data:${f.mime_type ?? "image/png"};base64,${f.data}`,
          alt: "resource"
        }
      ),
      f.type === "blob" && /* @__PURE__ */ n("span", { className: "meso-resource__blob-label", children: [
        "[",
        f.mime_type ?? "binary",
        "]"
      ] })
    ] }, d)) })
  ] });
}
function lr({
  value: e,
  onChange: t,
  onSubmit: s,
  onStop: o,
  streaming: l = !1,
  disabled: a = !1,
  placeholder: c = "输入消息… (Ctrl+Enter 发送，Enter 换行)",
  leadingSlot: i,
  trailingActions: u,
  maxRows: f = 8
}) {
  const d = R(null), h = 22, N = () => {
    const v = d.current;
    v && (v.style.height = "auto", v.style.height = Math.min(v.scrollHeight, h * f) + "px");
  };
  I(N, [e]);
  const g = (v) => {
    v.key === "Enter" && (v.ctrlKey || v.metaKey) && (v.preventDefault(), !a && !l && e.trim() && s());
  }, y = !a && !l && e.trim().length > 0, p = /* @__PURE__ */ r(
    "button",
    {
      className: `meso-composer__send${l ? " meso-composer__send--stop" : ""}`,
      onClick: l ? o : s,
      disabled: l ? !1 : !y,
      "aria-label": l ? "停止生成" : "发送",
      title: l ? "停止生成" : "Ctrl+Enter",
      children: l ? (
        /* Stop square */
        /* @__PURE__ */ r("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ r("rect", { x: "4", y: "4", width: "16", height: "16", rx: "2" }) })
      ) : (
        /* Send arrow */
        /* @__PURE__ */ n("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ r("line", { x1: "12", y1: "19", x2: "12", y2: "5" }),
          /* @__PURE__ */ r("polyline", { points: "5,12 12,5 19,12" })
        ] })
      )
    }
  );
  return /* @__PURE__ */ r("div", { className: "meso-composer", children: /* @__PURE__ */ n("div", { className: "meso-composer__box", children: [
    /* @__PURE__ */ r(
      "textarea",
      {
        ref: d,
        className: "meso-composer__textarea",
        value: e,
        onChange: (v) => {
          t(v.target.value), N();
        },
        onKeyDown: g,
        placeholder: c,
        rows: 1,
        disabled: a && !l,
        "aria-label": "消息输入框"
      }
    ),
    /* @__PURE__ */ n("div", { className: "meso-composer__toolbar", children: [
      /* @__PURE__ */ r("div", { className: "meso-composer__leading", children: i }),
      /* @__PURE__ */ r("span", { className: "meso-composer__hint", children: e.length > 0 && `${e.length} 字` }),
      /* @__PURE__ */ r("div", { className: "meso-composer__trailing", children: u ?? p })
    ] })
  ] }) });
}
function me({
  system: e,
  resetOnTurnStart: t = !1
}) {
  const [s, o] = C(null), l = R(e);
  return I(() => {
    t && !l.current && e && o(null), l.current = e;
  }, [e, t]), {
    open: s !== null ? s : e,
    setOpen: (c) => o(c),
    toggle: () => o((c) => c !== null ? !c : !e),
    clearIntent: () => o(null),
    hasUserIntent: s !== null
  };
}
function Ge(e) {
  const t = /* @__PURE__ */ new Map(), s = [];
  for (const o of e.toolCallOrder) {
    const l = e.toolCalls[o];
    if (!l) continue;
    const a = l.groupId ? `${l.groupKind ?? "group"}:${l.groupId}` : `__single__:${o}`;
    t.has(a) || (t.set(a, {
      key: a,
      groupId: l.groupId,
      groupKind: l.groupKind,
      ids: []
    }), s.push(a)), t.get(a).ids.push(o);
  }
  return s.map((o) => t.get(o));
}
function Fe(e) {
  const t = e.toolCallOrder.length + e.workflowRunOrder.reduce(
    (l, a) => {
      var c;
      return l + (((c = e.workflowRuns[a]) == null ? void 0 : c.nodeOrder.length) ?? 0);
    },
    0
  ), s = e.toolCallOrder.filter((l) => {
    var a;
    return ((a = e.toolCalls[l]) == null ? void 0 : a.status) === "error";
  }).length + e.workflowRunOrder.reduce((l, a) => {
    const c = e.workflowRuns[a];
    return c ? l + c.nodeOrder.filter((i) => {
      var u;
      return ((u = c.nodes[i]) == null ? void 0 : u.state) === "error";
    }).length : l;
  }, 0), o = [];
  return e.phaseOrder.length > 0 && o.push(`${e.phaseOrder.length} 阶段`), t > 0 && o.push(`${t} 步`), s > 0 && o.push(`${s} 项失败`), o.length > 0 ? o.join(" · ") : "执行过程";
}
function Je(e, t) {
  const s = !!(e.thinkContent || e.pinnedThink);
  return /* @__PURE__ */ n("div", { className: "meso-process-trace__phase", "data-testid": `meso-phase-${e.id}`, children: [
    /* @__PURE__ */ n("div", { className: "meso-process-trace__phase-header", children: [
      /* @__PURE__ */ r(W, { status: He(e.state), size: 14 }),
      /* @__PURE__ */ r("span", { className: "meso-process-trace__phase-name", children: e.name })
    ] }),
    s && /* @__PURE__ */ r(
      le,
      {
        content: e.thinkContent,
        pinnedContent: e.pinnedThink,
        streaming: t && e.state === "running",
        collapseWhen: "never",
        defaultOpen: !0
      }
    ),
    e.body && /* @__PURE__ */ r("div", { className: "meso-process-trace__phase-body", children: e.body })
  ] });
}
function cr({
  stream: e,
  streaming: t = !1,
  turnStreaming: s = !1,
  defaultCollapsed: o = !1,
  className: l,
  onToolConfirm: a,
  onToolCancel: c,
  renderToolCall: i,
  renderPhase: u,
  renderWorkflow: f,
  simplify: d
}) {
  const h = me({
    system: !o,
    resetOnTurnStart: s
  });
  if (!(!!e.thinkContent || e.phaseOrder.length > 0 || e.memorySnippets.length > 0 || e.resourceReadOrder.length > 0 || e.toolCallOrder.length > 0 || e.workflowRunOrder.length > 0)) return null;
  const g = Fe(e), y = e.workflowRunOrder.map((m) => e.workflowRuns[m]).filter(Boolean), p = Ge(e), v = e.phaseOrder.map((m) => e.phases[m]).filter(Boolean).map(we);
  return /* @__PURE__ */ n(
    "div",
    {
      className: `meso-process-trace${l ? ` ${l}` : ""}`,
      "data-testid": "meso-process-trace",
      children: [
        /* @__PURE__ */ n(
          "button",
          {
            className: "meso-process-trace__header",
            onClick: h.toggle,
            "aria-expanded": h.open,
            "aria-label": h.open ? "折叠执行过程" : "展开执行过程",
            children: [
              /* @__PURE__ */ r(
                "svg",
                {
                  className: `meso-process-trace__chevron${h.open ? " meso-process-trace__chevron--open" : ""}`,
                  width: "14",
                  height: "14",
                  viewBox: "0 0 14 14",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "1.5",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  children: /* @__PURE__ */ r("polyline", { points: "3,5 7,9 11,5" })
                }
              ),
              /* @__PURE__ */ r("span", { className: "meso-process-trace__summary", children: g }),
              t && /* @__PURE__ */ r("span", { className: "meso-process-trace__dot", "aria-label": "执行中" })
            ]
          }
        ),
        h.open && /* @__PURE__ */ n("div", { className: "meso-process-trace__body", children: [
          v.length > 0 && /* @__PURE__ */ r($e, { compact: !0, stages: v }),
          e.memorySnippets.length > 0 && /* @__PURE__ */ r("div", { className: "meso-memory-chips", children: e.memorySnippets.map((m, _) => /* @__PURE__ */ n("span", { className: "meso-memory-chip", title: m.content, children: [
            "[",
            m.category,
            "] ",
            m.content
          ] }, _)) }),
          e.thinkContent && /* @__PURE__ */ r(
            le,
            {
              content: e.thinkContent,
              streaming: t && !e.thinkDone,
              collapseWhen: "never",
              defaultOpen: !0,
              turnStreaming: s
            }
          ),
          e.phaseOrder.length > 0 && /* @__PURE__ */ r("div", { className: "meso-process-trace__phases", children: e.phaseOrder.map((m) => {
            const _ = e.phases[m];
            if (!_) return null;
            const w = u == null ? void 0 : u(_);
            return w != null ? /* @__PURE__ */ r("div", { children: w }, m) : /* @__PURE__ */ r("div", { children: Je(_, t) }, m);
          }) }),
          e.resourceReadOrder.length > 0 && /* @__PURE__ */ r("div", { className: "meso-process-trace__resources", children: e.resourceReadOrder.map((m) => {
            const _ = e.resourceReads[m];
            return _ ? /* @__PURE__ */ r(Ve, { resourceRead: _ }, m) : null;
          }) }),
          p.length > 0 && /* @__PURE__ */ r("div", { className: "meso-process-trace__tools", children: p.map((m) => /* @__PURE__ */ n(
            "div",
            {
              className: `meso-process-trace__tool-group${m.groupId ? " meso-process-trace__tool-group--grouped" : ""}`,
              "data-group-id": m.groupId,
              "data-group-kind": m.groupKind,
              children: [
                m.groupId && /* @__PURE__ */ n("div", { className: "meso-process-trace__tool-group-label", children: [
                  m.groupKind ?? "group",
                  ": ",
                  m.groupId
                ] }),
                m.ids.map((_) => {
                  const w = e.toolCalls[_];
                  if (!w) return null;
                  const S = i == null ? void 0 : i(w);
                  return S != null ? /* @__PURE__ */ r("div", { children: S }, _) : /* @__PURE__ */ r(
                    de,
                    {
                      toolCall: w,
                      onConfirm: a,
                      onCancel: c,
                      simplify: d
                    },
                    _
                  );
                })
              ]
            },
            m.key
          )) }),
          y.length > 0 && ((f == null ? void 0 : f(e)) ?? /* @__PURE__ */ r(Ie, { runs: y }))
        ] })
      ]
    }
  );
}
function ir({
  name: e,
  email: t,
  avatarText: s,
  menuItems: o = [],
  onSignOut: l
}) {
  const [a, c] = C(!1), i = R(null);
  I(() => {
    if (!a) return;
    const d = (h) => {
      i.current && !i.current.contains(h.target) && c(!1);
    };
    return document.addEventListener("mousedown", d), () => document.removeEventListener("mousedown", d);
  }, [a]);
  const u = s ?? e.charAt(0).toUpperCase(), f = [
    ...o,
    ...l ? [{ label: "退出登录", onClick: () => {
      c(!1), l();
    }, danger: !0 }] : []
  ];
  return /* @__PURE__ */ n("div", { className: "meso-user-menu", ref: i, children: [
    a && /* @__PURE__ */ n("div", { className: "meso-user-menu__popup", role: "menu", children: [
      /* @__PURE__ */ n("div", { className: "meso-user-menu__identity", children: [
        /* @__PURE__ */ r("span", { className: "meso-user-menu__identity-name", children: e }),
        t && /* @__PURE__ */ r("span", { className: "meso-user-menu__identity-email", children: t })
      ] }),
      f.length > 0 && /* @__PURE__ */ r("div", { className: "meso-user-menu__sep", role: "separator" }),
      f.map((d, h) => /* @__PURE__ */ n(
        "button",
        {
          className: `meso-user-menu__item${d.danger ? " meso-user-menu__item--danger" : ""}`,
          role: "menuitem",
          onClick: () => {
            c(!1), d.onClick();
          },
          children: [
            d.icon && /* @__PURE__ */ r("span", { className: "meso-user-menu__item-icon", children: d.icon }),
            d.label
          ]
        },
        h
      ))
    ] }),
    /* @__PURE__ */ n(
      "button",
      {
        className: "meso-user-menu__trigger",
        onClick: () => c((d) => !d),
        "aria-haspopup": "menu",
        "aria-expanded": a,
        title: e,
        children: [
          /* @__PURE__ */ r("div", { className: "meso-user-menu__avatar", children: u }),
          /* @__PURE__ */ n("div", { className: "meso-user-menu__info", children: [
            /* @__PURE__ */ r("span", { className: "meso-user-menu__name", children: e }),
            t && /* @__PURE__ */ r("span", { className: "meso-user-menu__email", children: t })
          ] })
        ]
      }
    )
  ] });
}
function dr({
  tabs: e,
  activeTabId: t,
  onTabChange: s,
  autoSelectFirstReady: o = !1
}) {
  var h;
  const l = t !== void 0, [a, c] = C(((h = e[0]) == null ? void 0 : h.id) ?? ""), i = l ? t : a, u = R(!1);
  I(() => {
    if (!o || u.current) return;
    const N = e.find((g) => g.ready);
    N && (u.current = !0, l || c(N.id), s == null || s(N.id));
  }, [e, o, l, s]);
  const f = (N) => {
    l || c(N), s == null || s(N);
  }, d = e.find((N) => N.id === i) ?? e[0];
  return e.length === 0 ? null : /* @__PURE__ */ n("div", { className: "meso-artifact-shell", children: [
    /* @__PURE__ */ r("div", { className: "meso-artifact-shell__tabs", role: "tablist", children: e.map((N) => /* @__PURE__ */ n(
      "button",
      {
        role: "tab",
        "aria-selected": N.id === i,
        className: `meso-artifact-shell__tab${N.id === i ? " meso-artifact-shell__tab--active" : ""}`,
        onClick: () => f(N.id),
        children: [
          N.label,
          N.ready === !1 && /* @__PURE__ */ r("span", { className: "meso-artifact-shell__tab-dot", "aria-label": "加载中" })
        ]
      },
      N.id
    )) }),
    /* @__PURE__ */ r("div", { className: "meso-artifact-shell__content", role: "tabpanel", children: d == null ? void 0 : d.content })
  ] });
}
function mr({ status: e, primary: t, outcome: s, detail: o, className: l, "data-testid": a }) {
  const c = o !== void 0 && o !== "", i = me({ system: !1 });
  return /* @__PURE__ */ n("div", { className: `meso-log-line${l ? ` ${l}` : ""}`, "data-testid": a ?? "meso-log-line", children: [
    /* @__PURE__ */ n(
      "div",
      {
        className: `meso-log-line__row${c ? " meso-log-line__row--clickable" : ""}`,
        onClick: c ? i.toggle : void 0,
        role: c ? "button" : void 0,
        tabIndex: c ? 0 : void 0,
        onKeyDown: c ? (u) => {
          (u.key === "Enter" || u.key === " ") && i.toggle();
        } : void 0,
        "aria-expanded": c ? i.open : void 0,
        "aria-label": c ? `${t}，${i.open ? "折叠" : "展开"}详情` : void 0,
        children: [
          /* @__PURE__ */ r(W, { status: e, size: 14, className: "meso-log-line__icon" }),
          /* @__PURE__ */ r("span", { className: "meso-log-line__primary", children: t }),
          s && /* @__PURE__ */ r("span", { className: "meso-log-line__outcome", children: s }),
          c && /* @__PURE__ */ r(
            "svg",
            {
              className: `meso-log-line__chevron${i.open ? " meso-log-line__chevron--open" : ""}`,
              width: "12",
              height: "12",
              viewBox: "0 0 12 12",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "1.5",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              "aria-hidden": "true",
              children: /* @__PURE__ */ r("polyline", { points: "2.5,4.5 6,7.5 9.5,4.5" })
            }
          )
        ]
      }
    ),
    c && i.open && /* @__PURE__ */ r("pre", { className: "meso-log-line__detail", children: o })
  ] });
}
const Ye = /* @__PURE__ */ new Set(["text", "think"]);
function Ze(e, t, s) {
  var o, l, a, c, i, u, f, d, h, N, g, y, p, v, m, _;
  if (s)
    switch (e.type) {
      case "capabilities":
        (o = s.onCapabilities) == null || o.call(s, e.payload);
        break;
      case "phase":
        (l = s.onPhaseChange) == null || l.call(s, e.payload);
        break;
      case "memory":
        (a = s.onMemoryRecalled) == null || a.call(s, e.payload.snippets);
        break;
      case "memory_saved":
        (c = s.onMemorySaved) == null || c.call(s, e.payload);
        break;
      case "soul":
        (i = s.onSoulActivated) == null || i.call(s, e.payload);
        break;
      case "skill_active":
        (u = s.onSkillActivated) == null || u.call(s, e.payload);
        break;
      case "tool_call":
        (f = s.onToolCall) == null || f.call(s, e.payload);
        break;
      case "tool_result":
        (d = s.onToolResult) == null || d.call(s, e.payload);
        break;
      case "resource_read":
        (h = s.onResourceRead) == null || h.call(s, e.payload);
        break;
      case "resource_content":
        (N = s.onResourceContent) == null || N.call(s, e.payload);
        break;
      case "text":
        (g = s.onText) == null || g.call(s, e.payload.delta, t);
        break;
      case "think":
        (y = s.onThink) == null || y.call(s, e.payload.delta, t);
        break;
      case "artifact": {
        const w = t.artifacts[e.payload.id];
        w && ((p = s.onArtifact) == null || p.call(s, w));
        break;
      }
      case "extension":
        (v = s.onExtensionEvent) == null || v.call(s, e);
        break;
      case "error":
        (m = s.onError) == null || m.call(s, e.payload.message, e.payload.code);
        break;
      case "done":
        (_ = s.onDone) == null || _.call(s, t);
        break;
    }
}
function ur(e, t) {
  const [s, o] = C(G), l = R(null), a = R(!1), c = R(t);
  c.current = t;
  const i = V(() => {
    var d;
    (d = l.current) == null || d.abort(), a.current = !1, o((h) => ({ ...h, status: "idle" }));
  }, []), u = V(() => {
    var d;
    (d = l.current) == null || d.abort(), a.current = !1, o(G());
  }, []), f = V(async (d) => {
    var m, _, w, S, E, L;
    if (a.current) return;
    a.current = !0;
    const h = typeof (d == null ? void 0 : d.reconnect) == "object" ? d.reconnect : { maxAttempts: 3, baseDelayMs: 1e3 }, N = d != null && d.reconnect ? h.maxAttempts ?? 3 : 0, g = h.baseDelayMs ?? 1e3, y = (d == null ? void 0 : d.batchMs) === void 0 ? 16 : d.batchMs;
    let p = 0;
    const v = async () => {
      var Z;
      (Z = l.current) == null || Z.abort();
      const k = new AbortController();
      l.current = k;
      const b = { ...G(), status: "streaming" };
      o(b);
      let T = b;
      const K = (d == null ? void 0 : d.method) ?? (d != null && d.body ? "POST" : "GET"), B = (d == null ? void 0 : d.watchdogMs) === void 0 ? 12e4 : d.watchdogMs;
      let j = null;
      const M = () => {
        j && clearTimeout(j);
      }, H = () => {
        M(), B != null && (j = setTimeout(() => {
          var O, U;
          k.abort();
          const x = `SSE stream timed out after ${B}ms of inactivity`;
          o((z) => ({ ...z, status: "error", errorMessage: x, errorCode: "WATCHDOG_TIMEOUT" })), (U = (O = c.current) == null ? void 0 : O.onError) == null || U.call(O, x, "WATCHDOG_TIMEOUT");
        }, B));
      }, D = [];
      let $ = null;
      const A = (x) => {
        const O = be(T, x);
        if (T = O, o(O), Ze(x, O, c.current), x.type === "done" || x.type === "error")
          return M(), x.type;
      }, Y = () => {
        for (; D.length > 0; ) {
          const x = D.shift(), O = A(x);
          if (O) return O;
        }
      }, _e = (x) => {
        if (y != null && Ye.has(x.type)) {
          D.push(x), $ || ($ = setTimeout(() => {
            $ = null, Y();
          }, y));
          return;
        }
        return A(x);
      };
      try {
        const x = await fetch(e, {
          method: K,
          headers: {
            ...K === "POST" ? { "Content-Type": "application/json" } : {},
            ...d == null ? void 0 : d.headers
          },
          body: d != null && d.body ? JSON.stringify(d.body) : void 0,
          signal: k.signal
        });
        if (!x.ok) throw new Error(`HTTP ${x.status}`);
        const O = x.body.getReader(), U = new TextDecoder();
        let z = "";
        for (H(); ; ) {
          const { done: fe, value: pe } = await O.read();
          if (fe) break;
          H(), z += U.decode(pe, { stream: !0 });
          const Q = z.split(`
`);
          z = Q.pop() ?? "";
          for (const ve of Q) {
            const X = ke(ve);
            if (!X) continue;
            const ee = _e(X);
            if (ee) return ee;
          }
        }
        $ && (clearTimeout($), $ = null);
        const q = Y();
        return q || "interrupted";
      } catch (x) {
        if (x.name === "AbortError") return "interrupted";
        throw x;
      } finally {
        M(), $ && clearTimeout($);
      }
    };
    try {
      for (; ; ) {
        try {
          const k = await v();
          if (k === "done" || k === "error") return;
          if (!(d != null && d.reconnect) || p >= N) {
            const b = "SSE stream ended unexpectedly";
            o((T) => ({ ...T, status: "error", errorMessage: b, errorCode: "STREAM_ENDED" })), (_ = (m = c.current) == null ? void 0 : m.onError) == null || _.call(m, b, "STREAM_ENDED");
            return;
          }
        } catch (k) {
          if (!(d != null && d.reconnect) || p >= N) {
            const b = k.message;
            o((T) => ({ ...T, status: "error", errorMessage: b })), (S = (w = c.current) == null ? void 0 : w.onError) == null || S.call(w, b);
            return;
          }
        }
        p += 1, (L = (E = c.current) == null ? void 0 : E.onReconnect) == null || L.call(E, p), await new Promise((k) => setTimeout(k, g * Math.pow(2, p - 1)));
      }
    } finally {
      a.current = !1;
    }
  }, [e]);
  return { state: s, start: f, abort: i, reset: u };
}
const ue = "meso-theme";
function qe() {
  return typeof window > "u" ? "light" : localStorage.getItem(ue) ?? "light";
}
function Qe(e) {
  document.documentElement.setAttribute("data-theme", e), localStorage.setItem(ue, e);
}
function hr() {
  const [e, t] = C(qe);
  I(() => {
    Qe(e);
  }, [e]);
  const s = V(() => {
    t((o) => o === "light" ? "dark" : "light");
  }, []);
  return { theme: e, toggle: s };
}
const he = {
  statusRunning: "进行中",
  statusDone: "完成",
  statusError: "失败",
  statusPending: "等待",
  statusWarning: "警告",
  processTraceSummary: "执行过程",
  processTraceExecuting: "执行中",
  foldExpand: "展开",
  foldCollapse: "折叠",
  toolConfirm: "确认",
  toolCancel: "取消",
  stageProgress: "处理进度",
  workflowProgress: "工作流进度",
  emptyChat: "发送消息开始对话"
}, Xe = {
  statusRunning: "Running",
  statusDone: "Done",
  statusError: "Failed",
  statusPending: "Pending",
  statusWarning: "Warning",
  processTraceSummary: "Execution trace",
  processTraceExecuting: "Executing",
  foldExpand: "Expand",
  foldCollapse: "Collapse",
  toolConfirm: "Confirm",
  toolCancel: "Cancel",
  stageProgress: "Progress",
  workflowProgress: "Workflow progress",
  emptyChat: "Send a message to start"
}, er = {
  "zh-CN": he,
  "en-US": Xe
}, J = Ne({
  locale: "zh-CN",
  labels: he
});
function _r({
  locale: e = "zh-CN",
  labels: t,
  children: s
}) {
  const o = { ...er[e], ...t };
  return /* @__PURE__ */ r(J.Provider, { value: { locale: e, labels: o }, children: s });
}
function fr() {
  return ne(J).labels;
}
function pr() {
  return ne(J);
}
export {
  dr as ArtifactPaneShell,
  se as ArtifactPanel,
  re as ChatBubble,
  lr as ChatComposer,
  ae as CollapsibleToolTrace,
  Pe as ConfirmGate,
  mr as LogLine,
  _r as MesoLocaleProvider,
  nr as MessageList,
  Nr as PROTOCOL_VERSION,
  cr as ProcessTrace,
  Ve as ResourceReadBlock,
  ir as SidebarUserMenu,
  Be as SkillIndicator,
  Me as SoulIndicator,
  $e as StageTimeline,
  W as StatusIcon,
  or as StreamingCursor,
  le as ThinkBlock,
  ar as ThreeColumnLayout,
  de as ToolCallBlock,
  Ie as WorkflowTimeline,
  be as applyEvent,
  wr as assertCompatibleVersion,
  G as createInitialStreamState,
  kr as createStreamStateWithArtifacts,
  er as defaultLabelsByLocale,
  Xe as enUSLabels,
  br as isCompatibleVersion,
  ke as parseSSELine,
  we as phaseRecordToStage,
  yr as streamStateHasArtifacts,
  me as useFoldState,
  fr as useMesoLabels,
  pr as useMesoLocale,
  ur as useSSEStream,
  hr as useTheme,
  he as zhCNLabels
};
