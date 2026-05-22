import { jsxs as a, jsx as e, Fragment as X } from "react/jsx-runtime";
import Y, { useState as b, useRef as C, useEffect as O, useCallback as L } from "react";
import { createInitialStreamState as T, parseSSELine as ee, applyEvent as re } from "./runtime.js";
import { PROTOCOL_VERSION as Te } from "./runtime.js";
function ge({
  navItems: s = [],
  sidebarFooter: r,
  sessionColumn: i,
  children: n,
  defaultCollapsed: c = !1,
  appName: d = "Meso",
  mainHeader: p
}) {
  const [h, m] = b(c);
  return /* @__PURE__ */ a("div", { className: "meso-layout", children: [
    /* @__PURE__ */ a("aside", { className: `meso-sidebar${h ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ a("div", { className: "meso-sidebar__header", children: [
        /* @__PURE__ */ e("div", { className: "meso-sidebar__logo", children: d[0] }),
        /* @__PURE__ */ e("span", { className: "meso-sidebar__title", children: d }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => m(!h),
            "aria-label": h ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ a("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ e("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ e("nav", { className: "meso-sidebar__nav", children: s.map((o) => /* @__PURE__ */ a(
        "div",
        {
          className: `meso-sidebar__nav-item${o.active ? " meso-sidebar__nav-item--active" : ""}`,
          onClick: o.onClick,
          title: o.label,
          children: [
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-icon", children: o.icon }),
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-label", children: o.label })
          ]
        },
        o.id
      )) }),
      r && /* @__PURE__ */ e("div", { className: "meso-sidebar__footer", children: r })
    ] }),
    /* @__PURE__ */ e("div", { className: "meso-session-col", children: i }),
    /* @__PURE__ */ a("main", { className: "meso-main", children: [
      p && /* @__PURE__ */ e("div", { className: "meso-main__header", children: p }),
      /* @__PURE__ */ e("div", { className: "meso-main__content", children: n })
    ] })
  ] });
}
function K({ role: s, content: r, streaming: i = !1, timestamp: n }) {
  return /* @__PURE__ */ a("div", { className: `meso-bubble meso-bubble--${s}`, children: [
    s === "assistant" && /* @__PURE__ */ e("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ a("div", { className: "meso-bubble__body", children: [
      /* @__PURE__ */ a("div", { className: "meso-bubble__content", children: [
        r.split(`
`).map((c, d) => /* @__PURE__ */ a(Y.Fragment, { children: [
          d > 0 && /* @__PURE__ */ e("br", {}),
          c
        ] }, d)),
        i && /* @__PURE__ */ e("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      n && /* @__PURE__ */ e("div", { className: "meso-bubble__timestamp", children: n })
    ] })
  ] });
}
function se({ content: s, streaming: r = !1, autoCollapseDelay: i = 1500 }) {
  const [n, c] = b(!0), d = C(r);
  return O(() => {
    if (d.current && !r) {
      const p = setTimeout(() => c(!1), i);
      return () => clearTimeout(p);
    }
    d.current = r;
  }, [r, i]), /* @__PURE__ */ a("div", { className: `meso-think${n ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ a(
      "button",
      {
        className: "meso-think__header",
        onClick: () => c(!n),
        "aria-expanded": n,
        children: [
          /* @__PURE__ */ e("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ e("span", { className: "meso-think__label", children: "思考过程" }),
          r && /* @__PURE__ */ e("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { className: "meso-think__body", children: /* @__PURE__ */ a("div", { className: "meso-think__content", children: [
      s,
      r && /* @__PURE__ */ e("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function ye({ active: s = !0 }) {
  return s ? /* @__PURE__ */ e("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function ae({ type: s, content: r, language: i = "plaintext", streaming: n = !1, onCopy: c, onDownload: d }) {
  const [p, h] = b(!1), m = () => {
    navigator.clipboard.writeText(r).catch(() => {
    }), h(!0), setTimeout(() => h(!1), 2e3), c == null || c(r);
  }, o = () => {
    if (d) {
      d(r);
      return;
    }
    const f = s === "html" ? "html" : s === "mermaid" ? "md" : i || "txt", t = new Blob([r], { type: "text/plain" }), u = document.createElement("a");
    u.href = URL.createObjectURL(t), u.download = `artifact.${f}`, u.click(), URL.revokeObjectURL(u.href);
  };
  return /* @__PURE__ */ a("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ a("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ e("div", { className: "meso-artifact__tabs", children: (s === "html" ? ["html", "code"] : [s]).map((f) => /* @__PURE__ */ e("span", { className: "meso-artifact__tab meso-artifact__tab--active", children: oe(f, i) }, f)) }),
      n && /* @__PURE__ */ e("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ e(
        "button",
        {
          className: "meso-artifact__download-btn",
          onClick: o,
          title: "下载",
          "aria-label": "下载文件",
          children: /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) })
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: "meso-artifact__copy-btn",
          onClick: m,
          title: "复制",
          "aria-label": "复制代码",
          children: p ? /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ a("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ e("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
            /* @__PURE__ */ e("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ e("div", { className: "meso-artifact__body", children: s === "html" ? /* @__PURE__ */ e(
      "iframe",
      {
        className: "meso-artifact__preview",
        srcDoc: r,
        sandbox: "allow-scripts",
        title: "HTML 预览"
      }
    ) : /* @__PURE__ */ a("pre", { className: "meso-artifact__code", children: [
      /* @__PURE__ */ e("code", { children: r }),
      n && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function oe(s, r) {
  return s === "html" ? "HTML 预览" : s === "mermaid" ? "图表" : r || "Code";
}
function te({ stages: s, compact: r = !1 }) {
  return s.length === 0 ? null : /* @__PURE__ */ e("div", { className: `meso-stages${r ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: s.map((i, n) => /* @__PURE__ */ a(
    "div",
    {
      className: `meso-stage meso-stage--${i.status}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-stage__dot", children: i.status === "done" ? /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,5.5 4,8 8.5,2.5" }) }) : /* @__PURE__ */ e("span", { className: "meso-stage__dot-inner" }) }),
        n < s.length - 1 && /* @__PURE__ */ e("div", { className: `meso-stage__line${i.status === "done" ? " meso-stage__line--done" : ""}` }),
        !r && /* @__PURE__ */ e("span", { className: "meso-stage__label", children: i.label }),
        r && /* @__PURE__ */ e("span", { className: "meso-stage__label meso-stage__label--compact", children: i.label })
      ]
    },
    i.id
  )) });
}
const ne = {
  safe: "只读",
  write: "写入",
  destructive: "危险"
}, F = {
  mcp: "MCP",
  api: "API",
  local: "本地"
};
function le({ toolCall: s, onConfirm: r, onCancel: i }) {
  var t;
  const [n, c] = b(!1), [d, p] = b(!1), { call: h, result: m, status: o } = s, v = h.risk ?? "safe", f = Object.keys(h.args).length > 0;
  return /* @__PURE__ */ a("div", { className: `meso-tool meso-tool--${o} meso-tool--risk-${v}`, children: [
    /* @__PURE__ */ a("div", { className: "meso-tool__header", children: [
      /* @__PURE__ */ e(ie, { status: o }),
      /* @__PURE__ */ e("span", { className: "meso-tool__name", children: h.name }),
      h.provider && F[h.provider] && /* @__PURE__ */ e("span", { className: `meso-tool__provider meso-tool__provider--${h.provider}`, children: F[h.provider] }),
      ((t = h.annotations) == null ? void 0 : t.open_world) && /* @__PURE__ */ e("span", { className: "meso-tool__annotation", title: "此工具会访问外部网络", children: "🌐" }),
      v !== "safe" && /* @__PURE__ */ e("span", { className: `meso-tool__risk meso-tool__risk--${v}`, children: ne[v] }),
      (m == null ? void 0 : m.duration_ms) !== void 0 && /* @__PURE__ */ a("span", { className: "meso-tool__duration", children: [
        m.duration_ms,
        "ms"
      ] }),
      f && /* @__PURE__ */ a(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => c((u) => !u),
          "aria-expanded": n,
          "aria-label": n ? "折叠参数" : "展开参数",
          children: [
            n ? "▾" : "▸",
            " 参数"
          ]
        }
      )
    ] }),
    n && f && /* @__PURE__ */ e("pre", { className: "meso-tool__args", children: JSON.stringify(h.args, null, 2) }),
    o === "awaiting_confirm" && /* @__PURE__ */ a("div", { className: "meso-tool__confirm", children: [
      /* @__PURE__ */ e("span", { className: "meso-tool__confirm-msg", children: "此操作需要确认后执行" }),
      /* @__PURE__ */ a("div", { className: "meso-tool__confirm-actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-tool__btn meso-tool__btn--cancel",
            onClick: () => i == null ? void 0 : i(h.id),
            children: "取消"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            className: `meso-tool__btn meso-tool__btn--confirm meso-tool__btn--${v}`,
            onClick: () => r == null ? void 0 : r(h.id),
            children: v === "destructive" ? "确认执行（不可撤销）" : "确认"
          }
        )
      ] })
    ] }),
    (o === "done" || o === "error") && m && /* @__PURE__ */ a("div", { className: "meso-tool__result", children: [
      /* @__PURE__ */ a(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => p((u) => !u),
          "aria-expanded": d,
          "aria-label": d ? "折叠结果" : "展开结果",
          children: [
            d ? "▾" : "▸",
            " ",
            o === "error" ? "错误" : "结果"
          ]
        }
      ),
      d && /* @__PURE__ */ e("pre", { className: `meso-tool__output${o === "error" ? " meso-tool__output--error" : ""}`, children: o === "error" ? m.error : m.output })
    ] })
  ] });
}
function ie({ status: s }) {
  switch (s) {
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
function ce({ soul: s, compact: r = !1 }) {
  const i = s.name.charAt(0);
  return /* @__PURE__ */ a(
    "div",
    {
      className: `meso-soul${r ? " meso-soul--compact" : ""}`,
      title: `${s.name} v${s.version}`,
      role: "status",
      "aria-label": `当前 Soul: ${s.name}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-soul__avatar", children: s.avatar ? /* @__PURE__ */ e("img", { src: s.avatar, alt: s.name, className: "meso-soul__img" }) : /* @__PURE__ */ e("span", { className: "meso-soul__initial", children: i }) }),
        !r && /* @__PURE__ */ a(X, { children: [
          /* @__PURE__ */ e("span", { className: "meso-soul__name", children: s.name }),
          s.traits && s.traits.length > 0 && /* @__PURE__ */ e("div", { className: "meso-soul__traits", children: s.traits.map((n) => /* @__PURE__ */ e("span", { className: "meso-soul__trait", children: n }, n)) })
        ] })
      ]
    }
  );
}
const de = {
  mcp: "MCP",
  api: "API"
};
function me({ skill: s }) {
  const r = s.provider ? de[s.provider] : null;
  return /* @__PURE__ */ a(
    "div",
    {
      className: "meso-skill",
      title: s.description ?? s.name,
      role: "status",
      "aria-label": `当前技能: ${s.name}`,
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
        /* @__PURE__ */ e("span", { className: "meso-skill__name", children: s.name }),
        s.focus && s.focus.length > 0 && /* @__PURE__ */ a("span", { className: "meso-skill__focus", children: [
          "· ",
          s.focus.join(", ")
        ] }),
        r && /* @__PURE__ */ e("span", { className: "meso-skill__provider", children: r })
      ]
    }
  );
}
function he({ resourceRead: s }) {
  const [r, i] = b(!1), { read: n, content: c, status: d } = s, p = n.name ?? n.uri, h = n.server;
  return /* @__PURE__ */ a("div", { className: `meso-resource meso-resource--${d}`, children: [
    /* @__PURE__ */ a("div", { className: "meso-resource__header", children: [
      /* @__PURE__ */ e(ue, { status: d }),
      /* @__PURE__ */ e("span", { className: "meso-resource__uri", title: n.uri, children: p }),
      h && /* @__PURE__ */ e("span", { className: "meso-resource__server", children: h }),
      (c == null ? void 0 : c.duration_ms) !== void 0 && /* @__PURE__ */ a("span", { className: "meso-resource__duration", children: [
        c.duration_ms,
        "ms"
      ] }),
      (d === "done" || d === "error") && c && /* @__PURE__ */ a(
        "button",
        {
          className: "meso-resource__toggle",
          onClick: () => i((m) => !m),
          "aria-expanded": r,
          "aria-label": r ? "折叠内容" : "展开内容",
          children: [
            r ? "▾" : "▸",
            " ",
            d === "error" ? "错误" : "内容"
          ]
        }
      )
    ] }),
    r && c && /* @__PURE__ */ e("div", { className: "meso-resource__content", children: d === "error" ? /* @__PURE__ */ e("pre", { className: "meso-resource__text meso-resource__text--error", children: c.error }) : c.contents.map((m, o) => /* @__PURE__ */ a("div", { children: [
      m.type === "text" && /* @__PURE__ */ e("pre", { className: "meso-resource__text", children: m.text }),
      m.type === "image" && m.data && /* @__PURE__ */ e(
        "img",
        {
          className: "meso-resource__image",
          src: `data:${m.mime_type ?? "image/png"};base64,${m.data}`,
          alt: "resource"
        }
      ),
      m.type === "blob" && /* @__PURE__ */ a("span", { className: "meso-resource__blob-label", children: [
        "[",
        m.mime_type ?? "binary",
        "]"
      ] })
    ] }, o)) })
  ] });
}
function ue({ status: s }) {
  switch (s) {
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
function _e(s) {
  return s === "html preview" ? { type: "html" } : s === "mermaid" ? { type: "mermaid" } : { type: "code", language: s };
}
function we({
  messages: s,
  streaming: r,
  onArtifactCopy: i,
  onArtifactDownload: n,
  onToolConfirm: c,
  onToolCancel: d,
  emptyState: p,
  className: h,
  renderExtension: m
}) {
  const o = C(null);
  O(() => {
    var t;
    (t = o.current) == null || t.scrollIntoView({ behavior: "smooth" });
  }, [s, r]);
  const v = s.length > 0 || r && r.status !== "idle", f = r ? r.stages.every((t) => t.state === "done" || t.state === "error") : !0;
  return /* @__PURE__ */ e("div", { className: `meso-message-list${h ? ` ${h}` : ""}`, children: /* @__PURE__ */ a("div", { className: "meso-message-list__inner", children: [
    !v && p && /* @__PURE__ */ e("div", { className: "meso-message-list__empty", children: p }),
    s.map((t) => /* @__PURE__ */ e(
      K,
      {
        role: t.role,
        content: t.content,
        timestamp: t.timestamp
      },
      t.id
    )),
    r && r.status !== "idle" && /* @__PURE__ */ a("div", { className: "meso-message-list__live", children: [
      (r.activeSoul || r.activeSkill) && /* @__PURE__ */ a("div", { className: "meso-message-list__context-row", children: [
        r.activeSoul && /* @__PURE__ */ e(ce, { soul: r.activeSoul }),
        r.activeSkill && /* @__PURE__ */ e(me, { skill: r.activeSkill })
      ] }),
      r.stages.length > 0 && !f && /* @__PURE__ */ e(
        te,
        {
          stages: r.stages.map((t) => ({
            id: t.name,
            label: t.name,
            status: t.state === "done" || t.state === "error" ? "done" : "active"
          }))
        }
      ),
      r.memorySnippets.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-chips", children: r.memorySnippets.map((t, u) => /* @__PURE__ */ a("span", { className: "meso-memory-chip", title: t.content, children: [
        "[",
        t.category,
        "] ",
        t.content
      ] }, u)) }),
      r.resourceReadOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__resources", children: r.resourceReadOrder.map((t) => {
        const u = r.resourceReads[t];
        return u ? /* @__PURE__ */ e(he, { resourceRead: u }, t) : null;
      }) }),
      r.toolCallOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__tools", children: r.toolCallOrder.map((t) => {
        const u = r.toolCalls[t];
        return u ? /* @__PURE__ */ e(
          le,
          {
            toolCall: u,
            onConfirm: c,
            onCancel: d
          },
          t
        ) : null;
      }) }),
      m && r.extensionLog.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__extensions", children: r.extensionLog.map((t, u) => /* @__PURE__ */ e(Y.Fragment, { children: m(t) }, u)) }),
      r.thinkContent && /* @__PURE__ */ e(
        se,
        {
          content: r.thinkContent,
          streaming: !r.thinkDone
        }
      ),
      (r.textContent || r.status === "streaming") && /* @__PURE__ */ e(
        K,
        {
          role: "assistant",
          content: r.textContent,
          streaming: r.status === "streaming" && r.artifactOrder.length === 0
        }
      ),
      r.artifactOrder.map((t) => {
        const u = r.artifacts[t];
        if (!u) return null;
        const { type: N, language: g } = _e(u.lang);
        return /* @__PURE__ */ e(
          ae,
          {
            type: N,
            content: u.content,
            language: g,
            streaming: !u.done,
            onCopy: i,
            onDownload: n
          },
          t
        );
      }),
      r.memorySaved.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-saved", children: r.memorySaved.map((t) => /* @__PURE__ */ a("span", { className: "meso-memory-saved__chip", title: t.preview, children: [
        /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        t.category,
        "]"
      ] }, t.id)) })
    ] }),
    /* @__PURE__ */ e("div", { ref: o })
  ] }) });
}
const pe = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function xe({ toolCall: s, onConfirm: r, onCancel: i }) {
  const n = s.risk ?? "safe", c = pe[n], d = Object.keys(s.args).length > 0;
  return /* @__PURE__ */ a("div", { className: `meso-confirm-gate meso-confirm-gate--${n}`, role: "alertdialog", "aria-label": "工具执行确认", children: [
    /* @__PURE__ */ e("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ a("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ e("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ e("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ a("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ a("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ e("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${n}`, children: c.label }),
        /* @__PURE__ */ e("code", { className: "meso-confirm-gate__tool-name", children: s.name })
      ] }),
      d && /* @__PURE__ */ e("pre", { className: "meso-confirm-gate__args", children: JSON.stringify(s.args, null, 2) }),
      /* @__PURE__ */ a("div", { className: "meso-confirm-gate__actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-confirm-gate__btn meso-confirm-gate__btn--cancel",
            onClick: () => i(s.id),
            children: "取消"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            className: `meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${n}`,
            onClick: () => r(s.id),
            children: c.confirmText
          }
        )
      ] })
    ] })
  ] });
}
function Le(s, r) {
  const [i, n] = b(T), c = C(null), d = C(r);
  d.current = r;
  const p = L(() => {
    var o;
    (o = c.current) == null || o.abort(), n((v) => ({ ...v, status: "idle" }));
  }, []), h = L(() => {
    var o;
    (o = c.current) == null || o.abort(), n(T());
  }, []), m = L(async (o) => {
    var N, g, $, M, A, B, E, W, I, j, P, D, V, H, y, U;
    (N = c.current) == null || N.abort();
    const v = new AbortController();
    c.current = v;
    const f = { ...T(), status: "streaming" };
    n(f);
    let t = f;
    const u = (o == null ? void 0 : o.method) ?? (o != null && o.body ? "POST" : "GET");
    try {
      const k = await fetch(s, {
        method: u,
        headers: {
          ...u === "POST" ? { "Content-Type": "application/json" } : {},
          ...o == null ? void 0 : o.headers
        },
        body: o != null && o.body ? JSON.stringify(o.body) : void 0,
        signal: v.signal
      });
      if (!k.ok) throw new Error(`HTTP ${k.status}`);
      const w = k.body.getReader(), S = new TextDecoder();
      let R = "";
      for (; ; ) {
        const { done: Z, value: q } = await w.read();
        if (Z) break;
        R += S.decode(q, { stream: !0 });
        const G = R.split(`
`);
        R = G.pop() ?? "";
        for (const Q of G) {
          const _ = ee(Q);
          if (!_) continue;
          const x = re(t, _);
          t = x, n(x);
          const l = d.current;
          if (l)
            switch (_.type) {
              case "capabilities":
                (g = l.onCapabilities) == null || g.call(l, _.payload);
                break;
              case "stage":
                ($ = l.onStageChange) == null || $.call(l, _.payload);
                break;
              case "memory":
                (M = l.onMemoryRecalled) == null || M.call(l, _.payload.snippets);
                break;
              case "memory_saved":
                (A = l.onMemorySaved) == null || A.call(l, _.payload);
                break;
              case "soul":
                (B = l.onSoulActivated) == null || B.call(l, _.payload);
                break;
              case "skill_active":
                (E = l.onSkillActivated) == null || E.call(l, _.payload);
                break;
              case "tool_call":
                (W = l.onToolCall) == null || W.call(l, _.payload);
                break;
              case "tool_result":
                (I = l.onToolResult) == null || I.call(l, _.payload);
                break;
              case "resource_read":
                (j = l.onResourceRead) == null || j.call(l, _.payload);
                break;
              case "resource_content":
                (P = l.onResourceContent) == null || P.call(l, _.payload);
                break;
              case "artifact": {
                const J = x.artifacts[_.payload.id];
                J && ((D = l.onArtifact) == null || D.call(l, J));
                break;
              }
              case "error":
                (V = l.onError) == null || V.call(l, _.payload.message, _.payload.code);
                break;
              case "done":
                (H = l.onDone) == null || H.call(l, x);
                break;
            }
          if (_.type === "done" || _.type === "error") return;
        }
      }
    } catch (k) {
      if (k.name === "AbortError") return;
      const w = k.message;
      n((S) => ({ ...S, status: "error", errorMessage: w })), (U = (y = d.current) == null ? void 0 : y.onError) == null || U.call(y, w);
    }
  }, [s]);
  return { state: i, start: m, abort: p, reset: h };
}
const z = "meso-theme";
function ve() {
  return typeof window > "u" ? "light" : localStorage.getItem(z) ?? "light";
}
function fe(s) {
  document.documentElement.setAttribute("data-theme", s), localStorage.setItem(z, s);
}
function Ce() {
  const [s, r] = b(ve);
  O(() => {
    fe(s);
  }, [s]);
  const i = L(() => {
    r((n) => n === "light" ? "dark" : "light");
  }, []);
  return { theme: s, toggle: i };
}
export {
  ae as ArtifactPanel,
  K as ChatBubble,
  xe as ConfirmGate,
  we as MessageList,
  Te as PROTOCOL_VERSION,
  he as ResourceReadBlock,
  me as SkillIndicator,
  ce as SoulIndicator,
  te as StageTimeline,
  ye as StreamingCursor,
  se as ThinkBlock,
  ge as ThreeColumnLayout,
  le as ToolCallBlock,
  re as applyEvent,
  T as createInitialStreamState,
  ee as parseSSELine,
  Le as useSSEStream,
  Ce as useTheme
};
