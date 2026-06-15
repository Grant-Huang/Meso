import { jsxs as o, jsx as r, Fragment as B } from "react/jsx-runtime";
import z, { useState as C, useRef as $, useEffect as R, useCallback as j, createContext as pe, useContext as ne } from "react";
import { phaseRecordToStage as ve, createInitialStreamState as U, parseSSELine as ge, applyEvent as Ne } from "./runtime.js";
import { PROTOCOL_VERSION as fr, assertCompatibleVersion as pr, createStreamStateWithArtifacts as vr, isCompatibleVersion as gr, streamStateHasArtifacts as Nr } from "./runtime.js";
function rr({
  navItems: e = [],
  sidebarFooter: t,
  sessionColumn: s,
  children: a,
  defaultCollapsed: l = !1,
  appName: c = "Meso",
  sidebarLogo: i,
  sidebarTitle: d,
  mainHeader: f,
  artifactPanel: u,
  defaultArtifactVisible: n = !1,
  onArtifactToggle: _,
  artifactVisible: p,
  showArtifactToggle: N = !0,
  showSessionColumn: k = !0,
  contentMaxWidth: g,
  artifactPanelWidth: m,
  onCollapsedChange: h
}) {
  const [v, w] = C(l), [T, O] = C(n), S = p !== void 0 ? p : T, b = () => {
    const y = !S;
    p === void 0 && O(y), _ == null || _(y);
  };
  return /* @__PURE__ */ o("div", { className: "meso-layout", children: [
    /* @__PURE__ */ o("aside", { className: `meso-sidebar${v ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ o("div", { className: "meso-sidebar__header", children: [
        i ? /* @__PURE__ */ r("div", { className: "meso-sidebar__logo meso-sidebar__logo--custom", children: i }) : /* @__PURE__ */ r("div", { className: "meso-sidebar__logo", children: c[0] }),
        d ? /* @__PURE__ */ r("span", { className: "meso-sidebar__title meso-sidebar__title--brand", children: d }) : /* @__PURE__ */ r("span", { className: "meso-sidebar__title", children: c }),
        /* @__PURE__ */ r(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => {
              const y = !v;
              w(y), h == null || h(y);
            },
            "aria-label": v ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ o("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ r("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ r("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ r("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ r("nav", { className: "meso-sidebar__nav", children: e.map((y) => /* @__PURE__ */ o(
        "div",
        {
          className: `meso-sidebar__nav-item${y.active ? " meso-sidebar__nav-item--active" : ""}`,
          onClick: y.onClick,
          title: y.label,
          children: [
            /* @__PURE__ */ r("span", { className: "meso-sidebar__nav-icon", children: y.icon }),
            /* @__PURE__ */ r("span", { className: "meso-sidebar__nav-label", children: y.label })
          ]
        },
        y.id
      )) }),
      t && /* @__PURE__ */ r("div", { className: "meso-sidebar__footer", children: t })
    ] }),
    k !== !1 && /* @__PURE__ */ r("div", { className: "meso-session-col", children: s }),
    /* @__PURE__ */ o("main", { className: "meso-main", children: [
      /* @__PURE__ */ o("div", { className: "meso-main__header", children: [
        /* @__PURE__ */ r("div", { className: "meso-main__header-content", children: f }),
        N !== !1 && /* @__PURE__ */ r(
          "button",
          {
            className: `meso-artifact-toggle${S ? " meso-artifact-toggle--active" : ""}`,
            onClick: b,
            title: S ? "关闭 Artifact" : "打开 Artifact",
            "aria-label": S ? "关闭 Artifact" : "打开 Artifact",
            children: S ? (
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
        /* @__PURE__ */ r("div", { className: "meso-main__chat", style: g ? { maxWidth: g, margin: "0 auto", width: "100%" } : void 0, children: a }),
        S && /* @__PURE__ */ o(B, { children: [
          /* @__PURE__ */ r("div", { className: "meso-artifact-divider", "aria-hidden": "true" }),
          /* @__PURE__ */ r(
            "div",
            {
              className: "meso-artifact-pane",
              style: m != null ? { width: m, minWidth: m, maxWidth: m } : void 0,
              children: u
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
  markdown: l = !1,
  renderMarkdown: c
}) {
  const i = l && typeof c == "function";
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
`).map((d, f) => /* @__PURE__ */ o(z.Fragment, { children: [
          f > 0 && /* @__PURE__ */ r("br", {}),
          d
        ] }, f)),
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
  autoCollapseDelay: l = 1500,
  defaultOpen: c = !0,
  open: i,
  onOpenChange: d,
  collapseWhen: f = "streamEnd",
  summary: u = "已思考"
}) {
  const n = i !== void 0, [_, p] = C(c), [N, k] = C(null), g = $(null);
  g.current = N;
  const m = n ? i : N !== null ? N : _, h = $(s), v = $(a), w = () => {
    const S = !m;
    n || k(S), d == null || d(S);
  };
  return R(() => {
    if (f !== "never" && l !== null) {
      if (h.current && !s) {
        const S = setTimeout(() => {
          n || p(!1), g.current === null && (d == null || d(!1));
        }, l);
        return () => clearTimeout(S);
      }
      h.current = s;
    }
  }, [s, l, f, n, d]), R(() => {
    a !== void 0 && (v.current && !a && k(null), v.current = a);
  }, [a]), /* @__PURE__ */ o("div", { className: `meso-think${m ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ o(
      "button",
      {
        className: "meso-think__header",
        onClick: w,
        "aria-expanded": m,
        children: [
          /* @__PURE__ */ r("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ r("span", { className: "meso-think__label", children: m ? "思考过程" : u }),
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
  onCopy: l,
  onDownload: c,
  renderMermaid: i,
  highlightCode: d,
  renderMarkdown: f
}) {
  const [u, n] = C(!1), [_, p] = C(e), [N, k] = C(null), [g, m] = C(!1), [h, v] = C(null), w = $("");
  R(() => {
    p(e);
  }, [e]), R(() => {
    e !== "mermaid" || a || !i || t === w.current || (w.current = t, k(null), m(!1), i(t).then((b) => k(b)).catch(() => m(!0)));
  }, [e, a, t, i]), R(() => {
    e !== "code" || a || !d || t === w.current && h || (w.current = t, v(d(t, s)));
  }, [e, a, t, s, d, h]);
  const T = () => {
    navigator.clipboard.writeText(t).catch(() => {
    }), n(!0), setTimeout(() => n(!1), 2e3), l == null || l(t);
  }, O = () => {
    if (c) {
      c(t);
      return;
    }
    const b = {
      html: "html",
      mermaid: "md",
      markdown: "md",
      table: "json",
      code: s || "txt"
    }, y = new Blob([t], { type: "text/plain" }), E = document.createElement("a");
    E.href = URL.createObjectURL(y), E.download = `artifact.${b[e]}`, E.click(), URL.revokeObjectURL(E.href);
  };
  return /* @__PURE__ */ o("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ o("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ r("div", { className: "meso-artifact__tabs", children: (e === "html" ? ["html", "code"] : [e]).map((b) => /* @__PURE__ */ r(
        "span",
        {
          className: `meso-artifact__tab${_ === b ? " meso-artifact__tab--active" : ""}`,
          onClick: () => p(b),
          children: ye(b, s)
        },
        b
      )) }),
      a && /* @__PURE__ */ r("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ r("button", { className: "meso-artifact__download-btn", onClick: O, title: "下载", "aria-label": "下载文件", children: /* @__PURE__ */ r("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) }) }),
      /* @__PURE__ */ r("button", { className: "meso-artifact__copy-btn", onClick: T, title: "复制", "aria-label": "复制代码", children: u ? /* @__PURE__ */ r("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ o("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ r("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
        /* @__PURE__ */ r("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
      ] }) })
    ] }),
    /* @__PURE__ */ o("div", { className: "meso-artifact__body", children: [
      _ === "html" && /* @__PURE__ */ r("iframe", { className: "meso-artifact__preview", srcDoc: t, sandbox: "allow-scripts", title: "HTML 预览" }),
      _ === "mermaid" && /* @__PURE__ */ o(B, { children: [
        a && /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
          /* @__PURE__ */ r("code", { children: t }),
          /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
        ] }),
        !a && N && /* @__PURE__ */ r(
          "div",
          {
            className: "meso-artifact__mermaid",
            dangerouslySetInnerHTML: { __html: N }
          }
        ),
        !a && !N && !g && !i && /* @__PURE__ */ o("div", { className: "meso-artifact__mermaid-placeholder", children: [
          /* @__PURE__ */ r("span", { children: "图表预览需要集成 Mermaid 渲染器" }),
          /* @__PURE__ */ r("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ r("code", { children: t }) })
        ] }),
        !a && g && /* @__PURE__ */ o("div", { className: "meso-artifact__mermaid-placeholder meso-artifact__mermaid-placeholder--error", children: [
          /* @__PURE__ */ r("span", { children: "图表渲染失败，请检查语法" }),
          /* @__PURE__ */ r("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ r("code", { children: t }) })
        ] }),
        !a && !N && !g && i && /* @__PURE__ */ r("div", { className: "meso-artifact__mermaid-placeholder", children: /* @__PURE__ */ r("span", { children: "渲染中…" }) })
      ] }),
      _ === "markdown" && /* @__PURE__ */ r(B, { children: f ? /* @__PURE__ */ r(
        "div",
        {
          className: "meso-artifact__markdown",
          dangerouslySetInnerHTML: { __html: f(t) }
        }
      ) : /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
        /* @__PURE__ */ r("code", { children: t }),
        a && /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] }) }),
      _ === "table" && /* @__PURE__ */ r(we, { content: t, streaming: a }),
      (_ === "code" || _ === "html" && !1) && /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
        h && !a ? /* @__PURE__ */ r("code", { dangerouslySetInnerHTML: { __html: h } }) : /* @__PURE__ */ r("code", { children: t }),
        a && /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] })
    ] })
  ] });
}
function we({ content: e, streaming: t }) {
  const s = ke(e);
  return s ? /* @__PURE__ */ r("div", { className: "meso-artifact__table-wrap", children: /* @__PURE__ */ o("table", { className: "meso-artifact__table", children: [
    /* @__PURE__ */ r("thead", { children: /* @__PURE__ */ r("tr", { children: s.headers.map((a, l) => /* @__PURE__ */ r("th", { children: a }, l)) }) }),
    /* @__PURE__ */ r("tbody", { children: s.rows.map((a, l) => /* @__PURE__ */ r("tr", { children: a.map((c, i) => /* @__PURE__ */ r("td", { children: String(c) }, i)) }, l)) })
  ] }) }) : /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
    /* @__PURE__ */ r("code", { children: e }),
    t && /* @__PURE__ */ r("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
  ] });
}
function ye(e, t) {
  return e === "html" ? "HTML 预览" : e === "mermaid" ? "图表" : e === "markdown" ? "Markdown" : e === "table" ? "表格" : t || "Code";
}
const be = {
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
  const l = a ?? be[e];
  return /* @__PURE__ */ o(
    "span",
    {
      className: `meso-status-icon meso-status-icon--${e}${s ? ` ${s}` : ""}`,
      style: { width: t, height: t },
      role: "img",
      "aria-label": l,
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
function xe(e) {
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
function Ce({ stages: e, compact: t = !1 }) {
  return e.length === 0 ? null : /* @__PURE__ */ r("div", { className: `meso-stages${t ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: e.map((s, a) => /* @__PURE__ */ o(
    "div",
    {
      className: `meso-stage meso-stage--${s.status}`,
      children: [
        /* @__PURE__ */ r("div", { className: "meso-stage__dot", children: /* @__PURE__ */ r(A, { status: xe(s.status), size: 10 }) }),
        a < e.length - 1 && /* @__PURE__ */ r("div", { className: `meso-stage__line${s.status === "done" ? " meso-stage__line--done" : ""}` }),
        /* @__PURE__ */ r("span", { className: `meso-stage__label${t ? " meso-stage__label--compact" : ""}`, children: s.label })
      ]
    },
    s.id
  )) });
}
function Se(e) {
  const { nodes: t, nodeOrder: s } = e, a = /* @__PURE__ */ new Map();
  for (const d of s) {
    const f = t[d];
    if (!f) continue;
    const u = f.parent_id ?? null;
    a.has(u) || a.set(u, []), a.get(u).push(d);
  }
  const l = /* @__PURE__ */ new Map();
  for (const [, d] of a)
    if (d.length > 1)
      for (const f of d) l.set(f, d);
  const c = [], i = /* @__PURE__ */ new Set();
  for (const d of s) {
    if (i.has(d)) continue;
    const f = t[d];
    if (!f) continue;
    const u = l.get(d);
    if (u) {
      const n = u.map((_) => t[_]).filter((_) => !!_);
      for (const _ of n) i.add(_.node_id);
      c.push({ kind: "parallel", nodes: n, isLast: !1 });
    } else
      i.add(d), c.push({ kind: "node", node: f, isLast: !1 });
  }
  return c.length > 0 && (c[c.length - 1] = { ...c[c.length - 1], isLast: !0 }), c;
}
function Le(e) {
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
      status: Le(e),
      size: 12,
      className: `meso-wf-node__icon meso-wf-node__icon--${e}`
    }
  );
}
function ie(e) {
  return e < 1e3 ? `${e}ms` : `${(e / 1e3).toFixed(1)}s`;
}
function $e({ node: e, isLast: t }) {
  var c;
  const [s, a] = C(!1), l = e.metadata && Object.keys(e.metadata).length > 0;
  return /* @__PURE__ */ o("div", { className: `meso-wf-node meso-wf-node--${e.state}`, children: [
    /* @__PURE__ */ o("div", { className: "meso-wf-node__track", children: [
      /* @__PURE__ */ r("div", { className: "meso-wf-node__dot", children: /* @__PURE__ */ r(le, { state: e.state }) }),
      !t && /* @__PURE__ */ r("div", { className: "meso-wf-node__line" })
    ] }),
    /* @__PURE__ */ o("div", { className: "meso-wf-node__body", children: [
      /* @__PURE__ */ o("div", { className: "meso-wf-node__header", children: [
        /* @__PURE__ */ r("code", { className: "meso-wf-node__name", children: e.name }),
        e.duration_ms !== void 0 && /* @__PURE__ */ r("span", { className: "meso-wf-node__duration", children: ie(e.duration_ms) }),
        l && /* @__PURE__ */ r(
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
      s && l && /* @__PURE__ */ r("pre", { className: "meso-wf-node__meta", children: JSON.stringify(e.metadata, null, 2) })
    ] })
  ] });
}
function Te({ nodes: e, isLast: t }) {
  return /* @__PURE__ */ o("div", { className: "meso-wf-parallel", children: [
    /* @__PURE__ */ r("div", { className: "meso-wf-parallel__row", children: e.map((s, a) => {
      var l;
      return /* @__PURE__ */ o("div", { className: `meso-wf-parallel__branch meso-wf-parallel__branch--${s.state}`, children: [
        /* @__PURE__ */ r("div", { className: "meso-wf-parallel__branch-dot", children: /* @__PURE__ */ r(le, { state: s.state }) }),
        /* @__PURE__ */ o("div", { className: "meso-wf-parallel__branch-body", children: [
          /* @__PURE__ */ o("div", { className: "meso-wf-parallel__branch-label", children: [
            "并行分支 ",
            String.fromCharCode(65 + a)
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
function Ee({ runs: e, showRunId: t = !0, hidden: s }) {
  if (e.length === 0 || s) return null;
  const a = e.length > 1;
  return /* @__PURE__ */ r("div", { className: "meso-wf", role: "status", "aria-label": "工作流进度", children: e.map((l) => {
    const c = Se(l);
    return /* @__PURE__ */ o("div", { className: "meso-wf-run", children: [
      a && t && /* @__PURE__ */ r("div", { className: "meso-wf-run__label", children: l.run_id }),
      c.map(
        (i, d) => i.kind === "parallel" ? /* @__PURE__ */ r(Te, { nodes: i.nodes, isLast: i.isLast }, `parallel-${d}`) : /* @__PURE__ */ r($e, { node: i.node, isLast: i.isLast }, i.node.node_id)
      )
    ] }, l.run_id);
  }) });
}
function Re({ soul: e, compact: t = !1 }) {
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
        !t && /* @__PURE__ */ o(B, { children: [
          /* @__PURE__ */ r("span", { className: "meso-soul__name", children: e.name }),
          e.traits && e.traits.length > 0 && /* @__PURE__ */ r("div", { className: "meso-soul__traits", children: e.traits.map((a) => /* @__PURE__ */ r("span", { className: "meso-soul__trait", children: a }, a)) })
        ] })
      ]
    }
  );
}
const Oe = {
  mcp: "MCP",
  api: "API"
};
function Ie({ skill: e }) {
  const t = e.provider ? Oe[e.provider] : null;
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
const Ae = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function Me({ toolCall: e, onConfirm: t, onCancel: s }) {
  const a = e.risk ?? "safe", l = Ae[a], c = Object.keys(e.args).length > 0;
  return /* @__PURE__ */ o("div", { className: `meso-confirm-gate meso-confirm-gate--${a}`, role: "alertdialog", "aria-label": "工具执行确认", "data-testid": "meso-confirm-gate", children: [
    /* @__PURE__ */ r("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ o("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ r("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ r("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ o("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ o("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ r("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${a}`, children: l.label }),
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
            className: `meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${a}`,
            onClick: () => t(e.id),
            children: l.confirmText
          }
        )
      ] })
    ] })
  ] });
}
function Be(e) {
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
const De = {
  safe: "只读",
  write: "写入",
  destructive: "危险"
}, te = {
  mcp: "MCP",
  api: "API",
  local: "本地"
};
function Pe({ toolCall: e, onConfirm: t, onCancel: s, className: a, "data-testid": l }) {
  var k;
  const [c, i] = C(!1), [d, f] = C(!1), { call: u, result: n, status: _ } = e, p = u.risk ?? "safe", N = Object.keys(u.args).length > 0;
  return /* @__PURE__ */ o(
    "div",
    {
      className: `meso-tool meso-tool--${_} meso-tool--risk-${p}${a ? ` ${a}` : ""}`,
      "data-testid": l ?? "meso-tool-call-block",
      children: [
        /* @__PURE__ */ o("div", { className: "meso-tool__header", children: [
          /* @__PURE__ */ r(A, { status: Be(_), size: 14, className: "meso-tool__status-icon" }),
          /* @__PURE__ */ r("span", { className: "meso-tool__name", children: u.name }),
          u.provider && te[u.provider] && /* @__PURE__ */ r("span", { className: `meso-tool__provider meso-tool__provider--${u.provider}`, children: te[u.provider] }),
          ((k = u.annotations) == null ? void 0 : k.open_world) && /* @__PURE__ */ r("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", children: "🌐" }),
          p !== "safe" && /* @__PURE__ */ r("span", { className: `meso-tool__risk meso-tool__risk--${p}`, children: De[p] }),
          (n == null ? void 0 : n.duration_ms) !== void 0 && /* @__PURE__ */ o("span", { className: "meso-tool__duration", children: [
            n.duration_ms,
            "ms"
          ] }),
          N && /* @__PURE__ */ o(
            "button",
            {
              className: "meso-tool__toggle",
              onClick: () => i((g) => !g),
              "aria-expanded": c,
              "aria-label": c ? "折叠参数" : "展开参数",
              children: [
                c ? "▾" : "▸",
                " 参数"
              ]
            }
          )
        ] }),
        c && N && /* @__PURE__ */ r("pre", { className: "meso-tool__args", children: JSON.stringify(u.args, null, 2) }),
        _ === "awaiting_confirm" && t && s && /* @__PURE__ */ r(
          Me,
          {
            toolCall: u,
            onConfirm: t,
            onCancel: s
          }
        ),
        (_ === "done" || _ === "error") && n && /* @__PURE__ */ o("div", { className: "meso-tool__result", children: [
          /* @__PURE__ */ o(
            "button",
            {
              className: "meso-tool__toggle",
              onClick: () => f((g) => !g),
              "aria-expanded": d,
              "aria-label": d ? "折叠结果" : "展开结果",
              children: [
                d ? "▾" : "▸",
                " ",
                _ === "error" ? "错误" : "结果"
              ]
            }
          ),
          d && /* @__PURE__ */ r("pre", { className: `meso-tool__output${_ === "error" ? " meso-tool__output--error" : ""}`, children: _ === "error" ? n.error : n.output })
        ] })
      ]
    }
  );
}
function He({ resourceRead: e, className: t }) {
  const [s, a] = C(!1), { read: l, content: c, status: i } = e, d = l.name ?? l.uri, f = l.server;
  return /* @__PURE__ */ o("div", { className: `meso-resource meso-resource--${i}${t ? ` ${t}` : ""}`, children: [
    /* @__PURE__ */ o("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ r(A, { status: We(i), size: 13, className: "meso-resource__status-icon" }),
      /* @__PURE__ */ r("span", { className: "meso-resource__uri", title: l.uri, children: d }),
      f && /* @__PURE__ */ r("span", { className: "meso-resource__server", children: f }),
      (c == null ? void 0 : c.duration_ms) !== void 0 && /* @__PURE__ */ o("span", { className: "meso-resource__duration", children: [
        c.duration_ms,
        "ms"
      ] }),
      (i === "done" || i === "error") && c && /* @__PURE__ */ o(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => a((u) => !u),
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
    s && c && /* @__PURE__ */ r("div", { className: "meso-resource__content", children: i === "error" ? /* @__PURE__ */ r("pre", { className: "meso-resource__text meso-resource__text--error", children: c.error }) : c.contents.map((u, n) => /* @__PURE__ */ o("div", { children: [
      u.type === "text" && /* @__PURE__ */ r("pre", { className: "meso-resource__text", children: u.text }),
      u.type === "image" && u.data && /* @__PURE__ */ r(
        "img",
        {
          className: "meso-resource__image",
          src: `data:${u.mime_type ?? "image/png"};base64,${u.data}`,
          alt: "resource"
        }
      ),
      u.type === "blob" && /* @__PURE__ */ o("span", { className: "meso-resource__blob-label", children: [
        "[",
        u.mime_type ?? "binary",
        "]"
      ] })
    ] }, n)) })
  ] });
}
function ce({
  system: e,
  resetOnTurnStart: t = !1
}) {
  const [s, a] = C(null), l = $(e);
  return R(() => {
    t && !l.current && e && a(null), l.current = e;
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
    const l = e.toolCalls[a];
    if (!l) continue;
    const c = l.groupId ? `${l.groupKind ?? "group"}:${l.groupId}` : `__single__:${a}`;
    t.has(c) || (t.set(c, {
      key: c,
      groupId: l.groupId,
      groupKind: l.groupKind,
      ids: []
    }), s.push(c)), t.get(c).ids.push(a);
  }
  return s.map((a) => t.get(a));
}
function Ue(e) {
  const t = e.toolCallOrder.length + e.workflowRunOrder.reduce(
    (l, c) => {
      var i;
      return l + (((i = e.workflowRuns[c]) == null ? void 0 : i.nodeOrder.length) ?? 0);
    },
    0
  ), s = e.toolCallOrder.filter((l) => {
    var c;
    return ((c = e.toolCalls[l]) == null ? void 0 : c.status) === "error";
  }).length + e.workflowRunOrder.reduce((l, c) => {
    const i = e.workflowRuns[c];
    return i ? l + i.nodeOrder.filter((d) => {
      var f;
      return ((f = i.nodes[d]) == null ? void 0 : f.state) === "error";
    }).length : l;
  }, 0), a = [];
  return e.phaseOrder.length > 0 && a.push(`${e.phaseOrder.length} 阶段`), t > 0 && a.push(`${t} 步`), s > 0 && a.push(`${s} 项失败`), a.length > 0 ? a.join(" · ") : "执行过程";
}
function ze(e, t) {
  const s = !!(e.thinkContent || e.pinnedThink);
  return /* @__PURE__ */ o("div", { className: "meso-process-trace__phase", "data-testid": `meso-phase-${e.id}`, children: [
    /* @__PURE__ */ o("div", { className: "meso-process-trace__phase-header", children: [
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
  className: l,
  onToolConfirm: c,
  onToolCancel: i,
  renderToolCall: d,
  renderPhase: f,
  renderWorkflow: u
}) {
  const n = ce({
    system: !a,
    resetOnTurnStart: s
  });
  if (!(!!e.thinkContent || e.phaseOrder.length > 0 || e.memorySnippets.length > 0 || e.resourceReadOrder.length > 0 || e.toolCallOrder.length > 0 || e.workflowRunOrder.length > 0)) return null;
  const p = Ue(e), N = e.workflowRunOrder.map((m) => e.workflowRuns[m]).filter(Boolean), k = Ke(e), g = e.phaseOrder.map((m) => e.phases[m]).filter(Boolean).map(ve);
  return /* @__PURE__ */ o(
    "div",
    {
      className: `meso-process-trace${l ? ` ${l}` : ""}`,
      "data-testid": "meso-process-trace",
      children: [
        /* @__PURE__ */ o(
          "button",
          {
            className: "meso-process-trace__header",
            onClick: n.toggle,
            "aria-expanded": n.open,
            "aria-label": n.open ? "折叠执行过程" : "展开执行过程",
            children: [
              /* @__PURE__ */ r(
                "svg",
                {
                  className: `meso-process-trace__chevron${n.open ? " meso-process-trace__chevron--open" : ""}`,
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
              /* @__PURE__ */ r("span", { className: "meso-process-trace__summary", children: p }),
              t && /* @__PURE__ */ r("span", { className: "meso-process-trace__dot", "aria-label": "执行中" })
            ]
          }
        ),
        n.open && /* @__PURE__ */ o("div", { className: "meso-process-trace__body", children: [
          g.length > 0 && /* @__PURE__ */ r(Ce, { compact: !0, stages: g }),
          e.memorySnippets.length > 0 && /* @__PURE__ */ r("div", { className: "meso-memory-chips", children: e.memorySnippets.map((m, h) => /* @__PURE__ */ o("span", { className: "meso-memory-chip", title: m.content, children: [
            "[",
            m.category,
            "] ",
            m.content
          ] }, h)) }),
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
          e.phaseOrder.length > 0 && /* @__PURE__ */ r("div", { className: "meso-process-trace__phases", children: e.phaseOrder.map((m) => {
            const h = e.phases[m];
            if (!h) return null;
            const v = f == null ? void 0 : f(h);
            return v != null ? /* @__PURE__ */ r("div", { children: v }, m) : /* @__PURE__ */ r("div", { children: ze(h, t) }, m);
          }) }),
          e.resourceReadOrder.length > 0 && /* @__PURE__ */ r("div", { className: "meso-process-trace__resources", children: e.resourceReadOrder.map((m) => {
            const h = e.resourceReads[m];
            return h ? /* @__PURE__ */ r(He, { resourceRead: h }, m) : null;
          }) }),
          k.length > 0 && /* @__PURE__ */ r("div", { className: "meso-process-trace__tools", children: k.map((m) => /* @__PURE__ */ o(
            "div",
            {
              className: `meso-process-trace__tool-group${m.groupId ? " meso-process-trace__tool-group--grouped" : ""}`,
              "data-group-id": m.groupId,
              "data-group-kind": m.groupKind,
              children: [
                m.groupId && /* @__PURE__ */ o("div", { className: "meso-process-trace__tool-group-label", children: [
                  m.groupKind ?? "group",
                  ": ",
                  m.groupId
                ] }),
                m.ids.map((h) => {
                  const v = e.toolCalls[h];
                  if (!v) return null;
                  const w = d == null ? void 0 : d(v);
                  return w != null ? /* @__PURE__ */ r("div", { children: w }, h) : /* @__PURE__ */ r(
                    Pe,
                    {
                      toolCall: v,
                      onConfirm: c,
                      onCancel: i
                    },
                    h
                  );
                })
              ]
            },
            m.key
          )) }),
          N.length > 0 && ((u == null ? void 0 : u(e)) ?? /* @__PURE__ */ r(Ee, { runs: N }))
        ] })
      ]
    }
  );
}
function ae(e) {
  return e === "html preview" ? { type: "html" } : e === "mermaid" ? { type: "mermaid" } : e === "markdown" ? { type: "markdown" } : e === "table" ? { type: "table" } : { type: "code", language: e };
}
function tr({
  messages: e,
  streaming: t,
  onArtifactCopy: s,
  onArtifactDownload: a,
  onToolConfirm: l,
  onToolCancel: c,
  emptyState: i,
  emptyStateAlign: d = "center",
  className: f,
  renderExtension: u,
  renderLiveTrace: n,
  renderMarkdown: _,
  renderMermaid: p,
  highlightCode: N,
  hiddenArtifactLangs: k
}) {
  const g = $(null);
  R(() => {
    var h;
    (h = g.current) == null || h.scrollIntoView({ behavior: "smooth" });
  }, [e, t]);
  const m = e.length > 0 || t && t.status !== "idle";
  return /* @__PURE__ */ r("div", { className: `meso-message-list${f ? ` ${f}` : ""}`, children: /* @__PURE__ */ o("div", { className: "meso-message-list__inner", children: [
    !m && i && /* @__PURE__ */ r("div", { className: `meso-message-list__empty${d === "top" ? " meso-message-list__empty--top" : ""}`, children: i }),
    e.map((h) => /* @__PURE__ */ o(z.Fragment, { children: [
      /* @__PURE__ */ r(
        re,
        {
          role: h.role,
          content: h.content,
          timestamp: h.timestamp,
          markdown: h.role === "assistant",
          renderMarkdown: _
        }
      ),
      h.artifacts && h.artifacts.length > 0 && h.artifacts.map((v) => {
        const { type: w, language: T } = ae(v.lang);
        return /* @__PURE__ */ r(
          se,
          {
            type: w,
            content: v.content,
            language: T,
            onCopy: s,
            onDownload: a,
            renderMermaid: p,
            highlightCode: N,
            renderMarkdown: _
          },
          v.id
        );
      })
    ] }, h.id)),
    t && t.status !== "idle" && /* @__PURE__ */ r("div", { className: "meso-message-list__live", children: n ? n(t) : /* @__PURE__ */ o(B, { children: [
      (t.activeSoul || t.activeSkill) && /* @__PURE__ */ o("div", { className: "meso-message-list__context-row", children: [
        t.activeSoul && /* @__PURE__ */ r(Re, { soul: t.activeSoul }),
        t.activeSkill && /* @__PURE__ */ r(Ie, { skill: t.activeSkill })
      ] }),
      /* @__PURE__ */ r(
        Ve,
        {
          stream: t,
          streaming: t.status === "streaming",
          turnStreaming: t.status === "streaming",
          onToolConfirm: l,
          onToolCancel: c
        }
      ),
      u && t.extensionLog.length > 0 && /* @__PURE__ */ r("div", { className: "meso-message-list__extensions", children: t.extensionLog.map((h, v) => /* @__PURE__ */ r(z.Fragment, { children: u(h) }, v)) }),
      (t.textContent || t.status === "streaming") && /* @__PURE__ */ r(
        re,
        {
          role: "assistant",
          content: t.textContent,
          streaming: t.status === "streaming" && t.artifactOrder.length === 0,
          markdown: !0,
          renderMarkdown: _
        }
      ),
      t.artifactOrder.map((h) => {
        const v = t.artifacts[h];
        if (!v || k != null && k.includes(v.lang)) return null;
        const { type: w, language: T } = ae(v.lang);
        return /* @__PURE__ */ r(
          se,
          {
            type: w,
            content: v.content,
            language: T,
            streaming: !v.done,
            onCopy: s,
            onDownload: a,
            renderMermaid: p,
            highlightCode: N,
            renderMarkdown: _
          },
          h
        );
      }),
      t.memorySaved.length > 0 && /* @__PURE__ */ r("div", { className: "meso-memory-saved", children: t.memorySaved.map((h) => /* @__PURE__ */ o("span", { className: "meso-memory-saved__chip", title: h.preview, children: [
        /* @__PURE__ */ r("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ r("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        h.category,
        "]"
      ] }, h.id)) })
    ] }) }),
    /* @__PURE__ */ r("div", { ref: g })
  ] }) });
}
function ar({
  value: e,
  onChange: t,
  onSubmit: s,
  onStop: a,
  streaming: l = !1,
  disabled: c = !1,
  placeholder: i = "输入消息… (Ctrl+Enter 发送，Enter 换行)",
  leadingSlot: d,
  trailingActions: f,
  maxRows: u = 8
}) {
  const n = $(null), _ = 22, p = () => {
    const m = n.current;
    m && (m.style.height = "auto", m.style.height = Math.min(m.scrollHeight, _ * u) + "px");
  };
  R(p, [e]);
  const N = (m) => {
    m.key === "Enter" && (m.ctrlKey || m.metaKey) && (m.preventDefault(), !c && !l && e.trim() && s());
  }, k = !c && !l && e.trim().length > 0, g = /* @__PURE__ */ r(
    "button",
    {
      className: `meso-composer__send${l ? " meso-composer__send--stop" : ""}`,
      onClick: l ? a : s,
      disabled: l ? !1 : !k,
      "aria-label": l ? "停止生成" : "发送",
      title: l ? "停止生成" : "Ctrl+Enter",
      children: l ? (
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
        ref: n,
        className: "meso-composer__textarea",
        value: e,
        onChange: (m) => {
          t(m.target.value), p();
        },
        onKeyDown: N,
        placeholder: i,
        rows: 1,
        disabled: c && !l,
        "aria-label": "消息输入框"
      }
    ),
    /* @__PURE__ */ o("div", { className: "meso-composer__toolbar", children: [
      /* @__PURE__ */ r("div", { className: "meso-composer__leading", children: d }),
      /* @__PURE__ */ r("span", { className: "meso-composer__hint", children: e.length > 0 && `${e.length} 字` }),
      /* @__PURE__ */ r("div", { className: "meso-composer__trailing", children: f ?? g })
    ] })
  ] }) });
}
function nr({
  name: e,
  email: t,
  avatarText: s,
  menuItems: a = [],
  onSignOut: l
}) {
  const [c, i] = C(!1), d = $(null);
  R(() => {
    if (!c) return;
    const n = (_) => {
      d.current && !d.current.contains(_.target) && i(!1);
    };
    return document.addEventListener("mousedown", n), () => document.removeEventListener("mousedown", n);
  }, [c]);
  const f = s ?? e.charAt(0).toUpperCase(), u = [
    ...a,
    ...l ? [{ label: "退出登录", onClick: () => {
      i(!1), l();
    }, danger: !0 }] : []
  ];
  return /* @__PURE__ */ o("div", { className: "meso-user-menu", ref: d, children: [
    c && /* @__PURE__ */ o("div", { className: "meso-user-menu__popup", role: "menu", children: [
      /* @__PURE__ */ o("div", { className: "meso-user-menu__identity", children: [
        /* @__PURE__ */ r("span", { className: "meso-user-menu__identity-name", children: e }),
        t && /* @__PURE__ */ r("span", { className: "meso-user-menu__identity-email", children: t })
      ] }),
      u.length > 0 && /* @__PURE__ */ r("div", { className: "meso-user-menu__sep", role: "separator" }),
      u.map((n, _) => /* @__PURE__ */ o(
        "button",
        {
          className: `meso-user-menu__item${n.danger ? " meso-user-menu__item--danger" : ""}`,
          role: "menuitem",
          onClick: () => {
            i(!1), n.onClick();
          },
          children: [
            n.icon && /* @__PURE__ */ r("span", { className: "meso-user-menu__item-icon", children: n.icon }),
            n.label
          ]
        },
        _
      ))
    ] }),
    /* @__PURE__ */ o(
      "button",
      {
        className: "meso-user-menu__trigger",
        onClick: () => i((n) => !n),
        "aria-haspopup": "menu",
        "aria-expanded": c,
        title: e,
        children: [
          /* @__PURE__ */ r("div", { className: "meso-user-menu__avatar", children: f }),
          /* @__PURE__ */ o("div", { className: "meso-user-menu__info", children: [
            /* @__PURE__ */ r("span", { className: "meso-user-menu__name", children: e }),
            t && /* @__PURE__ */ r("span", { className: "meso-user-menu__email", children: t })
          ] })
        ]
      }
    )
  ] });
}
function or({
  tabs: e,
  activeTabId: t,
  onTabChange: s,
  autoSelectFirstReady: a = !1
}) {
  var _;
  const l = t !== void 0, [c, i] = C(((_ = e[0]) == null ? void 0 : _.id) ?? ""), d = l ? t : c, f = $(!1);
  R(() => {
    if (!a || f.current) return;
    const p = e.find((N) => N.ready);
    p && (f.current = !0, l || i(p.id), s == null || s(p.id));
  }, [e, a, l, s]);
  const u = (p) => {
    l || i(p), s == null || s(p);
  }, n = e.find((p) => p.id === d) ?? e[0];
  return e.length === 0 ? null : /* @__PURE__ */ o("div", { className: "meso-artifact-shell", children: [
    /* @__PURE__ */ r("div", { className: "meso-artifact-shell__tabs", role: "tablist", children: e.map((p) => /* @__PURE__ */ o(
      "button",
      {
        role: "tab",
        "aria-selected": p.id === d,
        className: `meso-artifact-shell__tab${p.id === d ? " meso-artifact-shell__tab--active" : ""}`,
        onClick: () => u(p.id),
        children: [
          p.label,
          p.ready === !1 && /* @__PURE__ */ r("span", { className: "meso-artifact-shell__tab-dot", "aria-label": "加载中" })
        ]
      },
      p.id
    )) }),
    /* @__PURE__ */ r("div", { className: "meso-artifact-shell__content", role: "tabpanel", children: n == null ? void 0 : n.content })
  ] });
}
function lr({ status: e, primary: t, outcome: s, detail: a, className: l, "data-testid": c }) {
  const i = a !== void 0 && a !== "", d = ce({ system: !1 });
  return /* @__PURE__ */ o("div", { className: `meso-log-line${l ? ` ${l}` : ""}`, "data-testid": c ?? "meso-log-line", children: [
    /* @__PURE__ */ o(
      "div",
      {
        className: `meso-log-line__row${i ? " meso-log-line__row--clickable" : ""}`,
        onClick: i ? d.toggle : void 0,
        role: i ? "button" : void 0,
        tabIndex: i ? 0 : void 0,
        onKeyDown: i ? (f) => {
          (f.key === "Enter" || f.key === " ") && d.toggle();
        } : void 0,
        "aria-expanded": i ? d.open : void 0,
        "aria-label": i ? `${t}，${d.open ? "折叠" : "展开"}详情` : void 0,
        children: [
          /* @__PURE__ */ r(A, { status: e, size: 14, className: "meso-log-line__icon" }),
          /* @__PURE__ */ r("span", { className: "meso-log-line__primary", children: t }),
          s && /* @__PURE__ */ r("span", { className: "meso-log-line__outcome", children: s }),
          i && /* @__PURE__ */ r(
            "svg",
            {
              className: `meso-log-line__chevron${d.open ? " meso-log-line__chevron--open" : ""}`,
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
    i && d.open && /* @__PURE__ */ r("pre", { className: "meso-log-line__detail", children: a })
  ] });
}
const Ge = /* @__PURE__ */ new Set(["text", "think"]);
function Fe(e, t, s) {
  var a, l, c, i, d, f, u, n, _, p, N, k, g, m, h, v;
  if (s)
    switch (e.type) {
      case "capabilities":
        (a = s.onCapabilities) == null || a.call(s, e.payload);
        break;
      case "phase":
        (l = s.onPhaseChange) == null || l.call(s, e.payload);
        break;
      case "memory":
        (c = s.onMemoryRecalled) == null || c.call(s, e.payload.snippets);
        break;
      case "memory_saved":
        (i = s.onMemorySaved) == null || i.call(s, e.payload);
        break;
      case "soul":
        (d = s.onSoulActivated) == null || d.call(s, e.payload);
        break;
      case "skill_active":
        (f = s.onSkillActivated) == null || f.call(s, e.payload);
        break;
      case "tool_call":
        (u = s.onToolCall) == null || u.call(s, e.payload);
        break;
      case "tool_result":
        (n = s.onToolResult) == null || n.call(s, e.payload);
        break;
      case "resource_read":
        (_ = s.onResourceRead) == null || _.call(s, e.payload);
        break;
      case "resource_content":
        (p = s.onResourceContent) == null || p.call(s, e.payload);
        break;
      case "text":
        (N = s.onText) == null || N.call(s, e.payload.delta, t);
        break;
      case "think":
        (k = s.onThink) == null || k.call(s, e.payload.delta, t);
        break;
      case "artifact": {
        const w = t.artifacts[e.payload.id];
        w && ((g = s.onArtifact) == null || g.call(s, w));
        break;
      }
      case "extension":
        (m = s.onExtensionEvent) == null || m.call(s, e);
        break;
      case "error":
        (h = s.onError) == null || h.call(s, e.payload.message, e.payload.code);
        break;
      case "done":
        (v = s.onDone) == null || v.call(s, t);
        break;
    }
}
function ir(e, t) {
  const [s, a] = C(U), l = $(null), c = $(!1), i = $(t);
  i.current = t;
  const d = j(() => {
    var n;
    (n = l.current) == null || n.abort(), c.current = !1, a((_) => ({ ..._, status: "idle" }));
  }, []), f = j(() => {
    var n;
    (n = l.current) == null || n.abort(), c.current = !1, a(U());
  }, []), u = j(async (n) => {
    var h, v, w, T, O, S;
    if (c.current) return;
    c.current = !0;
    const _ = typeof (n == null ? void 0 : n.reconnect) == "object" ? n.reconnect : { maxAttempts: 3, baseDelayMs: 1e3 }, p = n != null && n.reconnect ? _.maxAttempts ?? 3 : 0, N = _.baseDelayMs ?? 1e3, k = (n == null ? void 0 : n.batchMs) === void 0 ? 16 : n.batchMs;
    let g = 0;
    const m = async () => {
      var Z;
      (Z = l.current) == null || Z.abort();
      const b = new AbortController();
      l.current = b;
      const y = { ...U(), status: "streaming" };
      a(y);
      let E = y;
      const G = (n == null ? void 0 : n.method) ?? (n != null && n.body ? "POST" : "GET"), D = (n == null ? void 0 : n.watchdogMs) === void 0 ? 12e4 : n.watchdogMs;
      let P = null;
      const H = () => {
        P && clearTimeout(P);
      }, F = () => {
        H(), D != null && (P = setTimeout(() => {
          var L, W;
          b.abort();
          const x = `SSE stream timed out after ${D}ms of inactivity`;
          a((M) => ({ ...M, status: "error", errorMessage: x, errorCode: "WATCHDOG_TIMEOUT" })), (W = (L = i.current) == null ? void 0 : L.onError) == null || W.call(L, x, "WATCHDOG_TIMEOUT");
        }, D));
      }, K = [];
      let I = null;
      const J = (x) => {
        const L = Ne(E, x);
        if (E = L, a(L), Fe(x, L, i.current), x.type === "done" || x.type === "error")
          return H(), x.type;
      }, Y = () => {
        for (; K.length > 0; ) {
          const x = K.shift(), L = J(x);
          if (L) return L;
        }
      }, ue = (x) => {
        if (k != null && Ge.has(x.type)) {
          K.push(x), I || (I = setTimeout(() => {
            I = null, Y();
          }, k));
          return;
        }
        return J(x);
      };
      try {
        const x = await fetch(e, {
          method: G,
          headers: {
            ...G === "POST" ? { "Content-Type": "application/json" } : {},
            ...n == null ? void 0 : n.headers
          },
          body: n != null && n.body ? JSON.stringify(n.body) : void 0,
          signal: b.signal
        });
        if (!x.ok) throw new Error(`HTTP ${x.status}`);
        const L = x.body.getReader(), W = new TextDecoder();
        let M = "";
        for (F(); ; ) {
          const { done: he, value: _e } = await L.read();
          if (he) break;
          F(), M += W.decode(_e, { stream: !0 });
          const Q = M.split(`
`);
          M = Q.pop() ?? "";
          for (const fe of Q) {
            const X = ge(fe);
            if (!X) continue;
            const ee = ue(X);
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
          const b = await m();
          if (b === "done" || b === "error") return;
          if (!(n != null && n.reconnect) || g >= p) {
            const y = "SSE stream ended unexpectedly";
            a((E) => ({ ...E, status: "error", errorMessage: y, errorCode: "STREAM_ENDED" })), (v = (h = i.current) == null ? void 0 : h.onError) == null || v.call(h, y, "STREAM_ENDED");
            return;
          }
        } catch (b) {
          if (!(n != null && n.reconnect) || g >= p) {
            const y = b.message;
            a((E) => ({ ...E, status: "error", errorMessage: y })), (T = (w = i.current) == null ? void 0 : w.onError) == null || T.call(w, y);
            return;
          }
        }
        g += 1, (S = (O = i.current) == null ? void 0 : O.onReconnect) == null || S.call(O, g), await new Promise((b) => setTimeout(b, N * Math.pow(2, g - 1)));
      }
    } finally {
      c.current = !1;
    }
  }, [e]);
  return { state: s, start: u, abort: d, reset: f };
}
const de = "meso-theme";
function Je() {
  return typeof window > "u" ? "light" : localStorage.getItem(de) ?? "light";
}
function Ye(e) {
  document.documentElement.setAttribute("data-theme", e), localStorage.setItem(de, e);
}
function cr() {
  const [e, t] = C(Je);
  R(() => {
    Ye(e);
  }, [e]);
  const s = j(() => {
    t((a) => a === "light" ? "dark" : "light");
  }, []);
  return { theme: e, toggle: s };
}
const me = {
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
  "zh-CN": me,
  "en-US": Ze
}, V = pe({
  locale: "zh-CN",
  labels: me
});
function dr({
  locale: e = "zh-CN",
  labels: t,
  children: s
}) {
  const a = { ...qe[e], ...t };
  return /* @__PURE__ */ r(V.Provider, { value: { locale: e, labels: a }, children: s });
}
function mr() {
  return ne(V).labels;
}
function ur() {
  return ne(V);
}
export {
  or as ArtifactPaneShell,
  se as ArtifactPanel,
  re as ChatBubble,
  ar as ChatComposer,
  Me as ConfirmGate,
  lr as LogLine,
  dr as MesoLocaleProvider,
  tr as MessageList,
  fr as PROTOCOL_VERSION,
  Ve as ProcessTrace,
  He as ResourceReadBlock,
  nr as SidebarUserMenu,
  Ie as SkillIndicator,
  Re as SoulIndicator,
  Ce as StageTimeline,
  A as StatusIcon,
  sr as StreamingCursor,
  oe as ThinkBlock,
  rr as ThreeColumnLayout,
  Pe as ToolCallBlock,
  Ee as WorkflowTimeline,
  Ne as applyEvent,
  pr as assertCompatibleVersion,
  U as createInitialStreamState,
  vr as createStreamStateWithArtifacts,
  qe as defaultLabelsByLocale,
  Ze as enUSLabels,
  gr as isCompatibleVersion,
  ge as parseSSELine,
  ve as phaseRecordToStage,
  Nr as streamStateHasArtifacts,
  ce as useFoldState,
  mr as useMesoLabels,
  ur as useMesoLocale,
  ir as useSSEStream,
  cr as useTheme,
  me as zhCNLabels
};
