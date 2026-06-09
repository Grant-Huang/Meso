import { jsxs as t, jsx as e, Fragment as T } from "react/jsx-runtime";
import ee, { useState as w, useRef as $, useEffect as R, useCallback as D } from "react";
import { createInitialStreamState as P, parseSSELine as de, applyEvent as me } from "./runtime.js";
import { PROTOCOL_VERSION as qe, assertCompatibleVersion as Qe, createStreamStateWithArtifacts as Xe, isCompatibleVersion as er, stagePayloadToStage as rr, streamStateHasArtifacts as sr } from "./runtime.js";
function je({
  navItems: r = [],
  sidebarFooter: s,
  sessionColumn: n,
  children: o,
  defaultCollapsed: a = !1,
  appName: l = "Meso",
  sidebarLogo: c,
  sidebarTitle: i,
  mainHeader: m,
  artifactPanel: d,
  defaultArtifactVisible: u = !1,
  onArtifactToggle: f,
  artifactVisible: p,
  showArtifactToggle: N = !0,
  showSessionColumn: y = !0,
  contentMaxWidth: b,
  artifactPanelWidth: v,
  onCollapsedChange: h
}) {
  const [k, C] = w(a), [O, E] = w(u), L = p !== void 0 ? p : O, S = () => {
    const x = !L;
    p === void 0 && E(x), f == null || f(x);
  };
  return /* @__PURE__ */ t("div", { className: "meso-layout", children: [
    /* @__PURE__ */ t("aside", { className: `meso-sidebar${k ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ t("div", { className: "meso-sidebar__header", children: [
        c ? /* @__PURE__ */ e("div", { className: "meso-sidebar__logo meso-sidebar__logo--custom", children: c }) : /* @__PURE__ */ e("div", { className: "meso-sidebar__logo", children: l[0] }),
        i ? /* @__PURE__ */ e("span", { className: "meso-sidebar__title meso-sidebar__title--brand", children: i }) : /* @__PURE__ */ e("span", { className: "meso-sidebar__title", children: l }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => {
              const x = !k;
              C(x), h == null || h(x);
            },
            "aria-label": k ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ t("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ e("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ e("nav", { className: "meso-sidebar__nav", children: r.map((x) => /* @__PURE__ */ t(
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
    y !== !1 && /* @__PURE__ */ e("div", { className: "meso-session-col", children: n }),
    /* @__PURE__ */ t("main", { className: "meso-main", children: [
      /* @__PURE__ */ t("div", { className: "meso-main__header", children: [
        /* @__PURE__ */ e("div", { className: "meso-main__header-content", children: m }),
        N !== !1 && /* @__PURE__ */ e(
          "button",
          {
            className: `meso-artifact-toggle${L ? " meso-artifact-toggle--active" : ""}`,
            onClick: S,
            title: L ? "关闭 Artifact" : "打开 Artifact",
            "aria-label": L ? "关闭 Artifact" : "打开 Artifact",
            children: L ? (
              /* X / close icon */
              /* @__PURE__ */ t("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ e("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                /* @__PURE__ */ e("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
              ] })
            ) : (
              /* Panel / artifact icon */
              /* @__PURE__ */ t("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ e("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                /* @__PURE__ */ e("line", { x1: "14", y1: "3", x2: "14", y2: "21" })
              ] })
            )
          }
        )
      ] }),
      /* @__PURE__ */ t("div", { className: "meso-main__content", children: [
        /* @__PURE__ */ e("div", { className: "meso-main__chat", style: b ? { maxWidth: b, margin: "0 auto", width: "100%" } : void 0, children: o }),
        L && /* @__PURE__ */ t(T, { children: [
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
function Q({
  role: r,
  content: s,
  streaming: n = !1,
  timestamp: o,
  markdown: a = !1,
  renderMarkdown: l
}) {
  const c = a && typeof l == "function";
  return /* @__PURE__ */ t("div", { className: `meso-bubble meso-bubble--${r}`, children: [
    r === "assistant" && /* @__PURE__ */ e("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ t("div", { className: "meso-bubble__body", children: [
      c ? /* @__PURE__ */ e(
        "div",
        {
          className: "meso-bubble__content meso-bubble__md",
          dangerouslySetInnerHTML: { __html: l(s) }
        }
      ) : /* @__PURE__ */ t("div", { className: "meso-bubble__content", children: [
        s.split(`
`).map((i, m) => /* @__PURE__ */ t(ee.Fragment, { children: [
          m > 0 && /* @__PURE__ */ e("br", {}),
          i
        ] }, m)),
        n && /* @__PURE__ */ e("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      o && /* @__PURE__ */ e("div", { className: "meso-bubble__timestamp", children: o })
    ] })
  ] });
}
function re({
  content: r,
  pinnedContent: s,
  streaming: n = !1,
  turnStreaming: o,
  autoCollapseDelay: a = 1500,
  defaultOpen: l = !0,
  open: c,
  onOpenChange: i,
  collapseWhen: m = "streamEnd",
  summary: d = "已思考"
}) {
  const u = c !== void 0, [f, p] = w(l), [N, y] = w(null), b = $(null);
  b.current = N;
  const v = u ? c : N !== null ? N : f, h = $(n), k = $(o), C = () => {
    const L = !v;
    u || y(L), i == null || i(L);
  };
  return R(() => {
    if (m !== "never" && a !== null) {
      if (h.current && !n) {
        const L = setTimeout(() => {
          u || p(!1), b.current === null && (i == null || i(!1));
        }, a);
        return () => clearTimeout(L);
      }
      h.current = n;
    }
  }, [n, a, m, u, i]), R(() => {
    o !== void 0 && (k.current && !o && y(null), k.current = o);
  }, [o]), /* @__PURE__ */ t("div", { className: `meso-think${v ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ t(
      "button",
      {
        className: "meso-think__header",
        onClick: C,
        "aria-expanded": v,
        children: [
          /* @__PURE__ */ e("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ e("span", { className: "meso-think__label", children: v ? "思考过程" : d }),
          n && /* @__PURE__ */ e("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { className: "meso-think__body", children: /* @__PURE__ */ t("div", { className: "meso-think__content", children: [
      !n && s !== void 0 ? s : r,
      n && /* @__PURE__ */ e("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function He({ active: r = !0 }) {
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
  language: n = "plaintext",
  streaming: o = !1,
  onCopy: a,
  onDownload: l,
  renderMermaid: c,
  highlightCode: i,
  renderMarkdown: m
}) {
  const [d, u] = w(!1), [f, p] = w(r), [N, y] = w(null), [b, v] = w(!1), [h, k] = w(null), C = $("");
  R(() => {
    p(r);
  }, [r]), R(() => {
    r !== "mermaid" || o || !c || s === C.current || (C.current = s, y(null), v(!1), c(s).then((S) => y(S)).catch(() => v(!0)));
  }, [r, o, s, c]), R(() => {
    r !== "code" || o || !i || s === C.current && h || (C.current = s, k(i(s, n)));
  }, [r, o, s, n, i, h]);
  const O = () => {
    navigator.clipboard.writeText(s).catch(() => {
    }), u(!0), setTimeout(() => u(!1), 2e3), a == null || a(s);
  }, E = () => {
    if (l) {
      l(s);
      return;
    }
    const S = {
      html: "html",
      mermaid: "md",
      markdown: "md",
      table: "json",
      code: n || "txt"
    }, x = new Blob([s], { type: "text/plain" }), A = document.createElement("a");
    A.href = URL.createObjectURL(x), A.download = `artifact.${S[r]}`, A.click(), URL.revokeObjectURL(A.href);
  };
  return /* @__PURE__ */ t("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ t("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ e("div", { className: "meso-artifact__tabs", children: (r === "html" ? ["html", "code"] : [r]).map((S) => /* @__PURE__ */ e(
        "span",
        {
          className: `meso-artifact__tab${f === S ? " meso-artifact__tab--active" : ""}`,
          onClick: () => p(S),
          children: fe(S, n)
        },
        S
      )) }),
      o && /* @__PURE__ */ e("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ e("button", { className: "meso-artifact__download-btn", onClick: E, title: "下载", "aria-label": "下载文件", children: /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) }) }),
      /* @__PURE__ */ e("button", { className: "meso-artifact__copy-btn", onClick: O, title: "复制", "aria-label": "复制代码", children: d ? /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ t("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ e("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
      ] }) })
    ] }),
    /* @__PURE__ */ t("div", { className: "meso-artifact__body", children: [
      f === "html" && /* @__PURE__ */ e("iframe", { className: "meso-artifact__preview", srcDoc: s, sandbox: "allow-scripts", title: "HTML 预览" }),
      f === "mermaid" && /* @__PURE__ */ t(T, { children: [
        o && /* @__PURE__ */ t("pre", { className: "meso-artifact__code", children: [
          /* @__PURE__ */ e("code", { children: s }),
          /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
        ] }),
        !o && N && /* @__PURE__ */ e(
          "div",
          {
            className: "meso-artifact__mermaid",
            dangerouslySetInnerHTML: { __html: N }
          }
        ),
        !o && !N && !b && !c && /* @__PURE__ */ t("div", { className: "meso-artifact__mermaid-placeholder", children: [
          /* @__PURE__ */ e("span", { children: "图表预览需要集成 Mermaid 渲染器" }),
          /* @__PURE__ */ e("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ e("code", { children: s }) })
        ] }),
        !o && b && /* @__PURE__ */ t("div", { className: "meso-artifact__mermaid-placeholder meso-artifact__mermaid-placeholder--error", children: [
          /* @__PURE__ */ e("span", { children: "图表渲染失败，请检查语法" }),
          /* @__PURE__ */ e("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ e("code", { children: s }) })
        ] }),
        !o && !N && !b && c && /* @__PURE__ */ e("div", { className: "meso-artifact__mermaid-placeholder", children: /* @__PURE__ */ e("span", { children: "渲染中…" }) })
      ] }),
      f === "markdown" && /* @__PURE__ */ e(T, { children: m ? /* @__PURE__ */ e(
        "div",
        {
          className: "meso-artifact__markdown",
          dangerouslySetInnerHTML: { __html: m(s) }
        }
      ) : /* @__PURE__ */ t("pre", { className: "meso-artifact__code", children: [
        /* @__PURE__ */ e("code", { children: s }),
        o && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] }) }),
      f === "table" && /* @__PURE__ */ e(_e, { content: s, streaming: o }),
      (f === "code" || f === "html" && !1) && /* @__PURE__ */ t("pre", { className: "meso-artifact__code", children: [
        h && !o ? /* @__PURE__ */ e("code", { dangerouslySetInnerHTML: { __html: h } }) : /* @__PURE__ */ e("code", { children: s }),
        o && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] })
    ] })
  ] });
}
function _e({ content: r, streaming: s }) {
  const n = ue(r);
  return n ? /* @__PURE__ */ e("div", { className: "meso-artifact__table-wrap", children: /* @__PURE__ */ t("table", { className: "meso-artifact__table", children: [
    /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: n.headers.map((o, a) => /* @__PURE__ */ e("th", { children: o }, a)) }) }),
    /* @__PURE__ */ e("tbody", { children: n.rows.map((o, a) => /* @__PURE__ */ e("tr", { children: o.map((l, c) => /* @__PURE__ */ e("td", { children: String(l) }, c)) }, a)) })
  ] }) }) : /* @__PURE__ */ t("pre", { className: "meso-artifact__code", children: [
    /* @__PURE__ */ e("code", { children: r }),
    s && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
  ] });
}
function fe(r, s) {
  return r === "html" ? "HTML 预览" : r === "mermaid" ? "图表" : r === "markdown" ? "Markdown" : r === "table" ? "表格" : s || "Code";
}
function se({ stages: r, compact: s = !1 }) {
  return r.length === 0 ? null : /* @__PURE__ */ e("div", { className: `meso-stages${s ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: r.map((n, o) => /* @__PURE__ */ t(
    "div",
    {
      className: `meso-stage meso-stage--${n.status}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-stage__dot", children: n.status === "done" ? /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,5.5 4,8 8.5,2.5" }) }) : n.status === "error" ? /* @__PURE__ */ t("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", children: [
          /* @__PURE__ */ e("line", { x1: "2", y1: "2", x2: "8", y2: "8" }),
          /* @__PURE__ */ e("line", { x1: "8", y1: "2", x2: "2", y2: "8" })
        ] }) : /* @__PURE__ */ e("span", { className: "meso-stage__dot-inner" }) }),
        o < r.length - 1 && /* @__PURE__ */ e("div", { className: `meso-stage__line${n.status === "done" ? " meso-stage__line--done" : ""}` }),
        /* @__PURE__ */ e("span", { className: `meso-stage__label${s ? " meso-stage__label--compact" : ""}`, children: n.label })
      ]
    },
    n.id
  )) });
}
function pe(r) {
  const { nodes: s, nodeOrder: n } = r, o = /* @__PURE__ */ new Map();
  for (const i of n) {
    const m = s[i];
    if (!m) continue;
    const d = m.parent_id ?? null;
    o.has(d) || o.set(d, []), o.get(d).push(i);
  }
  const a = /* @__PURE__ */ new Map();
  for (const [, i] of o)
    if (i.length > 1)
      for (const m of i) a.set(m, i);
  const l = [], c = /* @__PURE__ */ new Set();
  for (const i of n) {
    if (c.has(i)) continue;
    const m = s[i];
    if (!m) continue;
    const d = a.get(i);
    if (d) {
      const u = d.map((f) => s[f]).filter((f) => !!f);
      for (const f of u) c.add(f.node_id);
      l.push({ kind: "parallel", nodes: u, isLast: !1 });
    } else
      c.add(i), l.push({ kind: "node", node: m, isLast: !1 });
  }
  return l.length > 0 && (l[l.length - 1] = { ...l[l.length - 1], isLast: !0 }), l;
}
function oe({ state: r }) {
  return r === "done" ? /* @__PURE__ */ e("svg", { className: "meso-wf-node__icon meso-wf-node__icon--done", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,6.5 4.5,9.5 10.5,3" }) }) : r === "error" ? /* @__PURE__ */ t("svg", { className: "meso-wf-node__icon meso-wf-node__icon--error", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ e("line", { x1: "2", y1: "2", x2: "10", y2: "10" }),
    /* @__PURE__ */ e("line", { x1: "10", y1: "2", x2: "2", y2: "10" })
  ] }) : r === "skipped" ? /* @__PURE__ */ e("svg", { className: "meso-wf-node__icon meso-wf-node__icon--skipped", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ e("line", { x1: "2", y1: "6", x2: "10", y2: "6" }) }) : /* @__PURE__ */ e("span", { className: "meso-wf-node__spinner", "aria-hidden": "true" });
}
function te(r) {
  return r < 1e3 ? `${r}ms` : `${(r / 1e3).toFixed(1)}s`;
}
function ve({ node: r, isLast: s }) {
  var l;
  const [n, o] = w(!1), a = r.metadata && Object.keys(r.metadata).length > 0;
  return /* @__PURE__ */ t("div", { className: `meso-wf-node meso-wf-node--${r.state}`, children: [
    /* @__PURE__ */ t("div", { className: "meso-wf-node__track", children: [
      /* @__PURE__ */ e("div", { className: "meso-wf-node__dot", children: /* @__PURE__ */ e(oe, { state: r.state }) }),
      !s && /* @__PURE__ */ e("div", { className: "meso-wf-node__line" })
    ] }),
    /* @__PURE__ */ t("div", { className: "meso-wf-node__body", children: [
      /* @__PURE__ */ t("div", { className: "meso-wf-node__header", children: [
        /* @__PURE__ */ e("code", { className: "meso-wf-node__name", children: r.name }),
        r.duration_ms !== void 0 && /* @__PURE__ */ e("span", { className: "meso-wf-node__duration", children: te(r.duration_ms) }),
        a && /* @__PURE__ */ e(
          "button",
          {
            className: "meso-wf-node__expand",
            onClick: () => o((c) => !c),
            "aria-expanded": n,
            "aria-label": n ? "收起详情" : "展开详情",
            children: /* @__PURE__ */ e("svg", { viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", style: { transform: n ? "rotate(180deg)" : void 0 }, children: /* @__PURE__ */ e("polyline", { points: "2,3.5 5,6.5 8,3.5" }) })
          }
        )
      ] }),
      r.state === "error" && !!((l = r.metadata) != null && l.error) && /* @__PURE__ */ e("div", { className: "meso-wf-node__error", children: String(r.metadata.error) }),
      n && a && /* @__PURE__ */ e("pre", { className: "meso-wf-node__meta", children: JSON.stringify(r.metadata, null, 2) })
    ] })
  ] });
}
function ke({ nodes: r, isLast: s }) {
  return /* @__PURE__ */ t("div", { className: "meso-wf-parallel", children: [
    /* @__PURE__ */ e("div", { className: "meso-wf-parallel__row", children: r.map((n, o) => {
      var a;
      return /* @__PURE__ */ t("div", { className: `meso-wf-parallel__branch meso-wf-parallel__branch--${n.state}`, children: [
        /* @__PURE__ */ e("div", { className: "meso-wf-parallel__branch-dot", children: /* @__PURE__ */ e(oe, { state: n.state }) }),
        /* @__PURE__ */ t("div", { className: "meso-wf-parallel__branch-body", children: [
          /* @__PURE__ */ t("div", { className: "meso-wf-parallel__branch-label", children: [
            "并行分支 ",
            String.fromCharCode(65 + o)
          ] }),
          /* @__PURE__ */ e("code", { className: "meso-wf-node__name", children: n.name }),
          n.state === "error" && !!((a = n.metadata) != null && a.error) && /* @__PURE__ */ e("div", { className: "meso-wf-node__error", children: String(n.metadata.error) }),
          n.duration_ms !== void 0 && /* @__PURE__ */ e("span", { className: "meso-wf-node__duration", style: { display: "block", marginTop: 2 }, children: te(n.duration_ms) })
        ] })
      ] }, n.node_id);
    }) }),
    !s && /* @__PURE__ */ e("div", { className: "meso-wf-parallel__merge" })
  ] });
}
function Ne({ runs: r, showRunId: s = !0, hidden: n }) {
  if (r.length === 0 || n) return null;
  const o = r.length > 1;
  return /* @__PURE__ */ e("div", { className: "meso-wf", role: "status", "aria-label": "工作流进度", children: r.map((a) => {
    const l = pe(a);
    return /* @__PURE__ */ t("div", { className: "meso-wf-run", children: [
      o && s && /* @__PURE__ */ e("div", { className: "meso-wf-run__label", children: a.run_id }),
      l.map(
        (c, i) => c.kind === "parallel" ? /* @__PURE__ */ e(ke, { nodes: c.nodes, isLast: c.isLast }, `parallel-${i}`) : /* @__PURE__ */ e(ve, { node: c.node, isLast: c.isLast }, c.node.node_id)
      )
    ] }, a.run_id);
  }) });
}
const we = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function ge({ toolCall: r, onConfirm: s, onCancel: n }) {
  const o = r.risk ?? "safe", a = we[o], l = Object.keys(r.args).length > 0;
  return /* @__PURE__ */ t("div", { className: `meso-confirm-gate meso-confirm-gate--${o}`, role: "alertdialog", "aria-label": "工具执行确认", children: [
    /* @__PURE__ */ e("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ t("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ e("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ e("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ t("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ t("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ e("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${o}`, children: a.label }),
        /* @__PURE__ */ e("code", { className: "meso-confirm-gate__tool-name", children: r.name })
      ] }),
      l && /* @__PURE__ */ e("pre", { className: "meso-confirm-gate__args", children: JSON.stringify(r.args, null, 2) }),
      /* @__PURE__ */ t("div", { className: "meso-confirm-gate__actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-confirm-gate__btn meso-confirm-gate__btn--cancel",
            onClick: () => n(r.id),
            children: "取消"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            className: `meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${o}`,
            onClick: () => s(r.id),
            children: a.confirmText
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
function ne({ toolCall: r, onConfirm: s, onCancel: n }) {
  var p;
  const [o, a] = w(!1), [l, c] = w(!1), { call: i, result: m, status: d } = r, u = i.risk ?? "safe", f = Object.keys(i.args).length > 0;
  return /* @__PURE__ */ t("div", { className: `meso-tool meso-tool--${d} meso-tool--risk-${u}`, children: [
    /* @__PURE__ */ t("div", { className: "meso-tool__header", children: [
      /* @__PURE__ */ e(ye, { status: d }),
      /* @__PURE__ */ e("span", { className: "meso-tool__name", children: i.name }),
      i.provider && X[i.provider] && /* @__PURE__ */ e("span", { className: `meso-tool__provider meso-tool__provider--${i.provider}`, children: X[i.provider] }),
      ((p = i.annotations) == null ? void 0 : p.open_world) && /* @__PURE__ */ e("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", children: "🌐" }),
      u !== "safe" && /* @__PURE__ */ e("span", { className: `meso-tool__risk meso-tool__risk--${u}`, children: be[u] }),
      (m == null ? void 0 : m.duration_ms) !== void 0 && /* @__PURE__ */ t("span", { className: "meso-tool__duration", children: [
        m.duration_ms,
        "ms"
      ] }),
      f && /* @__PURE__ */ t(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => a((N) => !N),
          "aria-expanded": o,
          "aria-label": o ? "折叠参数" : "展开参数",
          children: [
            o ? "▾" : "▸",
            " 参数"
          ]
        }
      )
    ] }),
    o && f && /* @__PURE__ */ e("pre", { className: "meso-tool__args", children: JSON.stringify(i.args, null, 2) }),
    d === "awaiting_confirm" && s && n && /* @__PURE__ */ e(
      ge,
      {
        toolCall: i,
        onConfirm: s,
        onCancel: n
      }
    ),
    (d === "done" || d === "error") && m && /* @__PURE__ */ t("div", { className: "meso-tool__result", children: [
      /* @__PURE__ */ t(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => c((N) => !N),
          "aria-expanded": l,
          "aria-label": l ? "折叠结果" : "展开结果",
          children: [
            l ? "▾" : "▸",
            " ",
            d === "error" ? "错误" : "结果"
          ]
        }
      ),
      l && /* @__PURE__ */ e("pre", { className: `meso-tool__output${d === "error" ? " meso-tool__output--error" : ""}`, children: d === "error" ? m.error : m.output })
    ] })
  ] });
}
function ye({ status: r }) {
  switch (r) {
    case "pending":
    case "running":
      return /* @__PURE__ */ e("span", { className: "meso-tool__spinner", "aria-label": "执行中" });
    case "awaiting_confirm":
      return /* @__PURE__ */ t("svg", { className: "meso-tool__icon meso-tool__icon--warn", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "等待确认", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M7 4v4M7 10v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
      ] });
    case "done":
      return /* @__PURE__ */ t("svg", { className: "meso-tool__icon meso-tool__icon--done", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "完成", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("polyline", { points: "4,7 6,9.5 10,4.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
      ] });
    case "error":
      return /* @__PURE__ */ t("svg", { className: "meso-tool__icon meso-tool__icon--error", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "失败", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M5 5l4 4M9 5l-4 4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
      ] });
  }
}
function xe({ soul: r, compact: s = !1 }) {
  const n = r.name.charAt(0);
  return /* @__PURE__ */ t(
    "div",
    {
      className: `meso-soul${s ? " meso-soul--compact" : ""}`,
      title: `${r.name} v${r.version}`,
      role: "status",
      "aria-label": `当前 Soul: ${r.name}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-soul__avatar", children: r.avatar ? /* @__PURE__ */ e("img", { src: r.avatar, alt: r.name, className: "meso-soul__img" }) : /* @__PURE__ */ e("span", { className: "meso-soul__initial", children: n }) }),
        !s && /* @__PURE__ */ t(T, { children: [
          /* @__PURE__ */ e("span", { className: "meso-soul__name", children: r.name }),
          r.traits && r.traits.length > 0 && /* @__PURE__ */ e("div", { className: "meso-soul__traits", children: r.traits.map((o) => /* @__PURE__ */ e("span", { className: "meso-soul__trait", children: o }, o)) })
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
  return /* @__PURE__ */ t(
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
        r.focus && r.focus.length > 0 && /* @__PURE__ */ t("span", { className: "meso-skill__focus", children: [
          "· ",
          r.focus.join(", ")
        ] }),
        s && /* @__PURE__ */ e("span", { className: "meso-skill__provider", children: s })
      ]
    }
  );
}
function Se({ resourceRead: r }) {
  const [s, n] = w(!1), { read: o, content: a, status: l } = r, c = o.name ?? o.uri, i = o.server;
  return /* @__PURE__ */ t("div", { className: `meso-resource meso-resource--${l}`, children: [
    /* @__PURE__ */ t("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ e($e, { status: l }),
      /* @__PURE__ */ e("span", { className: "meso-resource__uri", title: o.uri, children: c }),
      i && /* @__PURE__ */ e("span", { className: "meso-resource__server", children: i }),
      (a == null ? void 0 : a.duration_ms) !== void 0 && /* @__PURE__ */ t("span", { className: "meso-resource__duration", children: [
        a.duration_ms,
        "ms"
      ] }),
      (l === "done" || l === "error") && a && /* @__PURE__ */ t(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => n((m) => !m),
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
    s && a && /* @__PURE__ */ e("div", { className: "meso-resource__content", children: l === "error" ? /* @__PURE__ */ e("pre", { className: "meso-resource__text meso-resource__text--error", children: a.error }) : a.contents.map((m, d) => /* @__PURE__ */ t("div", { children: [
      m.type === "text" && /* @__PURE__ */ e("pre", { className: "meso-resource__text", children: m.text }),
      m.type === "image" && m.data && /* @__PURE__ */ e(
        "img",
        {
          className: "meso-resource__image",
          src: `data:${m.mime_type ?? "image/png"};base64,${m.data}`,
          alt: "resource"
        }
      ),
      m.type === "blob" && /* @__PURE__ */ t("span", { className: "meso-resource__blob-label", children: [
        "[",
        m.mime_type ?? "binary",
        "]"
      ] })
    ] }, d)) })
  ] });
}
function $e({ status: r }) {
  switch (r) {
    case "pending":
      return /* @__PURE__ */ e("span", { className: "meso-resource__spinner", "aria-label": "读取中" });
    case "done":
      return /* @__PURE__ */ e("svg", { className: "meso-resource__icon meso-resource__icon--done", width: "13", height: "13", viewBox: "0 0 13 13", fill: "none", "aria-label": "完成", children: /* @__PURE__ */ e("path", { d: "M2 7L5 10L11 4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) });
    case "error":
      return /* @__PURE__ */ t("svg", { className: "meso-resource__icon meso-resource__icon--error", width: "13", height: "13", viewBox: "0 0 13 13", fill: "none", "aria-label": "失败", children: [
        /* @__PURE__ */ e("circle", { cx: "6.5", cy: "6.5", r: "5.5", stroke: "currentColor", strokeWidth: "1.2" }),
        /* @__PURE__ */ e("path", { d: "M4.5 4.5l4 4M8.5 4.5l-4 4", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round" })
      ] });
  }
}
function Re(r) {
  return r === "html preview" ? { type: "html" } : r === "mermaid" ? { type: "mermaid" } : r === "markdown" ? { type: "markdown" } : r === "table" ? { type: "table" } : { type: "code", language: r };
}
function De({
  messages: r,
  streaming: s,
  onArtifactCopy: n,
  onArtifactDownload: o,
  onToolConfirm: a,
  onToolCancel: l,
  emptyState: c,
  emptyStateAlign: i = "center",
  className: m,
  renderExtension: d,
  renderLiveTrace: u,
  renderMarkdown: f,
  renderMermaid: p,
  highlightCode: N,
  hiddenArtifactLangs: y
}) {
  const b = $(null);
  R(() => {
    var h;
    (h = b.current) == null || h.scrollIntoView({ behavior: "smooth" });
  }, [r, s]);
  const v = r.length > 0 || s && s.status !== "idle";
  return /* @__PURE__ */ e("div", { className: `meso-message-list${m ? ` ${m}` : ""}`, children: /* @__PURE__ */ t("div", { className: "meso-message-list__inner", children: [
    !v && c && /* @__PURE__ */ e("div", { className: `meso-message-list__empty${i === "top" ? " meso-message-list__empty--top" : ""}`, children: c }),
    r.map((h) => /* @__PURE__ */ e(
      Q,
      {
        role: h.role,
        content: h.content,
        timestamp: h.timestamp,
        markdown: h.role === "assistant",
        renderMarkdown: f
      },
      h.id
    )),
    s && s.status !== "idle" && /* @__PURE__ */ e("div", { className: "meso-message-list__live", children: u ? u(s) : /* @__PURE__ */ t(T, { children: [
      (s.activeSoul || s.activeSkill) && /* @__PURE__ */ t("div", { className: "meso-message-list__context-row", children: [
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
      s.memorySnippets.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-chips", children: s.memorySnippets.map((h, k) => /* @__PURE__ */ t("span", { className: "meso-memory-chip", title: h.content, children: [
        "[",
        h.category,
        "] ",
        h.content
      ] }, k)) }),
      s.resourceReadOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__resources", children: s.resourceReadOrder.map((h) => {
        const k = s.resourceReads[h];
        return k ? /* @__PURE__ */ e(Se, { resourceRead: k }, h) : null;
      }) }),
      s.toolCallOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__tools", children: s.toolCallOrder.map((h) => {
        const k = s.toolCalls[h];
        return k ? /* @__PURE__ */ e(
          ne,
          {
            toolCall: k,
            onConfirm: a,
            onCancel: l
          },
          h
        ) : null;
      }) }),
      d && s.extensionLog.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__extensions", children: s.extensionLog.map((h, k) => /* @__PURE__ */ e(ee.Fragment, { children: d(h) }, k)) }),
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
          renderMarkdown: f
        }
      ),
      s.artifactOrder.map((h) => {
        const k = s.artifacts[h];
        if (!k || y != null && y.includes(k.lang)) return null;
        const { type: C, language: O } = Re(k.lang);
        return /* @__PURE__ */ e(
          he,
          {
            type: C,
            content: k.content,
            language: O,
            streaming: !k.done,
            onCopy: n,
            onDownload: o,
            renderMermaid: p,
            highlightCode: N,
            renderMarkdown: f
          },
          h
        );
      }),
      s.memorySaved.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-saved", children: s.memorySaved.map((h) => /* @__PURE__ */ t("span", { className: "meso-memory-saved__chip", title: h.preview, children: [
        /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        h.category,
        "]"
      ] }, h.id)) })
    ] }) }),
    /* @__PURE__ */ e("div", { ref: b })
  ] }) });
}
function Pe({
  value: r,
  onChange: s,
  onSubmit: n,
  onStop: o,
  streaming: a = !1,
  disabled: l = !1,
  placeholder: c = "输入消息… (Ctrl+Enter 发送，Enter 换行)",
  leadingSlot: i,
  trailingActions: m,
  maxRows: d = 8
}) {
  const u = $(null), f = 22, p = () => {
    const v = u.current;
    v && (v.style.height = "auto", v.style.height = Math.min(v.scrollHeight, f * d) + "px");
  };
  R(p, [r]);
  const N = (v) => {
    v.key === "Enter" && (v.ctrlKey || v.metaKey) && (v.preventDefault(), !l && !a && r.trim() && n());
  }, y = !l && !a && r.trim().length > 0, b = /* @__PURE__ */ e(
    "button",
    {
      className: `meso-composer__send${a ? " meso-composer__send--stop" : ""}`,
      onClick: a ? o : n,
      disabled: a ? !1 : !y,
      "aria-label": a ? "停止生成" : "发送",
      title: a ? "停止生成" : "Ctrl+Enter",
      children: a ? (
        /* Stop square */
        /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ e("rect", { x: "4", y: "4", width: "16", height: "16", rx: "2" }) })
      ) : (
        /* Send arrow */
        /* @__PURE__ */ t("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ e("line", { x1: "12", y1: "19", x2: "12", y2: "5" }),
          /* @__PURE__ */ e("polyline", { points: "5,12 12,5 19,12" })
        ] })
      )
    }
  );
  return /* @__PURE__ */ e("div", { className: "meso-composer", children: /* @__PURE__ */ t("div", { className: "meso-composer__box", children: [
    /* @__PURE__ */ e(
      "textarea",
      {
        ref: u,
        className: "meso-composer__textarea",
        value: r,
        onChange: (v) => {
          s(v.target.value), p();
        },
        onKeyDown: N,
        placeholder: c,
        rows: 1,
        disabled: l && !a,
        "aria-label": "消息输入框"
      }
    ),
    /* @__PURE__ */ t("div", { className: "meso-composer__toolbar", children: [
      /* @__PURE__ */ e("div", { className: "meso-composer__leading", children: i }),
      /* @__PURE__ */ e("span", { className: "meso-composer__hint", children: r.length > 0 && `${r.length} 字` }),
      /* @__PURE__ */ e("div", { className: "meso-composer__trailing", children: m ?? b })
    ] })
  ] }) });
}
function Oe(r) {
  const s = r.toolCallOrder.length + r.workflowRunOrder.reduce(
    (a, l) => {
      var c;
      return a + (((c = r.workflowRuns[l]) == null ? void 0 : c.nodeOrder.length) ?? 0);
    },
    0
  ), n = r.toolCallOrder.filter((a) => {
    var l;
    return ((l = r.toolCalls[a]) == null ? void 0 : l.status) === "error";
  }).length + r.workflowRunOrder.reduce((a, l) => {
    const c = r.workflowRuns[l];
    return c ? a + c.nodeOrder.filter((i) => {
      var m;
      return ((m = c.nodes[i]) == null ? void 0 : m.state) === "error";
    }).length : a;
  }, 0), o = [];
  return r.stages.length > 0 && o.push(`${r.stages.length} 阶段`), s > 0 && o.push(`${s} 步`), n > 0 && o.push(`${n} 项失败`), o.length > 0 ? o.join(" · ") : "执行过程";
}
function Ue({
  stream: r,
  streaming: s = !1,
  defaultCollapsed: n = !1,
  onToolConfirm: o,
  onToolCancel: a
}) {
  const [l, c] = w(n);
  if (!(!!r.thinkContent || r.stages.length > 0 || r.toolCallOrder.length > 0 || r.workflowRunOrder.length > 0)) return null;
  const m = Oe(r), d = r.workflowRunOrder.map((u) => r.workflowRuns[u]).filter(Boolean);
  return /* @__PURE__ */ t("div", { className: "meso-process-trace", children: [
    /* @__PURE__ */ t(
      "button",
      {
        className: "meso-process-trace__header",
        onClick: () => c((u) => !u),
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
          /* @__PURE__ */ e("span", { className: "meso-process-trace__summary", children: m }),
          s && /* @__PURE__ */ e("span", { className: "meso-process-trace__dot", "aria-label": "执行中" })
        ]
      }
    ),
    !l && /* @__PURE__ */ t("div", { className: "meso-process-trace__body", children: [
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
        const f = r.toolCalls[u];
        return f ? /* @__PURE__ */ e(
          ne,
          {
            toolCall: f,
            onConfirm: o,
            onCancel: a
          },
          u
        ) : null;
      }) }),
      d.length > 0 && /* @__PURE__ */ e(Ne, { runs: d })
    ] })
  ] });
}
function Ve({
  name: r,
  email: s,
  avatarText: n,
  menuItems: o = [],
  onSignOut: a
}) {
  const [l, c] = w(!1), i = $(null);
  R(() => {
    if (!l) return;
    const u = (f) => {
      i.current && !i.current.contains(f.target) && c(!1);
    };
    return document.addEventListener("mousedown", u), () => document.removeEventListener("mousedown", u);
  }, [l]);
  const m = n ?? r.charAt(0).toUpperCase(), d = [
    ...o,
    ...a ? [{ label: "退出登录", onClick: () => {
      c(!1), a();
    }, danger: !0 }] : []
  ];
  return /* @__PURE__ */ t("div", { className: "meso-user-menu", ref: i, children: [
    l && /* @__PURE__ */ t("div", { className: "meso-user-menu__popup", role: "menu", children: [
      /* @__PURE__ */ t("div", { className: "meso-user-menu__identity", children: [
        /* @__PURE__ */ e("span", { className: "meso-user-menu__identity-name", children: r }),
        s && /* @__PURE__ */ e("span", { className: "meso-user-menu__identity-email", children: s })
      ] }),
      d.length > 0 && /* @__PURE__ */ e("div", { className: "meso-user-menu__sep", role: "separator" }),
      d.map((u, f) => /* @__PURE__ */ t(
        "button",
        {
          className: `meso-user-menu__item${u.danger ? " meso-user-menu__item--danger" : ""}`,
          role: "menuitem",
          onClick: () => {
            c(!1), u.onClick();
          },
          children: [
            u.icon && /* @__PURE__ */ e("span", { className: "meso-user-menu__item-icon", children: u.icon }),
            u.label
          ]
        },
        f
      ))
    ] }),
    /* @__PURE__ */ t(
      "button",
      {
        className: "meso-user-menu__trigger",
        onClick: () => c((u) => !u),
        "aria-haspopup": "menu",
        "aria-expanded": l,
        title: r,
        children: [
          /* @__PURE__ */ e("div", { className: "meso-user-menu__avatar", children: m }),
          /* @__PURE__ */ t("div", { className: "meso-user-menu__info", children: [
            /* @__PURE__ */ e("span", { className: "meso-user-menu__name", children: r }),
            s && /* @__PURE__ */ e("span", { className: "meso-user-menu__email", children: s })
          ] })
        ]
      }
    )
  ] });
}
function Ke({
  tabs: r,
  activeTabId: s,
  onTabChange: n,
  autoSelectFirstReady: o = !1
}) {
  var f;
  const a = s !== void 0, [l, c] = w(((f = r[0]) == null ? void 0 : f.id) ?? ""), i = a ? s : l, m = $(!1);
  R(() => {
    if (!o || m.current) return;
    const p = r.find((N) => N.ready);
    p && (m.current = !0, a || c(p.id), n == null || n(p.id));
  }, [r, o, a, n]);
  const d = (p) => {
    a || c(p), n == null || n(p);
  }, u = r.find((p) => p.id === i) ?? r[0];
  return r.length === 0 ? null : /* @__PURE__ */ t("div", { className: "meso-artifact-shell", children: [
    /* @__PURE__ */ e("div", { className: "meso-artifact-shell__tabs", role: "tablist", children: r.map((p) => /* @__PURE__ */ t(
      "button",
      {
        role: "tab",
        "aria-selected": p.id === i,
        className: `meso-artifact-shell__tab${p.id === i ? " meso-artifact-shell__tab--active" : ""}`,
        onClick: () => d(p.id),
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
function We({
  status: r,
  size: s = 16,
  className: n,
  "aria-label": o
}) {
  const a = o ?? Be[r];
  return /* @__PURE__ */ t(
    "span",
    {
      className: `meso-status-icon meso-status-icon--${r}${n ? ` ${n}` : ""}`,
      style: { width: s, height: s },
      role: "img",
      "aria-label": a,
      children: [
        r === "running" && /* @__PURE__ */ t("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeDasharray: "3 3", className: "meso-status-icon__spin" }),
          /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "2.5", fill: "currentColor", className: "meso-status-icon__pulse" })
        ] }),
        r === "done" && /* @__PURE__ */ t("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ e("polyline", { points: "4.5,8 7,10.5 11.5,5.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
        ] }),
        r === "error" && /* @__PURE__ */ t("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ e("line", { x1: "5.5", y1: "5.5", x2: "10.5", y2: "10.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" }),
          /* @__PURE__ */ e("line", { x1: "10.5", y1: "5.5", x2: "5.5", y2: "10.5", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" })
        ] }),
        r === "pending" && /* @__PURE__ */ e("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "6.25", stroke: "currentColor", strokeWidth: "1.5" }) }),
        r === "warning" && /* @__PURE__ */ t("svg", { viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
          /* @__PURE__ */ e("circle", { cx: "8", cy: "8", r: "7", fill: "currentColor" }),
          /* @__PURE__ */ e("line", { x1: "8", y1: "5", x2: "8", y2: "9", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round" }),
          /* @__PURE__ */ e("circle", { cx: "8", cy: "11.5", r: "0.75", fill: "white" })
        ] })
      ]
    }
  );
}
function Ge({ status: r, primary: s, outcome: n, detail: o, className: a }) {
  const [l, c] = w(!1), i = o !== void 0 && o !== "";
  return /* @__PURE__ */ t("div", { className: `meso-log-line${a ? ` ${a}` : ""}`, children: [
    /* @__PURE__ */ t(
      "div",
      {
        className: `meso-log-line__row${i ? " meso-log-line__row--clickable" : ""}`,
        onClick: i ? () => c((m) => !m) : void 0,
        role: i ? "button" : void 0,
        tabIndex: i ? 0 : void 0,
        onKeyDown: i ? (m) => {
          (m.key === "Enter" || m.key === " ") && c((d) => !d);
        } : void 0,
        "aria-expanded": i ? l : void 0,
        children: [
          /* @__PURE__ */ e(We, { status: r, size: 14, className: "meso-log-line__icon" }),
          /* @__PURE__ */ e("span", { className: "meso-log-line__primary", children: s }),
          n && /* @__PURE__ */ e("span", { className: "meso-log-line__outcome", children: n }),
          i && /* @__PURE__ */ e(
            "svg",
            {
              className: `meso-log-line__chevron${l ? " meso-log-line__chevron--open" : ""}`,
              width: "12",
              height: "12",
              viewBox: "0 0 12 12",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "1.5",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              "aria-hidden": "true",
              children: /* @__PURE__ */ e("polyline", { points: "2.5,4.5 6,7.5 9.5,4.5" })
            }
          )
        ]
      }
    ),
    i && l && /* @__PURE__ */ e("pre", { className: "meso-log-line__detail", children: o })
  ] });
}
function Je(r, s) {
  const [n, o] = w(P), a = $(null), l = $(s);
  l.current = s;
  const c = D(() => {
    var d;
    (d = a.current) == null || d.abort(), o((u) => ({ ...u, status: "idle" }));
  }, []), i = D(() => {
    var d;
    (d = a.current) == null || d.abort(), o(P());
  }, []), m = D(async (d) => {
    var k, C, O, E, L, S, x, A, U, V, K, G, J, F, z, j, Y;
    (k = a.current) == null || k.abort();
    const u = new AbortController();
    a.current = u;
    const f = { ...P(), status: "streaming" };
    o(f);
    let p = f;
    const N = (d == null ? void 0 : d.method) ?? (d != null && d.body ? "POST" : "GET"), y = (d == null ? void 0 : d.watchdogMs) === void 0 ? 12e4 : d.watchdogMs;
    let b = null;
    const v = () => {
      b && clearTimeout(b);
    }, h = () => {
      v(), y != null && (b = setTimeout(() => {
        var W, I;
        u.abort();
        const B = `SSE stream timed out after ${y}ms of inactivity`;
        o((M) => ({ ...M, status: "error", errorMessage: B })), (I = (W = l.current) == null ? void 0 : W.onError) == null || I.call(W, B, "WATCHDOG_TIMEOUT");
      }, y));
    };
    try {
      const B = await fetch(r, {
        method: N,
        headers: {
          ...N === "POST" ? { "Content-Type": "application/json" } : {},
          ...d == null ? void 0 : d.headers
        },
        body: d != null && d.body ? JSON.stringify(d.body) : void 0,
        signal: u.signal
      });
      if (!B.ok) throw new Error(`HTTP ${B.status}`);
      const W = B.body.getReader(), I = new TextDecoder();
      let M = "";
      for (h(); ; ) {
        const { done: le, value: ie } = await W.read();
        if (le) break;
        h(), M += I.decode(ie, { stream: !0 });
        const Z = M.split(`
`);
        M = Z.pop() ?? "";
        for (const ce of Z) {
          const g = de(ce);
          if (!g) continue;
          const H = me(p, g);
          p = H, o(H);
          const _ = l.current;
          if (_)
            switch (g.type) {
              case "capabilities":
                (C = _.onCapabilities) == null || C.call(_, g.payload);
                break;
              case "stage":
                (O = _.onStageChange) == null || O.call(_, g.payload);
                break;
              case "memory":
                (E = _.onMemoryRecalled) == null || E.call(_, g.payload.snippets);
                break;
              case "memory_saved":
                (L = _.onMemorySaved) == null || L.call(_, g.payload);
                break;
              case "soul":
                (S = _.onSoulActivated) == null || S.call(_, g.payload);
                break;
              case "skill_active":
                (x = _.onSkillActivated) == null || x.call(_, g.payload);
                break;
              case "tool_call":
                (A = _.onToolCall) == null || A.call(_, g.payload);
                break;
              case "tool_result":
                (U = _.onToolResult) == null || U.call(_, g.payload);
                break;
              case "resource_read":
                (V = _.onResourceRead) == null || V.call(_, g.payload);
                break;
              case "resource_content":
                (K = _.onResourceContent) == null || K.call(_, g.payload);
                break;
              case "artifact": {
                const q = H.artifacts[g.payload.id];
                q && ((G = _.onArtifact) == null || G.call(_, q));
                break;
              }
              case "extension":
                (J = _.onExtensionEvent) == null || J.call(_, g);
                break;
              case "error":
                (F = _.onError) == null || F.call(_, g.payload.message, g.payload.code);
                break;
              case "done":
                (z = _.onDone) == null || z.call(_, H);
                break;
            }
          if (g.type === "done" || g.type === "error") {
            v();
            return;
          }
        }
      }
    } catch (B) {
      if (B.name === "AbortError") return;
      const W = B.message;
      o((I) => ({ ...I, status: "error", errorMessage: W })), (Y = (j = l.current) == null ? void 0 : j.onError) == null || Y.call(j, W);
    } finally {
      v();
    }
  }, [r]);
  return { state: n, start: m, abort: c, reset: i };
}
const ae = "meso-theme";
function Ee() {
  return typeof window > "u" ? "light" : localStorage.getItem(ae) ?? "light";
}
function Ae(r) {
  document.documentElement.setAttribute("data-theme", r), localStorage.setItem(ae, r);
}
function Fe() {
  const [r, s] = w(Ee);
  R(() => {
    Ae(r);
  }, [r]);
  const n = D(() => {
    s((o) => o === "light" ? "dark" : "light");
  }, []);
  return { theme: r, toggle: n };
}
function ze({
  system: r,
  resetOnTurnStart: s = !1
}) {
  const [n, o] = w(null), a = $(r);
  return R(() => {
    s && !a.current && r && o(null), a.current = r;
  }, [r, s]), {
    open: n !== null ? n : r,
    setOpen: (c) => o(c),
    toggle: () => o((c) => c !== null ? !c : !r),
    clearIntent: () => o(null),
    hasUserIntent: n !== null
  };
}
export {
  Ke as ArtifactPaneShell,
  he as ArtifactPanel,
  Q as ChatBubble,
  Pe as ChatComposer,
  ge as ConfirmGate,
  Ge as LogLine,
  De as MessageList,
  qe as PROTOCOL_VERSION,
  Ue as ProcessTrace,
  Se as ResourceReadBlock,
  Ve as SidebarUserMenu,
  Ce as SkillIndicator,
  xe as SoulIndicator,
  se as StageTimeline,
  We as StatusIcon,
  He as StreamingCursor,
  re as ThinkBlock,
  je as ThreeColumnLayout,
  ne as ToolCallBlock,
  Ne as WorkflowTimeline,
  me as applyEvent,
  Qe as assertCompatibleVersion,
  P as createInitialStreamState,
  Xe as createStreamStateWithArtifacts,
  er as isCompatibleVersion,
  de as parseSSELine,
  rr as stagePayloadToStage,
  sr as streamStateHasArtifacts,
  ze as useFoldState,
  Je as useSSEStream,
  Fe as useTheme
};
