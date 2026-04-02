import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

type VishlexContextValue = {
    trackEvent: (name: string, properties?: Record<string, unknown>) => void;
};
declare function useVishlex(): VishlexContextValue;
type Props = {
    trackingId: string;
    collectUrl: string;
    disabled?: boolean;
    children: ReactNode;
};
declare function VishlexProvider({ trackingId, collectUrl, disabled, children }: Props): react_jsx_runtime.JSX.Element;

export { VishlexProvider, useVishlex };
