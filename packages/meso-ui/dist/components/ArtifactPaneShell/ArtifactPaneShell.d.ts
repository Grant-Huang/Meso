import React from 'react';
import './ArtifactPaneShell.css';
export interface ArtifactTab {
    id: string;
    label: string;
    content: React.ReactNode;
    /**
     * When true, this tab is considered "ready" (content has loaded/streamed).
     * Used with autoSelectFirstReady to switch to the first tab that becomes ready.
     */
    ready?: boolean;
}
export interface ArtifactPaneShellProps {
    tabs: ArtifactTab[];
    /** Controlled active tab id. */
    activeTabId?: string;
    /** Called when user clicks a tab. */
    onTabChange?: (id: string) => void;
    /**
     * When true, automatically select the first tab that transitions to ready=true.
     * Only fires once — subsequent ready transitions don't override user selection.
     */
    autoSelectFirstReady?: boolean;
}
export declare function ArtifactPaneShell({ tabs, activeTabId, onTabChange, autoSelectFirstReady, }: ArtifactPaneShellProps): import("react/jsx-runtime").JSX.Element | null;
