import { useState, useEffect, useRef } from 'react'
import './SidebarUserMenu.css'

export interface SidebarMenuItemDef {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  danger?: boolean
}

export interface SidebarUserMenuProps {
  name: string
  email?: string
  /** First char of name is used if not provided. */
  avatarText?: string
  menuItems?: SidebarMenuItemDef[]
  onSignOut?: () => void
}

export function SidebarUserMenu({
  name,
  email,
  avatarText,
  menuItems = [],
  onSignOut,
}: SidebarUserMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const avatar = avatarText ?? name.charAt(0).toUpperCase()

  const allItems: SidebarMenuItemDef[] = [
    ...menuItems,
    ...(onSignOut ? [{ label: '退出登录', onClick: () => { setOpen(false); onSignOut() }, danger: true }] : []),
  ]

  return (
    <div className="meso-user-menu" ref={rootRef}>
      {open && (
        <div className="meso-user-menu__popup" role="menu">
          <div className="meso-user-menu__identity">
            <span className="meso-user-menu__identity-name">{name}</span>
            {email && <span className="meso-user-menu__identity-email">{email}</span>}
          </div>
          {allItems.length > 0 && <div className="meso-user-menu__sep" role="separator" />}
          {allItems.map((item, i) => (
            <button
              key={i}
              className={`meso-user-menu__item${item.danger ? ' meso-user-menu__item--danger' : ''}`}
              role="menuitem"
              onClick={() => { setOpen(false); item.onClick() }}
            >
              {item.icon && <span className="meso-user-menu__item-icon">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
      <button
        className="meso-user-menu__trigger"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={name}
      >
        <div className="meso-user-menu__avatar">{avatar}</div>
        <div className="meso-user-menu__info">
          <span className="meso-user-menu__name">{name}</span>
          {email && <span className="meso-user-menu__email">{email}</span>}
        </div>
      </button>
    </div>
  )
}
