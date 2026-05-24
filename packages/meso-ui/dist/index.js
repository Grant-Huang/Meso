import { jsxs as s, jsx as e, Fragment as E } from "react/jsx-runtime";
import z, { useState as b, useRef as $, useEffect as T, useCallback as j } from "react";
import { createInitialStreamState as V, parseSSELine as ae, applyEvent as se } from "./runtime.js";
import { PROTOCOL_VERSION as Ee, assertCompatibleVersion as Ie, isCompatibleVersion as Pe, stagePayloadToStage as He } from "./runtime.js";
function $e({
  navItems: r = [],
  sidebarFooter: a,
  sessionColumn: t,
  children: o,
  defaultCollapsed: l = !1,
  appName: n = "Meso",
  mainHeader: u,
  artifactPanel: h,
  defaultArtifactVisible: m = !1,
  onArtifactToggle: c
}) {
  const [_, f] = b(l), [N, k] = b(m), w = () => {
    const i = !N;
    k(i), c == null || c(i);
  };
  return /* @__PURE__ */ s("div", { className: "meso-layout", children: [
    /* @__PURE__ */ s("aside", { className: `meso-sidebar${_ ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ s("div", { className: "meso-sidebar__header", children: [
        /* @__PURE__ */ e("div", { className: "meso-sidebar__logo", children: n[0] }),
        /* @__PURE__ */ e("span", { className: "meso-sidebar__title", children: n }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => f(!_),
            "aria-label": _ ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ s("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ e("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ e("nav", { className: "meso-sidebar__nav", children: r.map((i) => /* @__PURE__ */ s(
        "div",
        {
          className: `meso-sidebar__nav-item${i.active ? " meso-sidebar__nav-item--active" : ""}`,
          onClick: i.onClick,
          title: i.label,
          children: [
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-icon", children: i.icon }),
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-label", children: i.label })
          ]
        },
        i.id
      )) }),
      a && /* @__PURE__ */ e("div", { className: "meso-sidebar__footer", children: a })
    ] }),
    /* @__PURE__ */ e("div", { className: "meso-session-col", children: t }),
    /* @__PURE__ */ s("main", { className: "meso-main", children: [
      /* @__PURE__ */ s("div", { className: "meso-main__header", children: [
        /* @__PURE__ */ e("div", { className: "meso-main__header-content", children: u }),
        /* @__PURE__ */ e(
          "button",
          {
            className: `meso-artifact-toggle${N ? " meso-artifact-toggle--active" : ""}`,
            onClick: w,
            title: N ? "关闭 Artifact" : "打开 Artifact",
            "aria-label": N ? "关闭 Artifact" : "打开 Artifact",
            children: N ? (
              /* X / close icon */
              /* @__PURE__ */ s("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ e("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                /* @__PURE__ */ e("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
              ] })
            ) : (
              /* Panel / artifact icon */
              /* @__PURE__ */ s("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", children: [
                /* @__PURE__ */ e("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                /* @__PURE__ */ e("line", { x1: "14", y1: "3", x2: "14", y2: "21" })
              ] })
            )
          }
        )
      ] }),
      /* @__PURE__ */ s("div", { className: "meso-main__content", children: [
        /* @__PURE__ */ e("div", { className: "meso-main__chat", children: o }),
        N && /* @__PURE__ */ s(E, { children: [
          /* @__PURE__ */ e("div", { className: "meso-artifact-divider", "aria-hidden": "true" }),
          /* @__PURE__ */ e("div", { className: "meso-artifact-pane", children: h })
        ] })
      ] })
    ] })
  ] });
}
function K({
  role: r,
  content: a,
  streaming: t = !1,
  timestamp: o,
  markdown: l = !1,
  renderMarkdown: n
}) {
  const u = l && typeof n == "function";
  return /* @__PURE__ */ s("div", { className: `meso-bubble meso-bubble--${r}`, children: [
    r === "assistant" && /* @__PURE__ */ e("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ s("div", { className: "meso-bubble__body", children: [
      u ? /* @__PURE__ */ e(
        "div",
        {
          className: "meso-bubble__content meso-bubble__md",
          dangerouslySetInnerHTML: { __html: n(a) }
        }
      ) : /* @__PURE__ */ s("div", { className: "meso-bubble__content", children: [
        a.split(`
`).map((h, m) => /* @__PURE__ */ s(z.Fragment, { children: [
          m > 0 && /* @__PURE__ */ e("br", {}),
          h
        ] }, m)),
        t && /* @__PURE__ */ e("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      o && /* @__PURE__ */ e("div", { className: "meso-bubble__timestamp", children: o })
    ] })
  ] });
}
function oe({ content: r, streaming: a = !1, autoCollapseDelay: t = 1500 }) {
  const [o, l] = b(!0), n = $(a);
  return T(() => {
    if (n.current && !a) {
      const u = setTimeout(() => l(!1), t);
      return () => clearTimeout(u);
    }
    n.current = a;
  }, [a, t]), /* @__PURE__ */ s("div", { className: `meso-think${o ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ s(
      "button",
      {
        className: "meso-think__header",
        onClick: () => l(!o),
        "aria-expanded": o,
        children: [
          /* @__PURE__ */ e("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ e("span", { className: "meso-think__label", children: "思考过程" }),
          a && /* @__PURE__ */ e("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { className: "meso-think__body", children: /* @__PURE__ */ s("div", { className: "meso-think__content", children: [
      r,
      a && /* @__PURE__ */ e("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function Oe({ active: r = !0 }) {
  return r ? /* @__PURE__ */ e("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function te(r) {
  try {
    const a = JSON.parse(r);
    return Array.isArray(a.headers) && Array.isArray(a.rows) ? a : null;
  } catch {
    return null;
  }
}
function ne({
  type: r,
  content: a,
  language: t = "plaintext",
  streaming: o = !1,
  onCopy: l,
  onDownload: n,
  renderMermaid: u,
  highlightCode: h,
  renderMarkdown: m
}) {
  const [c, _] = b(!1), [f, N] = b(r), [k, w] = b(null), [i, p] = b(!1), [y, C] = b(null), x = $("");
  T(() => {
    N(r);
  }, [r]), T(() => {
    r !== "mermaid" || o || !u || a === x.current || (x.current = a, w(null), p(!1), u(a).then((g) => w(g)).catch(() => p(!0)));
  }, [r, o, a, u]), T(() => {
    r !== "code" || o || !h || a === x.current && y || (x.current = a, C(h(a, t)));
  }, [r, o, a, t, h, y]);
  const O = () => {
    navigator.clipboard.writeText(a).catch(() => {
    }), _(!0), setTimeout(() => _(!1), 2e3), l == null || l(a);
  }, R = () => {
    if (n) {
      n(a);
      return;
    }
    const g = {
      html: "html",
      mermaid: "md",
      markdown: "md",
      table: "json",
      code: t || "txt"
    }, A = new Blob([a], { type: "text/plain" }), L = document.createElement("a");
    L.href = URL.createObjectURL(A), L.download = `artifact.${g[r]}`, L.click(), URL.revokeObjectURL(L.href);
  };
  return /* @__PURE__ */ s("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ s("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ e("div", { className: "meso-artifact__tabs", children: (r === "html" ? ["html", "code"] : [r]).map((g) => /* @__PURE__ */ e(
        "span",
        {
          className: `meso-artifact__tab${f === g ? " meso-artifact__tab--active" : ""}`,
          onClick: () => N(g),
          children: le(g, t)
        },
        g
      )) }),
      o && /* @__PURE__ */ e("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ e("button", { className: "meso-artifact__download-btn", onClick: R, title: "下载", "aria-label": "下载文件", children: /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) }) }),
      /* @__PURE__ */ e("button", { className: "meso-artifact__copy-btn", onClick: O, title: "复制", "aria-label": "复制代码", children: c ? /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ s("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ e("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
      ] }) })
    ] }),
    /* @__PURE__ */ s("div", { className: "meso-artifact__body", children: [
      f === "html" && /* @__PURE__ */ e("iframe", { className: "meso-artifact__preview", srcDoc: a, sandbox: "allow-scripts", title: "HTML 预览" }),
      f === "mermaid" && /* @__PURE__ */ s(E, { children: [
        o && /* @__PURE__ */ s("pre", { className: "meso-artifact__code", children: [
          /* @__PURE__ */ e("code", { children: a }),
          /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
        ] }),
        !o && k && /* @__PURE__ */ e(
          "div",
          {
            className: "meso-artifact__mermaid",
            dangerouslySetInnerHTML: { __html: k }
          }
        ),
        !o && !k && !i && !u && /* @__PURE__ */ s("div", { className: "meso-artifact__mermaid-placeholder", children: [
          /* @__PURE__ */ e("span", { children: "图表预览需要集成 Mermaid 渲染器" }),
          /* @__PURE__ */ e("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ e("code", { children: a }) })
        ] }),
        !o && i && /* @__PURE__ */ s("div", { className: "meso-artifact__mermaid-placeholder meso-artifact__mermaid-placeholder--error", children: [
          /* @__PURE__ */ e("span", { children: "图表渲染失败，请检查语法" }),
          /* @__PURE__ */ e("pre", { className: "meso-artifact__code", style: { flex: 1 }, children: /* @__PURE__ */ e("code", { children: a }) })
        ] }),
        !o && !k && !i && u && /* @__PURE__ */ e("div", { className: "meso-artifact__mermaid-placeholder", children: /* @__PURE__ */ e("span", { children: "渲染中…" }) })
      ] }),
      f === "markdown" && /* @__PURE__ */ e(E, { children: m ? /* @__PURE__ */ e(
        "div",
        {
          className: "meso-artifact__markdown",
          dangerouslySetInnerHTML: { __html: m(a) }
        }
      ) : /* @__PURE__ */ s("pre", { className: "meso-artifact__code", children: [
        /* @__PURE__ */ e("code", { children: a }),
        o && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] }) }),
      f === "table" && /* @__PURE__ */ e(ie, { content: a, streaming: o }),
      (f === "code" || f === "html" && !1) && /* @__PURE__ */ s("pre", { className: "meso-artifact__code", children: [
        y && !o ? /* @__PURE__ */ e("code", { dangerouslySetInnerHTML: { __html: y } }) : /* @__PURE__ */ e("code", { children: a }),
        o && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
      ] })
    ] })
  ] });
}
function ie({ content: r, streaming: a }) {
  const t = te(r);
  return t ? /* @__PURE__ */ e("div", { className: "meso-artifact__table-wrap", children: /* @__PURE__ */ s("table", { className: "meso-artifact__table", children: [
    /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: t.headers.map((o, l) => /* @__PURE__ */ e("th", { children: o }, l)) }) }),
    /* @__PURE__ */ e("tbody", { children: t.rows.map((o, l) => /* @__PURE__ */ e("tr", { children: o.map((n, u) => /* @__PURE__ */ e("td", { children: String(n) }, u)) }, l)) })
  ] }) }) : /* @__PURE__ */ s("pre", { className: "meso-artifact__code", children: [
    /* @__PURE__ */ e("code", { children: r }),
    a && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
  ] });
}
function le(r, a) {
  return r === "html" ? "HTML 预览" : r === "mermaid" ? "图表" : r === "markdown" ? "Markdown" : r === "table" ? "表格" : a || "Code";
}
function ce({ stages: r, compact: a = !1 }) {
  return r.length === 0 ? null : /* @__PURE__ */ e("div", { className: `meso-stages${a ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: r.map((t, o) => /* @__PURE__ */ s(
    "div",
    {
      className: `meso-stage meso-stage--${t.status}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-stage__dot", children: t.status === "done" ? /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,5.5 4,8 8.5,2.5" }) }) : t.status === "error" ? /* @__PURE__ */ s("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", children: [
          /* @__PURE__ */ e("line", { x1: "2", y1: "2", x2: "8", y2: "8" }),
          /* @__PURE__ */ e("line", { x1: "8", y1: "2", x2: "2", y2: "8" })
        ] }) : /* @__PURE__ */ e("span", { className: "meso-stage__dot-inner" }) }),
        o < r.length - 1 && /* @__PURE__ */ e("div", { className: `meso-stage__line${t.status === "done" ? " meso-stage__line--done" : ""}` }),
        /* @__PURE__ */ e("span", { className: `meso-stage__label${a ? " meso-stage__label--compact" : ""}`, children: t.label })
      ]
    },
    t.id
  )) });
}
function de(r) {
  const { nodes: a, nodeOrder: t } = r, o = /* @__PURE__ */ new Map();
  for (const h of t) {
    const m = a[h];
    if (!m) continue;
    const c = m.parent_id ?? null;
    o.has(c) || o.set(c, []), o.get(c).push(h);
  }
  const l = /* @__PURE__ */ new Map();
  for (const [, h] of o)
    if (h.length > 1)
      for (const m of h) l.set(m, h);
  const n = [], u = /* @__PURE__ */ new Set();
  for (const h of t) {
    if (u.has(h)) continue;
    const m = a[h];
    if (!m) continue;
    const c = l.get(h);
    if (c) {
      const _ = c.map((f) => a[f]).filter((f) => !!f);
      for (const f of _) u.add(f.node_id);
      n.push({ kind: "parallel", nodes: _, isLast: !1 });
    } else
      u.add(h), n.push({ kind: "node", node: m, isLast: !1 });
  }
  return n.length > 0 && (n[n.length - 1] = { ...n[n.length - 1], isLast: !0 }), n;
}
function Z({ state: r }) {
  return r === "done" ? /* @__PURE__ */ e("svg", { className: "meso-wf-node__icon meso-wf-node__icon--done", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,6.5 4.5,9.5 10.5,3" }) }) : r === "error" ? /* @__PURE__ */ s("svg", { className: "meso-wf-node__icon meso-wf-node__icon--error", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ e("line", { x1: "2", y1: "2", x2: "10", y2: "10" }),
    /* @__PURE__ */ e("line", { x1: "10", y1: "2", x2: "2", y2: "10" })
  ] }) : r === "skipped" ? /* @__PURE__ */ e("svg", { className: "meso-wf-node__icon meso-wf-node__icon--skipped", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ e("line", { x1: "2", y1: "6", x2: "10", y2: "6" }) }) : /* @__PURE__ */ e("span", { className: "meso-wf-node__spinner", "aria-hidden": "true" });
}
function q(r) {
  return r < 1e3 ? `${r}ms` : `${(r / 1e3).toFixed(1)}s`;
}
function me({ node: r, isLast: a }) {
  var n;
  const [t, o] = b(!1), l = r.metadata && Object.keys(r.metadata).length > 0;
  return /* @__PURE__ */ s("div", { className: `meso-wf-node meso-wf-node--${r.state}`, children: [
    /* @__PURE__ */ s("div", { className: "meso-wf-node__track", children: [
      /* @__PURE__ */ e("div", { className: "meso-wf-node__dot", children: /* @__PURE__ */ e(Z, { state: r.state }) }),
      !a && /* @__PURE__ */ e("div", { className: "meso-wf-node__line" })
    ] }),
    /* @__PURE__ */ s("div", { className: "meso-wf-node__body", children: [
      /* @__PURE__ */ s("div", { className: "meso-wf-node__header", children: [
        /* @__PURE__ */ e("code", { className: "meso-wf-node__name", children: r.name }),
        r.duration_ms !== void 0 && /* @__PURE__ */ e("span", { className: "meso-wf-node__duration", children: q(r.duration_ms) }),
        l && /* @__PURE__ */ e(
          "button",
          {
            className: "meso-wf-node__expand",
            onClick: () => o((u) => !u),
            "aria-expanded": t,
            "aria-label": t ? "收起详情" : "展开详情",
            children: /* @__PURE__ */ e("svg", { viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", style: { transform: t ? "rotate(180deg)" : void 0 }, children: /* @__PURE__ */ e("polyline", { points: "2,3.5 5,6.5 8,3.5" }) })
          }
        )
      ] }),
      r.state === "error" && !!((n = r.metadata) != null && n.error) && /* @__PURE__ */ e("div", { className: "meso-wf-node__error", children: String(r.metadata.error) }),
      t && l && /* @__PURE__ */ e("pre", { className: "meso-wf-node__meta", children: JSON.stringify(r.metadata, null, 2) })
    ] })
  ] });
}
function he({ nodes: r, isLast: a }) {
  return /* @__PURE__ */ s("div", { className: "meso-wf-parallel", children: [
    /* @__PURE__ */ e("div", { className: "meso-wf-parallel__row", children: r.map((t, o) => {
      var l;
      return /* @__PURE__ */ s("div", { className: `meso-wf-parallel__branch meso-wf-parallel__branch--${t.state}`, children: [
        /* @__PURE__ */ e("div", { className: "meso-wf-parallel__branch-dot", children: /* @__PURE__ */ e(Z, { state: t.state }) }),
        /* @__PURE__ */ s("div", { className: "meso-wf-parallel__branch-body", children: [
          /* @__PURE__ */ s("div", { className: "meso-wf-parallel__branch-label", children: [
            "并行分支 ",
            String.fromCharCode(65 + o)
          ] }),
          /* @__PURE__ */ e("code", { className: "meso-wf-node__name", children: t.name }),
          t.state === "error" && !!((l = t.metadata) != null && l.error) && /* @__PURE__ */ e("div", { className: "meso-wf-node__error", children: String(t.metadata.error) }),
          t.duration_ms !== void 0 && /* @__PURE__ */ e("span", { className: "meso-wf-node__duration", style: { display: "block", marginTop: 2 }, children: q(t.duration_ms) })
        ] })
      ] }, t.node_id);
    }) }),
    !a && /* @__PURE__ */ e("div", { className: "meso-wf-parallel__merge" })
  ] });
}
function Re({ runs: r, showRunId: a = !0 }) {
  if (r.length === 0) return null;
  const t = r.length > 1;
  return /* @__PURE__ */ e("div", { className: "meso-wf", role: "status", "aria-label": "工作流进度", children: r.map((o) => {
    const l = de(o);
    return /* @__PURE__ */ s("div", { className: "meso-wf-run", children: [
      t && a && /* @__PURE__ */ e("div", { className: "meso-wf-run__label", children: o.run_id }),
      l.map(
        (n, u) => n.kind === "parallel" ? /* @__PURE__ */ e(he, { nodes: n.nodes, isLast: n.isLast }, `parallel-${u}`) : /* @__PURE__ */ e(me, { node: n.node, isLast: n.isLast }, n.node.node_id)
      )
    ] }, o.run_id);
  }) });
}
const ue = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function _e({ toolCall: r, onConfirm: a, onCancel: t }) {
  const o = r.risk ?? "safe", l = ue[o], n = Object.keys(r.args).length > 0;
  return /* @__PURE__ */ s("div", { className: `meso-confirm-gate meso-confirm-gate--${o}`, role: "alertdialog", "aria-label": "工具执行确认", children: [
    /* @__PURE__ */ e("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ s("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ e("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ e("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ s("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ s("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ e("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${o}`, children: l.label }),
        /* @__PURE__ */ e("code", { className: "meso-confirm-gate__tool-name", children: r.name })
      ] }),
      n && /* @__PURE__ */ e("pre", { className: "meso-confirm-gate__args", children: JSON.stringify(r.args, null, 2) }),
      /* @__PURE__ */ s("div", { className: "meso-confirm-gate__actions", children: [
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
            onClick: () => a(r.id),
            children: l.confirmText
          }
        )
      ] })
    ] })
  ] });
}
const fe = {
  safe: "只读",
  write: "写入",
  destructive: "危险"
}, Y = {
  mcp: "MCP",
  api: "API",
  local: "本地"
};
function pe({ toolCall: r, onConfirm: a, onCancel: t }) {
  var N;
  const [o, l] = b(!1), [n, u] = b(!1), { call: h, result: m, status: c } = r, _ = h.risk ?? "safe", f = Object.keys(h.args).length > 0;
  return /* @__PURE__ */ s("div", { className: `meso-tool meso-tool--${c} meso-tool--risk-${_}`, children: [
    /* @__PURE__ */ s("div", { className: "meso-tool__header", children: [
      /* @__PURE__ */ e(ve, { status: c }),
      /* @__PURE__ */ e("span", { className: "meso-tool__name", children: h.name }),
      h.provider && Y[h.provider] && /* @__PURE__ */ e("span", { className: `meso-tool__provider meso-tool__provider--${h.provider}`, children: Y[h.provider] }),
      ((N = h.annotations) == null ? void 0 : N.open_world) && /* @__PURE__ */ e("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", children: "🌐" }),
      _ !== "safe" && /* @__PURE__ */ e("span", { className: `meso-tool__risk meso-tool__risk--${_}`, children: fe[_] }),
      (m == null ? void 0 : m.duration_ms) !== void 0 && /* @__PURE__ */ s("span", { className: "meso-tool__duration", children: [
        m.duration_ms,
        "ms"
      ] }),
      f && /* @__PURE__ */ s(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => l((k) => !k),
          "aria-expanded": o,
          "aria-label": o ? "折叠参数" : "展开参数",
          children: [
            o ? "▾" : "▸",
            " 参数"
          ]
        }
      )
    ] }),
    o && f && /* @__PURE__ */ e("pre", { className: "meso-tool__args", children: JSON.stringify(h.args, null, 2) }),
    c === "awaiting_confirm" && a && t && /* @__PURE__ */ e(
      _e,
      {
        toolCall: h,
        onConfirm: a,
        onCancel: t
      }
    ),
    (c === "done" || c === "error") && m && /* @__PURE__ */ s("div", { className: "meso-tool__result", children: [
      /* @__PURE__ */ s(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => u((k) => !k),
          "aria-expanded": n,
          "aria-label": n ? "折叠结果" : "展开结果",
          children: [
            n ? "▾" : "▸",
            " ",
            c === "error" ? "错误" : "结果"
          ]
        }
      ),
      n && /* @__PURE__ */ e("pre", { className: `meso-tool__output${c === "error" ? " meso-tool__output--error" : ""}`, children: c === "error" ? m.error : m.output })
    ] })
  ] });
}
function ve({ status: r }) {
  switch (r) {
    case "pending":
    case "running":
      return /* @__PURE__ */ e("span", { className: "meso-tool__spinner", "aria-label": "执行中" });
    case "awaiting_confirm":
      return /* @__PURE__ */ s("svg", { className: "meso-tool__icon meso-tool__icon--warn", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "等待确认", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M7 4v4M7 10v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
      ] });
    case "done":
      return /* @__PURE__ */ s("svg", { className: "meso-tool__icon meso-tool__icon--done", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "完成", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("polyline", { points: "4,7 6,9.5 10,4.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
      ] });
    case "error":
      return /* @__PURE__ */ s("svg", { className: "meso-tool__icon meso-tool__icon--error", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "失败", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M5 5l4 4M9 5l-4 4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
      ] });
  }
}
function Ne({ soul: r, compact: a = !1 }) {
  const t = r.name.charAt(0);
  return /* @__PURE__ */ s(
    "div",
    {
      className: `meso-soul${a ? " meso-soul--compact" : ""}`,
      title: `${r.name} v${r.version}`,
      role: "status",
      "aria-label": `当前 Soul: ${r.name}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-soul__avatar", children: r.avatar ? /* @__PURE__ */ e("img", { src: r.avatar, alt: r.name, className: "meso-soul__img" }) : /* @__PURE__ */ e("span", { className: "meso-soul__initial", children: t }) }),
        !a && /* @__PURE__ */ s(E, { children: [
          /* @__PURE__ */ e("span", { className: "meso-soul__name", children: r.name }),
          r.traits && r.traits.length > 0 && /* @__PURE__ */ e("div", { className: "meso-soul__traits", children: r.traits.map((o) => /* @__PURE__ */ e("span", { className: "meso-soul__trait", children: o }, o)) })
        ] })
      ]
    }
  );
}
const ke = {
  mcp: "MCP",
  api: "API"
};
function be({ skill: r }) {
  const a = r.provider ? ke[r.provider] : null;
  return /* @__PURE__ */ s(
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
        r.focus && r.focus.length > 0 && /* @__PURE__ */ s("span", { className: "meso-skill__focus", children: [
          "· ",
          r.focus.join(", ")
        ] }),
        a && /* @__PURE__ */ e("span", { className: "meso-skill__provider", children: a })
      ]
    }
  );
}
function ge({ resourceRead: r }) {
  const [a, t] = b(!1), { read: o, content: l, status: n } = r, u = o.name ?? o.uri, h = o.server;
  return /* @__PURE__ */ s("div", { className: `meso-resource meso-resource--${n}`, children: [
    /* @__PURE__ */ s("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ e(we, { status: n }),
      /* @__PURE__ */ e("span", { className: "meso-resource__uri", title: o.uri, children: u }),
      h && /* @__PURE__ */ e("span", { className: "meso-resource__server", children: h }),
      (l == null ? void 0 : l.duration_ms) !== void 0 && /* @__PURE__ */ s("span", { className: "meso-resource__duration", children: [
        l.duration_ms,
        "ms"
      ] }),
      (n === "done" || n === "error") && l && /* @__PURE__ */ s(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => t((m) => !m),
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
    a && l && /* @__PURE__ */ e("div", { className: "meso-resource__content", children: n === "error" ? /* @__PURE__ */ e("pre", { className: "meso-resource__text meso-resource__text--error", children: l.error }) : l.contents.map((m, c) => /* @__PURE__ */ s("div", { children: [
      m.type === "text" && /* @__PURE__ */ e("pre", { className: "meso-resource__text", children: m.text }),
      m.type === "image" && m.data && /* @__PURE__ */ e(
        "img",
        {
          className: "meso-resource__image",
          src: `data:${m.mime_type ?? "image/png"};base64,${m.data}`,
          alt: "resource"
        }
      ),
      m.type === "blob" && /* @__PURE__ */ s("span", { className: "meso-resource__blob-label", children: [
        "[",
        m.mime_type ?? "binary",
        "]"
      ] })
    ] }, c)) })
  ] });
}
function we({ status: r }) {
  switch (r) {
    case "pending":
      return /* @__PURE__ */ e("span", { className: "meso-resource__spinner", "aria-label": "读取中" });
    case "done":
      return /* @__PURE__ */ e("svg", { className: "meso-resource__icon meso-resource__icon--done", width: "13", height: "13", viewBox: "0 0 13 13", fill: "none", "aria-label": "完成", children: /* @__PURE__ */ e("path", { d: "M2 7L5 10L11 4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) });
    case "error":
      return /* @__PURE__ */ s("svg", { className: "meso-resource__icon meso-resource__icon--error", width: "13", height: "13", viewBox: "0 0 13 13", fill: "none", "aria-label": "失败", children: [
        /* @__PURE__ */ e("circle", { cx: "6.5", cy: "6.5", r: "5.5", stroke: "currentColor", strokeWidth: "1.2" }),
        /* @__PURE__ */ e("path", { d: "M4.5 4.5l4 4M8.5 4.5l-4 4", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round" })
      ] });
  }
}
function ye(r) {
  return r === "html preview" ? { type: "html" } : r === "mermaid" ? { type: "mermaid" } : r === "markdown" ? { type: "markdown" } : r === "table" ? { type: "table" } : { type: "code", language: r };
}
function Ae({
  messages: r,
  streaming: a,
  onArtifactCopy: t,
  onArtifactDownload: o,
  onToolConfirm: l,
  onToolCancel: n,
  emptyState: u,
  emptyStateAlign: h = "center",
  className: m,
  renderExtension: c,
  renderMarkdown: _,
  renderMermaid: f,
  highlightCode: N
}) {
  const k = $(null);
  T(() => {
    var i;
    (i = k.current) == null || i.scrollIntoView({ behavior: "smooth" });
  }, [r, a]);
  const w = r.length > 0 || a && a.status !== "idle";
  return /* @__PURE__ */ e("div", { className: `meso-message-list${m ? ` ${m}` : ""}`, children: /* @__PURE__ */ s("div", { className: "meso-message-list__inner", children: [
    !w && u && /* @__PURE__ */ e("div", { className: `meso-message-list__empty${h === "top" ? " meso-message-list__empty--top" : ""}`, children: u }),
    r.map((i) => /* @__PURE__ */ e(
      K,
      {
        role: i.role,
        content: i.content,
        timestamp: i.timestamp,
        markdown: i.role === "assistant",
        renderMarkdown: _
      },
      i.id
    )),
    a && a.status !== "idle" && /* @__PURE__ */ s("div", { className: "meso-message-list__live", children: [
      (a.activeSoul || a.activeSkill) && /* @__PURE__ */ s("div", { className: "meso-message-list__context-row", children: [
        a.activeSoul && /* @__PURE__ */ e(Ne, { soul: a.activeSoul }),
        a.activeSkill && /* @__PURE__ */ e(be, { skill: a.activeSkill })
      ] }),
      a.stages.length > 0 && /* @__PURE__ */ e(
        ce,
        {
          stages: a.stages.map((i) => ({
            id: i.name,
            label: i.name,
            status: i.state === "done" || i.state === "error" ? "done" : "active"
          }))
        }
      ),
      a.memorySnippets.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-chips", children: a.memorySnippets.map((i, p) => /* @__PURE__ */ s("span", { className: "meso-memory-chip", title: i.content, children: [
        "[",
        i.category,
        "] ",
        i.content
      ] }, p)) }),
      a.resourceReadOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__resources", children: a.resourceReadOrder.map((i) => {
        const p = a.resourceReads[i];
        return p ? /* @__PURE__ */ e(ge, { resourceRead: p }, i) : null;
      }) }),
      a.toolCallOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__tools", children: a.toolCallOrder.map((i) => {
        const p = a.toolCalls[i];
        return p ? /* @__PURE__ */ e(
          pe,
          {
            toolCall: p,
            onConfirm: l,
            onCancel: n
          },
          i
        ) : null;
      }) }),
      c && a.extensionLog.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__extensions", children: a.extensionLog.map((i, p) => /* @__PURE__ */ e(z.Fragment, { children: c(i) }, p)) }),
      a.thinkContent && /* @__PURE__ */ e(
        oe,
        {
          content: a.thinkContent,
          streaming: !a.thinkDone
        }
      ),
      (a.textContent || a.status === "streaming") && /* @__PURE__ */ e(
        K,
        {
          role: "assistant",
          content: a.textContent,
          streaming: a.status === "streaming" && a.artifactOrder.length === 0,
          markdown: !0,
          renderMarkdown: _
        }
      ),
      a.artifactOrder.map((i) => {
        const p = a.artifacts[i];
        if (!p) return null;
        const { type: y, language: C } = ye(p.lang);
        return /* @__PURE__ */ e(
          ne,
          {
            type: y,
            content: p.content,
            language: C,
            streaming: !p.done,
            onCopy: t,
            onDownload: o,
            renderMermaid: f,
            highlightCode: N,
            renderMarkdown: _
          },
          i
        );
      }),
      a.memorySaved.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-saved", children: a.memorySaved.map((i) => /* @__PURE__ */ s("span", { className: "meso-memory-saved__chip", title: i.preview, children: [
        /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        i.category,
        "]"
      ] }, i.id)) })
    ] }),
    /* @__PURE__ */ e("div", { ref: k })
  ] }) });
}
function Be(r, a) {
  const [t, o] = b(V), l = $(null), n = $(a);
  n.current = a;
  const u = j(() => {
    var c;
    (c = l.current) == null || c.abort(), o((_) => ({ ..._, status: "idle" }));
  }, []), h = j(() => {
    var c;
    (c = l.current) == null || c.abort(), o(V());
  }, []), m = j(async (c) => {
    var w, i, p, y, C, x, O, R, I, g, A, L, D, G, B, J;
    (w = l.current) == null || w.abort();
    const _ = new AbortController();
    l.current = _;
    const f = { ...V(), status: "streaming" };
    o(f);
    let N = f;
    const k = (c == null ? void 0 : c.method) ?? (c != null && c.body ? "POST" : "GET");
    try {
      const S = await fetch(r, {
        method: k,
        headers: {
          ...k === "POST" ? { "Content-Type": "application/json" } : {},
          ...c == null ? void 0 : c.headers
        },
        body: c != null && c.body ? JSON.stringify(c.body) : void 0,
        signal: _.signal
      });
      if (!S.ok) throw new Error(`HTTP ${S.status}`);
      const M = S.body.getReader(), P = new TextDecoder();
      let H = "";
      for (; ; ) {
        const { done: X, value: ee } = await M.read();
        if (X) break;
        H += P.decode(ee, { stream: !0 });
        const U = H.split(`
`);
        H = U.pop() ?? "";
        for (const re of U) {
          const v = ae(re);
          if (!v) continue;
          const W = se(N, v);
          N = W, o(W);
          const d = n.current;
          if (d)
            switch (v.type) {
              case "capabilities":
                (i = d.onCapabilities) == null || i.call(d, v.payload);
                break;
              case "stage":
                (p = d.onStageChange) == null || p.call(d, v.payload);
                break;
              case "memory":
                (y = d.onMemoryRecalled) == null || y.call(d, v.payload.snippets);
                break;
              case "memory_saved":
                (C = d.onMemorySaved) == null || C.call(d, v.payload);
                break;
              case "soul":
                (x = d.onSoulActivated) == null || x.call(d, v.payload);
                break;
              case "skill_active":
                (O = d.onSkillActivated) == null || O.call(d, v.payload);
                break;
              case "tool_call":
                (R = d.onToolCall) == null || R.call(d, v.payload);
                break;
              case "tool_result":
                (I = d.onToolResult) == null || I.call(d, v.payload);
                break;
              case "resource_read":
                (g = d.onResourceRead) == null || g.call(d, v.payload);
                break;
              case "resource_content":
                (A = d.onResourceContent) == null || A.call(d, v.payload);
                break;
              case "artifact": {
                const F = W.artifacts[v.payload.id];
                F && ((L = d.onArtifact) == null || L.call(d, F));
                break;
              }
              case "error":
                (D = d.onError) == null || D.call(d, v.payload.message, v.payload.code);
                break;
              case "done":
                (G = d.onDone) == null || G.call(d, W);
                break;
            }
          if (v.type === "done" || v.type === "error") return;
        }
      }
    } catch (S) {
      if (S.name === "AbortError") return;
      const M = S.message;
      o((P) => ({ ...P, status: "error", errorMessage: M })), (J = (B = n.current) == null ? void 0 : B.onError) == null || J.call(B, M);
    }
  }, [r]);
  return { state: t, start: m, abort: u, reset: h };
}
const Q = "meso-theme";
function xe() {
  return typeof window > "u" ? "light" : localStorage.getItem(Q) ?? "light";
}
function Le(r) {
  document.documentElement.setAttribute("data-theme", r), localStorage.setItem(Q, r);
}
function Me() {
  const [r, a] = b(xe);
  T(() => {
    Le(r);
  }, [r]);
  const t = j(() => {
    a((o) => o === "light" ? "dark" : "light");
  }, []);
  return { theme: r, toggle: t };
}
export {
  ne as ArtifactPanel,
  K as ChatBubble,
  _e as ConfirmGate,
  Ae as MessageList,
  Ee as PROTOCOL_VERSION,
  ge as ResourceReadBlock,
  be as SkillIndicator,
  Ne as SoulIndicator,
  ce as StageTimeline,
  Oe as StreamingCursor,
  oe as ThinkBlock,
  $e as ThreeColumnLayout,
  pe as ToolCallBlock,
  Re as WorkflowTimeline,
  se as applyEvent,
  Ie as assertCompatibleVersion,
  V as createInitialStreamState,
  Pe as isCompatibleVersion,
  ae as parseSSELine,
  He as stagePayloadToStage,
  Be as useSSEStream,
  Me as useTheme
};
