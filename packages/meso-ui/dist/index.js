import { jsxs as a, jsx as t, Fragment as B } from "react/jsx-runtime";
import J, { useState as $, useRef as R, useEffect as I, useMemo as V, useCallback as G, createContext as xe, useContext as ie } from "react";
import { phaseRecordToStage as Ce, createInitialStreamState as F, parseSSELine as Se, applyEvent as Le } from "./runtime.js";
import { PROTOCOL_VERSION as yt, assertCompatibleVersion as bt, createStreamStateWithArtifacts as xt, isCompatibleVersion as Ct, streamStateHasArtifacts as St } from "./runtime.js";
function lt({
  navItems: e = [],
  sidebarFooter: r,
  sessionColumn: s,
  children: o,
  defaultCollapsed: l = !1,
  appName: n = "Meso",
  sidebarLogo: c,
  sidebarTitle: d,
  mainHeader: h,
  artifactPanel: u,
  defaultArtifactVisible: i = !1,
  onArtifactToggle: _,
  artifactVisible: v,
  showArtifactToggle: w = !0,
  showSessionColumn: y = !0,
  contentMaxWidth: m,
  artifactPanelWidth: p,
  onCollapsedChange: f
}) {
  const [g, k] = $(l), [S, N] = $(i), b = v !== void 0 ? v : S, C = () => {
    const x = !b;
    v === void 0 && N(x), _ == null || _(x);
  };
  return /* @__PURE__ */ a("div", { className: "meso-layout", children: [
    /* @__PURE__ */ a("aside", { className: `meso-sidebar${g ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ a("div", { className: "meso-sidebar__header", children: [
        c ? /* @__PURE__ */ t("div", { className: "meso-sidebar__logo meso-sidebar__logo--custom", children: c }) : /* @__PURE__ */ t("div", { className: "meso-sidebar__logo", children: n[0] }),
        d ? /* @__PURE__ */ t("span", { className: "meso-sidebar__title meso-sidebar__title--brand", children: d }) : /* @__PURE__ */ t("span", { className: "meso-sidebar__title", children: n }),
        /* @__PURE__ */ t(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => {
              const x = !g;
              k(x), f == null || f(x);
            },
            "aria-label": g ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ a("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ t("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ t("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ t("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ t("nav", { className: "meso-sidebar__nav", children: e.map((x) => /* @__PURE__ */ a(
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
    /* @__PURE__ */ a("main", { className: "meso-main", children: [
      /* @__PURE__ */ a("div", { className: "meso-main__header", children: [
        /* @__PURE__ */ t("div", { className: "meso-main__header-content", children: h }),
        w !== !1 && /* @__PURE__ */ t(
          "button",
          {
            className: `meso-artifact-toggle${b ? " meso-artifact-toggle--active" : ""}`,
            onClick: C,
            title: b ? "关闭 Artifact" : "打开 Artifact",
            "aria-label": b ? "关闭 Artifact" : "打开 Artifact",
            children: b ? (
              /* X / close icon */
              /* @__PURE__ */ a("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ t("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                /* @__PURE__ */ t("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
              ] })
            ) : (
              /* Panel / artifact icon */
              /* @__PURE__ */ a("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ t("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                /* @__PURE__ */ t("line", { x1: "14", y1: "3", x2: "14", y2: "21" })
              ] })
            )
          }
        )
      ] }),
      /* @__PURE__ */ a("div", { className: "meso-main__content", children: [
        /* @__PURE__ */ t("div", { className: "meso-main__chat", style: m ? { maxWidth: m, margin: "0 auto", width: "100%" } : void 0, children: o }),
        b && /* @__PURE__ */ a(B, { children: [
          /* @__PURE__ */ t("div", { className: "meso-artifact-divider", "aria-hidden": "true" }),
          /* @__PURE__ */ t(
            "div",
            {
              className: "meso-artifact-pane",
              style: p != null ? { width: p, minWidth: p, maxWidth: p } : void 0,
              children: u
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
  timestamp: o,
  markdown: l = !1,
  renderMarkdown: n
}) {
  const c = l && typeof n == "function";
  return /* @__PURE__ */ a("div", { className: `meso-bubble meso-bubble--${e}`, children: [
    e === "assistant" && /* @__PURE__ */ t("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ a("div", { className: "meso-bubble__body", children: [
      c ? /* @__PURE__ */ t(
        "div",
        {
          className: "meso-bubble__content meso-bubble__md",
          dangerouslySetInnerHTML: { __html: n(r) }
        }
      ) : /* @__PURE__ */ a("div", { className: "meso-bubble__content", children: [
        r.split(`
`).map((d, h) => /* @__PURE__ */ a(J.Fragment, { children: [
          h > 0 && /* @__PURE__ */ t("br", {}),
          d
        ] }, h)),
        s && /* @__PURE__ */ t("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      o && /* @__PURE__ */ t("div", { className: "meso-bubble__timestamp", children: o })
    ] })
  ] });
}
function $e(e) {
  const r = e.replace(/\s+/g, " ").trim();
  if (!r) return "已思考";
  const s = r.split(new RegExp("(?<=[。！？.!?])")).map((l) => l.trim()).filter(Boolean), o = s[s.length - 1] || r;
  return o.length > 36 ? o.slice(0, 36) + "…" : o;
}
function Q({
  content: e,
  pinnedContent: r,
  streaming: s = !1,
  turnStreaming: o,
  autoCollapseDelay: l = 1500,
  defaultOpen: n = !0,
  open: c,
  onOpenChange: d,
  collapseWhen: h = "streamEnd",
  summary: u
}) {
  const i = c !== void 0, [_, v] = $(n), [w, y] = $(null), m = R(null);
  m.current = w;
  const p = i ? c : w !== null ? w : _, f = R(s), g = R(o), k = () => {
    const b = !p;
    i || y(b), d == null || d(b);
  };
  I(() => {
    if (h !== "never" && l !== null) {
      if (f.current && !s) {
        const b = setTimeout(() => {
          i || v(!1), m.current === null && (d == null || d(!1));
        }, l);
        return () => clearTimeout(b);
      }
      f.current = s;
    }
  }, [s, l, h, i, d]), I(() => {
    o !== void 0 && (g.current && !o && y(null), g.current = o);
  }, [o]);
  const S = !s && r !== void 0 ? r : e, N = p ? "思考过程" : u ?? $e(S);
  return /* @__PURE__ */ a("div", { className: `meso-think${p ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ a(
      "button",
      {
        className: "meso-think__header",
        onClick: k,
        "aria-expanded": p,
        children: [
          /* @__PURE__ */ t("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ t("span", { className: "meso-think__label", children: N }),
          s && /* @__PURE__ */ t("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ t("div", { className: "meso-think__body", children: /* @__PURE__ */ a("div", { className: "meso-think__content", children: [
      S,
      s && /* @__PURE__ */ t("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function ct({ active: e = !0 }) {
  return e ? /* @__PURE__ */ t("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function Te(e) {
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
  streaming: o = !1,
  onCopy: l,
  onDownload: n,
  renderMermaid: c,
  highlightCode: d,
  renderMarkdown: h
}) {
  const [u, i] = $(!1), [_, v] = $(e), [w, y] = $(null), [m, p] = $(!1), [f, g] = $(null), k = R("");
  I(() => {
    v(e);
  }, [e]), I(() => {
    e !== "mermaid" || o || !c || r === k.current || (k.current = r, y(null), p(!1), c(r).then((C) => y(C)).catch(() => p(!0)));
  }, [e, o, r, c]), I(() => {
    e !== "code" || o || !d || r === k.current && f || (k.current = r, g(d(r, s)));
  }, [e, o, r, s, d, f]);
  const S = () => {
    navigator.clipboard.writeText(r).catch(() => {
    }), i(!0), setTimeout(() => i(!1), 2e3), l == null || l(r);
  }, N = () => {
    if (n) {
      n(r);
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
  return /* @__PURE__ */ a("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ a("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ t("div", { className: "meso-artifact__tabs", children: (e === "html" ? ["html", "code"] : [e]).map((C) => /* @__PURE__ */ t(
        "span",
        {
          className: `meso-artifact__tab${_ === C ? " meso-artifact__tab--active" : ""}`,
          onClick: () => v(C),
          children: Ee(C, s)
        },
        C
      )) }),
      o && /* @__PURE__ */ t("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ t("button", { className: "meso-artifact__download-btn", onClick: N, title: "下载", "aria-label": "下载文件", children: /* @__PURE__ */ t("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) }) }),
      /* @__PURE__ */ t("button", { className: "meso-artifact__copy-btn", onClick: S, title: "复制", "aria-label": "复制代码", children: u ? /* @__PURE__ */ t("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ a("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ t("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
        /* @__PURE__ */ t("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
      ] }) })
    ] }),
    /* @__PURE__ */ a("div", { className: "meso-artifact__body", children: [
      _ === "html" && /* @__PURE__ */ t("iframe", { className: "meso-artifact__preview", srcDoc: r, sandbox: "allow-scripts", title: "HTML 预览" }),
      _ === "mermaid" && /* @__PURE__ */ a(B, { children: [
        o && /* @__PURE__ */ a("pre", { className: "meso-artifact__code", children: [
          /* @__PURE__ */ t("code", { children: r }),
          /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
        ] }),
        !o && w && /* @__PURE__ */ t(
          "div",
          {
            className: "meso-artifact__mermaid",
            dangerouslySetInnerHTML: { __html: w }
          }
        ),
        !o && !w && !m && !c && /* @__PURE__ */ a("div", { className: "meso-artifact__mermaid-placeholder", children: [
          /* @__PURE__ */ t("span", { children: "图表预览需要集成 Mermaid 渲染器" }),
          /* @__PURE__ */ t("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ t("code", { children: r }) })
        ] }),
        !o && m && /* @__PURE__ */ a("div", { className: "meso-artifact__mermaid-placeholder meso-artifact__mermaid-placeholder--error", children: [
          /* @__PURE__ */ t("span", { children: "图表渲染失败，请检查语法" }),
          /* @__PURE__ */ t("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ t("code", { children: r }) })
        ] }),
        !o && !w && !m && c && /* @__PURE__ */ t("div", { className: "meso-artifact__mermaid-placeholder", children: /* @__PURE__ */ t("span", { children: "渲染中…" }) })
      ] }),
      _ === "markdown" && /* @__PURE__ */ t(B, { children: h ? /* @__PURE__ */ t(
        "div",
        {
          className: "meso-artifact__markdown",
          dangerouslySetInnerHTML: { __html: h(r) }
        }
      ) : /* @__PURE__ */ a("pre", { className: "meso-artifact__code", children: [
        /* @__PURE__ */ t("code", { children: r }),
        o && /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] }) }),
      _ === "table" && /* @__PURE__ */ t(Oe, { content: r, streaming: o }),
      (_ === "code" || _ === "html" && !1) && /* @__PURE__ */ a("pre", { className: "meso-artifact__code", children: [
        f && !o ? /* @__PURE__ */ t("code", { dangerouslySetInnerHTML: { __html: f } }) : /* @__PURE__ */ t("code", { children: r }),
        o && /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] })
    ] })
  ] });
}
function Oe({ content: e, streaming: r }) {
  const s = Te(e);
  return s ? /* @__PURE__ */ t("div", { className: "meso-artifact__table-wrap", children: /* @__PURE__ */ a("table", { className: "meso-artifact__table", children: [
    /* @__PURE__ */ t("thead", { children: /* @__PURE__ */ t("tr", { children: s.headers.map((o, l) => /* @__PURE__ */ t("th", { children: o }, l)) }) }),
    /* @__PURE__ */ t("tbody", { children: s.rows.map((o, l) => /* @__PURE__ */ t("tr", { children: o.map((n, c) => /* @__PURE__ */ t("td", { children: String(n) }, c)) }, l)) })
  ] }) }) : /* @__PURE__ */ a("pre", { className: "meso-artifact__code", children: [
    /* @__PURE__ */ t("code", { children: e }),
    r && /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
  ] });
}
function Ee(e, r) {
  return e === "html" ? "HTML 预览" : e === "mermaid" ? "图表" : e === "markdown" ? "Markdown" : e === "table" ? "表格" : r || "Code";
}
const Re = {
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
  "aria-label": o
}) {
  const l = o ?? Re[e];
  return /* @__PURE__ */ a(
    "span",
    {
      className: `meso-status-icon meso-status-icon--${e}${s ? ` ${s}` : ""}`,
      style: { width: r, height: r },
      role: "img",
      "aria-label": l,
      children: [
        e === "running" && /* @__PURE__ */ a("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ t("circle", { cx: "8", cy: "8", r: "6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeDasharray: "3 3", className: "meso-status-icon__spin" }),
          /* @__PURE__ */ t("circle", { cx: "8", cy: "8", r: "2.5", fill: "currentColor", className: "meso-status-icon__pulse" })
        ] }),
        e === "done" && /* @__PURE__ */ a("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ t("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ t("polyline", { points: "4.5,8 7,10.5 11.5,5.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
        ] }),
        e === "error" && /* @__PURE__ */ a("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ t("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ t("line", { x1: "5.5", y1: "5.5", x2: "10.5", y2: "10.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" }),
          /* @__PURE__ */ t("line", { x1: "10.5", y1: "5.5", x2: "5.5", y2: "10.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" })
        ] }),
        e === "pending" && /* @__PURE__ */ t("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ t("circle", { cx: "8", cy: "8", r: "6.25", stroke: "currentColor", strokeWidth: "1.5" }) }),
        e === "warning" && /* @__PURE__ */ a("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ t("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ t("line", { x1: "8", y1: "5", x2: "8", y2: "9", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" }),
          /* @__PURE__ */ t("circle", { cx: "8", cy: "11.5", r: "0.75", fill: "white" })
        ] })
      ]
    }
  );
}
function Ie(e) {
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
function Me({ stages: e, compact: r = !1 }) {
  return e.length === 0 ? null : /* @__PURE__ */ t("div", { className: `meso-stages${r ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: e.map((s, o) => /* @__PURE__ */ a(
    "div",
    {
      className: `meso-stage meso-stage--${s.status}`,
      children: [
        /* @__PURE__ */ t("div", { className: "meso-stage__dot", children: /* @__PURE__ */ t(j, { status: Ie(s.status), size: 10 }) }),
        o < e.length - 1 && /* @__PURE__ */ t("div", { className: `meso-stage__line${s.status === "done" ? " meso-stage__line--done" : ""}` }),
        /* @__PURE__ */ t("span", { className: `meso-stage__label${r ? " meso-stage__label--compact" : ""}`, children: s.label })
      ]
    },
    s.id
  )) });
}
function Be(e) {
  const { nodes: r, nodeOrder: s } = e, o = /* @__PURE__ */ new Map();
  for (const d of s) {
    const h = r[d];
    if (!h) continue;
    const u = h.parent_id ?? null;
    o.has(u) || o.set(u, []), o.get(u).push(d);
  }
  const l = /* @__PURE__ */ new Map();
  for (const [, d] of o)
    if (d.length > 1)
      for (const h of d) l.set(h, d);
  const n = [], c = /* @__PURE__ */ new Set();
  for (const d of s) {
    if (c.has(d)) continue;
    const h = r[d];
    if (!h) continue;
    const u = l.get(d);
    if (u) {
      const i = u.map((_) => r[_]).filter((_) => !!_);
      for (const _ of i) c.add(_.node_id);
      n.push({ kind: "parallel", nodes: i, isLast: !1 });
    } else
      c.add(d), n.push({ kind: "node", node: h, isLast: !1 });
  }
  return n.length > 0 && (n[n.length - 1] = { ...n[n.length - 1], isLast: !0 }), n;
}
function Ae(e) {
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
      status: Ae(e),
      size: 12,
      className: `meso-wf-node__icon meso-wf-node__icon--${e}`
    }
  );
}
function me(e) {
  return e < 1e3 ? `${e}ms` : `${(e / 1e3).toFixed(1)}s`;
}
function De({ node: e, isLast: r }) {
  var n;
  const [s, o] = $(!1), l = e.metadata && Object.keys(e.metadata).length > 0;
  return /* @__PURE__ */ a("div", { className: `meso-wf-node meso-wf-node--${e.state}`, children: [
    /* @__PURE__ */ a("div", { className: "meso-wf-node__track", children: [
      /* @__PURE__ */ t("div", { className: "meso-wf-node__dot", children: /* @__PURE__ */ t(de, { state: e.state }) }),
      !r && /* @__PURE__ */ t("div", { className: "meso-wf-node__line" })
    ] }),
    /* @__PURE__ */ a("div", { className: "meso-wf-node__body", children: [
      /* @__PURE__ */ a("div", { className: "meso-wf-node__header", children: [
        /* @__PURE__ */ t("code", { className: "meso-wf-node__name", children: e.name }),
        e.duration_ms !== void 0 && /* @__PURE__ */ t("span", { className: "meso-wf-node__duration", children: me(e.duration_ms) }),
        l && /* @__PURE__ */ t(
          "button",
          {
            className: "meso-wf-node__expand",
            onClick: () => o((c) => !c),
            "aria-expanded": s,
            "aria-label": s ? "收起详情" : "展开详情",
            children: /* @__PURE__ */ t("svg", { viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", style: { transform: s ? "rotate(180deg)" : void 0 }, children: /* @__PURE__ */ t("polyline", { points: "2,3.5 5,6.5 8,3.5" }) })
          }
        )
      ] }),
      e.state === "error" && !!((n = e.metadata) != null && n.error) && /* @__PURE__ */ t("div", { className: "meso-wf-node__error", children: String(e.metadata.error) }),
      s && l && /* @__PURE__ */ t("pre", { className: "meso-wf-node__meta", children: JSON.stringify(e.metadata, null, 2) })
    ] })
  ] });
}
function We({ nodes: e, isLast: r }) {
  return /* @__PURE__ */ a("div", { className: "meso-wf-parallel", children: [
    /* @__PURE__ */ t("div", { className: "meso-wf-parallel__row", children: e.map((s, o) => {
      var l;
      return /* @__PURE__ */ a("div", { className: `meso-wf-parallel__branch meso-wf-parallel__branch--${s.state}`, children: [
        /* @__PURE__ */ t("div", { className: "meso-wf-parallel__branch-dot", children: /* @__PURE__ */ t(de, { state: s.state }) }),
        /* @__PURE__ */ a("div", { className: "meso-wf-parallel__branch-body", children: [
          /* @__PURE__ */ a("div", { className: "meso-wf-parallel__branch-label", children: [
            "并行分支 ",
            String.fromCharCode(65 + o)
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
function Pe({ runs: e, showRunId: r = !0, hidden: s }) {
  if (e.length === 0 || s) return null;
  const o = e.length > 1;
  return /* @__PURE__ */ t("div", { className: "meso-wf", role: "status", "aria-label": "工作流进度", children: e.map((l) => {
    const n = Be(l);
    return /* @__PURE__ */ a("div", { className: "meso-wf-run", children: [
      o && r && /* @__PURE__ */ t("div", { className: "meso-wf-run__label", children: l.run_id }),
      n.map(
        (c, d) => c.kind === "parallel" ? /* @__PURE__ */ t(We, { nodes: c.nodes, isLast: c.isLast }, `parallel-${d}`) : /* @__PURE__ */ t(De, { node: c.node, isLast: c.isLast }, c.node.node_id)
      )
    ] }, l.run_id);
  }) });
}
function ue({ soul: e, compact: r = !1 }) {
  const s = e.name.charAt(0);
  return /* @__PURE__ */ a(
    "div",
    {
      className: `meso-soul${r ? " meso-soul--compact" : ""}`,
      title: `${e.name} v${e.version}`,
      role: "status",
      "aria-label": `当前 Soul: ${e.name}`,
      children: [
        /* @__PURE__ */ t("div", { className: "meso-soul__avatar", children: e.avatar ? /* @__PURE__ */ t("img", { src: e.avatar, alt: e.name, className: "meso-soul__img" }) : /* @__PURE__ */ t("span", { className: "meso-soul__initial", children: s }) }),
        !r && /* @__PURE__ */ a(B, { children: [
          /* @__PURE__ */ t("span", { className: "meso-soul__name", children: e.name }),
          e.traits && e.traits.length > 0 && /* @__PURE__ */ t("div", { className: "meso-soul__traits", children: e.traits.map((o) => /* @__PURE__ */ t("span", { className: "meso-soul__trait", children: o }, o)) })
        ] })
      ]
    }
  );
}
const je = {
  mcp: "MCP",
  api: "API"
};
function he({ skill: e }) {
  const r = e.provider ? je[e.provider] : null;
  return /* @__PURE__ */ a(
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
        e.focus && e.focus.length > 0 && /* @__PURE__ */ a("span", { className: "meso-skill__focus", children: [
          "· ",
          e.focus.join(", ")
        ] }),
        r && /* @__PURE__ */ t("span", { className: "meso-skill__provider", children: r })
      ]
    }
  );
}
const He = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function ze({ toolCall: e, onConfirm: r, onCancel: s }) {
  const o = e.risk ?? "safe", l = He[o], n = Object.keys(e.args).length > 0;
  return /* @__PURE__ */ a("div", { className: `meso-confirm-gate meso-confirm-gate--${o}`, role: "alertdialog", "aria-label": "工具执行确认", "data-testid": "meso-confirm-gate", children: [
    /* @__PURE__ */ t("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ a("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ t("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ t("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ a("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ a("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ t("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${o}`, children: l.label }),
        /* @__PURE__ */ t("code", { className: "meso-confirm-gate__tool-name", children: e.name })
      ] }),
      n && /* @__PURE__ */ t("pre", { className: "meso-confirm-gate__args", children: JSON.stringify(e.args, null, 2) }),
      /* @__PURE__ */ a("div", { className: "meso-confirm-gate__actions", children: [
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
            className: `meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${o}`,
            onClick: () => r(e.id),
            children: l.confirmText
          }
        )
      ] })
    ] })
  ] });
}
function Ke(e) {
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
function Ue(e) {
  switch (e) {
    case "pending":
      return "pending";
    case "done":
      return "done";
    case "error":
      return "error";
  }
}
function Ve(e) {
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
const Ge = {
  safe: "只读",
  write: "写入",
  destructive: "危险"
}, le = {
  mcp: "MCP",
  api: "API",
  local: "本地"
};
function _e({ toolCall: e, onConfirm: r, onCancel: s, className: o, "data-testid": l, simplify: n }) {
  var z, P;
  const { call: c, result: d, status: h } = e, u = c.risk ?? "safe", i = Object.keys(c.args).length > 0, _ = (n == null ? void 0 : n.verbosity) ?? (n != null && n.compact ? "compact" : "standard"), v = _ === "compact", w = _ === "standard", y = _ === "detailed", m = (n == null ? void 0 : n.showDuration) ?? !0, p = (n == null ? void 0 : n.showProvider) ?? !v, f = (n == null ? void 0 : n.showRiskLevel) ?? (w || y), g = (n == null ? void 0 : n.showExecutionTimeline) ?? y, k = (n == null ? void 0 : n.defaultParamsCollapsed) ?? (v || w), S = (n == null ? void 0 : n.defaultOutputCollapsed) ?? (v || w), N = (n == null ? void 0 : n.defaultMetadataCollapsed) ?? (v || w), [b, C] = $(!k), [x, O] = $(!S), [A, H] = $(!N), D = (z = d == null ? void 0 : d.metadata) == null ? void 0 : z.resultCount, W = d == null ? void 0 : d.narration;
  return /* @__PURE__ */ a(
    "div",
    {
      className: `meso-tool meso-tool--${h} meso-tool--risk-${u} meso-tool--${_}${o ? ` ${o}` : ""}`,
      "data-testid": l ?? "meso-tool-call-block",
      children: [
        /* @__PURE__ */ a("div", { className: "meso-tool__header", children: [
          /* @__PURE__ */ t(j, { status: Ke(h), size: 14, className: "meso-tool__status-icon" }),
          /* @__PURE__ */ t("span", { className: "meso-tool__name", children: c.name }),
          D !== void 0 && /* @__PURE__ */ a("span", { className: "meso-tool__summary", children: [
            "— ",
            D,
            " 项"
          ] }),
          m && (d == null ? void 0 : d.duration_ms) !== void 0 && /* @__PURE__ */ a("span", { className: "meso-tool__duration", children: [
            "(",
            d.duration_ms,
            "ms)"
          ] }),
          f && u !== "safe" && /* @__PURE__ */ t("span", { className: `meso-tool__risk meso-tool__risk--${u}`, children: Ge[u] }),
          p && c.provider && le[c.provider] && /* @__PURE__ */ t("span", { className: `meso-tool__provider meso-tool__provider--${c.provider}`, children: le[c.provider] }),
          ((P = c.annotations) == null ? void 0 : P.open_world) && /* @__PURE__ */ t("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", children: "🌐" })
        ] }),
        W && /* @__PURE__ */ t("div", { className: "meso-tool__narration", children: W }),
        i && /* @__PURE__ */ a("details", { className: "meso-tool__params-details", open: b, children: [
          /* @__PURE__ */ t(
            "summary",
            {
              className: "meso-tool__params-summary",
              onClick: (T) => {
                T.preventDefault(), C((M) => !M);
              },
              children: /* @__PURE__ */ a("span", { className: "meso-tool__params-toggle", children: [
                b ? "▾" : "▸",
                " Input Parameters"
              ] })
            }
          ),
          b && /* @__PURE__ */ t("pre", { className: "meso-tool__args", children: JSON.stringify(c.args, null, y ? 2 : 1) })
        ] }),
        h === "awaiting_confirm" && r && s && /* @__PURE__ */ t(
          ze,
          {
            toolCall: c,
            onConfirm: r,
            onCancel: s
          }
        ),
        (h === "done" || h === "error") && d && /* @__PURE__ */ a("details", { className: "meso-tool__result-details", open: x, children: [
          /* @__PURE__ */ t(
            "summary",
            {
              className: "meso-tool__result-summary",
              onClick: (T) => {
                T.preventDefault(), O((M) => !M);
              },
              children: /* @__PURE__ */ a("span", { className: "meso-tool__result-toggle", children: [
                x ? "▾" : "▸",
                " ",
                h === "error" ? "Error" : "Output"
              ] })
            }
          ),
          x && /* @__PURE__ */ t("pre", { className: `meso-tool__output${h === "error" ? " meso-tool__output--error" : ""}`, children: h === "error" ? d.error : y ? d.output : d.output.slice(0, 200) + (d.output.length > 200 ? "..." : "") })
        ] }),
        (d == null ? void 0 : d.metadata) && /* @__PURE__ */ a("details", { className: "meso-tool__metadata-details", open: A, children: [
          /* @__PURE__ */ t(
            "summary",
            {
              className: "meso-tool__metadata-summary",
              onClick: (T) => {
                T.preventDefault(), H((M) => !M);
              },
              children: /* @__PURE__ */ a("span", { className: "meso-tool__metadata-toggle", children: [
                A ? "▾" : "▸",
                " Metadata"
              ] })
            }
          ),
          A && /* @__PURE__ */ a("div", { className: "meso-tool__metadata", children: [
            d.metadata.resultCount !== void 0 && /* @__PURE__ */ a("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-key", children: "resultCount:" }),
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-value", children: d.metadata.resultCount })
            ] }),
            d.metadata.category !== void 0 && /* @__PURE__ */ a("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-key", children: "category:" }),
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-value", children: d.metadata.category })
            ] }),
            y && d.metadata.custom && /* @__PURE__ */ a("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-key", children: "custom:" }),
              /* @__PURE__ */ t("pre", { className: "meso-tool__metadata-custom", children: JSON.stringify(d.metadata.custom, null, 2) })
            ] })
          ] })
        ] }),
        y && g && (d == null ? void 0 : d.duration_ms) && /* @__PURE__ */ a("details", { className: "meso-tool__timeline-details", open: !1, children: [
          /* @__PURE__ */ t("summary", { className: "meso-tool__timeline-summary", children: "Execution Timeline" }),
          /* @__PURE__ */ t("div", { className: "meso-tool__timeline", children: /* @__PURE__ */ a("div", { className: "meso-tool__timeline-row", children: [
            /* @__PURE__ */ t("span", { className: "meso-tool__timeline-label", children: "Duration:" }),
            /* @__PURE__ */ a("span", { className: "meso-tool__timeline-value", children: [
              d.duration_ms,
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
  onlyShowCurrent: o = !1,
  simplify: l,
  onToolClick: n,
  onToolConfirm: c,
  onToolCancel: d,
  renderSummary: h
}) {
  const u = e.toolCallOrder, i = o && u.length > 0 ? [u[u.length - 1]] : u, [_, v] = $(() => {
    if (r === "none") return /* @__PURE__ */ new Set();
    if (r === "all") return new Set(i);
    if (r === "current" && i.length > 0)
      return /* @__PURE__ */ new Set([i[i.length - 1]]);
    if (r === "last-n" && i.length > 0) {
      const m = i.slice(-s);
      return new Set(m);
    }
    return /* @__PURE__ */ new Set();
  }), w = (m) => {
    const p = new Set(_);
    p.has(m) ? p.delete(m) : p.add(m), v(p), n == null || n(m);
  }, y = (m, p) => {
    var x;
    const { call: f, result: g, status: k } = m;
    if (h)
      return String(h(m, p) ?? "");
    const S = k === "error" ? "✗" : "✓", N = f.name, b = (x = g == null ? void 0 : g.metadata) != null && x.resultCount ? ` — ${g.metadata.resultCount} 项` : "", C = g != null && g.duration_ms ? ` (${g.duration_ms}ms)` : "";
    return `${S} ${N}${b}${C}`;
  };
  return i.length === 0 ? null : /* @__PURE__ */ t("div", { className: "meso-collapsible-tool-trace", children: i.map((m, p) => {
    const f = e.toolCalls[m];
    if (!f) return null;
    const g = _.has(m), { status: k } = f;
    return /* @__PURE__ */ a("div", { className: `meso-collapsible-tool__item meso-collapsible-tool__item--${k}`, children: [
      /* @__PURE__ */ a(
        "button",
        {
          className: "meso-collapsible-tool__summary",
          onClick: () => w(m),
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
          onCancel: d,
          simplify: l
        }
      ) })
    ] }, m);
  }) });
}
function fe({ resourceRead: e, className: r }) {
  const [s, o] = $(!1), { read: l, content: n, status: c } = e, d = l.name ?? l.uri, h = l.server;
  return /* @__PURE__ */ a("div", { className: `meso-resource meso-resource--${c}${r ? ` ${r}` : ""}`, children: [
    /* @__PURE__ */ a("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ t(j, { status: Ue(c), size: 13, className: "meso-resource__status-icon" }),
      /* @__PURE__ */ t("span", { className: "meso-resource__uri", title: l.uri, children: d }),
      h && /* @__PURE__ */ t("span", { className: "meso-resource__server", children: h }),
      (n == null ? void 0 : n.duration_ms) !== void 0 && /* @__PURE__ */ a("span", { className: "meso-resource__duration", children: [
        n.duration_ms,
        "ms"
      ] }),
      (c === "done" || c === "error") && n && /* @__PURE__ */ a(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => o((u) => !u),
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
    s && n && /* @__PURE__ */ t("div", { className: "meso-resource__content", children: c === "error" ? /* @__PURE__ */ t("pre", { className: "meso-resource__text meso-resource__text--error", children: n.error }) : n.contents.map((u, i) => /* @__PURE__ */ a("div", { children: [
      u.type === "text" && /* @__PURE__ */ t("pre", { className: "meso-resource__text", children: u.text }),
      u.type === "image" && u.data && /* @__PURE__ */ t(
        "img",
        {
          className: "meso-resource__image",
          src: `data:${u.mime_type ?? "image/png"};base64,${u.data}`,
          alt: "resource"
        }
      ),
      u.type === "blob" && /* @__PURE__ */ a("span", { className: "meso-resource__blob-label", children: [
        "[",
        u.mime_type ?? "binary",
        "]"
      ] })
    ] }, i)) })
  ] });
}
function Z(e) {
  return e === "html" || e === "html preview" ? { type: "html" } : e === "mermaid" ? { type: "mermaid" } : e === "markdown" ? { type: "markdown" } : e === "table" ? { type: "table" } : { type: "code", language: e };
}
function pe(e) {
  const r = e.toolCallOrder, s = r.length - 1, o = r.slice(0, s).filter((n) => e.toolCalls[n].result !== void 0), l = r[s];
  return { frozenIds: o, currentId: l };
}
function Fe({
  stream: e,
  onToolConfirm: r,
  onToolCancel: s
}) {
  const { frozenIds: o, currentId: l } = V(
    () => pe(e),
    [e.toolCallOrder, e.toolCalls]
  );
  return e.toolCallOrder.length === 0 ? null : /* @__PURE__ */ a(B, { children: [
    o.length > 0 && /* @__PURE__ */ t("div", { className: "meso-message-list__frozen-tools", children: /* @__PURE__ */ t(
      Y,
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
function Je(e, r) {
  const s = [];
  let o = "", l = null, n = 0;
  const c = () => {
    l !== null && o.length > 0 && s.push({ kind: "text", key: l, text: o }), o = "", l = null;
  };
  for (const d of e.eventLog) {
    const { type: h, id: u } = d;
    if (h === "text") {
      const i = e.textChunks.find((_) => _.id === u);
      if (!i) continue;
      l === null && (l = `text-${u}`), o += i.delta;
    } else if (h === "tool_call") {
      if (!e.toolCalls[u]) continue;
      c(), s.push({ kind: "tool", key: `tool-${u}`, id: u });
    } else if (h === "resource_read") {
      if (!e.resourceReads[u]) continue;
      c(), s.push({ kind: "resource", key: `resource-${u}`, id: u });
    } else if (h === "extension") {
      if (n >= e.extensionLog.length) continue;
      c(), s.push({ kind: "extension", key: `ext-${n}`, index: n }), n++;
    } else if (h === "artifact") {
      const i = e.artifacts[u];
      if (!i || r != null && r.includes(i.lang)) continue;
      c(), s.push({ kind: "artifact", key: `artifact-${u}`, id: u });
    }
  }
  return c(), s;
}
function ce({
  stream: e,
  streaming: r,
  onToolConfirm: s,
  onToolCancel: o,
  renderExtension: l,
  onArtifactCopy: n,
  onArtifactDownload: c,
  renderMermaid: d,
  highlightCode: h,
  renderMarkdown: u,
  hiddenArtifactLangs: i,
  simplify: _
}) {
  const { currentId: v } = V(
    () => pe(e),
    [e.toolCallOrder, e.toolCalls]
  ), w = V(
    () => Je(e, i),
    [e.eventLog, e.textChunks, e.artifacts, e.toolCalls, e.resourceReads, e.extensionLog, i]
  ), y = V(() => {
    for (let m = w.length - 1; m >= 0; m--)
      if (w[m].kind === "text") return w[m].key;
    return null;
  }, [w]);
  return /* @__PURE__ */ a("div", { className: "meso-message-list__interleaved", children: [
    (e.activeSoul || e.activeSkill) && /* @__PURE__ */ a("div", { className: "meso-message-list__context-row", children: [
      e.activeSoul && /* @__PURE__ */ t(ue, { soul: e.activeSoul }),
      e.activeSkill && /* @__PURE__ */ t(he, { skill: e.activeSkill })
    ] }),
    e.memorySnippets.length > 0 && /* @__PURE__ */ t("div", { className: "meso-memory-chips", children: e.memorySnippets.map((m, p) => /* @__PURE__ */ a("span", { className: "meso-memory-chip", title: m.content, children: [
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
    w.map((m) => {
      if (m.kind === "text") {
        const k = typeof u == "function", S = r && m.key === y && e.artifactOrder.length === 0;
        return /* @__PURE__ */ t("div", { className: "meso-event-text", "data-streaming-role": "content", children: k ? /* @__PURE__ */ t("div", { className: "meso-bubble__md", dangerouslySetInnerHTML: { __html: u(m.text) } }) : /* @__PURE__ */ a(B, { children: [
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
                onToolCancel: S ? o : void 0
              }
            )
          },
          m.key
        );
      }
      if (m.kind === "resource") {
        const k = e.resourceReads[m.id];
        return k ? /* @__PURE__ */ t("div", { className: "meso-event-resource", "data-streaming-role": "content", children: /* @__PURE__ */ t(fe, { resourceRead: k }) }, m.key) : null;
      }
      if (m.kind === "extension") {
        if (!l) return null;
        const k = e.extensionLog[m.index];
        return k ? /* @__PURE__ */ t("div", { className: "meso-event-extension", "data-streaming-role": "content", children: l(k) }, m.key) : null;
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
          onCopy: n,
          onDownload: c,
          renderMermaid: d,
          highlightCode: h,
          renderMarkdown: u
        }
      ) }, m.key);
    }),
    e.memorySaved.length > 0 && /* @__PURE__ */ t("div", { className: "meso-memory-saved", children: e.memorySaved.map((m) => /* @__PURE__ */ a("span", { className: "meso-memory-saved__chip", title: m.preview, children: [
      /* @__PURE__ */ t("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ t("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
      "已记忆 [",
      m.category,
      "]"
    ] }, m.id)) })
  ] });
}
function it({
  messages: e,
  streaming: r,
  onArtifactCopy: s,
  onArtifactDownload: o,
  onToolConfirm: l,
  onToolCancel: n,
  emptyState: c,
  emptyStateAlign: d = "center",
  className: h,
  renderExtension: u,
  renderLiveTrace: i,
  renderMarkdown: _,
  renderMermaid: v,
  highlightCode: w,
  hiddenArtifactLangs: y,
  renderingMode: m,
  simplify: p
}) {
  const f = R(null), g = m !== "block", k = m || "blend";
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
  return /* @__PURE__ */ t("div", { className: `meso-message-list meso-message-list--mode-${k}${h ? ` ${h}` : ""}`, children: /* @__PURE__ */ a("div", { className: "meso-message-list__inner", children: [
    !S && c && /* @__PURE__ */ t("div", { className: `meso-message-list__empty${d === "top" ? " meso-message-list__empty--top" : ""}`, children: c }),
    e.map((N) => N.role === "assistant" && N.trace && g ? /* @__PURE__ */ a("div", { className: "meso-message-list__committed", children: [
      /* @__PURE__ */ t(
        ce,
        {
          stream: N.trace,
          streaming: !1,
          renderExtension: u,
          onArtifactCopy: s,
          onArtifactDownload: o,
          renderMermaid: v,
          highlightCode: w,
          renderMarkdown: _,
          hiddenArtifactLangs: y,
          simplify: p
        }
      ),
      N.timestamp && /* @__PURE__ */ t("div", { className: "meso-bubble__timestamp", children: N.timestamp })
    ] }, N.id) : /* @__PURE__ */ a(J.Fragment, { children: [
      /* @__PURE__ */ t(
        ae,
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
            onDownload: o,
            renderMermaid: v,
            highlightCode: w,
            renderMarkdown: _
          },
          b.id
        );
      })
    ] }, N.id)),
    r && r.status !== "idle" && /* @__PURE__ */ t("div", { className: "meso-message-list__live", children: i ? i(r) : /* @__PURE__ */ t(B, { children: g ? /* @__PURE__ */ t(
      ce,
      {
        stream: r,
        streaming: r.status === "streaming",
        onToolConfirm: l,
        onToolCancel: n,
        renderExtension: u,
        onArtifactCopy: s,
        onArtifactDownload: o,
        renderMermaid: v,
        highlightCode: w,
        renderMarkdown: _,
        hiddenArtifactLangs: y,
        simplify: p
      }
    ) : /* @__PURE__ */ a(B, { children: [
      (r.activeSoul || r.activeSkill) && /* @__PURE__ */ a("div", { className: "meso-message-list__context-row", children: [
        r.activeSoul && /* @__PURE__ */ t(ue, { soul: r.activeSoul }),
        r.activeSkill && /* @__PURE__ */ t(he, { skill: r.activeSkill })
      ] }),
      /* @__PURE__ */ t(
        Fe,
        {
          stream: r,
          onToolConfirm: l,
          onToolCancel: n
        }
      ),
      u && r.extensionLog.length > 0 && /* @__PURE__ */ t("div", { className: "meso-message-list__extensions", children: r.extensionLog.map((N, b) => /* @__PURE__ */ t(J.Fragment, { children: u(N) }, b)) }),
      (r.textContent || r.status === "streaming") && /* @__PURE__ */ t(
        ae,
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
            onDownload: o,
            renderMermaid: v,
            highlightCode: w,
            renderMarkdown: _
          },
          N
        );
      }),
      r.memorySaved.length > 0 && /* @__PURE__ */ t("div", { className: "meso-memory-saved", children: r.memorySaved.map((N) => /* @__PURE__ */ a("span", { className: "meso-memory-saved__chip", title: N.preview, children: [
        /* @__PURE__ */ t("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ t("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        N.category,
        "]"
      ] }, N.id)) })
    ] }) }) }),
    /* @__PURE__ */ t("div", { ref: f })
  ] }) });
}
function dt({
  value: e,
  onChange: r,
  onSubmit: s,
  onStop: o,
  streaming: l = !1,
  disabled: n = !1,
  placeholder: c = "输入消息… (Ctrl+Enter 发送，Enter 换行)",
  leadingSlot: d,
  trailingActions: h,
  maxRows: u = 8
}) {
  const i = R(null), _ = 22, v = () => {
    const p = i.current;
    p && (p.style.height = "auto", p.style.height = Math.min(p.scrollHeight, _ * u) + "px");
  };
  I(v, [e]);
  const w = (p) => {
    p.key === "Enter" && (p.ctrlKey || p.metaKey) && (p.preventDefault(), !n && !l && e.trim() && s());
  }, y = !n && !l && e.trim().length > 0, m = /* @__PURE__ */ t(
    "button",
    {
      className: `meso-composer__send${l ? " meso-composer__send--stop" : ""}`,
      onClick: l ? o : s,
      disabled: l ? !1 : !y,
      "aria-label": l ? "停止生成" : "发送",
      title: l ? "停止生成" : "Ctrl+Enter",
      children: l ? (
        /* Stop square */
        /* @__PURE__ */ t("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ t("rect", { x: "4", y: "4", width: "16", height: "16", rx: "2" }) })
      ) : (
        /* Send arrow */
        /* @__PURE__ */ a("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ t("line", { x1: "12", y1: "19", x2: "12", y2: "5" }),
          /* @__PURE__ */ t("polyline", { points: "5,12 12,5 19,12" })
        ] })
      )
    }
  );
  return /* @__PURE__ */ t("div", { className: "meso-composer", children: /* @__PURE__ */ a("div", { className: "meso-composer__box", children: [
    /* @__PURE__ */ t(
      "textarea",
      {
        ref: i,
        className: "meso-composer__textarea",
        value: e,
        onChange: (p) => {
          r(p.target.value), v();
        },
        onKeyDown: w,
        placeholder: c,
        rows: 1,
        disabled: n && !l,
        "aria-label": "消息输入框"
      }
    ),
    /* @__PURE__ */ a("div", { className: "meso-composer__toolbar", children: [
      /* @__PURE__ */ t("div", { className: "meso-composer__leading", children: d }),
      /* @__PURE__ */ t("span", { className: "meso-composer__hint", children: e.length > 0 && `${e.length} 字` }),
      /* @__PURE__ */ t("div", { className: "meso-composer__trailing", children: h ?? m })
    ] })
  ] }) });
}
function ve({
  system: e,
  resetOnTurnStart: r = !1
}) {
  const [s, o] = $(null), l = R(e);
  return I(() => {
    r && !l.current && e && o(null), l.current = e;
  }, [e, r]), {
    open: s !== null ? s : e,
    setOpen: (c) => o(c),
    toggle: () => o((c) => c !== null ? !c : !e),
    clearIntent: () => o(null),
    hasUserIntent: s !== null
  };
}
function qe(e) {
  const r = /* @__PURE__ */ new Map(), s = [];
  for (const o of e.toolCallOrder) {
    const l = e.toolCalls[o];
    if (!l) continue;
    const n = l.groupId ? `${l.groupKind ?? "group"}:${l.groupId}` : `__single__:${o}`;
    r.has(n) || (r.set(n, {
      key: n,
      groupId: l.groupId,
      groupKind: l.groupKind,
      ids: []
    }), s.push(n)), r.get(n).ids.push(o);
  }
  return s.map((o) => r.get(o));
}
function Ye(e) {
  const r = e.toolCallOrder.length + e.workflowRunOrder.reduce(
    (l, n) => {
      var c;
      return l + (((c = e.workflowRuns[n]) == null ? void 0 : c.nodeOrder.length) ?? 0);
    },
    0
  ), s = e.toolCallOrder.filter((l) => {
    var n;
    return ((n = e.toolCalls[l]) == null ? void 0 : n.status) === "error";
  }).length + e.workflowRunOrder.reduce((l, n) => {
    const c = e.workflowRuns[n];
    return c ? l + c.nodeOrder.filter((d) => {
      var h;
      return ((h = c.nodes[d]) == null ? void 0 : h.state) === "error";
    }).length : l;
  }, 0), o = [];
  return e.phaseOrder.length > 0 && o.push(`${e.phaseOrder.length} 阶段`), r > 0 && o.push(`${r} 步`), s > 0 && o.push(`${s} 项失败`), o.length > 0 ? o.join(" · ") : "执行过程";
}
function Ze(e, r) {
  const s = !!(e.thinkContent || e.pinnedThink);
  return /* @__PURE__ */ a("div", { className: "meso-process-trace__phase", "data-testid": `meso-phase-${e.id}`, children: [
    /* @__PURE__ */ a("div", { className: "meso-process-trace__phase-header", children: [
      /* @__PURE__ */ t(j, { status: Ve(e.state), size: 14 }),
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
function mt({
  stream: e,
  streaming: r = !1,
  turnStreaming: s = !1,
  defaultCollapsed: o = !1,
  className: l,
  onToolConfirm: n,
  onToolCancel: c,
  renderToolCall: d,
  renderPhase: h,
  renderWorkflow: u,
  simplify: i
}) {
  const _ = ve({
    system: !o,
    resetOnTurnStart: s
  });
  if (!(!!e.thinkContent || e.phaseOrder.length > 0 || e.memorySnippets.length > 0 || e.resourceReadOrder.length > 0 || e.toolCallOrder.length > 0 || e.workflowRunOrder.length > 0)) return null;
  const w = Ye(e), y = e.workflowRunOrder.map((f) => e.workflowRuns[f]).filter(Boolean), m = qe(e), p = e.phaseOrder.map((f) => e.phases[f]).filter(Boolean).map(Ce);
  return /* @__PURE__ */ a(
    "div",
    {
      className: `meso-process-trace${l ? ` ${l}` : ""}`,
      "data-testid": "meso-process-trace",
      children: [
        /* @__PURE__ */ a(
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
              /* @__PURE__ */ t("span", { className: "meso-process-trace__summary", children: w }),
              r && /* @__PURE__ */ t("span", { className: "meso-process-trace__dot", "aria-label": "执行中" })
            ]
          }
        ),
        _.open && /* @__PURE__ */ a("div", { className: "meso-process-trace__body", children: [
          p.length > 0 && /* @__PURE__ */ t(Me, { compact: !0, stages: p }),
          e.memorySnippets.length > 0 && /* @__PURE__ */ t("div", { className: "meso-memory-chips", children: e.memorySnippets.map((f, g) => /* @__PURE__ */ a("span", { className: "meso-memory-chip", title: f.content, children: [
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
            const k = h == null ? void 0 : h(g);
            return k != null ? /* @__PURE__ */ t("div", { children: k }, f) : /* @__PURE__ */ t("div", { children: Ze(g, r) }, f);
          }) }),
          e.resourceReadOrder.length > 0 && /* @__PURE__ */ t("div", { className: "meso-process-trace__resources", children: e.resourceReadOrder.map((f) => {
            const g = e.resourceReads[f];
            return g ? /* @__PURE__ */ t(fe, { resourceRead: g }, f) : null;
          }) }),
          m.length > 0 && /* @__PURE__ */ t("div", { className: "meso-process-trace__tools", children: m.map((f) => /* @__PURE__ */ a(
            "div",
            {
              className: `meso-process-trace__tool-group${f.groupId ? " meso-process-trace__tool-group--grouped" : ""}`,
              "data-group-id": f.groupId,
              "data-group-kind": f.groupKind,
              children: [
                f.groupId && /* @__PURE__ */ a("div", { className: "meso-process-trace__tool-group-label", children: [
                  f.groupKind ?? "group",
                  ": ",
                  f.groupId
                ] }),
                f.ids.map((g) => {
                  const k = e.toolCalls[g];
                  if (!k) return null;
                  const S = d == null ? void 0 : d(k);
                  return S != null ? /* @__PURE__ */ t("div", { children: S }, g) : /* @__PURE__ */ t(
                    _e,
                    {
                      toolCall: k,
                      onConfirm: n,
                      onCancel: c,
                      simplify: i
                    },
                    g
                  );
                })
              ]
            },
            f.key
          )) }),
          y.length > 0 && ((u == null ? void 0 : u(e)) ?? /* @__PURE__ */ t(Pe, { runs: y }))
        ] })
      ]
    }
  );
}
function ut({
  name: e,
  email: r,
  avatarText: s,
  menuItems: o = [],
  onSignOut: l
}) {
  const [n, c] = $(!1), d = R(null);
  I(() => {
    if (!n) return;
    const i = (_) => {
      d.current && !d.current.contains(_.target) && c(!1);
    };
    return document.addEventListener("mousedown", i), () => document.removeEventListener("mousedown", i);
  }, [n]);
  const h = s ?? e.charAt(0).toUpperCase(), u = [
    ...o,
    ...l ? [{ label: "退出登录", onClick: () => {
      c(!1), l();
    }, danger: !0 }] : []
  ];
  return /* @__PURE__ */ a("div", { className: "meso-user-menu", ref: d, children: [
    n && /* @__PURE__ */ a("div", { className: "meso-user-menu__popup", role: "menu", children: [
      /* @__PURE__ */ a("div", { className: "meso-user-menu__identity", children: [
        /* @__PURE__ */ t("span", { className: "meso-user-menu__identity-name", children: e }),
        r && /* @__PURE__ */ t("span", { className: "meso-user-menu__identity-email", children: r })
      ] }),
      u.length > 0 && /* @__PURE__ */ t("div", { className: "meso-user-menu__sep", role: "separator" }),
      u.map((i, _) => /* @__PURE__ */ a(
        "button",
        {
          className: `meso-user-menu__item${i.danger ? " meso-user-menu__item--danger" : ""}`,
          role: "menuitem",
          onClick: () => {
            c(!1), i.onClick();
          },
          children: [
            i.icon && /* @__PURE__ */ t("span", { className: "meso-user-menu__item-icon", children: i.icon }),
            i.label
          ]
        },
        _
      ))
    ] }),
    /* @__PURE__ */ a(
      "button",
      {
        className: "meso-user-menu__trigger",
        onClick: () => c((i) => !i),
        "aria-haspopup": "menu",
        "aria-expanded": n,
        title: e,
        children: [
          /* @__PURE__ */ t("div", { className: "meso-user-menu__avatar", children: h }),
          /* @__PURE__ */ a("div", { className: "meso-user-menu__info", children: [
            /* @__PURE__ */ t("span", { className: "meso-user-menu__name", children: e }),
            r && /* @__PURE__ */ t("span", { className: "meso-user-menu__email", children: r })
          ] })
        ]
      }
    )
  ] });
}
function ht({
  tabs: e,
  activeTabId: r,
  onTabChange: s,
  autoSelectFirstReady: o = !1
}) {
  var _;
  const l = r !== void 0, [n, c] = $(((_ = e[0]) == null ? void 0 : _.id) ?? ""), d = l ? r : n, h = R(!1);
  I(() => {
    if (!o || h.current) return;
    const v = e.find((w) => w.ready);
    v && (h.current = !0, l || c(v.id), s == null || s(v.id));
  }, [e, o, l, s]);
  const u = (v) => {
    l || c(v), s == null || s(v);
  }, i = e.find((v) => v.id === d) ?? e[0];
  return e.length === 0 ? null : /* @__PURE__ */ a("div", { className: "meso-artifact-shell", children: [
    /* @__PURE__ */ t("div", { className: "meso-artifact-shell__tabs", role: "tablist", children: e.map((v) => /* @__PURE__ */ a(
      "button",
      {
        role: "tab",
        "aria-selected": v.id === d,
        className: `meso-artifact-shell__tab${v.id === d ? " meso-artifact-shell__tab--active" : ""}`,
        onClick: () => u(v.id),
        children: [
          v.label,
          v.ready === !1 && /* @__PURE__ */ t("span", { className: "meso-artifact-shell__tab-dot", "aria-label": "加载中" })
        ]
      },
      v.id
    )) }),
    /* @__PURE__ */ t("div", { className: "meso-artifact-shell__content", role: "tabpanel", children: i == null ? void 0 : i.content })
  ] });
}
function _t({ status: e, primary: r, outcome: s, detail: o, className: l, "data-testid": n }) {
  const c = o !== void 0 && o !== "", d = ve({ system: !1 });
  return /* @__PURE__ */ a("div", { className: `meso-log-line${l ? ` ${l}` : ""}`, "data-testid": n ?? "meso-log-line", children: [
    /* @__PURE__ */ a(
      "div",
      {
        className: `meso-log-line__row${c ? " meso-log-line__row--clickable" : ""}`,
        onClick: c ? d.toggle : void 0,
        role: c ? "button" : void 0,
        tabIndex: c ? 0 : void 0,
        onKeyDown: c ? (h) => {
          (h.key === "Enter" || h.key === " ") && d.toggle();
        } : void 0,
        "aria-expanded": c ? d.open : void 0,
        "aria-label": c ? `${r}，${d.open ? "折叠" : "展开"}详情` : void 0,
        children: [
          /* @__PURE__ */ t(j, { status: e, size: 14, className: "meso-log-line__icon" }),
          /* @__PURE__ */ t("span", { className: "meso-log-line__primary", children: r }),
          s && /* @__PURE__ */ t("span", { className: "meso-log-line__outcome", children: s }),
          c && /* @__PURE__ */ t(
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
              children: /* @__PURE__ */ t("polyline", { points: "2.5,4.5 6,7.5 9.5,4.5" })
            }
          )
        ]
      }
    ),
    c && d.open && /* @__PURE__ */ t("pre", { className: "meso-log-line__detail", children: o })
  ] });
}
const Qe = /* @__PURE__ */ new Set(["text", "think"]);
function Xe(e, r, s) {
  var o, l, n, c, d, h, u, i, _, v, w, y, m, p, f, g;
  if (s)
    switch (e.type) {
      case "capabilities":
        (o = s.onCapabilities) == null || o.call(s, e.payload);
        break;
      case "phase":
        (l = s.onPhaseChange) == null || l.call(s, e.payload);
        break;
      case "memory":
        (n = s.onMemoryRecalled) == null || n.call(s, e.payload.snippets);
        break;
      case "memory_saved":
        (c = s.onMemorySaved) == null || c.call(s, e.payload);
        break;
      case "soul":
        (d = s.onSoulActivated) == null || d.call(s, e.payload);
        break;
      case "skill_active":
        (h = s.onSkillActivated) == null || h.call(s, e.payload);
        break;
      case "tool_call":
        (u = s.onToolCall) == null || u.call(s, e.payload);
        break;
      case "tool_result":
        (i = s.onToolResult) == null || i.call(s, e.payload);
        break;
      case "resource_read":
        (_ = s.onResourceRead) == null || _.call(s, e.payload);
        break;
      case "resource_content":
        (v = s.onResourceContent) == null || v.call(s, e.payload);
        break;
      case "text":
        (w = s.onText) == null || w.call(s, e.payload.delta, r);
        break;
      case "think":
        (y = s.onThink) == null || y.call(s, e.payload.delta, r);
        break;
      case "artifact": {
        const k = r.artifacts[e.payload.id];
        k && ((m = s.onArtifact) == null || m.call(s, k));
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
function ft(e, r) {
  const [s, o] = $(F), l = R(null), n = R(!1), c = R(r);
  c.current = r;
  const d = G(() => {
    var i;
    (i = l.current) == null || i.abort(), n.current = !1, o((_) => ({ ..._, status: "idle" }));
  }, []), h = G(() => {
    var i;
    (i = l.current) == null || i.abort(), n.current = !1, o(F());
  }, []), u = G(async (i) => {
    var f, g, k, S, N, b;
    if (n.current) return;
    n.current = !0;
    const _ = typeof (i == null ? void 0 : i.reconnect) == "object" ? i.reconnect : { maxAttempts: 3, baseDelayMs: 1e3 }, v = i != null && i.reconnect ? _.maxAttempts ?? 3 : 0, w = _.baseDelayMs ?? 1e3, y = (i == null ? void 0 : i.batchMs) === void 0 ? 16 : i.batchMs;
    let m = 0;
    const p = async () => {
      var te;
      (te = l.current) == null || te.abort();
      const C = new AbortController();
      l.current = C;
      const x = { ...F(), status: "streaming" };
      o(x);
      let O = x;
      const A = (i == null ? void 0 : i.method) ?? (i != null && i.body ? "POST" : "GET"), H = (i == null ? void 0 : i.watchdogMs) === void 0 ? 12e4 : i.watchdogMs;
      let D = null;
      const W = () => {
        D && clearTimeout(D);
      }, z = () => {
        W(), H != null && (D = setTimeout(() => {
          var E, U;
          C.abort();
          const L = `SSE stream timed out after ${H}ms of inactivity`;
          o((K) => ({ ...K, status: "error", errorMessage: L, errorCode: "WATCHDOG_TIMEOUT" })), (U = (E = c.current) == null ? void 0 : E.onError) == null || U.call(E, L, "WATCHDOG_TIMEOUT");
        }, H));
      }, P = [];
      let T = null;
      const M = (L) => {
        const E = Le(O, L);
        if (O = E, o(E), Xe(L, E, c.current), L.type === "done" || L.type === "error")
          return W(), L.type;
      }, ee = () => {
        for (; P.length > 0; ) {
          const L = P.shift(), E = M(L);
          if (E) return E;
        }
      }, ke = (L) => {
        if (y != null && Qe.has(L.type)) {
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
            ...i == null ? void 0 : i.headers
          },
          body: i != null && i.body ? JSON.stringify(i.body) : void 0,
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
            const oe = Se(be);
            if (!oe) continue;
            const ne = ke(oe);
            if (ne) return ne;
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
          if (!(i != null && i.reconnect) || m >= v) {
            const x = "SSE stream ended unexpectedly";
            o((O) => ({ ...O, status: "error", errorMessage: x, errorCode: "STREAM_ENDED" })), (g = (f = c.current) == null ? void 0 : f.onError) == null || g.call(f, x, "STREAM_ENDED");
            return;
          }
        } catch (C) {
          if (!(i != null && i.reconnect) || m >= v) {
            const x = C.message;
            o((O) => ({ ...O, status: "error", errorMessage: x })), (S = (k = c.current) == null ? void 0 : k.onError) == null || S.call(k, x);
            return;
          }
        }
        m += 1, (b = (N = c.current) == null ? void 0 : N.onReconnect) == null || b.call(N, m), await new Promise((C) => setTimeout(C, w * Math.pow(2, m - 1)));
      }
    } finally {
      n.current = !1;
    }
  }, [e]);
  return { state: s, start: u, abort: d, reset: h };
}
const ge = "meso-theme";
function et() {
  return typeof window > "u" ? "light" : localStorage.getItem(ge) ?? "light";
}
function tt(e) {
  document.documentElement.setAttribute("data-theme", e), localStorage.setItem(ge, e);
}
function pt() {
  const [e, r] = $(et);
  I(() => {
    tt(e);
  }, [e]);
  const s = G(() => {
    r((o) => o === "light" ? "dark" : "light");
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
}, st = {
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
}, rt = {
  "zh-CN": Ne,
  "en-US": st
}, X = xe({
  locale: "zh-CN",
  labels: Ne
});
function vt({
  locale: e = "zh-CN",
  labels: r,
  children: s
}) {
  const o = { ...rt[e], ...r };
  return /* @__PURE__ */ t(X.Provider, { value: { locale: e, labels: o }, children: s });
}
function gt() {
  return ie(X).labels;
}
function Nt() {
  return ie(X);
}
export {
  ht as ArtifactPaneShell,
  q as ArtifactPanel,
  ae as ChatBubble,
  dt as ChatComposer,
  Y as CollapsibleToolTrace,
  ze as ConfirmGate,
  _t as LogLine,
  vt as MesoLocaleProvider,
  it as MessageList,
  yt as PROTOCOL_VERSION,
  mt as ProcessTrace,
  fe as ResourceReadBlock,
  ut as SidebarUserMenu,
  he as SkillIndicator,
  ue as SoulIndicator,
  Me as StageTimeline,
  j as StatusIcon,
  ct as StreamingCursor,
  Q as ThinkBlock,
  lt as ThreeColumnLayout,
  _e as ToolCallBlock,
  Pe as WorkflowTimeline,
  Le as applyEvent,
  bt as assertCompatibleVersion,
  F as createInitialStreamState,
  xt as createStreamStateWithArtifacts,
  rt as defaultLabelsByLocale,
  st as enUSLabels,
  Ct as isCompatibleVersion,
  Se as parseSSELine,
  Ce as phaseRecordToStage,
  St as streamStateHasArtifacts,
  ve as useFoldState,
  gt as useMesoLabels,
  Nt as useMesoLocale,
  ft as useSSEStream,
  pt as useTheme,
  Ne as zhCNLabels
};
