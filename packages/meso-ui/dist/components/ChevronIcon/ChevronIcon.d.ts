import './ChevronIcon.css';
export interface ChevronIconProps {
    /** true → points down (expanded), false → points right (collapsed) */
    open: boolean;
    size?: number;
    className?: string;
    'aria-label'?: string;
}
export declare function ChevronIcon({ open, size, className, 'aria-label': ariaLabel, }: ChevronIconProps): import("react/jsx-runtime").JSX.Element;
