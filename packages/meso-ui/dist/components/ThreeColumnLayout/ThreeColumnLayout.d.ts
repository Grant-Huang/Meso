import React from 'react';
import './ThreeColumnLayout.css';
export interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
}
export interface ThreeColumnLayoutProps {
    /** Nav items for the left sidebar */
    navItems?: NavItem[];
    /** Content for the bottom of the sidebar (e.g. user avatar/menu) */
    sidebarFooter?: React.ReactNode;
    /** Full content of the middle session column */
    sessionColumn: React.ReactNode;
    /** Main area content (right column) */
    children: React.ReactNode;
    /** Whether sidebar starts collapsed */
    defaultCollapsed?: boolean;
    /** App name shown in sidebar header */
    appName?: string;
    /** Optional header content for the main area */
    mainHeader?: React.ReactNode;
}
export declare function ThreeColumnLayout({ navItems, sidebarFooter, sessionColumn, children, defaultCollapsed, appName, mainHeader, }: ThreeColumnLayoutProps): import("react/jsx-runtime").JSX.Element;
