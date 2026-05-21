import { jsxs as r, jsx as e, Fragment as Y } from "react/jsx-runtime";
import G, { useState as p, useRef as C, useEffect as $, useCallback as S } from "react";
import { createInitialStreamState as O, parseSSELine as z, applyEvent as q } from "./runtime.js";
import { PROTOCOL_VERSION as ke } from "./runtime.js";
function he({
  navItems: a = [],
  sidebarFooter: t,
  sessionColumn: l,
  children: n,
  defaultCollapsed: d = !1,
  appName: c = "Meso",
  mainHeader: v
}) {
  const [h, _] = p(d);
  return /* @__PURE__ */ r("div", { className: "meso-layout", children: [
    /* @__PURE__ */ r("aside", { className: `meso-sidebar${h ? " meso-sidebar--collapsed" : ""}`, children: [
      /* @__PURE__ */ r("div", { className: "meso-sidebar__header", children: [
        /* @__PURE__ */ e("div", { className: "meso-sidebar__logo", children: c[0] }),
        /* @__PURE__ */ e("span", { className: "meso-sidebar__title", children: c }),
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-sidebar__toggle",
            onClick: () => _(!h),
            "aria-label": h ? "展开侧栏" : "收起侧栏",
            children: /* @__PURE__ */ r("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", children: [
              /* @__PURE__ */ e("line", { x1: "2", y1: "4", x2: "14", y2: "4" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "8", x2: "14", y2: "8" }),
              /* @__PURE__ */ e("line", { x1: "2", y1: "12", x2: "14", y2: "12" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ e("nav", { className: "meso-sidebar__nav", children: a.map((s) => /* @__PURE__ */ r(
        "div",
        {
          className: `meso-sidebar__nav-item${s.active ? " meso-sidebar__nav-item--active" : ""}`,
          onClick: s.onClick,
          title: s.label,
          children: [
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-icon", children: s.icon }),
            /* @__PURE__ */ e("span", { className: "meso-sidebar__nav-label", children: s.label })
          ]
        },
        s.id
      )) }),
      t && /* @__PURE__ */ e("div", { className: "meso-sidebar__footer", children: t })
    ] }),
    /* @__PURE__ */ e("div", { className: "meso-session-col", children: l }),
    /* @__PURE__ */ r("main", { className: "meso-main", children: [
      v && /* @__PURE__ */ e("div", { className: "meso-main__header", children: v }),
      /* @__PURE__ */ e("div", { className: "meso-main__content", children: n })
    ] })
  ] });
}
function V({ role: a, content: t, streaming: l = !1, timestamp: n }) {
  return /* @__PURE__ */ r("div", { className: `meso-bubble meso-bubble--${a}`, children: [
    a === "assistant" && /* @__PURE__ */ e("div", { className: "meso-bubble__avatar", "aria-hidden": "true", children: "AI" }),
    /* @__PURE__ */ r("div", { className: "meso-bubble__body", children: [
      /* @__PURE__ */ r("div", { className: "meso-bubble__content", children: [
        t.split(`
`).map((d, c) => /* @__PURE__ */ r(G.Fragment, { children: [
          c > 0 && /* @__PURE__ */ e("br", {}),
          d
        ] }, c)),
        l && /* @__PURE__ */ e("span", { className: "meso-bubble__cursor", "aria-hidden": "true", children: "▋" })
      ] }),
      n && /* @__PURE__ */ e("div", { className: "meso-bubble__timestamp", children: n })
    ] })
  ] });
}
function Q({ content: a, streaming: t = !1, autoCollapseDelay: l = 1500 }) {
  const [n, d] = p(!0), c = C(t);
  return $(() => {
    if (c.current && !t) {
      const v = setTimeout(() => d(!1), l);
      return () => clearTimeout(v);
    }
    c.current = t;
  }, [t, l]), /* @__PURE__ */ r("div", { className: `meso-think${n ? " meso-think--open" : ""}`, children: [
    /* @__PURE__ */ r(
      "button",
      {
        className: "meso-think__header",
        onClick: () => d(!n),
        "aria-expanded": n,
        children: [
          /* @__PURE__ */ e("svg", { className: "meso-think__chevron", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "3,5 7,9 11,5" }) }),
          /* @__PURE__ */ e("span", { className: "meso-think__label", children: "思考过程" }),
          t && /* @__PURE__ */ e("span", { className: "meso-think__dot", "aria-label": "思考中" })
        ]
      }
    ),
    /* @__PURE__ */ e("div", { className: "meso-think__body", children: /* @__PURE__ */ r("div", { className: "meso-think__content", children: [
      a,
      t && /* @__PURE__ */ e("span", { className: "meso-think__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function _e({ active: a = !0 }) {
  return a ? /* @__PURE__ */ e("span", { className: "meso-streaming-cursor", "aria-hidden": "true", children: "▋" }) : null;
}
function X({ type: a, content: t, language: l = "plaintext", streaming: n = !1, onCopy: d, onDownload: c }) {
  const [v, h] = p(!1), _ = () => {
    navigator.clipboard.writeText(t).catch(() => {
    }), h(!0), setTimeout(() => h(!1), 2e3), d == null || d(t);
  }, s = () => {
    if (c) {
      c(t);
      return;
    }
    const b = a === "html" ? "html" : a === "mermaid" ? "md" : l || "txt", o = new Blob([t], { type: "text/plain" }), m = document.createElement("a");
    m.href = URL.createObjectURL(o), m.download = `artifact.${b}`, m.click(), URL.revokeObjectURL(m.href);
  };
  return /* @__PURE__ */ r("div", { className: "meso-artifact", children: [
    /* @__PURE__ */ r("div", { className: "meso-artifact__header", children: [
      /* @__PURE__ */ e("div", { className: "meso-artifact__tabs", children: (a === "html" ? ["html", "code"] : [a]).map((b) => /* @__PURE__ */ e("span", { className: "meso-artifact__tab meso-artifact__tab--active", children: Z(b, l) }, b)) }),
      n && /* @__PURE__ */ e("span", { className: "meso-artifact__streaming-badge", children: "生成中…" }),
      /* @__PURE__ */ e(
        "button",
        {
          className: "meso-artifact__download-btn",
          onClick: s,
          title: "下载",
          "aria-label": "下载文件",
          children: /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("path", { d: "M7.5 2v8M4.5 7.5L7.5 10.5 10.5 7.5M2 13h11" }) })
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          className: "meso-artifact__copy-btn",
          onClick: _,
          title: "复制",
          "aria-label": "复制代码",
          children: v ? /* @__PURE__ */ e("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "2,8 6,12 13,4" }) }) : /* @__PURE__ */ r("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ e("rect", { x: "5", y: "5", width: "8", height: "9", rx: "1.5" }),
            /* @__PURE__ */ e("path", { d: "M10 5V3.5A1.5 1.5 0 008.5 2h-6A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H4" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ e("div", { className: "meso-artifact__body", children: a === "html" ? /* @__PURE__ */ e(
      "iframe",
      {
        className: "meso-artifact__preview",
        srcDoc: t,
        sandbox: "allow-scripts",
        title: "HTML 预览"
      }
    ) : /* @__PURE__ */ r("pre", { className: "meso-artifact__code", children: [
      /* @__PURE__ */ e("code", { children: t }),
      n && /* @__PURE__ */ e("span", { className: "meso-artifact__cursor", "aria-hidden": "true", children: "▋" })
    ] }) })
  ] });
}
function Z(a, t) {
  return a === "html" ? "HTML 预览" : a === "mermaid" ? "图表" : t || "Code";
}
function ee({ stages: a, compact: t = !1 }) {
  return a.length === 0 ? null : /* @__PURE__ */ e("div", { className: `meso-stages${t ? " meso-stages--compact" : ""}`, role: "status", "aria-label": "处理进度", children: a.map((l, n) => /* @__PURE__ */ r(
    "div",
    {
      className: `meso-stage meso-stage--${l.status}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-stage__dot", children: l.status === "done" ? /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "1.5,5.5 4,8 8.5,2.5" }) }) : /* @__PURE__ */ e("span", { className: "meso-stage__dot-inner" }) }),
        n < a.length - 1 && /* @__PURE__ */ e("div", { className: `meso-stage__line${l.status === "done" ? " meso-stage__line--done" : ""}` }),
        !t && /* @__PURE__ */ e("span", { className: "meso-stage__label", children: l.label }),
        t && /* @__PURE__ */ e("span", { className: "meso-stage__label meso-stage__label--compact", children: l.label })
      ]
    },
    l.id
  )) });
}
const te = {
  safe: "只读",
  write: "写入",
  destructive: "危险"
};
function ae({ toolCall: a, onConfirm: t, onCancel: l }) {
  const [n, d] = p(!1), [c, v] = p(!1), { call: h, result: _, status: s } = a, u = h.risk ?? "safe", b = Object.keys(h.args).length > 0;
  return /* @__PURE__ */ r("div", { className: `meso-tool meso-tool--${s} meso-tool--risk-${u}`, children: [
    /* @__PURE__ */ r("div", { className: "meso-tool__header", children: [
      /* @__PURE__ */ e(se, { status: s }),
      /* @__PURE__ */ e("span", { className: "meso-tool__name", children: h.name }),
      u !== "safe" && /* @__PURE__ */ e("span", { className: `meso-tool__risk meso-tool__risk--${u}`, children: te[u] }),
      (_ == null ? void 0 : _.duration_ms) !== void 0 && /* @__PURE__ */ r("span", { className: "meso-tool__duration", children: [
        _.duration_ms,
        "ms"
      ] }),
      b && /* @__PURE__ */ r(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => d((o) => !o),
          "aria-expanded": n,
          "aria-label": n ? "折叠参数" : "展开参数",
          children: [
            n ? "▾" : "▸",
            " 参数"
          ]
        }
      )
    ] }),
    n && b && /* @__PURE__ */ e("pre", { className: "meso-tool__args", children: JSON.stringify(h.args, null, 2) }),
    s === "awaiting_confirm" && /* @__PURE__ */ r("div", { className: "meso-tool__confirm", children: [
      /* @__PURE__ */ e("span", { className: "meso-tool__confirm-msg", children: "此操作需要确认后执行" }),
      /* @__PURE__ */ r("div", { className: "meso-tool__confirm-actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-tool__btn meso-tool__btn--cancel",
            onClick: () => l == null ? void 0 : l(h.id),
            children: "取消"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            className: `meso-tool__btn meso-tool__btn--confirm meso-tool__btn--${u}`,
            onClick: () => t == null ? void 0 : t(h.id),
            children: u === "destructive" ? "确认执行（不可撤销）" : "确认"
          }
        )
      ] })
    ] }),
    (s === "done" || s === "error") && _ && /* @__PURE__ */ r("div", { className: "meso-tool__result", children: [
      /* @__PURE__ */ r(
        "button",
        {
          className: "meso-tool__toggle",
          onClick: () => v((o) => !o),
          "aria-expanded": c,
          "aria-label": c ? "折叠结果" : "展开结果",
          children: [
            c ? "▾" : "▸",
            " ",
            s === "error" ? "错误" : "结果"
          ]
        }
      ),
      c && /* @__PURE__ */ e("pre", { className: `meso-tool__output${s === "error" ? " meso-tool__output--error" : ""}`, children: s === "error" ? _.error : _.output })
    ] })
  ] });
}
function se({ status: a }) {
  switch (a) {
    case "pending":
    case "running":
      return /* @__PURE__ */ e("span", { className: "meso-tool__spinner", "aria-label": "执行中" });
    case "awaiting_confirm":
      return /* @__PURE__ */ r("svg", { className: "meso-tool__icon meso-tool__icon--warn", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "等待确认", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M7 4v4M7 10v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
      ] });
    case "done":
      return /* @__PURE__ */ r("svg", { className: "meso-tool__icon meso-tool__icon--done", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "完成", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("polyline", { points: "4,7 6,9.5 10,4.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
      ] });
    case "error":
      return /* @__PURE__ */ r("svg", { className: "meso-tool__icon meso-tool__icon--error", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-label": "失败", children: [
        /* @__PURE__ */ e("circle", { cx: "7", cy: "7", r: "6", stroke: "currentColor", strokeWidth: "1.5" }),
        /* @__PURE__ */ e("path", { d: "M5 5l4 4M9 5l-4 4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
      ] });
  }
}
function oe({ soul: a, compact: t = !1 }) {
  const l = a.name.charAt(0);
  return /* @__PURE__ */ r(
    "div",
    {
      className: `meso-soul${t ? " meso-soul--compact" : ""}`,
      title: `${a.name} v${a.version}`,
      role: "status",
      "aria-label": `当前 Soul: ${a.name}`,
      children: [
        /* @__PURE__ */ e("div", { className: "meso-soul__avatar", children: a.avatar ? /* @__PURE__ */ e("img", { src: a.avatar, alt: a.name, className: "meso-soul__img" }) : /* @__PURE__ */ e("span", { className: "meso-soul__initial", children: l }) }),
        !t && /* @__PURE__ */ r(Y, { children: [
          /* @__PURE__ */ e("span", { className: "meso-soul__name", children: a.name }),
          a.traits && a.traits.length > 0 && /* @__PURE__ */ e("div", { className: "meso-soul__traits", children: a.traits.map((n) => /* @__PURE__ */ e("span", { className: "meso-soul__trait", children: n }, n)) })
        ] })
      ]
    }
  );
}
function re(a) {
  return a === "html preview" ? { type: "html" } : a === "mermaid" ? { type: "mermaid" } : { type: "code", language: a };
}
function ue({
  messages: a,
  streaming: t,
  onArtifactCopy: l,
  onArtifactDownload: n,
  onToolConfirm: d,
  onToolCancel: c,
  emptyState: v,
  className: h,
  renderExtension: _
}) {
  const s = C(null);
  $(() => {
    var o;
    (o = s.current) == null || o.scrollIntoView({ behavior: "smooth" });
  }, [a, t]);
  const u = a.length > 0 || t && t.status !== "idle", b = t ? t.stages.every((o) => o.state === "done" || o.state === "error") : !0;
  return /* @__PURE__ */ e("div", { className: `meso-message-list${h ? ` ${h}` : ""}`, children: /* @__PURE__ */ r("div", { className: "meso-message-list__inner", children: [
    !u && v && /* @__PURE__ */ e("div", { className: "meso-message-list__empty", children: v }),
    a.map((o) => /* @__PURE__ */ e(
      V,
      {
        role: o.role,
        content: o.content,
        timestamp: o.timestamp
      },
      o.id
    )),
    t && t.status !== "idle" && /* @__PURE__ */ r("div", { className: "meso-message-list__live", children: [
      t.activeSoul && /* @__PURE__ */ e("div", { className: "meso-message-list__soul", children: /* @__PURE__ */ e(oe, { soul: t.activeSoul }) }),
      t.stages.length > 0 && !b && /* @__PURE__ */ e(
        ee,
        {
          stages: t.stages.map((o) => ({
            id: o.name,
            label: o.name,
            status: o.state === "done" || o.state === "error" ? "done" : "active"
          }))
        }
      ),
      t.memorySnippets.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-chips", children: t.memorySnippets.map((o, m) => /* @__PURE__ */ r("span", { className: "meso-memory-chip", title: o.content, children: [
        "[",
        o.category,
        "] ",
        o.content
      ] }, m)) }),
      t.toolCallOrder.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__tools", children: t.toolCallOrder.map((o) => {
        const m = t.toolCalls[o];
        return m ? /* @__PURE__ */ e(
          ae,
          {
            toolCall: m,
            onConfirm: d,
            onCancel: c
          },
          o
        ) : null;
      }) }),
      _ && t.extensionLog.length > 0 && /* @__PURE__ */ e("div", { className: "meso-message-list__extensions", children: t.extensionLog.map((o, m) => /* @__PURE__ */ e(G.Fragment, { children: _(o) }, m)) }),
      t.thinkContent && /* @__PURE__ */ e(
        Q,
        {
          content: t.thinkContent,
          streaming: !t.thinkDone
        }
      ),
      (t.textContent || t.status === "streaming") && /* @__PURE__ */ e(
        V,
        {
          role: "assistant",
          content: t.textContent,
          streaming: t.status === "streaming" && t.artifactOrder.length === 0
        }
      ),
      t.artifactOrder.map((o) => {
        const m = t.artifacts[o];
        if (!m) return null;
        const { type: k, language: N } = re(m.lang);
        return /* @__PURE__ */ e(
          X,
          {
            type: k,
            content: m.content,
            language: N,
            streaming: !m.done,
            onCopy: l,
            onDownload: n
          },
          o
        );
      }),
      t.memorySaved.length > 0 && /* @__PURE__ */ e("div", { className: "meso-memory-saved", children: t.memorySaved.map((o) => /* @__PURE__ */ r("span", { className: "meso-memory-saved__chip", title: o.preview, children: [
        /* @__PURE__ */ e("svg", { width: "10", height: "10", viewBox: "0 0 10 10", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ e("path", { d: "M2 9V2a1 1 0 011-1h4a1 1 0 011 1v7L5 7.5 2 9z" }) }),
        "已记忆 [",
        o.category,
        "]"
      ] }, o.id)) })
    ] }),
    /* @__PURE__ */ e("div", { ref: s })
  ] }) });
}
const ne = {
  safe: { label: "只读操作", confirmText: "确认" },
  write: { label: "写入操作", confirmText: "确认执行" },
  destructive: { label: "危险操作", confirmText: "确认执行（不可撤销）" }
};
function fe({ toolCall: a, onConfirm: t, onCancel: l }) {
  const n = a.risk ?? "safe", d = ne[n], c = Object.keys(a.args).length > 0;
  return /* @__PURE__ */ r("div", { className: `meso-confirm-gate meso-confirm-gate--${n}`, role: "alertdialog", "aria-label": "工具执行确认", children: [
    /* @__PURE__ */ e("div", { className: "meso-confirm-gate__icon", children: /* @__PURE__ */ r("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ e("circle", { cx: "10", cy: "10", r: "9", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ e("path", { d: "M10 6v5M10 13.5v.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }) }),
    /* @__PURE__ */ r("div", { className: "meso-confirm-gate__body", children: [
      /* @__PURE__ */ r("div", { className: "meso-confirm-gate__title", children: [
        /* @__PURE__ */ e("span", { className: `meso-confirm-gate__risk-badge meso-confirm-gate__risk-badge--${n}`, children: d.label }),
        /* @__PURE__ */ e("code", { className: "meso-confirm-gate__tool-name", children: a.name })
      ] }),
      c && /* @__PURE__ */ e("pre", { className: "meso-confirm-gate__args", children: JSON.stringify(a.args, null, 2) }),
      /* @__PURE__ */ r("div", { className: "meso-confirm-gate__actions", children: [
        /* @__PURE__ */ e(
          "button",
          {
            className: "meso-confirm-gate__btn meso-confirm-gate__btn--cancel",
            onClick: () => l(a.id),
            children: "取消"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            className: `meso-confirm-gate__btn meso-confirm-gate__btn--confirm meso-confirm-gate__btn--${n}`,
            onClick: () => t(a.id),
            children: d.confirmText
          }
        )
      ] })
    ] })
  ] });
}
function ve(a, t) {
  const [l, n] = p(O), d = C(null), c = C(t);
  c.current = t;
  const v = S(() => {
    var s;
    (s = d.current) == null || s.abort(), n((u) => ({ ...u, status: "idle" }));
  }, []), h = S(() => {
    var s;
    (s = d.current) == null || s.abort(), n(O());
  }, []), _ = S(async (s) => {
    var k, N, M, R, A, B, E, W, j, I, y, P;
    (k = d.current) == null || k.abort();
    const u = new AbortController();
    d.current = u;
    const b = { ...O(), status: "streaming" };
    n(b);
    let o = b;
    const m = (s == null ? void 0 : s.method) ?? (s != null && s.body ? "POST" : "GET");
    try {
      const g = await fetch(a, {
        method: m,
        headers: {
          ...m === "POST" ? { "Content-Type": "application/json" } : {},
          ...s == null ? void 0 : s.headers
        },
        body: s != null && s.body ? JSON.stringify(s.body) : void 0,
        signal: u.signal
      });
      if (!g.ok) throw new Error(`HTTP ${g.status}`);
      const w = g.body.getReader(), L = new TextDecoder();
      let T = "";
      for (; ; ) {
        const { done: J, value: K } = await w.read();
        if (J) break;
        T += L.decode(K, { stream: !0 });
        const D = T.split(`
`);
        T = D.pop() ?? "";
        for (const F of D) {
          const f = z(F);
          if (!f) continue;
          const x = q(o, f);
          o = x, n(x);
          const i = c.current;
          if (i)
            switch (f.type) {
              case "stage":
                (N = i.onStageChange) == null || N.call(i, f.payload);
                break;
              case "memory":
                (M = i.onMemoryRecalled) == null || M.call(i, f.payload.snippets);
                break;
              case "memory_saved":
                (R = i.onMemorySaved) == null || R.call(i, f.payload);
                break;
              case "soul":
                (A = i.onSoulActivated) == null || A.call(i, f.payload);
                break;
              case "tool_call":
                (B = i.onToolCall) == null || B.call(i, f.payload);
                break;
              case "tool_result":
                (E = i.onToolResult) == null || E.call(i, f.payload);
                break;
              case "artifact": {
                const U = x.artifacts[f.payload.id];
                U && ((W = i.onArtifact) == null || W.call(i, U));
                break;
              }
              case "error":
                (j = i.onError) == null || j.call(i, f.payload.message, f.payload.code);
                break;
              case "done":
                (I = i.onDone) == null || I.call(i, x);
                break;
            }
          if (f.type === "done" || f.type === "error") return;
        }
      }
    } catch (g) {
      if (g.name === "AbortError") return;
      const w = g.message;
      n((L) => ({ ...L, status: "error", errorMessage: w })), (P = (y = c.current) == null ? void 0 : y.onError) == null || P.call(y, w);
    }
  }, [a]);
  return { state: l, start: _, abort: v, reset: h };
}
const H = "meso-theme";
function le() {
  return typeof window > "u" ? "light" : localStorage.getItem(H) ?? "light";
}
function ie(a) {
  document.documentElement.setAttribute("data-theme", a), localStorage.setItem(H, a);
}
function be() {
  const [a, t] = p(le);
  $(() => {
    ie(a);
  }, [a]);
  const l = S(() => {
    t((n) => n === "light" ? "dark" : "light");
  }, []);
  return { theme: a, toggle: l };
}
export {
  X as ArtifactPanel,
  V as ChatBubble,
  fe as ConfirmGate,
  ue as MessageList,
  ke as PROTOCOL_VERSION,
  oe as SoulIndicator,
  ee as StageTimeline,
  _e as StreamingCursor,
  Q as ThinkBlock,
  he as ThreeColumnLayout,
  ae as ToolCallBlock,
  q as applyEvent,
  O as createInitialStreamState,
  z as parseSSELine,
  ve as useSSEStream,
  be as useTheme
};
