import { jsxs as n, jsx as t, Fragment as B } from "react/jsx-runtime";
import F, { useState as $, useRef as R, useEffect as I, useMemo as V, useCallback as G, createContext as xe, useContext as ie } from "react";
import { phaseRecordToStage as Ce, createInitialStreamState as J, parseSSELine as Se, applyEvent as Le } from "./runtime.js";
import { PROTOCOL_VERSION as wt, assertCompatibleVersion as yt, createStreamStateWithArtifacts as bt, isCompatibleVersion as xt, streamStateHasArtifacts as Ct } from "./runtime.js";
function nt({
  navItems: e = [],
  sidebarFooter: r,
  sessionColumn: s,
  children: a,
  defaultCollapsed: l = !1,
  appName: o = "Meso",
  sidebarLogo: c,
  sidebarTitle: i,
  mainHeader: u,
  artifactPanel: h,
  defaultArtifactVisible: d = !1,
  onArtifactToggle: _,
  artifactVisible: v,
  showArtifactToggle: k = !0,
  showSessionColumn: y = !0,
  contentMaxWidth: m,
  artifactPanelWidth: p,
  onCollapsedChange: f
}) {
  const [g, w] = $(l), [S, N] = $(d), b = v !== void 0 ? v : S, C = () => {
    const x = !b;
    v === void 0 && N(x), _ == null || _(x);
  };
  return /* @__PURE__ */ n("div", { className: "meso-layout", children: [
    /* @__PURE__ */ n("aside", { className: `meso-sidebar${g ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ n("div", { className: "meso-sidebar__header", children: [
        c ? /* @__PURE__ */ t("div", { className: "meso-sidebar__logo meso-sidebar__logo--custom", children: c }) : /* @__PURE__ */ t("div", { className: "meso-sidebar__logo", children: o[0] }),
        i ? /* @__PURE__ */ t("span", { className: "meso-sidebar__title meso-sidebar__title--brand", children: i }) : /* @__PURE__ */ t("span", { className: "meso-sidebar__title", children: o }),
        /* @__PURE__ */ t(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => {
              const x = !g;
              w(x), f == null || f(x);
            },
            "aria-label": g ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ n("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ t("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ t("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ t("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ t("nav", { className: "meso-sidebar__nav", children: e.map((x) => /* @__PURE__ */ n(
        "div",
        {
          className: `meso-sidebar__nav-item${x.active ? " meso-sidebar__nav-item--active" : ""}`,
          onClick: x.onClick,
          title: x.label,
          children: [
            /* @__PURE__ */ t("span", { className: "meso-sidebar__nav-icon", children: x.icon }),
            /* @__PURE__ */ t("span", { className: "meso-sidebar__nav-label", children: x.label })
          ]
        },
        x.id
      )) }),
      r && /* @__PURE__ */ t("div", { className: "meso-sidebar__footer", children: r })
    ] }),
    y !== !1 && /* @__PURE__ */ t("div", { className: "meso-session-col", children: s }),
    /* @__PURE__ */ n("main", { className: "meso-main", children: [
      /* @__PURE__ */ n("div", { className: "meso-main__header", children: [
        /* @__PURE__ */ t("div", { className: "meso-main__header-content", children: u }),
        k !== !1 && /* @__PURE__ */ t(
          "button",
          {
            className: `meso-artifact-toggle${b ? " meso-artifact-toggle--active" : ""}`,
            onClick: C,
            title: b ? "关闭 Artifact" : "打开 Artifact",
            "aria-label": b ? "关闭 Artifact" : "打开 Artifact",
            children: b ? (
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
        /* @__PURE__ */ t("div", { className: "meso-main__chat", style: m ? { maxWidth: m, margin: "0 auto", width: "100%" } : void 0, children: a }),
        b && /* @__PURE__ */ n(B, { children: [
          /* @__PURE__ */ t("div", { className: "meso-artifact-divider", "aria-hidden": "true" }),
          /* @__PURE__ */ t(
            "div",
            {
              className: "meso-artifact-pane",
              style: p != null ? { width: p, minWidth: p, maxWidth: p } : void 0,
              children: h
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function ne({
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
`).map((i, u) => /* @__PURE__ */ n(F.Fragment, { children: [
          u > 0 && /* @__PURE__ */ t("br", {}),
          i
        ] }, u)),
        s && /* @__PURE__ */ t("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      a && /* @__PURE__ */ t("div", { className: "meso-bubble__timestamp", children: a })
    ] })
  ] });
}
function Q({
  content: e,
  pinnedContent: r,
  streaming: s = !1,
  turnStreaming: a,
  autoCollapseDelay: l = 1500,
  defaultOpen: o = !0,
  open: c,
  onOpenChange: i,
  collapseWhen: u = "streamEnd",
  summary: h = "已思考"
}) {
  const d = c !== void 0, [_, v] = $(o), [k, y] = $(null), m = R(null);
  m.current = k;
  const p = d ? c : k !== null ? k : _, f = R(s), g = R(a), w = () => {
    const b = !p;
    d || y(b), i == null || i(b);
  };
  return I(() => {
    if (u !== "never" && l !== null) {
      if (f.current && !s) {
        const b = setTimeout(() => {
          d || v(!1), m.current === null && (i == null || i(!1));
        }, l);
        return () => clearTimeout(b);
      }
      f.current = s;
    }
  }, [s, l, u, d, i]), I(() => {
    a !== void 0 && (g.current && !a && y(null), g.current = a);
  }, [a]), /* @__PURE__ */ n("div", { className: `meso-think${p ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ n(
      "button",
      {
        className: "meso-think__header",
        onClick: w,
        "aria-expanded": p,
        children: [
          /* @__PURE__ */ t("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ t("span", { className: "meso-think__label", children: p ? "思考过程" : h }),
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
function lt({ active: e = !0 }) {
  return e ? /* @__PURE__ */ t("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function $e(e) {
  try {
    const r = JSON.parse(e);
    return Array.isArray(r.headers) && Array.isArray(r.rows) ? r : null;
  } catch {
    return null;
  }
}
function q({
  type: e,
  content: r,
  language: s = "plaintext",
  streaming: a = !1,
  onCopy: l,
  onDownload: o,
  renderMermaid: c,
  highlightCode: i,
  renderMarkdown: u
}) {
  const [h, d] = $(!1), [_, v] = $(e), [k, y] = $(null), [m, p] = $(!1), [f, g] = $(null), w = R("");
  I(() => {
    v(e);
  }, [e]), I(() => {
    e !== "mermaid" || a || !c || r === w.current || (w.current = r, y(null), p(!1), c(r).then((C) => y(C)).catch(() => p(!0)));
  }, [e, a, r, c]), I(() => {
    e !== "code" || a || !i || r === w.current && f || (w.current = r, g(i(r, s)));
  }, [e, a, r, s, i, f]);
  const S = () => {
    navigator.clipboard.writeText(r).catch(() => {
    }), d(!0), setTimeout(() => d(!1), 2e3), l == null || l(r);
  }, N = () => {
    if (o) {
      o(r);
      return;
    }
    const C = {
      html: "html",
      mermaid: "md",
      markdown: "md",
      table: "json",
      code: s || "txt"
    }, x = new Blob([r], { type: "text/plain" }), O = document.createElement("a");
    O.href = URL.createObjectURL(x), O.download = `artifact.${C[e]}`, O.click(), URL.revokeObjectURL(O.href);
  };
  return /* @__PURE__ */ n("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ n("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ t("div", { className: "meso-artifact__tabs", children: (e === "html" ? ["html", "code"] : [e]).map((C) => /* @__PURE__ */ t(
        "span",
        {
          className: `meso-artifact__tab${_ === C ? " meso-artifact__tab--active" : ""}`,
          onClick: () => v(C),
          children: Oe(C, s)
        },
        C
      )) }),
      a && /* @__PURE__ */ t("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ t("button", { className: "meso-artifact__download-btn", onClick: N, title: "下载", "aria-label": "下载文件", children: /* @__PURE__ */ t("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) }) }),
      /* @__PURE__ */ t("button", { className: "meso-artifact__copy-btn", onClick: S, title: "复制", "aria-label": "复制代码", children: h ? /* @__PURE__ */ t("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ n("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ t("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
        /* @__PURE__ */ t("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
      ] }) })
    ] }),
    /* @__PURE__ */ n("div", { className: "meso-artifact__body", children: [
      _ === "html" && /* @__PURE__ */ t("iframe", { className: "meso-artifact__preview", srcDoc: r, sandbox: "allow-scripts", title: "HTML 预览" }),
      _ === "mermaid" && /* @__PURE__ */ n(B, { children: [
        a && /* @__PURE__ */ n("pre", { className: "meso-artifact__code", children: [
          /* @__PURE__ */ t("code", { children: r }),
          /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
        ] }),
        !a && k && /* @__PURE__ */ t(
          "div",
          {
            className: "meso-artifact__mermaid",
            dangerouslySetInnerHTML: { __html: k }
          }
        ),
        !a && !k && !m && !c && /* @__PURE__ */ n("div", { className: "meso-artifact__mermaid-placeholder", children: [
          /* @__PURE__ */ t("span", { children: "图表预览需要集成 Mermaid 渲染器" }),
          /* @__PURE__ */ t("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ t("code", { children: r }) })
        ] }),
        !a && m && /* @__PURE__ */ n("div", { className: "meso-artifact__mermaid-placeholder meso-artifact__mermaid-placeholder--error", children: [
          /* @__PURE__ */ t("span", { children: "图表渲染失败，请检查语法" }),
          /* @__PURE__ */ t("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ t("code", { children: r }) })
        ] }),
        !a && !k && !m && c && /* @__PURE__ */ t("div", { className: "meso-artifact__mermaid-placeholder", children: /* @__PURE__ */ t("span", { children: "渲染中…" }) })
      ] }),
      _ === "markdown" && /* @__PURE__ */ t(B, { children: u ? /* @__PURE__ */ t(
        "div",
        {
          className: "meso-artifact__markdown",
          dangerouslySetInnerHTML: { __html: u(r) }
        }
      ) : /* @__PURE__ */ n("pre", { className: "meso-artifact__code", children: [
        /* @__PURE__ */ t("code", { children: r }),
        a && /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] }) }),
      _ === "table" && /* @__PURE__ */ t(Te, { content: r, streaming: a }),
      (_ === "code" || _ === "html" && !1) && /* @__PURE__ */ n("pre", { className: "meso-artifact__code", children: [
        f && !a ? /* @__PURE__ */ t("code", { dangerouslySetInnerHTML: { __html: f } }) : /* @__PURE__ */ t("code", { children: r }),
        a && /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] })
    ] })
  ] });
}
function Te({ content: e, streaming: r }) {
  const s = $e(e);
  return s ? /* @__PURE__ */ t("div", { className: "meso-artifact__table-wrap", children: /* @__PURE__ */ n("table", { className: "meso-artifact__table", children: [
    /* @__PURE__ */ t("thead", { children: /* @__PURE__ */ t("tr", { children: s.headers.map((a, l) => /* @__PURE__ */ t("th", { children: a }, l)) }) }),
    /* @__PURE__ */ t("tbody", { children: s.rows.map((a, l) => /* @__PURE__ */ t("tr", { children: a.map((o, c) => /* @__PURE__ */ t("td", { children: String(o) }, c)) }, l)) })
  ] }) }) : /* @__PURE__ */ n("pre", { className: "meso-artifact__code", children: [
    /* @__PURE__ */ t("code", { children: e }),
    r && /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
  ] });
}
function Oe(e, r) {
  return e === "html" ? "HTML 预览" : e === "mermaid" ? "图表" : e === "markdown" ? "Markdown" : e === "table" ? "表格" : r || "Code";
}
const Ee = {
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
  const l = a ?? Ee[e];
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
function Re(e) {
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
function Ie({ stages: e, compact: r = !1 }) {
  return e.length === 0 ? null : /* @__PURE__ */ t("div", { className: `meso-stages${r ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: e.map((s, a) => /* @__PURE__ */ n(
    "div",
    {
      className: `meso-stage meso-stage--${s.status}`,
      children: [
        /* @__PURE__ */ t("div", { className: "meso-stage__dot", children: /* @__PURE__ */ t(j, { status: Re(s.status), size: 10 }) }),
        a < e.length - 1 && /* @__PURE__ */ t("div", { className: `meso-stage__line${s.status === "done" ? " meso-stage__line--done" : ""}` }),
        /* @__PURE__ */ t("span", { className: `meso-stage__label${r ? " meso-stage__label--compact" : ""}`, children: s.label })
      ]
    },
    s.id
  )) });
}
function Me(e) {
  const { nodes: r, nodeOrder: s } = e, a = /* @__PURE__ */ new Map();
  for (const i of s) {
    const u = r[i];
    if (!u) continue;
    const h = u.parent_id ?? null;
    a.has(h) || a.set(h, []), a.get(h).push(i);
  }
  const l = /* @__PURE__ */ new Map();
  for (const [, i] of a)
    if (i.length > 1)
      for (const u of i) l.set(u, i);
  const o = [], c = /* @__PURE__ */ new Set();
  for (const i of s) {
    if (c.has(i)) continue;
    const u = r[i];
    if (!u) continue;
    const h = l.get(i);
    if (h) {
      const d = h.map((_) => r[_]).filter((_) => !!_);
      for (const _ of d) c.add(_.node_id);
      o.push({ kind: "parallel", nodes: d, isLast: !1 });
    } else
      c.add(i), o.push({ kind: "node", node: u, isLast: !1 });
  }
  return o.length > 0 && (o[o.length - 1] = { ...o[o.length - 1], isLast: !0 }), o;
}
function Be(e) {
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
function de({ state: e }) {
  return /* @__PURE__ */ t(
    j,
    {
      status: Be(e),
      size: 12,
      className: `meso-wf-node__icon meso-wf-node__icon--${e}`
    }
  );
}
function me(e) {
  return e < 1e3 ? `${e}ms` : `${(e / 1e3).toFixed(1)}s`;
}
function Ae({ node: e, isLast: r }) {
  var o;
  const [s, a] = $(!1), l = e.metadata && Object.keys(e.metadata).length > 0;
  return /* @__PURE__ */ n("div", { className: `meso-wf-node meso-wf-node--${e.state}`, children: [
    /* @__PURE__ */ n("div", { className: "meso-wf-node__track", children: [
      /* @__PURE__ */ t("div", { className: "meso-wf-node__dot", children: /* @__PURE__ */ t(de, { state: e.state }) }),
      !r && /* @__PURE__ */ t("div", { className: "meso-wf-node__line" })
    ] }),
    /* @__PURE__ */ n("div", { className: "meso-wf-node__body", children: [
      /* @__PURE__ */ n("div", { className: "meso-wf-node__header", children: [
        /* @__PURE__ */ t("code", { className: "meso-wf-node__name", children: e.name }),
        e.duration_ms !== void 0 && /* @__PURE__ */ t("span", { className: "meso-wf-node__duration", children: me(e.duration_ms) }),
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
function De({ nodes: e, isLast: r }) {
  return /* @__PURE__ */ n("div", { className: "meso-wf-parallel", children: [
    /* @__PURE__ */ t("div", { className: "meso-wf-parallel__row", children: e.map((s, a) => {
      var l;
      return /* @__PURE__ */ n("div", { className: `meso-wf-parallel__branch meso-wf-parallel__branch--${s.state}`, children: [
        /* @__PURE__ */ t("div", { className: "meso-wf-parallel__branch-dot", children: /* @__PURE__ */ t(de, { state: s.state }) }),
        /* @__PURE__ */ n("div", { className: "meso-wf-parallel__branch-body", children: [
          /* @__PURE__ */ n("div", { className: "meso-wf-parallel__branch-label", children: [
            "并行分支 ",
            String.fromCharCode(65 + a)
          ] }),
          /* @__PURE__ */ t("code", { className: "meso-wf-node__name", children: s.name }),
          s.state === "error" && !!((l = s.metadata) != null && l.error) && /* @__PURE__ */ t("div", { className: "meso-wf-node__error", children: String(s.metadata.error) }),
          s.duration_ms !== void 0 && /* @__PURE__ */ t("span", { className: "meso-wf-node__duration", style: { display: "block", marginTop: 2 }, children: me(s.duration_ms) })
        ] })
      ] }, s.node_id);
    }) }),
    !r && /* @__PURE__ */ t("div", { className: "meso-wf-parallel__merge" })
  ] });
}
function We({ runs: e, showRunId: r = !0, hidden: s }) {
  if (e.length === 0 || s) return null;
  const a = e.length > 1;
  return /* @__PURE__ */ t("div", { className: "meso-wf", role: "status", "aria-label": "工作流进度", children: e.map((l) => {
    const o = Me(l);
    return /* @__PURE__ */ n("div", { className: "meso-wf-run", children: [
      a && r && /* @__PURE__ */ t("div", { className: "meso-wf-run__label", children: l.run_id }),
      o.map(
        (c, i) => c.kind === "parallel" ? /* @__PURE__ */ t(De, { nodes: c.nodes, isLast: c.isLast }, `parallel-${i}`) : /* @__PURE__ */ t(Ae, { node: c.node, isLast: c.isLast }, c.node.node_id)
      )
    ] }, l.run_id);
  }) });
}
function ue({ soul: e, compact: r = !1 }) {
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
        !r && /* @__PURE__ */ n(B, { children: [
          /* @__PURE__ */ t("span", { className: "meso-soul__name", children: e.name }),
          e.traits && e.traits.length > 0 && /* @__PURE__ */ t("div", { className: "meso-soul__traits", children: e.traits.map((a) => /* @__PURE__ */ t("span", { className: "meso-soul__trait", children: a }, a)) })
        ] })
      ]
    }
  );
}
const Pe = {
  mcp: "MCP",
  api: "API"
};
function he({ skill: e }) {
  const r = e.provider ? Pe[e.provider] : null;
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
const je = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function He({ toolCall: e, onConfirm: r, onCancel: s }) {
  const a = e.risk ?? "safe", l = je[a], o = Object.keys(e.args).length > 0;
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
function ze(e) {
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
function Ke(e) {
  switch (e) {
    case "pending":
      return "pending";
    case "done":
      return "done";
    case "error":
      return "error";
  }
}
function Ue(e) {
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
const Ve = {
  safe: "只读",
  write: "写入",
  destructive: "危险"
}, le = {
  mcp: "MCP",
  api: "API",
  local: "本地"
};
function _e({ toolCall: e, onConfirm: r, onCancel: s, className: a, "data-testid": l, simplify: o }) {
  var z, P;
  const { call: c, result: i, status: u } = e, h = c.risk ?? "safe", d = Object.keys(c.args).length > 0, _ = (o == null ? void 0 : o.verbosity) ?? (o != null && o.compact ? "compact" : "standard"), v = _ === "compact", k = _ === "standard", y = _ === "detailed", m = (o == null ? void 0 : o.showDuration) ?? !0, p = (o == null ? void 0 : o.showProvider) ?? !v, f = (o == null ? void 0 : o.showRiskLevel) ?? (k || y), g = (o == null ? void 0 : o.showExecutionTimeline) ?? y, w = (o == null ? void 0 : o.defaultParamsCollapsed) ?? (v || k), S = (o == null ? void 0 : o.defaultOutputCollapsed) ?? (v || k), N = (o == null ? void 0 : o.defaultMetadataCollapsed) ?? (v || k), [b, C] = $(!w), [x, O] = $(!S), [A, H] = $(!N), D = (z = i == null ? void 0 : i.metadata) == null ? void 0 : z.resultCount, W = i == null ? void 0 : i.narration;
  return /* @__PURE__ */ n(
    "div",
    {
      className: `meso-tool meso-tool--${u} meso-tool--risk-${h} meso-tool--${_}${a ? ` ${a}` : ""}`,
      "data-testid": l ?? "meso-tool-call-block",
      children: [
        /* @__PURE__ */ n("div", { className: "meso-tool__header", children: [
          /* @__PURE__ */ t(j, { status: ze(u), size: 14, className: "meso-tool__status-icon" }),
          /* @__PURE__ */ t("span", { className: "meso-tool__name", children: c.name }),
          D !== void 0 && /* @__PURE__ */ n("span", { className: "meso-tool__summary", children: [
            "— ",
            D,
            " 项"
          ] }),
          m && (i == null ? void 0 : i.duration_ms) !== void 0 && /* @__PURE__ */ n("span", { className: "meso-tool__duration", children: [
            "(",
            i.duration_ms,
            "ms)"
          ] }),
          f && h !== "safe" && /* @__PURE__ */ t("span", { className: `meso-tool__risk meso-tool__risk--${h}`, children: Ve[h] }),
          p && c.provider && le[c.provider] && /* @__PURE__ */ t("span", { className: `meso-tool__provider meso-tool__provider--${c.provider}`, children: le[c.provider] }),
          ((P = c.annotations) == null ? void 0 : P.open_world) && /* @__PURE__ */ t("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", children: "🌐" })
        ] }),
        W && /* @__PURE__ */ t("div", { className: "meso-tool__narration", children: W }),
        d && /* @__PURE__ */ n("details", { className: "meso-tool__params-details", open: b, children: [
          /* @__PURE__ */ t(
            "summary",
            {
              className: "meso-tool__params-summary",
              onClick: (T) => {
                T.preventDefault(), C((M) => !M);
              },
              children: /* @__PURE__ */ n("span", { className: "meso-tool__params-toggle", children: [
                b ? "▾" : "▸",
                " Input Parameters"
              ] })
            }
          ),
          b && /* @__PURE__ */ t("pre", { className: "meso-tool__args", children: JSON.stringify(c.args, null, y ? 2 : 1) })
        ] }),
        u === "awaiting_confirm" && r && s && /* @__PURE__ */ t(
          He,
          {
            toolCall: c,
            onConfirm: r,
            onCancel: s
          }
        ),
        (u === "done" || u === "error") && i && /* @__PURE__ */ n("details", { className: "meso-tool__result-details", open: x, children: [
          /* @__PURE__ */ t(
            "summary",
            {
              className: "meso-tool__result-summary",
              onClick: (T) => {
                T.preventDefault(), O((M) => !M);
              },
              children: /* @__PURE__ */ n("span", { className: "meso-tool__result-toggle", children: [
                x ? "▾" : "▸",
                " ",
                u === "error" ? "Error" : "Output"
              ] })
            }
          ),
          x && /* @__PURE__ */ t("pre", { className: `meso-tool__output${u === "error" ? " meso-tool__output--error" : ""}`, children: u === "error" ? i.error : y ? i.output : i.output.slice(0, 200) + (i.output.length > 200 ? "..." : "") })
        ] }),
        (i == null ? void 0 : i.metadata) && /* @__PURE__ */ n("details", { className: "meso-tool__metadata-details", open: A, children: [
          /* @__PURE__ */ t(
            "summary",
            {
              className: "meso-tool__metadata-summary",
              onClick: (T) => {
                T.preventDefault(), H((M) => !M);
              },
              children: /* @__PURE__ */ n("span", { className: "meso-tool__metadata-toggle", children: [
                A ? "▾" : "▸",
                " Metadata"
              ] })
            }
          ),
          A && /* @__PURE__ */ n("div", { className: "meso-tool__metadata", children: [
            i.metadata.resultCount !== void 0 && /* @__PURE__ */ n("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-key", children: "resultCount:" }),
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-value", children: i.metadata.resultCount })
            ] }),
            i.metadata.category !== void 0 && /* @__PURE__ */ n("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-key", children: "category:" }),
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-value", children: i.metadata.category })
            ] }),
            y && i.metadata.custom && /* @__PURE__ */ n("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-key", children: "custom:" }),
              /* @__PURE__ */ t("pre", { className: "meso-tool__metadata-custom", children: JSON.stringify(i.metadata.custom, null, 2) })
            ] })
          ] })
        ] }),
        y && g && (i == null ? void 0 : i.duration_ms) && /* @__PURE__ */ n("details", { className: "meso-tool__timeline-details", open: !1, children: [
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
function Y({
  stream: e,
  defaultExpanded: r = "none",
  expandCount: s = 2,
  onlyShowCurrent: a = !1,
  simplify: l,
  onToolClick: o,
  onToolConfirm: c,
  onToolCancel: i,
  renderSummary: u
}) {
  const h = e.toolCallOrder, d = a && h.length > 0 ? [h[h.length - 1]] : h, [_, v] = $(() => {
    if (r === "none") return /* @__PURE__ */ new Set();
    if (r === "all") return new Set(d);
    if (r === "current" && d.length > 0)
      return /* @__PURE__ */ new Set([d[d.length - 1]]);
    if (r === "last-n" && d.length > 0) {
      const m = d.slice(-s);
      return new Set(m);
    }
    return /* @__PURE__ */ new Set();
  }), k = (m) => {
    const p = new Set(_);
    p.has(m) ? p.delete(m) : p.add(m), v(p), o == null || o(m);
  }, y = (m, p) => {
    var x;
    const { call: f, result: g, status: w } = m;
    if (u)
      return String(u(m, p) ?? "");
    const S = w === "error" ? "✗" : "✓", N = f.name, b = (x = g == null ? void 0 : g.metadata) != null && x.resultCount ? ` — ${g.metadata.resultCount} 项` : "", C = g != null && g.duration_ms ? ` (${g.duration_ms}ms)` : "";
    return `${S} ${N}${b}${C}`;
  };
  return d.length === 0 ? null : /* @__PURE__ */ t("div", { className: "meso-collapsible-tool-trace", children: d.map((m, p) => {
    const f = e.toolCalls[m];
    if (!f) return null;
    const g = _.has(m), { status: w } = f;
    return /* @__PURE__ */ n("div", { className: `meso-collapsible-tool__item meso-collapsible-tool__item--${w}`, children: [
      /* @__PURE__ */ n(
        "button",
        {
          className: "meso-collapsible-tool__summary",
          onClick: () => k(m),
          "aria-expanded": g,
          children: [
            /* @__PURE__ */ t("span", { className: "meso-collapsible-tool__toggle", children: g ? "▼" : "▶" }),
            /* @__PURE__ */ t("span", { className: "meso-collapsible-tool__text", children: y(f, p) })
          ]
        }
      ),
      g && /* @__PURE__ */ t("div", { className: "meso-collapsible-tool__details", children: /* @__PURE__ */ t(
        _e,
        {
          toolCall: f,
          onConfirm: c,
          onCancel: i,
          simplify: l
        }
      ) })
    ] }, m);
  }) });
}
function fe({ resourceRead: e, className: r }) {
  const [s, a] = $(!1), { read: l, content: o, status: c } = e, i = l.name ?? l.uri, u = l.server;
  return /* @__PURE__ */ n("div", { className: `meso-resource meso-resource--${c}${r ? ` ${r}` : ""}`, children: [
    /* @__PURE__ */ n("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ t(j, { status: Ke(c), size: 13, className: "meso-resource__status-icon" }),
      /* @__PURE__ */ t("span", { className: "meso-resource__uri", title: l.uri, children: i }),
      u && /* @__PURE__ */ t("span", { className: "meso-resource__server", children: u }),
      (o == null ? void 0 : o.duration_ms) !== void 0 && /* @__PURE__ */ n("span", { className: "meso-resource__duration", children: [
        o.duration_ms,
        "ms"
      ] }),
      (c === "done" || c === "error") && o && /* @__PURE__ */ n(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => a((h) => !h),
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
    s && o && /* @__PURE__ */ t("div", { className: "meso-resource__content", children: c === "error" ? /* @__PURE__ */ t("pre", { className: "meso-resource__text meso-resource__text--error", children: o.error }) : o.contents.map((h, d) => /* @__PURE__ */ n("div", { children: [
      h.type === "text" && /* @__PURE__ */ t("pre", { className: "meso-resource__text", children: h.text }),
      h.type === "image" && h.data && /* @__PURE__ */ t(
        "img",
        {
          className: "meso-resource__image",
          src: `data:${h.mime_type ?? "image/png"};base64,${h.data}`,
          alt: "resource"
        }
      ),
      h.type === "blob" && /* @__PURE__ */ n("span", { className: "meso-resource__blob-label", children: [
        "[",
        h.mime_type ?? "binary",
        "]"
      ] })
    ] }, d)) })
  ] });
}
function Z(e) {
  return e === "html" || e === "html preview" ? { type: "html" } : e === "mermaid" ? { type: "mermaid" } : e === "markdown" ? { type: "markdown" } : e === "table" ? { type: "table" } : { type: "code", language: e };
}
function pe(e) {
  const r = e.toolCallOrder, s = r.length - 1, a = r.slice(0, s).filter((o) => e.toolCalls[o].result !== void 0), l = r[s];
  return { frozenIds: a, currentId: l };
}
function Ge({
  stream: e,
  onToolConfirm: r,
  onToolCancel: s
}) {
  const { frozenIds: a, currentId: l } = V(
    () => pe(e),
    [e.toolCallOrder, e.toolCalls]
  );
  return e.toolCallOrder.length === 0 ? null : /* @__PURE__ */ n(B, { children: [
    a.length > 0 && /* @__PURE__ */ t("div", { className: "meso-message-list__frozen-tools", children: /* @__PURE__ */ t(
      Y,
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
      Y,
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
function Fe(e, r) {
  const s = [];
  let a = "", l = null;
  const o = () => {
    l !== null && a.length > 0 && s.push({ kind: "text", key: l, text: a }), a = "", l = null;
  };
  for (const c of e.eventLog) {
    const { type: i, id: u } = c;
    if (i === "text") {
      const h = e.textChunks.find((d) => d.id === u);
      if (!h) continue;
      l === null && (l = `text-${u}`), a += h.delta;
    } else if (i === "tool_call") {
      if (!e.toolCalls[u]) continue;
      o(), s.push({ kind: "tool", key: `tool-${u}`, id: u });
    } else if (i === "resource_read") {
      if (!e.resourceReads[u]) continue;
      o(), s.push({ kind: "resource", key: `resource-${u}`, id: u });
    } else if (i === "artifact") {
      const h = e.artifacts[u];
      if (!h || r != null && r.includes(h.lang)) continue;
      o(), s.push({ kind: "artifact", key: `artifact-${u}`, id: u });
    }
  }
  return o(), s;
}
function ce({
  stream: e,
  streaming: r,
  onToolConfirm: s,
  onToolCancel: a,
  renderExtension: l,
  onArtifactCopy: o,
  onArtifactDownload: c,
  renderMermaid: i,
  highlightCode: u,
  renderMarkdown: h,
  hiddenArtifactLangs: d,
  simplify: _
}) {
  const { currentId: v } = V(
    () => pe(e),
    [e.toolCallOrder, e.toolCalls]
  ), k = V(
    () => Fe(e, d),
    [e.eventLog, e.textChunks, e.artifacts, e.toolCalls, e.resourceReads, d]
  ), y = V(() => {
    for (let m = k.length - 1; m >= 0; m--)
      if (k[m].kind === "text") return k[m].key;
    return null;
  }, [k]);
  return /* @__PURE__ */ n("div", { className: "meso-message-list__interleaved", children: [
    (e.activeSoul || e.activeSkill) && /* @__PURE__ */ n("div", { className: "meso-message-list__context-row", children: [
      e.activeSoul && /* @__PURE__ */ t(ue, { soul: e.activeSoul }),
      e.activeSkill && /* @__PURE__ */ t(he, { skill: e.activeSkill })
    ] }),
    e.memorySnippets.length > 0 && /* @__PURE__ */ t("div", { className: "meso-memory-chips", children: e.memorySnippets.map((m, p) => /* @__PURE__ */ n("span", { className: "meso-memory-chip", title: m.content, children: [
      "[",
      m.category,
      "] ",
      m.content
    ] }, p)) }),
    e.thinkContent && /* @__PURE__ */ t(
      Q,
      {
        content: e.thinkContent,
        streaming: r && !e.thinkDone,
        collapseWhen: "streamEnd",
        defaultOpen: !0
      }
    ),
    k.map((m) => {
      if (m.kind === "text") {
        const w = typeof h == "function", S = r && m.key === y && e.artifactOrder.length === 0;
        return /* @__PURE__ */ t("div", { className: "meso-event-text", "data-streaming-role": "content", children: w ? /* @__PURE__ */ t("div", { className: "meso-bubble__md", dangerouslySetInnerHTML: { __html: h(m.text) } }) : /* @__PURE__ */ n(B, { children: [
          m.text,
          S && /* @__PURE__ */ t("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
        ] }) }, m.key);
      }
      if (m.kind === "tool") {
        if (!e.toolCalls[m.id]) return null;
        const S = r && m.id === v;
        return /* @__PURE__ */ t(
          "div",
          {
            className: `meso-event-tool meso-event-tool--${S ? "current" : "frozen"}`,
            "data-streaming-role": "content",
            children: /* @__PURE__ */ t(
              Y,
              {
                stream: { ...e, toolCallOrder: [m.id] },
                streaming: S && e.status === "streaming",
                defaultExpanded: S ? "all" : "none",
                simplify: _,
                onToolConfirm: S ? s : void 0,
                onToolCancel: S ? a : void 0
              }
            )
          },
          m.key
        );
      }
      if (m.kind === "resource") {
        const w = e.resourceReads[m.id];
        return w ? /* @__PURE__ */ t("div", { className: "meso-event-resource", "data-streaming-role": "content", children: /* @__PURE__ */ t(fe, { resourceRead: w }) }, m.key) : null;
      }
      const p = e.artifacts[m.id];
      if (!p) return null;
      const { type: f, language: g } = Z(p.lang);
      return /* @__PURE__ */ t("div", { className: "meso-event-artifact", "data-streaming-role": "content", children: /* @__PURE__ */ t(
        q,
        {
          type: f,
          content: p.content,
          language: g,
          streaming: r && !p.done,
          onCopy: o,
          onDownload: c,
          renderMermaid: i,
          highlightCode: u,
          renderMarkdown: h
        }
      ) }, m.key);
    }),
    l && e.extensionLog.length > 0 && /* @__PURE__ */ t("div", { className: "meso-message-list__extensions", children: e.extensionLog.map((m, p) => /* @__PURE__ */ t(F.Fragment, { children: l(m) }, p)) }),
    e.memorySaved.length > 0 && /* @__PURE__ */ t("div", { className: "meso-memory-saved", children: e.memorySaved.map((m) => /* @__PURE__ */ n("span", { className: "meso-memory-saved__chip", title: m.preview, children: [
      /* @__PURE__ */ t("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ t("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
      "已记忆 [",
      m.category,
      "]"
    ] }, m.id)) })
  ] });
}
function ct({
  messages: e,
  streaming: r,
  onArtifactCopy: s,
  onArtifactDownload: a,
  onToolConfirm: l,
  onToolCancel: o,
  emptyState: c,
  emptyStateAlign: i = "center",
  className: u,
  renderExtension: h,
  renderLiveTrace: d,
  renderMarkdown: _,
  renderMermaid: v,
  highlightCode: k,
  hiddenArtifactLangs: y,
  renderingMode: m,
  simplify: p
}) {
  const f = R(null), g = m !== "block", w = m || "blend";
  I(() => {
    var N;
    (N = f.current) == null || N.scrollIntoView({ behavior: "smooth" });
  }, [e, r]), I(() => {
    if (!r || r.status !== "done") return;
    const N = document.querySelector(".meso-message-list__live");
    if (!N) return;
    N.querySelectorAll('[data-streaming-role="content"]').forEach((C) => {
      C.contentEditable = "false", C.dataset.frozen = "true";
    });
  }, [r == null ? void 0 : r.status]);
  const S = e.length > 0 || r && r.status !== "idle";
  return /* @__PURE__ */ t("div", { className: `meso-message-list meso-message-list--mode-${w}${u ? ` ${u}` : ""}`, children: /* @__PURE__ */ n("div", { className: "meso-message-list__inner", children: [
    !S && c && /* @__PURE__ */ t("div", { className: `meso-message-list__empty${i === "top" ? " meso-message-list__empty--top" : ""}`, children: c }),
    e.map((N) => N.role === "assistant" && N.trace && g ? /* @__PURE__ */ n("div", { className: "meso-message-list__committed", children: [
      /* @__PURE__ */ t(
        ce,
        {
          stream: N.trace,
          streaming: !1,
          renderExtension: h,
          onArtifactCopy: s,
          onArtifactDownload: a,
          renderMermaid: v,
          highlightCode: k,
          renderMarkdown: _,
          hiddenArtifactLangs: y,
          simplify: p
        }
      ),
      N.timestamp && /* @__PURE__ */ t("div", { className: "meso-bubble__timestamp", children: N.timestamp })
    ] }, N.id) : /* @__PURE__ */ n(F.Fragment, { children: [
      /* @__PURE__ */ t(
        ne,
        {
          role: N.role,
          content: N.content,
          timestamp: N.timestamp,
          markdown: N.role === "assistant",
          renderMarkdown: _
        }
      ),
      N.artifacts && N.artifacts.length > 0 && N.artifacts.map((b) => {
        const { type: C, language: x } = Z(b.lang);
        return /* @__PURE__ */ t(
          q,
          {
            type: C,
            content: b.content,
            language: x,
            onCopy: s,
            onDownload: a,
            renderMermaid: v,
            highlightCode: k,
            renderMarkdown: _
          },
          b.id
        );
      })
    ] }, N.id)),
    r && r.status !== "idle" && /* @__PURE__ */ t("div", { className: "meso-message-list__live", children: d ? d(r) : /* @__PURE__ */ t(B, { children: g ? /* @__PURE__ */ t(
      ce,
      {
        stream: r,
        streaming: r.status === "streaming",
        onToolConfirm: l,
        onToolCancel: o,
        renderExtension: h,
        onArtifactCopy: s,
        onArtifactDownload: a,
        renderMermaid: v,
        highlightCode: k,
        renderMarkdown: _,
        hiddenArtifactLangs: y,
        simplify: p
      }
    ) : /* @__PURE__ */ n(B, { children: [
      (r.activeSoul || r.activeSkill) && /* @__PURE__ */ n("div", { className: "meso-message-list__context-row", children: [
        r.activeSoul && /* @__PURE__ */ t(ue, { soul: r.activeSoul }),
        r.activeSkill && /* @__PURE__ */ t(he, { skill: r.activeSkill })
      ] }),
      /* @__PURE__ */ t(
        Ge,
        {
          stream: r,
          onToolConfirm: l,
          onToolCancel: o
        }
      ),
      h && r.extensionLog.length > 0 && /* @__PURE__ */ t("div", { className: "meso-message-list__extensions", children: r.extensionLog.map((N, b) => /* @__PURE__ */ t(F.Fragment, { children: h(N) }, b)) }),
      (r.textContent || r.status === "streaming") && /* @__PURE__ */ t(
        ne,
        {
          role: "assistant",
          content: r.textContent,
          streaming: r.status === "streaming" && r.artifactOrder.length === 0,
          markdown: !0,
          renderMarkdown: _
        }
      ),
      r.artifactOrder.map((N) => {
        const b = r.artifacts[N];
        if (!b || y != null && y.includes(b.lang)) return null;
        const { type: C, language: x } = Z(b.lang);
        return /* @__PURE__ */ t(
          q,
          {
            type: C,
            content: b.content,
            language: x,
            streaming: !b.done,
            onCopy: s,
            onDownload: a,
            renderMermaid: v,
            highlightCode: k,
            renderMarkdown: _
          },
          N
        );
      }),
      r.memorySaved.length > 0 && /* @__PURE__ */ t("div", { className: "meso-memory-saved", children: r.memorySaved.map((N) => /* @__PURE__ */ n("span", { className: "meso-memory-saved__chip", title: N.preview, children: [
        /* @__PURE__ */ t("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ t("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        N.category,
        "]"
      ] }, N.id)) })
    ] }) }) }),
    /* @__PURE__ */ t("div", { ref: f })
  ] }) });
}
function it({
  value: e,
  onChange: r,
  onSubmit: s,
  onStop: a,
  streaming: l = !1,
  disabled: o = !1,
  placeholder: c = "输入消息… (Ctrl+Enter 发送，Enter 换行)",
  leadingSlot: i,
  trailingActions: u,
  maxRows: h = 8
}) {
  const d = R(null), _ = 22, v = () => {
    const p = d.current;
    p && (p.style.height = "auto", p.style.height = Math.min(p.scrollHeight, _ * h) + "px");
  };
  I(v, [e]);
  const k = (p) => {
    p.key === "Enter" && (p.ctrlKey || p.metaKey) && (p.preventDefault(), !o && !l && e.trim() && s());
  }, y = !o && !l && e.trim().length > 0, m = /* @__PURE__ */ t(
    "button",
    {
      className: `meso-composer__send${l ? " meso-composer__send--stop" : ""}`,
      onClick: l ? a : s,
      disabled: l ? !1 : !y,
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
        onChange: (p) => {
          r(p.target.value), v();
        },
        onKeyDown: k,
        placeholder: c,
        rows: 1,
        disabled: o && !l,
        "aria-label": "消息输入框"
      }
    ),
    /* @__PURE__ */ n("div", { className: "meso-composer__toolbar", children: [
      /* @__PURE__ */ t("div", { className: "meso-composer__leading", children: i }),
      /* @__PURE__ */ t("span", { className: "meso-composer__hint", children: e.length > 0 && `${e.length} 字` }),
      /* @__PURE__ */ t("div", { className: "meso-composer__trailing", children: u ?? m })
    ] })
  ] }) });
}
function ve({
  system: e,
  resetOnTurnStart: r = !1
}) {
  const [s, a] = $(null), l = R(e);
  return I(() => {
    r && !l.current && e && a(null), l.current = e;
  }, [e, r]), {
    open: s !== null ? s : e,
    setOpen: (c) => a(c),
    toggle: () => a((c) => c !== null ? !c : !e),
    clearIntent: () => a(null),
    hasUserIntent: s !== null
  };
}
function Je(e) {
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
function qe(e) {
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
      var u;
      return ((u = c.nodes[i]) == null ? void 0 : u.state) === "error";
    }).length : l;
  }, 0), a = [];
  return e.phaseOrder.length > 0 && a.push(`${e.phaseOrder.length} 阶段`), r > 0 && a.push(`${r} 步`), s > 0 && a.push(`${s} 项失败`), a.length > 0 ? a.join(" · ") : "执行过程";
}
function Ye(e, r) {
  const s = !!(e.thinkContent || e.pinnedThink);
  return /* @__PURE__ */ n("div", { className: "meso-process-trace__phase", "data-testid": `meso-phase-${e.id}`, children: [
    /* @__PURE__ */ n("div", { className: "meso-process-trace__phase-header", children: [
      /* @__PURE__ */ t(j, { status: Ue(e.state), size: 14 }),
      /* @__PURE__ */ t("span", { className: "meso-process-trace__phase-name", children: e.name })
    ] }),
    s && /* @__PURE__ */ t(
      Q,
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
function dt({
  stream: e,
  streaming: r = !1,
  turnStreaming: s = !1,
  defaultCollapsed: a = !1,
  className: l,
  onToolConfirm: o,
  onToolCancel: c,
  renderToolCall: i,
  renderPhase: u,
  renderWorkflow: h,
  simplify: d
}) {
  const _ = ve({
    system: !a,
    resetOnTurnStart: s
  });
  if (!(!!e.thinkContent || e.phaseOrder.length > 0 || e.memorySnippets.length > 0 || e.resourceReadOrder.length > 0 || e.toolCallOrder.length > 0 || e.workflowRunOrder.length > 0)) return null;
  const k = qe(e), y = e.workflowRunOrder.map((f) => e.workflowRuns[f]).filter(Boolean), m = Je(e), p = e.phaseOrder.map((f) => e.phases[f]).filter(Boolean).map(Ce);
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
            onClick: _.toggle,
            "aria-expanded": _.open,
            "aria-label": _.open ? "折叠执行过程" : "展开执行过程",
            children: [
              /* @__PURE__ */ t(
                "svg",
                {
                  className: `meso-process-trace__chevron${_.open ? " meso-process-trace__chevron--open" : ""}`,
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
              /* @__PURE__ */ t("span", { className: "meso-process-trace__summary", children: k }),
              r && /* @__PURE__ */ t("span", { className: "meso-process-trace__dot", "aria-label": "执行中" })
            ]
          }
        ),
        _.open && /* @__PURE__ */ n("div", { className: "meso-process-trace__body", children: [
          p.length > 0 && /* @__PURE__ */ t(Ie, { compact: !0, stages: p }),
          e.memorySnippets.length > 0 && /* @__PURE__ */ t("div", { className: "meso-memory-chips", children: e.memorySnippets.map((f, g) => /* @__PURE__ */ n("span", { className: "meso-memory-chip", title: f.content, children: [
            "[",
            f.category,
            "] ",
            f.content
          ] }, g)) }),
          e.thinkContent && /* @__PURE__ */ t(
            Q,
            {
              content: e.thinkContent,
              streaming: r && !e.thinkDone,
              collapseWhen: "never",
              defaultOpen: !0,
              turnStreaming: s
            }
          ),
          e.phaseOrder.length > 0 && /* @__PURE__ */ t("div", { className: "meso-process-trace__phases", children: e.phaseOrder.map((f) => {
            const g = e.phases[f];
            if (!g) return null;
            const w = u == null ? void 0 : u(g);
            return w != null ? /* @__PURE__ */ t("div", { children: w }, f) : /* @__PURE__ */ t("div", { children: Ye(g, r) }, f);
          }) }),
          e.resourceReadOrder.length > 0 && /* @__PURE__ */ t("div", { className: "meso-process-trace__resources", children: e.resourceReadOrder.map((f) => {
            const g = e.resourceReads[f];
            return g ? /* @__PURE__ */ t(fe, { resourceRead: g }, f) : null;
          }) }),
          m.length > 0 && /* @__PURE__ */ t("div", { className: "meso-process-trace__tools", children: m.map((f) => /* @__PURE__ */ n(
            "div",
            {
              className: `meso-process-trace__tool-group${f.groupId ? " meso-process-trace__tool-group--grouped" : ""}`,
              "data-group-id": f.groupId,
              "data-group-kind": f.groupKind,
              children: [
                f.groupId && /* @__PURE__ */ n("div", { className: "meso-process-trace__tool-group-label", children: [
                  f.groupKind ?? "group",
                  ": ",
                  f.groupId
                ] }),
                f.ids.map((g) => {
                  const w = e.toolCalls[g];
                  if (!w) return null;
                  const S = i == null ? void 0 : i(w);
                  return S != null ? /* @__PURE__ */ t("div", { children: S }, g) : /* @__PURE__ */ t(
                    _e,
                    {
                      toolCall: w,
                      onConfirm: o,
                      onCancel: c,
                      simplify: d
                    },
                    g
                  );
                })
              ]
            },
            f.key
          )) }),
          y.length > 0 && ((h == null ? void 0 : h(e)) ?? /* @__PURE__ */ t(We, { runs: y }))
        ] })
      ]
    }
  );
}
function mt({
  name: e,
  email: r,
  avatarText: s,
  menuItems: a = [],
  onSignOut: l
}) {
  const [o, c] = $(!1), i = R(null);
  I(() => {
    if (!o) return;
    const d = (_) => {
      i.current && !i.current.contains(_.target) && c(!1);
    };
    return document.addEventListener("mousedown", d), () => document.removeEventListener("mousedown", d);
  }, [o]);
  const u = s ?? e.charAt(0).toUpperCase(), h = [
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
      h.length > 0 && /* @__PURE__ */ t("div", { className: "meso-user-menu__sep", role: "separator" }),
      h.map((d, _) => /* @__PURE__ */ n(
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
        _
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
          /* @__PURE__ */ t("div", { className: "meso-user-menu__avatar", children: u }),
          /* @__PURE__ */ n("div", { className: "meso-user-menu__info", children: [
            /* @__PURE__ */ t("span", { className: "meso-user-menu__name", children: e }),
            r && /* @__PURE__ */ t("span", { className: "meso-user-menu__email", children: r })
          ] })
        ]
      }
    )
  ] });
}
function ut({
  tabs: e,
  activeTabId: r,
  onTabChange: s,
  autoSelectFirstReady: a = !1
}) {
  var _;
  const l = r !== void 0, [o, c] = $(((_ = e[0]) == null ? void 0 : _.id) ?? ""), i = l ? r : o, u = R(!1);
  I(() => {
    if (!a || u.current) return;
    const v = e.find((k) => k.ready);
    v && (u.current = !0, l || c(v.id), s == null || s(v.id));
  }, [e, a, l, s]);
  const h = (v) => {
    l || c(v), s == null || s(v);
  }, d = e.find((v) => v.id === i) ?? e[0];
  return e.length === 0 ? null : /* @__PURE__ */ n("div", { className: "meso-artifact-shell", children: [
    /* @__PURE__ */ t("div", { className: "meso-artifact-shell__tabs", role: "tablist", children: e.map((v) => /* @__PURE__ */ n(
      "button",
      {
        role: "tab",
        "aria-selected": v.id === i,
        className: `meso-artifact-shell__tab${v.id === i ? " meso-artifact-shell__tab--active" : ""}`,
        onClick: () => h(v.id),
        children: [
          v.label,
          v.ready === !1 && /* @__PURE__ */ t("span", { className: "meso-artifact-shell__tab-dot", "aria-label": "加载中" })
        ]
      },
      v.id
    )) }),
    /* @__PURE__ */ t("div", { className: "meso-artifact-shell__content", role: "tabpanel", children: d == null ? void 0 : d.content })
  ] });
}
function ht({ status: e, primary: r, outcome: s, detail: a, className: l, "data-testid": o }) {
  const c = a !== void 0 && a !== "", i = ve({ system: !1 });
  return /* @__PURE__ */ n("div", { className: `meso-log-line${l ? ` ${l}` : ""}`, "data-testid": o ?? "meso-log-line", children: [
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
const Ze = /* @__PURE__ */ new Set(["text", "think"]);
function Qe(e, r, s) {
  var a, l, o, c, i, u, h, d, _, v, k, y, m, p, f, g;
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
        (u = s.onSkillActivated) == null || u.call(s, e.payload);
        break;
      case "tool_call":
        (h = s.onToolCall) == null || h.call(s, e.payload);
        break;
      case "tool_result":
        (d = s.onToolResult) == null || d.call(s, e.payload);
        break;
      case "resource_read":
        (_ = s.onResourceRead) == null || _.call(s, e.payload);
        break;
      case "resource_content":
        (v = s.onResourceContent) == null || v.call(s, e.payload);
        break;
      case "text":
        (k = s.onText) == null || k.call(s, e.payload.delta, r);
        break;
      case "think":
        (y = s.onThink) == null || y.call(s, e.payload.delta, r);
        break;
      case "artifact": {
        const w = r.artifacts[e.payload.id];
        w && ((m = s.onArtifact) == null || m.call(s, w));
        break;
      }
      case "extension":
        (p = s.onExtensionEvent) == null || p.call(s, e);
        break;
      case "error":
        (f = s.onError) == null || f.call(s, e.payload.message, e.payload.code);
        break;
      case "done":
        (g = s.onDone) == null || g.call(s, r);
        break;
    }
}
function _t(e, r) {
  const [s, a] = $(J), l = R(null), o = R(!1), c = R(r);
  c.current = r;
  const i = G(() => {
    var d;
    (d = l.current) == null || d.abort(), o.current = !1, a((_) => ({ ..._, status: "idle" }));
  }, []), u = G(() => {
    var d;
    (d = l.current) == null || d.abort(), o.current = !1, a(J());
  }, []), h = G(async (d) => {
    var f, g, w, S, N, b;
    if (o.current) return;
    o.current = !0;
    const _ = typeof (d == null ? void 0 : d.reconnect) == "object" ? d.reconnect : { maxAttempts: 3, baseDelayMs: 1e3 }, v = d != null && d.reconnect ? _.maxAttempts ?? 3 : 0, k = _.baseDelayMs ?? 1e3, y = (d == null ? void 0 : d.batchMs) === void 0 ? 16 : d.batchMs;
    let m = 0;
    const p = async () => {
      var te;
      (te = l.current) == null || te.abort();
      const C = new AbortController();
      l.current = C;
      const x = { ...J(), status: "streaming" };
      a(x);
      let O = x;
      const A = (d == null ? void 0 : d.method) ?? (d != null && d.body ? "POST" : "GET"), H = (d == null ? void 0 : d.watchdogMs) === void 0 ? 12e4 : d.watchdogMs;
      let D = null;
      const W = () => {
        D && clearTimeout(D);
      }, z = () => {
        W(), H != null && (D = setTimeout(() => {
          var E, U;
          C.abort();
          const L = `SSE stream timed out after ${H}ms of inactivity`;
          a((K) => ({ ...K, status: "error", errorMessage: L, errorCode: "WATCHDOG_TIMEOUT" })), (U = (E = c.current) == null ? void 0 : E.onError) == null || U.call(E, L, "WATCHDOG_TIMEOUT");
        }, H));
      }, P = [];
      let T = null;
      const M = (L) => {
        const E = Le(O, L);
        if (O = E, a(E), Qe(L, E, c.current), L.type === "done" || L.type === "error")
          return W(), L.type;
      }, ee = () => {
        for (; P.length > 0; ) {
          const L = P.shift(), E = M(L);
          if (E) return E;
        }
      }, ke = (L) => {
        if (y != null && Ze.has(L.type)) {
          P.push(L), T || (T = setTimeout(() => {
            T = null, ee();
          }, y));
          return;
        }
        return M(L);
      };
      try {
        const L = await fetch(e, {
          method: A,
          headers: {
            ...A === "POST" ? { "Content-Type": "application/json" } : {},
            ...d == null ? void 0 : d.headers
          },
          body: d != null && d.body ? JSON.stringify(d.body) : void 0,
          signal: C.signal
        });
        if (!L.ok) throw new Error(`HTTP ${L.status}`);
        const E = L.body.getReader(), U = new TextDecoder();
        let K = "";
        for (z(); ; ) {
          const { done: we, value: ye } = await E.read();
          if (we) break;
          z(), K += U.decode(ye, { stream: !0 });
          const re = K.split(`
`);
          K = re.pop() ?? "";
          for (const be of re) {
            const ae = Se(be);
            if (!ae) continue;
            const oe = ke(ae);
            if (oe) return oe;
          }
        }
        T && (clearTimeout(T), T = null);
        const se = ee();
        return se || "interrupted";
      } catch (L) {
        if (L.name === "AbortError") return "interrupted";
        throw L;
      } finally {
        W(), T && clearTimeout(T);
      }
    };
    try {
      for (; ; ) {
        try {
          const C = await p();
          if (C === "done" || C === "error") return;
          if (!(d != null && d.reconnect) || m >= v) {
            const x = "SSE stream ended unexpectedly";
            a((O) => ({ ...O, status: "error", errorMessage: x, errorCode: "STREAM_ENDED" })), (g = (f = c.current) == null ? void 0 : f.onError) == null || g.call(f, x, "STREAM_ENDED");
            return;
          }
        } catch (C) {
          if (!(d != null && d.reconnect) || m >= v) {
            const x = C.message;
            a((O) => ({ ...O, status: "error", errorMessage: x })), (S = (w = c.current) == null ? void 0 : w.onError) == null || S.call(w, x);
            return;
          }
        }
        m += 1, (b = (N = c.current) == null ? void 0 : N.onReconnect) == null || b.call(N, m), await new Promise((C) => setTimeout(C, k * Math.pow(2, m - 1)));
      }
    } finally {
      o.current = !1;
    }
  }, [e]);
  return { state: s, start: h, abort: i, reset: u };
}
const ge = "meso-theme";
function Xe() {
  return typeof window > "u" ? "light" : localStorage.getItem(ge) ?? "light";
}
function et(e) {
  document.documentElement.setAttribute("data-theme", e), localStorage.setItem(ge, e);
}
function ft() {
  const [e, r] = $(Xe);
  I(() => {
    et(e);
  }, [e]);
  const s = G(() => {
    r((a) => a === "light" ? "dark" : "light");
  }, []);
  return { theme: e, toggle: s };
}
const Ne = {
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
}, tt = {
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
}, st = {
  "zh-CN": Ne,
  "en-US": tt
}, X = xe({
  locale: "zh-CN",
  labels: Ne
});
function pt({
  locale: e = "zh-CN",
  labels: r,
  children: s
}) {
  const a = { ...st[e], ...r };
  return /* @__PURE__ */ t(X.Provider, { value: { locale: e, labels: a }, children: s });
}
function vt() {
  return ie(X).labels;
}
function gt() {
  return ie(X);
}
export {
  ut as ArtifactPaneShell,
  q as ArtifactPanel,
  ne as ChatBubble,
  it as ChatComposer,
  Y as CollapsibleToolTrace,
  He as ConfirmGate,
  ht as LogLine,
  pt as MesoLocaleProvider,
  ct as MessageList,
  wt as PROTOCOL_VERSION,
  dt as ProcessTrace,
  fe as ResourceReadBlock,
  mt as SidebarUserMenu,
  he as SkillIndicator,
  ue as SoulIndicator,
  Ie as StageTimeline,
  j as StatusIcon,
  lt as StreamingCursor,
  Q as ThinkBlock,
  nt as ThreeColumnLayout,
  _e as ToolCallBlock,
  We as WorkflowTimeline,
  Le as applyEvent,
  yt as assertCompatibleVersion,
  J as createInitialStreamState,
  bt as createStreamStateWithArtifacts,
  st as defaultLabelsByLocale,
  tt as enUSLabels,
  xt as isCompatibleVersion,
  Se as parseSSELine,
  Ce as phaseRecordToStage,
  Ct as streamStateHasArtifacts,
  ve as useFoldState,
  vt as useMesoLabels,
  gt as useMesoLocale,
  _t as useSSEStream,
  ft as useTheme,
  Ne as zhCNLabels
};
