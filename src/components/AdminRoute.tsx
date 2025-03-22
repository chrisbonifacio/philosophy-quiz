'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@aws-amplify/ui-react';
import { useAuth } from '@/src/hooks/useAuth';

interface AdminRouteProps {
    children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const { isAdmin, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAdmin && !isLoading) {
            router.push('/');
        }
    }, [isAdmin, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader size="large" />
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return <>{children}</>;
}
