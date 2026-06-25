import type { ResourceReadState } from '../../runtime';
import type { SimplifyOptions } from '../ProcessTrace/ProcessTrace';
import './ResourceReadBlock.css';
export interface ResourceReadBlockProps {
    resourceRead: ResourceReadState;
    className?: string;
    /** Verbosity controls default content expansion: detailed → open, others → collapsed. */
    simplify?: SimplifyOptions;
}
export declare function ResourceReadBlock({ resourceRead, className, simplify }: ResourceReadBlockProps): import("react/jsx-runtime").JSX.Element;
