import { type ReactNode } from 'react';
import { type MesoLabels, type MesoLocale } from './labels';
export interface MesoLocaleContextValue {
    locale: MesoLocale;
    labels: MesoLabels;
}
export interface MesoLocaleProviderProps {
    locale?: MesoLocale;
    labels?: Partial<MesoLabels>;
    children: ReactNode;
}
export declare function MesoLocaleProvider({ locale, labels: labelOverrides, children, }: MesoLocaleProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useMesoLabels(): MesoLabels;
export declare function useMesoLocale(): MesoLocaleContextValue;
