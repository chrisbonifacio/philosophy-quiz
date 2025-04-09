'use client';

import { ReactNode, useEffect } from 'react';
import { configureAmplify } from '@/src/utils/amplifyConfig';

interface AmplifyProviderProps {
    children: ReactNode;
}

export function AmplifyProvider({ children }: AmplifyProviderProps) {
    useEffect(() => {
        configureAmplify();
    }, []);

    return <>{children}</>;
}
