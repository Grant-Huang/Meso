import { jsxs as a, jsx as t, Fragment as A } from "react/jsx-runtime";
import J, { useState as $, useRef as I, useEffect as R, useMemo as V, useCallback as G, createContext as $e, useContext as ue } from "react";
import { phaseRecordToStage as Te, createInitialStreamState as F, parseSSELine as Ee, applyEvent as Oe } from "./runtime.js";
import { EXTENSION_PRESETS as Ct, PROTOCOL_VERSION as St, assertCompatibleVersion as Lt, createStreamStateWithArtifacts as $t, isCompatibleVersion as Tt, isPresetExtension as Et, resolveExtensionAlias as Ot, streamStateHasArtifacts as It } from "./runtime.js";
function dt({
  navItems: e = [],
  sidebarFooter: r,
  sessionColumn: s,
  children: n,
  defaultCollapsed: l = !1,
  appName: o = "Meso",
  sidebarLogo: d,
  sidebarTitle: i,
  mainHeader: h,
  artifactPanel: f,
  defaultArtifactVisible: c = !1,
  onArtifactToggle: u,
  artifactVisible: p,
  showArtifactToggle: w = !0,
  showSessionColumn: b = !0,
  contentMaxWidth: m,
  artifactPanelWidth: v,
  onCollapsedChange: _
}) {
  const [g, k] = $(l), [S, N] = $(c), x = p !== void 0 ? p : S, C = () => {
    const y = !x;
    p === void 0 && N(y), u == null || u(y);
  };
  return /* @__PURE__ */ a("div", { className: "meso-layout", children: [
    /* @__PURE__ */ a("aside", { className: `meso-sidebar${g ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ a("div", { className: "meso-sidebar__header", children: [
        d ? /* @__PURE__ */ t("div", { className: "meso-sidebar__logo meso-sidebar__logo--custom", children: d }) : /* @__PURE__ */ t("div", { className: "meso-sidebar__logo", children: o[0] }),
        i ? /* @__PURE__ */ t("span", { className: "meso-sidebar__title meso-sidebar__title--brand", children: i }) : /* @__PURE__ */ t("span", { className: "meso-sidebar__title", children: o }),
        /* @__PURE__ */ t(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => {
              const y = !g;
              k(y), _ == null || _(y);
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
      /* @__PURE__ */ t("nav", { className: "meso-sidebar__nav", children: e.map((y) => /* @__PURE__ */ a(
        "div",
        {
          className: `meso-sidebar__nav-item${y.active ? " meso-sidebar__nav-item--active" : ""}`,
          onClick: y.onClick,
          title: y.label,
          children: [
            /* @__PURE__ */ t("span", { className: "meso-sidebar__nav-icon", children: y.icon }),
            /* @__PURE__ */ t("span", { className: "meso-sidebar__nav-label", children: y.label })
          ]
        },
        y.id
      )) }),
      r && /* @__PURE__ */ t("div", { className: "meso-sidebar__footer", children: r })
    ] }),
    b !== !1 && /* @__PURE__ */ t("div", { className: "meso-session-col", children: s }),
    /* @__PURE__ */ a("main", { className: "meso-main", children: [
      /* @__PURE__ */ a("div", { className: "meso-main__header", children: [
        /* @__PURE__ */ t("div", { className: "meso-main__header-content", children: h }),
        w !== !1 && /* @__PURE__ */ t(
          "button",
          {
            className: `meso-artifact-toggle${x ? " meso-artifact-toggle--active" : ""}`,
            onClick: C,
            title: x ? "关闭 Artifact" : "打开 Artifact",
            "aria-label": x ? "关闭 Artifact" : "打开 Artifact",
            children: x ? (
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
        /* @__PURE__ */ t("div", { className: "meso-main__chat", style: m ? { maxWidth: m, margin: "0 auto", width: "100%" } : void 0, children: n }),
        x && /* @__PURE__ */ a(A, { children: [
          /* @__PURE__ */ t("div", { className: "meso-artifact-divider", "aria-hidden": "true" }),
          /* @__PURE__ */ t(
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
function ce({
  role: e,
  content: r,
  streaming: s = !1,
  timestamp: n,
  markdown: l = !1,
  renderMarkdown: o
}) {
  const d = l && typeof o == "function";
  return /* @__PURE__ */ a("div", { className: `meso-bubble meso-bubble--${e}`, children: [
    e === "assistant" && /* @__PURE__ */ t("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ a("div", { className: "meso-bubble__body", children: [
      d ? /* @__PURE__ */ t(
        "div",
        {
          className: "meso-bubble__content meso-bubble__md",
          dangerouslySetInnerHTML: { __html: o(r) }
        }
      ) : /* @__PURE__ */ a("div", { className: "meso-bubble__content", children: [
        r.split(`
`).map((i, h) => /* @__PURE__ */ a(J.Fragment, { children: [
          h > 0 && /* @__PURE__ */ t("br", {}),
          i
        ] }, h)),
        s && /* @__PURE__ */ t("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      n && /* @__PURE__ */ t("div", { className: "meso-bubble__timestamp", children: n })
    ] })
  ] });
}
function me({ active: e = !0 }) {
  return e ? /* @__PURE__ */ t("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function Z(e) {
  return e ? e.verbosity ? e.verbosity : e.compact ? "compact" : "standard" : "standard";
}
function Ie(e) {
  const r = e.replace(/\s+/g, " ").trim();
  if (!r) return "已思考";
  const s = r.split(new RegExp("(?<=[。！？.!?])")).map((l) => l.trim()).filter(Boolean), n = s[s.length - 1] || r;
  return n.length > 36 ? n.slice(0, 36) + "…" : n;
}
function Q({
  content: e,
  pinnedContent: r,
  streaming: s = !1,
  turnStreaming: n,
  autoCollapseDelay: l = 1500,
  defaultOpen: o,
  open: d,
  onOpenChange: i,
  collapseWhen: h,
  summary: f,
  simplify: c
}) {
  const u = Z(c), p = o ?? u !== "compact", w = h ?? (u === "detailed" ? "never" : "streamEnd"), b = d !== void 0, [m, v] = $(p), [_, g] = $(null), k = I(null);
  k.current = _;
  const S = b ? d : _ !== null ? _ : m, N = I(s), x = I(n), C = () => {
    const M = !S;
    b || g(M), i == null || i(M);
  };
  R(() => {
    if (w !== "never" && l !== null) {
      if (N.current && !s) {
        const M = setTimeout(() => {
          b || v(!1), k.current === null && (i == null || i(!1));
        }, l);
        return () => clearTimeout(M);
      }
      N.current = s;
    }
  }, [s, l, w, b, i]), R(() => {
    n !== void 0 && (x.current && !n && g(null), x.current = n);
  }, [n]);
  const y = !s && r !== void 0 ? r : e, T = S ? "思考过程" : f ?? Ie(y);
  return /* @__PURE__ */ a("div", { className: `meso-think${S ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ a(
      "button",
      {
        className: "meso-think__header",
        onClick: C,
        "aria-expanded": S,
        children: [
          /* @__PURE__ */ t("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ t("span", { className: "meso-think__label", children: T }),
          s && /* @__PURE__ */ t("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ t("div", { className: "meso-think__body", children: /* @__PURE__ */ a("div", { className: "meso-think__content", children: [
      y,
      s && /* @__PURE__ */ t(me, {})
    ] }) })
  ] });
}
function Re(e) {
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
  streaming: n = !1,
  onCopy: l,
  onDownload: o,
  renderMermaid: d,
  highlightCode: i,
  renderMarkdown: h
}) {
  const [f, c] = $(!1), [u, p] = $(e), [w, b] = $(null), [m, v] = $(!1), [_, g] = $(null), k = I("");
  R(() => {
    p(e);
  }, [e]), R(() => {
    e !== "mermaid" || n || !d || r === k.current || (k.current = r, b(null), v(!1), d(r).then((C) => b(C)).catch(() => v(!0)));
  }, [e, n, r, d]), R(() => {
    e !== "code" || n || !i || r === k.current && _ || (k.current = r, g(i(r, s)));
  }, [e, n, r, s, i, _]);
  const S = () => {
    navigator.clipboard.writeText(r).catch(() => {
    }), c(!0), setTimeout(() => c(!1), 2e3), l == null || l(r);
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
    }, y = new Blob([r], { type: "text/plain" }), T = document.createElement("a");
    T.href = URL.createObjectURL(y), T.download = `artifact.${C[e]}`, T.click(), URL.revokeObjectURL(T.href);
  };
  return /* @__PURE__ */ a("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ a("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ t("div", { className: "meso-artifact__tabs", children: (e === "html" ? ["html", "code"] : [e]).map((C) => /* @__PURE__ */ t(
        "span",
        {
          className: `meso-artifact__tab${u === C ? " meso-artifact__tab--active" : ""}`,
          onClick: () => p(C),
          children: Be(C, s)
        },
        C
      )) }),
      n && /* @__PURE__ */ t("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ t("button", { className: "meso-artifact__download-btn", onClick: N, title: "下载", "aria-label": "下载文件", children: /* @__PURE__ */ t("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) }) }),
      /* @__PURE__ */ t("button", { className: "meso-artifact__copy-btn", onClick: S, title: "复制", "aria-label": "复制代码", children: f ? /* @__PURE__ */ t("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ t("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ a("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ t("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
        /* @__PURE__ */ t("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
      ] }) })
    ] }),
    /* @__PURE__ */ a("div", { className: "meso-artifact__body", children: [
      u === "html" && /* @__PURE__ */ t("iframe", { className: "meso-artifact__preview", srcDoc: r, sandbox: "allow-scripts", title: "HTML 预览" }),
      u === "mermaid" && /* @__PURE__ */ a(A, { children: [
        n && /* @__PURE__ */ a("pre", { className: "meso-artifact__code", children: [
          /* @__PURE__ */ t("code", { children: r }),
          /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
        ] }),
        !n && w && /* @__PURE__ */ t(
          "div",
          {
            className: "meso-artifact__mermaid",
            dangerouslySetInnerHTML: { __html: w }
          }
        ),
        !n && !w && !m && !d && /* @__PURE__ */ a("div", { className: "meso-artifact__mermaid-placeholder", children: [
          /* @__PURE__ */ t("span", { children: "图表预览需要集成 Mermaid 渲染器" }),
          /* @__PURE__ */ t("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ t("code", { children: r }) })
        ] }),
        !n && m && /* @__PURE__ */ a("div", { className: "meso-artifact__mermaid-placeholder meso-artifact__mermaid-placeholder--error", children: [
          /* @__PURE__ */ t("span", { children: "图表渲染失败，请检查语法" }),
          /* @__PURE__ */ t("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ t("code", { children: r }) })
        ] }),
        !n && !w && !m && d && /* @__PURE__ */ t("div", { className: "meso-artifact__mermaid-placeholder", children: /* @__PURE__ */ t("span", { children: "渲染中…" }) })
      ] }),
      u === "markdown" && /* @__PURE__ */ t(A, { children: h ? /* @__PURE__ */ t(
        "div",
        {
          className: "meso-artifact__markdown",
          dangerouslySetInnerHTML: { __html: h(r) }
        }
      ) : /* @__PURE__ */ a("pre", { className: "meso-artifact__code", children: [
        /* @__PURE__ */ t("code", { children: r }),
        n && /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] }) }),
      u === "table" && /* @__PURE__ */ t(Me, { content: r, streaming: n }),
      (u === "code" || u === "html" && !1) && /* @__PURE__ */ a("pre", { className: "meso-artifact__code", children: [
        _ && !n ? /* @__PURE__ */ t("code", { dangerouslySetInnerHTML: { __html: _ } }) : /* @__PURE__ */ t("code", { children: r }),
        n && /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] })
    ] })
  ] });
}
function Me({ content: e, streaming: r }) {
  const s = Re(e);
  return s ? /* @__PURE__ */ t("div", { className: "meso-artifact__table-wrap", children: /* @__PURE__ */ a("table", { className: "meso-artifact__table", children: [
    /* @__PURE__ */ t("thead", { children: /* @__PURE__ */ t("tr", { children: s.headers.map((n, l) => /* @__PURE__ */ t("th", { children: n }, l)) }) }),
    /* @__PURE__ */ t("tbody", { children: s.rows.map((n, l) => /* @__PURE__ */ t("tr", { children: n.map((o, d) => /* @__PURE__ */ t("td", { children: String(o) }, d)) }, l)) })
  ] }) }) : /* @__PURE__ */ a("pre", { className: "meso-artifact__code", children: [
    /* @__PURE__ */ t("code", { children: e }),
    r && /* @__PURE__ */ t("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
  ] });
}
function Be(e, r) {
  return e === "html" ? "HTML 预览" : e === "mermaid" ? "图表" : e === "markdown" ? "Markdown" : e === "table" ? "表格" : r || "Code";
}
const Ae = {
  running: "进行中",
  done: "完成",
  error: "失败",
  pending: "等待",
  warning: "警告"
};
function D({
  status: e,
  size: r = 16,
  className: s,
  "aria-label": n
}) {
  const l = n ?? Ae[e];
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
function De(e) {
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
function We({ stages: e, compact: r = !1 }) {
  return e.length === 0 ? null : /* @__PURE__ */ t("div", { className: `meso-stages${r ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: e.map((s, n) => /* @__PURE__ */ a(
    "div",
    {
      className: `meso-stage meso-stage--${s.status}`,
      children: [
        /* @__PURE__ */ t("div", { className: "meso-stage__dot", children: /* @__PURE__ */ t(D, { status: De(s.status), size: 10 }) }),
        n < e.length - 1 && /* @__PURE__ */ t("div", { className: `meso-stage__line${s.status === "done" ? " meso-stage__line--done" : ""}` }),
        /* @__PURE__ */ t("span", { className: `meso-stage__label${r ? " meso-stage__label--compact" : ""}`, children: s.label })
      ]
    },
    s.id
  )) });
}
function Pe(e) {
  const { nodes: r, nodeOrder: s } = e, n = /* @__PURE__ */ new Map();
  for (const i of s) {
    const h = r[i];
    if (!h) continue;
    const f = h.parent_id ?? null;
    n.has(f) || n.set(f, []), n.get(f).push(i);
  }
  const l = /* @__PURE__ */ new Map();
  for (const [, i] of n)
    if (i.length > 1)
      for (const h of i) l.set(h, i);
  const o = [], d = /* @__PURE__ */ new Set();
  for (const i of s) {
    if (d.has(i)) continue;
    const h = r[i];
    if (!h) continue;
    const f = l.get(i);
    if (f) {
      const c = f.map((u) => r[u]).filter((u) => !!u);
      for (const u of c) d.add(u.node_id);
      o.push({ kind: "parallel", nodes: c, isLast: !1 });
    } else
      d.add(i), o.push({ kind: "node", node: h, isLast: !1 });
  }
  return o.length > 0 && (o[o.length - 1] = { ...o[o.length - 1], isLast: !0 }), o;
}
function je(e) {
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
function he({ state: e }) {
  return /* @__PURE__ */ t(
    D,
    {
      status: je(e),
      size: 12,
      className: `meso-wf-node__icon meso-wf-node__icon--${e}`
    }
  );
}
function _e(e) {
  return e < 1e3 ? `${e}ms` : `${(e / 1e3).toFixed(1)}s`;
}
function ze({ node: e, isLast: r }) {
  var o;
  const [s, n] = $(!1), l = e.metadata && Object.keys(e.metadata).length > 0;
  return /* @__PURE__ */ a("div", { className: `meso-wf-node meso-wf-node--${e.state}`, children: [
    /* @__PURE__ */ a("div", { className: "meso-wf-node__track", children: [
      /* @__PURE__ */ t("div", { className: "meso-wf-node__dot", children: /* @__PURE__ */ t(he, { state: e.state }) }),
      !r && /* @__PURE__ */ t("div", { className: "meso-wf-node__line" })
    ] }),
    /* @__PURE__ */ a("div", { className: "meso-wf-node__body", children: [
      /* @__PURE__ */ a("div", { className: "meso-wf-node__header", children: [
        /* @__PURE__ */ t("code", { className: "meso-wf-node__name", children: e.name }),
        e.duration_ms !== void 0 && /* @__PURE__ */ t("span", { className: "meso-wf-node__duration", children: _e(e.duration_ms) }),
        l && /* @__PURE__ */ t(
          "button",
          {
            className: "meso-wf-node__expand",
            onClick: () => n((d) => !d),
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
function He({ nodes: e, isLast: r }) {
  return /* @__PURE__ */ a("div", { className: "meso-wf-parallel", children: [
    /* @__PURE__ */ t("div", { className: "meso-wf-parallel__row", children: e.map((s, n) => {
      var l;
      return /* @__PURE__ */ a("div", { className: `meso-wf-parallel__branch meso-wf-parallel__branch--${s.state}`, children: [
        /* @__PURE__ */ t("div", { className: "meso-wf-parallel__branch-dot", children: /* @__PURE__ */ t(he, { state: s.state }) }),
        /* @__PURE__ */ a("div", { className: "meso-wf-parallel__branch-body", children: [
          /* @__PURE__ */ a("div", { className: "meso-wf-parallel__branch-label", children: [
            "并行分支 ",
            String.fromCharCode(65 + n)
          ] }),
          /* @__PURE__ */ t("code", { className: "meso-wf-node__name", children: s.name }),
          s.state === "error" && !!((l = s.metadata) != null && l.error) && /* @__PURE__ */ t("div", { className: "meso-wf-node__error", children: String(s.metadata.error) }),
          s.duration_ms !== void 0 && /* @__PURE__ */ t("span", { className: "meso-wf-node__duration", style: { display: "block", marginTop: 2 }, children: _e(s.duration_ms) })
        ] })
      ] }, s.node_id);
    }) }),
    !r && /* @__PURE__ */ t("div", { className: "meso-wf-parallel__merge" })
  ] });
}
function Ke({ runs: e, showRunId: r = !0, hidden: s }) {
  if (e.length === 0 || s) return null;
  const n = e.length > 1;
  return /* @__PURE__ */ t("div", { className: "meso-wf", role: "status", "aria-label": "工作流进度", children: e.map((l) => {
    const o = Pe(l);
    return /* @__PURE__ */ a("div", { className: "meso-wf-run", children: [
      n && r && /* @__PURE__ */ t("div", { className: "meso-wf-run__label", children: l.run_id }),
      o.map(
        (d, i) => d.kind === "parallel" ? /* @__PURE__ */ t(He, { nodes: d.nodes, isLast: d.isLast }, `parallel-${i}`) : /* @__PURE__ */ t(ze, { node: d.node, isLast: d.isLast }, d.node.node_id)
      )
    ] }, l.run_id);
  }) });
}
function fe({ soul: e, compact: r = !1 }) {
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
        !r && /* @__PURE__ */ a(A, { children: [
          /* @__PURE__ */ t("span", { className: "meso-soul__name", children: e.name }),
          e.traits && e.traits.length > 0 && /* @__PURE__ */ t("div", { className: "meso-soul__traits", children: e.traits.map((n) => /* @__PURE__ */ t("span", { className: "meso-soul__trait", children: n }, n)) })
        ] })
      ]
    }
  );
}
const Ue = {
  mcp: "MCP",
  api: "API"
};
function pe({ skill: e }) {
  const r = e.provider ? Ue[e.provider] : null;
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
const Ve = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function Ge({ toolCall: e, onConfirm: r, onCancel: s }) {
  const n = e.risk ?? "safe", l = Ve[n], o = Object.keys(e.args).length > 0;
  return /* @__PURE__ */ a("div", { className: `meso-confirm-gate meso-confirm-gate--${n}`, role: "alertdialog", "aria-label": "工具执行确认", "data-testid": "meso-confirm-gate", children: [
    /* @__PURE__ */ t("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ a("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ t("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ t("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ a("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ a("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ t("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${n}`, children: l.label }),
        /* @__PURE__ */ t("code", { className: "meso-confirm-gate__tool-name", children: e.name })
      ] }),
      o && /* @__PURE__ */ t("pre", { className: "meso-confirm-gate__args", children: JSON.stringify(e.args, null, 2) }),
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
            className: `meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${n}`,
            onClick: () => r(e.id),
            children: l.confirmText
          }
        )
      ] })
    ] })
  ] });
}
function K({
  open: e,
  size: r = 16,
  className: s,
  "aria-label": n
}) {
  return /* @__PURE__ */ t(
    "svg",
    {
      className: `meso-chevron-icon${e ? " meso-chevron-icon--open" : ""}${s ? ` ${s}` : ""}`,
      width: r,
      height: r,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      xmlns: "http://www.w3.org/2000/svg",
      role: "img",
      "aria-label": n ?? (e ? "展开" : "折叠"),
      children: e ? /* @__PURE__ */ t("polyline", { points: "6,9 12,15 18,9" }) : /* @__PURE__ */ t("polyline", { points: "9,6 15,12 9,18" })
    }
  );
}
function ve(e) {
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
function Fe(e) {
  switch (e) {
    case "pending":
      return "pending";
    case "done":
      return "done";
    case "error":
      return "error";
  }
}
function Je(e) {
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
const qe = {
  safe: "只读",
  write: "写入",
  destructive: "危险"
}, ie = {
  mcp: "MCP",
  api: "API",
  local: "本地"
};
function ge({ toolCall: e, onConfirm: r, onCancel: s, className: n, "data-testid": l, simplify: o }) {
  var P, z;
  const { call: d, result: i, status: h } = e, f = d.risk ?? "safe", c = Object.keys(d.args).length > 0, u = (o == null ? void 0 : o.verbosity) ?? (o != null && o.compact ? "compact" : "standard"), p = u === "compact", w = u === "standard", b = u === "detailed", m = (o == null ? void 0 : o.showDuration) ?? !0, v = (o == null ? void 0 : o.showProvider) ?? !p, _ = (o == null ? void 0 : o.showRiskLevel) ?? (w || b), g = (o == null ? void 0 : o.showExecutionTimeline) ?? b, k = (o == null ? void 0 : o.defaultParamsCollapsed) ?? (p || w), S = (o == null ? void 0 : o.defaultOutputCollapsed) ?? (p || w), N = (o == null ? void 0 : o.defaultMetadataCollapsed) ?? (p || w), [x, C] = $(!k), [y, T] = $(!S), [M, j] = $(!N), W = (P = i == null ? void 0 : i.metadata) == null ? void 0 : P.resultCount;
  return /* @__PURE__ */ a(
    "div",
    {
      className: `meso-tool meso-tool--${h} meso-tool--risk-${f} meso-tool--${u}${n ? ` ${n}` : ""}`,
      "data-testid": l ?? "meso-tool-call-block",
      children: [
        /* @__PURE__ */ a("div", { className: "meso-tool__header", children: [
          /* @__PURE__ */ t(D, { status: ve(h), size: 14, className: "meso-tool__status-icon" }),
          /* @__PURE__ */ t("span", { className: "meso-tool__name", children: d.name }),
          W !== void 0 && /* @__PURE__ */ a("span", { className: "meso-tool__summary", children: [
            "— ",
            W,
            " 项"
          ] }),
          m && (i == null ? void 0 : i.duration_ms) !== void 0 && /* @__PURE__ */ a("span", { className: "meso-tool__duration", children: [
            "(",
            i.duration_ms,
            "ms)"
          ] }),
          _ && f !== "safe" && /* @__PURE__ */ t("span", { className: `meso-tool__risk meso-tool__risk--${f}`, children: qe[f] }),
          v && d.provider && ie[d.provider] && /* @__PURE__ */ t("span", { className: `meso-tool__provider meso-tool__provider--${d.provider}`, children: ie[d.provider] }),
          ((z = d.annotations) == null ? void 0 : z.open_world) && /* @__PURE__ */ t("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", "aria-label": "访问外部网络", children: /* @__PURE__ */ a("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
            /* @__PURE__ */ t("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ t("path", { d: "M2 12h20" }),
            /* @__PURE__ */ t("path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" })
          ] }) })
        ] }),
        c && /* @__PURE__ */ a("details", { className: "meso-tool__params-details", open: x, children: [
          /* @__PURE__ */ t(
            "summary",
            {
              className: "meso-tool__params-summary",
              onClick: (B) => {
                B.preventDefault(), C((E) => !E);
              },
              children: /* @__PURE__ */ a("span", { className: "meso-tool__params-toggle", children: [
                /* @__PURE__ */ t(K, { open: x, size: 13 }),
                " Input Parameters"
              ] })
            }
          ),
          x && /* @__PURE__ */ t("pre", { className: "meso-tool__args", children: JSON.stringify(d.args, null, b ? 2 : 1) })
        ] }),
        h === "awaiting_confirm" && r && s && /* @__PURE__ */ t(
          Ge,
          {
            toolCall: d,
            onConfirm: r,
            onCancel: s
          }
        ),
        (h === "done" || h === "error") && i && /* @__PURE__ */ a("details", { className: "meso-tool__result-details", open: y, children: [
          /* @__PURE__ */ t(
            "summary",
            {
              className: "meso-tool__result-summary",
              onClick: (B) => {
                B.preventDefault(), T((E) => !E);
              },
              children: /* @__PURE__ */ a("span", { className: "meso-tool__result-toggle", children: [
                /* @__PURE__ */ t(K, { open: y, size: 13 }),
                " ",
                h === "error" ? "Error" : "Output"
              ] })
            }
          ),
          y && /* @__PURE__ */ t("pre", { className: `meso-tool__output${h === "error" ? " meso-tool__output--error" : ""}`, children: h === "error" ? i.error : b ? i.output : i.output.slice(0, 200) + (i.output.length > 200 ? "..." : "") })
        ] }),
        (i == null ? void 0 : i.metadata) && /* @__PURE__ */ a("details", { className: "meso-tool__metadata-details", open: M, children: [
          /* @__PURE__ */ t(
            "summary",
            {
              className: "meso-tool__metadata-summary",
              onClick: (B) => {
                B.preventDefault(), j((E) => !E);
              },
              children: /* @__PURE__ */ a("span", { className: "meso-tool__metadata-toggle", children: [
                /* @__PURE__ */ t(K, { open: M, size: 13 }),
                " Metadata"
              ] })
            }
          ),
          M && /* @__PURE__ */ a("div", { className: "meso-tool__metadata", children: [
            i.metadata.resultCount !== void 0 && /* @__PURE__ */ a("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-key", children: "resultCount:" }),
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-value", children: i.metadata.resultCount })
            ] }),
            i.metadata.category !== void 0 && /* @__PURE__ */ a("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-key", children: "category:" }),
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-value", children: i.metadata.category })
            ] }),
            b && i.metadata.custom && /* @__PURE__ */ a("div", { className: "meso-tool__metadata-row", children: [
              /* @__PURE__ */ t("span", { className: "meso-tool__metadata-key", children: "custom:" }),
              /* @__PURE__ */ t("pre", { className: "meso-tool__metadata-custom", children: JSON.stringify(i.metadata.custom, null, 2) })
            ] })
          ] })
        ] }),
        b && g && (i == null ? void 0 : i.duration_ms) && /* @__PURE__ */ a("details", { className: "meso-tool__timeline-details", open: !0, children: [
          /* @__PURE__ */ t("summary", { className: "meso-tool__timeline-summary", children: "Execution Timeline" }),
          /* @__PURE__ */ t("div", { className: "meso-tool__timeline", children: /* @__PURE__ */ a("div", { className: "meso-tool__timeline-row", children: [
            /* @__PURE__ */ t("span", { className: "meso-tool__timeline-label", children: "Duration:" }),
            /* @__PURE__ */ a("span", { className: "meso-tool__timeline-value", children: [
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
  onlyShowCurrent: n = !1,
  simplify: l,
  onToolClick: o,
  onToolConfirm: d,
  onToolCancel: i,
  renderSummary: h
}) {
  const f = e.toolCallOrder, c = n && f.length > 0 ? [f[f.length - 1]] : f, [u, p] = $(() => {
    if (r === "none") return /* @__PURE__ */ new Set();
    if (r === "all") return new Set(c);
    if (r === "current" && c.length > 0)
      return /* @__PURE__ */ new Set([c[c.length - 1]]);
    if (r === "last-n" && c.length > 0) {
      const m = c.slice(-s);
      return new Set(m);
    }
    return /* @__PURE__ */ new Set();
  }), w = (m) => {
    const v = new Set(u);
    v.has(m) ? v.delete(m) : v.add(m), p(v), o == null || o(m);
  }, b = (m, v) => {
    var x;
    const { call: _, result: g } = m;
    if (h)
      return String(h(m, v) ?? "");
    const k = _.name, S = (x = g == null ? void 0 : g.metadata) != null && x.resultCount ? ` — ${g.metadata.resultCount} 项` : "", N = g != null && g.duration_ms ? ` (${g.duration_ms}ms)` : "";
    return `${k}${S}${N}`;
  };
  return c.length === 0 ? null : /* @__PURE__ */ t("div", { className: "meso-collapsible-tool-trace", children: c.map((m, v) => {
    const _ = e.toolCalls[m];
    if (!_) return null;
    const g = u.has(m), { status: k } = _;
    return /* @__PURE__ */ a("div", { className: `meso-collapsible-tool__item meso-collapsible-tool__item--${k}`, children: [
      /* @__PURE__ */ a(
        "button",
        {
          className: "meso-collapsible-tool__summary",
          onClick: () => w(m),
          "aria-expanded": g,
          children: [
            /* @__PURE__ */ t("span", { className: "meso-collapsible-tool__toggle", children: /* @__PURE__ */ t(K, { open: g, size: 13 }) }),
            /* @__PURE__ */ t("span", { className: "meso-collapsible-tool__status", children: /* @__PURE__ */ t(D, { status: ve(k), size: 13 }) }),
            /* @__PURE__ */ t("span", { className: "meso-collapsible-tool__text", children: b(_, v) })
          ]
        }
      ),
      g && /* @__PURE__ */ t("div", { className: "meso-collapsible-tool__details", children: /* @__PURE__ */ t(
        ge,
        {
          toolCall: _,
          onConfirm: d,
          onCancel: i,
          simplify: l
        }
      ) })
    ] }, m);
  }) });
}
function Ne({ resourceRead: e, className: r, simplify: s }) {
  const n = Z(s), [l, o] = $(n === "detailed"), { read: d, content: i, status: h } = e, f = d.name ?? d.uri, c = d.server;
  return /* @__PURE__ */ a("div", { className: `meso-resource meso-resource--${h}${r ? ` ${r}` : ""}`, children: [
    /* @__PURE__ */ a("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ t(D, { status: Fe(h), size: 13, className: "meso-resource__status-icon" }),
      /* @__PURE__ */ t("span", { className: "meso-resource__uri", title: d.uri, children: f }),
      c && /* @__PURE__ */ t("span", { className: "meso-resource__server", children: c }),
      (i == null ? void 0 : i.duration_ms) !== void 0 && /* @__PURE__ */ a("span", { className: "meso-resource__duration", children: [
        i.duration_ms,
        "ms"
      ] }),
      (h === "done" || h === "error") && i && /* @__PURE__ */ a(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => o((u) => !u),
          "aria-expanded": l,
          "aria-label": l ? "折叠内容" : "展开内容",
          children: [
            /* @__PURE__ */ t(K, { open: l, size: 13 }),
            " ",
            h === "error" ? "错误" : "内容"
          ]
        }
      )
    ] }),
    l && i && /* @__PURE__ */ t("div", { className: "meso-resource__content", children: h === "error" ? /* @__PURE__ */ t("pre", { className: "meso-resource__text meso-resource__text--error", children: i.error }) : i.contents.map((u, p) => /* @__PURE__ */ a("div", { children: [
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
    ] }, p)) })
  ] });
}
function Ye(e, r) {
  const s = [], n = /* @__PURE__ */ new Set();
  let l = "", o = null, d = 0;
  const i = () => {
    o !== null && l.length > 0 && s.push({ kind: "text", key: o, text: l }), l = "", o = null;
  };
  for (const h of e.eventLog) {
    const { type: f, id: c } = h;
    if (f === "text") {
      const u = e.textChunks.find((p) => p.id === c);
      if (!u) continue;
      o === null && (o = `text-${c}`), l += u.delta;
    } else if (f === "tool_call") {
      if (!e.toolCalls[c]) continue;
      i(), s.push({ kind: "tool", key: `tool-${c}`, id: c });
    } else if (f === "resource_read") {
      if (!e.resourceReads[c]) continue;
      i(), s.push({ kind: "resource", key: `resource-${c}`, id: c });
    } else if (f === "extension") {
      if (d >= e.extensionLog.length) continue;
      i(), s.push({ kind: "extension", key: `ext-${d}`, index: d }), d++;
    } else if (f === "artifact") {
      const u = e.artifacts[c];
      if (!u || r != null && r.includes(u.lang) || n.has(c)) continue;
      n.add(c), i(), s.push({ kind: "artifact", key: `artifact-${c}`, id: c });
    }
  }
  return i(), s;
}
function X(e) {
  return e === "html" || e === "html preview" ? { type: "html" } : e === "mermaid" ? { type: "mermaid" } : e === "markdown" ? { type: "markdown" } : e === "table" ? { type: "table" } : { type: "code", language: e };
}
function ke(e) {
  const r = e.toolCallOrder, s = r.length - 1, n = r.slice(0, s).filter((o) => e.toolCalls[o].result !== void 0), l = r[s];
  return { frozenIds: n, currentId: l };
}
function Xe({
  stream: e,
  onToolConfirm: r,
  onToolCancel: s,
  simplify: n
}) {
  const { frozenIds: l, currentId: o } = V(
    () => ke(e),
    [e.toolCallOrder, e.toolCalls]
  );
  return e.toolCallOrder.length === 0 ? null : /* @__PURE__ */ a(A, { children: [
    l.length > 0 && /* @__PURE__ */ t("div", { className: "meso-message-list__frozen-tools", children: /* @__PURE__ */ t(
      Y,
      {
        stream: {
          ...e,
          toolCallOrder: l
        },
        streaming: !1,
        defaultExpanded: "all",
        simplify: n
      }
    ) }),
    o && /* @__PURE__ */ t("div", { className: "meso-message-list__current-tool", children: /* @__PURE__ */ t(
      Y,
      {
        stream: {
          ...e,
          toolCallOrder: [o]
        },
        streaming: e.status === "streaming",
        defaultExpanded: "all",
        simplify: n,
        onToolConfirm: r,
        onToolCancel: s
      }
    ) })
  ] });
}
function de({
  stream: e,
  streaming: r,
  onToolConfirm: s,
  onToolCancel: n,
  renderExtension: l,
  onArtifactCopy: o,
  onArtifactDownload: d,
  renderMermaid: i,
  highlightCode: h,
  renderMarkdown: f,
  hiddenArtifactLangs: c,
  simplify: u
}) {
  const { currentId: p } = V(
    () => ke(e),
    [e.toolCallOrder, e.toolCalls]
  ), w = V(
    () => Ye(e, c),
    [e.eventLog, e.textChunks, e.artifacts, e.toolCalls, e.resourceReads, e.extensionLog, c]
  ), b = V(() => {
    for (let m = w.length - 1; m >= 0; m--)
      if (w[m].kind === "text") return w[m].key;
    return null;
  }, [w]);
  return /* @__PURE__ */ a("div", { className: "meso-message-list__interleaved", children: [
    (e.activeSoul || e.activeSkill) && /* @__PURE__ */ a("div", { className: "meso-message-list__context-row", children: [
      e.activeSoul && /* @__PURE__ */ t(fe, { soul: e.activeSoul }),
      e.activeSkill && /* @__PURE__ */ t(pe, { skill: e.activeSkill })
    ] }),
    e.memorySnippets.length > 0 && /* @__PURE__ */ t("div", { className: "meso-memory-chips", children: e.memorySnippets.map((m, v) => /* @__PURE__ */ a("span", { className: "meso-memory-chip", title: m.content, children: [
      "[",
      m.category,
      "] ",
      m.content
    ] }, v)) }),
    e.thinkContent && /* @__PURE__ */ t(
      Q,
      {
        content: e.thinkContent,
        streaming: r && !e.thinkDone,
        collapseWhen: "streamEnd",
        defaultOpen: !0,
        simplify: u
      }
    ),
    w.map((m) => {
      if (m.kind === "text") {
        const k = typeof f == "function", S = r && m.key === b && e.artifactOrder.length === 0;
        return /* @__PURE__ */ t("div", { className: "meso-event-text", "data-streaming-role": "content", children: k ? /* @__PURE__ */ t("div", { className: "meso-bubble__md", dangerouslySetInnerHTML: { __html: f(m.text) } }) : /* @__PURE__ */ a(A, { children: [
          m.text,
          S && /* @__PURE__ */ t(me, {})
        ] }) }, m.key);
      }
      if (m.kind === "tool") {
        if (!e.toolCalls[m.id]) return null;
        const S = r && m.id === p, N = Z(u) === "detailed" ? "all" : "none";
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
                defaultExpanded: S ? "all" : N,
                simplify: u,
                onToolConfirm: S ? s : void 0,
                onToolCancel: S ? n : void 0
              }
            )
          },
          m.key
        );
      }
      if (m.kind === "resource") {
        const k = e.resourceReads[m.id];
        return k ? /* @__PURE__ */ t("div", { className: "meso-event-resource", "data-streaming-role": "content", children: /* @__PURE__ */ t(Ne, { resourceRead: k, simplify: u }) }, m.key) : null;
      }
      if (m.kind === "extension") {
        if (!l) return null;
        const k = e.extensionLog[m.index];
        return k ? /* @__PURE__ */ t("div", { className: "meso-event-extension", "data-streaming-role": "content", children: l(k) }, m.key) : null;
      }
      const v = e.artifacts[m.id];
      if (!v) return null;
      const { type: _, language: g } = X(v.lang);
      return /* @__PURE__ */ t("div", { className: "meso-event-artifact", "data-streaming-role": "content", children: /* @__PURE__ */ t(
        q,
        {
          type: _,
          content: v.content,
          language: g,
          streaming: r && !v.done,
          onCopy: o,
          onDownload: d,
          renderMermaid: i,
          highlightCode: h,
          renderMarkdown: f
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
function ut({
  messages: e,
  streaming: r,
  onArtifactCopy: s,
  onArtifactDownload: n,
  onToolConfirm: l,
  onToolCancel: o,
  emptyState: d,
  emptyStateAlign: i = "center",
  className: h,
  renderExtension: f,
  renderLiveTrace: c,
  renderMarkdown: u,
  renderMermaid: p,
  highlightCode: w,
  hiddenArtifactLangs: b,
  renderingMode: m,
  simplify: v
}) {
  const _ = I(null), g = m !== "block", k = m || "blend";
  R(() => {
    var N;
    (N = _.current) == null || N.scrollIntoView({ behavior: "smooth" });
  }, [e, r]), R(() => {
    if (!r || r.status !== "done") return;
    const N = document.querySelector(".meso-message-list__live");
    if (!N) return;
    N.querySelectorAll('[data-streaming-role="content"]').forEach((C) => {
      C.contentEditable = "false", C.dataset.frozen = "true";
    });
  }, [r == null ? void 0 : r.status]);
  const S = e.length > 0 || r && r.status !== "idle";
  return /* @__PURE__ */ t("div", { className: `meso-message-list meso-message-list--mode-${k}${h ? ` ${h}` : ""}`, children: /* @__PURE__ */ a("div", { className: "meso-message-list__inner", children: [
    !S && d && /* @__PURE__ */ t("div", { className: `meso-message-list__empty${i === "top" ? " meso-message-list__empty--top" : ""}`, children: d }),
    e.map((N) => N.role === "assistant" && N.trace && g ? /* @__PURE__ */ a("div", { className: "meso-message-list__committed", children: [
      /* @__PURE__ */ t(
        de,
        {
          stream: N.trace,
          streaming: !1,
          renderExtension: f,
          onArtifactCopy: s,
          onArtifactDownload: n,
          renderMermaid: p,
          highlightCode: w,
          renderMarkdown: u,
          hiddenArtifactLangs: b,
          simplify: v
        }
      ),
      N.timestamp && /* @__PURE__ */ t("div", { className: "meso-bubble__timestamp", children: N.timestamp })
    ] }, N.id) : /* @__PURE__ */ a(J.Fragment, { children: [
      /* @__PURE__ */ t(
        ce,
        {
          role: N.role,
          content: N.content,
          timestamp: N.timestamp,
          markdown: N.role === "assistant",
          renderMarkdown: u
        }
      ),
      N.artifacts && N.artifacts.length > 0 && N.artifacts.map((x) => {
        const { type: C, language: y } = X(x.lang);
        return /* @__PURE__ */ t(
          q,
          {
            type: C,
            content: x.content,
            language: y,
            onCopy: s,
            onDownload: n,
            renderMermaid: p,
            highlightCode: w,
            renderMarkdown: u
          },
          x.id
        );
      })
    ] }, N.id)),
    r && r.status !== "idle" && /* @__PURE__ */ t("div", { className: "meso-message-list__live", children: c ? c(r) : /* @__PURE__ */ t(A, { children: g ? /* @__PURE__ */ t(
      de,
      {
        stream: r,
        streaming: r.status === "streaming",
        onToolConfirm: l,
        onToolCancel: o,
        renderExtension: f,
        onArtifactCopy: s,
        onArtifactDownload: n,
        renderMermaid: p,
        highlightCode: w,
        renderMarkdown: u,
        hiddenArtifactLangs: b,
        simplify: v
      }
    ) : /* @__PURE__ */ a(A, { children: [
      (r.activeSoul || r.activeSkill) && /* @__PURE__ */ a("div", { className: "meso-message-list__context-row", children: [
        r.activeSoul && /* @__PURE__ */ t(fe, { soul: r.activeSoul }),
        r.activeSkill && /* @__PURE__ */ t(pe, { skill: r.activeSkill })
      ] }),
      /* @__PURE__ */ t(
        Xe,
        {
          stream: r,
          onToolConfirm: l,
          onToolCancel: o,
          simplify: v
        }
      ),
      f && r.extensionLog.length > 0 && /* @__PURE__ */ t("div", { className: "meso-message-list__extensions", children: r.extensionLog.map((N, x) => /* @__PURE__ */ t(J.Fragment, { children: f(N) }, x)) }),
      (r.textContent || r.status === "streaming") && /* @__PURE__ */ t(
        ce,
        {
          role: "assistant",
          content: r.textContent,
          streaming: r.status === "streaming" && r.artifactOrder.length === 0,
          markdown: !0,
          renderMarkdown: u
        }
      ),
      r.artifactOrder.map((N) => {
        const x = r.artifacts[N];
        if (!x || b != null && b.includes(x.lang)) return null;
        const { type: C, language: y } = X(x.lang);
        return /* @__PURE__ */ t(
          q,
          {
            type: C,
            content: x.content,
            language: y,
            streaming: !x.done,
            onCopy: s,
            onDownload: n,
            renderMermaid: p,
            highlightCode: w,
            renderMarkdown: u
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
    /* @__PURE__ */ t("div", { ref: _ })
  ] }) });
}
function mt({
  value: e,
  onChange: r,
  onSubmit: s,
  onStop: n,
  streaming: l = !1,
  disabled: o = !1,
  placeholder: d = "输入消息… (Ctrl+Enter 发送，Enter 换行)",
  leadingSlot: i,
  trailingActions: h,
  maxRows: f = 8
}) {
  const c = I(null), u = 22, p = () => {
    const v = c.current;
    v && (v.style.height = "auto", v.style.height = Math.min(v.scrollHeight, u * f) + "px");
  };
  R(p, [e]);
  const w = (v) => {
    v.key === "Enter" && (v.ctrlKey || v.metaKey) && (v.preventDefault(), !o && !l && e.trim() && s());
  }, b = !o && !l && e.trim().length > 0, m = /* @__PURE__ */ t(
    "button",
    {
      className: `meso-composer__send${l ? " meso-composer__send--stop" : ""}`,
      onClick: l ? n : s,
      disabled: l ? !1 : !b,
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
        ref: c,
        className: "meso-composer__textarea",
        value: e,
        onChange: (v) => {
          r(v.target.value), p();
        },
        onKeyDown: w,
        placeholder: d,
        rows: 1,
        disabled: o && !l,
        "aria-label": "消息输入框"
      }
    ),
    /* @__PURE__ */ a("div", { className: "meso-composer__toolbar", children: [
      /* @__PURE__ */ t("div", { className: "meso-composer__leading", children: i }),
      /* @__PURE__ */ t("span", { className: "meso-composer__hint", children: e.length > 0 && `${e.length} 字` }),
      /* @__PURE__ */ t("div", { className: "meso-composer__trailing", children: h ?? m })
    ] })
  ] }) });
}
function we({
  system: e,
  resetOnTurnStart: r = !1
}) {
  const [s, n] = $(null), l = I(e);
  return R(() => {
    r && !l.current && e && n(null), l.current = e;
  }, [e, r]), {
    open: s !== null ? s : e,
    setOpen: (d) => n(d),
    toggle: () => n((d) => d !== null ? !d : !e),
    clearIntent: () => n(null),
    hasUserIntent: s !== null
  };
}
function Ze(e) {
  const r = /* @__PURE__ */ new Map(), s = [];
  for (const n of e.toolCallOrder) {
    const l = e.toolCalls[n];
    if (!l) continue;
    const o = l.groupId ? `${l.groupKind ?? "group"}:${l.groupId}` : `__single__:${n}`;
    r.has(o) || (r.set(o, {
      key: o,
      groupId: l.groupId,
      groupKind: l.groupKind,
      ids: []
    }), s.push(o)), r.get(o).ids.push(n);
  }
  return s.map((n) => r.get(n));
}
function Qe(e) {
  const r = e.toolCallOrder.length + e.workflowRunOrder.reduce(
    (l, o) => {
      var d;
      return l + (((d = e.workflowRuns[o]) == null ? void 0 : d.nodeOrder.length) ?? 0);
    },
    0
  ), s = e.toolCallOrder.filter((l) => {
    var o;
    return ((o = e.toolCalls[l]) == null ? void 0 : o.status) === "error";
  }).length + e.workflowRunOrder.reduce((l, o) => {
    const d = e.workflowRuns[o];
    return d ? l + d.nodeOrder.filter((i) => {
      var h;
      return ((h = d.nodes[i]) == null ? void 0 : h.state) === "error";
    }).length : l;
  }, 0), n = [];
  return e.phaseOrder.length > 0 && n.push(`${e.phaseOrder.length} 阶段`), r > 0 && n.push(`${r} 步`), s > 0 && n.push(`${s} 项失败`), n.length > 0 ? n.join(" · ") : "执行过程";
}
function et(e, r, s) {
  const n = !!(e.thinkContent || e.pinnedThink);
  return /* @__PURE__ */ a("div", { className: "meso-process-trace__phase", "data-testid": `meso-phase-${e.id}`, children: [
    /* @__PURE__ */ a("div", { className: "meso-process-trace__phase-header", children: [
      /* @__PURE__ */ t(D, { status: Je(e.state), size: 14 }),
      /* @__PURE__ */ t("span", { className: "meso-process-trace__phase-name", children: e.name })
    ] }),
    n && /* @__PURE__ */ t(
      Q,
      {
        content: e.thinkContent,
        pinnedContent: e.pinnedThink,
        streaming: r && e.state === "running",
        collapseWhen: "never",
        defaultOpen: !0,
        simplify: s
      }
    ),
    e.body && /* @__PURE__ */ t("div", { className: "meso-process-trace__phase-body", children: e.body })
  ] });
}
function ht({
  stream: e,
  streaming: r = !1,
  turnStreaming: s = !1,
  defaultCollapsed: n = !1,
  className: l,
  onToolConfirm: o,
  onToolCancel: d,
  renderToolCall: i,
  renderPhase: h,
  renderWorkflow: f,
  simplify: c
}) {
  const u = we({
    system: !n,
    resetOnTurnStart: s
  });
  if (!(!!e.thinkContent || e.phaseOrder.length > 0 || e.memorySnippets.length > 0 || e.resourceReadOrder.length > 0 || e.toolCallOrder.length > 0 || e.workflowRunOrder.length > 0)) return null;
  const w = Qe(e), b = e.workflowRunOrder.map((_) => e.workflowRuns[_]).filter(Boolean), m = Ze(e), v = e.phaseOrder.map((_) => e.phases[_]).filter(Boolean).map(Te);
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
            onClick: u.toggle,
            "aria-expanded": u.open,
            "aria-label": u.open ? "折叠执行过程" : "展开执行过程",
            children: [
              /* @__PURE__ */ t(
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
                  children: /* @__PURE__ */ t("polyline", { points: "3,5 7,9 11,5" })
                }
              ),
              /* @__PURE__ */ t("span", { className: "meso-process-trace__summary", children: w }),
              r && /* @__PURE__ */ t("span", { className: "meso-process-trace__dot", "aria-label": "执行中" })
            ]
          }
        ),
        u.open && /* @__PURE__ */ a("div", { className: "meso-process-trace__body", children: [
          v.length > 0 && /* @__PURE__ */ t(We, { compact: !0, stages: v }),
          e.memorySnippets.length > 0 && /* @__PURE__ */ t("div", { className: "meso-memory-chips", children: e.memorySnippets.map((_, g) => /* @__PURE__ */ a("span", { className: "meso-memory-chip", title: _.content, children: [
            "[",
            _.category,
            "] ",
            _.content
          ] }, g)) }),
          e.thinkContent && /* @__PURE__ */ t(
            Q,
            {
              content: e.thinkContent,
              streaming: r && !e.thinkDone,
              collapseWhen: "never",
              defaultOpen: !0,
              turnStreaming: s,
              simplify: c
            }
          ),
          e.phaseOrder.length > 0 && /* @__PURE__ */ t("div", { className: "meso-process-trace__phases", children: e.phaseOrder.map((_) => {
            const g = e.phases[_];
            if (!g) return null;
            const k = h == null ? void 0 : h(g);
            return k != null ? /* @__PURE__ */ t("div", { children: k }, _) : /* @__PURE__ */ t("div", { children: et(g, r, c) }, _);
          }) }),
          e.resourceReadOrder.length > 0 && /* @__PURE__ */ t("div", { className: "meso-process-trace__resources", children: e.resourceReadOrder.map((_) => {
            const g = e.resourceReads[_];
            return g ? /* @__PURE__ */ t(Ne, { resourceRead: g, simplify: c }, _) : null;
          }) }),
          m.length > 0 && /* @__PURE__ */ t("div", { className: "meso-process-trace__tools", children: m.map((_) => /* @__PURE__ */ a(
            "div",
            {
              className: `meso-process-trace__tool-group${_.groupId ? " meso-process-trace__tool-group--grouped" : ""}`,
              "data-group-id": _.groupId,
              "data-group-kind": _.groupKind,
              children: [
                _.groupId && /* @__PURE__ */ a("div", { className: "meso-process-trace__tool-group-label", children: [
                  _.groupKind ?? "group",
                  ": ",
                  _.groupId
                ] }),
                _.ids.map((g) => {
                  const k = e.toolCalls[g];
                  if (!k) return null;
                  const S = i == null ? void 0 : i(k);
                  return S != null ? /* @__PURE__ */ t("div", { children: S }, g) : /* @__PURE__ */ t(
                    ge,
                    {
                      toolCall: k,
                      onConfirm: o,
                      onCancel: d,
                      simplify: c
                    },
                    g
                  );
                })
              ]
            },
            _.key
          )) }),
          b.length > 0 && ((f == null ? void 0 : f(e)) ?? /* @__PURE__ */ t(Ke, { runs: b }))
        ] })
      ]
    }
  );
}
function _t({
  name: e,
  email: r,
  avatarText: s,
  menuItems: n = [],
  onSignOut: l
}) {
  const [o, d] = $(!1), i = I(null);
  R(() => {
    if (!o) return;
    const c = (u) => {
      i.current && !i.current.contains(u.target) && d(!1);
    };
    return document.addEventListener("mousedown", c), () => document.removeEventListener("mousedown", c);
  }, [o]);
  const h = s ?? e.charAt(0).toUpperCase(), f = [
    ...n,
    ...l ? [{ label: "退出登录", onClick: () => {
      d(!1), l();
    }, danger: !0 }] : []
  ];
  return /* @__PURE__ */ a("div", { className: "meso-user-menu", ref: i, children: [
    o && /* @__PURE__ */ a("div", { className: "meso-user-menu__popup", role: "menu", children: [
      /* @__PURE__ */ a("div", { className: "meso-user-menu__identity", children: [
        /* @__PURE__ */ t("span", { className: "meso-user-menu__identity-name", children: e }),
        r && /* @__PURE__ */ t("span", { className: "meso-user-menu__identity-email", children: r })
      ] }),
      f.length > 0 && /* @__PURE__ */ t("div", { className: "meso-user-menu__sep", role: "separator" }),
      f.map((c, u) => /* @__PURE__ */ a(
        "button",
        {
          className: `meso-user-menu__item${c.danger ? " meso-user-menu__item--danger" : ""}`,
          role: "menuitem",
          onClick: () => {
            d(!1), c.onClick();
          },
          children: [
            c.icon && /* @__PURE__ */ t("span", { className: "meso-user-menu__item-icon", children: c.icon }),
            c.label
          ]
        },
        u
      ))
    ] }),
    /* @__PURE__ */ a(
      "button",
      {
        className: "meso-user-menu__trigger",
        onClick: () => d((c) => !c),
        "aria-haspopup": "menu",
        "aria-expanded": o,
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
function ft({
  tabs: e,
  activeTabId: r,
  onTabChange: s,
  autoSelectFirstReady: n = !1
}) {
  var u;
  const l = r !== void 0, [o, d] = $(((u = e[0]) == null ? void 0 : u.id) ?? ""), i = l ? r : o, h = I(!1);
  R(() => {
    if (!n || h.current) return;
    const p = e.find((w) => w.ready);
    p && (h.current = !0, l || d(p.id), s == null || s(p.id));
  }, [e, n, l, s]);
  const f = (p) => {
    l || d(p), s == null || s(p);
  }, c = e.find((p) => p.id === i) ?? e[0];
  return e.length === 0 ? null : /* @__PURE__ */ a("div", { className: "meso-artifact-shell", children: [
    /* @__PURE__ */ t("div", { className: "meso-artifact-shell__tabs", role: "tablist", children: e.map((p) => /* @__PURE__ */ a(
      "button",
      {
        role: "tab",
        "aria-selected": p.id === i,
        className: `meso-artifact-shell__tab${p.id === i ? " meso-artifact-shell__tab--active" : ""}`,
        onClick: () => f(p.id),
        children: [
          p.label,
          p.ready === !1 && /* @__PURE__ */ t("span", { className: "meso-artifact-shell__tab-dot", "aria-label": "加载中" })
        ]
      },
      p.id
    )) }),
    /* @__PURE__ */ t("div", { className: "meso-artifact-shell__content", role: "tabpanel", children: c == null ? void 0 : c.content })
  ] });
}
function pt({ status: e, primary: r, outcome: s, detail: n, className: l, "data-testid": o }) {
  const d = n !== void 0 && n !== "", i = we({ system: !1 });
  return /* @__PURE__ */ a("div", { className: `meso-log-line${l ? ` ${l}` : ""}`, "data-testid": o ?? "meso-log-line", children: [
    /* @__PURE__ */ a(
      "div",
      {
        className: `meso-log-line__row${d ? " meso-log-line__row--clickable" : ""}`,
        onClick: d ? i.toggle : void 0,
        role: d ? "button" : void 0,
        tabIndex: d ? 0 : void 0,
        onKeyDown: d ? (h) => {
          (h.key === "Enter" || h.key === " ") && i.toggle();
        } : void 0,
        "aria-expanded": d ? i.open : void 0,
        "aria-label": d ? `${r}，${i.open ? "折叠" : "展开"}详情` : void 0,
        children: [
          /* @__PURE__ */ t(D, { status: e, size: 14, className: "meso-log-line__icon" }),
          /* @__PURE__ */ t("span", { className: "meso-log-line__primary", children: r }),
          s && /* @__PURE__ */ t("span", { className: "meso-log-line__outcome", children: s }),
          d && /* @__PURE__ */ t(
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
    d && i.open && /* @__PURE__ */ t("pre", { className: "meso-log-line__detail", children: n })
  ] });
}
function vt({
  gaps: e,
  summary: r,
  onRetry: s
}) {
  const n = Array.isArray(e) && e.length > 0, l = typeof r == "string" && r.length > 0;
  return !n && !l ? null : /* @__PURE__ */ a("div", { className: "meso-precondition-banner", role: "alert", "data-testid": "meso-precondition-banner", children: [
    /* @__PURE__ */ a("div", { className: "meso-precondition-banner__header", children: [
      /* @__PURE__ */ t(D, { status: "error", size: 18, className: "meso-precondition-banner__icon" }),
      /* @__PURE__ */ t("span", { className: "meso-precondition-banner__title", children: "证据不足，前置条件未满足" })
    ] }),
    /* @__PURE__ */ t("p", { className: "meso-precondition-banner__body", children: l ? r : "分析所需的取证数据未齐备" }),
    n && /* @__PURE__ */ t("div", { className: "meso-precondition-banner__gaps", children: e.map((o) => /* @__PURE__ */ t("span", { className: "meso-precondition-banner__gap-tag", children: o }, o)) }),
    s && /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: "meso-precondition-banner__retry-btn",
        onClick: s,
        children: "补充信息后重试"
      }
    )
  ] });
}
const tt = /* @__PURE__ */ new Set(["text", "think"]);
function st(e, r, s) {
  var n, l, o, d, i, h, f, c, u, p, w, b, m, v, _, g;
  if (s)
    switch (e.type) {
      case "capabilities":
        (n = s.onCapabilities) == null || n.call(s, e.payload);
        break;
      case "phase":
        (l = s.onPhaseChange) == null || l.call(s, e.payload);
        break;
      case "memory":
        (o = s.onMemoryRecalled) == null || o.call(s, e.payload.snippets);
        break;
      case "memory_saved":
        (d = s.onMemorySaved) == null || d.call(s, e.payload);
        break;
      case "soul":
        (i = s.onSoulActivated) == null || i.call(s, e.payload);
        break;
      case "skill_active":
        (h = s.onSkillActivated) == null || h.call(s, e.payload);
        break;
      case "tool_call":
        (f = s.onToolCall) == null || f.call(s, e.payload);
        break;
      case "tool_result":
        (c = s.onToolResult) == null || c.call(s, e.payload);
        break;
      case "resource_read":
        (u = s.onResourceRead) == null || u.call(s, e.payload);
        break;
      case "resource_content":
        (p = s.onResourceContent) == null || p.call(s, e.payload);
        break;
      case "text":
        (w = s.onText) == null || w.call(s, e.payload.delta, r);
        break;
      case "think":
        (b = s.onThink) == null || b.call(s, e.payload.delta, r);
        break;
      case "artifact": {
        const k = r.artifacts[e.payload.id];
        k && ((m = s.onArtifact) == null || m.call(s, k));
        break;
      }
      case "extension":
        (v = s.onExtensionEvent) == null || v.call(s, e);
        break;
      case "error":
        (_ = s.onError) == null || _.call(s, e.payload.message, e.payload.code);
        break;
      case "done":
        (g = s.onDone) == null || g.call(s, r);
        break;
    }
}
function gt(e, r) {
  const [s, n] = $(F), l = I(null), o = I(!1), d = I(r);
  d.current = r;
  const i = G(() => {
    var c;
    (c = l.current) == null || c.abort(), o.current = !1, n((u) => ({ ...u, status: "idle" }));
  }, []), h = G(() => {
    var c;
    (c = l.current) == null || c.abort(), o.current = !1, n(F());
  }, []), f = G(async (c) => {
    var _, g, k, S, N, x;
    if (o.current) return;
    o.current = !0;
    const u = typeof (c == null ? void 0 : c.reconnect) == "object" ? c.reconnect : { maxAttempts: 3, baseDelayMs: 1e3 }, p = c != null && c.reconnect ? u.maxAttempts ?? 3 : 0, w = u.baseDelayMs ?? 1e3, b = (c == null ? void 0 : c.batchMs) === void 0 ? 16 : c.batchMs;
    let m = 0;
    const v = async () => {
      var re;
      (re = l.current) == null || re.abort();
      const C = new AbortController();
      l.current = C;
      const y = { ...F(), status: "streaming" };
      n(y);
      let T = y;
      const M = (c == null ? void 0 : c.method) ?? (c != null && c.body ? "POST" : "GET"), j = (c == null ? void 0 : c.watchdogMs) === void 0 ? 12e4 : c.watchdogMs;
      let W = null;
      const P = () => {
        W && clearTimeout(W);
      }, z = () => {
        P(), j != null && (W = setTimeout(() => {
          var O, U;
          C.abort();
          const L = `SSE stream timed out after ${j}ms of inactivity`;
          n((H) => ({ ...H, status: "error", errorMessage: L, errorCode: "WATCHDOG_TIMEOUT" })), (U = (O = d.current) == null ? void 0 : O.onError) == null || U.call(O, L, "WATCHDOG_TIMEOUT");
        }, j));
      }, B = [];
      let E = null;
      const te = (L) => {
        const O = Oe(T, L);
        if (T = O, n(O), st(L, O, d.current), L.type === "done" || L.type === "error")
          return P(), L.type;
      }, se = () => {
        for (; B.length > 0; ) {
          const L = B.shift(), O = te(L);
          if (O) return O;
        }
      }, xe = (L) => {
        if (b != null && tt.has(L.type)) {
          B.push(L), E || (E = setTimeout(() => {
            E = null, se();
          }, b));
          return;
        }
        return te(L);
      };
      try {
        const L = await fetch(e, {
          method: M,
          headers: {
            ...M === "POST" ? { "Content-Type": "application/json" } : {},
            ...c == null ? void 0 : c.headers
          },
          body: c != null && c.body ? JSON.stringify(c.body) : void 0,
          signal: C.signal
        });
        if (!L.ok) throw new Error(`HTTP ${L.status}`);
        const O = L.body.getReader(), U = new TextDecoder();
        let H = "";
        for (z(); ; ) {
          const { done: Ce, value: Se } = await O.read();
          if (Ce) break;
          z(), H += U.decode(Se, { stream: !0 });
          const oe = H.split(`
`);
          H = oe.pop() ?? "";
          for (const Le of oe) {
            const ae = Ee(Le);
            if (!ae) continue;
            const le = xe(ae);
            if (le) return le;
          }
        }
        E && (clearTimeout(E), E = null);
        const ne = se();
        return ne || "interrupted";
      } catch (L) {
        if (L.name === "AbortError") return "interrupted";
        throw L;
      } finally {
        P(), E && clearTimeout(E);
      }
    };
    try {
      for (; ; ) {
        try {
          const C = await v();
          if (C === "done" || C === "error") return;
          if (!(c != null && c.reconnect) || m >= p) {
            const y = "SSE stream ended unexpectedly";
            n((T) => ({ ...T, status: "error", errorMessage: y, errorCode: "STREAM_ENDED" })), (g = (_ = d.current) == null ? void 0 : _.onError) == null || g.call(_, y, "STREAM_ENDED");
            return;
          }
        } catch (C) {
          if (!(c != null && c.reconnect) || m >= p) {
            const y = C.message;
            n((T) => ({ ...T, status: "error", errorMessage: y })), (S = (k = d.current) == null ? void 0 : k.onError) == null || S.call(k, y);
            return;
          }
        }
        m += 1, (x = (N = d.current) == null ? void 0 : N.onReconnect) == null || x.call(N, m), await new Promise((C) => setTimeout(C, w * Math.pow(2, m - 1)));
      }
    } finally {
      o.current = !1;
    }
  }, [e]);
  return { state: s, start: f, abort: i, reset: h };
}
const be = "meso-theme";
function rt() {
  return typeof window > "u" ? "light" : localStorage.getItem(be) ?? "light";
}
function nt(e) {
  document.documentElement.setAttribute("data-theme", e), localStorage.setItem(be, e);
}
function Nt() {
  const [e, r] = $(rt);
  R(() => {
    nt(e);
  }, [e]);
  const s = G(() => {
    r((n) => n === "light" ? "dark" : "light");
  }, []);
  return { theme: e, toggle: s };
}
const ye = {
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
}, ot = {
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
}, at = {
  "zh-CN": ye,
  "en-US": ot
}, ee = $e({
  locale: "zh-CN",
  labels: ye
});
function kt({
  locale: e = "zh-CN",
  labels: r,
  children: s
}) {
  const n = { ...at[e], ...r };
  return /* @__PURE__ */ t(ee.Provider, { value: { locale: e, labels: n }, children: s });
}
function wt() {
  return ue(ee).labels;
}
function bt() {
  return ue(ee);
}
export {
  ft as ArtifactPaneShell,
  q as ArtifactPanel,
  ce as ChatBubble,
  mt as ChatComposer,
  K as ChevronIcon,
  Y as CollapsibleToolTrace,
  Ge as ConfirmGate,
  Ct as EXTENSION_PRESETS,
  pt as LogLine,
  kt as MesoLocaleProvider,
  ut as MessageList,
  St as PROTOCOL_VERSION,
  vt as PreconditionUnmetBanner,
  ht as ProcessTrace,
  Ne as ResourceReadBlock,
  _t as SidebarUserMenu,
  pe as SkillIndicator,
  fe as SoulIndicator,
  We as StageTimeline,
  D as StatusIcon,
  me as StreamingCursor,
  Q as ThinkBlock,
  dt as ThreeColumnLayout,
  ge as ToolCallBlock,
  Ke as WorkflowTimeline,
  Oe as applyEvent,
  Lt as assertCompatibleVersion,
  F as createInitialStreamState,
  $t as createStreamStateWithArtifacts,
  at as defaultLabelsByLocale,
  ot as enUSLabels,
  Tt as isCompatibleVersion,
  Et as isPresetExtension,
  Ee as parseSSELine,
  Te as phaseRecordToStage,
  Ot as resolveExtensionAlias,
  It as streamStateHasArtifacts,
  we as useFoldState,
  wt as useMesoLabels,
  bt as useMesoLocale,
  gt as useSSEStream,
  Nt as useTheme,
  ye as zhCNLabels
};
