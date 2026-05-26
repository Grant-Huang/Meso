import './SidebarUserMenu.css';
export interface SidebarMenuItemDef {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
}
export interface SidebarUserMenuProps {
    name: string;
    email?: string;
    /** First char of name is used if not provided. */
    avatarText?: string;
    menuItems?: SidebarMenuItemDef[];
    onSignOut?: () => void;
}
export declare function SidebarUserMenu({ name, email, avatarText, menuItems, onSignOut, }: SidebarUserMenuProps): import("react/jsx-runtime").JSX.Element;
