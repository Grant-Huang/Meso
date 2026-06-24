import { jsxs as o, jsx as r, Fragment as M } from "react/jsx-runtime";
import U, { useState as C, useRef as T, useEffect as R, useMemo as ve, useCallback as W, createContext as Ne, useContext as oe } from "react";
import { phaseRecordToStage as we, createInitialStreamState as K, parseSSELine as ke, applyEvent as ye } from "./runtime.js";
import { PROTOCOL_VERSION as Nr, assertCompatibleVersion as wr, createStreamStateWithArtifacts as kr, isCompatibleVersion as yr, streamStateHasArtifacts as br } from "./runtime.js";
function nr({
  navItems: e = [],
  sidebarFooter: t,
  sessionColumn: s,
  children: n,
  defaultCollapsed: a = !1,
  appName: c = "Meso",
  sidebarLogo: i,
  sidebarTitle: m,
  mainHeader: h,
  artifactPanel: _,
  defaultArtifactVisible: l = !1,
  onArtifactToggle: u,
  artifactVisible: f,
  showArtifactToggle: k = !0,
  showSessionColumn: N = !0,
  contentMaxWidth: v,
  artifactPanelWidth: g,
  onCollapsedChange: d
}) {
  const [p, w] = C(a), [S, E] = C(l), L = f !== void 0 ? f : S, y = () => {
    const b = !L;
    f === void 0 && E(b), u == null || u(b);
  };
  return /* @__PURE__ */ o("div", { className: "meso-layout", children: [
    /* @__PURE__ */ o("aside", { className: `meso-sidebar${p ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ o("div", { className: "meso-sidebar__header", children: [
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
            children: /* @__PURE__ */ o("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ r("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ r("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ r("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ r("nav", { className: "meso-sidebar__nav", children: e.map((b) => /* @__PURE__ */ o(
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
    /* @__PURE__ */ o("main", { className: "meso-main", children: [
      /* @__PURE__ */ o("div", { className: "meso-main__header", children: [
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
              /* @__PURE__ */ o("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ r("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                /* @__PURE__ */ r("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
              ] })
            ) : (
              /* Panel / artifact icon */
              /* @__PURE__ */ o("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ r("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                /* @__PURE__ */ r("line", { x1: "14", y1: "3", x2: "14", y2: "21" })
              ] })
            )
          }
        )
      ] }),
      /* @__PURE__ */ o("div", { className: "meso-main__content", children: [
        /* @__PURE__ */ r("div", { className: "meso-main__chat", style: v ? { maxWidth: v, margin: "0 auto", width: "100%" } : void 0, children: n }),
        L && /* @__PURE__ */ o(M, { children: [
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
  timestamp: n,
  markdown: a = !1,
  renderMarkdown: c
}) {
  const i = a && typeof c == "function";
  return /* @__PURE__ */ o("div", { className: `meso-bubble meso-bubble--${e}`, children: [
    e === "assistant" && /* @__PURE__ */ r("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ o("div", { className: "meso-bubble__body", children: [
      i ? /* @__PURE__ */ r(
        "div",
        {
          className: "meso-bubble__content meso-bubble__md",
          dangerouslySetInnerHTML: { __html: c(t) }
        }
      ) : /* @__PURE__ */ o("div", { className: "meso-bubble__content", children: [
        t.split(`
`).map((m, h) => /* @__PURE__ */ o(U.Fragment, { children: [
          h > 0 && /* @__PURE__ */ r("br", {}),
          m
        ] }, h)),
        s && /* @__PURE__ */ r("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      n && /* @__PURE__ */ r("div", { className: "meso-bubble__timestamp", children: n })
    ] })
  ] });
}
function le({
  content: e,
  pinnedContent: t,
  streaming: s = !1,
  turnStreaming: n,
  autoCollapseDelay: a = 1500,
  defaultOpen: c = !0,
  open: i,
  onOpenChange: m,
  collapseWhen: h = "streamEnd",
  summary: _ = "已思考"
}) {
  const l = i !== void 0, [u, f] = C(c), [k, N] = C(null), v = T(null);
  v.current = k;
  const g = l ? i : k !== null ? k : u, d = T(s), p = T(n), w = () => {
    const L = !g;
    l || N(L), m == null || m(L);
  };
  return R(() => {
    if (h !== "never" && a !== null) {
      if (d.current && !s) {
        const L = setTimeout(() => {
          l || f(!1), v.current === null && (m == null || m(!1));
        }, a);
        return () => clearTimeout(L);
      }
      d.current = s;
    }
  }, [s, a, h, l, m]), R(() => {
    n !== void 0 && (p.current && !n && N(null), p.current = n);
  }, [n]), /* @__PURE__ */ o("div", { className: `meso-think${g ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ o(
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
    /* @__PURE__ */ r("div", { className: "meso-think__body", children: /* @__PURE__ */ o("div", { className: "meso-think__content", children: [
      !s && t !== void 0 ? t : e,
      s && /* @__PURE__ */ r("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function ar({ active: e = !0 }) {
  return e ? /* @__PURE__ */ r("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function be(e) {
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
  streaming: n = !1,
  onCopy: a,
  onDownload: c,
  renderMermaid: i,
  highlightCode: m,
  renderMarkdown: h
}) {
  const [_, l] = C(!1), [u, f] = C(e), [k, N] = C(null), [v, g] = C(!1), [d, p] = C(null), w = T("");
  R(() => {
    f(e);
  }, [e]), R(() => {
    e !== "mermaid" || n || !i || t === w.current || (w.current = t, N(null), g(!1), i(t).then((y) => N(y)).catch(() => g(!0)));
  }, [e, n, t, i]), R(() => {
    e !== "code" || n || !m || t === w.current && d || (w.current = t, p(m(t, s)));
  }, [e, n, t, s, m, d]);
  const S = () => {
    navigator.clipboard.writeText(t).catch(() => {
    }), l(!0), setTimeout(() => l(!1), 2e3), a == null || a(t);
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
    }, b = new Blob([t], { type: "text/plain" }), O = document.createElement("a");
    O.href = URL.createObjectURL(b), O.download = `artifact.${y[e]}`, O.click(), URL.revokeObjectURL(O.href);
  };
  return /* @__PURE__ */ o("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ o("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ r("div", { className: "meso-artifact__tabs", children: (e === "html" ? ["html", "code"] : [e]).map((y) => /* @__PURE__ */ r(
        "span",
        {
          className: `meso-artifact__tab${u === y ? " meso-artifact__tab--active" : ""}`,
          onClick: () => f(y),
          children: Ce(y, s)
        },
        y
      )) }),
      n && /* @__PURE__ */ r("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ r("button", { className: "meso-artifact__download-btn", onClick: E, title: "下载", "aria-label": "下载文件", children: /* @__PURE__ */ r("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) }) }),
      /* @__PURE__ */ r("button", { className: "meso-artifact__copy-btn", onClick: S, title: "复制", "aria-label": "复制代码", children: _ ? /* @__PURE__ */ r("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ o("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ r("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
        /* @__PURE__ */ r("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
      ] }) })
    ] }),
    /* @__PURE__ */ o("div", { className: "meso-artifact__body", children: [
      u === "html" && /* @__PURE__ */ r("iframe", { className: "meso-artifact__preview", srcDoc: t, sandbox: "allow-scripts", title: "HTML 预览" }),
      u === "mermaid" && /* @__PURE__ */ o(M, { children: [
        n && /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
          /* @__PURE__ */ r("code", { children: t }),
          /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
        ] }),
        !n && k && /* @__PURE__ */ r(
          "div",
          {
            className: "meso-artifact__mermaid",
            dangerouslySetInnerHTML: { __html: k }
          }
        ),
        !n && !k && !v && !i && /* @__PURE__ */ o("div", { className: "meso-artifact__mermaid-placeholder", children: [
          /* @__PURE__ */ r("span", { children: "图表预览需要集成 Mermaid 渲染器" }),
          /* @__PURE__ */ r("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ r("code", { children: t }) })
        ] }),
        !n && v && /* @__PURE__ */ o("div", { className: "meso-artifact__mermaid-placeholder meso-artifact__mermaid-placeholder--error", children: [
          /* @__PURE__ */ r("span", { children: "图表渲染失败，请检查语法" }),
          /* @__PURE__ */ r("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ r("code", { children: t }) })
        ] }),
        !n && !k && !v && i && /* @__PURE__ */ r("div", { className: "meso-artifact__mermaid-placeholder", children: /* @__PURE__ */ r("span", { children: "渲染中…" }) })
      ] }),
      u === "markdown" && /* @__PURE__ */ r(M, { children: h ? /* @__PURE__ */ r(
        "div",
        {
          className: "meso-artifact__markdown",
          dangerouslySetInnerHTML: { __html: h(t) }
        }
      ) : /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
        /* @__PURE__ */ r("code", { children: t }),
        n && /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] }) }),
      u === "table" && /* @__PURE__ */ r(xe, { content: t, streaming: n }),
      (u === "code" || u === "html" && !1) && /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
        d && !n ? /* @__PURE__ */ r("code", { dangerouslySetInnerHTML: { __html: d } }) : /* @__PURE__ */ r("code", { children: t }),
        n && /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] })
    ] })
  ] });
}
function xe({ content: e, streaming: t }) {
  const s = be(e);
  return s ? /* @__PURE__ */ r("div", { className: "meso-artifact__table-wrap", children: /* @__PURE__ */ o("table", { className: "meso-artifact__table", children: [
    /* @__PURE__ */ r("thead", { children: /* @__PURE__ */ r("tr", { children: s.headers.map((n, a) => /* @__PURE__ */ r("th", { children: n }, a)) }) }),
    /* @__PURE__ */ r("tbody", { children: s.rows.map((n, a) => /* @__PURE__ */ r("tr", { children: n.map((c, i) => /* @__PURE__ */ r("td", { children: String(c) }, i)) }, a)) })
  ] }) }) : /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
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
function A({
  status: e,
  size: t = 16,
  className: s,
  "aria-label": n
}) {
  const a = n ?? Se[e];
  return /* @__PURE__ */ o(
    "span",
    {
      className: `meso-status-icon meso-status-icon--${e}${s ? ` ${s}` : ""}`,
      style: { width: t, height: t },
      role: "img",
      "aria-label": a,
      children: [
        e === "running" && /* @__PURE__ */ o("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeDasharray: "3 3", className: "meso-status-icon__spin" }),
          /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "2.5", fill: "currentColor", className: "meso-status-icon__pulse" })
        ] }),
        e === "done" && /* @__PURE__ */ o("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ r("polyline", { points: "4.5,8 7,10.5 11.5,5.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
        ] }),
        e === "error" && /* @__PURE__ */ o("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ r("line", { x1: "5.5", y1: "5.5", x2: "10.5", y2: "10.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" }),
          /* @__PURE__ */ r("line", { x1: "10.5", y1: "5.5", x2: "5.5", y2: "10.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" })
        ] }),
        e === "pending" && /* @__PURE__ */ r("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ r("circle", { cx: "8", cy: "8", r: "6.25", stroke: "currentColor", strokeWidth: "1.5" }) }),
        e === "warning" && /* @__PURE__ */ o("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
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
  return e.length === 0 ? null : /* @__PURE__ */ r("div", { className: `meso-stages${t ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: e.map((s, n) => /* @__PURE__ */ o(
    "div",
    {
      className: `meso-stage meso-stage--${s.status}`,
      children: [
        /* @__PURE__ */ r("div", { className: "meso-stage__dot", children: /* @__PURE__ */ r(A, { status: Le(s.status), size: 10 }) }),
        n < e.length - 1 && /* @__PURE__ */ r("div", { className: `meso-stage__line${s.status === "done" ? " meso-stage__line--done" : ""}` }),
        /* @__PURE__ */ r("span", { className: `meso-stage__label${t ? " meso-stage__label--compact" : ""}`, children: s.label })
      ]
    },
    s.id
  )) });
}
function Te(e) {
  const { nodes: t, nodeOrder: s } = e, n = /* @__PURE__ */ new Map();
  for (const m of s) {
    const h = t[m];
    if (!h) continue;
    const _ = h.parent_id ?? null;
    n.has(_) || n.set(_, []), n.get(_).push(m);
  }
  const a = /* @__PURE__ */ new Map();
  for (const [, m] of n)
    if (m.length > 1)
      for (const h of m) a.set(h, m);
  const c = [], i = /* @__PURE__ */ new Set();
  for (const m of s) {
    if (i.has(m)) continue;
    const h = t[m];
    if (!h) continue;
    const _ = a.get(m);
    if (_) {
      const l = _.map((u) => t[u]).filter((u) => !!u);
      for (const u of l) i.add(u.node_id);
      c.push({ kind: "parallel", nodes: l, isLast: !1 });
    } else
      i.add(m), c.push({ kind: "node", node: h, isLast: !1 });
  }
  return c.length > 0 && (c[c.length - 1] = { ...c[c.length - 1], isLast: !0 }), c;
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
function ie({ state: e }) {
  return /* @__PURE__ */ r(
    A,
    {
      status: Ee(e),
      size: 12,
      className: `meso-wf-node__icon meso-wf-node__icon--${e}`
    }
  );
}
function ce(e) {
  return e < 1e3 ? `${e}ms` : `${(e / 1e3).toFixed(1)}s`;
}
function Oe({ node: e, isLast: t }) {
  var c;
  const [s, n] = C(!1), a = e.metadata && Object.keys(e.metadata).length > 0;
  return /* @__PURE__ */ o("div", { className: `meso-wf-node meso-wf-node--${e.state}`, children: [
    /* @__PURE__ */ o("div", { className: "meso-wf-node__track", children: [
      /* @__PURE__ */ r("div", { className: "meso-wf-node__dot", children: /* @__PURE__ */ r(ie, { state: e.state }) }),
      !t && /* @__PURE__ */ r("div", { className: "meso-wf-node__line" })
    ] }),
    /* @__PURE__ */ o("div", { className: "meso-wf-node__body", children: [
      /* @__PURE__ */ o("div", { className: "meso-wf-node__header", children: [
        /* @__PURE__ */ r("code", { className: "meso-wf-node__name", children: e.name }),
        e.duration_ms !== void 0 && /* @__PURE__ */ r("span", { className: "meso-wf-node__duration", children: ce(e.duration_ms) }),
        a && /* @__PURE__ */ r(
          "button",
          {
            className: "meso-wf-node__expand",
            onClick: () => n((i) => !i),
            "aria-expanded": s,
            "aria-label": s ? "收起详情" : "展开详情",
            children: /* @__PURE__ */ r("svg", { viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", style: { transform: s ? "rotate(180deg)" : void 0 }, children: /* @__PURE__ */ r("polyline", { points: "2,3.5 5,6.5 8,3.5" }) })
          }
        )
      ] }),
      e.state === "error" && !!((c = e.metadata) != null && c.error) && /* @__PURE__ */ r("div", { className: "meso-wf-node__error", children: String(e.metadata.error) }),
      s && a && /* @__PURE__ */ r("pre", { className: "meso-wf-node__meta", children: JSON.stringify(e.metadata, null, 2) })
    ] })
  ] });
}
function Re({ nodes: e, isLast: t }) {
  return /* @__PURE__ */ o("div", { className: "meso-wf-parallel", children: [
    /* @__PURE__ */ r("div", { className: "meso-wf-parallel__row", children: e.map((s, n) => {
      var a;
      return /* @__PURE__ */ o("div", { className: `meso-wf-parallel__branch meso-wf-parallel__branch--${s.state}`, children: [
        /* @__PURE__ */ r("div", { className: "meso-wf-parallel__branch-dot", children: /* @__PURE__ */ r(ie, { state: s.state }) }),
        /* @__PURE__ */ o("div", { className: "meso-wf-parallel__branch-body", children: [
          /* @__PURE__ */ o("div", { className: "meso-wf-parallel__branch-label", children: [
            "并行分支 ",
            String.fromCharCode(65 + n)
          ] }),
          /* @__PURE__ */ r("code", { className: "meso-wf-node__name", children: s.name }),
          s.state === "error" && !!((a = s.metadata) != null && a.error) && /* @__PURE__ */ r("div", { className: "meso-wf-node__error", children: String(s.metadata.error) }),
          s.duration_ms !== void 0 && /* @__PURE__ */ r("span", { className: "meso-wf-node__duration", style: { display: "block", marginTop: 2 }, children: ce(s.duration_ms) })
        ] })
      ] }, s.node_id);
    }) }),
    !t && /* @__PURE__ */ r("div", { className: "meso-wf-parallel__merge" })
  ] });
}
function Ie({ runs: e, showRunId: t = !0, hidden: s }) {
  if (e.length === 0 || s) return null;
  const n = e.length > 1;
  return /* @__PURE__ */ r("div", { className: "meso-wf", role: "status", "aria-label": "工作流进度", children: e.map((a) => {
    const c = Te(a);
    return /* @__PURE__ */ o("div", { className: "meso-wf-run", children: [
      n && t && /* @__PURE__ */ r("div", { className: "meso-wf-run__label", children: a.run_id }),
      c.map(
        (i, m) => i.kind === "parallel" ? /* @__PURE__ */ r(Re, { nodes: i.nodes, isLast: i.isLast }, `parallel-${m}`) : /* @__PURE__ */ r(Oe, { node: i.node, isLast: i.isLast }, i.node.node_id)
      )
    ] }, a.run_id);
  }) });
}
function Me({ soul: e, compact: t = !1 }) {
  const s = e.name.charAt(0);
  return /* @__PURE__ */ o(
    "div",
    {
      className: `meso-soul${t ? " meso-soul--compact" : ""}`,
      title: `${e.name} v${e.version}`,
      role: "status",
      "aria-label": `当前 Soul: ${e.name}`,
      children: [
        /* @__PURE__ */ r("div", { className: "meso-soul__avatar", children: e.avatar ? /* @__PURE__ */ r("img", { src: e.avatar, alt: e.name, className: "meso-soul__img" }) : /* @__PURE__ */ r("span", { className: "meso-soul__initial", children: s }) }),
        !t && /* @__PURE__ */ o(M, { children: [
          /* @__PURE__ */ r("span", { className: "meso-soul__name", children: e.name }),
          e.traits && e.traits.length > 0 && /* @__PURE__ */ r("div", { className: "meso-soul__traits", children: e.traits.map((n) => /* @__PURE__ */ r("span", { className: "meso-soul__trait", children: n }, n)) })
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
  return /* @__PURE__ */ o(
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
        e.focus && e.focus.length > 0 && /* @__PURE__ */ o("span", { className: "meso-skill__focus", children: [
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
function We({ toolCall: e, onConfirm: t, onCancel: s }) {
  const n = e.risk ?? "safe", a = De[n], c = Object.keys(e.args).length > 0;
  return /* @__PURE__ */ o("div", { className: `meso-confirm-gate meso-confirm-gate--${n}`, role: "alertdialog", "aria-label": "工具执行确认", "data-testid": "meso-confirm-gate", children: [
    /* @__PURE__ */ r("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ o("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ r("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ r("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ o("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ o("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ r("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${n}`, children: a.label }),
        /* @__PURE__ */ r("code", { className: "meso-confirm-gate__tool-name", children: e.name })
      ] }),
      c && /* @__PURE__ */ r("pre", { className: "meso-confirm-gate__args", children: JSON.stringify(e.args, null, 2) }),
      /* @__PURE__ */ o("div", { className: "meso-confirm-gate__actions", children: [
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
            className: `meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${n}`,
            onClick: () => t(e.id),
            children: a.confirmText
          }
        )
      ] })
    ] })
  ] });
}
function je(e) {
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
function Pe(e) {
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
function de({ toolCall: e, onConfirm: t, onCancel: s, className: n, "data-testid": a, simplify: c }) {
  var d, p;
  const [i, m] = C(!1), [h, _] = C((c != null && c.hideResultDetails, !1)), { call: l, result: u, status: f } = e, k = l.risk ?? "safe", N = Object.keys(l.args).length > 0, { hideMetadata: v, hideResultDetails: g } = c || {};
  return /* @__PURE__ */ o(
    "div",
    {
      className: `meso-tool meso-tool--${f} meso-tool--risk-${k}${n ? ` ${n}` : ""}`,
      "data-testid": a ?? "meso-tool-call-block",
      children: [
        /* @__PURE__ */ o("div", { className: "meso-tool__header", children: [
          /* @__PURE__ */ r(A, { status: je(f), size: 14, className: "meso-tool__status-icon" }),
          /* @__PURE__ */ r("span", { className: "meso-tool__name", children: l.name }),
          l.provider && te[l.provider] && /* @__PURE__ */ r("span", { className: `meso-tool__provider meso-tool__provider--${l.provider}`, children: te[l.provider] }),
          ((d = l.annotations) == null ? void 0 : d.open_world) && /* @__PURE__ */ r("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", children: "🌐" }),
          k !== "safe" && /* @__PURE__ */ r("span", { className: `meso-tool__risk meso-tool__risk--${k}`, children: ze[k] }),
          !v && (u == null ? void 0 : u.duration_ms) !== void 0 && /* @__PURE__ */ o("span", { className: "meso-tool__duration", children: [
            u.duration_ms,
            "ms"
          ] }),
          !v && N && /* @__PURE__ */ o(
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
          v && N && ((p = u == null ? void 0 : u.metadata) == null ? void 0 : p.resultCount) !== void 0 && /* @__PURE__ */ o("span", { className: "meso-tool__summary", children: [
            "— ",
            u.metadata.resultCount,
            " 项"
          ] })
        ] }),
        !v && i && N && /* @__PURE__ */ r("pre", { className: "meso-tool__args", children: JSON.stringify(l.args, null, 2) }),
        f === "awaiting_confirm" && t && s && /* @__PURE__ */ r(
          We,
          {
            toolCall: l,
            onConfirm: t,
            onCancel: s
          }
        ),
        (f === "done" || f === "error") && u && !g && /* @__PURE__ */ o("div", { className: "meso-tool__result", children: [
          /* @__PURE__ */ o(
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
function ne({
  stream: e,
  defaultExpanded: t = "none",
  onlyShowCurrent: s = !1,
  simplify: n,
  onToolClick: a,
  onToolConfirm: c,
  onToolCancel: i,
  renderSummary: m
}) {
  const h = e.toolCallOrder, _ = s && h.length > 0 ? [h[h.length - 1]] : h, [l, u] = C(() => t === "none" ? /* @__PURE__ */ new Set() : t === "all" ? new Set(_) : t === "current" && _.length > 0 ? /* @__PURE__ */ new Set([_[_.length - 1]]) : /* @__PURE__ */ new Set()), f = (N) => {
    const v = new Set(l);
    v.has(N) ? v.delete(N) : v.add(N), u(v), a == null || a(N);
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
    const d = l.has(N), { status: p } = g;
    return /* @__PURE__ */ o("div", { className: `meso-collapsible-tool__item meso-collapsible-tool__item--${p}`, children: [
      /* @__PURE__ */ o(
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
        de,
        {
          toolCall: g,
          onConfirm: c,
          onCancel: i,
          simplify: n
        }
      ) })
    ] }, N);
  }) });
}
function ae(e) {
  return e === "html" || e === "html preview" ? { type: "html" } : e === "mermaid" ? { type: "mermaid" } : e === "markdown" ? { type: "markdown" } : e === "table" ? { type: "table" } : { type: "code", language: e };
}
function Ke(e) {
  const t = e.toolCallOrder, s = t.length - 1, n = t.slice(0, s).filter((c) => e.toolCalls[c].result !== void 0), a = t[s];
  return { frozenIds: n, currentId: a };
}
function Ue({
  stream: e,
  onToolConfirm: t,
  onToolCancel: s
}) {
  const { frozenIds: n, currentId: a } = ve(
    () => Ke(e),
    [e.toolCallOrder, e.toolCalls]
  );
  return e.toolCallOrder.length === 0 ? null : /* @__PURE__ */ o(M, { children: [
    n.length > 0 && /* @__PURE__ */ r("div", { className: "meso-message-list__frozen-tools", children: /* @__PURE__ */ r(
      ne,
      {
        stream: {
          ...e,
          toolCallOrder: n
        },
        streaming: !1,
        defaultExpanded: "all",
        simplify: void 0
      }
    ) }),
    a && /* @__PURE__ */ r("div", { className: "meso-message-list__current-tool", children: /* @__PURE__ */ r(
      ne,
      {
        stream: {
          ...e,
          toolCallOrder: [a]
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
function or({
  messages: e,
  streaming: t,
  onArtifactCopy: s,
  onArtifactDownload: n,
  onToolConfirm: a,
  onToolCancel: c,
  emptyState: i,
  emptyStateAlign: m = "center",
  className: h,
  renderExtension: _,
  renderLiveTrace: l,
  renderMarkdown: u,
  renderMermaid: f,
  highlightCode: k,
  hiddenArtifactLangs: N
}) {
  const v = T(null);
  R(() => {
    var d;
    (d = v.current) == null || d.scrollIntoView({ behavior: "smooth" });
  }, [e, t]);
  const g = e.length > 0 || t && t.status !== "idle";
  return /* @__PURE__ */ r("div", { className: `meso-message-list${h ? ` ${h}` : ""}`, children: /* @__PURE__ */ o("div", { className: "meso-message-list__inner", children: [
    !g && i && /* @__PURE__ */ r("div", { className: `meso-message-list__empty${m === "top" ? " meso-message-list__empty--top" : ""}`, children: i }),
    e.map((d) => /* @__PURE__ */ o(U.Fragment, { children: [
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
            onDownload: n,
            renderMermaid: f,
            highlightCode: k,
            renderMarkdown: u
          },
          p.id
        );
      })
    ] }, d.id)),
    t && t.status !== "idle" && /* @__PURE__ */ r("div", { className: "meso-message-list__live", children: l ? l(t) : /* @__PURE__ */ o(M, { children: [
      (t.activeSoul || t.activeSkill) && /* @__PURE__ */ o("div", { className: "meso-message-list__context-row", children: [
        t.activeSoul && /* @__PURE__ */ r(Me, { soul: t.activeSoul }),
        t.activeSkill && /* @__PURE__ */ r(Be, { skill: t.activeSkill })
      ] }),
      /* @__PURE__ */ r(
        Ue,
        {
          stream: t,
          onToolConfirm: a,
          onToolCancel: c
        }
      ),
      _ && t.extensionLog.length > 0 && /* @__PURE__ */ r("div", { className: "meso-message-list__extensions", children: t.extensionLog.map((d, p) => /* @__PURE__ */ r(U.Fragment, { children: _(d) }, p)) }),
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
            onDownload: n,
            renderMermaid: f,
            highlightCode: k,
            renderMarkdown: u
          },
          d
        );
      }),
      t.memorySaved.length > 0 && /* @__PURE__ */ r("div", { className: "meso-memory-saved", children: t.memorySaved.map((d) => /* @__PURE__ */ o("span", { className: "meso-memory-saved__chip", title: d.preview, children: [
        /* @__PURE__ */ r("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ r("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        d.category,
        "]"
      ] }, d.id)) })
    ] }) }),
    /* @__PURE__ */ r("div", { ref: v })
  ] }) });
}
function Ve({ resourceRead: e, className: t }) {
  const [s, n] = C(!1), { read: a, content: c, status: i } = e, m = a.name ?? a.uri, h = a.server;
  return /* @__PURE__ */ o("div", { className: `meso-resource meso-resource--${i}${t ? ` ${t}` : ""}`, children: [
    /* @__PURE__ */ o("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ r(A, { status: Pe(i), size: 13, className: "meso-resource__status-icon" }),
      /* @__PURE__ */ r("span", { className: "meso-resource__uri", title: a.uri, children: m }),
      h && /* @__PURE__ */ r("span", { className: "meso-resource__server", children: h }),
      (c == null ? void 0 : c.duration_ms) !== void 0 && /* @__PURE__ */ o("span", { className: "meso-resource__duration", children: [
        c.duration_ms,
        "ms"
      ] }),
      (i === "done" || i === "error") && c && /* @__PURE__ */ o(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => n((_) => !_),
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
    s && c && /* @__PURE__ */ r("div", { className: "meso-resource__content", children: i === "error" ? /* @__PURE__ */ r("pre", { className: "meso-resource__text meso-resource__text--error", children: c.error }) : c.contents.map((_, l) => /* @__PURE__ */ o("div", { children: [
      _.type === "text" && /* @__PURE__ */ r("pre", { className: "meso-resource__text", children: _.text }),
      _.type === "image" && _.data && /* @__PURE__ */ r(
        "img",
        {
          className: "meso-resource__image",
          src: `data:${_.mime_type ?? "image/png"};base64,${_.data}`,
          alt: "resource"
        }
      ),
      _.type === "blob" && /* @__PURE__ */ o("span", { className: "meso-resource__blob-label", children: [
        "[",
        _.mime_type ?? "binary",
        "]"
      ] })
    ] }, l)) })
  ] });
}
function lr({
  value: e,
  onChange: t,
  onSubmit: s,
  onStop: n,
  streaming: a = !1,
  disabled: c = !1,
  placeholder: i = "输入消息… (Ctrl+Enter 发送，Enter 换行)",
  leadingSlot: m,
  trailingActions: h,
  maxRows: _ = 8
}) {
  const l = T(null), u = 22, f = () => {
    const g = l.current;
    g && (g.style.height = "auto", g.style.height = Math.min(g.scrollHeight, u * _) + "px");
  };
  R(f, [e]);
  const k = (g) => {
    g.key === "Enter" && (g.ctrlKey || g.metaKey) && (g.preventDefault(), !c && !a && e.trim() && s());
  }, N = !c && !a && e.trim().length > 0, v = /* @__PURE__ */ r(
    "button",
    {
      className: `meso-composer__send${a ? " meso-composer__send--stop" : ""}`,
      onClick: a ? n : s,
      disabled: a ? !1 : !N,
      "aria-label": a ? "停止生成" : "发送",
      title: a ? "停止生成" : "Ctrl+Enter",
      children: a ? (
        /* Stop square */
        /* @__PURE__ */ r("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ r("rect", { x: "4", y: "4", width: "16", height: "16", rx: "2" }) })
      ) : (
        /* Send arrow */
        /* @__PURE__ */ o("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ r("line", { x1: "12", y1: "19", x2: "12", y2: "5" }),
          /* @__PURE__ */ r("polyline", { points: "5,12 12,5 19,12" })
        ] })
      )
    }
  );
  return /* @__PURE__ */ r("div", { className: "meso-composer", children: /* @__PURE__ */ o("div", { className: "meso-composer__box", children: [
    /* @__PURE__ */ r(
      "textarea",
      {
        ref: l,
        className: "meso-composer__textarea",
        value: e,
        onChange: (g) => {
          t(g.target.value), f();
        },
        onKeyDown: k,
        placeholder: i,
        rows: 1,
        disabled: c && !a,
        "aria-label": "消息输入框"
      }
    ),
    /* @__PURE__ */ o("div", { className: "meso-composer__toolbar", children: [
      /* @__PURE__ */ r("div", { className: "meso-composer__leading", children: m }),
      /* @__PURE__ */ r("span", { className: "meso-composer__hint", children: e.length > 0 && `${e.length} 字` }),
      /* @__PURE__ */ r("div", { className: "meso-composer__trailing", children: h ?? v })
    ] })
  ] }) });
}
function me({
  system: e,
  resetOnTurnStart: t = !1
}) {
  const [s, n] = C(null), a = T(e);
  return R(() => {
    t && !a.current && e && n(null), a.current = e;
  }, [e, t]), {
    open: s !== null ? s : e,
    setOpen: (i) => n(i),
    toggle: () => n((i) => i !== null ? !i : !e),
    clearIntent: () => n(null),
    hasUserIntent: s !== null
  };
}
function Ge(e) {
  const t = /* @__PURE__ */ new Map(), s = [];
  for (const n of e.toolCallOrder) {
    const a = e.toolCalls[n];
    if (!a) continue;
    const c = a.groupId ? `${a.groupKind ?? "group"}:${a.groupId}` : `__single__:${n}`;
    t.has(c) || (t.set(c, {
      key: c,
      groupId: a.groupId,
      groupKind: a.groupKind,
      ids: []
    }), s.push(c)), t.get(c).ids.push(n);
  }
  return s.map((n) => t.get(n));
}
function Fe(e) {
  const t = e.toolCallOrder.length + e.workflowRunOrder.reduce(
    (a, c) => {
      var i;
      return a + (((i = e.workflowRuns[c]) == null ? void 0 : i.nodeOrder.length) ?? 0);
    },
    0
  ), s = e.toolCallOrder.filter((a) => {
    var c;
    return ((c = e.toolCalls[a]) == null ? void 0 : c.status) === "error";
  }).length + e.workflowRunOrder.reduce((a, c) => {
    const i = e.workflowRuns[c];
    return i ? a + i.nodeOrder.filter((m) => {
      var h;
      return ((h = i.nodes[m]) == null ? void 0 : h.state) === "error";
    }).length : a;
  }, 0), n = [];
  return e.phaseOrder.length > 0 && n.push(`${e.phaseOrder.length} 阶段`), t > 0 && n.push(`${t} 步`), s > 0 && n.push(`${s} 项失败`), n.length > 0 ? n.join(" · ") : "执行过程";
}
function Je(e, t) {
  const s = !!(e.thinkContent || e.pinnedThink);
  return /* @__PURE__ */ o("div", { className: "meso-process-trace__phase", "data-testid": `meso-phase-${e.id}`, children: [
    /* @__PURE__ */ o("div", { className: "meso-process-trace__phase-header", children: [
      /* @__PURE__ */ r(A, { status: He(e.state), size: 14 }),
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
function ir({
  stream: e,
  streaming: t = !1,
  turnStreaming: s = !1,
  defaultCollapsed: n = !1,
  className: a,
  onToolConfirm: c,
  onToolCancel: i,
  renderToolCall: m,
  renderPhase: h,
  renderWorkflow: _,
  simplify: l
}) {
  const u = me({
    system: !n,
    resetOnTurnStart: s
  });
  if (!(!!e.thinkContent || e.phaseOrder.length > 0 || e.memorySnippets.length > 0 || e.resourceReadOrder.length > 0 || e.toolCallOrder.length > 0 || e.workflowRunOrder.length > 0)) return null;
  const k = Fe(e), N = e.workflowRunOrder.map((d) => e.workflowRuns[d]).filter(Boolean), v = Ge(e), g = e.phaseOrder.map((d) => e.phases[d]).filter(Boolean).map(we);
  return /* @__PURE__ */ o(
    "div",
    {
      className: `meso-process-trace${a ? ` ${a}` : ""}`,
      "data-testid": "meso-process-trace",
      children: [
        /* @__PURE__ */ o(
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
        u.open && /* @__PURE__ */ o("div", { className: "meso-process-trace__body", children: [
          g.length > 0 && /* @__PURE__ */ r($e, { compact: !0, stages: g }),
          e.memorySnippets.length > 0 && /* @__PURE__ */ r("div", { className: "meso-memory-chips", children: e.memorySnippets.map((d, p) => /* @__PURE__ */ o("span", { className: "meso-memory-chip", title: d.content, children: [
            "[",
            d.category,
            "] ",
            d.content
          ] }, p)) }),
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
          e.phaseOrder.length > 0 && /* @__PURE__ */ r("div", { className: "meso-process-trace__phases", children: e.phaseOrder.map((d) => {
            const p = e.phases[d];
            if (!p) return null;
            const w = h == null ? void 0 : h(p);
            return w != null ? /* @__PURE__ */ r("div", { children: w }, d) : /* @__PURE__ */ r("div", { children: Je(p, t) }, d);
          }) }),
          e.resourceReadOrder.length > 0 && /* @__PURE__ */ r("div", { className: "meso-process-trace__resources", children: e.resourceReadOrder.map((d) => {
            const p = e.resourceReads[d];
            return p ? /* @__PURE__ */ r(Ve, { resourceRead: p }, d) : null;
          }) }),
          v.length > 0 && /* @__PURE__ */ r("div", { className: "meso-process-trace__tools", children: v.map((d) => /* @__PURE__ */ o(
            "div",
            {
              className: `meso-process-trace__tool-group${d.groupId ? " meso-process-trace__tool-group--grouped" : ""}`,
              "data-group-id": d.groupId,
              "data-group-kind": d.groupKind,
              children: [
                d.groupId && /* @__PURE__ */ o("div", { className: "meso-process-trace__tool-group-label", children: [
                  d.groupKind ?? "group",
                  ": ",
                  d.groupId
                ] }),
                d.ids.map((p) => {
                  const w = e.toolCalls[p];
                  if (!w) return null;
                  const S = m == null ? void 0 : m(w);
                  return S != null ? /* @__PURE__ */ r("div", { children: S }, p) : /* @__PURE__ */ r(
                    de,
                    {
                      toolCall: w,
                      onConfirm: c,
                      onCancel: i,
                      simplify: l
                    },
                    p
                  );
                })
              ]
            },
            d.key
          )) }),
          N.length > 0 && ((_ == null ? void 0 : _(e)) ?? /* @__PURE__ */ r(Ie, { runs: N }))
        ] })
      ]
    }
  );
}
function cr({
  name: e,
  email: t,
  avatarText: s,
  menuItems: n = [],
  onSignOut: a
}) {
  const [c, i] = C(!1), m = T(null);
  R(() => {
    if (!c) return;
    const l = (u) => {
      m.current && !m.current.contains(u.target) && i(!1);
    };
    return document.addEventListener("mousedown", l), () => document.removeEventListener("mousedown", l);
  }, [c]);
  const h = s ?? e.charAt(0).toUpperCase(), _ = [
    ...n,
    ...a ? [{ label: "退出登录", onClick: () => {
      i(!1), a();
    }, danger: !0 }] : []
  ];
  return /* @__PURE__ */ o("div", { className: "meso-user-menu", ref: m, children: [
    c && /* @__PURE__ */ o("div", { className: "meso-user-menu__popup", role: "menu", children: [
      /* @__PURE__ */ o("div", { className: "meso-user-menu__identity", children: [
        /* @__PURE__ */ r("span", { className: "meso-user-menu__identity-name", children: e }),
        t && /* @__PURE__ */ r("span", { className: "meso-user-menu__identity-email", children: t })
      ] }),
      _.length > 0 && /* @__PURE__ */ r("div", { className: "meso-user-menu__sep", role: "separator" }),
      _.map((l, u) => /* @__PURE__ */ o(
        "button",
        {
          className: `meso-user-menu__item${l.danger ? " meso-user-menu__item--danger" : ""}`,
          role: "menuitem",
          onClick: () => {
            i(!1), l.onClick();
          },
          children: [
            l.icon && /* @__PURE__ */ r("span", { className: "meso-user-menu__item-icon", children: l.icon }),
            l.label
          ]
        },
        u
      ))
    ] }),
    /* @__PURE__ */ o(
      "button",
      {
        className: "meso-user-menu__trigger",
        onClick: () => i((l) => !l),
        "aria-haspopup": "menu",
        "aria-expanded": c,
        title: e,
        children: [
          /* @__PURE__ */ r("div", { className: "meso-user-menu__avatar", children: h }),
          /* @__PURE__ */ o("div", { className: "meso-user-menu__info", children: [
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
  autoSelectFirstReady: n = !1
}) {
  var u;
  const a = t !== void 0, [c, i] = C(((u = e[0]) == null ? void 0 : u.id) ?? ""), m = a ? t : c, h = T(!1);
  R(() => {
    if (!n || h.current) return;
    const f = e.find((k) => k.ready);
    f && (h.current = !0, a || i(f.id), s == null || s(f.id));
  }, [e, n, a, s]);
  const _ = (f) => {
    a || i(f), s == null || s(f);
  }, l = e.find((f) => f.id === m) ?? e[0];
  return e.length === 0 ? null : /* @__PURE__ */ o("div", { className: "meso-artifact-shell", children: [
    /* @__PURE__ */ r("div", { className: "meso-artifact-shell__tabs", role: "tablist", children: e.map((f) => /* @__PURE__ */ o(
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
    /* @__PURE__ */ r("div", { className: "meso-artifact-shell__content", role: "tabpanel", children: l == null ? void 0 : l.content })
  ] });
}
function mr({ status: e, primary: t, outcome: s, detail: n, className: a, "data-testid": c }) {
  const i = n !== void 0 && n !== "", m = me({ system: !1 });
  return /* @__PURE__ */ o("div", { className: `meso-log-line${a ? ` ${a}` : ""}`, "data-testid": c ?? "meso-log-line", children: [
    /* @__PURE__ */ o(
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
    i && m.open && /* @__PURE__ */ r("pre", { className: "meso-log-line__detail", children: n })
  ] });
}
const Ye = /* @__PURE__ */ new Set(["text", "think"]);
function Ze(e, t, s) {
  var n, a, c, i, m, h, _, l, u, f, k, N, v, g, d, p;
  if (s)
    switch (e.type) {
      case "capabilities":
        (n = s.onCapabilities) == null || n.call(s, e.payload);
        break;
      case "phase":
        (a = s.onPhaseChange) == null || a.call(s, e.payload);
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
        (l = s.onToolResult) == null || l.call(s, e.payload);
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
function ur(e, t) {
  const [s, n] = C(K), a = T(null), c = T(!1), i = T(t);
  i.current = t;
  const m = W(() => {
    var l;
    (l = a.current) == null || l.abort(), c.current = !1, n((u) => ({ ...u, status: "idle" }));
  }, []), h = W(() => {
    var l;
    (l = a.current) == null || l.abort(), c.current = !1, n(K());
  }, []), _ = W(async (l) => {
    var d, p, w, S, E, L;
    if (c.current) return;
    c.current = !0;
    const u = typeof (l == null ? void 0 : l.reconnect) == "object" ? l.reconnect : { maxAttempts: 3, baseDelayMs: 1e3 }, f = l != null && l.reconnect ? u.maxAttempts ?? 3 : 0, k = u.baseDelayMs ?? 1e3, N = (l == null ? void 0 : l.batchMs) === void 0 ? 16 : l.batchMs;
    let v = 0;
    const g = async () => {
      var Z;
      (Z = a.current) == null || Z.abort();
      const y = new AbortController();
      a.current = y;
      const b = { ...K(), status: "streaming" };
      n(b);
      let O = b;
      const G = (l == null ? void 0 : l.method) ?? (l != null && l.body ? "POST" : "GET"), j = (l == null ? void 0 : l.watchdogMs) === void 0 ? 12e4 : l.watchdogMs;
      let P = null;
      const H = () => {
        P && clearTimeout(P);
      }, F = () => {
        H(), j != null && (P = setTimeout(() => {
          var $, D;
          y.abort();
          const x = `SSE stream timed out after ${j}ms of inactivity`;
          n((B) => ({ ...B, status: "error", errorMessage: x, errorCode: "WATCHDOG_TIMEOUT" })), (D = ($ = i.current) == null ? void 0 : $.onError) == null || D.call($, x, "WATCHDOG_TIMEOUT");
        }, j));
      }, z = [];
      let I = null;
      const J = (x) => {
        const $ = ye(O, x);
        if (O = $, n($), Ze(x, $, i.current), x.type === "done" || x.type === "error")
          return H(), x.type;
      }, Y = () => {
        for (; z.length > 0; ) {
          const x = z.shift(), $ = J(x);
          if ($) return $;
        }
      }, _e = (x) => {
        if (N != null && Ye.has(x.type)) {
          z.push(x), I || (I = setTimeout(() => {
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
            ...l == null ? void 0 : l.headers
          },
          body: l != null && l.body ? JSON.stringify(l.body) : void 0,
          signal: y.signal
        });
        if (!x.ok) throw new Error(`HTTP ${x.status}`);
        const $ = x.body.getReader(), D = new TextDecoder();
        let B = "";
        for (F(); ; ) {
          const { done: fe, value: pe } = await $.read();
          if (fe) break;
          F(), B += D.decode(pe, { stream: !0 });
          const Q = B.split(`
`);
          B = Q.pop() ?? "";
          for (const ge of Q) {
            const X = ke(ge);
            if (!X) continue;
            const ee = _e(X);
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
          if (!(l != null && l.reconnect) || v >= f) {
            const b = "SSE stream ended unexpectedly";
            n((O) => ({ ...O, status: "error", errorMessage: b, errorCode: "STREAM_ENDED" })), (p = (d = i.current) == null ? void 0 : d.onError) == null || p.call(d, b, "STREAM_ENDED");
            return;
          }
        } catch (y) {
          if (!(l != null && l.reconnect) || v >= f) {
            const b = y.message;
            n((O) => ({ ...O, status: "error", errorMessage: b })), (S = (w = i.current) == null ? void 0 : w.onError) == null || S.call(w, b);
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
const ue = "meso-theme";
function qe() {
  return typeof window > "u" ? "light" : localStorage.getItem(ue) ?? "light";
}
function Qe(e) {
  document.documentElement.setAttribute("data-theme", e), localStorage.setItem(ue, e);
}
function hr() {
  const [e, t] = C(qe);
  R(() => {
    Qe(e);
  }, [e]);
  const s = W(() => {
    t((n) => n === "light" ? "dark" : "light");
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
}, V = Ne({
  locale: "zh-CN",
  labels: he
});
function _r({
  locale: e = "zh-CN",
  labels: t,
  children: s
}) {
  const n = { ...er[e], ...t };
  return /* @__PURE__ */ r(V.Provider, { value: { locale: e, labels: n }, children: s });
}
function fr() {
  return oe(V).labels;
}
function pr() {
  return oe(V);
}
export {
  dr as ArtifactPaneShell,
  se as ArtifactPanel,
  re as ChatBubble,
  lr as ChatComposer,
  ne as CollapsibleToolTrace,
  We as ConfirmGate,
  mr as LogLine,
  _r as MesoLocaleProvider,
  or as MessageList,
  Nr as PROTOCOL_VERSION,
  ir as ProcessTrace,
  Ve as ResourceReadBlock,
  cr as SidebarUserMenu,
  Be as SkillIndicator,
  Me as SoulIndicator,
  $e as StageTimeline,
  A as StatusIcon,
  ar as StreamingCursor,
  le as ThinkBlock,
  nr as ThreeColumnLayout,
  de as ToolCallBlock,
  Ie as WorkflowTimeline,
  ye as applyEvent,
  wr as assertCompatibleVersion,
  K as createInitialStreamState,
  kr as createStreamStateWithArtifacts,
  er as defaultLabelsByLocale,
  Xe as enUSLabels,
  yr as isCompatibleVersion,
  ke as parseSSELine,
  we as phaseRecordToStage,
  br as streamStateHasArtifacts,
  me as useFoldState,
  fr as useMesoLabels,
  pr as useMesoLocale,
  ur as useSSEStream,
  hr as useTheme,
  he as zhCNLabels
};
