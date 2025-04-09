import { ReactNode, Suspense } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

interface AuthWrapperProps {
    children: ReactNode;
    fallback?: ReactNode;
}

const AuthContent = ({ children }: { children: ReactNode }) => {
    const { user } = useAuthenticator();

    if (!user) {
        throw new Error('Not authenticated');
    }

    return <>{children}</>;
};

export const AuthWrapper = ({ children, fallback = <div>Loading auth state...</div> }: AuthWrapperProps) => {
    return (
        <Suspense fallback={fallback}>
            <AuthContent>{children}</AuthContent>
        </Suspense>
    );
};
