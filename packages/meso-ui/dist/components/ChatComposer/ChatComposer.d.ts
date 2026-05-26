import React from 'react';
import './ChatComposer.css';
export interface ChatComposerProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onStop?: () => void;
    streaming?: boolean;
    disabled?: boolean;
    placeholder?: string;
    /** Left side slot — attach buttons, upload, etc. */
    leadingSlot?: React.ReactNode;
    /** Right side actions. If omitted, default send/stop button is rendered. */
    trailingActions?: React.ReactNode;
    /** Max textarea rows before scrolling. Default 8. */
    maxRows?: number;
}
export declare function ChatComposer({ value, onChange, onSubmit, onStop, streaming, disabled, placeholder, leadingSlot, trailingActions, maxRows, }: ChatComposerProps): import("react/jsx-runtime").JSX.Element;
