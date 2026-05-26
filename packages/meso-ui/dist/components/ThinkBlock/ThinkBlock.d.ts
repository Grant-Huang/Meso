import './ThinkBlock.css';
export interface ThinkBlockProps {
    content: string;
    streaming?: boolean;
    /**
     * Delay in ms before auto-collapsing when streaming ends.
     * Pass null to disable auto-collapse. Default 1500.
     */
    autoCollapseDelay?: number | null;
    /** Initial open state. Defaults to true. */
    defaultOpen?: boolean;
    /** Controlled open state. When provided, component is fully controlled. */
    open?: boolean;
    /** Called when the open state changes (user click or auto-collapse). */
    onOpenChange?: (open: boolean) => void;
    /**
     * 'streamEnd' (default): auto-collapse after streaming ends (respects autoCollapseDelay).
     * 'never': never auto-collapse; user must click to collapse.
     */
    collapseWhen?: 'streamEnd' | 'never';
    /** Label shown in the header when collapsed. Default "已思考". */
    summary?: string;
}
export declare function ThinkBlock({ content, streaming, autoCollapseDelay, defaultOpen, open, onOpenChange, collapseWhen, summary, }: ThinkBlockProps): import("react/jsx-runtime").JSX.Element;
