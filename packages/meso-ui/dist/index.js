import { jsxs as o, jsx as e, Fragment as T } from "react/jsx-runtime";
import ee, { useState as b, useRef as R, useEffect as $, useCallback as P } from "react";
import { createInitialStreamState as D, parseSSELine as de, applyEvent as me } from "./runtime.js";
import { PROTOCOL_VERSION as Ze, assertCompatibleVersion as qe, createStreamStateWithArtifacts as Qe, isCompatibleVersion as Xe, stagePayloadToStage as er, streamStateHasArtifacts as rr } from "./runtime.js";
function Te({
  navItems: r = [],
  sidebarFooter: s,
  sessionColumn: a,
  children: t,
  defaultCollapsed: n = !1,
  appName: l = "Meso",
  sidebarLogo: i,
  sidebarTitle: m,
  mainHeader: d,
  artifactPanel: c,
  defaultArtifactVisible: u = !1,
  onArtifactToggle: _,
  artifactVisible: p,
  showArtifactToggle: N = !0,
  showSessionColumn: w = !0,
  contentMaxWidth: y,
  artifactPanelWidth: k,
  onCollapsedChange: h
}) {
  const [v, C] = b(n), [W, E] = b(u), S = p !== void 0 ? p : W, L = () => {
    const x = !S;
    p === void 0 && E(x), _ == null || _(x);
  };
  return /* @__PURE__ */ o("div", { className: "meso-layout", children: [
    /* @__PURE__ */ o("aside", { className: `meso-sidebar${v ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ o("div", { className: "meso-sidebar__header", children: [
        i ? /* @__PURE__ */ e("div", { className: "meso-sidebar__logo meso-sidebar__logo--custom", children: i }) : /* @__PURE__ */ e("div", { className: "meso-sidebar__logo", children: l[0] }),
        m ? /* @__PURE__ */ e("span", { className: "meso-sidebar__title meso-sidebar__title--brand", children: m }) : /* @__PURE__ */ e("span", { className: "meso-sidebar__title", children: l }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => {
              const x = !v;
              C(x), h == null || h(x);
            },
            "aria-label": v ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ o("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ e("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ e("nav", { className: "meso-sidebar__nav", children: r.map((x) => /* @__PURE__ */ o(
        "div",
        {
          className: `meso-sidebar__nav-item${x.active ? " meso-sidebar__nav-item--active" : ""}`,
          onClick: x.onClick,
          title: x.label,
          children: [
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-icon", children: x.icon }),
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-label", children: x.label })
          ]
        },
        x.id
      )) }),
      s && /* @__PURE__ */ e("div", { className: "meso-sidebar__footer", children: s })
    ] }),
    w !== !1 && /* @__PURE__ */ e("div", { className: "meso-session-col", children: a }),
    /* @__PURE__ */ o("main", { className: "meso-main", children: [
      /* @__PURE__ */ o("div", { className: "meso-main__header", children: [
        /* @__PURE__ */ e("div", { className: "meso-main__header-content", children: d }),
        N !== !1 && /* @__PURE__ */ e(
          "button",
          {
            className: `meso-artifact-toggle${S ? " meso-artifact-toggle--active" : ""}`,
            onClick: L,
            title: S ? "关闭 Artifact" : "打开 Artifact",
            "aria-label": S ? "关闭 Artifact" : "打开 Artifact",
            children: S ? (
              /* X / close icon */
              /* @__PURE__ */ o("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ e("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                /* @__PURE__ */ e("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
              ] })
            ) : (
              /* Panel / artifact icon */
              /* @__PURE__ */ o("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ e("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                /* @__PURE__ */ e("line", { x1: "14", y1: "3", x2: "14", y2: "21" })
              ] })
            )
          }
        )
      ] }),
      /* @__PURE__ */ o("div", { className: "meso-main__content", children: [
        /* @__PURE__ */ e("div", { className: "meso-main__chat", style: y ? { maxWidth: y, margin: "0 auto", width: "100%" } : void 0, children: t }),
        S && /* @__PURE__ */ o(T, { children: [
          /* @__PURE__ */ e("div", { className: "meso-artifact-divider", "aria-hidden": "true" }),
          /* @__PURE__ */ e(
            "div",
            {
              className: "meso-artifact-pane",
              style: k != null ? { width: k, minWidth: k, maxWidth: k } : void 0,
              children: c
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function Q({
  role: r,
  content: s,
  streaming: a = !1,
  timestamp: t,
  markdown: n = !1,
  renderMarkdown: l
}) {
  const i = n && typeof l == "function";
  return /* @__PURE__ */ o("div", { className: `meso-bubble meso-bubble--${r}`, children: [
    r === "assistant" && /* @__PURE__ */ e("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ o("div", { className: "meso-bubble__body", children: [
      i ? /* @__PURE__ */ e(
        "div",
        {
          className: "meso-bubble__content meso-bubble__md",
          dangerouslySetInnerHTML: { __html: l(s) }
        }
      ) : /* @__PURE__ */ o("div", { className: "meso-bubble__content", children: [
        s.split(`
`).map((m, d) => /* @__PURE__ */ o(ee.Fragment, { children: [
          d > 0 && /* @__PURE__ */ e("br", {}),
          m
        ] }, d)),
        a && /* @__PURE__ */ e("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      t && /* @__PURE__ */ e("div", { className: "meso-bubble__timestamp", children: t })
    ] })
  ] });
}
function re({
  content: r,
  streaming: s = !1,
  autoCollapseDelay: a = 1500,
  defaultOpen: t = !0,
  open: n,
  onOpenChange: l,
  collapseWhen: i = "streamEnd",
  summary: m = "已思考"
}) {
  const d = n !== void 0, [c, u] = b(t), [_, p] = b(null), N = R(null);
  N.current = _;
  const w = d ? n : _ !== null ? _ : c, y = R(s), k = () => {
    const v = !w;
    d || p(v), l == null || l(v);
  };
  return $(() => {
    if (i !== "never" && a !== null) {
      if (y.current && !s) {
        const v = setTimeout(() => {
          d || u(!1), N.current === null && (l == null || l(!1));
        }, a);
        return () => clearTimeout(v);
      }
      y.current = s;
    }
  }, [s, a, i, d, l]), /* @__PURE__ */ o("div", { className: `meso-think${w ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ o(
      "button",
      {
        className: "meso-think__header",
        onClick: k,
        "aria-expanded": w,
        children: [
          /* @__PURE__ */ e("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ e("span", { className: "meso-think__label", children: w ? "思考过程" : m }),
          s && /* @__PURE__ */ e("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { className: "meso-think__body", children: /* @__PURE__ */ o("div", { className: "meso-think__content", children: [
      r,
      s && /* @__PURE__ */ e("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function je({ active: r = !0 }) {
  return r ? /* @__PURE__ */ e("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function ue(r) {
  try {
    const s = JSON.parse(r);
    return Array.isArray(s.headers) && Array.isArray(s.rows) ? s : null;
  } catch {
    return null;
  }
}
function he({
  type: r,
  content: s,
  language: a = "plaintext",
  streaming: t = !1,
  onCopy: n,
  onDownload: l,
  renderMermaid: i,
  highlightCode: m,
  renderMarkdown: d
}) {
  const [c, u] = b(!1), [_, p] = b(r), [N, w] = b(null), [y, k] = b(!1), [h, v] = b(null), C = R("");
  $(() => {
    p(r);
  }, [r]), $(() => {
    r !== "mermaid" || t || !i || s === C.current || (C.current = s, w(null), k(!1), i(s).then((L) => w(L)).catch(() => k(!0)));
  }, [r, t, s, i]), $(() => {
    r !== "code" || t || !m || s === C.current && h || (C.current = s, v(m(s, a)));
  }, [r, t, s, a, m, h]);
  const W = () => {
    navigator.clipboard.writeText(s).catch(() => {
    }), u(!0), setTimeout(() => u(!1), 2e3), n == null || n(s);
  }, E = () => {
    if (l) {
      l(s);
      return;
    }
    const L = {
      html: "html",
      mermaid: "md",
      markdown: "md",
      table: "json",
      code: a || "txt"
    }, x = new Blob([s], { type: "text/plain" }), A = document.createElement("a");
    A.href = URL.createObjectURL(x), A.download = `artifact.${L[r]}`, A.click(), URL.revokeObjectURL(A.href);
  };
  return /* @__PURE__ */ o("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ o("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ e("div", { className: "meso-artifact__tabs", children: (r === "html" ? ["html", "code"] : [r]).map((L) => /* @__PURE__ */ e(
        "span",
        {
          className: `meso-artifact__tab${_ === L ? " meso-artifact__tab--active" : ""}`,
          onClick: () => p(L),
          children: fe(L, a)
        },
        L
      )) }),
      t && /* @__PURE__ */ e("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ e("button", { className: "meso-artifact__download-btn", onClick: E, title: "下载", "aria-label": "下载文件", children: /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) }) }),
      /* @__PURE__ */ e("button", { className: "meso-artifact__copy-btn", onClick: W, title: "复制", "aria-label": "复制代码", children: c ? /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ o("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ e("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
      ] }) })
    ] }),
    /* @__PURE__ */ o("div", { className: "meso-artifact__body", children: [
      _ === "html" && /* @__PURE__ */ e("iframe", { className: "meso-artifact__preview", srcDoc: s, sandbox: "allow-scripts", title: "HTML 预览" }),
      _ === "mermaid" && /* @__PURE__ */ o(T, { children: [
        t && /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
          /* @__PURE__ */ e("code", { children: s }),
          /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
        ] }),
        !t && N && /* @__PURE__ */ e(
          "div",
          {
            className: "meso-artifact__mermaid",
            dangerouslySetInnerHTML: { __html: N }
          }
        ),
        !t && !N && !y && !i && /* @__PURE__ */ o("div", { className: "meso-artifact__mermaid-placeholder", children: [
          /* @__PURE__ */ e("span", { children: "图表预览需要集成 Mermaid 渲染器" }),
          /* @__PURE__ */ e("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ e("code", { children: s }) })
        ] }),
        !t && y && /* @__PURE__ */ o("div", { className: "meso-artifact__mermaid-placeholder meso-artifact__mermaid-placeholder--error", children: [
          /* @__PURE__ */ e("span", { children: "图表渲染失败，请检查语法" }),
          /* @__PURE__ */ e("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ e("code", { children: s }) })
        ] }),
        !t && !N && !y && i && /* @__PURE__ */ e("div", { className: "meso-artifact__mermaid-placeholder", children: /* @__PURE__ */ e("span", { children: "渲染中…" }) })
      ] }),
      _ === "markdown" && /* @__PURE__ */ e(T, { children: d ? /* @__PURE__ */ e(
        "div",
        {
          className: "meso-artifact__markdown",
          dangerouslySetInnerHTML: { __html: d(s) }
        }
      ) : /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
        /* @__PURE__ */ e("code", { children: s }),
        t && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] }) }),
      _ === "table" && /* @__PURE__ */ e(_e, { content: s, streaming: t }),
      (_ === "code" || _ === "html" && !1) && /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
        h && !t ? /* @__PURE__ */ e("code", { dangerouslySetInnerHTML: { __html: h } }) : /* @__PURE__ */ e("code", { children: s }),
        t && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] })
    ] })
  ] });
}
function _e({ content: r, streaming: s }) {
  const a = ue(r);
  return a ? /* @__PURE__ */ e("div", { className: "meso-artifact__table-wrap", children: /* @__PURE__ */ o("table", { className: "meso-artifact__table", children: [
    /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: a.headers.map((t, n) => /* @__PURE__ */ e("th", { children: t }, n)) }) }),
    /* @__PURE__ */ e("tbody", { children: a.rows.map((t, n) => /* @__PURE__ */ e("tr", { children: t.map((l, i) => /* @__PURE__ */ e("td", { children: String(l) }, i)) }, n)) })
  ] }) }) : /* @__PURE__ */ o("pre", { className: "meso-artifact__code", children: [
    /* @__PURE__ */ e("code", { children: r }),
    s && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
  ] });
}
function fe(r, s) {
  return r === "html" ? "HTML 预览" : r === "mermaid" ? "图表" : r === "markdown" ? "Markdown" : r === "table" ? "表格" : s || "Code";
}
function se({ stages: r, compact: s = !1 }) {
  return r.length === 0 ? null : /* @__PURE__ */ e("div", { className: `meso-stages${s ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: r.map((a, t) => /* @__PURE__ */ o(
    "div",
    {
      className: `meso-stage meso-stage--${a.status}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-stage__dot", children: a.status === "done" ? /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,5.5 4,8 8.5,2.5" }) }) : a.status === "error" ? /* @__PURE__ */ o("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", children: [
          /* @__PURE__ */ e("line", { x1: "2", y1: "2", x2: "8", y2: "8" }),
          /* @__PURE__ */ e("line", { x1: "8", y1: "2", x2: "2", y2: "8" })
        ] }) : /* @__PURE__ */ e("span", { className: "meso-stage__dot-inner" }) }),
        t < r.length - 1 && /* @__PURE__ */ e("div", { className: `meso-stage__line${a.status === "done" ? " meso-stage__line--done" : ""}` }),
        /* @__PURE__ */ e("span", { className: `meso-stage__label${s ? " meso-stage__label--compact" : ""}`, children: a.label })
      ]
    },
    a.id
  )) });
}
function pe(r) {
  const { nodes: s, nodeOrder: a } = r, t = /* @__PURE__ */ new Map();
  for (const m of a) {
    const d = s[m];
    if (!d) continue;
    const c = d.parent_id ?? null;
    t.has(c) || t.set(c, []), t.get(c).push(m);
  }
  const n = /* @__PURE__ */ new Map();
  for (const [, m] of t)
    if (m.length > 1)
      for (const d of m) n.set(d, m);
  const l = [], i = /* @__PURE__ */ new Set();
  for (const m of a) {
    if (i.has(m)) continue;
    const d = s[m];
    if (!d) continue;
    const c = n.get(m);
    if (c) {
      const u = c.map((_) => s[_]).filter((_) => !!_);
      for (const _ of u) i.add(_.node_id);
      l.push({ kind: "parallel", nodes: u, isLast: !1 });
    } else
      i.add(m), l.push({ kind: "node", node: d, isLast: !1 });
  }
  return l.length > 0 && (l[l.length - 1] = { ...l[l.length - 1], isLast: !0 }), l;
}
function oe({ state: r }) {
  return r === "done" ? /* @__PURE__ */ e("svg", { className: "meso-wf-node__icon meso-wf-node__icon--done", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,6.5 4.5,9.5 10.5,3" }) }) : r === "error" ? /* @__PURE__ */ o("svg", { className: "meso-wf-node__icon meso-wf-node__icon--error", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ e("line", { x1: "2", y1: "2", x2: "10", y2: "10" }),
    /* @__PURE__ */ e("line", { x1: "10", y1: "2", x2: "2", y2: "10" })
  ] }) : r === "skipped" ? /* @__PURE__ */ e("svg", { className: "meso-wf-node__icon meso-wf-node__icon--skipped", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ e("line", { x1: "2", y1: "6", x2: "10", y2: "6" }) }) : /* @__PURE__ */ e("span", { className: "meso-wf-node__spinner", "aria-hidden": "true" });
}
function te(r) {
  return r < 1e3 ? `${r}ms` : `${(r / 1e3).toFixed(1)}s`;
}
function ve({ node: r, isLast: s }) {
  var l;
  const [a, t] = b(!1), n = r.metadata && Object.keys(r.metadata).length > 0;
  return /* @__PURE__ */ o("div", { className: `meso-wf-node meso-wf-node--${r.state}`, children: [
    /* @__PURE__ */ o("div", { className: "meso-wf-node__track", children: [
      /* @__PURE__ */ e("div", { className: "meso-wf-node__dot", children: /* @__PURE__ */ e(oe, { state: r.state }) }),
      !s && /* @__PURE__ */ e("div", { className: "meso-wf-node__line" })
    ] }),
    /* @__PURE__ */ o("div", { className: "meso-wf-node__body", children: [
      /* @__PURE__ */ o("div", { className: "meso-wf-node__header", children: [
        /* @__PURE__ */ e("code", { className: "meso-wf-node__name", children: r.name }),
        r.duration_ms !== void 0 && /* @__PURE__ */ e("span", { className: "meso-wf-node__duration", children: te(r.duration_ms) }),
        n && /* @__PURE__ */ e(
          "button",
          {
            className: "meso-wf-node__expand",
            onClick: () => t((i) => !i),
            "aria-expanded": a,
            "aria-label": a ? "收起详情" : "展开详情",
            children: /* @__PURE__ */ e("svg", { viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", style: { transform: a ? "rotate(180deg)" : void 0 }, children: /* @__PURE__ */ e("polyline", { points: "2,3.5 5,6.5 8,3.5" }) })
          }
        )
      ] }),
      r.state === "error" && !!((l = r.metadata) != null && l.error) && /* @__PURE__ */ e("div", { className: "meso-wf-node__error", children: String(r.metadata.error) }),
      a && n && /* @__PURE__ */ e("pre", { className: "meso-wf-node__meta", children: JSON.stringify(r.metadata, null, 2) })
    ] })
  ] });
}
function ke({ nodes: r, isLast: s }) {
  return /* @__PURE__ */ o("div", { className: "meso-wf-parallel", children: [
    /* @__PURE__ */ e("div", { className: "meso-wf-parallel__row", children: r.map((a, t) => {
      var n;
      return /* @__PURE__ */ o("div", { className: `meso-wf-parallel__branch meso-wf-parallel__branch--${a.state}`, children: [
        /* @__PURE__ */ e("div", { className: "meso-wf-parallel__branch-dot", children: /* @__PURE__ */ e(oe, { state: a.state }) }),
        /* @__PURE__ */ o("div", { className: "meso-wf-parallel__branch-body", children: [
          /* @__PURE__ */ o("div", { className: "meso-wf-parallel__branch-label", children: [
            "并行分支 ",
            String.fromCharCode(65 + t)
          ] }),
          /* @__PURE__ */ e("code", { className: "meso-wf-node__name", children: a.name }),
          a.state === "error" && !!((n = a.metadata) != null && n.error) && /* @__PURE__ */ e("div", { className: "meso-wf-node__error", children: String(a.metadata.error) }),
          a.duration_ms !== void 0 && /* @__PURE__ */ e("span", { className: "meso-wf-node__duration", style: { display: "block", marginTop: 2 }, children: te(a.duration_ms) })
        ] })
      ] }, a.node_id);
    }) }),
    !s && /* @__PURE__ */ e("div", { className: "meso-wf-parallel__merge" })
  ] });
}
function Ne({ runs: r, showRunId: s = !0, hidden: a }) {
  if (r.length === 0 || a) return null;
  const t = r.length > 1;
  return /* @__PURE__ */ e("div", { className: "meso-wf", role: "status", "aria-label": "工作流进度", children: r.map((n) => {
    const l = pe(n);
    return /* @__PURE__ */ o("div", { className: "meso-wf-run", children: [
      t && s && /* @__PURE__ */ e("div", { className: "meso-wf-run__label", children: n.run_id }),
      l.map(
        (i, m) => i.kind === "parallel" ? /* @__PURE__ */ e(ke, { nodes: i.nodes, isLast: i.isLast }, `parallel-${m}`) : /* @__PURE__ */ e(ve, { node: i.node, isLast: i.isLast }, i.node.node_id)
      )
    ] }, n.run_id);
  }) });
}
const we = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function ge({ toolCall: r, onConfirm: s, onCancel: a }) {
  const t = r.risk ?? "safe", n = we[t], l = Object.keys(r.args).length > 0;
  return /* @__PURE__ */ o("div", { className: `meso-confirm-gate meso-confirm-gate--${t}`, role: "alertdialog", "aria-label": "工具执行确认", children: [
    /* @__PURE__ */ e("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ o("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ e("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ e("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ o("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ o("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ e("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${t}`, children: n.label }),
        /* @__PURE__ */ e("code", { className: "meso-confirm-gate__tool-name", children: r.name })
      ] }),
      l && /* @__PURE__ */ e("pre", { className: "meso-confirm-gate__args", children: JSON.stringify(r.args, null, 2) }),
      /* @__PURE__ */ o("div", { className: "meso-confirm-gate__actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-confirm-gate__btn meso-confirm-gate__btn--cancel",
            onClick: () => a(r.id),
            children: "取消"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            className: `meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${t}`,
            onClick: () => s(r.id),
            children: n.confirmText
          }
        )
      ] })
    ] })
  ] });
}
const be = {
  safe: "只读",
  write: "写入",
  destructive: "危险"
}, X = {
  mcp: "MCP",
  api: "API",
  local: "本地"
};
function ae({ toolCall: r, onConfirm: s, onCancel: a }) {
  var p;
  const [t, n] = b(!1), [l, i] = b(!1), { call: m, result: d, status: c } = r, u = m.risk ?? "safe", _ = Object.keys(m.args).length > 0;
  return /* @__PURE__ */ o("div", { className: `meso-tool meso-tool--${c} meso-tool--risk-${u}`, children: [
    /* @__PURE__ */ o("div", { className: "meso-tool__header", children: [
      /* @__PURE__ */ e(ye, { status: c }),
      /* @__PURE__ */ e("span", { className: "meso-tool__name", children: m.name }),
      m.provider && X[m.provider] && /* @__PURE__ */ e("span", { className: `meso-tool__provider meso-tool__provider--${m.provider}`, children: X[m.provider] }),
      ((p = m.annotations) == null ? void 0 : p.open_world) && /* @__PURE__ */ e("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", children: "🌐" }),
      u !== "safe" && /* @__PURE__ */ e("span", { className: `meso-tool__risk meso-tool__risk--${u}`, children: be[u] }),
      (d == null ? void 0 : d.duration_ms) !== void 0 && /* @__PURE__ */ o("span", { className: "meso-tool__duration", children: [
        d.duration_ms,
        "ms"
      ] }),
      _ && /* @__PURE__ */ o(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => n((N) => !N),
          "aria-expanded": t,
          "aria-label": t ? "折叠参数" : "展开参数",
          children: [
            t ? "▾" : "▸",
            " 参数"
          ]
        }
      )
    ] }),
    t && _ && /* @__PURE__ */ e("pre", { className: "meso-tool__args", children: JSON.stringify(m.args, null, 2) }),
    c === "awaiting_confirm" && s && a && /* @__PURE__ */ e(
      ge,
      {
        toolCall: m,
        onConfirm: s,
        onCancel: a
      }
    ),
    (c === "done" || c === "error") && d && /* @__PURE__ */ o("div", { className: "meso-tool__result", children: [
      /* @__PURE__ */ o(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => i((N) => !N),
          "aria-expanded": l,
          "aria-label": l ? "折叠结果" : "展开结果",
          children: [
            l ? "▾" : "▸",
            " ",
            c === "error" ? "错误" : "结果"
          ]
        }
      ),
      l && /* @__PURE__ */ e("pre", { className: `meso-tool__output${c === "error" ? " meso-tool__output--error" : ""}`, children: c === "error" ? d.error : d.output })
    ] })
  ] });
}
function ye({ status: r }) {
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
function xe({ soul: r, compact: s = !1 }) {
  const a = r.name.charAt(0);
  return /* @__PURE__ */ o(
    "div",
    {
      className: `meso-soul${s ? " meso-soul--compact" : ""}`,
      title: `${r.name} v${r.version}`,
      role: "status",
      "aria-label": `当前 Soul: ${r.name}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-soul__avatar", children: r.avatar ? /* @__PURE__ */ e("img", { src: r.avatar, alt: r.name, className: "meso-soul__img" }) : /* @__PURE__ */ e("span", { className: "meso-soul__initial", children: a }) }),
        !s && /* @__PURE__ */ o(T, { children: [
          /* @__PURE__ */ e("span", { className: "meso-soul__name", children: r.name }),
          r.traits && r.traits.length > 0 && /* @__PURE__ */ e("div", { className: "meso-soul__traits", children: r.traits.map((t) => /* @__PURE__ */ e("span", { className: "meso-soul__trait", children: t }, t)) })
        ] })
      ]
    }
  );
}
const Le = {
  mcp: "MCP",
  api: "API"
};
function Ce({ skill: r }) {
  const s = r.provider ? Le[r.provider] : null;
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
        s && /* @__PURE__ */ e("span", { className: "meso-skill__provider", children: s })
      ]
    }
  );
}
function Se({ resourceRead: r }) {
  const [s, a] = b(!1), { read: t, content: n, status: l } = r, i = t.name ?? t.uri, m = t.server;
  return /* @__PURE__ */ o("div", { className: `meso-resource meso-resource--${l}`, children: [
    /* @__PURE__ */ o("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ e($e, { status: l }),
      /* @__PURE__ */ e("span", { className: "meso-resource__uri", title: t.uri, children: i }),
      m && /* @__PURE__ */ e("span", { className: "meso-resource__server", children: m }),
      (n == null ? void 0 : n.duration_ms) !== void 0 && /* @__PURE__ */ o("span", { className: "meso-resource__duration", children: [
        n.duration_ms,
        "ms"
      ] }),
      (l === "done" || l === "error") && n && /* @__PURE__ */ o(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => a((d) => !d),
          "aria-expanded": s,
          "aria-label": s ? "折叠内容" : "展开内容",
          children: [
            s ? "▾" : "▸",
            " ",
            l === "error" ? "错误" : "内容"
          ]
        }
      )
    ] }),
    s && n && /* @__PURE__ */ e("div", { className: "meso-resource__content", children: l === "error" ? /* @__PURE__ */ e("pre", { className: "meso-resource__text meso-resource__text--error", children: n.error }) : n.contents.map((d, c) => /* @__PURE__ */ o("div", { children: [
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
    ] }, c)) })
  ] });
}
function $e({ status: r }) {
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
function Re(r) {
  return r === "html preview" ? { type: "html" } : r === "mermaid" ? { type: "mermaid" } : r === "markdown" ? { type: "markdown" } : r === "table" ? { type: "table" } : { type: "code", language: r };
}
function He({
  messages: r,
  streaming: s,
  onArtifactCopy: a,
  onArtifactDownload: t,
  onToolConfirm: n,
  onToolCancel: l,
  emptyState: i,
  emptyStateAlign: m = "center",
  className: d,
  renderExtension: c,
  renderLiveTrace: u,
  renderMarkdown: _,
  renderMermaid: p,
  highlightCode: N,
  hiddenArtifactLangs: w
}) {
  const y = R(null);
  $(() => {
    var h;
    (h = y.current) == null || h.scrollIntoView({ behavior: "smooth" });
  }, [r, s]);
  const k = r.length > 0 || s && s.status !== "idle";
  return /* @__PURE__ */ e("div", { className: `meso-message-list${d ? ` ${d}` : ""}`, children: /* @__PURE__ */ o("div", { className: "meso-message-list__inner", children: [
    !k && i && /* @__PURE__ */ e("div", { className: `meso-message-list__empty${m === "top" ? " meso-message-list__empty--top" : ""}`, children: i }),
    r.map((h) => /* @__PURE__ */ e(
      Q,
      {
        role: h.role,
        content: h.content,
        timestamp: h.timestamp,
        markdown: h.role === "assistant",
        renderMarkdown: _
      },
      h.id
    )),
    s && s.status !== "idle" && /* @__PURE__ */ e("div", { className: "meso-message-list__live", children: u ? u(s) : /* @__PURE__ */ o(T, { children: [
      (s.activeSoul || s.activeSkill) && /* @__PURE__ */ o("div", { className: "meso-message-list__context-row", children: [
        s.activeSoul && /* @__PURE__ */ e(xe, { soul: s.activeSoul }),
        s.activeSkill && /* @__PURE__ */ e(Ce, { skill: s.activeSkill })
      ] }),
      s.stages.length > 0 && /* @__PURE__ */ e(
        se,
        {
          stages: s.stages.map((h) => ({
            id: h.name,
            label: h.name,
            status: h.state === "done" || h.state === "error" ? "done" : "active"
          }))
        }
      ),
      s.memorySnippets.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-chips", children: s.memorySnippets.map((h, v) => /* @__PURE__ */ o("span", { className: "meso-memory-chip", title: h.content, children: [
        "[",
        h.category,
        "] ",
        h.content
      ] }, v)) }),
      s.resourceReadOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__resources", children: s.resourceReadOrder.map((h) => {
        const v = s.resourceReads[h];
        return v ? /* @__PURE__ */ e(Se, { resourceRead: v }, h) : null;
      }) }),
      s.toolCallOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__tools", children: s.toolCallOrder.map((h) => {
        const v = s.toolCalls[h];
        return v ? /* @__PURE__ */ e(
          ae,
          {
            toolCall: v,
            onConfirm: n,
            onCancel: l
          },
          h
        ) : null;
      }) }),
      c && s.extensionLog.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__extensions", children: s.extensionLog.map((h, v) => /* @__PURE__ */ e(ee.Fragment, { children: c(h) }, v)) }),
      s.thinkContent && /* @__PURE__ */ e(
        re,
        {
          content: s.thinkContent,
          streaming: !s.thinkDone
        }
      ),
      (s.textContent || s.status === "streaming") && /* @__PURE__ */ e(
        Q,
        {
          role: "assistant",
          content: s.textContent,
          streaming: s.status === "streaming" && s.artifactOrder.length === 0,
          markdown: !0,
          renderMarkdown: _
        }
      ),
      s.artifactOrder.map((h) => {
        const v = s.artifacts[h];
        if (!v || w != null && w.includes(v.lang)) return null;
        const { type: C, language: W } = Re(v.lang);
        return /* @__PURE__ */ e(
          he,
          {
            type: C,
            content: v.content,
            language: W,
            streaming: !v.done,
            onCopy: a,
            onDownload: t,
            renderMermaid: p,
            highlightCode: N,
            renderMarkdown: _
          },
          h
        );
      }),
      s.memorySaved.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-saved", children: s.memorySaved.map((h) => /* @__PURE__ */ o("span", { className: "meso-memory-saved__chip", title: h.preview, children: [
        /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        h.category,
        "]"
      ] }, h.id)) })
    ] }) }),
    /* @__PURE__ */ e("div", { ref: y })
  ] }) });
}
function Pe({
  value: r,
  onChange: s,
  onSubmit: a,
  onStop: t,
  streaming: n = !1,
  disabled: l = !1,
  placeholder: i = "输入消息… (Ctrl+Enter 发送，Enter 换行)",
  leadingSlot: m,
  trailingActions: d,
  maxRows: c = 8
}) {
  const u = R(null), _ = 22, p = () => {
    const k = u.current;
    k && (k.style.height = "auto", k.style.height = Math.min(k.scrollHeight, _ * c) + "px");
  };
  $(p, [r]);
  const N = (k) => {
    k.key === "Enter" && (k.ctrlKey || k.metaKey) && (k.preventDefault(), !l && !n && r.trim() && a());
  }, w = !l && !n && r.trim().length > 0, y = /* @__PURE__ */ e(
    "button",
    {
      className: `meso-composer__send${n ? " meso-composer__send--stop" : ""}`,
      onClick: n ? t : a,
      disabled: n ? !1 : !w,
      "aria-label": n ? "停止生成" : "发送",
      title: n ? "停止生成" : "Ctrl+Enter",
      children: n ? (
        /* Stop square */
        /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ e("rect", { x: "4", y: "4", width: "16", height: "16", rx: "2" }) })
      ) : (
        /* Send arrow */
        /* @__PURE__ */ o("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ e("line", { x1: "12", y1: "19", x2: "12", y2: "5" }),
          /* @__PURE__ */ e("polyline", { points: "5,12 12,5 19,12" })
        ] })
      )
    }
  );
  return /* @__PURE__ */ e("div", { className: "meso-composer", children: /* @__PURE__ */ o("div", { className: "meso-composer__box", children: [
    /* @__PURE__ */ e(
      "textarea",
      {
        ref: u,
        className: "meso-composer__textarea",
        value: r,
        onChange: (k) => {
          s(k.target.value), p();
        },
        onKeyDown: N,
        placeholder: i,
        rows: 1,
        disabled: l && !n,
        "aria-label": "消息输入框"
      }
    ),
    /* @__PURE__ */ o("div", { className: "meso-composer__toolbar", children: [
      /* @__PURE__ */ e("div", { className: "meso-composer__leading", children: m }),
      /* @__PURE__ */ e("span", { className: "meso-composer__hint", children: r.length > 0 && `${r.length} 字` }),
      /* @__PURE__ */ e("div", { className: "meso-composer__trailing", children: d ?? y })
    ] })
  ] }) });
}
function Oe(r) {
  const s = r.toolCallOrder.length + r.workflowRunOrder.reduce(
    (n, l) => {
      var i;
      return n + (((i = r.workflowRuns[l]) == null ? void 0 : i.nodeOrder.length) ?? 0);
    },
    0
  ), a = r.toolCallOrder.filter((n) => {
    var l;
    return ((l = r.toolCalls[n]) == null ? void 0 : l.status) === "error";
  }).length + r.workflowRunOrder.reduce((n, l) => {
    const i = r.workflowRuns[l];
    return i ? n + i.nodeOrder.filter((m) => {
      var d;
      return ((d = i.nodes[m]) == null ? void 0 : d.state) === "error";
    }).length : n;
  }, 0), t = [];
  return r.stages.length > 0 && t.push(`${r.stages.length} 阶段`), s > 0 && t.push(`${s} 步`), a > 0 && t.push(`${a} 项失败`), t.length > 0 ? t.join(" · ") : "执行过程";
}
function De({
  stream: r,
  streaming: s = !1,
  defaultCollapsed: a = !1,
  onToolConfirm: t,
  onToolCancel: n
}) {
  const [l, i] = b(a);
  if (!(!!r.thinkContent || r.stages.length > 0 || r.toolCallOrder.length > 0 || r.workflowRunOrder.length > 0)) return null;
  const d = Oe(r), c = r.workflowRunOrder.map((u) => r.workflowRuns[u]).filter(Boolean);
  return /* @__PURE__ */ o("div", { className: "meso-process-trace", children: [
    /* @__PURE__ */ o(
      "button",
      {
        className: "meso-process-trace__header",
        onClick: () => i((u) => !u),
        "aria-expanded": !l,
        children: [
          /* @__PURE__ */ e(
            "svg",
            {
              className: `meso-process-trace__chevron${l ? "" : " meso-process-trace__chevron--open"}`,
              width: "14",
              height: "14",
              viewBox: "0 0 14 14",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "1.5",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              children: /* @__PURE__ */ e("polyline", { points: "3,5 7,9 11,5" })
            }
          ),
          /* @__PURE__ */ e("span", { className: "meso-process-trace__summary", children: d }),
          s && /* @__PURE__ */ e("span", { className: "meso-process-trace__dot", "aria-label": "执行中" })
        ]
      }
    ),
    !l && /* @__PURE__ */ o("div", { className: "meso-process-trace__body", children: [
      r.thinkContent && /* @__PURE__ */ e(
        re,
        {
          content: r.thinkContent,
          streaming: s && !r.thinkDone,
          collapseWhen: "never",
          defaultOpen: !0
        }
      ),
      r.stages.length > 0 && /* @__PURE__ */ e(
        se,
        {
          compact: !0,
          stages: r.stages.map((u) => ({
            id: u.name,
            label: u.name,
            status: u.state === "done" || u.state === "error" ? "done" : "active"
          }))
        }
      ),
      r.toolCallOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-process-trace__tools", children: r.toolCallOrder.map((u) => {
        const _ = r.toolCalls[u];
        return _ ? /* @__PURE__ */ e(
          ae,
          {
            toolCall: _,
            onConfirm: t,
            onCancel: n
          },
          u
        ) : null;
      }) }),
      c.length > 0 && /* @__PURE__ */ e(Ne, { runs: c })
    ] })
  ] });
}
function Ue({
  name: r,
  email: s,
  avatarText: a,
  menuItems: t = [],
  onSignOut: n
}) {
  const [l, i] = b(!1), m = R(null);
  $(() => {
    if (!l) return;
    const u = (_) => {
      m.current && !m.current.contains(_.target) && i(!1);
    };
    return document.addEventListener("mousedown", u), () => document.removeEventListener("mousedown", u);
  }, [l]);
  const d = a ?? r.charAt(0).toUpperCase(), c = [
    ...t,
    ...n ? [{ label: "退出登录", onClick: () => {
      i(!1), n();
    }, danger: !0 }] : []
  ];
  return /* @__PURE__ */ o("div", { className: "meso-user-menu", ref: m, children: [
    l && /* @__PURE__ */ o("div", { className: "meso-user-menu__popup", role: "menu", children: [
      /* @__PURE__ */ o("div", { className: "meso-user-menu__identity", children: [
        /* @__PURE__ */ e("span", { className: "meso-user-menu__identity-name", children: r }),
        s && /* @__PURE__ */ e("span", { className: "meso-user-menu__identity-email", children: s })
      ] }),
      c.length > 0 && /* @__PURE__ */ e("div", { className: "meso-user-menu__sep", role: "separator" }),
      c.map((u, _) => /* @__PURE__ */ o(
        "button",
        {
          className: `meso-user-menu__item${u.danger ? " meso-user-menu__item--danger" : ""}`,
          role: "menuitem",
          onClick: () => {
            i(!1), u.onClick();
          },
          children: [
            u.icon && /* @__PURE__ */ e("span", { className: "meso-user-menu__item-icon", children: u.icon }),
            u.label
          ]
        },
        _
      ))
    ] }),
    /* @__PURE__ */ o(
      "button",
      {
        className: "meso-user-menu__trigger",
        onClick: () => i((u) => !u),
        "aria-haspopup": "menu",
        "aria-expanded": l,
        title: r,
        children: [
          /* @__PURE__ */ e("div", { className: "meso-user-menu__avatar", children: d }),
          /* @__PURE__ */ o("div", { className: "meso-user-menu__info", children: [
            /* @__PURE__ */ e("span", { className: "meso-user-menu__name", children: r }),
            s && /* @__PURE__ */ e("span", { className: "meso-user-menu__email", children: s })
          ] })
        ]
      }
    )
  ] });
}
function Ve({
  tabs: r,
  activeTabId: s,
  onTabChange: a,
  autoSelectFirstReady: t = !1
}) {
  var _;
  const n = s !== void 0, [l, i] = b(((_ = r[0]) == null ? void 0 : _.id) ?? ""), m = n ? s : l, d = R(!1);
  $(() => {
    if (!t || d.current) return;
    const p = r.find((N) => N.ready);
    p && (d.current = !0, n || i(p.id), a == null || a(p.id));
  }, [r, t, n, a]);
  const c = (p) => {
    n || i(p), a == null || a(p);
  }, u = r.find((p) => p.id === m) ?? r[0];
  return r.length === 0 ? null : /* @__PURE__ */ o("div", { className: "meso-artifact-shell", children: [
    /* @__PURE__ */ e("div", { className: "meso-artifact-shell__tabs", role: "tablist", children: r.map((p) => /* @__PURE__ */ o(
      "button",
      {
        role: "tab",
        "aria-selected": p.id === m,
        className: `meso-artifact-shell__tab${p.id === m ? " meso-artifact-shell__tab--active" : ""}`,
        onClick: () => c(p.id),
        children: [
          p.label,
          p.ready === !1 && /* @__PURE__ */ e("span", { className: "meso-artifact-shell__tab-dot", "aria-label": "加载中" })
        ]
      },
      p.id
    )) }),
    /* @__PURE__ */ e("div", { className: "meso-artifact-shell__content", role: "tabpanel", children: u == null ? void 0 : u.content })
  ] });
}
const Be = {
  running: "进行中",
  done: "完成",
  error: "失败",
  pending: "等待",
  warning: "警告"
};
function Ke({
  status: r,
  size: s = 16,
  className: a,
  "aria-label": t
}) {
  const n = t ?? Be[r];
  return /* @__PURE__ */ o(
    "span",
    {
      className: `meso-status-icon meso-status-icon--${r}${a ? ` ${a}` : ""}`,
      style: { width: s, height: s },
      role: "img",
      "aria-label": n,
      children: [
        r === "running" && /* @__PURE__ */ o("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeDasharray: "3 3", className: "meso-status-icon__spin" }),
          /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "2.5", fill: "currentColor", className: "meso-status-icon__pulse" })
        ] }),
        r === "done" && /* @__PURE__ */ o("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ e("polyline", { points: "4.5,8 7,10.5 11.5,5.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
        ] }),
        r === "error" && /* @__PURE__ */ o("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ e("line", { x1: "5.5", y1: "5.5", x2: "10.5", y2: "10.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" }),
          /* @__PURE__ */ e("line", { x1: "10.5", y1: "5.5", x2: "5.5", y2: "10.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" })
        ] }),
        r === "pending" && /* @__PURE__ */ e("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "6.25", stroke: "currentColor", strokeWidth: "1.5" }) }),
        r === "warning" && /* @__PURE__ */ o("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ e("line", { x1: "8", y1: "5", x2: "8", y2: "9", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" }),
          /* @__PURE__ */ e("circle", { cx: "8", cy: "11.5", r: "0.75", fill: "white" })
        ] })
      ]
    }
  );
}
function Ge(r, s) {
  const [a, t] = b(D), n = R(null), l = R(s);
  l.current = s;
  const i = P(() => {
    var c;
    (c = n.current) == null || c.abort(), t((u) => ({ ...u, status: "idle" }));
  }, []), m = P(() => {
    var c;
    (c = n.current) == null || c.abort(), t(D());
  }, []), d = P(async (c) => {
    var v, C, W, E, S, L, x, A, U, V, K, G, J, F, Y, j, z;
    (v = n.current) == null || v.abort();
    const u = new AbortController();
    n.current = u;
    const _ = { ...D(), status: "streaming" };
    t(_);
    let p = _;
    const N = (c == null ? void 0 : c.method) ?? (c != null && c.body ? "POST" : "GET"), w = (c == null ? void 0 : c.watchdogMs) === void 0 ? 12e4 : c.watchdogMs;
    let y = null;
    const k = () => {
      y && clearTimeout(y);
    }, h = () => {
      k(), w != null && (y = setTimeout(() => {
        var B, I;
        u.abort();
        const O = `SSE stream timed out after ${w}ms of inactivity`;
        t((M) => ({ ...M, status: "error", errorMessage: O })), (I = (B = l.current) == null ? void 0 : B.onError) == null || I.call(B, O, "WATCHDOG_TIMEOUT");
      }, w));
    };
    try {
      const O = await fetch(r, {
        method: N,
        headers: {
          ...N === "POST" ? { "Content-Type": "application/json" } : {},
          ...c == null ? void 0 : c.headers
        },
        body: c != null && c.body ? JSON.stringify(c.body) : void 0,
        signal: u.signal
      });
      if (!O.ok) throw new Error(`HTTP ${O.status}`);
      const B = O.body.getReader(), I = new TextDecoder();
      let M = "";
      for (h(); ; ) {
        const { done: le, value: ie } = await B.read();
        if (le) break;
        h(), M += I.decode(ie, { stream: !0 });
        const Z = M.split(`
`);
        M = Z.pop() ?? "";
        for (const ce of Z) {
          const g = de(ce);
          if (!g) continue;
          const H = me(p, g);
          p = H, t(H);
          const f = l.current;
          if (f)
            switch (g.type) {
              case "capabilities":
                (C = f.onCapabilities) == null || C.call(f, g.payload);
                break;
              case "stage":
                (W = f.onStageChange) == null || W.call(f, g.payload);
                break;
              case "memory":
                (E = f.onMemoryRecalled) == null || E.call(f, g.payload.snippets);
                break;
              case "memory_saved":
                (S = f.onMemorySaved) == null || S.call(f, g.payload);
                break;
              case "soul":
                (L = f.onSoulActivated) == null || L.call(f, g.payload);
                break;
              case "skill_active":
                (x = f.onSkillActivated) == null || x.call(f, g.payload);
                break;
              case "tool_call":
                (A = f.onToolCall) == null || A.call(f, g.payload);
                break;
              case "tool_result":
                (U = f.onToolResult) == null || U.call(f, g.payload);
                break;
              case "resource_read":
                (V = f.onResourceRead) == null || V.call(f, g.payload);
                break;
              case "resource_content":
                (K = f.onResourceContent) == null || K.call(f, g.payload);
                break;
              case "artifact": {
                const q = H.artifacts[g.payload.id];
                q && ((G = f.onArtifact) == null || G.call(f, q));
                break;
              }
              case "extension":
                (J = f.onExtensionEvent) == null || J.call(f, g);
                break;
              case "error":
                (F = f.onError) == null || F.call(f, g.payload.message, g.payload.code);
                break;
              case "done":
                (Y = f.onDone) == null || Y.call(f, H);
                break;
            }
          if (g.type === "done" || g.type === "error") {
            k();
            return;
          }
        }
      }
    } catch (O) {
      if (O.name === "AbortError") return;
      const B = O.message;
      t((I) => ({ ...I, status: "error", errorMessage: B })), (z = (j = l.current) == null ? void 0 : j.onError) == null || z.call(j, B);
    } finally {
      k();
    }
  }, [r]);
  return { state: a, start: d, abort: i, reset: m };
}
const ne = "meso-theme";
function We() {
  return typeof window > "u" ? "light" : localStorage.getItem(ne) ?? "light";
}
function Ae(r) {
  document.documentElement.setAttribute("data-theme", r), localStorage.setItem(ne, r);
}
function Je() {
  const [r, s] = b(We);
  $(() => {
    Ae(r);
  }, [r]);
  const a = P(() => {
    s((t) => t === "light" ? "dark" : "light");
  }, []);
  return { theme: r, toggle: a };
}
function Fe({
  system: r,
  resetOnTurnStart: s = !1
}) {
  const [a, t] = b(null), n = R(r);
  return $(() => {
    s && !n.current && r && t(null), n.current = r;
  }, [r, s]), {
    open: a !== null ? a : r,
    setOpen: (i) => t(i),
    toggle: () => t((i) => i !== null ? !i : !r),
    clearIntent: () => t(null),
    hasUserIntent: a !== null
  };
}
export {
  Ve as ArtifactPaneShell,
  he as ArtifactPanel,
  Q as ChatBubble,
  Pe as ChatComposer,
  ge as ConfirmGate,
  He as MessageList,
  Ze as PROTOCOL_VERSION,
  De as ProcessTrace,
  Se as ResourceReadBlock,
  Ue as SidebarUserMenu,
  Ce as SkillIndicator,
  xe as SoulIndicator,
  se as StageTimeline,
  Ke as StatusIcon,
  je as StreamingCursor,
  re as ThinkBlock,
  Te as ThreeColumnLayout,
  ae as ToolCallBlock,
  Ne as WorkflowTimeline,
  me as applyEvent,
  qe as assertCompatibleVersion,
  D as createInitialStreamState,
  Qe as createStreamStateWithArtifacts,
  Xe as isCompatibleVersion,
  de as parseSSELine,
  er as stagePayloadToStage,
  rr as streamStateHasArtifacts,
  Fe as useFoldState,
  Ge as useSSEStream,
  Je as useTheme
};
