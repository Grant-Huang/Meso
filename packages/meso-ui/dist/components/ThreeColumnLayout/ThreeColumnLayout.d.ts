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
    /** Main area content (chat column) */
    children: React.ReactNode;
    /** Whether sidebar starts collapsed */
    defaultCollapsed?: boolean;
    /** App name shown in sidebar header */
    appName?: string;
    /** Custom logo node replacing the default letter avatar (e.g. <MyMark size={26} />). */
    sidebarLogo?: React.ReactNode;
    /** Custom title node replacing the default appName text (e.g. <MyWordmark size={15} />). */
    sidebarTitle?: React.ReactNode;
    /** Optional header content for the main area topbar (left side) */
    mainHeader?: React.ReactNode;
    /** Content rendered in the artifact pane. May be null/undefined; the toggle button is always shown. */
    artifactPanel?: React.ReactNode;
    /** Whether the artifact pane starts visible */
    defaultArtifactVisible?: boolean;
    /** Called whenever the artifact pane is toggled */
    onArtifactToggle?: (visible: boolean) => void;
    /** Controlled artifact pane visibility. When provided, overrides internal state. */
    artifactVisible?: boolean;
    /** Hide the artifact toggle button. Default true (button visible). */
    showArtifactToggle?: boolean;
    /** Hide the session column. Default true (column visible). */
    showSessionColumn?: boolean;
    /** Max-width of the chat content area, e.g. 860 or "860px". */
    contentMaxWidth?: number | string;
    /** Called when the sidebar collapsed state changes. */
    onCollapsedChange?: (collapsed: boolean) => void;
}
export declare function ThreeColumnLayout({ navItems, sidebarFooter, sessionColumn, children, defaultCollapsed, appName, sidebarLogo, sidebarTitle, mainHeader, artifactPanel, defaultArtifactVisible, onArtifactToggle, artifactVisible, showArtifactToggle, showSessionColumn, contentMaxWidth, onCollapsedChange, }: ThreeColumnLayoutProps): import("react/jsx-runtime").JSX.Element;
