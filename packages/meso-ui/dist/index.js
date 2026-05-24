import { jsxs as s, jsx as e, Fragment as X } from "react/jsx-runtime";
import Y, { useState as k, useRef as C, useEffect as R, useCallback as L } from "react";
import { createInitialStreamState as T, parseSSELine as ee, applyEvent as re } from "./runtime.js";
import { PROTOCOL_VERSION as We, assertCompatibleVersion as Ae, isCompatibleVersion as Ee, stagePayloadToStage as je } from "./runtime.js";
function Le({
  navItems: r = [],
  sidebarFooter: o,
  sessionColumn: i,
  children: a,
  defaultCollapsed: d = !1,
  appName: l = "Meso",
  mainHeader: _
}) {
  const [m, h] = k(d);
  return /* @__PURE__ */ s("div", { className: "meso-layout", children: [
    /* @__PURE__ */ s("aside", { className: `meso-sidebar${m ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ s("div", { className: "meso-sidebar__header", children: [
        /* @__PURE__ */ e("div", { className: "meso-sidebar__logo", children: l[0] }),
        /* @__PURE__ */ e("span", { className: "meso-sidebar__title", children: l }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => h(!m),
            "aria-label": m ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ s("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ e("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ e("nav", { className: "meso-sidebar__nav", children: r.map((t) => /* @__PURE__ */ s(
        "div",
        {
          className: `meso-sidebar__nav-item${t.active ? " meso-sidebar__nav-item--active" : ""}`,
          onClick: t.onClick,
          title: t.label,
          children: [
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-icon", children: t.icon }),
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-label", children: t.label })
          ]
        },
        t.id
      )) }),
      o && /* @__PURE__ */ e("div", { className: "meso-sidebar__footer", children: o })
    ] }),
    /* @__PURE__ */ e("div", { className: "meso-session-col", children: i }),
    /* @__PURE__ */ s("main", { className: "meso-main", children: [
      _ && /* @__PURE__ */ e("div", { className: "meso-main__header", children: _ }),
      /* @__PURE__ */ e("div", { className: "meso-main__content", children: a })
    ] })
  ] });
}
function G({ role: r, content: o, streaming: i = !1, timestamp: a }) {
  return /* @__PURE__ */ s("div", { className: `meso-bubble meso-bubble--${r}`, children: [
    r === "assistant" && /* @__PURE__ */ e("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ s("div", { className: "meso-bubble__body", children: [
      /* @__PURE__ */ s("div", { className: "meso-bubble__content", children: [
        o.split(`
`).map((d, l) => /* @__PURE__ */ s(Y.Fragment, { children: [
          l > 0 && /* @__PURE__ */ e("br", {}),
          d
        ] }, l)),
        i && /* @__PURE__ */ e("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      a && /* @__PURE__ */ e("div", { className: "meso-bubble__timestamp", children: a })
    ] })
  ] });
}
function oe({ content: r, streaming: o = !1, autoCollapseDelay: i = 1500 }) {
  const [a, d] = k(!0), l = C(o);
  return R(() => {
    if (l.current && !o) {
      const _ = setTimeout(() => d(!1), i);
      return () => clearTimeout(_);
    }
    l.current = o;
  }, [o, i]), /* @__PURE__ */ s("div", { className: `meso-think${a ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ s(
      "button",
      {
        className: "meso-think__header",
        onClick: () => d(!a),
        "aria-expanded": a,
        children: [
          /* @__PURE__ */ e("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ e("span", { className: "meso-think__label", children: "思考过程" }),
          o && /* @__PURE__ */ e("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { className: "meso-think__body", children: /* @__PURE__ */ s("div", { className: "meso-think__content", children: [
      r,
      o && /* @__PURE__ */ e("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function Ce({ active: r = !0 }) {
  return r ? /* @__PURE__ */ e("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function se({ type: r, content: o, language: i = "plaintext", streaming: a = !1, onCopy: d, onDownload: l }) {
  const [_, m] = k(!1), h = () => {
    navigator.clipboard.writeText(o).catch(() => {
    }), m(!0), setTimeout(() => m(!1), 2e3), d == null || d(o);
  }, t = () => {
    if (l) {
      l(o);
      return;
    }
    const v = r === "html" ? "html" : r === "mermaid" ? "md" : i || "txt", n = new Blob([o], { type: "text/plain" }), u = document.createElement("a");
    u.href = URL.createObjectURL(n), u.download = `artifact.${v}`, u.click(), URL.revokeObjectURL(u.href);
  };
  return /* @__PURE__ */ s("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ s("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ e("div", { className: "meso-artifact__tabs", children: (r === "html" ? ["html", "code"] : [r]).map((v) => /* @__PURE__ */ e("span", { className: "meso-artifact__tab meso-artifact__tab--active", children: ae(v, i) }, v)) }),
      a && /* @__PURE__ */ e("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ e(
        "button",
        {
          className: "meso-artifact__download-btn",
          onClick: t,
          title: "下载",
          "aria-label": "下载文件",
          children: /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) })
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: "meso-artifact__copy-btn",
          onClick: h,
          title: "复制",
          "aria-label": "复制代码",
          children: _ ? /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ s("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ e("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
            /* @__PURE__ */ e("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ e("div", { className: "meso-artifact__body", children: r === "html" ? /* @__PURE__ */ e(
      "iframe",
      {
        className: "meso-artifact__preview",
        srcDoc: o,
        sandbox: "allow-scripts",
        title: "HTML 预览"
      }
    ) : /* @__PURE__ */ s("pre", { className: "meso-artifact__code", children: [
      /* @__PURE__ */ e("code", { children: o }),
      a && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function ae(r, o) {
  return r === "html" ? "HTML 预览" : r === "mermaid" ? "图表" : o || "Code";
}
function te({ stages: r, compact: o = !1 }) {
  return r.length === 0 ? null : /* @__PURE__ */ e("div", { className: `meso-stages${o ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: r.map((i, a) => /* @__PURE__ */ s(
    "div",
    {
      className: `meso-stage meso-stage--${i.status}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-stage__dot", children: i.status === "done" ? /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,5.5 4,8 8.5,2.5" }) }) : i.status === "error" ? /* @__PURE__ */ s("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", children: [
          /* @__PURE__ */ e("line", { x1: "2", y1: "2", x2: "8", y2: "8" }),
          /* @__PURE__ */ e("line", { x1: "8", y1: "2", x2: "2", y2: "8" })
        ] }) : /* @__PURE__ */ e("span", { className: "meso-stage__dot-inner" }) }),
        a < r.length - 1 && /* @__PURE__ */ e("div", { className: `meso-stage__line${i.status === "done" ? " meso-stage__line--done" : ""}` }),
        !o && /* @__PURE__ */ e("span", { className: "meso-stage__label", children: i.label }),
        o && /* @__PURE__ */ e("span", { className: "meso-stage__label meso-stage__label--compact", children: i.label })
      ]
    },
    i.id
  )) });
}
function ne({ state: r }) {
  return r === "done" ? /* @__PURE__ */ e("svg", { className: "meso-wf-node__icon meso-wf-node__icon--done", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,6.5 4.5,9.5 10.5,3" }) }) : r === "error" ? /* @__PURE__ */ s("svg", { className: "meso-wf-node__icon meso-wf-node__icon--error", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
    /* @__PURE__ */ e("line", { x1: "2", y1: "2", x2: "10", y2: "10" }),
    /* @__PURE__ */ e("line", { x1: "10", y1: "2", x2: "2", y2: "10" })
  ] }) : r === "skipped" ? /* @__PURE__ */ e("svg", { className: "meso-wf-node__icon meso-wf-node__icon--skipped", viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: /* @__PURE__ */ e("line", { x1: "2", y1: "6", x2: "10", y2: "6" }) }) : /* @__PURE__ */ e("span", { className: "meso-wf-node__spinner", "aria-hidden": "true" });
}
function ie(r) {
  return r < 1e3 ? `${r}ms` : `${(r / 1e3).toFixed(1)}s`;
}
function le({ node: r, depth: o, isLast: i }) {
  const [a, d] = k(!1), l = r.metadata && Object.keys(r.metadata).length > 0;
  return /* @__PURE__ */ s("div", { className: `meso-wf-node meso-wf-node--${r.state}`, style: { "--meso-wf-depth": o }, children: [
    /* @__PURE__ */ s("div", { className: "meso-wf-node__track", children: [
      /* @__PURE__ */ e("div", { className: "meso-wf-node__dot", children: /* @__PURE__ */ e(ne, { state: r.state }) }),
      !i && /* @__PURE__ */ e("div", { className: "meso-wf-node__line" })
    ] }),
    /* @__PURE__ */ s("div", { className: "meso-wf-node__body", children: [
      /* @__PURE__ */ s("div", { className: "meso-wf-node__header", children: [
        /* @__PURE__ */ e("code", { className: "meso-wf-node__name", children: r.name }),
        r.duration_ms !== void 0 && /* @__PURE__ */ e("span", { className: "meso-wf-node__duration", children: ie(r.duration_ms) }),
        l && /* @__PURE__ */ e(
          "button",
          {
            className: "meso-wf-node__expand",
            onClick: () => d((_) => !_),
            "aria-expanded": a,
            "aria-label": a ? "收起详情" : "展开详情",
            children: /* @__PURE__ */ e("svg", { viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", style: { transform: a ? "rotate(180deg)" : void 0 }, children: /* @__PURE__ */ e("polyline", { points: "2,3.5 5,6.5 8,3.5" }) })
          }
        )
      ] }),
      a && l && /* @__PURE__ */ e("pre", { className: "meso-wf-node__meta", children: JSON.stringify(r.metadata, null, 2) })
    ] })
  ] });
}
function ce(r) {
  const { nodes: o, nodeOrder: i } = r, a = /* @__PURE__ */ new Map(), d = [];
  for (const l of i) {
    const _ = o[l];
    if (!_) continue;
    const m = _.parent_id ? (a.get(_.parent_id) ?? 0) + 1 : 0;
    a.set(l, m), d.push({ node: _, depth: m });
  }
  return d;
}
function Se({ runs: r, showRunId: o = !0 }) {
  if (r.length === 0) return null;
  const i = r.length > 1;
  return /* @__PURE__ */ e("div", { className: "meso-wf", role: "status", "aria-label": "工作流进度", children: r.map((a) => {
    const d = ce(a);
    return /* @__PURE__ */ s("div", { className: "meso-wf-run", children: [
      (i || o) && i && /* @__PURE__ */ e("div", { className: "meso-wf-run__label", children: a.run_id }),
      d.map(({ node: l, depth: _ }, m) => /* @__PURE__ */ e(
        le,
        {
          node: l,
          depth: _,
          isLast: m === d.length - 1
        },
        l.node_id
      ))
    ] }, a.run_id);
  }) });
}
const de = {
  safe: "只读",
  write: "写入",
  destructive: "危险"
}, K = {
  mcp: "MCP",
  api: "API",
  local: "本地"
};
function me({ toolCall: r, onConfirm: o, onCancel: i }) {
  var n;
  const [a, d] = k(!1), [l, _] = k(!1), { call: m, result: h, status: t } = r, f = m.risk ?? "safe", v = Object.keys(m.args).length > 0;
  return /* @__PURE__ */ s("div", { className: `meso-tool meso-tool--${t} meso-tool--risk-${f}`, children: [
    /* @__PURE__ */ s("div", { className: "meso-tool__header", children: [
      /* @__PURE__ */ e(he, { status: t }),
      /* @__PURE__ */ e("span", { className: "meso-tool__name", children: m.name }),
      m.provider && K[m.provider] && /* @__PURE__ */ e("span", { className: `meso-tool__provider meso-tool__provider--${m.provider}`, children: K[m.provider] }),
      ((n = m.annotations) == null ? void 0 : n.open_world) && /* @__PURE__ */ e("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", children: "🌐" }),
      f !== "safe" && /* @__PURE__ */ e("span", { className: `meso-tool__risk meso-tool__risk--${f}`, children: de[f] }),
      (h == null ? void 0 : h.duration_ms) !== void 0 && /* @__PURE__ */ s("span", { className: "meso-tool__duration", children: [
        h.duration_ms,
        "ms"
      ] }),
      v && /* @__PURE__ */ s(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => d((u) => !u),
          "aria-expanded": a,
          "aria-label": a ? "折叠参数" : "展开参数",
          children: [
            a ? "▾" : "▸",
            " 参数"
          ]
        }
      )
    ] }),
    a && v && /* @__PURE__ */ e("pre", { className: "meso-tool__args", children: JSON.stringify(m.args, null, 2) }),
    t === "awaiting_confirm" && /* @__PURE__ */ s("div", { className: "meso-tool__confirm", children: [
      /* @__PURE__ */ e("span", { className: "meso-tool__confirm-msg", children: "此操作需要确认后执行" }),
      /* @__PURE__ */ s("div", { className: "meso-tool__confirm-actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-tool__btn meso-tool__btn--cancel",
            onClick: () => i == null ? void 0 : i(m.id),
            children: "取消"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            className: `meso-tool__btn meso-tool__btn--confirm meso-tool__btn--${f}`,
            onClick: () => o == null ? void 0 : o(m.id),
            children: f === "destructive" ? "确认执行（不可撤销）" : "确认"
          }
        )
      ] })
    ] }),
    (t === "done" || t === "error") && h && /* @__PURE__ */ s("div", { className: "meso-tool__result", children: [
      /* @__PURE__ */ s(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => _((u) => !u),
          "aria-expanded": l,
          "aria-label": l ? "折叠结果" : "展开结果",
          children: [
            l ? "▾" : "▸",
            " ",
            t === "error" ? "错误" : "结果"
          ]
        }
      ),
      l && /* @__PURE__ */ e("pre", { className: `meso-tool__output${t === "error" ? " meso-tool__output--error" : ""}`, children: t === "error" ? h.error : h.output })
    ] })
  ] });
}
function he({ status: r }) {
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
function ue({ soul: r, compact: o = !1 }) {
  const i = r.name.charAt(0);
  return /* @__PURE__ */ s(
    "div",
    {
      className: `meso-soul${o ? " meso-soul--compact" : ""}`,
      title: `${r.name} v${r.version}`,
      role: "status",
      "aria-label": `当前 Soul: ${r.name}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-soul__avatar", children: r.avatar ? /* @__PURE__ */ e("img", { src: r.avatar, alt: r.name, className: "meso-soul__img" }) : /* @__PURE__ */ e("span", { className: "meso-soul__initial", children: i }) }),
        !o && /* @__PURE__ */ s(X, { children: [
          /* @__PURE__ */ e("span", { className: "meso-soul__name", children: r.name }),
          r.traits && r.traits.length > 0 && /* @__PURE__ */ e("div", { className: "meso-soul__traits", children: r.traits.map((a) => /* @__PURE__ */ e("span", { className: "meso-soul__trait", children: a }, a)) })
        ] })
      ]
    }
  );
}
const _e = {
  mcp: "MCP",
  api: "API"
};
function pe({ skill: r }) {
  const o = r.provider ? _e[r.provider] : null;
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
        o && /* @__PURE__ */ e("span", { className: "meso-skill__provider", children: o })
      ]
    }
  );
}
function fe({ resourceRead: r }) {
  const [o, i] = k(!1), { read: a, content: d, status: l } = r, _ = a.name ?? a.uri, m = a.server;
  return /* @__PURE__ */ s("div", { className: `meso-resource meso-resource--${l}`, children: [
    /* @__PURE__ */ s("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ e(ve, { status: l }),
      /* @__PURE__ */ e("span", { className: "meso-resource__uri", title: a.uri, children: _ }),
      m && /* @__PURE__ */ e("span", { className: "meso-resource__server", children: m }),
      (d == null ? void 0 : d.duration_ms) !== void 0 && /* @__PURE__ */ s("span", { className: "meso-resource__duration", children: [
        d.duration_ms,
        "ms"
      ] }),
      (l === "done" || l === "error") && d && /* @__PURE__ */ s(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => i((h) => !h),
          "aria-expanded": o,
          "aria-label": o ? "折叠内容" : "展开内容",
          children: [
            o ? "▾" : "▸",
            " ",
            l === "error" ? "错误" : "内容"
          ]
        }
      )
    ] }),
    o && d && /* @__PURE__ */ e("div", { className: "meso-resource__content", children: l === "error" ? /* @__PURE__ */ e("pre", { className: "meso-resource__text meso-resource__text--error", children: d.error }) : d.contents.map((h, t) => /* @__PURE__ */ s("div", { children: [
      h.type === "text" && /* @__PURE__ */ e("pre", { className: "meso-resource__text", children: h.text }),
      h.type === "image" && h.data && /* @__PURE__ */ e(
        "img",
        {
          className: "meso-resource__image",
          src: `data:${h.mime_type ?? "image/png"};base64,${h.data}`,
          alt: "resource"
        }
      ),
      h.type === "blob" && /* @__PURE__ */ s("span", { className: "meso-resource__blob-label", children: [
        "[",
        h.mime_type ?? "binary",
        "]"
      ] })
    ] }, t)) })
  ] });
}
function ve({ status: r }) {
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
function ke(r) {
  return r === "html preview" ? { type: "html" } : r === "mermaid" ? { type: "mermaid" } : { type: "code", language: r };
}
function Oe({
  messages: r,
  streaming: o,
  onArtifactCopy: i,
  onArtifactDownload: a,
  onToolConfirm: d,
  onToolCancel: l,
  emptyState: _,
  className: m,
  renderExtension: h
}) {
  const t = C(null);
  R(() => {
    var n;
    (n = t.current) == null || n.scrollIntoView({ behavior: "smooth" });
  }, [r, o]);
  const f = r.length > 0 || o && o.status !== "idle", v = o ? o.stages.every((n) => n.state === "done" || n.state === "error") : !0;
  return /* @__PURE__ */ e("div", { className: `meso-message-list${m ? ` ${m}` : ""}`, children: /* @__PURE__ */ s("div", { className: "meso-message-list__inner", children: [
    !f && _ && /* @__PURE__ */ e("div", { className: "meso-message-list__empty", children: _ }),
    r.map((n) => /* @__PURE__ */ e(
      G,
      {
        role: n.role,
        content: n.content,
        timestamp: n.timestamp
      },
      n.id
    )),
    o && o.status !== "idle" && /* @__PURE__ */ s("div", { className: "meso-message-list__live", children: [
      (o.activeSoul || o.activeSkill) && /* @__PURE__ */ s("div", { className: "meso-message-list__context-row", children: [
        o.activeSoul && /* @__PURE__ */ e(ue, { soul: o.activeSoul }),
        o.activeSkill && /* @__PURE__ */ e(pe, { skill: o.activeSkill })
      ] }),
      o.stages.length > 0 && !v && /* @__PURE__ */ e(
        te,
        {
          stages: o.stages.map((n) => ({
            id: n.name,
            label: n.name,
            status: n.state === "done" || n.state === "error" ? "done" : "active"
          }))
        }
      ),
      o.memorySnippets.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-chips", children: o.memorySnippets.map((n, u) => /* @__PURE__ */ s("span", { className: "meso-memory-chip", title: n.content, children: [
        "[",
        n.category,
        "] ",
        n.content
      ] }, u)) }),
      o.resourceReadOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__resources", children: o.resourceReadOrder.map((n) => {
        const u = o.resourceReads[n];
        return u ? /* @__PURE__ */ e(fe, { resourceRead: u }, n) : null;
      }) }),
      o.toolCallOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__tools", children: o.toolCallOrder.map((n) => {
        const u = o.toolCalls[n];
        return u ? /* @__PURE__ */ e(
          me,
          {
            toolCall: u,
            onConfirm: d,
            onCancel: l
          },
          n
        ) : null;
      }) }),
      h && o.extensionLog.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__extensions", children: o.extensionLog.map((n, u) => /* @__PURE__ */ e(Y.Fragment, { children: h(n) }, u)) }),
      o.thinkContent && /* @__PURE__ */ e(
        oe,
        {
          content: o.thinkContent,
          streaming: !o.thinkDone
        }
      ),
      (o.textContent || o.status === "streaming") && /* @__PURE__ */ e(
        G,
        {
          role: "assistant",
          content: o.textContent,
          streaming: o.status === "streaming" && o.artifactOrder.length === 0
        }
      ),
      o.artifactOrder.map((n) => {
        const u = o.artifacts[n];
        if (!u) return null;
        const { type: N, language: g } = ke(u.lang);
        return /* @__PURE__ */ e(
          se,
          {
            type: N,
            content: u.content,
            language: g,
            streaming: !u.done,
            onCopy: i,
            onDownload: a
          },
          n
        );
      }),
      o.memorySaved.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-saved", children: o.memorySaved.map((n) => /* @__PURE__ */ s("span", { className: "meso-memory-saved__chip", title: n.preview, children: [
        /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        n.category,
        "]"
      ] }, n.id)) })
    ] }),
    /* @__PURE__ */ e("div", { ref: t })
  ] }) });
}
const be = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function Te({ toolCall: r, onConfirm: o, onCancel: i }) {
  const a = r.risk ?? "safe", d = be[a], l = Object.keys(r.args).length > 0;
  return /* @__PURE__ */ s("div", { className: `meso-confirm-gate meso-confirm-gate--${a}`, role: "alertdialog", "aria-label": "工具执行确认", children: [
    /* @__PURE__ */ e("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ s("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ e("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ e("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ s("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ s("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ e("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${a}`, children: d.label }),
        /* @__PURE__ */ e("code", { className: "meso-confirm-gate__tool-name", children: r.name })
      ] }),
      l && /* @__PURE__ */ e("pre", { className: "meso-confirm-gate__args", children: JSON.stringify(r.args, null, 2) }),
      /* @__PURE__ */ s("div", { className: "meso-confirm-gate__actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-confirm-gate__btn meso-confirm-gate__btn--cancel",
            onClick: () => i(r.id),
            children: "取消"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            className: `meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${a}`,
            onClick: () => o(r.id),
            children: d.confirmText
          }
        )
      ] })
    ] })
  ] });
}
function Re(r, o) {
  const [i, a] = k(T), d = C(null), l = C(o);
  l.current = o;
  const _ = L(() => {
    var t;
    (t = d.current) == null || t.abort(), a((f) => ({ ...f, status: "idle" }));
  }, []), m = L(() => {
    var t;
    (t = d.current) == null || t.abort(), a(T());
  }, []), h = L(async (t) => {
    var N, g, $, B, M, W, A, E, j, I, P, D, V, H, y, J;
    (N = d.current) == null || N.abort();
    const f = new AbortController();
    d.current = f;
    const v = { ...T(), status: "streaming" };
    a(v);
    let n = v;
    const u = (t == null ? void 0 : t.method) ?? (t != null && t.body ? "POST" : "GET");
    try {
      const b = await fetch(r, {
        method: u,
        headers: {
          ...u === "POST" ? { "Content-Type": "application/json" } : {},
          ...t == null ? void 0 : t.headers
        },
        body: t != null && t.body ? JSON.stringify(t.body) : void 0,
        signal: f.signal
      });
      if (!b.ok) throw new Error(`HTTP ${b.status}`);
      const w = b.body.getReader(), S = new TextDecoder();
      let O = "";
      for (; ; ) {
        const { done: Z, value: q } = await w.read();
        if (Z) break;
        O += S.decode(q, { stream: !0 });
        const U = O.split(`
`);
        O = U.pop() ?? "";
        for (const Q of U) {
          const p = ee(Q);
          if (!p) continue;
          const x = re(n, p);
          n = x, a(x);
          const c = l.current;
          if (c)
            switch (p.type) {
              case "capabilities":
                (g = c.onCapabilities) == null || g.call(c, p.payload);
                break;
              case "stage":
                ($ = c.onStageChange) == null || $.call(c, p.payload);
                break;
              case "memory":
                (B = c.onMemoryRecalled) == null || B.call(c, p.payload.snippets);
                break;
              case "memory_saved":
                (M = c.onMemorySaved) == null || M.call(c, p.payload);
                break;
              case "soul":
                (W = c.onSoulActivated) == null || W.call(c, p.payload);
                break;
              case "skill_active":
                (A = c.onSkillActivated) == null || A.call(c, p.payload);
                break;
              case "tool_call":
                (E = c.onToolCall) == null || E.call(c, p.payload);
                break;
              case "tool_result":
                (j = c.onToolResult) == null || j.call(c, p.payload);
                break;
              case "resource_read":
                (I = c.onResourceRead) == null || I.call(c, p.payload);
                break;
              case "resource_content":
                (P = c.onResourceContent) == null || P.call(c, p.payload);
                break;
              case "artifact": {
                const F = x.artifacts[p.payload.id];
                F && ((D = c.onArtifact) == null || D.call(c, F));
                break;
              }
              case "error":
                (V = c.onError) == null || V.call(c, p.payload.message, p.payload.code);
                break;
              case "done":
                (H = c.onDone) == null || H.call(c, x);
                break;
            }
          if (p.type === "done" || p.type === "error") return;
        }
      }
    } catch (b) {
      if (b.name === "AbortError") return;
      const w = b.message;
      a((S) => ({ ...S, status: "error", errorMessage: w })), (J = (y = l.current) == null ? void 0 : y.onError) == null || J.call(y, w);
    }
  }, [r]);
  return { state: i, start: h, abort: _, reset: m };
}
const z = "meso-theme";
function Ne() {
  return typeof window > "u" ? "light" : localStorage.getItem(z) ?? "light";
}
function ge(r) {
  document.documentElement.setAttribute("data-theme", r), localStorage.setItem(z, r);
}
function $e() {
  const [r, o] = k(Ne);
  R(() => {
    ge(r);
  }, [r]);
  const i = L(() => {
    o((a) => a === "light" ? "dark" : "light");
  }, []);
  return { theme: r, toggle: i };
}
export {
  se as ArtifactPanel,
  G as ChatBubble,
  Te as ConfirmGate,
  Oe as MessageList,
  We as PROTOCOL_VERSION,
  fe as ResourceReadBlock,
  pe as SkillIndicator,
  ue as SoulIndicator,
  te as StageTimeline,
  Ce as StreamingCursor,
  oe as ThinkBlock,
  Le as ThreeColumnLayout,
  me as ToolCallBlock,
  Se as WorkflowTimeline,
  re as applyEvent,
  Ae as assertCompatibleVersion,
  T as createInitialStreamState,
  Ee as isCompatibleVersion,
  ee as parseSSELine,
  je as stagePayloadToStage,
  Re as useSSEStream,
  $e as useTheme
};
