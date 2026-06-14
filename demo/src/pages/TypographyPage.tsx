/** Typography showcase */
export function TypographyPage() {
  const Section = ({ label }: { label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '28px 0 16px' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
    </div>
  )

  const TypeRow = ({ size, weight, desc, usage, children }: { size: string; weight?: string; desc: string; usage: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'baseline', background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '14px 20px', marginBottom: 8, gap: 0 }}>
      <div style={{ minWidth: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2, paddingRight: 20, borderRight: '1px solid var(--color-border-light)', marginRight: 20 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)', fontFamily: 'monospace' }}>{size}{weight ? ` / ${weight}` : ''}</span>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{desc}</span>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', background: 'rgba(61,107,82,0.09)', borderRadius: 4, padding: '1px 6px', display: 'inline-block', marginTop: 2, width: 'fit-content' }}>{usage}</span>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  )

  const mono = '"SF Mono","Fira Code",monospace'

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto', overflowY: 'auto' }}>
      <div style={{ fontSize: 15, fontWeight: 650, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12M2 7h8M2 11h10" stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round"/></svg>
        字体规范
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 28 }}>字号层级 · 字重 · 行高 · 颜色层级</div>

      <Section label="字号层级" />

      <TypeRow size="24px" weight="650" desc="欢迎标题" usage="Welcome 页 · 空状态">
        <span style={{ fontSize: 24, fontWeight: 650, color: 'var(--color-text)' }}>欢迎使用 Meso</span>
      </TypeRow>

      <TypeRow size="15px" weight="650" desc="页面标题" usage="对话标题 · 面板标头">
        <span style={{ fontSize: 15, fontWeight: 650, color: 'var(--color-text)' }}>PostgreSQL 性能优化方案</span>
      </TypeRow>

      <TypeRow size="15px" weight="400" desc="页面主体文字" usage="line-height: 1.6">
        <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--color-text)', lineHeight: 1.6, display: 'block' }}>
          分析查询执行计划时，建议首先检查是否缺少必要的索引，再观察 seq scan 的行数是否超出预期。
        </span>
      </TypeRow>

      <TypeRow size="14px" weight="400" desc="聊天气泡" usage="line-height: 1.6">
        <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text)', lineHeight: 1.6, display: 'block' }}>
          帮我分析一下这段 SQL 查询，看看为什么响应时间超过了 2 秒。
        </span>
      </TypeRow>

      <TypeRow size="14–15px" weight="400" desc="Markdown 正文" usage="line-height: 1.65–1.7">
        <span style={{ fontSize: 14.5, fontWeight: 400, color: 'var(--color-text)', lineHeight: 1.67, display: 'block' }}>
          执行计划显示该查询触发了全表扫描（Sequential Scan），影响行数约 <strong>84,000 行</strong>。建议在{' '}
          <code style={{ fontFamily: mono, fontSize: 13, background: 'rgba(61,107,82,0.10)', padding: '1px 5px', borderRadius: 4, color: 'var(--color-accent-dark)' }}>created_at</code> 列上添加 B-tree 索引。
        </span>
      </TypeRow>

      <TypeRow size="13px" weight="400/600" desc="侧栏会话标题" usage="active: weight 600">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>PostgreSQL 性能优化</span>
          <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-text-secondary)' }}>API 接口设计评审</span>
          <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-text-secondary)' }}>React 组件重构方案</span>
        </div>
      </TypeRow>

      <TypeRow size="12px" weight="400" desc="小标签" usage="标签 · 辅助说明">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {[['rgba(61,107,82,0.13)', 'var(--color-accent)', 'Python'],
            ['rgba(47,125,74,.12)', 'var(--color-success)', '成功'],
            ['rgba(192,57,43,.1)', 'var(--color-error)', '错误'],
          ].map(([bg, color, label]) => (
            <span key={label} style={{ fontSize: 12, background: bg, color, padding: '2px 8px', borderRadius: 4 }}>{label}</span>
          ))}
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>3 个结果</span>
        </div>
      </TypeRow>

      <TypeRow size="11px" weight="400" desc="时间戳" usage="消息时间 · 元信息">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {['今天 14:32', '昨天 09:15', '2025-01-06'].map(t => (
            <span key={t} style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{t}</span>
          ))}
        </div>
      </TypeRow>

      <Section label="颜色层级" />

      <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '16px 20px' }}>
        {[
          ['var(--color-text)', '--color-text'],
          ['var(--color-text-secondary)', '--color-text-secondary'],
          ['var(--color-text-muted)', '--color-text-muted'],
        ].map(([color, token]) => (
          <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, background: color, border: '1px solid var(--color-border)' }} />
            <span style={{ fontSize: 11, fontFamily: mono, color: 'var(--color-text-secondary)', minWidth: 200 }}>{token}</span>
            <span style={{ fontSize: 14, color }}>分析查询执行计划时建议首先检查是否缺少必要的索引</span>
          </div>
        ))}
      </div>

      <Section label="代码字体" />

      <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '16px 20px' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          "SF Mono", "Fira Code", monospace · 13px · line-height 1.7
        </div>
        <div style={{ fontFamily: mono, fontSize: 13, color: 'var(--color-text)', lineHeight: 1.7, background: 'var(--color-bg)', borderRadius: 6, padding: '12px 14px' }}>
          <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}># 召回相关记忆并注入上下文</span>{'\n'}
          <span style={{ color: 'var(--color-accent-dark)', fontWeight: 600 }}>def </span>
          <span style={{ color: 'var(--color-accent)' }}>recall_memories</span>
          {'(query: '}
          <span style={{ color: 'var(--color-accent-dark)', fontWeight: 600 }}>str</span>
          {', top_k: '}
          <span style={{ color: 'var(--color-accent-dark)', fontWeight: 600 }}>int</span>
          {' = 5) -> '}
          <span style={{ color: 'var(--color-accent-dark)', fontWeight: 600 }}>list</span>
          {':\n    score = '}
          <span style={{ color: 'var(--color-error)' }}>0.35</span>
          {' * keyword_score + '}
          <span style={{ color: 'var(--color-error)' }}>0.65</span>
          {' * semantic_score\n    '}
          <span style={{ color: 'var(--color-accent-dark)', fontWeight: 600 }}>return </span>
          {'sorted(memories, key='}
          <span style={{ color: 'var(--color-accent-dark)', fontWeight: 600 }}>lambda </span>
          {'m: m.score, reverse='}
          <span style={{ color: 'var(--color-accent-dark)', fontWeight: 600 }}>True</span>
          {')[:top_k]'}
        </div>
      </div>

      <Section label="Markdown 渲染示例" />

      <div style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '20px 24px' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6, borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>PostgreSQL 索引优化指南</div>
        <div style={{ fontSize: 17, fontWeight: 650, color: 'var(--color-text)', margin: '14px 0 6px' }}>问题分析</div>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--color-text)', marginBottom: 10 }}>
          执行计划显示该查询触发了<strong>全表扫描</strong>，影响行数约 84,000 行。
          主要瓶颈在于 <code style={{ fontFamily: mono, fontSize: 13, background: 'rgba(61,107,82,0.10)', color: 'var(--color-accent-dark)', padding: '1px 5px', borderRadius: 4 }}>orders</code> 表缺少复合索引。
        </p>
        <div style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: 12, color: 'var(--color-text-secondary)', fontSize: 14, margin: '10px 0' }}>
          建议在高频查询字段上创建 B-tree 索引，可降低 80% 以上的查询耗时。
        </div>
        <div style={{ fontSize: 17, fontWeight: 650, color: 'var(--color-text)', margin: '14px 0 6px' }}>解决方案</div>
        <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
          {[
            <>在 <code style={{ fontFamily: mono, fontSize: 13, background: 'rgba(61,107,82,0.10)', color: 'var(--color-accent-dark)', padding: '1px 5px', borderRadius: 4 }}>created_at</code> 列添加索引</>,
            <>使用 <code style={{ fontFamily: mono, fontSize: 13, background: 'rgba(61,107,82,0.10)', color: 'var(--color-accent-dark)', padding: '1px 5px', borderRadius: 4 }}>EXPLAIN ANALYZE</code> 验证执行计划</>,
            <>监控慢查询日志，设置阈值 <code style={{ fontFamily: mono, fontSize: 13, background: 'rgba(61,107,82,0.10)', color: 'var(--color-accent-dark)', padding: '1px 5px', borderRadius: 4 }}>log_min_duration_statement = 500</code></>,
          ].map((item, i) => (
            <li key={i} style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--color-text)', marginBottom: 2 }}>{item}</li>
          ))}
        </ul>
      </div>

      <div style={{ height: 32 }} />
    </div>
  )
}
