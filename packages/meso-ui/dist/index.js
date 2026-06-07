import { jsxs as a, jsx as e, Fragment as M } from "react/jsx-runtime";
import Z, { useState as y, useRef as O, useEffect as $, useCallback as j } from "react";
import { createInitialStreamState as D, parseSSELine as ne, applyEvent as le } from "./runtime.js";
import { PROTOCOL_VERSION as Ke, assertCompatibleVersion as Ue, createStreamStateWithArtifacts as Ge, isCompatibleVersion as Je, stagePayloadToStage as ze, streamStateHasArtifacts as Fe } from "./runtime.js";
function Be({
  navItems: r = [],
  sidebarFooter: s,
  sessionColumn: t,
  children: o,
  defaultCollapsed: n = !1,
  appName: l = "Meso",
  sidebarLogo: i,
  sidebarTitle: m,
  mainHeader: c,
  artifactPanel: d,
  defaultArtifactVisible: h = !1,
  onArtifactToggle: u,
  artifactVisible: p,
  showArtifactToggle: k = !0,
  showSessionColumn: x = !0,
  contentMaxWidth: w,
  artifactPanelWidth: v,
  onCollapsedChange: _
}) {
  const [N, C] = y(n), [R, B] = y(h), S = p !== void 0 ? p : R, L = () => {
    const g = !S;
    p === void 0 && B(g), u == null || u(g);
  };
  return /* @__PURE__ */ a("div", { className: "meso-layout", children: [
    /* @__PURE__ */ a("aside", { className: `meso-sidebar${N ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ a("div", { className: "meso-sidebar__header", children: [
        i ? /* @__PURE__ */ e("div", { className: "meso-sidebar__logo meso-sidebar__logo--custom", children: i }) : /* @__PURE__ */ e("div", { className: "meso-sidebar__logo", children: l[0] }),
        m ? /* @__PURE__ */ e("span", { className: "meso-sidebar__title meso-sidebar__title--brand", children: m }) : /* @__PURE__ */ e("span", { className: "meso-sidebar__title", children: l }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => {
              const g = !N;
              C(g), _ == null || _(g);
            },
            "aria-label": N ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ a("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ e("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ e("nav", { className: "meso-sidebar__nav", children: r.map((g) => /* @__PURE__ */ a(
        "div",
        {
          className: `meso-sidebar__nav-item${g.active ? " meso-sidebar__nav-item--active" : ""}`,
          onClick: g.onClick,
          title: g.label,
          children: [
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-icon", children: g.icon }),
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-label", children: g.label })
          ]
        },
        g.id
      )) }),
      s && /* @__PURE__ */ e("div", { className: "meso-sidebar__footer", children: s })
    ] }),
    x !== !1 && /* @__PURE__ */ e("div", { className: "meso-session-col", children: t }),
    /* @__PURE__ */ a("main", { className: "meso-main", children: [
      /* @__PURE__ */ a("div", { className: "meso-main__header", children: [
        /* @__PURE__ */ e("div", { className: "meso-main__header-content", children: c }),
        k !== !1 && /* @__PURE__ */ e(
          "button",
          {
            className: `meso-artifact-toggle${S ? " meso-artifact-toggle--active" : ""}`,
            onClick: L,
            title: S ? "关闭 Artifact" : "打开 Artifact",
            "aria-label": S ? "关闭 Artifact" : "打开 Artifact",
            children: S ? (
              /* X / close icon */
              /* @__PURE__ */ a("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ e("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                /* @__PURE__ */ e("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
              ] })
            ) : (
              /* Panel / artifact icon */
              /* @__PURE__ */ a("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ e("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                /* @__PURE__ */ e("line", { x1: "14", y1: "3", x2: "14", y2: "21" })
              ] })
            )
          }
        )
      ] }),
      /* @__PURE__ */ a("div", { className: "meso-main__content", children: [
        /* @__PURE__ */ e("div", { className: "meso-main__chat", style: w ? { maxWidth: w, margin: "0 auto", width: "100%" } : void 0, children: o }),
        S && /* @__PURE__ */ a(M, { children: [
          /* @__PURE__ */ e("div", { className: "meso-artifact-divider", "aria-hidden": "true" }),
          /* @__PURE__ */ e(
            "div",
            {
              className: "meso-artifact-pane",
              style: v != null ? { width: v, minWidth: v, maxWidth: v } : void 0,
              children: d
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function F({
  role: r,
  content: s,
  streaming: t = !1,
  timestamp: o,
  markdown: n = !1,
  renderMarkdown: l
}) {
  const i = n && typeof l == "function";
  return /* @__PURE__ */ a("div", { className: `meso-bubble meso-bubble--${r}`, children: [
    r === "assistant" && /* @__PURE__ */ e("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ a("div", { className: "meso-bubble__body", children: [
      i ? /* @__PURE__ */ e(
        "div",
        {
          className: "meso-bubble__content meso-bubble__md",
          dangerouslySetInnerHTML: { __html: l(s) }
        }
      ) : /* @__PURE__ */ a("div", { className: "meso-bubble__content", children: [
        s.split(`
`).map((m, c) => /* @__PURE__ */ a(Z.Fragment, { children: [
          c > 0 && /* @__PURE__ */ e("br", {}),
          m
        ] }, c)),
        t && /* @__PURE__ */ e("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      o && /* @__PURE__ */ e("div", { className: "meso-bubble__timestamp", children: o })
    ] })
  ] });
}
function q({
  content: r,
  streaming: s = !1,
  autoCollapseDelay: t = 1500,
  defaultOpen: o = !0,
  open: n,
  onOpenChange: l,
  collapseWhen: i = "streamEnd",
  summary: m = "已思考"
}) {
  const c = n !== void 0, [d, h] = y(o), u = c ? n : d, p = O(s), k = () => {
    const w = !u;
    c || h(w), l == null || l(w);
  };
  return $(() => {
    if (i !== "never" && t !== null) {
      if (p.current && !s) {
        const v = setTimeout(() => {
          c || h(!1), l == null || l(!1);
        }, t);
        return () => clearTimeout(v);
      }
      p.current = s;
    }
  }, [s, t, i, c, l]), /* @__PURE__ */ a("div", { className: `meso-think${u ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ a(
      "button",
      {
        className: "meso-think__header",
        onClick: k,
        "aria-expanded": u,
        children: [
          /* @__PURE__ */ e("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ e("span", { className: "meso-think__label", children: u ? "思考过程" : m }),
          s && /* @__PURE__ */ e("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { className: "meso-think__body", children: /* @__PURE__ */ a("div", { className: "meso-think__content", children: [
      r,
      s && /* @__PURE__ */ e("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function Ee({ active: r = !0 }) {
  return r ? /* @__PURE__ */ e("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function ie(r) {
  try {
    const s = JSON.parse(r);
    return Array.isArray(s.headers) && Array.isArray(s.rows) ? s : null;
  } catch {
    return null;
  }
}
function ce({
  type: r,
  content: s,
  language: t = "plaintext",
  streaming: o = !1,
  onCopy: n,
  onDownload: l,
  renderMermaid: i,
  highlightCode: m,
  renderMarkdown: c
}) {
  const [d, h] = y(!1), [u, p] = y(r), [k, x] = y(null), [w, v] = y(!1), [_, N] = y(null), C = O("");
  $(() => {
    p(r);
  }, [r]), $(() => {
    r !== "mermaid" || o || !i || s === C.current || (C.current = s, x(null), v(!1), i(s).then((L) => x(L)).catch(() => v(!0)));
  }, [r, o, s, i]), $(() => {
    r !== "code" || o || !m || s === C.current && _ || (C.current = s, N(m(s, t)));
  }, [r, o, s, t, m, _]);
  const R = () => {
    navigator.clipboard.writeText(s).catch(() => {
    }), h(!0), setTimeout(() => h(!1), 2e3), n == null || n(s);
  }, B = () => {
    if (l) {
      l(s);
      return;
    }
    const L = {
      html: "html",
      mermaid: "md",
      markdown: "md",
      table: "json",
      code: t || "txt"
    }, g = new Blob([s], { type: "text/plain" }), A = document.createElement("a");
    A.href = URL.createObjectURL(g), A.download = `artifact.${L[r]}`, A.click(), URL.revokeObjectURL(A.href);
  };
  return /* @__PURE__ */ a("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ a("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ e("div", { className: "meso-artifact__tabs", children: (r === "html" ? ["html", "code"] : [r]).map((L) => /* @__PURE__ */ e(
        "span",
        {
          className: `meso-artifact__tab${u === L ? " meso-artifact__tab--active" : ""}`,
          onClick: () => p(L),
          children: me(L, t)
        },
        L
      )) }),
      o && /* @__PURE__ */ e("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ e("button", { className: "meso-artifact__download-btn", onClick: B, title: "下载", "aria-label": "下载文件", children: /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) }) }),
      /* @__PURE__ */ e("button", { className: "meso-artifact__copy-btn", onClick: R, title: "复制", "aria-label": "复制代码", children: d ? /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ a("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ e("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
      ] }) })
    ] }),
    /* @__PURE__ */ a("div", { className: "meso-artifact__body", children: [
      u === "html" && /* @__PURE__ */ e("iframe", { className: "meso-artifact__preview", srcDoc: s, sandbox: "allow-scripts", title: "HTML 预览" }),
      u === "mermaid" && /* @__PURE__ */ a(M, { children: [
        o && /* @__PURE__ */ a("pre", { className: "meso-artifact__code", children: [
          /* @__PURE__ */ e("code", { children: s }),
          /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
        ] }),
        !o && k && /* @__PURE__ */ e(
          "div",
          {
            className: "meso-artifact__mermaid",
            dangerouslySetInnerHTML: { __html: k }
          }
        ),
        !o && !k && !w && !i && /* @__PURE__ */ a("div", { className: "meso-artifact__mermaid-placeholder", children: [
          /* @__PURE__ */ e("span", { children: "图表预览需要集成 Mermaid 渲染器" }),
          /* @__PURE__ */ e("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ e("code", { children: s }) })
        ] }),
        !o && w && /* @__PURE__ */ a("div", { className: "meso-artifact__mermaid-placeholder meso-artifact__mermaid-placeholder--error", children: [
          /* @__PURE__ */ e("span", { children: "图表渲染失败，请检查语法" }),
          /* @__PURE__ */ e("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ e("code", { children: s }) })
        ] }),
        !o && !k && !w && i && /* @__PURE__ */ e("div", { className: "meso-artifact__mermaid-placeholder", children: /* @__PURE__ */ e("span", { children: "渲染中…" }) })
      ] }),
      u === "markdown" && /* @__PURE__ */ e(M, { children: c ? /* @__PURE__ */ e(
        "div",
        {
          className: "meso-artifact__markdown",
          dangerouslySetInnerHTML: { __html: c(s) }
        }
      ) : /* @__PURE__ */ a("pre", { className: "meso-artifact__code", children: [
        /* @__PURE__ */ e("code", { children: s }),
        o && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] }) }),
      u === "table" && /* @__PURE__ */ e(de, { content: s, streaming: o }),
      (u === "code" || u === "html" && !1) && /* @__PURE__ */ a("pre", { className: "meso-artifact__code", children: [
        _ && !o ? /* @__PURE__ */ e("code", { dangerouslySetInnerHTML: { __html: _ } }) : /* @__PURE__ */ e("code", { children: s }),
        o && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] })
    ] })
  ] });
}
function de({ content: r, streaming: s }) {
  const t = ie(r);
  return t ? /* @__PURE__ */ e("div", { className: "meso-artifact__table-wrap", children: /* @__PURE__ */ a("table", { className: "meso-artifact__table", children: [
    /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: t.headers.map((o, n) => /* @__PURE__ */ e("th", { children: o }, n)) }) }),
    /* @__PURE__ */ e("tbody", { children: t.rows.map((o, n) => /* @__PURE__ */ e("tr", { children: o.map((l, i) => /* @__PURE__ */ e("td", { children: String(l) }, i)) }, n)) })
  ] }) }) : /* @__PURE__ */ a("pre", { className: "meso-artifact__code", children: [
    /* @__PURE__ */ e("code", { children: r }),
    s && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
  ] });
}
function me(r, s) {
  return r === "html" ? "HTML 预览" : r === "mermaid" ? "图表" : r === "markdown" ? "Markdown" : r === "table" ? "表格" : s || "Code";
}
function Q({ stages: r, compact: s = !1 }) {
  return r.length === 0 ? null : /* @__PURE__ */ e("div", { className: `meso-stages${s ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: r.map((t, o) => /* @__PURE__ */ a(
    "div",
    {
      className: `meso-stage meso-stage--${t.status}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-stage__dot", children: t.status === "done" ? /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,5.5 4,8 8.5,2.5" }) }) : t.status === "error" ? /* @__PURE__ */ a("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", children: [
          /* @__PURE__ */ e("line", { x1: "2", y1: "2", x2: "8", y2: "8" }),
          /* @__PURE__ */ e("line", { x1: "8", y1: "2", x2: "2", y2: "8" })
        ] }) : /* @__PURE__ */ e("span", { className: "meso-stage__dot-inner" }) }),
        o < r.length - 1 && /* @__PURE__ */ e("div", { className: `meso-stage__line${t.status === "done" ? " meso-stage__line--done" : ""}` }),
        /* @__PURE__ */ e("span", { className: `meso-stage__label${s ? " meso-stage__label--compact" : ""}`, children: t.label })
      ]
    },
    t.id
  )) });
}
function he(r) {
  const { nodes: s, nodeOrder: t } = r, o = /* @__PURE__ */ new Map();
  for (const m of t) {
    const c = s[m];
    if (!c) continue;
    const d = c.parent_id ?? null;
    o.has(d) || o.set(d, []), o.get(d).push(m);
  }
  const n = /* @__PURE__ */ new Map();
  for (const [, m] of o)
    if (m.length > 1)
      for (const c of m) n.set(c, m);
  const l = [], i = /* @__PURE__ */ new Set();
  for (const m of t) {
    if (i.has(m)) continue;
    const c = s[m];
    if (!c) continue;
    const d = n.get(m);
    if (d) {
      const h = d.map((u) => s[u]).filter((u) => !!u);
      for (const u of h) i.add(u.node_id);
      l.push({ kind: "parallel", nodes: h, isLast: !1 });
    } else
      i.add(m), l.push({ kind: "node", node: c, isLast: !1 });
  }
  return l.length > 0 && (l[l.length - 1] = { ...l[l.length - 1], isLast: !0 }), l;
}
function X({ state: r }) {
  return r === "done" ? /* @__PURE__ */ e("svg", { className: "meso-wf-node__icon meso-wf-node__icon--done", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,6.5 4.5,9.5 10.5,3" }) }) : r === "error" ? /* @__PURE__ */ a("svg", { className: "meso-wf-node__icon meso-wf-node__icon--error", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ e("line", { x1: "2", y1: "2", x2: "10", y2: "10" }),
    /* @__PURE__ */ e("line", { x1: "10", y1: "2", x2: "2", y2: "10" })
  ] }) : r === "skipped" ? /* @__PURE__ */ e("svg", { className: "meso-wf-node__icon meso-wf-node__icon--skipped", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ e("line", { x1: "2", y1: "6", x2: "10", y2: "6" }) }) : /* @__PURE__ */ e("span", { className: "meso-wf-node__spinner", "aria-hidden": "true" });
}
function ee(r) {
  return r < 1e3 ? `${r}ms` : `${(r / 1e3).toFixed(1)}s`;
}
function ue({ node: r, isLast: s }) {
  var l;
  const [t, o] = y(!1), n = r.metadata && Object.keys(r.metadata).length > 0;
  return /* @__PURE__ */ a("div", { className: `meso-wf-node meso-wf-node--${r.state}`, children: [
    /* @__PURE__ */ a("div", { className: "meso-wf-node__track", children: [
      /* @__PURE__ */ e("div", { className: "meso-wf-node__dot", children: /* @__PURE__ */ e(X, { state: r.state }) }),
      !s && /* @__PURE__ */ e("div", { className: "meso-wf-node__line" })
    ] }),
    /* @__PURE__ */ a("div", { className: "meso-wf-node__body", children: [
      /* @__PURE__ */ a("div", { className: "meso-wf-node__header", children: [
        /* @__PURE__ */ e("code", { className: "meso-wf-node__name", children: r.name }),
        r.duration_ms !== void 0 && /* @__PURE__ */ e("span", { className: "meso-wf-node__duration", children: ee(r.duration_ms) }),
        n && /* @__PURE__ */ e(
          "button",
          {
            className: "meso-wf-node__expand",
            onClick: () => o((i) => !i),
            "aria-expanded": t,
            "aria-label": t ? "收起详情" : "展开详情",
            children: /* @__PURE__ */ e("svg", { viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", style: { transform: t ? "rotate(180deg)" : void 0 }, children: /* @__PURE__ */ e("polyline", { points: "2,3.5 5,6.5 8,3.5" }) })
          }
        )
      ] }),
      r.state === "error" && !!((l = r.metadata) != null && l.error) && /* @__PURE__ */ e("div", { className: "meso-wf-node__error", children: String(r.metadata.error) }),
      t && n && /* @__PURE__ */ e("pre", { className: "meso-wf-node__meta", children: JSON.stringify(r.metadata, null, 2) })
    ] })
  ] });
}
function _e({ nodes: r, isLast: s }) {
  return /* @__PURE__ */ a("div", { className: "meso-wf-parallel", children: [
    /* @__PURE__ */ e("div", { className: "meso-wf-parallel__row", children: r.map((t, o) => {
      var n;
      return /* @__PURE__ */ a("div", { className: `meso-wf-parallel__branch meso-wf-parallel__branch--${t.state}`, children: [
        /* @__PURE__ */ e("div", { className: "meso-wf-parallel__branch-dot", children: /* @__PURE__ */ e(X, { state: t.state }) }),
        /* @__PURE__ */ a("div", { className: "meso-wf-parallel__branch-body", children: [
          /* @__PURE__ */ a("div", { className: "meso-wf-parallel__branch-label", children: [
            "并行分支 ",
            String.fromCharCode(65 + o)
          ] }),
          /* @__PURE__ */ e("code", { className: "meso-wf-node__name", children: t.name }),
          t.state === "error" && !!((n = t.metadata) != null && n.error) && /* @__PURE__ */ e("div", { className: "meso-wf-node__error", children: String(t.metadata.error) }),
          t.duration_ms !== void 0 && /* @__PURE__ */ e("span", { className: "meso-wf-node__duration", style: { display: "block", marginTop: 2 }, children: ee(t.duration_ms) })
        ] })
      ] }, t.node_id);
    }) }),
    !s && /* @__PURE__ */ e("div", { className: "meso-wf-parallel__merge" })
  ] });
}
function fe({ runs: r, showRunId: s = !0, hidden: t }) {
  if (r.length === 0 || t) return null;
  const o = r.length > 1;
  return /* @__PURE__ */ e("div", { className: "meso-wf", role: "status", "aria-label": "工作流进度", children: r.map((n) => {
    const l = he(n);
    return /* @__PURE__ */ a("div", { className: "meso-wf-run", children: [
      o && s && /* @__PURE__ */ e("div", { className: "meso-wf-run__label", children: n.run_id }),
      l.map(
        (i, m) => i.kind === "parallel" ? /* @__PURE__ */ e(_e, { nodes: i.nodes, isLast: i.isLast }, `parallel-${m}`) : /* @__PURE__ */ e(ue, { node: i.node, isLast: i.isLast }, i.node.node_id)
      )
    ] }, n.run_id);
  }) });
}
const pe = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function ve({ toolCall: r, onConfirm: s, onCancel: t }) {
  const o = r.risk ?? "safe", n = pe[o], l = Object.keys(r.args).length > 0;
  return /* @__PURE__ */ a("div", { className: `meso-confirm-gate meso-confirm-gate--${o}`, role: "alertdialog", "aria-label": "工具执行确认", children: [
    /* @__PURE__ */ e("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ a("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ e("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ e("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ a("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ a("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ e("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${o}`, children: n.label }),
        /* @__PURE__ */ e("code", { className: "meso-confirm-gate__tool-name", children: r.name })
      ] }),
      l && /* @__PURE__ */ e("pre", { className: "meso-confirm-gate__args", children: JSON.stringify(r.args, null, 2) }),
      /* @__PURE__ */ a("div", { className: "meso-confirm-gate__actions", children: [
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
            className: `meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${o}`,
            onClick: () => s(r.id),
            children: n.confirmText
          }
        )
      ] })
    ] })
  ] });
}
const Ne = {
  safe: "只读",
  write: "写入",
  destructive: "危险"
}, Y = {
  mcp: "MCP",
  api: "API",
  local: "本地"
};
function re({ toolCall: r, onConfirm: s, onCancel: t }) {
  var p;
  const [o, n] = y(!1), [l, i] = y(!1), { call: m, result: c, status: d } = r, h = m.risk ?? "safe", u = Object.keys(m.args).length > 0;
  return /* @__PURE__ */ a("div", { className: `meso-tool meso-tool--${d} meso-tool--risk-${h}`, children: [
    /* @__PURE__ */ a("div", { className: "meso-tool__header", children: [
      /* @__PURE__ */ e(ke, { status: d }),
      /* @__PURE__ */ e("span", { className: "meso-tool__name", children: m.name }),
      m.provider && Y[m.provider] && /* @__PURE__ */ e("span", { className: `meso-tool__provider meso-tool__provider--${m.provider}`, children: Y[m.provider] }),
      ((p = m.annotations) == null ? void 0 : p.open_world) && /* @__PURE__ */ e("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", children: "🌐" }),
      h !== "safe" && /* @__PURE__ */ e("span", { className: `meso-tool__risk meso-tool__risk--${h}`, children: Ne[h] }),
      (c == null ? void 0 : c.duration_ms) !== void 0 && /* @__PURE__ */ a("span", { className: "meso-tool__duration", children: [
        c.duration_ms,
        "ms"
      ] }),
      u && /* @__PURE__ */ a(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => n((k) => !k),
          "aria-expanded": o,
          "aria-label": o ? "折叠参数" : "展开参数",
          children: [
            o ? "▾" : "▸",
            " 参数"
          ]
        }
      )
    ] }),
    o && u && /* @__PURE__ */ e("pre", { className: "meso-tool__args", children: JSON.stringify(m.args, null, 2) }),
    d === "awaiting_confirm" && s && t && /* @__PURE__ */ e(
      ve,
      {
        toolCall: m,
        onConfirm: s,
        onCancel: t
      }
    ),
    (d === "done" || d === "error") && c && /* @__PURE__ */ a("div", { className: "meso-tool__result", children: [
      /* @__PURE__ */ a(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => i((k) => !k),
          "aria-expanded": l,
          "aria-label": l ? "折叠结果" : "展开结果",
          children: [
            l ? "▾" : "▸",
            " ",
            d === "error" ? "错误" : "结果"
          ]
        }
      ),
      l && /* @__PURE__ */ e("pre", { className: `meso-tool__output${d === "error" ? " meso-tool__output--error" : ""}`, children: d === "error" ? c.error : c.output })
    ] })
  ] });
}
function ke({ status: r }) {
  switch (r) {
    case "pending":
    case "running":
      return /* @__PURE__ */ e("span", { className: "meso-tool__spinner", "aria-label": "执行中" });
    case "awaiting_confirm":
      return /* @__PURE__ */ a("svg", { className: "meso-tool__icon meso-tool__icon--warn", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "等待确认", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M7 4v4M7 10v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
      ] });
    case "done":
      return /* @__PURE__ */ a("svg", { className: "meso-tool__icon meso-tool__icon--done", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "完成", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("polyline", { points: "4,7 6,9.5 10,4.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
      ] });
    case "error":
      return /* @__PURE__ */ a("svg", { className: "meso-tool__icon meso-tool__icon--error", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "失败", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M5 5l4 4M9 5l-4 4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
      ] });
  }
}
function be({ soul: r, compact: s = !1 }) {
  const t = r.name.charAt(0);
  return /* @__PURE__ */ a(
    "div",
    {
      className: `meso-soul${s ? " meso-soul--compact" : ""}`,
      title: `${r.name} v${r.version}`,
      role: "status",
      "aria-label": `当前 Soul: ${r.name}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-soul__avatar", children: r.avatar ? /* @__PURE__ */ e("img", { src: r.avatar, alt: r.name, className: "meso-soul__img" }) : /* @__PURE__ */ e("span", { className: "meso-soul__initial", children: t }) }),
        !s && /* @__PURE__ */ a(M, { children: [
          /* @__PURE__ */ e("span", { className: "meso-soul__name", children: r.name }),
          r.traits && r.traits.length > 0 && /* @__PURE__ */ e("div", { className: "meso-soul__traits", children: r.traits.map((o) => /* @__PURE__ */ e("span", { className: "meso-soul__trait", children: o }, o)) })
        ] })
      ]
    }
  );
}
const we = {
  mcp: "MCP",
  api: "API"
};
function ge({ skill: r }) {
  const s = r.provider ? we[r.provider] : null;
  return /* @__PURE__ */ a(
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
        r.focus && r.focus.length > 0 && /* @__PURE__ */ a("span", { className: "meso-skill__focus", children: [
          "· ",
          r.focus.join(", ")
        ] }),
        s && /* @__PURE__ */ e("span", { className: "meso-skill__provider", children: s })
      ]
    }
  );
}
function ye({ resourceRead: r }) {
  const [s, t] = y(!1), { read: o, content: n, status: l } = r, i = o.name ?? o.uri, m = o.server;
  return /* @__PURE__ */ a("div", { className: `meso-resource meso-resource--${l}`, children: [
    /* @__PURE__ */ a("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ e(xe, { status: l }),
      /* @__PURE__ */ e("span", { className: "meso-resource__uri", title: o.uri, children: i }),
      m && /* @__PURE__ */ e("span", { className: "meso-resource__server", children: m }),
      (n == null ? void 0 : n.duration_ms) !== void 0 && /* @__PURE__ */ a("span", { className: "meso-resource__duration", children: [
        n.duration_ms,
        "ms"
      ] }),
      (l === "done" || l === "error") && n && /* @__PURE__ */ a(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => t((c) => !c),
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
    s && n && /* @__PURE__ */ e("div", { className: "meso-resource__content", children: l === "error" ? /* @__PURE__ */ e("pre", { className: "meso-resource__text meso-resource__text--error", children: n.error }) : n.contents.map((c, d) => /* @__PURE__ */ a("div", { children: [
      c.type === "text" && /* @__PURE__ */ e("pre", { className: "meso-resource__text", children: c.text }),
      c.type === "image" && c.data && /* @__PURE__ */ e(
        "img",
        {
          className: "meso-resource__image",
          src: `data:${c.mime_type ?? "image/png"};base64,${c.data}`,
          alt: "resource"
        }
      ),
      c.type === "blob" && /* @__PURE__ */ a("span", { className: "meso-resource__blob-label", children: [
        "[",
        c.mime_type ?? "binary",
        "]"
      ] })
    ] }, d)) })
  ] });
}
function xe({ status: r }) {
  switch (r) {
    case "pending":
      return /* @__PURE__ */ e("span", { className: "meso-resource__spinner", "aria-label": "读取中" });
    case "done":
      return /* @__PURE__ */ e("svg", { className: "meso-resource__icon meso-resource__icon--done", width: "13", height: "13", viewBox: "0 0 13 13", fill: "none", "aria-label": "完成", children: /* @__PURE__ */ e("path", { d: "M2 7L5 10L11 4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) });
    case "error":
      return /* @__PURE__ */ a("svg", { className: "meso-resource__icon meso-resource__icon--error", width: "13", height: "13", viewBox: "0 0 13 13", fill: "none", "aria-label": "失败", children: [
        /* @__PURE__ */ e("circle", { cx: "6.5", cy: "6.5", r: "5.5", stroke: "currentColor", strokeWidth: "1.2" }),
        /* @__PURE__ */ e("path", { d: "M4.5 4.5l4 4M8.5 4.5l-4 4", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round" })
      ] });
  }
}
function Le(r) {
  return r === "html preview" ? { type: "html" } : r === "mermaid" ? { type: "mermaid" } : r === "markdown" ? { type: "markdown" } : r === "table" ? { type: "table" } : { type: "code", language: r };
}
function Me({
  messages: r,
  streaming: s,
  onArtifactCopy: t,
  onArtifactDownload: o,
  onToolConfirm: n,
  onToolCancel: l,
  emptyState: i,
  emptyStateAlign: m = "center",
  className: c,
  renderExtension: d,
  renderLiveTrace: h,
  renderMarkdown: u,
  renderMermaid: p,
  highlightCode: k,
  hiddenArtifactLangs: x
}) {
  const w = O(null);
  $(() => {
    var _;
    (_ = w.current) == null || _.scrollIntoView({ behavior: "smooth" });
  }, [r, s]);
  const v = r.length > 0 || s && s.status !== "idle";
  return /* @__PURE__ */ e("div", { className: `meso-message-list${c ? ` ${c}` : ""}`, children: /* @__PURE__ */ a("div", { className: "meso-message-list__inner", children: [
    !v && i && /* @__PURE__ */ e("div", { className: `meso-message-list__empty${m === "top" ? " meso-message-list__empty--top" : ""}`, children: i }),
    r.map((_) => /* @__PURE__ */ e(
      F,
      {
        role: _.role,
        content: _.content,
        timestamp: _.timestamp,
        markdown: _.role === "assistant",
        renderMarkdown: u
      },
      _.id
    )),
    s && s.status !== "idle" && /* @__PURE__ */ e("div", { className: "meso-message-list__live", children: h ? h(s) : /* @__PURE__ */ a(M, { children: [
      (s.activeSoul || s.activeSkill) && /* @__PURE__ */ a("div", { className: "meso-message-list__context-row", children: [
        s.activeSoul && /* @__PURE__ */ e(be, { soul: s.activeSoul }),
        s.activeSkill && /* @__PURE__ */ e(ge, { skill: s.activeSkill })
      ] }),
      s.stages.length > 0 && /* @__PURE__ */ e(
        Q,
        {
          stages: s.stages.map((_) => ({
            id: _.name,
            label: _.name,
            status: _.state === "done" || _.state === "error" ? "done" : "active"
          }))
        }
      ),
      s.memorySnippets.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-chips", children: s.memorySnippets.map((_, N) => /* @__PURE__ */ a("span", { className: "meso-memory-chip", title: _.content, children: [
        "[",
        _.category,
        "] ",
        _.content
      ] }, N)) }),
      s.resourceReadOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__resources", children: s.resourceReadOrder.map((_) => {
        const N = s.resourceReads[_];
        return N ? /* @__PURE__ */ e(ye, { resourceRead: N }, _) : null;
      }) }),
      s.toolCallOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__tools", children: s.toolCallOrder.map((_) => {
        const N = s.toolCalls[_];
        return N ? /* @__PURE__ */ e(
          re,
          {
            toolCall: N,
            onConfirm: n,
            onCancel: l
          },
          _
        ) : null;
      }) }),
      d && s.extensionLog.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__extensions", children: s.extensionLog.map((_, N) => /* @__PURE__ */ e(Z.Fragment, { children: d(_) }, N)) }),
      s.thinkContent && /* @__PURE__ */ e(
        q,
        {
          content: s.thinkContent,
          streaming: !s.thinkDone
        }
      ),
      (s.textContent || s.status === "streaming") && /* @__PURE__ */ e(
        F,
        {
          role: "assistant",
          content: s.textContent,
          streaming: s.status === "streaming" && s.artifactOrder.length === 0,
          markdown: !0,
          renderMarkdown: u
        }
      ),
      s.artifactOrder.map((_) => {
        const N = s.artifacts[_];
        if (!N || x != null && x.includes(N.lang)) return null;
        const { type: C, language: R } = Le(N.lang);
        return /* @__PURE__ */ e(
          ce,
          {
            type: C,
            content: N.content,
            language: R,
            streaming: !N.done,
            onCopy: t,
            onDownload: o,
            renderMermaid: p,
            highlightCode: k,
            renderMarkdown: u
          },
          _
        );
      }),
      s.memorySaved.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-saved", children: s.memorySaved.map((_) => /* @__PURE__ */ a("span", { className: "meso-memory-saved__chip", title: _.preview, children: [
        /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        _.category,
        "]"
      ] }, _.id)) })
    ] }) }),
    /* @__PURE__ */ e("div", { ref: w })
  ] }) });
}
function Te({
  value: r,
  onChange: s,
  onSubmit: t,
  onStop: o,
  streaming: n = !1,
  disabled: l = !1,
  placeholder: i = "输入消息… (Ctrl+Enter 发送，Enter 换行)",
  leadingSlot: m,
  trailingActions: c,
  maxRows: d = 8
}) {
  const h = O(null), u = 22, p = () => {
    const v = h.current;
    v && (v.style.height = "auto", v.style.height = Math.min(v.scrollHeight, u * d) + "px");
  };
  $(p, [r]);
  const k = (v) => {
    v.key === "Enter" && (v.ctrlKey || v.metaKey) && (v.preventDefault(), !l && !n && r.trim() && t());
  }, x = !l && !n && r.trim().length > 0, w = /* @__PURE__ */ e(
    "button",
    {
      className: `meso-composer__send${n ? " meso-composer__send--stop" : ""}`,
      onClick: n ? o : t,
      disabled: n ? !1 : !x,
      "aria-label": n ? "停止生成" : "发送",
      title: n ? "停止生成" : "Ctrl+Enter",
      children: n ? (
        /* Stop square */
        /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ e("rect", { x: "4", y: "4", width: "16", height: "16", rx: "2" }) })
      ) : (
        /* Send arrow */
        /* @__PURE__ */ a("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ e("line", { x1: "12", y1: "19", x2: "12", y2: "5" }),
          /* @__PURE__ */ e("polyline", { points: "5,12 12,5 19,12" })
        ] })
      )
    }
  );
  return /* @__PURE__ */ e("div", { className: "meso-composer", children: /* @__PURE__ */ a("div", { className: "meso-composer__box", children: [
    /* @__PURE__ */ e(
      "textarea",
      {
        ref: h,
        className: "meso-composer__textarea",
        value: r,
        onChange: (v) => {
          s(v.target.value), p();
        },
        onKeyDown: k,
        placeholder: i,
        rows: 1,
        disabled: l && !n,
        "aria-label": "消息输入框"
      }
    ),
    /* @__PURE__ */ a("div", { className: "meso-composer__toolbar", children: [
      /* @__PURE__ */ e("div", { className: "meso-composer__leading", children: m }),
      /* @__PURE__ */ e("span", { className: "meso-composer__hint", children: r.length > 0 && `${r.length} 字` }),
      /* @__PURE__ */ e("div", { className: "meso-composer__trailing", children: c ?? w })
    ] })
  ] }) });
}
function Ce(r) {
  const s = r.toolCallOrder.length + r.workflowRunOrder.reduce(
    (n, l) => {
      var i;
      return n + (((i = r.workflowRuns[l]) == null ? void 0 : i.nodeOrder.length) ?? 0);
    },
    0
  ), t = r.toolCallOrder.filter((n) => {
    var l;
    return ((l = r.toolCalls[n]) == null ? void 0 : l.status) === "error";
  }).length + r.workflowRunOrder.reduce((n, l) => {
    const i = r.workflowRuns[l];
    return i ? n + i.nodeOrder.filter((m) => {
      var c;
      return ((c = i.nodes[m]) == null ? void 0 : c.state) === "error";
    }).length : n;
  }, 0), o = [];
  return r.stages.length > 0 && o.push(`${r.stages.length} 阶段`), s > 0 && o.push(`${s} 步`), t > 0 && o.push(`${t} 项失败`), o.length > 0 ? o.join(" · ") : "执行过程";
}
function We({
  stream: r,
  streaming: s = !1,
  defaultCollapsed: t = !1,
  onToolConfirm: o,
  onToolCancel: n
}) {
  const [l, i] = y(t);
  if (!(!!r.thinkContent || r.stages.length > 0 || r.toolCallOrder.length > 0 || r.workflowRunOrder.length > 0)) return null;
  const c = Ce(r), d = r.workflowRunOrder.map((h) => r.workflowRuns[h]).filter(Boolean);
  return /* @__PURE__ */ a("div", { className: "meso-process-trace", children: [
    /* @__PURE__ */ a(
      "button",
      {
        className: "meso-process-trace__header",
        onClick: () => i((h) => !h),
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
          /* @__PURE__ */ e("span", { className: "meso-process-trace__summary", children: c }),
          s && /* @__PURE__ */ e("span", { className: "meso-process-trace__dot", "aria-label": "执行中" })
        ]
      }
    ),
    !l && /* @__PURE__ */ a("div", { className: "meso-process-trace__body", children: [
      r.thinkContent && /* @__PURE__ */ e(
        q,
        {
          content: r.thinkContent,
          streaming: s && !r.thinkDone,
          collapseWhen: "never",
          defaultOpen: !0
        }
      ),
      r.stages.length > 0 && /* @__PURE__ */ e(
        Q,
        {
          stages: r.stages.map((h) => ({
            id: h.name,
            label: h.name,
            status: h.state === "done" || h.state === "error" ? "done" : "active"
          }))
        }
      ),
      r.toolCallOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-process-trace__tools", children: r.toolCallOrder.map((h) => {
        const u = r.toolCalls[h];
        return u ? /* @__PURE__ */ e(
          re,
          {
            toolCall: u,
            onConfirm: o,
            onCancel: n
          },
          h
        ) : null;
      }) }),
      d.length > 0 && /* @__PURE__ */ e(fe, { runs: d })
    ] })
  ] });
}
function Ie({
  name: r,
  email: s,
  avatarText: t,
  menuItems: o = [],
  onSignOut: n
}) {
  const [l, i] = y(!1), m = O(null);
  $(() => {
    if (!l) return;
    const h = (u) => {
      m.current && !m.current.contains(u.target) && i(!1);
    };
    return document.addEventListener("mousedown", h), () => document.removeEventListener("mousedown", h);
  }, [l]);
  const c = t ?? r.charAt(0).toUpperCase(), d = [
    ...o,
    ...n ? [{ label: "退出登录", onClick: () => {
      i(!1), n();
    }, danger: !0 }] : []
  ];
  return /* @__PURE__ */ a("div", { className: "meso-user-menu", ref: m, children: [
    l && /* @__PURE__ */ a("div", { className: "meso-user-menu__popup", role: "menu", children: [
      /* @__PURE__ */ a("div", { className: "meso-user-menu__identity", children: [
        /* @__PURE__ */ e("span", { className: "meso-user-menu__identity-name", children: r }),
        s && /* @__PURE__ */ e("span", { className: "meso-user-menu__identity-email", children: s })
      ] }),
      d.length > 0 && /* @__PURE__ */ e("div", { className: "meso-user-menu__sep", role: "separator" }),
      d.map((h, u) => /* @__PURE__ */ a(
        "button",
        {
          className: `meso-user-menu__item${h.danger ? " meso-user-menu__item--danger" : ""}`,
          role: "menuitem",
          onClick: () => {
            i(!1), h.onClick();
          },
          children: [
            h.icon && /* @__PURE__ */ e("span", { className: "meso-user-menu__item-icon", children: h.icon }),
            h.label
          ]
        },
        u
      ))
    ] }),
    /* @__PURE__ */ a(
      "button",
      {
        className: "meso-user-menu__trigger",
        onClick: () => i((h) => !h),
        "aria-haspopup": "menu",
        "aria-expanded": l,
        title: r,
        children: [
          /* @__PURE__ */ e("div", { className: "meso-user-menu__avatar", children: c }),
          /* @__PURE__ */ a("div", { className: "meso-user-menu__info", children: [
            /* @__PURE__ */ e("span", { className: "meso-user-menu__name", children: r }),
            s && /* @__PURE__ */ e("span", { className: "meso-user-menu__email", children: s })
          ] })
        ]
      }
    )
  ] });
}
function je({
  tabs: r,
  activeTabId: s,
  onTabChange: t,
  autoSelectFirstReady: o = !1
}) {
  var u;
  const n = s !== void 0, [l, i] = y(((u = r[0]) == null ? void 0 : u.id) ?? ""), m = n ? s : l, c = O(!1);
  $(() => {
    if (!o || c.current) return;
    const p = r.find((k) => k.ready);
    p && (c.current = !0, n || i(p.id), t == null || t(p.id));
  }, [r, o, n, t]);
  const d = (p) => {
    n || i(p), t == null || t(p);
  }, h = r.find((p) => p.id === m) ?? r[0];
  return r.length === 0 ? null : /* @__PURE__ */ a("div", { className: "meso-artifact-shell", children: [
    /* @__PURE__ */ e("div", { className: "meso-artifact-shell__tabs", role: "tablist", children: r.map((p) => /* @__PURE__ */ a(
      "button",
      {
        role: "tab",
        "aria-selected": p.id === m,
        className: `meso-artifact-shell__tab${p.id === m ? " meso-artifact-shell__tab--active" : ""}`,
        onClick: () => d(p.id),
        children: [
          p.label,
          p.ready === !1 && /* @__PURE__ */ e("span", { className: "meso-artifact-shell__tab-dot", "aria-label": "加载中" })
        ]
      },
      p.id
    )) }),
    /* @__PURE__ */ e("div", { className: "meso-artifact-shell__content", role: "tabpanel", children: h == null ? void 0 : h.content })
  ] });
}
function He(r, s) {
  const [t, o] = y(D), n = O(null), l = O(s);
  l.current = s;
  const i = j(() => {
    var d;
    (d = n.current) == null || d.abort(), o((h) => ({ ...h, status: "idle" }));
  }, []), m = j(() => {
    var d;
    (d = n.current) == null || d.abort(), o(D());
  }, []), c = j(async (d) => {
    var x, w, v, _, N, C, R, B, S, L, g, A, V, K, U, T, G;
    (x = n.current) == null || x.abort();
    const h = new AbortController();
    n.current = h;
    const u = { ...D(), status: "streaming" };
    o(u);
    let p = u;
    const k = (d == null ? void 0 : d.method) ?? (d != null && d.body ? "POST" : "GET");
    try {
      const E = await fetch(r, {
        method: k,
        headers: {
          ...k === "POST" ? { "Content-Type": "application/json" } : {},
          ...d == null ? void 0 : d.headers
        },
        body: d != null && d.body ? JSON.stringify(d.body) : void 0,
        signal: h.signal
      });
      if (!E.ok) throw new Error(`HTTP ${E.status}`);
      const W = E.body.getReader(), H = new TextDecoder();
      let P = "";
      for (; ; ) {
        const { done: ae, value: oe } = await W.read();
        if (ae) break;
        P += H.decode(oe, { stream: !0 });
        const J = P.split(`
`);
        P = J.pop() ?? "";
        for (const te of J) {
          const b = ne(te);
          if (!b) continue;
          const I = le(p, b);
          p = I, o(I);
          const f = l.current;
          if (f)
            switch (b.type) {
              case "capabilities":
                (w = f.onCapabilities) == null || w.call(f, b.payload);
                break;
              case "stage":
                (v = f.onStageChange) == null || v.call(f, b.payload);
                break;
              case "memory":
                (_ = f.onMemoryRecalled) == null || _.call(f, b.payload.snippets);
                break;
              case "memory_saved":
                (N = f.onMemorySaved) == null || N.call(f, b.payload);
                break;
              case "soul":
                (C = f.onSoulActivated) == null || C.call(f, b.payload);
                break;
              case "skill_active":
                (R = f.onSkillActivated) == null || R.call(f, b.payload);
                break;
              case "tool_call":
                (B = f.onToolCall) == null || B.call(f, b.payload);
                break;
              case "tool_result":
                (S = f.onToolResult) == null || S.call(f, b.payload);
                break;
              case "resource_read":
                (L = f.onResourceRead) == null || L.call(f, b.payload);
                break;
              case "resource_content":
                (g = f.onResourceContent) == null || g.call(f, b.payload);
                break;
              case "artifact": {
                const z = I.artifacts[b.payload.id];
                z && ((A = f.onArtifact) == null || A.call(f, z));
                break;
              }
              case "extension":
                (V = f.onExtensionEvent) == null || V.call(f, b);
                break;
              case "error":
                (K = f.onError) == null || K.call(f, b.payload.message, b.payload.code);
                break;
              case "done":
                (U = f.onDone) == null || U.call(f, I);
                break;
            }
          if (b.type === "done" || b.type === "error") return;
        }
      }
    } catch (E) {
      if (E.name === "AbortError") return;
      const W = E.message;
      o((H) => ({ ...H, status: "error", errorMessage: W })), (G = (T = l.current) == null ? void 0 : T.onError) == null || G.call(T, W);
    }
  }, [r]);
  return { state: t, start: c, abort: i, reset: m };
}
const se = "meso-theme";
function Se() {
  return typeof window > "u" ? "light" : localStorage.getItem(se) ?? "light";
}
function $e(r) {
  document.documentElement.setAttribute("data-theme", r), localStorage.setItem(se, r);
}
function Pe() {
  const [r, s] = y(Se);
  $(() => {
    $e(r);
  }, [r]);
  const t = j(() => {
    s((o) => o === "light" ? "dark" : "light");
  }, []);
  return { theme: r, toggle: t };
}
export {
  je as ArtifactPaneShell,
  ce as ArtifactPanel,
  F as ChatBubble,
  Te as ChatComposer,
  ve as ConfirmGate,
  Me as MessageList,
  Ke as PROTOCOL_VERSION,
  We as ProcessTrace,
  ye as ResourceReadBlock,
  Ie as SidebarUserMenu,
  ge as SkillIndicator,
  be as SoulIndicator,
  Q as StageTimeline,
  Ee as StreamingCursor,
  q as ThinkBlock,
  Be as ThreeColumnLayout,
  re as ToolCallBlock,
  fe as WorkflowTimeline,
  le as applyEvent,
  Ue as assertCompatibleVersion,
  D as createInitialStreamState,
  Ge as createStreamStateWithArtifacts,
  Je as isCompatibleVersion,
  ne as parseSSELine,
  ze as stagePayloadToStage,
  Fe as streamStateHasArtifacts,
  He as useSSEStream,
  Pe as useTheme
};
