import { jsxs as n, jsx as t, Fragment as A } from "react/jsx-runtime";
import F, { useState as $, useRef as I, useEffect as R, useMemo as ne, useCallback as V, createContext as ye, useContext as le } from "react";
import { phaseRecordToStage as be, createInitialStreamState as G, parseSSELine as xe, applyEvent as Ce } from "./runtime.js";
import { PROTOCOL_VERSION as wt, assertCompatibleVersion as kt, createStreamStateWithArtifacts as yt, isCompatibleVersion as bt, streamStateHasArtifacts as xt } from "./runtime.js";
function ot({
  navItems: e = [],
  sidebarFooter: r,
  sessionColumn: s,
  children: a,
  defaultCollapsed: l = !1,
  appName: o = "Meso",
  sidebarLogo: c,
  sidebarTitle: i,
  mainHeader: m,
  artifactPanel: _,
  defaultArtifactVisible: d = !1,
  onArtifactToggle: h,
  artifactVisible: g,
  showArtifactToggle: N = !0,
  showSessionColumn: k = !0,
  contentMaxWidth: p,
  artifactPanelWidth: f,
  onCollapsedChange: u
}) {
  const [v, y] = $(l), [w, S] = $(d), C = g !== void 0 ? g : w, x = () => {
    const b = !C;
    g === void 0 && S(b), h == null || h(b);
  };
  return /* @__PURE__ */ n("div", { className: "meso-layout", children: [
    /* @__PURE__ */ n("aside", { className: `meso-sidebar${v ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ n("div", { className: "meso-sidebar__header", children: [
        c ? /* @__PURE__ */ t("div", { className: "meso-sidebar__logo meso-sidebar__logo--custom", children: c }) : /* @__PURE__ */ t("div", { className: "meso-sidebar__logo", children: o[0] }),
        i ? /* @__PURE__ */ t("span", { className: "meso-sidebar__title meso-sidebar__title--brand", children: i }) : /* @__PURE__ */ t("span", { className: "meso-sidebar__title", children: o }),
        /* @__PURE__ */ t(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => {
              const b = !v;
              y(b), u == null || u(b);
            },
            "aria-label": v ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ n("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ t("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ t("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ t("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ t("nav", { className: "meso-sidebar__nav", children: e.map((b) => /* @__PURE__ */ n(
        "div",
        {
          className: `meso-sidebar__nav-item${b.active ? " meso-sidebar__nav-item--active" : ""}`,
          onClick: b.onClick,
          title: b.label,
          children: [
            /* @__PURE__ */ t("span", { className: "meso-sidebar__nav-icon", children: b.icon }),
            /* @__PURE__ */ t("span", { className: "meso-sidebar__nav-label", children: b.label })
          ]
        },
        b.id
      )) }),
      r && /* @__PURE__ */ t("div", { className: "meso-sidebar__footer", children: r })
    ] }),
    k !== !1 && /* @__PURE__ */ t("div", { className: "meso-session-col", children: s }),
    /* @__PURE__ */ n("main", { className: "meso-main", children: [
      /* @__PURE__ */ n("div", { className: "meso-main__header", children: [
        /* @__PURE__ */ t("div", { className: "meso-main__header-content", children: m }),
        N !== !1 && /* @__PURE__ */ t(
          "button",
          {
            className: `meso-artifact-toggle${C ? " meso-artifact-toggle--active" : ""}`,
            onClick: x,
            title: C ? "关闭 Artifact" : "打开 Artifact",
            "aria-label": C ? "关闭 Artifact" : "打开 Artifact",
            children: C ? (
              /* X / close icon */
              /* @__PURE__ */ n("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ t("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                /* @__PURE__ */ t("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
              ] })
            ) : (
              /* Panel / artifact icon */
              /* @__PURE__ */ n("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ t("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                /* @__PURE__ */ t("line", { x1: "14", y1: "3", x2: "14", y2: "21" })
              ] })
            )
          }
        )
      ] }),
      /* @__PURE__ */ n("div", { className: "meso-main__content", children: [
        /* @__PURE__ */ t("div", { className: "meso-main__chat", style: p ? { maxWidth: p, margin: "0 auto", width: "100%" } : void 0, children: a }),
        C && /* @__PURE__ */ n(A, { children: [
          /* @__PURE__ */ t("div", { className: "meso-artifact-divider", "aria-hidden": "true" }),
          /* @__PURE__ */ t(
            "div",
            {
              className: "meso-artifact-pane",
              style: f != null ? { width: f, minWidth: f, maxWidth: f } : void 0,
              children: _
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function ae({
  role: e,
  content: r,
  streaming: s = !1,
  timestamp: a,
  markdown: l = !1,
  renderMarkdown: o
}) {
  const c = l && typeof o == "function";
  return /* @__PURE__ */ n("div", { className: `meso-bubble meso-bubble--${e}`, children: [
    e === "assistant" && /* @__PURE__ */ t("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ n("div", { className: "meso-bubble__body", children: [
      c ? /* @__PURE__ */ t(
        "div",
        {
          className: "meso-bubble__content meso-bubble__md",
          dangerouslySetInnerHTML: { __html: o(r) }
        }
      ) : /* @__PURE__ */ n("div", { className: "meso-bubble__content", children: [
        r.split(`
`).map((i, m) => /* @__PURE__ */ n(F.Fragment, { children: [
          m > 0 && /* @__PURE__ */ t("br", {}),
          i
        ] }, m)),
        s && /* @__PURE__ */ t("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      a && /* @__PURE__ */ t("div", { className: "meso-bubble__timestamp", children: a })
    ] })
  ] });
}
function ce({
  content: e,
  pinnedContent: r,
  streaming: s = !1,
  turnStreaming: a,
  autoCollapseDelay: l = 1500,
  defaultOpen: o = !0,
  open: c,
  onOpenChange: i,
  collapseWhen: m = "streamEnd",
  summary: _ = "已思考"
}) {
  const d = c !== void 0, [h, g] = $(o), [N, k] = $(null), p = I(null);
  p.current = N;
  const f = d ? c : N !== null ? N : h, u = I(s), v = I(a), y = () => {
    const C = !f;
    d || k(C), i == null || i(C);
  };
  return R(() => {
    if (m !== "never" && l !== null) {
      if (u.current && !s) {
        const C = setTimeout(() => {
          d || g(!1), p.current === null && (i == null || i(!1));
        }, l);
        return () => clearTimeout(C);
      }
      u.current = s;
    }
  }, [s, l, m, d, i]), R(() => {
    a !== void 0 && (v.current && !a && k(null), v.current = a);
  }, [a]), /* @__PURE__ */ n("div", { className: `meso-think${f ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ n(
      "button",
      {
        className: "meso-think__header",
        onClick: y,
        "aria-expanded": f,
        children: [
          /* @__PURE__ */ t("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ t("span", { className: "meso-think__label", children: f ? "思考过程" : _ }),
          s && /* @__PURE__ */ t("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ t("div", { className: "meso-think__body", children: /* @__PURE__ */ n("div", { className: "meso-think__content", children: [
      !s && r !== void 0 ? r : e,
      s && /* @__PURE__ */ t("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function nt({ active: e = !0 }) {
  return e ? /* @__PURE__ */ t("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function Se(e) {
  try {
    const r = JSON.parse(e);
    return Array.isArray(r.headers) && Array.isArray(r.rows) ? r : null;
  } catch {
    return null;
  }
}
function J({
  type: e,
  content: r,
  language: s = "plaintext",
  streaming: a = !1,
  onCopy: l,
  onDownload: o,
  renderMermaid: c,
  highlightCode: i,
  renderMarkdown: m
}) {
  const [_, d] = $(!1), [h, g] = $(e), [N, k] = $(null), [p, f] = $(!1), [u, v] = $(null), y = I("");
  R(() => {
    g(e);
  }, [e]), R(() => {
    e !== "mermaid" || a || !c || r === y.current || (y.current = r, k(null), f(!1), c(r).then((x) => k(x)).catch(() => f(!0)));
  }, [e, a, r, c]), R(() => {
    e !== "code" || a || !i || r === y.current && u || (y.current = r, v(i(r, s)));
  }, [e, a, r, s, i, u]);
  const w = () => {
    navigator.clipboard.writeText(r).catch(() => {
    }), d(!0), setTimeout(() => d(!1), 2e3), l == null || l(r);
  }, S = () => {
    if (o) {
      o(r);
      return;
    }
    const x = {
      html: "html",
      mermaid: "md",
      markdown: "md",
      table: "json",
      code: s || "txt"
    }, b = new Blob([r], { type: "text/plain" }), T = document.createElement("a");
    T.href = URL.createObjectURL(b), T.download = `artifact.${x[e]}`, T.click(), URL.revokeObjectURL(T.href);
  };
  return /* @__PURE__ */ n("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ n("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ t("div", { className: "meso-artifact__tabs", children: (e === "html" ? ["html", "code"] : [e]).map((x) => /* @__PURE__ */ t(
        "span",
        {
          className: `meso-artifact__tab${h === x ? " meso-artifact__tab--active" : ""}`,
          onClick: () => g(x),
          children: $e(x, s)
        },
        x
      )) }),
      a && /* @__PURE__ */ t("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ t("button", { className: "meso-artifact__download-btn", onClick: S, title: "下载", "aria-label": "下载文件", children: /* @__PURE__ */ t("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) }) }),
      /* @__PURE__ */ t("button", { className: "meso-artifact__copy-btn", onClick: w, title: "复制", "aria-label": "复制代码", children: _ ? /* @__PURE__ */ t("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ n("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ t("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
        /* @__PURE__ */ t("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
      ] }) })
    ] }),
    /* @__PURE__ */ n("div", { className: "meso-artifact__body", children: [
      h === "html" && /* @__PURE__ */ t("iframe", { className: "meso-artifact__preview", srcDoc: r, sandbox: "allow-scripts", title: "HTML 预览" }),
      h === "mermaid" && /* @__PURE__ */ n(A, { children: [
        a && /* @__PURE__ */ n("pre", { className: "meso-artifact__code", children: [
          /* @__PURE__ */ t("code", { children: r }),
          /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
        ] }),
        !a && N && /* @__PURE__ */ t(
          "div",
          {
            className: "meso-artifact__mermaid",
            dangerouslySetInnerHTML: { __html: N }
          }
        ),
        !a && !N && !p && !c && /* @__PURE__ */ n("div", { className: "meso-artifact__mermaid-placeholder", children: [
          /* @__PURE__ */ t("span", { children: "图表预览需要集成 Mermaid 渲染器" }),
          /* @__PURE__ */ t("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ t("code", { children: r }) })
        ] }),
        !a && p && /* @__PURE__ */ n("div", { className: "meso-artifact__mermaid-placeholder meso-artifact__mermaid-placeholder--error", children: [
          /* @__PURE__ */ t("span", { children: "图表渲染失败，请检查语法" }),
          /* @__PURE__ */ t("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ t("code", { children: r }) })
        ] }),
        !a && !N && !p && c && /* @__PURE__ */ t("div", { className: "meso-artifact__mermaid-placeholder", children: /* @__PURE__ */ t("span", { children: "渲染中…" }) })
      ] }),
      h === "markdown" && /* @__PURE__ */ t(A, { children: m ? /* @__PURE__ */ t(
        "div",
        {
          className: "meso-artifact__markdown",
          dangerouslySetInnerHTML: { __html: m(r) }
        }
      ) : /* @__PURE__ */ n("pre", { className: "meso-artifact__code", children: [
        /* @__PURE__ */ t("code", { children: r }),
        a && /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] }) }),
      h === "table" && /* @__PURE__ */ t(Le, { content: r, streaming: a }),
      (h === "code" || h === "html" && !1) && /* @__PURE__ */ n("pre", { className: "meso-artifact__code", children: [
        u && !a ? /* @__PURE__ */ t("code", { dangerouslySetInnerHTML: { __html: u } }) : /* @__PURE__ */ t("code", { children: r }),
        a && /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] })
    ] })
  ] });
}
function Le({ content: e, streaming: r }) {
  const s = Se(e);
  return s ? /* @__PURE__ */ t("div", { className: "meso-artifact__table-wrap", children: /* @__PURE__ */ n("table", { className: "meso-artifact__table", children: [
    /* @__PURE__ */ t("thead", { children: /* @__PURE__ */ t("tr", { children: s.headers.map((a, l) => /* @__PURE__ */ t("th", { children: a }, l)) }) }),
    /* @__PURE__ */ t("tbody", { children: s.rows.map((a, l) => /* @__PURE__ */ t("tr", { children: a.map((o, c) => /* @__PURE__ */ t("td", { children: String(o) }, c)) }, l)) })
  ] }) }) : /* @__PURE__ */ n("pre", { className: "meso-artifact__code", children: [
    /* @__PURE__ */ t("code", { children: e }),
    r && /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
  ] });
}
function $e(e, r) {
  return e === "html" ? "HTML 预览" : e === "mermaid" ? "图表" : e === "markdown" ? "Markdown" : e === "table" ? "表格" : r || "Code";
}
const Oe = {
  running: "进行中",
  done: "完成",
  error: "失败",
  pending: "等待",
  warning: "警告"
};
function j({
  status: e,
  size: r = 16,
  className: s,
  "aria-label": a
}) {
  const l = a ?? Oe[e];
  return /* @__PURE__ */ n(
    "span",
    {
      className: `meso-status-icon meso-status-icon--${e}${s ? ` ${s}` : ""}`,
      style: { width: r, height: r },
      role: "img",
      "aria-label": l,
      children: [
        e === "running" && /* @__PURE__ */ n("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ t("circle", { cx: "8", cy: "8", r: "6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeDasharray: "3 3", className: "meso-status-icon__spin" }),
          /* @__PURE__ */ t("circle", { cx: "8", cy: "8", r: "2.5", fill: "currentColor", className: "meso-status-icon__pulse" })
        ] }),
        e === "done" && /* @__PURE__ */ n("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ t("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ t("polyline", { points: "4.5,8 7,10.5 11.5,5.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
        ] }),
        e === "error" && /* @__PURE__ */ n("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ t("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ t("line", { x1: "5.5", y1: "5.5", x2: "10.5", y2: "10.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" }),
          /* @__PURE__ */ t("line", { x1: "10.5", y1: "5.5", x2: "5.5", y2: "10.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" })
        ] }),
        e === "pending" && /* @__PURE__ */ t("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ t("circle", { cx: "8", cy: "8", r: "6.25", stroke: "currentColor", strokeWidth: "1.5" }) }),
        e === "warning" && /* @__PURE__ */ n("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ t("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ t("line", { x1: "8", y1: "5", x2: "8", y2: "9", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" }),
          /* @__PURE__ */ t("circle", { cx: "8", cy: "11.5", r: "0.75", fill: "white" })
        ] })
      ]
    }
  );
}
function Te(e) {
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
function Ee({ stages: e, compact: r = !1 }) {
  return e.length === 0 ? null : /* @__PURE__ */ t("div", { className: `meso-stages${r ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: e.map((s, a) => /* @__PURE__ */ n(
    "div",
    {
      className: `meso-stage meso-stage--${s.status}`,
      children: [
        /* @__PURE__ */ t("div", { className: "meso-stage__dot", children: /* @__PURE__ */ t(j, { status: Te(s.status), size: 10 }) }),
        a < e.length - 1 && /* @__PURE__ */ t("div", { className: `meso-stage__line${s.status === "done" ? " meso-stage__line--done" : ""}` }),
        /* @__PURE__ */ t("span", { className: `meso-stage__label${r ? " meso-stage__label--compact" : ""}`, children: s.label })
      ]
    },
    s.id
  )) });
}
function Ie(e) {
  const { nodes: r, nodeOrder: s } = e, a = /* @__PURE__ */ new Map();
  for (const i of s) {
    const m = r[i];
    if (!m) continue;
    const _ = m.parent_id ?? null;
    a.has(_) || a.set(_, []), a.get(_).push(i);
  }
  const l = /* @__PURE__ */ new Map();
  for (const [, i] of a)
    if (i.length > 1)
      for (const m of i) l.set(m, i);
  const o = [], c = /* @__PURE__ */ new Set();
  for (const i of s) {
    if (c.has(i)) continue;
    const m = r[i];
    if (!m) continue;
    const _ = l.get(i);
    if (_) {
      const d = _.map((h) => r[h]).filter((h) => !!h);
      for (const h of d) c.add(h.node_id);
      o.push({ kind: "parallel", nodes: d, isLast: !1 });
    } else
      c.add(i), o.push({ kind: "node", node: m, isLast: !1 });
  }
  return o.length > 0 && (o[o.length - 1] = { ...o[o.length - 1], isLast: !0 }), o;
}
function Re(e) {
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
  return /* @__PURE__ */ t(
    j,
    {
      status: Re(e),
      size: 12,
      className: `meso-wf-node__icon meso-wf-node__icon--${e}`
    }
  );
}
function de(e) {
  return e < 1e3 ? `${e}ms` : `${(e / 1e3).toFixed(1)}s`;
}
function Me({ node: e, isLast: r }) {
  var o;
  const [s, a] = $(!1), l = e.metadata && Object.keys(e.metadata).length > 0;
  return /* @__PURE__ */ n("div", { className: `meso-wf-node meso-wf-node--${e.state}`, children: [
    /* @__PURE__ */ n("div", { className: "meso-wf-node__track", children: [
      /* @__PURE__ */ t("div", { className: "meso-wf-node__dot", children: /* @__PURE__ */ t(ie, { state: e.state }) }),
      !r && /* @__PURE__ */ t("div", { className: "meso-wf-node__line" })
    ] }),
    /* @__PURE__ */ n("div", { className: "meso-wf-node__body", children: [
      /* @__PURE__ */ n("div", { className: "meso-wf-node__header", children: [
        /* @__PURE__ */ t("code", { className: "meso-wf-node__name", children: e.name }),
        e.duration_ms !== void 0 && /* @__PURE__ */ t("span", { className: "meso-wf-node__duration", children: de(e.duration_ms) }),
        l && /* @__PURE__ */ t(
          "button",
          {
            className: "meso-wf-node__expand",
            onClick: () => a((c) => !c),
            "aria-expanded": s,
            "aria-label": s ? "收起详情" : "展开详情",
            children: /* @__PURE__ */ t("svg", { viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", style: { transform: s ? "rotate(180deg)" : void 0 }, children: /* @__PURE__ */ t("polyline", { points: "2,3.5 5,6.5 8,3.5" }) })
          }
        )
      ] }),
      e.state === "error" && !!((o = e.metadata) != null && o.error) && /* @__PURE__ */ t("div", { className: "meso-wf-node__error", children: String(e.metadata.error) }),
      s && l && /* @__PURE__ */ t("pre", { className: "meso-wf-node__meta", children: JSON.stringify(e.metadata, null, 2) })
    ] })
  ] });
}
function Ae({ nodes: e, isLast: r }) {
  return /* @__PURE__ */ n("div", { className: "meso-wf-parallel", children: [
    /* @__PURE__ */ t("div", { className: "meso-wf-parallel__row", children: e.map((s, a) => {
      var l;
      return /* @__PURE__ */ n("div", { className: `meso-wf-parallel__branch meso-wf-parallel__branch--${s.state}`, children: [
        /* @__PURE__ */ t("div", { className: "meso-wf-parallel__branch-dot", children: /* @__PURE__ */ t(ie, { state: s.state }) }),
        /* @__PURE__ */ n("div", { className: "meso-wf-parallel__branch-body", children: [
          /* @__PURE__ */ n("div", { className: "meso-wf-parallel__branch-label", children: [
            "并行分支 ",
            String.fromCharCode(65 + a)
          ] }),
          /* @__PURE__ */ t("code", { className: "meso-wf-node__name", children: s.name }),
          s.state === "error" && !!((l = s.metadata) != null && l.error) && /* @__PURE__ */ t("div", { className: "meso-wf-node__error", children: String(s.metadata.error) }),
          s.duration_ms !== void 0 && /* @__PURE__ */ t("span", { className: "meso-wf-node__duration", style: { display: "block", marginTop: 2 }, children: de(s.duration_ms) })
        ] })
      ] }, s.node_id);
    }) }),
    !r && /* @__PURE__ */ t("div", { className: "meso-wf-parallel__merge" })
  ] });
}
function Be({ runs: e, showRunId: r = !0, hidden: s }) {
  if (e.length === 0 || s) return null;
  const a = e.length > 1;
  return /* @__PURE__ */ t("div", { className: "meso-wf", role: "status", "aria-label": "工作流进度", children: e.map((l) => {
    const o = Ie(l);
    return /* @__PURE__ */ n("div", { className: "meso-wf-run", children: [
      a && r && /* @__PURE__ */ t("div", { className: "meso-wf-run__label", children: l.run_id }),
      o.map(
        (c, i) => c.kind === "parallel" ? /* @__PURE__ */ t(Ae, { nodes: c.nodes, isLast: c.isLast }, `parallel-${i}`) : /* @__PURE__ */ t(Me, { node: c.node, isLast: c.isLast }, c.node.node_id)
      )
    ] }, l.run_id);
  }) });
}
function me({ soul: e, compact: r = !1 }) {
  const s = e.name.charAt(0);
  return /* @__PURE__ */ n(
    "div",
    {
      className: `meso-soul${r ? " meso-soul--compact" : ""}`,
      title: `${e.name} v${e.version}`,
      role: "status",
      "aria-label": `当前 Soul: ${e.name}`,
      children: [
        /* @__PURE__ */ t("div", { className: "meso-soul__avatar", children: e.avatar ? /* @__PURE__ */ t("img", { src: e.avatar, alt: e.name, className: "meso-soul__img" }) : /* @__PURE__ */ t("span", { className: "meso-soul__initial", children: s }) }),
        !r && /* @__PURE__ */ n(A, { children: [
          /* @__PURE__ */ t("span", { className: "meso-soul__name", children: e.name }),
          e.traits && e.traits.length > 0 && /* @__PURE__ */ t("div", { className: "meso-soul__traits", children: e.traits.map((a) => /* @__PURE__ */ t("span", { className: "meso-soul__trait", children: a }, a)) })
        ] })
      ]
    }
  );
}
const De = {
  mcp: "MCP",
  api: "API"
};
function ue({ skill: e }) {
  const r = e.provider ? De[e.provider] : null;
  return /* @__PURE__ */ n(
    "div",
    {
      className: "meso-skill",
      title: e.description ?? e.name,
      role: "status",
      "aria-label": `当前技能: ${e.name}`,
      children: [
        /* @__PURE__ */ t("svg", { className: "meso-skill__icon", width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ t(
          "path",
          {
            d: "M6 1L7.5 4.5H11L8 6.5L9 10L6 8L3 10L4 6.5L1 4.5H4.5L6 1Z",
            stroke: "currentColor",
            strokeWidth: "1.2",
            strokeLinejoin: "round"
          }
        ) }),
        /* @__PURE__ */ t("span", { className: "meso-skill__name", children: e.name }),
        e.focus && e.focus.length > 0 && /* @__PURE__ */ n("span", { className: "meso-skill__focus", children: [
          "· ",
          e.focus.join(", ")
        ] }),
        r && /* @__PURE__ */ t("span", { className: "meso-skill__provider", children: r })
      ]
    }
  );
}
const We = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function Pe({ toolCall: e, onConfirm: r, onCancel: s }) {
  const a = e.risk ?? "safe", l = We[a], o = Object.keys(e.args).length > 0;
  return /* @__PURE__ */ n("div", { className: `meso-confirm-gate meso-confirm-gate--${a}`, role: "alertdialog", "aria-label": "工具执行确认", "data-testid": "meso-confirm-gate", children: [
    /* @__PURE__ */ t("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ n("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ t("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ t("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ n("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ n("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ t("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${a}`, children: l.label }),
        /* @__PURE__ */ t("code", { className: "meso-confirm-gate__tool-name", children: e.name })
      ] }),
      o && /* @__PURE__ */ t("pre", { className: "meso-confirm-gate__args", children: JSON.stringify(e.args, null, 2) }),
      /* @__PURE__ */ n("div", { className: "meso-confirm-gate__actions", children: [
        /* @__PURE__ */ t(
          "button",
          {
            className: "meso-confirm-gate__btn meso-confirm-gate__btn--cancel",
            onClick: () => s(e.id),
            children: "取消"
          }
        ),
        /* @__PURE__ */ t(
          "button",
          {
            className: `meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${a}`,
            onClick: () => r(e.id),
            children: l.confirmText
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
function ze(e) {
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
const Ke = {
  safe: "只读",
  write: "写入",
  destructive: "危险"
}, oe = {
  mcp: "MCP",
  api: "API",
  local: "本地"
};
function he({ toolCall: e, onConfirm: r, onCancel: s, className: a, "data-testid": l, simplify: o }) {
  var H, P;
  const { call: c, result: i, status: m } = e, _ = c.risk ?? "safe", d = Object.keys(c.args).length > 0, h = (o == null ? void 0 : o.verbosity) ?? (o != null && o.compact ? "compact" : "standard"), g = h === "compact", N = h === "standard", k = h === "detailed", p = (o == null ? void 0 : o.showDuration) ?? !0, f = (o == null ? void 0 : o.showProvider) ?? !g, u = (o == null ? void 0 : o.showRiskLevel) ?? (N || k), v = (o == null ? void 0 : o.showExecutionTimeline) ?? k, y = (o == null ? void 0 : o.defaultParamsCollapsed) ?? (g || N), w = (o == null ? void 0 : o.defaultOutputCollapsed) ?? (g || N), S = (o == null ? void 0 : o.defaultMetadataCollapsed) ?? (g || N), [C, x] = $(!y), [b, T] = $(!w), [B, z] = $(!S), D = (H = i == null ? void 0 : i.metadata) == null ? void 0 : H.resultCount, W = i == null ? void 0 : i.narration;
  return /* @__PURE__ */ n(
    "div",
    {
      className: `meso-tool meso-tool--${m} meso-tool--risk-${_} meso-tool--${h}${a ? ` ${a}` : ""}`,
      "data-testid": l ?? "meso-tool-call-block",
      children: [
        /* @__PURE__ */ n("div", { className: "meso-tool__header", children: [
          /* @__PURE__ */ t(j, { status: je(m), size: 14, className: "meso-tool__status-icon" }),
          /* @__PURE__ */ t("span", { className: "meso-tool__name", children: c.name }),
          D !== void 0 && /* @__PURE__ */ n("span", { className: "meso-tool__summary", children: [
            "— ",
            D,
            " 项"
          ] }),
          p && (i == null ? void 0 : i.duration_ms) !== void 0 && /* @__PURE__ */ n("span", { className: "meso-tool__duration", children: [
            "(",
            i.duration_ms,
            "ms)"
          ] }),
          u && _ !== "safe" && /* @__PURE__ */ t("span", { className: `meso-tool__risk meso-tool__risk--${_}`, children: Ke[_] }),
          f && c.provider && oe[c.provider] && /* @__PURE__ */ t("span", { className: `meso-tool__provider meso-tool__provider--${c.provider}`, children: oe[c.provider] }),
          ((P = c.annotations) == null ? void 0 : P.open_world) && /* @__PURE__ */ t("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", children: "🌐" })
        ] }),
        W && /* @__PURE__ */ t("div", { className: "meso-tool__narration", children: W }),
        d && /* @__PURE__ */ n("details", { className: "meso-tool__params-details", open: C, children: [
          /* @__PURE__ */ t(
            "summary",
            {
              className: "meso-tool__params-summary",
              onClick: (O) => {
                O.preventDefault(), x((M) => !M);
              },
              children: /* @__PURE__ */ n("span", { className: "meso-tool__params-toggle", children: [
                C ? "▾" : "▸",
                " Input Parameters"
              ] })
            }
          ),
          C && /* @__PURE__ */ t("pre", { className: "meso-tool__args", children: JSON.stringify(c.args, null, k ? 2 : 1) })
        ] }),
        m === "awaiting_confirm" && r && s && /* @__PURE__ */ t(
          Pe,
          {
            toolCall: c,
            onConfirm: r,
            onCancel: s
          }
        ),
        (m === "done" || m === "error") && i && /* @__PURE__ */ n("details", { className: "meso-tool__result-details", open: b, children: [
          /* @__PURE__ */ t(
            "summary",
            {
              className: "meso-tool__result-summary",
              onClick: (O) => {
                O.preventDefault(), T((M) => !M);
              },
              children: /* @__PURE__ */ n("span", { className: "meso-tool__result-toggle", children: [
                b ? "▾" : "▸",
                " ",
                m === "error" ? "Error" : "Output"
              ] })
            }
          ),
          b && /* @__PURE__ */ t("pre", { className: `meso-tool__output${m === "error" ? " meso-tool__output--error" : ""}`, children: m === "error" ? i.error : k ? i.output : i.output.slice(0, 200) + (i.output.length > 200 ? "..." : "") })
        ] }),
        (i == null ? void 0 : i.metadata) && /* @__PURE__ */ n("details", { className: "meso-tool__metadata-details", open: B, children: [
          /* @__PURE__ */ t(
            "summary",
            {
              className: "meso-tool__metadata-summary",
              onClick: (O) => {
                O.preventDefault(), z((M) => !M);
              },
              children: /* @__PURE__ */ n("span", { className: "meso-tool__metadata-toggle", children: [
                B ? "▾" : "▸",
                " Metadata"
              ] })
            }
          ),
          B && /* @__PURE__ */ n("div", { className: "meso-tool__metadata", children: [
            i.metadata.resultCount !== void 0 && /* @__PURE__ */ n("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-key", children: "resultCount:" }),
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-value", children: i.metadata.resultCount })
            ] }),
            i.metadata.category !== void 0 && /* @__PURE__ */ n("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-key", children: "category:" }),
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-value", children: i.metadata.category })
            ] }),
            k && i.metadata.custom && /* @__PURE__ */ n("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-key", children: "custom:" }),
              /* @__PURE__ */ t("pre", { className: "meso-tool__metadata-custom", children: JSON.stringify(i.metadata.custom, null, 2) })
            ] })
          ] })
        ] }),
        k && v && (i == null ? void 0 : i.duration_ms) && /* @__PURE__ */ n("details", { className: "meso-tool__timeline-details", open: !1, children: [
          /* @__PURE__ */ t("summary", { className: "meso-tool__timeline-summary", children: "Execution Timeline" }),
          /* @__PURE__ */ t("div", { className: "meso-tool__timeline", children: /* @__PURE__ */ n("div", { className: "meso-tool__timeline-row", children: [
            /* @__PURE__ */ t("span", { className: "meso-tool__timeline-label", children: "Duration:" }),
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
function q({
  stream: e,
  defaultExpanded: r = "none",
  expandCount: s = 2,
  onlyShowCurrent: a = !1,
  simplify: l,
  onToolClick: o,
  onToolConfirm: c,
  onToolCancel: i,
  renderSummary: m
}) {
  const _ = e.toolCallOrder, d = a && _.length > 0 ? [_[_.length - 1]] : _, [h, g] = $(() => {
    if (r === "none") return /* @__PURE__ */ new Set();
    if (r === "all") return new Set(d);
    if (r === "current" && d.length > 0)
      return /* @__PURE__ */ new Set([d[d.length - 1]]);
    if (r === "last-n" && d.length > 0) {
      const p = d.slice(-s);
      return new Set(p);
    }
    return /* @__PURE__ */ new Set();
  }), N = (p) => {
    const f = new Set(h);
    f.has(p) ? f.delete(p) : f.add(p), g(f), o == null || o(p);
  }, k = (p, f) => {
    var b;
    const { call: u, result: v, status: y } = p;
    if (m)
      return String(m(p, f) ?? "");
    const w = y === "error" ? "✗" : "✓", S = u.name, C = (b = v == null ? void 0 : v.metadata) != null && b.resultCount ? ` — ${v.metadata.resultCount} 项` : "", x = v != null && v.duration_ms ? ` (${v.duration_ms}ms)` : "";
    return `${w} ${S}${C}${x}`;
  };
  return d.length === 0 ? null : /* @__PURE__ */ t("div", { className: "meso-collapsible-tool-trace", children: d.map((p, f) => {
    const u = e.toolCalls[p];
    if (!u) return null;
    const v = h.has(p), { status: y } = u;
    return /* @__PURE__ */ n("div", { className: `meso-collapsible-tool__item meso-collapsible-tool__item--${y}`, children: [
      /* @__PURE__ */ n(
        "button",
        {
          className: "meso-collapsible-tool__summary",
          onClick: () => N(p),
          "aria-expanded": v,
          children: [
            /* @__PURE__ */ t("span", { className: "meso-collapsible-tool__toggle", children: v ? "▼" : "▶" }),
            /* @__PURE__ */ t("span", { className: "meso-collapsible-tool__text", children: k(u, f) })
          ]
        }
      ),
      v && /* @__PURE__ */ t("div", { className: "meso-collapsible-tool__details", children: /* @__PURE__ */ t(
        he,
        {
          toolCall: u,
          onConfirm: c,
          onCancel: i,
          simplify: l
        }
      ) })
    ] }, p);
  }) });
}
function Y(e) {
  return e === "html" || e === "html preview" ? { type: "html" } : e === "mermaid" ? { type: "mermaid" } : e === "markdown" ? { type: "markdown" } : e === "table" ? { type: "table" } : { type: "code", language: e };
}
function _e(e) {
  const r = e.toolCallOrder, s = r.length - 1, a = r.slice(0, s).filter((o) => e.toolCalls[o].result !== void 0), l = r[s];
  return { frozenIds: a, currentId: l };
}
function Ue({
  stream: e,
  onToolConfirm: r,
  onToolCancel: s
}) {
  const { frozenIds: a, currentId: l } = ne(
    () => _e(e),
    [e.toolCallOrder, e.toolCalls]
  );
  return e.toolCallOrder.length === 0 ? null : /* @__PURE__ */ n(A, { children: [
    a.length > 0 && /* @__PURE__ */ t("div", { className: "meso-message-list__frozen-tools", children: /* @__PURE__ */ t(
      q,
      {
        stream: {
          ...e,
          toolCallOrder: a
        },
        streaming: !1,
        defaultExpanded: "all",
        simplify: void 0
      }
    ) }),
    l && /* @__PURE__ */ t("div", { className: "meso-message-list__current-tool", children: /* @__PURE__ */ t(
      q,
      {
        stream: {
          ...e,
          toolCallOrder: [l]
        },
        streaming: e.status === "streaming",
        defaultExpanded: "all",
        simplify: void 0,
        onToolConfirm: r,
        onToolCancel: s
      }
    ) })
  ] });
}
function Ve({
  stream: e,
  onToolConfirm: r,
  onToolCancel: s,
  renderExtension: a,
  onArtifactCopy: l,
  onArtifactDownload: o,
  renderMermaid: c,
  highlightCode: i,
  renderMarkdown: m,
  hiddenArtifactLangs: _
}) {
  const { frozenIds: d, currentId: h } = ne(
    () => _e(e),
    [e.toolCallOrder, e.toolCalls]
  ), g = new Set(d);
  return /* @__PURE__ */ n("div", { className: "meso-message-list__interleaved", children: [
    (e.activeSoul || e.activeSkill) && /* @__PURE__ */ n("div", { className: "meso-message-list__context-row", children: [
      e.activeSoul && /* @__PURE__ */ t(me, { soul: e.activeSoul }),
      e.activeSkill && /* @__PURE__ */ t(ue, { skill: e.activeSkill })
    ] }),
    e.eventLog.map((N) => {
      const { type: k, id: p } = N;
      switch (k) {
        case "text": {
          const f = e.textChunks.find((u) => u.id === p);
          return f ? /* @__PURE__ */ t("div", { className: "meso-event-text", children: f.delta }, `text-${p}`) : null;
        }
        case "tool_call": {
          if (!e.toolCalls[p]) return null;
          const u = g.has(p), v = p === h;
          return /* @__PURE__ */ t(
            "div",
            {
              className: `meso-event-tool meso-event-tool--${u ? "frozen" : "current"}`,
              children: /* @__PURE__ */ t(
                q,
                {
                  stream: {
                    ...e,
                    toolCallOrder: [p]
                  },
                  streaming: v && e.status === "streaming",
                  defaultExpanded: v ? "all" : "none",
                  simplify: void 0,
                  onToolConfirm: v ? r : void 0,
                  onToolCancel: v ? s : void 0
                }
              )
            },
            `tool-${p}`
          );
        }
        case "artifact": {
          const f = e.artifacts[p];
          if (!f || _ != null && _.includes(f.lang)) return null;
          const { type: u, language: v } = Y(f.lang);
          return /* @__PURE__ */ t("div", { className: "meso-event-artifact", children: /* @__PURE__ */ t(
            J,
            {
              type: u,
              content: f.content,
              language: v,
              streaming: !f.done,
              onCopy: l,
              onDownload: o,
              renderMermaid: c,
              highlightCode: i,
              renderMarkdown: m
            }
          ) }, `artifact-${p}`);
        }
        default:
          return null;
      }
    }),
    a && e.extensionLog.length > 0 && /* @__PURE__ */ t("div", { className: "meso-message-list__extensions", children: e.extensionLog.map((N, k) => /* @__PURE__ */ t(F.Fragment, { children: a(N) }, k)) }),
    e.memorySaved.length > 0 && /* @__PURE__ */ t("div", { className: "meso-memory-saved", children: e.memorySaved.map((N) => /* @__PURE__ */ n("span", { className: "meso-memory-saved__chip", title: N.preview, children: [
      /* @__PURE__ */ t("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ t("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
      "已记忆 [",
      N.category,
      "]"
    ] }, N.id)) })
  ] });
}
function lt({
  messages: e,
  streaming: r,
  onArtifactCopy: s,
  onArtifactDownload: a,
  onToolConfirm: l,
  onToolCancel: o,
  emptyState: c,
  emptyStateAlign: i = "center",
  className: m,
  renderExtension: _,
  renderLiveTrace: d,
  renderMarkdown: h,
  renderMermaid: g,
  highlightCode: N,
  hiddenArtifactLangs: k,
  renderingMode: p
}) {
  const f = I(null), u = p !== "block", v = p || "blend";
  R(() => {
    var w;
    (w = f.current) == null || w.scrollIntoView({ behavior: "smooth" });
  }, [e, r]), R(() => {
    if (!r || r.status !== "done") return;
    const w = document.querySelector(".meso-message-list__live");
    if (!w) return;
    w.querySelectorAll('[data-streaming-role="content"]').forEach((C) => {
      C.contentEditable = "false", C.dataset.frozen = "true";
    });
  }, [r == null ? void 0 : r.status]);
  const y = e.length > 0 || r && r.status !== "idle";
  return /* @__PURE__ */ t("div", { className: `meso-message-list meso-message-list--mode-${v}${m ? ` ${m}` : ""}`, children: /* @__PURE__ */ n("div", { className: "meso-message-list__inner", children: [
    !y && c && /* @__PURE__ */ t("div", { className: `meso-message-list__empty${i === "top" ? " meso-message-list__empty--top" : ""}`, children: c }),
    e.map((w) => /* @__PURE__ */ n(F.Fragment, { children: [
      /* @__PURE__ */ t(
        ae,
        {
          role: w.role,
          content: w.content,
          timestamp: w.timestamp,
          markdown: w.role === "assistant",
          renderMarkdown: h
        }
      ),
      w.artifacts && w.artifacts.length > 0 && w.artifacts.map((S) => {
        const { type: C, language: x } = Y(S.lang);
        return /* @__PURE__ */ t(
          J,
          {
            type: C,
            content: S.content,
            language: x,
            onCopy: s,
            onDownload: a,
            renderMermaid: g,
            highlightCode: N,
            renderMarkdown: h
          },
          S.id
        );
      })
    ] }, w.id)),
    r && r.status !== "idle" && /* @__PURE__ */ t("div", { className: "meso-message-list__live", children: d ? d(r) : /* @__PURE__ */ t(A, { children: u ? /* @__PURE__ */ t(
      Ve,
      {
        stream: r,
        onToolConfirm: l,
        onToolCancel: o,
        renderExtension: _,
        onArtifactCopy: s,
        onArtifactDownload: a,
        renderMermaid: g,
        highlightCode: N,
        renderMarkdown: h,
        hiddenArtifactLangs: k
      }
    ) : /* @__PURE__ */ n(A, { children: [
      (r.activeSoul || r.activeSkill) && /* @__PURE__ */ n("div", { className: "meso-message-list__context-row", children: [
        r.activeSoul && /* @__PURE__ */ t(me, { soul: r.activeSoul }),
        r.activeSkill && /* @__PURE__ */ t(ue, { skill: r.activeSkill })
      ] }),
      /* @__PURE__ */ t(
        Ue,
        {
          stream: r,
          onToolConfirm: l,
          onToolCancel: o
        }
      ),
      _ && r.extensionLog.length > 0 && /* @__PURE__ */ t("div", { className: "meso-message-list__extensions", children: r.extensionLog.map((w, S) => /* @__PURE__ */ t(F.Fragment, { children: _(w) }, S)) }),
      (r.textContent || r.status === "streaming") && /* @__PURE__ */ t(
        ae,
        {
          role: "assistant",
          content: r.textContent,
          streaming: r.status === "streaming" && r.artifactOrder.length === 0,
          markdown: !0,
          renderMarkdown: h
        }
      ),
      r.artifactOrder.map((w) => {
        const S = r.artifacts[w];
        if (!S || k != null && k.includes(S.lang)) return null;
        const { type: C, language: x } = Y(S.lang);
        return /* @__PURE__ */ t(
          J,
          {
            type: C,
            content: S.content,
            language: x,
            streaming: !S.done,
            onCopy: s,
            onDownload: a,
            renderMermaid: g,
            highlightCode: N,
            renderMarkdown: h
          },
          w
        );
      }),
      r.memorySaved.length > 0 && /* @__PURE__ */ t("div", { className: "meso-memory-saved", children: r.memorySaved.map((w) => /* @__PURE__ */ n("span", { className: "meso-memory-saved__chip", title: w.preview, children: [
        /* @__PURE__ */ t("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ t("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        w.category,
        "]"
      ] }, w.id)) })
    ] }) }) }),
    /* @__PURE__ */ t("div", { ref: f })
  ] }) });
}
function Fe({ resourceRead: e, className: r }) {
  const [s, a] = $(!1), { read: l, content: o, status: c } = e, i = l.name ?? l.uri, m = l.server;
  return /* @__PURE__ */ n("div", { className: `meso-resource meso-resource--${c}${r ? ` ${r}` : ""}`, children: [
    /* @__PURE__ */ n("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ t(j, { status: ze(c), size: 13, className: "meso-resource__status-icon" }),
      /* @__PURE__ */ t("span", { className: "meso-resource__uri", title: l.uri, children: i }),
      m && /* @__PURE__ */ t("span", { className: "meso-resource__server", children: m }),
      (o == null ? void 0 : o.duration_ms) !== void 0 && /* @__PURE__ */ n("span", { className: "meso-resource__duration", children: [
        o.duration_ms,
        "ms"
      ] }),
      (c === "done" || c === "error") && o && /* @__PURE__ */ n(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => a((_) => !_),
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
    s && o && /* @__PURE__ */ t("div", { className: "meso-resource__content", children: c === "error" ? /* @__PURE__ */ t("pre", { className: "meso-resource__text meso-resource__text--error", children: o.error }) : o.contents.map((_, d) => /* @__PURE__ */ n("div", { children: [
      _.type === "text" && /* @__PURE__ */ t("pre", { className: "meso-resource__text", children: _.text }),
      _.type === "image" && _.data && /* @__PURE__ */ t(
        "img",
        {
          className: "meso-resource__image",
          src: `data:${_.mime_type ?? "image/png"};base64,${_.data}`,
          alt: "resource"
        }
      ),
      _.type === "blob" && /* @__PURE__ */ n("span", { className: "meso-resource__blob-label", children: [
        "[",
        _.mime_type ?? "binary",
        "]"
      ] })
    ] }, d)) })
  ] });
}
function ct({
  value: e,
  onChange: r,
  onSubmit: s,
  onStop: a,
  streaming: l = !1,
  disabled: o = !1,
  placeholder: c = "输入消息… (Ctrl+Enter 发送，Enter 换行)",
  leadingSlot: i,
  trailingActions: m,
  maxRows: _ = 8
}) {
  const d = I(null), h = 22, g = () => {
    const f = d.current;
    f && (f.style.height = "auto", f.style.height = Math.min(f.scrollHeight, h * _) + "px");
  };
  R(g, [e]);
  const N = (f) => {
    f.key === "Enter" && (f.ctrlKey || f.metaKey) && (f.preventDefault(), !o && !l && e.trim() && s());
  }, k = !o && !l && e.trim().length > 0, p = /* @__PURE__ */ t(
    "button",
    {
      className: `meso-composer__send${l ? " meso-composer__send--stop" : ""}`,
      onClick: l ? a : s,
      disabled: l ? !1 : !k,
      "aria-label": l ? "停止生成" : "发送",
      title: l ? "停止生成" : "Ctrl+Enter",
      children: l ? (
        /* Stop square */
        /* @__PURE__ */ t("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ t("rect", { x: "4", y: "4", width: "16", height: "16", rx: "2" }) })
      ) : (
        /* Send arrow */
        /* @__PURE__ */ n("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ t("line", { x1: "12", y1: "19", x2: "12", y2: "5" }),
          /* @__PURE__ */ t("polyline", { points: "5,12 12,5 19,12" })
        ] })
      )
    }
  );
  return /* @__PURE__ */ t("div", { className: "meso-composer", children: /* @__PURE__ */ n("div", { className: "meso-composer__box", children: [
    /* @__PURE__ */ t(
      "textarea",
      {
        ref: d,
        className: "meso-composer__textarea",
        value: e,
        onChange: (f) => {
          r(f.target.value), g();
        },
        onKeyDown: N,
        placeholder: c,
        rows: 1,
        disabled: o && !l,
        "aria-label": "消息输入框"
      }
    ),
    /* @__PURE__ */ n("div", { className: "meso-composer__toolbar", children: [
      /* @__PURE__ */ t("div", { className: "meso-composer__leading", children: i }),
      /* @__PURE__ */ t("span", { className: "meso-composer__hint", children: e.length > 0 && `${e.length} 字` }),
      /* @__PURE__ */ t("div", { className: "meso-composer__trailing", children: m ?? p })
    ] })
  ] }) });
}
function fe({
  system: e,
  resetOnTurnStart: r = !1
}) {
  const [s, a] = $(null), l = I(e);
  return R(() => {
    r && !l.current && e && a(null), l.current = e;
  }, [e, r]), {
    open: s !== null ? s : e,
    setOpen: (c) => a(c),
    toggle: () => a((c) => c !== null ? !c : !e),
    clearIntent: () => a(null),
    hasUserIntent: s !== null
  };
}
function Ge(e) {
  const r = /* @__PURE__ */ new Map(), s = [];
  for (const a of e.toolCallOrder) {
    const l = e.toolCalls[a];
    if (!l) continue;
    const o = l.groupId ? `${l.groupKind ?? "group"}:${l.groupId}` : `__single__:${a}`;
    r.has(o) || (r.set(o, {
      key: o,
      groupId: l.groupId,
      groupKind: l.groupKind,
      ids: []
    }), s.push(o)), r.get(o).ids.push(a);
  }
  return s.map((a) => r.get(a));
}
function Je(e) {
  const r = e.toolCallOrder.length + e.workflowRunOrder.reduce(
    (l, o) => {
      var c;
      return l + (((c = e.workflowRuns[o]) == null ? void 0 : c.nodeOrder.length) ?? 0);
    },
    0
  ), s = e.toolCallOrder.filter((l) => {
    var o;
    return ((o = e.toolCalls[l]) == null ? void 0 : o.status) === "error";
  }).length + e.workflowRunOrder.reduce((l, o) => {
    const c = e.workflowRuns[o];
    return c ? l + c.nodeOrder.filter((i) => {
      var m;
      return ((m = c.nodes[i]) == null ? void 0 : m.state) === "error";
    }).length : l;
  }, 0), a = [];
  return e.phaseOrder.length > 0 && a.push(`${e.phaseOrder.length} 阶段`), r > 0 && a.push(`${r} 步`), s > 0 && a.push(`${s} 项失败`), a.length > 0 ? a.join(" · ") : "执行过程";
}
function qe(e, r) {
  const s = !!(e.thinkContent || e.pinnedThink);
  return /* @__PURE__ */ n("div", { className: "meso-process-trace__phase", "data-testid": `meso-phase-${e.id}`, children: [
    /* @__PURE__ */ n("div", { className: "meso-process-trace__phase-header", children: [
      /* @__PURE__ */ t(j, { status: He(e.state), size: 14 }),
      /* @__PURE__ */ t("span", { className: "meso-process-trace__phase-name", children: e.name })
    ] }),
    s && /* @__PURE__ */ t(
      ce,
      {
        content: e.thinkContent,
        pinnedContent: e.pinnedThink,
        streaming: r && e.state === "running",
        collapseWhen: "never",
        defaultOpen: !0
      }
    ),
    e.body && /* @__PURE__ */ t("div", { className: "meso-process-trace__phase-body", children: e.body })
  ] });
}
function it({
  stream: e,
  streaming: r = !1,
  turnStreaming: s = !1,
  defaultCollapsed: a = !1,
  className: l,
  onToolConfirm: o,
  onToolCancel: c,
  renderToolCall: i,
  renderPhase: m,
  renderWorkflow: _,
  simplify: d
}) {
  const h = fe({
    system: !a,
    resetOnTurnStart: s
  });
  if (!(!!e.thinkContent || e.phaseOrder.length > 0 || e.memorySnippets.length > 0 || e.resourceReadOrder.length > 0 || e.toolCallOrder.length > 0 || e.workflowRunOrder.length > 0)) return null;
  const N = Je(e), k = e.workflowRunOrder.map((u) => e.workflowRuns[u]).filter(Boolean), p = Ge(e), f = e.phaseOrder.map((u) => e.phases[u]).filter(Boolean).map(be);
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
              /* @__PURE__ */ t(
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
                  children: /* @__PURE__ */ t("polyline", { points: "3,5 7,9 11,5" })
                }
              ),
              /* @__PURE__ */ t("span", { className: "meso-process-trace__summary", children: N }),
              r && /* @__PURE__ */ t("span", { className: "meso-process-trace__dot", "aria-label": "执行中" })
            ]
          }
        ),
        h.open && /* @__PURE__ */ n("div", { className: "meso-process-trace__body", children: [
          f.length > 0 && /* @__PURE__ */ t(Ee, { compact: !0, stages: f }),
          e.memorySnippets.length > 0 && /* @__PURE__ */ t("div", { className: "meso-memory-chips", children: e.memorySnippets.map((u, v) => /* @__PURE__ */ n("span", { className: "meso-memory-chip", title: u.content, children: [
            "[",
            u.category,
            "] ",
            u.content
          ] }, v)) }),
          e.thinkContent && /* @__PURE__ */ t(
            ce,
            {
              content: e.thinkContent,
              streaming: r && !e.thinkDone,
              collapseWhen: "never",
              defaultOpen: !0,
              turnStreaming: s
            }
          ),
          e.phaseOrder.length > 0 && /* @__PURE__ */ t("div", { className: "meso-process-trace__phases", children: e.phaseOrder.map((u) => {
            const v = e.phases[u];
            if (!v) return null;
            const y = m == null ? void 0 : m(v);
            return y != null ? /* @__PURE__ */ t("div", { children: y }, u) : /* @__PURE__ */ t("div", { children: qe(v, r) }, u);
          }) }),
          e.resourceReadOrder.length > 0 && /* @__PURE__ */ t("div", { className: "meso-process-trace__resources", children: e.resourceReadOrder.map((u) => {
            const v = e.resourceReads[u];
            return v ? /* @__PURE__ */ t(Fe, { resourceRead: v }, u) : null;
          }) }),
          p.length > 0 && /* @__PURE__ */ t("div", { className: "meso-process-trace__tools", children: p.map((u) => /* @__PURE__ */ n(
            "div",
            {
              className: `meso-process-trace__tool-group${u.groupId ? " meso-process-trace__tool-group--grouped" : ""}`,
              "data-group-id": u.groupId,
              "data-group-kind": u.groupKind,
              children: [
                u.groupId && /* @__PURE__ */ n("div", { className: "meso-process-trace__tool-group-label", children: [
                  u.groupKind ?? "group",
                  ": ",
                  u.groupId
                ] }),
                u.ids.map((v) => {
                  const y = e.toolCalls[v];
                  if (!y) return null;
                  const w = i == null ? void 0 : i(y);
                  return w != null ? /* @__PURE__ */ t("div", { children: w }, v) : /* @__PURE__ */ t(
                    he,
                    {
                      toolCall: y,
                      onConfirm: o,
                      onCancel: c,
                      simplify: d
                    },
                    v
                  );
                })
              ]
            },
            u.key
          )) }),
          k.length > 0 && ((_ == null ? void 0 : _(e)) ?? /* @__PURE__ */ t(Be, { runs: k }))
        ] })
      ]
    }
  );
}
function dt({
  name: e,
  email: r,
  avatarText: s,
  menuItems: a = [],
  onSignOut: l
}) {
  const [o, c] = $(!1), i = I(null);
  R(() => {
    if (!o) return;
    const d = (h) => {
      i.current && !i.current.contains(h.target) && c(!1);
    };
    return document.addEventListener("mousedown", d), () => document.removeEventListener("mousedown", d);
  }, [o]);
  const m = s ?? e.charAt(0).toUpperCase(), _ = [
    ...a,
    ...l ? [{ label: "退出登录", onClick: () => {
      c(!1), l();
    }, danger: !0 }] : []
  ];
  return /* @__PURE__ */ n("div", { className: "meso-user-menu", ref: i, children: [
    o && /* @__PURE__ */ n("div", { className: "meso-user-menu__popup", role: "menu", children: [
      /* @__PURE__ */ n("div", { className: "meso-user-menu__identity", children: [
        /* @__PURE__ */ t("span", { className: "meso-user-menu__identity-name", children: e }),
        r && /* @__PURE__ */ t("span", { className: "meso-user-menu__identity-email", children: r })
      ] }),
      _.length > 0 && /* @__PURE__ */ t("div", { className: "meso-user-menu__sep", role: "separator" }),
      _.map((d, h) => /* @__PURE__ */ n(
        "button",
        {
          className: `meso-user-menu__item${d.danger ? " meso-user-menu__item--danger" : ""}`,
          role: "menuitem",
          onClick: () => {
            c(!1), d.onClick();
          },
          children: [
            d.icon && /* @__PURE__ */ t("span", { className: "meso-user-menu__item-icon", children: d.icon }),
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
        "aria-expanded": o,
        title: e,
        children: [
          /* @__PURE__ */ t("div", { className: "meso-user-menu__avatar", children: m }),
          /* @__PURE__ */ n("div", { className: "meso-user-menu__info", children: [
            /* @__PURE__ */ t("span", { className: "meso-user-menu__name", children: e }),
            r && /* @__PURE__ */ t("span", { className: "meso-user-menu__email", children: r })
          ] })
        ]
      }
    )
  ] });
}
function mt({
  tabs: e,
  activeTabId: r,
  onTabChange: s,
  autoSelectFirstReady: a = !1
}) {
  var h;
  const l = r !== void 0, [o, c] = $(((h = e[0]) == null ? void 0 : h.id) ?? ""), i = l ? r : o, m = I(!1);
  R(() => {
    if (!a || m.current) return;
    const g = e.find((N) => N.ready);
    g && (m.current = !0, l || c(g.id), s == null || s(g.id));
  }, [e, a, l, s]);
  const _ = (g) => {
    l || c(g), s == null || s(g);
  }, d = e.find((g) => g.id === i) ?? e[0];
  return e.length === 0 ? null : /* @__PURE__ */ n("div", { className: "meso-artifact-shell", children: [
    /* @__PURE__ */ t("div", { className: "meso-artifact-shell__tabs", role: "tablist", children: e.map((g) => /* @__PURE__ */ n(
      "button",
      {
        role: "tab",
        "aria-selected": g.id === i,
        className: `meso-artifact-shell__tab${g.id === i ? " meso-artifact-shell__tab--active" : ""}`,
        onClick: () => _(g.id),
        children: [
          g.label,
          g.ready === !1 && /* @__PURE__ */ t("span", { className: "meso-artifact-shell__tab-dot", "aria-label": "加载中" })
        ]
      },
      g.id
    )) }),
    /* @__PURE__ */ t("div", { className: "meso-artifact-shell__content", role: "tabpanel", children: d == null ? void 0 : d.content })
  ] });
}
function ut({ status: e, primary: r, outcome: s, detail: a, className: l, "data-testid": o }) {
  const c = a !== void 0 && a !== "", i = fe({ system: !1 });
  return /* @__PURE__ */ n("div", { className: `meso-log-line${l ? ` ${l}` : ""}`, "data-testid": o ?? "meso-log-line", children: [
    /* @__PURE__ */ n(
      "div",
      {
        className: `meso-log-line__row${c ? " meso-log-line__row--clickable" : ""}`,
        onClick: c ? i.toggle : void 0,
        role: c ? "button" : void 0,
        tabIndex: c ? 0 : void 0,
        onKeyDown: c ? (m) => {
          (m.key === "Enter" || m.key === " ") && i.toggle();
        } : void 0,
        "aria-expanded": c ? i.open : void 0,
        "aria-label": c ? `${r}，${i.open ? "折叠" : "展开"}详情` : void 0,
        children: [
          /* @__PURE__ */ t(j, { status: e, size: 14, className: "meso-log-line__icon" }),
          /* @__PURE__ */ t("span", { className: "meso-log-line__primary", children: r }),
          s && /* @__PURE__ */ t("span", { className: "meso-log-line__outcome", children: s }),
          c && /* @__PURE__ */ t(
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
              children: /* @__PURE__ */ t("polyline", { points: "2.5,4.5 6,7.5 9.5,4.5" })
            }
          )
        ]
      }
    ),
    c && i.open && /* @__PURE__ */ t("pre", { className: "meso-log-line__detail", children: a })
  ] });
}
const Ye = /* @__PURE__ */ new Set(["text", "think"]);
function Ze(e, r, s) {
  var a, l, o, c, i, m, _, d, h, g, N, k, p, f, u, v;
  if (s)
    switch (e.type) {
      case "capabilities":
        (a = s.onCapabilities) == null || a.call(s, e.payload);
        break;
      case "phase":
        (l = s.onPhaseChange) == null || l.call(s, e.payload);
        break;
      case "memory":
        (o = s.onMemoryRecalled) == null || o.call(s, e.payload.snippets);
        break;
      case "memory_saved":
        (c = s.onMemorySaved) == null || c.call(s, e.payload);
        break;
      case "soul":
        (i = s.onSoulActivated) == null || i.call(s, e.payload);
        break;
      case "skill_active":
        (m = s.onSkillActivated) == null || m.call(s, e.payload);
        break;
      case "tool_call":
        (_ = s.onToolCall) == null || _.call(s, e.payload);
        break;
      case "tool_result":
        (d = s.onToolResult) == null || d.call(s, e.payload);
        break;
      case "resource_read":
        (h = s.onResourceRead) == null || h.call(s, e.payload);
        break;
      case "resource_content":
        (g = s.onResourceContent) == null || g.call(s, e.payload);
        break;
      case "text":
        (N = s.onText) == null || N.call(s, e.payload.delta, r);
        break;
      case "think":
        (k = s.onThink) == null || k.call(s, e.payload.delta, r);
        break;
      case "artifact": {
        const y = r.artifacts[e.payload.id];
        y && ((p = s.onArtifact) == null || p.call(s, y));
        break;
      }
      case "extension":
        (f = s.onExtensionEvent) == null || f.call(s, e);
        break;
      case "error":
        (u = s.onError) == null || u.call(s, e.payload.message, e.payload.code);
        break;
      case "done":
        (v = s.onDone) == null || v.call(s, r);
        break;
    }
}
function ht(e, r) {
  const [s, a] = $(G), l = I(null), o = I(!1), c = I(r);
  c.current = r;
  const i = V(() => {
    var d;
    (d = l.current) == null || d.abort(), o.current = !1, a((h) => ({ ...h, status: "idle" }));
  }, []), m = V(() => {
    var d;
    (d = l.current) == null || d.abort(), o.current = !1, a(G());
  }, []), _ = V(async (d) => {
    var u, v, y, w, S, C;
    if (o.current) return;
    o.current = !0;
    const h = typeof (d == null ? void 0 : d.reconnect) == "object" ? d.reconnect : { maxAttempts: 3, baseDelayMs: 1e3 }, g = d != null && d.reconnect ? h.maxAttempts ?? 3 : 0, N = h.baseDelayMs ?? 1e3, k = (d == null ? void 0 : d.batchMs) === void 0 ? 16 : d.batchMs;
    let p = 0;
    const f = async () => {
      var X;
      (X = l.current) == null || X.abort();
      const x = new AbortController();
      l.current = x;
      const b = { ...G(), status: "streaming" };
      a(b);
      let T = b;
      const B = (d == null ? void 0 : d.method) ?? (d != null && d.body ? "POST" : "GET"), z = (d == null ? void 0 : d.watchdogMs) === void 0 ? 12e4 : d.watchdogMs;
      let D = null;
      const W = () => {
        D && clearTimeout(D);
      }, H = () => {
        W(), z != null && (D = setTimeout(() => {
          var E, U;
          x.abort();
          const L = `SSE stream timed out after ${z}ms of inactivity`;
          a((K) => ({ ...K, status: "error", errorMessage: L, errorCode: "WATCHDOG_TIMEOUT" })), (U = (E = c.current) == null ? void 0 : E.onError) == null || U.call(E, L, "WATCHDOG_TIMEOUT");
        }, z));
      }, P = [];
      let O = null;
      const M = (L) => {
        const E = Ce(T, L);
        if (T = E, a(E), Ze(L, E, c.current), L.type === "done" || L.type === "error")
          return W(), L.type;
      }, Q = () => {
        for (; P.length > 0; ) {
          const L = P.shift(), E = M(L);
          if (E) return E;
        }
      }, ge = (L) => {
        if (k != null && Ye.has(L.type)) {
          P.push(L), O || (O = setTimeout(() => {
            O = null, Q();
          }, k));
          return;
        }
        return M(L);
      };
      try {
        const L = await fetch(e, {
          method: B,
          headers: {
            ...B === "POST" ? { "Content-Type": "application/json" } : {},
            ...d == null ? void 0 : d.headers
          },
          body: d != null && d.body ? JSON.stringify(d.body) : void 0,
          signal: x.signal
        });
        if (!L.ok) throw new Error(`HTTP ${L.status}`);
        const E = L.body.getReader(), U = new TextDecoder();
        let K = "";
        for (H(); ; ) {
          const { done: Ne, value: we } = await E.read();
          if (Ne) break;
          H(), K += U.decode(we, { stream: !0 });
          const te = K.split(`
`);
          K = te.pop() ?? "";
          for (const ke of te) {
            const se = xe(ke);
            if (!se) continue;
            const re = ge(se);
            if (re) return re;
          }
        }
        O && (clearTimeout(O), O = null);
        const ee = Q();
        return ee || "interrupted";
      } catch (L) {
        if (L.name === "AbortError") return "interrupted";
        throw L;
      } finally {
        W(), O && clearTimeout(O);
      }
    };
    try {
      for (; ; ) {
        try {
          const x = await f();
          if (x === "done" || x === "error") return;
          if (!(d != null && d.reconnect) || p >= g) {
            const b = "SSE stream ended unexpectedly";
            a((T) => ({ ...T, status: "error", errorMessage: b, errorCode: "STREAM_ENDED" })), (v = (u = c.current) == null ? void 0 : u.onError) == null || v.call(u, b, "STREAM_ENDED");
            return;
          }
        } catch (x) {
          if (!(d != null && d.reconnect) || p >= g) {
            const b = x.message;
            a((T) => ({ ...T, status: "error", errorMessage: b })), (w = (y = c.current) == null ? void 0 : y.onError) == null || w.call(y, b);
            return;
          }
        }
        p += 1, (C = (S = c.current) == null ? void 0 : S.onReconnect) == null || C.call(S, p), await new Promise((x) => setTimeout(x, N * Math.pow(2, p - 1)));
      }
    } finally {
      o.current = !1;
    }
  }, [e]);
  return { state: s, start: _, abort: i, reset: m };
}
const pe = "meso-theme";
function Qe() {
  return typeof window > "u" ? "light" : localStorage.getItem(pe) ?? "light";
}
function Xe(e) {
  document.documentElement.setAttribute("data-theme", e), localStorage.setItem(pe, e);
}
function _t() {
  const [e, r] = $(Qe);
  R(() => {
    Xe(e);
  }, [e]);
  const s = V(() => {
    r((a) => a === "light" ? "dark" : "light");
  }, []);
  return { theme: e, toggle: s };
}
const ve = {
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
}, et = {
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
}, tt = {
  "zh-CN": ve,
  "en-US": et
}, Z = ye({
  locale: "zh-CN",
  labels: ve
});
function ft({
  locale: e = "zh-CN",
  labels: r,
  children: s
}) {
  const a = { ...tt[e], ...r };
  return /* @__PURE__ */ t(Z.Provider, { value: { locale: e, labels: a }, children: s });
}
function pt() {
  return le(Z).labels;
}
function vt() {
  return le(Z);
}
export {
  mt as ArtifactPaneShell,
  J as ArtifactPanel,
  ae as ChatBubble,
  ct as ChatComposer,
  q as CollapsibleToolTrace,
  Pe as ConfirmGate,
  ut as LogLine,
  ft as MesoLocaleProvider,
  lt as MessageList,
  wt as PROTOCOL_VERSION,
  it as ProcessTrace,
  Fe as ResourceReadBlock,
  dt as SidebarUserMenu,
  ue as SkillIndicator,
  me as SoulIndicator,
  Ee as StageTimeline,
  j as StatusIcon,
  nt as StreamingCursor,
  ce as ThinkBlock,
  ot as ThreeColumnLayout,
  he as ToolCallBlock,
  Be as WorkflowTimeline,
  Ce as applyEvent,
  kt as assertCompatibleVersion,
  G as createInitialStreamState,
  yt as createStreamStateWithArtifacts,
  tt as defaultLabelsByLocale,
  et as enUSLabels,
  bt as isCompatibleVersion,
  xe as parseSSELine,
  be as phaseRecordToStage,
  xt as streamStateHasArtifacts,
  fe as useFoldState,
  pt as useMesoLabels,
  vt as useMesoLocale,
  ht as useSSEStream,
  _t as useTheme,
  ve as zhCNLabels
};
