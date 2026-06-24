import { jsxs as l, jsx as r, Fragment as B } from "react/jsx-runtime";
import z, { useState as C, useRef as T, useEffect as O, useCallback as W, createContext as ge, useContext as ne } from "react";
import { phaseRecordToStage as ve, createInitialStreamState as U, parseSSELine as Ne, applyEvent as we } from "./runtime.js";
import { PROTOCOL_VERSION as pr, assertCompatibleVersion as gr, createStreamStateWithArtifacts as vr, isCompatibleVersion as Nr, streamStateHasArtifacts as wr } from "./runtime.js";
function rr({
  navItems: e = [],
  sidebarFooter: t,
  sessionColumn: s,
  children: a,
  defaultCollapsed: n = !1,
  appName: c = "Meso",
  sidebarLogo: i,
  sidebarTitle: m,
  mainHeader: h,
  artifactPanel: _,
  defaultArtifactVisible: o = !1,
  onArtifactToggle: u,
  artifactVisible: f,
  showArtifactToggle: k = !0,
  showSessionColumn: N = !0,
  contentMaxWidth: v,
  artifactPanelWidth: g,
  onCollapsedChange: d
}) {
  const [p, w] = C(n), [S, E] = C(o), L = f !== void 0 ? f : S, y = () => {
    const b = !L;
    f === void 0 && E(b), u == null || u(b);
  };
  return /* @__PURE__ */ l("div", { className: "meso-layout", children: [
    /* @__PURE__ */ l("aside", { className: `meso-sidebar${p ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ l("div", { className: "meso-sidebar__header", children: [
        i ? /* @__PURE__ */ r("div", { className: "meso-sidebar__logo meso-sidebar__logo--custom", children: i }) : /* @__PURE__ */ r("div", { className: "meso-sidebar__logo", children: c[0] }),
        m ? /* @__PURE__ */ r("span", { className: "meso-sidebar__title meso-sidebar__title--brand", children: m }) : /* @__PURE__ */ r("span", { className: "meso-sidebar__title", children: c }),
        /* @__PURE__ */ r(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => {
              const b = !p;
              w(b), d == null || d(b);
            },
            "aria-label": p ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ l("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ r("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ r("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ r("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ r("nav", { className: "meso-sidebar__nav", children: e.map((b) => /* @__PURE__ */ l(
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
    N !== !1 && /* @__PURE__ */ r("div", { className: "meso-session-col", children: s }),
    /* @__PURE__ */ l("main", { className: "meso-main", children: [
      /* @__PURE__ */ l("div", { className: "meso-main__header", children: [
        /* @__PURE__ */ r("div", { className: "meso-main__header-content", children: h }),
        k !== !1 && /* @__PURE__ */ r(
          "button",
          {
            className: `meso-artifact-toggle${L ? " meso-artifact-toggle--active" : ""}`,
            onClick: y,
            title: L ? "关闭 Artifact" : "打开 Artifact",
            "aria-label": L ? "关闭 Artifact" : "打开 Artifact",
            children: L ? (
              /* X / close icon */
              /* @__PURE__ */ l("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ r("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                /* @__PURE__ */ r("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
              ] })
            ) : (
              /* Panel / artifact icon */
              /* @__PURE__ */ l("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ r("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                /* @__PURE__ */ r("line", { x1: "14", y1: "3", x2: "14", y2: "21" })
              ] })
            )
          }
        )
      ] }),
      /* @__PURE__ */ l("div", { className: "meso-main__content", children: [
        /* @__PURE__ */ r("div", { className: "meso-main__chat", style: v ? { maxWidth: v, margin: "0 auto", width: "100%" } : void 0, children: a }),
        L && /* @__PURE__ */ l(B, { children: [
          /* @__PURE__ */ r("div", { className: "meso-artifact-divider", "aria-hidden": "true" }),
          /* @__PURE__ */ r(
            "div",
            {
              className: "meso-artifact-pane",
              style: g != null ? { width: g, minWidth: g, maxWidth: g } : void 0,
              children: _
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
  timestamp: a,
  markdown: n = !1,
  renderMarkdown: c
}) {
  const i = n && typeof c == "function";
  return /* @__PURE__ */ l("div", { className: `meso-bubble meso-bubble--${e}`, children: [
    e === "assistant" && /* @__PURE__ */ r("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ l("div", { className: "meso-bubble__body", children: [
      i ? /* @__PURE__ */ r(
        "div",
        {
          className: "meso-bubble__content meso-bubble__md",
          dangerouslySetInnerHTML: { __html: c(t) }
        }
      ) : /* @__PURE__ */ l("div", { className: "meso-bubble__content", children: [
        t.split(`
`).map((m, h) => /* @__PURE__ */ l(z.Fragment, { children: [
          h > 0 && /* @__PURE__ */ r("br", {}),
          m
        ] }, h)),
        s && /* @__PURE__ */ r("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      a && /* @__PURE__ */ r("div", { className: "meso-bubble__timestamp", children: a })
    ] })
  ] });
}
function oe({
  content: e,
  pinnedContent: t,
  streaming: s = !1,
  turnStreaming: a,
  autoCollapseDelay: n = 1500,
  defaultOpen: c = !0,
  open: i,
  onOpenChange: m,
  collapseWhen: h = "streamEnd",
  summary: _ = "已思考"
}) {
  const o = i !== void 0, [u, f] = C(c), [k, N] = C(null), v = T(null);
  v.current = k;
  const g = o ? i : k !== null ? k : u, d = T(s), p = T(a), w = () => {
    const L = !g;
    o || N(L), m == null || m(L);
  };
  return O(() => {
    if (h !== "never" && n !== null) {
      if (d.current && !s) {
        const L = setTimeout(() => {
          o || f(!1), v.current === null && (m == null || m(!1));
        }, n);
        return () => clearTimeout(L);
      }
      d.current = s;
    }
  }, [s, n, h, o, m]), O(() => {
    a !== void 0 && (p.current && !a && N(null), p.current = a);
  }, [a]), /* @__PURE__ */ l("div", { className: `meso-think${g ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ l(
      "button",
      {
        className: "meso-think__header",
        onClick: w,
        "aria-expanded": g,
        children: [
          /* @__PURE__ */ r("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ r("span", { className: "meso-think__label", children: g ? "思考过程" : _ }),
          s && /* @__PURE__ */ r("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ r("div", { className: "meso-think__body", children: /* @__PURE__ */ l("div", { className: "meso-think__content", children: [
      !s && t !== void 0 ? t : e,
      s && /* @__PURE__ */ r("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function sr({ active: e = !0 }) {
  return e ? /* @__PURE__ */ r("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function ke(e) {
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
  streaming: a = !1,
  onCopy: n,
  onDownload: c,
  renderMermaid: i,
  highlightCode: m,
  renderMarkdown: h
}) {
  const [_, o] = C(!1), [u, f] = C(e), [k, N] = C(null), [v, g] = C(!1), [d, p] = C(null), w = T("");
  O(() => {
    f(e);
  }, [e]), O(() => {
    e !== "mermaid" || a || !i || t === w.current || (w.current = t, N(null), g(!1), i(t).then((y) => N(y)).catch(() => g(!0)));
  }, [e, a, t, i]), O(() => {
    e !== "code" || a || !m || t === w.current && d || (w.current = t, p(m(t, s)));
  }, [e, a, t, s, m, d]);
  const S = () => {
    navigator.clipboard.writeText(t).catch(() => {
    }), o(!0), setTimeout(() => o(!1), 2e3), n == null || n(t);
  }, E = () => {
    if (c) {
      c(t);
      return;
    }
    const y = {
      html: "html",
      mermaid: "md",
      markdown: "md",
      table: "json",
      code: s || "txt"
    }, b = new Blob([t], { type: "text/plain" }), R = document.createElement("a");
    R.href = URL.createObjectURL(b), R.download = `artifact.${y[e]}`, R.click(), URL.revokeObjectURL(R.href);
  };
  return /* @__PURE__ */ l("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ l("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ r("div", { className: "meso-artifact__tabs", children: (e === "html" ? ["html", "code"] : [e]).map((y) => /* @__PURE__ */ r(
        "span",
        {
          className: `meso-artifact__tab${u === y ? " meso-artifact__tab--active" : ""}`,
          onClick: () => f(y),
          children: be(y, s)
        },
        y
      )) }),
      a && /* @__PURE__ */ r("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ r("button", { className: "meso-artifact__download-btn", onClick: E, title: "下载", "aria-label": "下载文件", children: /* @__PURE__ */ r("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) }) }),
      /* @__PURE__ */ r("button", { className: "meso-artifact__copy-btn", onClick: S, title: "复制", "aria-label": "复制代码", children: _ ? /* @__PURE__ */ r("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ l("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ r("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
        /* @__PURE__ */ r("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
      ] }) })
    ] }),
    /* @__PURE__ */ l("div", { className: "meso-artifact__body", children: [
      u === "html" && /* @__PURE__ */ r("iframe", { className: "meso-artifact__preview", srcDoc: t, sandbox: "allow-scripts", title: "HTML 预览" }),
      u === "mermaid" && /* @__PURE__ */ l(B, { children: [
        a && /* @__PURE__ */ l("pre", { className: "meso-artifact__code", children: [
          /* @__PURE__ */ r("code", { children: t }),
          /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
        ] }),
        !a && k && /* @__PURE__ */ r(
          "div",
          {
            className: "meso-artifact__mermaid",
            dangerouslySetInnerHTML: { __html: k }
          }
        ),
        !a && !k && !v && !i && /* @__PURE__ */ l("div", { className: "meso-artifact__mermaid-placeholder", children: [
          /* @__PURE__ */ r("span", { children: "图表预览需要集成 Mermaid 渲染器" }),
          /* @__PURE__ */ r("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ r("code", { children: t }) })
        ] }),
        !a && v && /* @__PURE__ */ l("div", { className: "meso-artifact__mermaid-placeholder meso-artifact__mermaid-placeholder--error", children: [
          /* @__PURE__ */ r("span", { children: "图表渲染失败，请检查语法" }),
          /* @__PURE__ */ r("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ r("code", { children: t }) })
        ] }),
        !a && !k && !v && i && /* @__PURE__ */ r("div", { className: "meso-artifact__mermaid-placeholder", children: /* @__PURE__ */ r("span", { children: "渲染中…" }) })
      ] }),
      u === "markdown" && /* @__PURE__ */ r(B, { children: h ? /* @__PURE__ */ r(
        "div",
        {
          className: "meso-artifact__markdown",
          dangerouslySetInnerHTML: { __html: h(t) }
        }
      ) : /* @__PURE__ */ l("pre", { className: "meso-artifact__code", children: [
        /* @__PURE__ */ r("code", { children: t }),
        a && /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] }) }),
      u === "table" && /* @__PURE__ */ r(ye, { content: t, streaming: a }),
      (u === "code" || u === "html" && !1) && /* @__PURE__ */ l("pre", { className: "meso-artifact__code", children: [
        d && !a ? /* @__PURE__ */ r("code", { dangerouslySetInnerHTML: { __html: d } }) : /* @__PURE__ */ r("code", { children: t }),
        a && /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] })
    ] })
  ] });
}
function ye({ content: e, streaming: t }) {
  const s = ke(e);
  return s ? /* @__PURE__ */ r("div", { className: "meso-artifact__table-wrap", children: /* @__PURE__ */ l("table", { className: "meso-artifact__table", children: [
    /* @__PURE__ */ r("thead", { children: /* @__PURE__ */ r("tr", { children: s.headers.map((a, n) => /* @__PURE__ */ r("th", { children: a }, n)) }) }),
    /* @__PURE__ */ r("tbody", { children: s.rows.map((a, n) => /* @__PURE__ */ r("tr", { children: a.map((c, i) => /* @__PURE__ */ r("td", { children: String(c) }, i)) }, n)) })
  ] }) }) : /* @__PURE__ */ l("pre", { className: "meso-artifact__code", children: [
    /* @__PURE__ */ r("code", { children: e }),
    t && /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
  ] });
}
function be(e, t) {
  return e === "html" ? "HTML 预览" : e === "mermaid" ? "图表" : e === "markdown" ? "Markdown" : e === "table" ? "表格" : t || "Code";
}
const xe = {
  running: "进行中",
  done: "完成",
  error: "失败",
  pending: "等待",
  warning: "警告"
};
function A({
  status: e,
  size: t = 16,
  className: s,
  "aria-label": a
}) {
  const n = a ?? xe[e];
  return /* @__PURE__ */ l(
    "span",
    {
      className: `meso-status-icon meso-status-icon--${e}${s ? ` ${s}` : ""}`,
      style: { width: t, height: t },
      role: "img",
      "aria-label": n,
      children: [
        e === "running" && /* @__PURE__ */ l("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeDasharray: "3 3", className: "meso-status-icon__spin" }),
          /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "2.5", fill: "currentColor", className: "meso-status-icon__pulse" })
        ] }),
        e === "done" && /* @__PURE__ */ l("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ r("polyline", { points: "4.5,8 7,10.5 11.5,5.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
        ] }),
        e === "error" && /* @__PURE__ */ l("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ r("line", { x1: "5.5", y1: "5.5", x2: "10.5", y2: "10.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" }),
          /* @__PURE__ */ r("line", { x1: "10.5", y1: "5.5", x2: "5.5", y2: "10.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" })
        ] }),
        e === "pending" && /* @__PURE__ */ r("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "6.25", stroke: "currentColor", strokeWidth: "1.5" }) }),
        e === "warning" && /* @__PURE__ */ l("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ r("line", { x1: "8", y1: "5", x2: "8", y2: "9", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" }),
          /* @__PURE__ */ r("circle", { cx: "8", cy: "11.5", r: "0.75", fill: "white" })
        ] })
      ]
    }
  );
}
function Ce(e) {
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
function Se({ stages: e, compact: t = !1 }) {
  return e.length === 0 ? null : /* @__PURE__ */ r("div", { className: `meso-stages${t ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: e.map((s, a) => /* @__PURE__ */ l(
    "div",
    {
      className: `meso-stage meso-stage--${s.status}`,
      children: [
        /* @__PURE__ */ r("div", { className: "meso-stage__dot", children: /* @__PURE__ */ r(A, { status: Ce(s.status), size: 10 }) }),
        a < e.length - 1 && /* @__PURE__ */ r("div", { className: `meso-stage__line${s.status === "done" ? " meso-stage__line--done" : ""}` }),
        /* @__PURE__ */ r("span", { className: `meso-stage__label${t ? " meso-stage__label--compact" : ""}`, children: s.label })
      ]
    },
    s.id
  )) });
}
function Le(e) {
  const { nodes: t, nodeOrder: s } = e, a = /* @__PURE__ */ new Map();
  for (const m of s) {
    const h = t[m];
    if (!h) continue;
    const _ = h.parent_id ?? null;
    a.has(_) || a.set(_, []), a.get(_).push(m);
  }
  const n = /* @__PURE__ */ new Map();
  for (const [, m] of a)
    if (m.length > 1)
      for (const h of m) n.set(h, m);
  const c = [], i = /* @__PURE__ */ new Set();
  for (const m of s) {
    if (i.has(m)) continue;
    const h = t[m];
    if (!h) continue;
    const _ = n.get(m);
    if (_) {
      const o = _.map((u) => t[u]).filter((u) => !!u);
      for (const u of o) i.add(u.node_id);
      c.push({ kind: "parallel", nodes: o, isLast: !1 });
    } else
      i.add(m), c.push({ kind: "node", node: h, isLast: !1 });
  }
  return c.length > 0 && (c[c.length - 1] = { ...c[c.length - 1], isLast: !0 }), c;
}
function $e(e) {
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
function le({ state: e }) {
  return /* @__PURE__ */ r(
    A,
    {
      status: $e(e),
      size: 12,
      className: `meso-wf-node__icon meso-wf-node__icon--${e}`
    }
  );
}
function ie(e) {
  return e < 1e3 ? `${e}ms` : `${(e / 1e3).toFixed(1)}s`;
}
function Te({ node: e, isLast: t }) {
  var c;
  const [s, a] = C(!1), n = e.metadata && Object.keys(e.metadata).length > 0;
  return /* @__PURE__ */ l("div", { className: `meso-wf-node meso-wf-node--${e.state}`, children: [
    /* @__PURE__ */ l("div", { className: "meso-wf-node__track", children: [
      /* @__PURE__ */ r("div", { className: "meso-wf-node__dot", children: /* @__PURE__ */ r(le, { state: e.state }) }),
      !t && /* @__PURE__ */ r("div", { className: "meso-wf-node__line" })
    ] }),
    /* @__PURE__ */ l("div", { className: "meso-wf-node__body", children: [
      /* @__PURE__ */ l("div", { className: "meso-wf-node__header", children: [
        /* @__PURE__ */ r("code", { className: "meso-wf-node__name", children: e.name }),
        e.duration_ms !== void 0 && /* @__PURE__ */ r("span", { className: "meso-wf-node__duration", children: ie(e.duration_ms) }),
        n && /* @__PURE__ */ r(
          "button",
          {
            className: "meso-wf-node__expand",
            onClick: () => a((i) => !i),
            "aria-expanded": s,
            "aria-label": s ? "收起详情" : "展开详情",
            children: /* @__PURE__ */ r("svg", { viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", style: { transform: s ? "rotate(180deg)" : void 0 }, children: /* @__PURE__ */ r("polyline", { points: "2,3.5 5,6.5 8,3.5" }) })
          }
        )
      ] }),
      e.state === "error" && !!((c = e.metadata) != null && c.error) && /* @__PURE__ */ r("div", { className: "meso-wf-node__error", children: String(e.metadata.error) }),
      s && n && /* @__PURE__ */ r("pre", { className: "meso-wf-node__meta", children: JSON.stringify(e.metadata, null, 2) })
    ] })
  ] });
}
function Ee({ nodes: e, isLast: t }) {
  return /* @__PURE__ */ l("div", { className: "meso-wf-parallel", children: [
    /* @__PURE__ */ r("div", { className: "meso-wf-parallel__row", children: e.map((s, a) => {
      var n;
      return /* @__PURE__ */ l("div", { className: `meso-wf-parallel__branch meso-wf-parallel__branch--${s.state}`, children: [
        /* @__PURE__ */ r("div", { className: "meso-wf-parallel__branch-dot", children: /* @__PURE__ */ r(le, { state: s.state }) }),
        /* @__PURE__ */ l("div", { className: "meso-wf-parallel__branch-body", children: [
          /* @__PURE__ */ l("div", { className: "meso-wf-parallel__branch-label", children: [
            "并行分支 ",
            String.fromCharCode(65 + a)
          ] }),
          /* @__PURE__ */ r("code", { className: "meso-wf-node__name", children: s.name }),
          s.state === "error" && !!((n = s.metadata) != null && n.error) && /* @__PURE__ */ r("div", { className: "meso-wf-node__error", children: String(s.metadata.error) }),
          s.duration_ms !== void 0 && /* @__PURE__ */ r("span", { className: "meso-wf-node__duration", style: { display: "block", marginTop: 2 }, children: ie(s.duration_ms) })
        ] })
      ] }, s.node_id);
    }) }),
    !t && /* @__PURE__ */ r("div", { className: "meso-wf-parallel__merge" })
  ] });
}
function Re({ runs: e, showRunId: t = !0, hidden: s }) {
  if (e.length === 0 || s) return null;
  const a = e.length > 1;
  return /* @__PURE__ */ r("div", { className: "meso-wf", role: "status", "aria-label": "工作流进度", children: e.map((n) => {
    const c = Le(n);
    return /* @__PURE__ */ l("div", { className: "meso-wf-run", children: [
      a && t && /* @__PURE__ */ r("div", { className: "meso-wf-run__label", children: n.run_id }),
      c.map(
        (i, m) => i.kind === "parallel" ? /* @__PURE__ */ r(Ee, { nodes: i.nodes, isLast: i.isLast }, `parallel-${m}`) : /* @__PURE__ */ r(Te, { node: i.node, isLast: i.isLast }, i.node.node_id)
      )
    ] }, n.run_id);
  }) });
}
function Oe({ soul: e, compact: t = !1 }) {
  const s = e.name.charAt(0);
  return /* @__PURE__ */ l(
    "div",
    {
      className: `meso-soul${t ? " meso-soul--compact" : ""}`,
      title: `${e.name} v${e.version}`,
      role: "status",
      "aria-label": `当前 Soul: ${e.name}`,
      children: [
        /* @__PURE__ */ r("div", { className: "meso-soul__avatar", children: e.avatar ? /* @__PURE__ */ r("img", { src: e.avatar, alt: e.name, className: "meso-soul__img" }) : /* @__PURE__ */ r("span", { className: "meso-soul__initial", children: s }) }),
        !t && /* @__PURE__ */ l(B, { children: [
          /* @__PURE__ */ r("span", { className: "meso-soul__name", children: e.name }),
          e.traits && e.traits.length > 0 && /* @__PURE__ */ r("div", { className: "meso-soul__traits", children: e.traits.map((a) => /* @__PURE__ */ r("span", { className: "meso-soul__trait", children: a }, a)) })
        ] })
      ]
    }
  );
}
const Ie = {
  mcp: "MCP",
  api: "API"
};
function Ae({ skill: e }) {
  const t = e.provider ? Ie[e.provider] : null;
  return /* @__PURE__ */ l(
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
        e.focus && e.focus.length > 0 && /* @__PURE__ */ l("span", { className: "meso-skill__focus", children: [
          "· ",
          e.focus.join(", ")
        ] }),
        t && /* @__PURE__ */ r("span", { className: "meso-skill__provider", children: t })
      ]
    }
  );
}
const Me = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function Be({ toolCall: e, onConfirm: t, onCancel: s }) {
  const a = e.risk ?? "safe", n = Me[a], c = Object.keys(e.args).length > 0;
  return /* @__PURE__ */ l("div", { className: `meso-confirm-gate meso-confirm-gate--${a}`, role: "alertdialog", "aria-label": "工具执行确认", "data-testid": "meso-confirm-gate", children: [
    /* @__PURE__ */ r("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ l("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ r("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ r("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ l("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ l("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ r("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${a}`, children: n.label }),
        /* @__PURE__ */ r("code", { className: "meso-confirm-gate__tool-name", children: e.name })
      ] }),
      c && /* @__PURE__ */ r("pre", { className: "meso-confirm-gate__args", children: JSON.stringify(e.args, null, 2) }),
      /* @__PURE__ */ l("div", { className: "meso-confirm-gate__actions", children: [
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
            className: `meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${a}`,
            onClick: () => t(e.id),
            children: n.confirmText
          }
        )
      ] })
    ] })
  ] });
}
function De(e) {
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
function We(e) {
  switch (e) {
    case "pending":
      return "pending";
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
    case "running":
      return "running";
    case "done":
      return "done";
    case "error":
      return "error";
  }
}
const Pe = {
  safe: "只读",
  write: "写入",
  destructive: "危险"
}, te = {
  mcp: "MCP",
  api: "API",
  local: "本地"
};
function ce({ toolCall: e, onConfirm: t, onCancel: s, className: a, "data-testid": n, simplify: c }) {
  var d, p;
  const [i, m] = C(!1), [h, _] = C((c != null && c.hideResultDetails, !1)), { call: o, result: u, status: f } = e, k = o.risk ?? "safe", N = Object.keys(o.args).length > 0, { hideMetadata: v, hideResultDetails: g } = c || {};
  return /* @__PURE__ */ l(
    "div",
    {
      className: `meso-tool meso-tool--${f} meso-tool--risk-${k}${a ? ` ${a}` : ""}`,
      "data-testid": n ?? "meso-tool-call-block",
      children: [
        /* @__PURE__ */ l("div", { className: "meso-tool__header", children: [
          /* @__PURE__ */ r(A, { status: De(f), size: 14, className: "meso-tool__status-icon" }),
          /* @__PURE__ */ r("span", { className: "meso-tool__name", children: o.name }),
          o.provider && te[o.provider] && /* @__PURE__ */ r("span", { className: `meso-tool__provider meso-tool__provider--${o.provider}`, children: te[o.provider] }),
          ((d = o.annotations) == null ? void 0 : d.open_world) && /* @__PURE__ */ r("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", children: "🌐" }),
          k !== "safe" && /* @__PURE__ */ r("span", { className: `meso-tool__risk meso-tool__risk--${k}`, children: Pe[k] }),
          !v && (u == null ? void 0 : u.duration_ms) !== void 0 && /* @__PURE__ */ l("span", { className: "meso-tool__duration", children: [
            u.duration_ms,
            "ms"
          ] }),
          !v && N && /* @__PURE__ */ l(
            "button",
            {
              className: "meso-tool__toggle",
              onClick: () => m((w) => !w),
              "aria-expanded": i,
              "aria-label": i ? "折叠参数" : "展开参数",
              children: [
                i ? "▾" : "▸",
                " 参数"
              ]
            }
          ),
          v && N && ((p = u == null ? void 0 : u.metadata) == null ? void 0 : p.resultCount) !== void 0 && /* @__PURE__ */ l("span", { className: "meso-tool__summary", children: [
            "— ",
            u.metadata.resultCount,
            " 项"
          ] })
        ] }),
        !v && i && N && /* @__PURE__ */ r("pre", { className: "meso-tool__args", children: JSON.stringify(o.args, null, 2) }),
        f === "awaiting_confirm" && t && s && /* @__PURE__ */ r(
          Be,
          {
            toolCall: o,
            onConfirm: t,
            onCancel: s
          }
        ),
        (f === "done" || f === "error") && u && !g && /* @__PURE__ */ l("div", { className: "meso-tool__result", children: [
          /* @__PURE__ */ l(
            "button",
            {
              className: "meso-tool__toggle",
              onClick: () => _((w) => !w),
              "aria-expanded": h,
              "aria-label": h ? "折叠结果" : "展开结果",
              children: [
                h ? "▾" : "▸",
                " ",
                f === "error" ? "错误" : "结果"
              ]
            }
          ),
          h && /* @__PURE__ */ r("pre", { className: `meso-tool__output${f === "error" ? " meso-tool__output--error" : ""}`, children: f === "error" ? u.error : u.output })
        ] })
      ]
    }
  );
}
function He({ resourceRead: e, className: t }) {
  const [s, a] = C(!1), { read: n, content: c, status: i } = e, m = n.name ?? n.uri, h = n.server;
  return /* @__PURE__ */ l("div", { className: `meso-resource meso-resource--${i}${t ? ` ${t}` : ""}`, children: [
    /* @__PURE__ */ l("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ r(A, { status: We(i), size: 13, className: "meso-resource__status-icon" }),
      /* @__PURE__ */ r("span", { className: "meso-resource__uri", title: n.uri, children: m }),
      h && /* @__PURE__ */ r("span", { className: "meso-resource__server", children: h }),
      (c == null ? void 0 : c.duration_ms) !== void 0 && /* @__PURE__ */ l("span", { className: "meso-resource__duration", children: [
        c.duration_ms,
        "ms"
      ] }),
      (i === "done" || i === "error") && c && /* @__PURE__ */ l(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => a((_) => !_),
          "aria-expanded": s,
          "aria-label": s ? "折叠内容" : "展开内容",
          children: [
            s ? "▾" : "▸",
            " ",
            i === "error" ? "错误" : "内容"
          ]
        }
      )
    ] }),
    s && c && /* @__PURE__ */ r("div", { className: "meso-resource__content", children: i === "error" ? /* @__PURE__ */ r("pre", { className: "meso-resource__text meso-resource__text--error", children: c.error }) : c.contents.map((_, o) => /* @__PURE__ */ l("div", { children: [
      _.type === "text" && /* @__PURE__ */ r("pre", { className: "meso-resource__text", children: _.text }),
      _.type === "image" && _.data && /* @__PURE__ */ r(
        "img",
        {
          className: "meso-resource__image",
          src: `data:${_.mime_type ?? "image/png"};base64,${_.data}`,
          alt: "resource"
        }
      ),
      _.type === "blob" && /* @__PURE__ */ l("span", { className: "meso-resource__blob-label", children: [
        "[",
        _.mime_type ?? "binary",
        "]"
      ] })
    ] }, o)) })
  ] });
}
function de({
  system: e,
  resetOnTurnStart: t = !1
}) {
  const [s, a] = C(null), n = T(e);
  return O(() => {
    t && !n.current && e && a(null), n.current = e;
  }, [e, t]), {
    open: s !== null ? s : e,
    setOpen: (i) => a(i),
    toggle: () => a((i) => i !== null ? !i : !e),
    clearIntent: () => a(null),
    hasUserIntent: s !== null
  };
}
function Ke(e) {
  const t = /* @__PURE__ */ new Map(), s = [];
  for (const a of e.toolCallOrder) {
    const n = e.toolCalls[a];
    if (!n) continue;
    const c = n.groupId ? `${n.groupKind ?? "group"}:${n.groupId}` : `__single__:${a}`;
    t.has(c) || (t.set(c, {
      key: c,
      groupId: n.groupId,
      groupKind: n.groupKind,
      ids: []
    }), s.push(c)), t.get(c).ids.push(a);
  }
  return s.map((a) => t.get(a));
}
function Ue(e) {
  const t = e.toolCallOrder.length + e.workflowRunOrder.reduce(
    (n, c) => {
      var i;
      return n + (((i = e.workflowRuns[c]) == null ? void 0 : i.nodeOrder.length) ?? 0);
    },
    0
  ), s = e.toolCallOrder.filter((n) => {
    var c;
    return ((c = e.toolCalls[n]) == null ? void 0 : c.status) === "error";
  }).length + e.workflowRunOrder.reduce((n, c) => {
    const i = e.workflowRuns[c];
    return i ? n + i.nodeOrder.filter((m) => {
      var h;
      return ((h = i.nodes[m]) == null ? void 0 : h.state) === "error";
    }).length : n;
  }, 0), a = [];
  return e.phaseOrder.length > 0 && a.push(`${e.phaseOrder.length} 阶段`), t > 0 && a.push(`${t} 步`), s > 0 && a.push(`${s} 项失败`), a.length > 0 ? a.join(" · ") : "执行过程";
}
function ze(e, t) {
  const s = !!(e.thinkContent || e.pinnedThink);
  return /* @__PURE__ */ l("div", { className: "meso-process-trace__phase", "data-testid": `meso-phase-${e.id}`, children: [
    /* @__PURE__ */ l("div", { className: "meso-process-trace__phase-header", children: [
      /* @__PURE__ */ r(A, { status: je(e.state), size: 14 }),
      /* @__PURE__ */ r("span", { className: "meso-process-trace__phase-name", children: e.name })
    ] }),
    s && /* @__PURE__ */ r(
      oe,
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
function Ve({
  stream: e,
  streaming: t = !1,
  turnStreaming: s = !1,
  defaultCollapsed: a = !1,
  className: n,
  onToolConfirm: c,
  onToolCancel: i,
  renderToolCall: m,
  renderPhase: h,
  renderWorkflow: _,
  simplify: o
}) {
  const u = de({
    system: !a,
    resetOnTurnStart: s
  });
  if (!(!!e.thinkContent || e.phaseOrder.length > 0 || e.memorySnippets.length > 0 || e.resourceReadOrder.length > 0 || e.toolCallOrder.length > 0 || e.workflowRunOrder.length > 0)) return null;
  const k = Ue(e), N = e.workflowRunOrder.map((d) => e.workflowRuns[d]).filter(Boolean), v = Ke(e), g = e.phaseOrder.map((d) => e.phases[d]).filter(Boolean).map(ve);
  return /* @__PURE__ */ l(
    "div",
    {
      className: `meso-process-trace${n ? ` ${n}` : ""}`,
      "data-testid": "meso-process-trace",
      children: [
        /* @__PURE__ */ l(
          "button",
          {
            className: "meso-process-trace__header",
            onClick: u.toggle,
            "aria-expanded": u.open,
            "aria-label": u.open ? "折叠执行过程" : "展开执行过程",
            children: [
              /* @__PURE__ */ r(
                "svg",
                {
                  className: `meso-process-trace__chevron${u.open ? " meso-process-trace__chevron--open" : ""}`,
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
              /* @__PURE__ */ r("span", { className: "meso-process-trace__summary", children: k }),
              t && /* @__PURE__ */ r("span", { className: "meso-process-trace__dot", "aria-label": "执行中" })
            ]
          }
        ),
        u.open && /* @__PURE__ */ l("div", { className: "meso-process-trace__body", children: [
          g.length > 0 && /* @__PURE__ */ r(Se, { compact: !0, stages: g }),
          e.memorySnippets.length > 0 && /* @__PURE__ */ r("div", { className: "meso-memory-chips", children: e.memorySnippets.map((d, p) => /* @__PURE__ */ l("span", { className: "meso-memory-chip", title: d.content, children: [
            "[",
            d.category,
            "] ",
            d.content
          ] }, p)) }),
          e.thinkContent && /* @__PURE__ */ r(
            oe,
            {
              content: e.thinkContent,
              streaming: t && !e.thinkDone,
              collapseWhen: "never",
              defaultOpen: !0,
              turnStreaming: s
            }
          ),
          e.phaseOrder.length > 0 && /* @__PURE__ */ r("div", { className: "meso-process-trace__phases", children: e.phaseOrder.map((d) => {
            const p = e.phases[d];
            if (!p) return null;
            const w = h == null ? void 0 : h(p);
            return w != null ? /* @__PURE__ */ r("div", { children: w }, d) : /* @__PURE__ */ r("div", { children: ze(p, t) }, d);
          }) }),
          e.resourceReadOrder.length > 0 && /* @__PURE__ */ r("div", { className: "meso-process-trace__resources", children: e.resourceReadOrder.map((d) => {
            const p = e.resourceReads[d];
            return p ? /* @__PURE__ */ r(He, { resourceRead: p }, d) : null;
          }) }),
          v.length > 0 && /* @__PURE__ */ r("div", { className: "meso-process-trace__tools", children: v.map((d) => /* @__PURE__ */ l(
            "div",
            {
              className: `meso-process-trace__tool-group${d.groupId ? " meso-process-trace__tool-group--grouped" : ""}`,
              "data-group-id": d.groupId,
              "data-group-kind": d.groupKind,
              children: [
                d.groupId && /* @__PURE__ */ l("div", { className: "meso-process-trace__tool-group-label", children: [
                  d.groupKind ?? "group",
                  ": ",
                  d.groupId
                ] }),
                d.ids.map((p) => {
                  const w = e.toolCalls[p];
                  if (!w) return null;
                  const S = m == null ? void 0 : m(w);
                  return S != null ? /* @__PURE__ */ r("div", { children: S }, p) : /* @__PURE__ */ r(
                    ce,
                    {
                      toolCall: w,
                      onConfirm: c,
                      onCancel: i,
                      simplify: o
                    },
                    p
                  );
                })
              ]
            },
            d.key
          )) }),
          N.length > 0 && ((_ == null ? void 0 : _(e)) ?? /* @__PURE__ */ r(Re, { runs: N }))
        ] })
      ]
    }
  );
}
function ae(e) {
  return e === "html" || e === "html preview" ? { type: "html" } : e === "mermaid" ? { type: "mermaid" } : e === "markdown" ? { type: "markdown" } : e === "table" ? { type: "table" } : { type: "code", language: e };
}
function tr({
  messages: e,
  streaming: t,
  onArtifactCopy: s,
  onArtifactDownload: a,
  onToolConfirm: n,
  onToolCancel: c,
  emptyState: i,
  emptyStateAlign: m = "center",
  className: h,
  renderExtension: _,
  renderLiveTrace: o,
  renderMarkdown: u,
  renderMermaid: f,
  highlightCode: k,
  hiddenArtifactLangs: N
}) {
  const v = T(null);
  O(() => {
    var d;
    (d = v.current) == null || d.scrollIntoView({ behavior: "smooth" });
  }, [e, t]);
  const g = e.length > 0 || t && t.status !== "idle";
  return /* @__PURE__ */ r("div", { className: `meso-message-list${h ? ` ${h}` : ""}`, children: /* @__PURE__ */ l("div", { className: "meso-message-list__inner", children: [
    !g && i && /* @__PURE__ */ r("div", { className: `meso-message-list__empty${m === "top" ? " meso-message-list__empty--top" : ""}`, children: i }),
    e.map((d) => /* @__PURE__ */ l(z.Fragment, { children: [
      /* @__PURE__ */ r(
        re,
        {
          role: d.role,
          content: d.content,
          timestamp: d.timestamp,
          markdown: d.role === "assistant",
          renderMarkdown: u
        }
      ),
      d.artifacts && d.artifacts.length > 0 && d.artifacts.map((p) => {
        const { type: w, language: S } = ae(p.lang);
        return /* @__PURE__ */ r(
          se,
          {
            type: w,
            content: p.content,
            language: S,
            onCopy: s,
            onDownload: a,
            renderMermaid: f,
            highlightCode: k,
            renderMarkdown: u
          },
          p.id
        );
      })
    ] }, d.id)),
    t && t.status !== "idle" && /* @__PURE__ */ r("div", { className: "meso-message-list__live", children: o ? o(t) : /* @__PURE__ */ l(B, { children: [
      (t.activeSoul || t.activeSkill) && /* @__PURE__ */ l("div", { className: "meso-message-list__context-row", children: [
        t.activeSoul && /* @__PURE__ */ r(Oe, { soul: t.activeSoul }),
        t.activeSkill && /* @__PURE__ */ r(Ae, { skill: t.activeSkill })
      ] }),
      /* @__PURE__ */ r(
        Ve,
        {
          stream: t,
          streaming: t.status === "streaming",
          turnStreaming: t.status === "streaming",
          onToolConfirm: n,
          onToolCancel: c
        }
      ),
      _ && t.extensionLog.length > 0 && /* @__PURE__ */ r("div", { className: "meso-message-list__extensions", children: t.extensionLog.map((d, p) => /* @__PURE__ */ r(z.Fragment, { children: _(d) }, p)) }),
      (t.textContent || t.status === "streaming") && /* @__PURE__ */ r(
        re,
        {
          role: "assistant",
          content: t.textContent,
          streaming: t.status === "streaming" && t.artifactOrder.length === 0,
          markdown: !0,
          renderMarkdown: u
        }
      ),
      t.artifactOrder.map((d) => {
        const p = t.artifacts[d];
        if (!p || N != null && N.includes(p.lang)) return null;
        const { type: w, language: S } = ae(p.lang);
        return /* @__PURE__ */ r(
          se,
          {
            type: w,
            content: p.content,
            language: S,
            streaming: !p.done,
            onCopy: s,
            onDownload: a,
            renderMermaid: f,
            highlightCode: k,
            renderMarkdown: u
          },
          d
        );
      }),
      t.memorySaved.length > 0 && /* @__PURE__ */ r("div", { className: "meso-memory-saved", children: t.memorySaved.map((d) => /* @__PURE__ */ l("span", { className: "meso-memory-saved__chip", title: d.preview, children: [
        /* @__PURE__ */ r("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ r("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        d.category,
        "]"
      ] }, d.id)) })
    ] }) }),
    /* @__PURE__ */ r("div", { ref: v })
  ] }) });
}
function ar({
  value: e,
  onChange: t,
  onSubmit: s,
  onStop: a,
  streaming: n = !1,
  disabled: c = !1,
  placeholder: i = "输入消息… (Ctrl+Enter 发送，Enter 换行)",
  leadingSlot: m,
  trailingActions: h,
  maxRows: _ = 8
}) {
  const o = T(null), u = 22, f = () => {
    const g = o.current;
    g && (g.style.height = "auto", g.style.height = Math.min(g.scrollHeight, u * _) + "px");
  };
  O(f, [e]);
  const k = (g) => {
    g.key === "Enter" && (g.ctrlKey || g.metaKey) && (g.preventDefault(), !c && !n && e.trim() && s());
  }, N = !c && !n && e.trim().length > 0, v = /* @__PURE__ */ r(
    "button",
    {
      className: `meso-composer__send${n ? " meso-composer__send--stop" : ""}`,
      onClick: n ? a : s,
      disabled: n ? !1 : !N,
      "aria-label": n ? "停止生成" : "发送",
      title: n ? "停止生成" : "Ctrl+Enter",
      children: n ? (
        /* Stop square */
        /* @__PURE__ */ r("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ r("rect", { x: "4", y: "4", width: "16", height: "16", rx: "2" }) })
      ) : (
        /* Send arrow */
        /* @__PURE__ */ l("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ r("line", { x1: "12", y1: "19", x2: "12", y2: "5" }),
          /* @__PURE__ */ r("polyline", { points: "5,12 12,5 19,12" })
        ] })
      )
    }
  );
  return /* @__PURE__ */ r("div", { className: "meso-composer", children: /* @__PURE__ */ l("div", { className: "meso-composer__box", children: [
    /* @__PURE__ */ r(
      "textarea",
      {
        ref: o,
        className: "meso-composer__textarea",
        value: e,
        onChange: (g) => {
          t(g.target.value), f();
        },
        onKeyDown: k,
        placeholder: i,
        rows: 1,
        disabled: c && !n,
        "aria-label": "消息输入框"
      }
    ),
    /* @__PURE__ */ l("div", { className: "meso-composer__toolbar", children: [
      /* @__PURE__ */ r("div", { className: "meso-composer__leading", children: m }),
      /* @__PURE__ */ r("span", { className: "meso-composer__hint", children: e.length > 0 && `${e.length} 字` }),
      /* @__PURE__ */ r("div", { className: "meso-composer__trailing", children: h ?? v })
    ] })
  ] }) });
}
function nr({
  stream: e,
  defaultExpanded: t = "none",
  onlyShowCurrent: s = !1,
  simplify: a,
  onToolClick: n,
  onToolConfirm: c,
  onToolCancel: i,
  renderSummary: m
}) {
  const h = e.toolCallOrder, _ = s && h.length > 0 ? [h[h.length - 1]] : h, [o, u] = C(() => t === "none" ? /* @__PURE__ */ new Set() : t === "all" ? new Set(_) : t === "current" && _.length > 0 ? /* @__PURE__ */ new Set([_[_.length - 1]]) : /* @__PURE__ */ new Set()), f = (N) => {
    const v = new Set(o);
    v.has(N) ? v.delete(N) : v.add(N), u(v), n == null || n(N);
  }, k = (N, v) => {
    var y;
    const { call: g, result: d, status: p } = N;
    if (m)
      return String(m(N, v) ?? "");
    const w = p === "error" ? "✗" : "✓", S = g.name, E = (y = d == null ? void 0 : d.metadata) != null && y.resultCount ? ` — ${d.metadata.resultCount} 项` : "", L = d != null && d.duration_ms ? ` (${d.duration_ms}ms)` : "";
    return `${w} ${S}${E}${L}`;
  };
  return _.length === 0 ? null : /* @__PURE__ */ r("div", { className: "meso-collapsible-tool-trace", children: _.map((N, v) => {
    const g = e.toolCalls[N];
    if (!g) return null;
    const d = o.has(N), { status: p } = g;
    return /* @__PURE__ */ l("div", { className: `meso-collapsible-tool__item meso-collapsible-tool__item--${p}`, children: [
      /* @__PURE__ */ l(
        "button",
        {
          className: "meso-collapsible-tool__summary",
          onClick: () => f(N),
          "aria-expanded": d,
          children: [
            /* @__PURE__ */ r("span", { className: "meso-collapsible-tool__toggle", children: d ? "▼" : "▶" }),
            /* @__PURE__ */ r("span", { className: "meso-collapsible-tool__text", children: k(g, v) })
          ]
        }
      ),
      d && /* @__PURE__ */ r("div", { className: "meso-collapsible-tool__details", children: /* @__PURE__ */ r(
        ce,
        {
          toolCall: g,
          onConfirm: c,
          onCancel: i,
          simplify: a
        }
      ) })
    ] }, N);
  }) });
}
function or({
  name: e,
  email: t,
  avatarText: s,
  menuItems: a = [],
  onSignOut: n
}) {
  const [c, i] = C(!1), m = T(null);
  O(() => {
    if (!c) return;
    const o = (u) => {
      m.current && !m.current.contains(u.target) && i(!1);
    };
    return document.addEventListener("mousedown", o), () => document.removeEventListener("mousedown", o);
  }, [c]);
  const h = s ?? e.charAt(0).toUpperCase(), _ = [
    ...a,
    ...n ? [{ label: "退出登录", onClick: () => {
      i(!1), n();
    }, danger: !0 }] : []
  ];
  return /* @__PURE__ */ l("div", { className: "meso-user-menu", ref: m, children: [
    c && /* @__PURE__ */ l("div", { className: "meso-user-menu__popup", role: "menu", children: [
      /* @__PURE__ */ l("div", { className: "meso-user-menu__identity", children: [
        /* @__PURE__ */ r("span", { className: "meso-user-menu__identity-name", children: e }),
        t && /* @__PURE__ */ r("span", { className: "meso-user-menu__identity-email", children: t })
      ] }),
      _.length > 0 && /* @__PURE__ */ r("div", { className: "meso-user-menu__sep", role: "separator" }),
      _.map((o, u) => /* @__PURE__ */ l(
        "button",
        {
          className: `meso-user-menu__item${o.danger ? " meso-user-menu__item--danger" : ""}`,
          role: "menuitem",
          onClick: () => {
            i(!1), o.onClick();
          },
          children: [
            o.icon && /* @__PURE__ */ r("span", { className: "meso-user-menu__item-icon", children: o.icon }),
            o.label
          ]
        },
        u
      ))
    ] }),
    /* @__PURE__ */ l(
      "button",
      {
        className: "meso-user-menu__trigger",
        onClick: () => i((o) => !o),
        "aria-haspopup": "menu",
        "aria-expanded": c,
        title: e,
        children: [
          /* @__PURE__ */ r("div", { className: "meso-user-menu__avatar", children: h }),
          /* @__PURE__ */ l("div", { className: "meso-user-menu__info", children: [
            /* @__PURE__ */ r("span", { className: "meso-user-menu__name", children: e }),
            t && /* @__PURE__ */ r("span", { className: "meso-user-menu__email", children: t })
          ] })
        ]
      }
    )
  ] });
}
function lr({
  tabs: e,
  activeTabId: t,
  onTabChange: s,
  autoSelectFirstReady: a = !1
}) {
  var u;
  const n = t !== void 0, [c, i] = C(((u = e[0]) == null ? void 0 : u.id) ?? ""), m = n ? t : c, h = T(!1);
  O(() => {
    if (!a || h.current) return;
    const f = e.find((k) => k.ready);
    f && (h.current = !0, n || i(f.id), s == null || s(f.id));
  }, [e, a, n, s]);
  const _ = (f) => {
    n || i(f), s == null || s(f);
  }, o = e.find((f) => f.id === m) ?? e[0];
  return e.length === 0 ? null : /* @__PURE__ */ l("div", { className: "meso-artifact-shell", children: [
    /* @__PURE__ */ r("div", { className: "meso-artifact-shell__tabs", role: "tablist", children: e.map((f) => /* @__PURE__ */ l(
      "button",
      {
        role: "tab",
        "aria-selected": f.id === m,
        className: `meso-artifact-shell__tab${f.id === m ? " meso-artifact-shell__tab--active" : ""}`,
        onClick: () => _(f.id),
        children: [
          f.label,
          f.ready === !1 && /* @__PURE__ */ r("span", { className: "meso-artifact-shell__tab-dot", "aria-label": "加载中" })
        ]
      },
      f.id
    )) }),
    /* @__PURE__ */ r("div", { className: "meso-artifact-shell__content", role: "tabpanel", children: o == null ? void 0 : o.content })
  ] });
}
function ir({ status: e, primary: t, outcome: s, detail: a, className: n, "data-testid": c }) {
  const i = a !== void 0 && a !== "", m = de({ system: !1 });
  return /* @__PURE__ */ l("div", { className: `meso-log-line${n ? ` ${n}` : ""}`, "data-testid": c ?? "meso-log-line", children: [
    /* @__PURE__ */ l(
      "div",
      {
        className: `meso-log-line__row${i ? " meso-log-line__row--clickable" : ""}`,
        onClick: i ? m.toggle : void 0,
        role: i ? "button" : void 0,
        tabIndex: i ? 0 : void 0,
        onKeyDown: i ? (h) => {
          (h.key === "Enter" || h.key === " ") && m.toggle();
        } : void 0,
        "aria-expanded": i ? m.open : void 0,
        "aria-label": i ? `${t}，${m.open ? "折叠" : "展开"}详情` : void 0,
        children: [
          /* @__PURE__ */ r(A, { status: e, size: 14, className: "meso-log-line__icon" }),
          /* @__PURE__ */ r("span", { className: "meso-log-line__primary", children: t }),
          s && /* @__PURE__ */ r("span", { className: "meso-log-line__outcome", children: s }),
          i && /* @__PURE__ */ r(
            "svg",
            {
              className: `meso-log-line__chevron${m.open ? " meso-log-line__chevron--open" : ""}`,
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
    i && m.open && /* @__PURE__ */ r("pre", { className: "meso-log-line__detail", children: a })
  ] });
}
const Ge = /* @__PURE__ */ new Set(["text", "think"]);
function Fe(e, t, s) {
  var a, n, c, i, m, h, _, o, u, f, k, N, v, g, d, p;
  if (s)
    switch (e.type) {
      case "capabilities":
        (a = s.onCapabilities) == null || a.call(s, e.payload);
        break;
      case "phase":
        (n = s.onPhaseChange) == null || n.call(s, e.payload);
        break;
      case "memory":
        (c = s.onMemoryRecalled) == null || c.call(s, e.payload.snippets);
        break;
      case "memory_saved":
        (i = s.onMemorySaved) == null || i.call(s, e.payload);
        break;
      case "soul":
        (m = s.onSoulActivated) == null || m.call(s, e.payload);
        break;
      case "skill_active":
        (h = s.onSkillActivated) == null || h.call(s, e.payload);
        break;
      case "tool_call":
        (_ = s.onToolCall) == null || _.call(s, e.payload);
        break;
      case "tool_result":
        (o = s.onToolResult) == null || o.call(s, e.payload);
        break;
      case "resource_read":
        (u = s.onResourceRead) == null || u.call(s, e.payload);
        break;
      case "resource_content":
        (f = s.onResourceContent) == null || f.call(s, e.payload);
        break;
      case "text":
        (k = s.onText) == null || k.call(s, e.payload.delta, t);
        break;
      case "think":
        (N = s.onThink) == null || N.call(s, e.payload.delta, t);
        break;
      case "artifact": {
        const w = t.artifacts[e.payload.id];
        w && ((v = s.onArtifact) == null || v.call(s, w));
        break;
      }
      case "extension":
        (g = s.onExtensionEvent) == null || g.call(s, e);
        break;
      case "error":
        (d = s.onError) == null || d.call(s, e.payload.message, e.payload.code);
        break;
      case "done":
        (p = s.onDone) == null || p.call(s, t);
        break;
    }
}
function cr(e, t) {
  const [s, a] = C(U), n = T(null), c = T(!1), i = T(t);
  i.current = t;
  const m = W(() => {
    var o;
    (o = n.current) == null || o.abort(), c.current = !1, a((u) => ({ ...u, status: "idle" }));
  }, []), h = W(() => {
    var o;
    (o = n.current) == null || o.abort(), c.current = !1, a(U());
  }, []), _ = W(async (o) => {
    var d, p, w, S, E, L;
    if (c.current) return;
    c.current = !0;
    const u = typeof (o == null ? void 0 : o.reconnect) == "object" ? o.reconnect : { maxAttempts: 3, baseDelayMs: 1e3 }, f = o != null && o.reconnect ? u.maxAttempts ?? 3 : 0, k = u.baseDelayMs ?? 1e3, N = (o == null ? void 0 : o.batchMs) === void 0 ? 16 : o.batchMs;
    let v = 0;
    const g = async () => {
      var Z;
      (Z = n.current) == null || Z.abort();
      const y = new AbortController();
      n.current = y;
      const b = { ...U(), status: "streaming" };
      a(b);
      let R = b;
      const G = (o == null ? void 0 : o.method) ?? (o != null && o.body ? "POST" : "GET"), j = (o == null ? void 0 : o.watchdogMs) === void 0 ? 12e4 : o.watchdogMs;
      let P = null;
      const H = () => {
        P && clearTimeout(P);
      }, F = () => {
        H(), j != null && (P = setTimeout(() => {
          var $, D;
          y.abort();
          const x = `SSE stream timed out after ${j}ms of inactivity`;
          a((M) => ({ ...M, status: "error", errorMessage: x, errorCode: "WATCHDOG_TIMEOUT" })), (D = ($ = i.current) == null ? void 0 : $.onError) == null || D.call($, x, "WATCHDOG_TIMEOUT");
        }, j));
      }, K = [];
      let I = null;
      const J = (x) => {
        const $ = we(R, x);
        if (R = $, a($), Fe(x, $, i.current), x.type === "done" || x.type === "error")
          return H(), x.type;
      }, Y = () => {
        for (; K.length > 0; ) {
          const x = K.shift(), $ = J(x);
          if ($) return $;
        }
      }, he = (x) => {
        if (N != null && Ge.has(x.type)) {
          K.push(x), I || (I = setTimeout(() => {
            I = null, Y();
          }, N));
          return;
        }
        return J(x);
      };
      try {
        const x = await fetch(e, {
          method: G,
          headers: {
            ...G === "POST" ? { "Content-Type": "application/json" } : {},
            ...o == null ? void 0 : o.headers
          },
          body: o != null && o.body ? JSON.stringify(o.body) : void 0,
          signal: y.signal
        });
        if (!x.ok) throw new Error(`HTTP ${x.status}`);
        const $ = x.body.getReader(), D = new TextDecoder();
        let M = "";
        for (F(); ; ) {
          const { done: _e, value: fe } = await $.read();
          if (_e) break;
          F(), M += D.decode(fe, { stream: !0 });
          const Q = M.split(`
`);
          M = Q.pop() ?? "";
          for (const pe of Q) {
            const X = Ne(pe);
            if (!X) continue;
            const ee = he(X);
            if (ee) return ee;
          }
        }
        I && (clearTimeout(I), I = null);
        const q = Y();
        return q || "interrupted";
      } catch (x) {
        if (x.name === "AbortError") return "interrupted";
        throw x;
      } finally {
        H(), I && clearTimeout(I);
      }
    };
    try {
      for (; ; ) {
        try {
          const y = await g();
          if (y === "done" || y === "error") return;
          if (!(o != null && o.reconnect) || v >= f) {
            const b = "SSE stream ended unexpectedly";
            a((R) => ({ ...R, status: "error", errorMessage: b, errorCode: "STREAM_ENDED" })), (p = (d = i.current) == null ? void 0 : d.onError) == null || p.call(d, b, "STREAM_ENDED");
            return;
          }
        } catch (y) {
          if (!(o != null && o.reconnect) || v >= f) {
            const b = y.message;
            a((R) => ({ ...R, status: "error", errorMessage: b })), (S = (w = i.current) == null ? void 0 : w.onError) == null || S.call(w, b);
            return;
          }
        }
        v += 1, (L = (E = i.current) == null ? void 0 : E.onReconnect) == null || L.call(E, v), await new Promise((y) => setTimeout(y, k * Math.pow(2, v - 1)));
      }
    } finally {
      c.current = !1;
    }
  }, [e]);
  return { state: s, start: _, abort: m, reset: h };
}
const me = "meso-theme";
function Je() {
  return typeof window > "u" ? "light" : localStorage.getItem(me) ?? "light";
}
function Ye(e) {
  document.documentElement.setAttribute("data-theme", e), localStorage.setItem(me, e);
}
function dr() {
  const [e, t] = C(Je);
  O(() => {
    Ye(e);
  }, [e]);
  const s = W(() => {
    t((a) => a === "light" ? "dark" : "light");
  }, []);
  return { theme: e, toggle: s };
}
const ue = {
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
}, Ze = {
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
}, qe = {
  "zh-CN": ue,
  "en-US": Ze
}, V = ge({
  locale: "zh-CN",
  labels: ue
});
function mr({
  locale: e = "zh-CN",
  labels: t,
  children: s
}) {
  const a = { ...qe[e], ...t };
  return /* @__PURE__ */ r(V.Provider, { value: { locale: e, labels: a }, children: s });
}
function ur() {
  return ne(V).labels;
}
function hr() {
  return ne(V);
}
export {
  lr as ArtifactPaneShell,
  se as ArtifactPanel,
  re as ChatBubble,
  ar as ChatComposer,
  nr as CollapsibleToolTrace,
  Be as ConfirmGate,
  ir as LogLine,
  mr as MesoLocaleProvider,
  tr as MessageList,
  pr as PROTOCOL_VERSION,
  Ve as ProcessTrace,
  He as ResourceReadBlock,
  or as SidebarUserMenu,
  Ae as SkillIndicator,
  Oe as SoulIndicator,
  Se as StageTimeline,
  A as StatusIcon,
  sr as StreamingCursor,
  oe as ThinkBlock,
  rr as ThreeColumnLayout,
  ce as ToolCallBlock,
  Re as WorkflowTimeline,
  we as applyEvent,
  gr as assertCompatibleVersion,
  U as createInitialStreamState,
  vr as createStreamStateWithArtifacts,
  qe as defaultLabelsByLocale,
  Ze as enUSLabels,
  Nr as isCompatibleVersion,
  Ne as parseSSELine,
  ve as phaseRecordToStage,
  wr as streamStateHasArtifacts,
  de as useFoldState,
  ur as useMesoLabels,
  hr as useMesoLocale,
  cr as useSSEStream,
  dr as useTheme,
  ue as zhCNLabels
};
