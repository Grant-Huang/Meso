import { jsxs as o, jsx as e, Fragment as M } from "react/jsx-runtime";
import Z, { useState as w, useRef as $, useCallback as T, useEffect as O } from "react";
import { createInitialStreamState as V, parseSSELine as te, applyEvent as ne } from "./runtime.js";
import { PROTOCOL_VERSION as Ue } from "./runtime.js";
const q = 0.4, Q = 0.8, le = 0.6;
function ie(r, a) {
  if (!r) return a;
  try {
    const t = parseFloat(localStorage.getItem(r) ?? "");
    if (!isNaN(t) && t >= q && t <= Q) return t;
  } catch {
  }
  return a;
}
function X(r, a) {
  if (r)
    try {
      localStorage.setItem(r, String(a));
    } catch {
    }
}
function Be({
  navItems: r = [],
  sidebarFooter: a,
  sessionColumn: t,
  sessionColumnVisible: s = !0,
  children: i,
  defaultCollapsed: n = !1,
  appName: u = "Meso",
  mainHeader: h,
  artifactContent: d,
  splitMode: l = !1,
  onSplitModeChange: p,
  defaultSplitRatio: _ = le,
  onSplitRatioChange: k,
  splitRatioStorageKey: v
}) {
  const [c, f] = w(n), [C, x] = w(
    () => ie(v, _)
  ), S = $(!1), L = $(null), A = T((N) => {
    N.currentTarget.setPointerCapture(N.pointerId), S.current = !0;
  }, []), R = T((N) => {
    if (!S.current || !L.current) return;
    const g = L.current.getBoundingClientRect(), W = (N.clientX - g.left) / g.width, E = Math.min(Q, Math.max(q, W));
    x(E);
  }, []), B = T((N) => {
    S.current && (S.current = !1, N.currentTarget.releasePointerCapture(N.pointerId), x((g) => (X(v, g), k == null || k(g), g)));
  }, [v, k]);
  O(() => {
    X(v, C);
  }, [v]);
  const y = l && !!d;
  return /* @__PURE__ */ o("div", { className: "meso-layout", children: [
    /* @__PURE__ */ o("aside", { className: `meso-sidebar${c ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ o("div", { className: "meso-sidebar__header", children: [
        /* @__PURE__ */ e("div", { className: "meso-sidebar__logo", children: u[0] }),
        /* @__PURE__ */ e("span", { className: "meso-sidebar__title", children: u }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => f(!c),
            "aria-label": c ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ o("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ e("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ e("nav", { className: "meso-sidebar__nav", children: r.map((N) => /* @__PURE__ */ o(
        "div",
        {
          className: `meso-sidebar__nav-item${N.active ? " meso-sidebar__nav-item--active" : ""}`,
          onClick: N.onClick,
          title: N.label,
          children: [
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-icon", children: N.icon }),
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-label", children: N.label })
          ]
        },
        N.id
      )) }),
      a && /* @__PURE__ */ e("div", { className: "meso-sidebar__footer", children: a })
    ] }),
    t !== void 0 && /* @__PURE__ */ e("div", { className: `meso-session-col${s ? "" : " meso-session-col--hidden"}`, children: t }),
    /* @__PURE__ */ o("main", { className: "meso-main", ref: L, children: [
      h && /* @__PURE__ */ o("div", { className: "meso-main__header", children: [
        h,
        d && /* @__PURE__ */ e(
          "button",
          {
            className: "meso-main__artifact-toggle",
            onClick: () => p == null ? void 0 : p(!l),
            "aria-label": l ? "收起预览" : "展开预览",
            title: l ? "收起预览" : "展开预览",
            children: /* @__PURE__ */ e("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: l ? (
              // collapse: chevron right
              /* @__PURE__ */ e("polyline", { points: "6,3 11,8 6,13" })
            ) : (
              // expand: split columns icon
              /* @__PURE__ */ o(M, { children: [
                /* @__PURE__ */ e("rect", { x: "1", y: "2", width: "14", height: "12", rx: "1.5" }),
                /* @__PURE__ */ e("line", { x1: "8", y1: "2", x2: "8", y2: "14" })
              ] })
            ) })
          }
        )
      ] }),
      /* @__PURE__ */ e("div", { className: "meso-main__content", children: y ? /* @__PURE__ */ o(M, { children: [
        /* @__PURE__ */ e(
          "div",
          {
            className: "meso-main__chat",
            style: { width: `${C * 100}%` },
            children: i
          }
        ),
        /* @__PURE__ */ e(
          "div",
          {
            className: "meso-split-divider",
            role: "separator",
            "aria-label": "拖动调整宽度",
            onPointerDown: A,
            onPointerMove: R,
            onPointerUp: B
          }
        ),
        /* @__PURE__ */ e("div", { className: "meso-main__artifact", children: d })
      ] }) : i })
    ] })
  ] });
}
function Y({
  role: r,
  content: a,
  streaming: t = !1,
  timestamp: s,
  markdown: i = !1,
  renderMarkdown: n
}) {
  const u = i && typeof n == "function";
  return /* @__PURE__ */ o("div", { className: `meso-bubble meso-bubble--${r}`, children: [
    r === "assistant" && /* @__PURE__ */ e("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ o("div", { className: "meso-bubble__body", children: [
      u ? /* @__PURE__ */ e(
        "div",
        {
          className: "meso-bubble__content meso-bubble__md",
          dangerouslySetInnerHTML: { __html: n(a) }
        }
      ) : /* @__PURE__ */ o("div", { className: "meso-bubble__content", children: [
        a.split(`
`).map((h, d) => /* @__PURE__ */ o(Z.Fragment, { children: [
          d > 0 && /* @__PURE__ */ e("br", {}),
          h
        ] }, d)),
        t && /* @__PURE__ */ e("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      s && /* @__PURE__ */ e("div", { className: "meso-bubble__timestamp", children: s })
    ] })
  ] });
}
function ce({ content: r, streaming: a = !1, autoCollapseDelay: t = 1500 }) {
  const [s, i] = w(!0), n = $(a);
  return O(() => {
    if (n.current && !a) {
      const u = setTimeout(() => i(!1), t);
      return () => clearTimeout(u);
    }
    n.current = a;
  }, [a, t]), /* @__PURE__ */ o("div", { className: `meso-think${s ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ o(
      "button",
      {
        className: "meso-think__header",
        onClick: () => i(!s),
        "aria-expanded": s,
        children: [
          /* @__PURE__ */ e("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ e("span", { className: "meso-think__label", children: "思考过程" }),
          a && /* @__PURE__ */ e("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { className: "meso-think__body", children: /* @__PURE__ */ o("div", { className: "meso-think__content", children: [
      r,
      a && /* @__PURE__ */ e("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function Me({ active: r = !0 }) {
  return r ? /* @__PURE__ */ e("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function de(r) {
  try {
    const a = JSON.parse(r);
    return Array.isArray(a.headers) && Array.isArray(a.rows) ? a : null;
  } catch {
    return null;
  }
}
function me({
  type: r,
  content: a,
  language: t = "plaintext",
  streaming: s = !1,
  onCopy: i,
  onDownload: n,
  renderMermaid: u,
  highlightCode: h,
  renderMarkdown: d
}) {
  const [l, p] = w(!1), [_, k] = w(r), [v, c] = w(null), [f, C] = w(!1), [x, S] = w(null), L = $("");
  O(() => {
    k(r);
  }, [r]), O(() => {
    r !== "mermaid" || s || !u || a === L.current || (L.current = a, c(null), C(!1), u(a).then((y) => c(y)).catch(() => C(!0)));
  }, [r, s, a, u]), O(() => {
    r !== "code" || s || !h || a === L.current && x || (L.current = a, S(h(a, t)));
  }, [r, s, a, t, h, x]);
  const A = () => {
    navigator.clipboard.writeText(a).catch(() => {
    }), p(!0), setTimeout(() => p(!1), 2e3), i == null || i(a);
  }, R = () => {
    if (n) {
      n(a);
      return;
    }
    const y = {
      html: "html",
      mermaid: "md",
      markdown: "md",
      table: "json",
      code: t || "txt"
    }, N = new Blob([a], { type: "text/plain" }), g = document.createElement("a");
    g.href = URL.createObjectURL(N), g.download = `artifact.${y[r]}`, g.click(), URL.revokeObjectURL(g.href);
  };
  return /* @__PURE__ */ o("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ o("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ e("div", { className: "meso-artifact__tabs", children: (r === "html" ? ["html", "code"] : [r]).map((y) => /* @__PURE__ */ e(
        "span",
        {
          className: `meso-artifact__tab${_ === y ? " meso-artifact__tab--active" : ""}`,
          onClick: () => k(y),
          children: ue(y, t)
        },
        y
      )) }),
      s && /* @__PURE__ */ e("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ e("button", { className: "meso-artifact__download-btn", onClick: R, title: "下载", "aria-label": "下载文件", children: /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) }) }),
      /* @__PURE__ */ e("button", { className: "meso-artifact__copy-btn", onClick: A, title: "复制", "aria-label": "复制代码", children: l ? /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ o("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ e("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
      ] }) })
    ] }),
    /* @__PURE__ */ o("div", { className: "meso-artifact__body", children: [
      _ === "html" && /* @__PURE__ */ e("iframe", { className: "meso-artifact__preview", srcDoc: a, sandbox: "allow-scripts", title: "HTML 预览" }),
      _ === "mermaid" && /* @__PURE__ */ o(M, { children: [
        s && /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
          /* @__PURE__ */ e("code", { children: a }),
          /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
        ] }),
        !s && v && /* @__PURE__ */ e(
          "div",
          {
            className: "meso-artifact__mermaid",
            dangerouslySetInnerHTML: { __html: v }
          }
        ),
        !s && !v && !f && !u && /* @__PURE__ */ o("div", { className: "meso-artifact__mermaid-placeholder", children: [
          /* @__PURE__ */ e("span", { children: "图表预览需要集成 Mermaid 渲染器" }),
          /* @__PURE__ */ e("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ e("code", { children: a }) })
        ] }),
        !s && f && /* @__PURE__ */ o("div", { className: "meso-artifact__mermaid-placeholder meso-artifact__mermaid-placeholder--error", children: [
          /* @__PURE__ */ e("span", { children: "图表渲染失败，请检查语法" }),
          /* @__PURE__ */ e("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ e("code", { children: a }) })
        ] }),
        !s && !v && !f && u && /* @__PURE__ */ e("div", { className: "meso-artifact__mermaid-placeholder", children: /* @__PURE__ */ e("span", { children: "渲染中…" }) })
      ] }),
      _ === "markdown" && /* @__PURE__ */ e(M, { children: d ? /* @__PURE__ */ e(
        "div",
        {
          className: "meso-artifact__markdown",
          dangerouslySetInnerHTML: { __html: d(a) }
        }
      ) : /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
        /* @__PURE__ */ e("code", { children: a }),
        s && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] }) }),
      _ === "table" && /* @__PURE__ */ e(he, { content: a, streaming: s }),
      (_ === "code" || _ === "html" && !1) && /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
        x && !s ? /* @__PURE__ */ e("code", { dangerouslySetInnerHTML: { __html: x } }) : /* @__PURE__ */ e("code", { children: a }),
        s && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] })
    ] })
  ] });
}
function he({ content: r, streaming: a }) {
  const t = de(r);
  return t ? /* @__PURE__ */ e("div", { className: "meso-artifact__table-wrap", children: /* @__PURE__ */ o("table", { className: "meso-artifact__table", children: [
    /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: t.headers.map((s, i) => /* @__PURE__ */ e("th", { children: s }, i)) }) }),
    /* @__PURE__ */ e("tbody", { children: t.rows.map((s, i) => /* @__PURE__ */ e("tr", { children: s.map((n, u) => /* @__PURE__ */ e("td", { children: String(n) }, u)) }, i)) })
  ] }) }) : /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
    /* @__PURE__ */ e("code", { children: r }),
    a && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
  ] });
}
function ue(r, a) {
  return r === "html" ? "HTML 预览" : r === "mermaid" ? "图表" : r === "markdown" ? "Markdown" : r === "table" ? "表格" : a || "Code";
}
function _e({ stages: r, compact: a = !1 }) {
  return r.length === 0 ? null : /* @__PURE__ */ e("div", { className: `meso-stages${a ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: r.map((t, s) => /* @__PURE__ */ o(
    "div",
    {
      className: `meso-stage meso-stage--${t.status}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-stage__dot", children: t.status === "done" ? /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,5.5 4,8 8.5,2.5" }) }) : /* @__PURE__ */ e("span", { className: "meso-stage__dot-inner" }) }),
        s < r.length - 1 && /* @__PURE__ */ e("div", { className: `meso-stage__line${t.status === "done" ? " meso-stage__line--done" : ""}` }),
        /* @__PURE__ */ e("span", { className: `meso-stage__label${a ? " meso-stage__label--compact" : ""}`, children: t.label })
      ]
    },
    t.id
  )) });
}
function fe(r) {
  const { nodes: a, nodeOrder: t } = r, s = /* @__PURE__ */ new Map();
  for (const h of t) {
    const d = a[h];
    if (!d) continue;
    const l = d.parent_id ?? null;
    s.has(l) || s.set(l, []), s.get(l).push(h);
  }
  const i = /* @__PURE__ */ new Map();
  for (const [, h] of s)
    if (h.length > 1)
      for (const d of h) i.set(d, h);
  const n = [], u = /* @__PURE__ */ new Set();
  for (const h of t) {
    if (u.has(h)) continue;
    const d = a[h];
    if (!d) continue;
    const l = i.get(h);
    if (l) {
      const p = l.map((_) => a[_]).filter((_) => !!_);
      for (const _ of p) u.add(_.node_id);
      n.push({ kind: "parallel", nodes: p, isLast: !1 });
    } else
      u.add(h), n.push({ kind: "node", node: d, isLast: !1 });
  }
  return n.length > 0 && (n[n.length - 1] = { ...n[n.length - 1], isLast: !0 }), n;
}
function K({ state: r }) {
  return r === "done" ? /* @__PURE__ */ e("svg", { className: "meso-wf-node__icon meso-wf-node__icon--done", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,6.5 4.5,9.5 10.5,3" }) }) : r === "error" ? /* @__PURE__ */ o("svg", { className: "meso-wf-node__icon meso-wf-node__icon--error", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ e("line", { x1: "2", y1: "2", x2: "10", y2: "10" }),
    /* @__PURE__ */ e("line", { x1: "10", y1: "2", x2: "2", y2: "10" })
  ] }) : r === "skipped" ? /* @__PURE__ */ e("svg", { className: "meso-wf-node__icon meso-wf-node__icon--skipped", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ e("line", { x1: "2", y1: "6", x2: "10", y2: "6" }) }) : /* @__PURE__ */ e("span", { className: "meso-wf-node__spinner", "aria-hidden": "true" });
}
function ee(r) {
  return r < 1e3 ? `${r}ms` : `${(r / 1e3).toFixed(1)}s`;
}
function pe({ node: r, isLast: a }) {
  var n;
  const [t, s] = w(!1), i = r.metadata && Object.keys(r.metadata).length > 0;
  return /* @__PURE__ */ o("div", { className: `meso-wf-node meso-wf-node--${r.state}`, children: [
    /* @__PURE__ */ o("div", { className: "meso-wf-node__track", children: [
      /* @__PURE__ */ e("div", { className: "meso-wf-node__dot", children: /* @__PURE__ */ e(K, { state: r.state }) }),
      !a && /* @__PURE__ */ e("div", { className: "meso-wf-node__line" })
    ] }),
    /* @__PURE__ */ o("div", { className: "meso-wf-node__body", children: [
      /* @__PURE__ */ o("div", { className: "meso-wf-node__header", children: [
        /* @__PURE__ */ e("code", { className: "meso-wf-node__name", children: r.name }),
        r.duration_ms !== void 0 && /* @__PURE__ */ e("span", { className: "meso-wf-node__duration", children: ee(r.duration_ms) }),
        i && /* @__PURE__ */ e(
          "button",
          {
            className: "meso-wf-node__expand",
            onClick: () => s((u) => !u),
            "aria-expanded": t,
            "aria-label": t ? "收起详情" : "展开详情",
            children: /* @__PURE__ */ e("svg", { viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", style: { transform: t ? "rotate(180deg)" : void 0 }, children: /* @__PURE__ */ e("polyline", { points: "2,3.5 5,6.5 8,3.5" }) })
          }
        )
      ] }),
      r.state === "error" && !!((n = r.metadata) != null && n.error) && /* @__PURE__ */ e("div", { className: "meso-wf-node__error", children: String(r.metadata.error) }),
      t && i && /* @__PURE__ */ e("pre", { className: "meso-wf-node__meta", children: JSON.stringify(r.metadata, null, 2) })
    ] })
  ] });
}
function ve({ nodes: r, isLast: a }) {
  return /* @__PURE__ */ o("div", { className: "meso-wf-parallel", children: [
    /* @__PURE__ */ e("div", { className: "meso-wf-parallel__row", children: r.map((t, s) => {
      var i;
      return /* @__PURE__ */ o("div", { className: `meso-wf-parallel__branch meso-wf-parallel__branch--${t.state}`, children: [
        /* @__PURE__ */ e("div", { className: "meso-wf-parallel__branch-dot", children: /* @__PURE__ */ e(K, { state: t.state }) }),
        /* @__PURE__ */ o("div", { className: "meso-wf-parallel__branch-body", children: [
          /* @__PURE__ */ o("div", { className: "meso-wf-parallel__branch-label", children: [
            "并行分支 ",
            String.fromCharCode(65 + s)
          ] }),
          /* @__PURE__ */ e("code", { className: "meso-wf-node__name", children: t.name }),
          t.state === "error" && !!((i = t.metadata) != null && i.error) && /* @__PURE__ */ e("div", { className: "meso-wf-node__error", children: String(t.metadata.error) }),
          t.duration_ms !== void 0 && /* @__PURE__ */ e("span", { className: "meso-wf-node__duration", style: { display: "block", marginTop: 2 }, children: ee(t.duration_ms) })
        ] })
      ] }, t.node_id);
    }) }),
    !a && /* @__PURE__ */ e("div", { className: "meso-wf-parallel__merge" })
  ] });
}
function We({ runs: r, showRunId: a = !0 }) {
  if (r.length === 0) return null;
  const t = r.length > 1;
  return /* @__PURE__ */ e("div", { className: "meso-wf", role: "status", "aria-label": "工作流进度", children: r.map((s) => {
    const i = fe(s);
    return /* @__PURE__ */ o("div", { className: "meso-wf-run", children: [
      t && a && /* @__PURE__ */ e("div", { className: "meso-wf-run__label", children: s.run_id }),
      i.map(
        (n, u) => n.kind === "parallel" ? /* @__PURE__ */ e(ve, { nodes: n.nodes, isLast: n.isLast }, `parallel-${u}`) : /* @__PURE__ */ e(pe, { node: n.node, isLast: n.isLast }, n.node.node_id)
      )
    ] }, s.run_id);
  }) });
}
const Ne = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function be({ toolCall: r, onConfirm: a, onCancel: t }) {
  const s = r.risk ?? "safe", i = Ne[s], n = Object.keys(r.args).length > 0;
  return /* @__PURE__ */ o("div", { className: `meso-confirm-gate meso-confirm-gate--${s}`, role: "alertdialog", "aria-label": "工具执行确认", children: [
    /* @__PURE__ */ e("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ o("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ e("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ e("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ o("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ o("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ e("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${s}`, children: i.label }),
        /* @__PURE__ */ e("code", { className: "meso-confirm-gate__tool-name", children: r.name })
      ] }),
      n && /* @__PURE__ */ e("pre", { className: "meso-confirm-gate__args", children: JSON.stringify(r.args, null, 2) }),
      /* @__PURE__ */ o("div", { className: "meso-confirm-gate__actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-confirm-gate__btn meso-confirm-gate__btn--cancel",
            onClick: () => t(r.id),
            children: "取消"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            className: `meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${s}`,
            onClick: () => a(r.id),
            children: i.confirmText
          }
        )
      ] })
    ] })
  ] });
}
const ke = {
  safe: "只读",
  write: "写入",
  destructive: "危险"
}, z = {
  mcp: "MCP",
  api: "API",
  local: "本地"
};
function ge({ toolCall: r, onConfirm: a, onCancel: t }) {
  var k;
  const [s, i] = w(!1), [n, u] = w(!1), { call: h, result: d, status: l } = r, p = h.risk ?? "safe", _ = Object.keys(h.args).length > 0;
  return /* @__PURE__ */ o("div", { className: `meso-tool meso-tool--${l} meso-tool--risk-${p}`, children: [
    /* @__PURE__ */ o("div", { className: "meso-tool__header", children: [
      /* @__PURE__ */ e(we, { status: l }),
      /* @__PURE__ */ e("span", { className: "meso-tool__name", children: h.name }),
      h.provider && z[h.provider] && /* @__PURE__ */ e("span", { className: `meso-tool__provider meso-tool__provider--${h.provider}`, children: z[h.provider] }),
      ((k = h.annotations) == null ? void 0 : k.open_world) && /* @__PURE__ */ e("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", children: "🌐" }),
      p !== "safe" && /* @__PURE__ */ e("span", { className: `meso-tool__risk meso-tool__risk--${p}`, children: ke[p] }),
      (d == null ? void 0 : d.duration_ms) !== void 0 && /* @__PURE__ */ o("span", { className: "meso-tool__duration", children: [
        d.duration_ms,
        "ms"
      ] }),
      _ && /* @__PURE__ */ o(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => i((v) => !v),
          "aria-expanded": s,
          "aria-label": s ? "折叠参数" : "展开参数",
          children: [
            s ? "▾" : "▸",
            " 参数"
          ]
        }
      )
    ] }),
    s && _ && /* @__PURE__ */ e("pre", { className: "meso-tool__args", children: JSON.stringify(h.args, null, 2) }),
    l === "awaiting_confirm" && a && t && /* @__PURE__ */ e(
      be,
      {
        toolCall: h,
        onConfirm: a,
        onCancel: t
      }
    ),
    (l === "done" || l === "error") && d && /* @__PURE__ */ o("div", { className: "meso-tool__result", children: [
      /* @__PURE__ */ o(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => u((v) => !v),
          "aria-expanded": n,
          "aria-label": n ? "折叠结果" : "展开结果",
          children: [
            n ? "▾" : "▸",
            " ",
            l === "error" ? "错误" : "结果"
          ]
        }
      ),
      n && /* @__PURE__ */ e("pre", { className: `meso-tool__output${l === "error" ? " meso-tool__output--error" : ""}`, children: l === "error" ? d.error : d.output })
    ] })
  ] });
}
function we({ status: r }) {
  switch (r) {
    case "pending":
    case "running":
      return /* @__PURE__ */ e("span", { className: "meso-tool__spinner", "aria-label": "执行中" });
    case "awaiting_confirm":
      return /* @__PURE__ */ o("svg", { className: "meso-tool__icon meso-tool__icon--warn", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "等待确认", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M7 4v4M7 10v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
      ] });
    case "done":
      return /* @__PURE__ */ o("svg", { className: "meso-tool__icon meso-tool__icon--done", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "完成", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("polyline", { points: "4,7 6,9.5 10,4.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
      ] });
    case "error":
      return /* @__PURE__ */ o("svg", { className: "meso-tool__icon meso-tool__icon--error", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "失败", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M5 5l4 4M9 5l-4 4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
      ] });
  }
}
function ye({ soul: r, compact: a = !1 }) {
  const t = r.name.charAt(0);
  return /* @__PURE__ */ o(
    "div",
    {
      className: `meso-soul${a ? " meso-soul--compact" : ""}`,
      title: `${r.name} v${r.version}`,
      role: "status",
      "aria-label": `当前 Soul: ${r.name}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-soul__avatar", children: r.avatar ? /* @__PURE__ */ e("img", { src: r.avatar, alt: r.name, className: "meso-soul__img" }) : /* @__PURE__ */ e("span", { className: "meso-soul__initial", children: t }) }),
        !a && /* @__PURE__ */ o(M, { children: [
          /* @__PURE__ */ e("span", { className: "meso-soul__name", children: r.name }),
          r.traits && r.traits.length > 0 && /* @__PURE__ */ e("div", { className: "meso-soul__traits", children: r.traits.map((s) => /* @__PURE__ */ e("span", { className: "meso-soul__trait", children: s }, s)) })
        ] })
      ]
    }
  );
}
const xe = {
  mcp: "MCP",
  api: "API"
};
function Le({ skill: r }) {
  const a = r.provider ? xe[r.provider] : null;
  return /* @__PURE__ */ o(
    "div",
    {
      className: "meso-skill",
      title: r.description ?? r.name,
      role: "status",
      "aria-label": `当前技能: ${r.name}`,
      children: [
        /* @__PURE__ */ e("svg", { className: "meso-skill__icon", width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ e(
          "path",
          {
            d: "M6 1L7.5 4.5H11L8 6.5L9 10L6 8L3 10L4 6.5L1 4.5H4.5L6 1Z",
            stroke: "currentColor",
            strokeWidth: "1.2",
            strokeLinejoin: "round"
          }
        ) }),
        /* @__PURE__ */ e("span", { className: "meso-skill__name", children: r.name }),
        r.focus && r.focus.length > 0 && /* @__PURE__ */ o("span", { className: "meso-skill__focus", children: [
          "· ",
          r.focus.join(", ")
        ] }),
        a && /* @__PURE__ */ e("span", { className: "meso-skill__provider", children: a })
      ]
    }
  );
}
function Ce({ resourceRead: r }) {
  const [a, t] = w(!1), { read: s, content: i, status: n } = r, u = s.name ?? s.uri, h = s.server;
  return /* @__PURE__ */ o("div", { className: `meso-resource meso-resource--${n}`, children: [
    /* @__PURE__ */ o("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ e(Se, { status: n }),
      /* @__PURE__ */ e("span", { className: "meso-resource__uri", title: s.uri, children: u }),
      h && /* @__PURE__ */ e("span", { className: "meso-resource__server", children: h }),
      (i == null ? void 0 : i.duration_ms) !== void 0 && /* @__PURE__ */ o("span", { className: "meso-resource__duration", children: [
        i.duration_ms,
        "ms"
      ] }),
      (n === "done" || n === "error") && i && /* @__PURE__ */ o(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => t((d) => !d),
          "aria-expanded": a,
          "aria-label": a ? "折叠内容" : "展开内容",
          children: [
            a ? "▾" : "▸",
            " ",
            n === "error" ? "错误" : "内容"
          ]
        }
      )
    ] }),
    a && i && /* @__PURE__ */ e("div", { className: "meso-resource__content", children: n === "error" ? /* @__PURE__ */ e("pre", { className: "meso-resource__text meso-resource__text--error", children: i.error }) : i.contents.map((d, l) => /* @__PURE__ */ o("div", { children: [
      d.type === "text" && /* @__PURE__ */ e("pre", { className: "meso-resource__text", children: d.text }),
      d.type === "image" && d.data && /* @__PURE__ */ e(
        "img",
        {
          className: "meso-resource__image",
          src: `data:${d.mime_type ?? "image/png"};base64,${d.data}`,
          alt: "resource"
        }
      ),
      d.type === "blob" && /* @__PURE__ */ o("span", { className: "meso-resource__blob-label", children: [
        "[",
        d.mime_type ?? "binary",
        "]"
      ] })
    ] }, l)) })
  ] });
}
function Se({ status: r }) {
  switch (r) {
    case "pending":
      return /* @__PURE__ */ e("span", { className: "meso-resource__spinner", "aria-label": "读取中" });
    case "done":
      return /* @__PURE__ */ e("svg", { className: "meso-resource__icon meso-resource__icon--done", width: "13", height: "13", viewBox: "0 0 13 13", fill: "none", "aria-label": "完成", children: /* @__PURE__ */ e("path", { d: "M2 7L5 10L11 4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) });
    case "error":
      return /* @__PURE__ */ o("svg", { className: "meso-resource__icon meso-resource__icon--error", width: "13", height: "13", viewBox: "0 0 13 13", fill: "none", "aria-label": "失败", children: [
        /* @__PURE__ */ e("circle", { cx: "6.5", cy: "6.5", r: "5.5", stroke: "currentColor", strokeWidth: "1.2" }),
        /* @__PURE__ */ e("path", { d: "M4.5 4.5l4 4M8.5 4.5l-4 4", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round" })
      ] });
  }
}
function Te(r) {
  return r === "html preview" ? { type: "html" } : r === "mermaid" ? { type: "mermaid" } : r === "markdown" ? { type: "markdown" } : r === "table" ? { type: "table" } : { type: "code", language: r };
}
function Ee({
  messages: r,
  streaming: a,
  onArtifactCopy: t,
  onArtifactDownload: s,
  onToolConfirm: i,
  onToolCancel: n,
  emptyState: u,
  className: h,
  renderExtension: d,
  renderMarkdown: l,
  renderMermaid: p,
  highlightCode: _
}) {
  const k = $(null);
  O(() => {
    var c;
    (c = k.current) == null || c.scrollIntoView({ behavior: "smooth" });
  }, [r, a]);
  const v = r.length > 0 || a && a.status !== "idle";
  return /* @__PURE__ */ e("div", { className: `meso-message-list${h ? ` ${h}` : ""}`, children: /* @__PURE__ */ o("div", { className: "meso-message-list__inner", children: [
    !v && u && /* @__PURE__ */ e("div", { className: "meso-message-list__empty", children: u }),
    r.map((c) => /* @__PURE__ */ e(
      Y,
      {
        role: c.role,
        content: c.content,
        timestamp: c.timestamp,
        markdown: c.role === "assistant",
        renderMarkdown: l
      },
      c.id
    )),
    a && a.status !== "idle" && /* @__PURE__ */ o("div", { className: "meso-message-list__live", children: [
      (a.activeSoul || a.activeSkill) && /* @__PURE__ */ o("div", { className: "meso-message-list__context-row", children: [
        a.activeSoul && /* @__PURE__ */ e(ye, { soul: a.activeSoul }),
        a.activeSkill && /* @__PURE__ */ e(Le, { skill: a.activeSkill })
      ] }),
      a.stages.length > 0 && /* @__PURE__ */ e(
        _e,
        {
          stages: a.stages.map((c) => ({
            id: c.name,
            label: c.name,
            status: c.state === "done" || c.state === "error" ? "done" : "active"
          }))
        }
      ),
      a.memorySnippets.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-chips", children: a.memorySnippets.map((c, f) => /* @__PURE__ */ o("span", { className: "meso-memory-chip", title: c.content, children: [
        "[",
        c.category,
        "] ",
        c.content
      ] }, f)) }),
      a.resourceReadOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__resources", children: a.resourceReadOrder.map((c) => {
        const f = a.resourceReads[c];
        return f ? /* @__PURE__ */ e(Ce, { resourceRead: f }, c) : null;
      }) }),
      a.toolCallOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__tools", children: a.toolCallOrder.map((c) => {
        const f = a.toolCalls[c];
        return f ? /* @__PURE__ */ e(
          ge,
          {
            toolCall: f,
            onConfirm: i,
            onCancel: n
          },
          c
        ) : null;
      }) }),
      d && a.extensionLog.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__extensions", children: a.extensionLog.map((c, f) => /* @__PURE__ */ e(Z.Fragment, { children: d(c) }, f)) }),
      a.thinkContent && /* @__PURE__ */ e(
        ce,
        {
          content: a.thinkContent,
          streaming: !a.thinkDone
        }
      ),
      (a.textContent || a.status === "streaming") && /* @__PURE__ */ e(
        Y,
        {
          role: "assistant",
          content: a.textContent,
          streaming: a.status === "streaming" && a.artifactOrder.length === 0,
          markdown: !0,
          renderMarkdown: l
        }
      ),
      a.artifactOrder.map((c) => {
        const f = a.artifacts[c];
        if (!f) return null;
        const { type: C, language: x } = Te(f.lang);
        return /* @__PURE__ */ e(
          me,
          {
            type: C,
            content: f.content,
            language: x,
            streaming: !f.done,
            onCopy: t,
            onDownload: s,
            renderMermaid: p,
            highlightCode: _,
            renderMarkdown: l
          },
          c
        );
      }),
      a.memorySaved.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-saved", children: a.memorySaved.map((c) => /* @__PURE__ */ o("span", { className: "meso-memory-saved__chip", title: c.preview, children: [
        /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        c.category,
        "]"
      ] }, c.id)) })
    ] }),
    /* @__PURE__ */ e("div", { ref: k })
  ] }) });
}
function je(r, a) {
  const [t, s] = w(V), i = $(null), n = $(a);
  n.current = a;
  const u = T(() => {
    var l;
    (l = i.current) == null || l.abort(), s((p) => ({ ...p, status: "idle" }));
  }, []), h = T(() => {
    var l;
    (l = i.current) == null || l.abort(), s(V());
  }, []), d = T(async (l) => {
    var c, f, C, x, S, L, A, R, B, y, N, g, W, E, j, F;
    (c = i.current) == null || c.abort();
    const p = new AbortController();
    i.current = p;
    const _ = { ...V(), status: "streaming" };
    s(_);
    let k = _;
    const v = (l == null ? void 0 : l.method) ?? (l != null && l.body ? "POST" : "GET");
    try {
      const I = await fetch(r, {
        method: v,
        headers: {
          ...v === "POST" ? { "Content-Type": "application/json" } : {},
          ...l == null ? void 0 : l.headers
        },
        body: l != null && l.body ? JSON.stringify(l.body) : void 0,
        signal: p.signal
      });
      if (!I.ok) throw new Error(`HTTP ${I.status}`);
      const P = I.body.getReader(), H = new TextDecoder();
      let U = "";
      for (; ; ) {
        const { done: ae, value: se } = await P.read();
        if (ae) break;
        U += H.decode(se, { stream: !0 });
        const G = U.split(`
`);
        U = G.pop() ?? "";
        for (const oe of G) {
          const b = te(oe);
          if (!b) continue;
          const D = ne(k, b);
          k = D, s(D);
          const m = n.current;
          if (m)
            switch (b.type) {
              case "capabilities":
                (f = m.onCapabilities) == null || f.call(m, b.payload);
                break;
              case "stage":
                (C = m.onStageChange) == null || C.call(m, b.payload);
                break;
              case "memory":
                (x = m.onMemoryRecalled) == null || x.call(m, b.payload.snippets);
                break;
              case "memory_saved":
                (S = m.onMemorySaved) == null || S.call(m, b.payload);
                break;
              case "soul":
                (L = m.onSoulActivated) == null || L.call(m, b.payload);
                break;
              case "skill_active":
                (A = m.onSkillActivated) == null || A.call(m, b.payload);
                break;
              case "tool_call":
                (R = m.onToolCall) == null || R.call(m, b.payload);
                break;
              case "tool_result":
                (B = m.onToolResult) == null || B.call(m, b.payload);
                break;
              case "resource_read":
                (y = m.onResourceRead) == null || y.call(m, b.payload);
                break;
              case "resource_content":
                (N = m.onResourceContent) == null || N.call(m, b.payload);
                break;
              case "artifact": {
                const J = D.artifacts[b.payload.id];
                J && ((g = m.onArtifact) == null || g.call(m, J));
                break;
              }
              case "error":
                (W = m.onError) == null || W.call(m, b.payload.message, b.payload.code);
                break;
              case "done":
                (E = m.onDone) == null || E.call(m, D);
                break;
            }
          if (b.type === "done" || b.type === "error") return;
        }
      }
    } catch (I) {
      if (I.name === "AbortError") return;
      const P = I.message;
      s((H) => ({ ...H, status: "error", errorMessage: P })), (F = (j = n.current) == null ? void 0 : j.onError) == null || F.call(j, P);
    }
  }, [r]);
  return { state: t, start: d, abort: u, reset: h };
}
const re = "meso-theme";
function Oe() {
  return typeof window > "u" ? "light" : localStorage.getItem(re) ?? "light";
}
function $e(r) {
  document.documentElement.setAttribute("data-theme", r), localStorage.setItem(re, r);
}
function Pe() {
  const [r, a] = w(Oe);
  O(() => {
    $e(r);
  }, [r]);
  const t = T(() => {
    a((s) => s === "light" ? "dark" : "light");
  }, []);
  return { theme: r, toggle: t };
}
export {
  me as ArtifactPanel,
  Y as ChatBubble,
  be as ConfirmGate,
  Ee as MessageList,
  Ue as PROTOCOL_VERSION,
  Ce as ResourceReadBlock,
  Le as SkillIndicator,
  ye as SoulIndicator,
  _e as StageTimeline,
  Me as StreamingCursor,
  ce as ThinkBlock,
  Be as ThreeColumnLayout,
  ge as ToolCallBlock,
  We as WorkflowTimeline,
  ne as applyEvent,
  V as createInitialStreamState,
  te as parseSSELine,
  je as useSSEStream,
  Pe as useTheme
};
