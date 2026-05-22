import './ArtifactPanel.css';
export type ArtifactType = 'code' | 'html' | 'mermaid';
export interface ArtifactPanelProps {
    type: ArtifactType;
    content: string;
    language?: string;
    /** Whether content is still streaming in */
    streaming?: boolean;
    /** Called when user clicks the copy button */
    onCopy?: (content: string) => void;
    /** Called when user clicks download. If not provided, default browser download is triggered. */
    onDownload?: (content: string) => void;
}
export declare function ArtifactPanel({ type, content, language, streaming, onCopy, onDownload }: ArtifactPanelProps): import("react/jsx-runtime").JSX.Element;
