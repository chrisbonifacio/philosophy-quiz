'use client';

import { AdminGameSessionManagement } from '@/src/components/AdminGameSessionManagement';
import { configureAmplify } from '@/src/utils/amplifyConfig';
import { AdminRoute } from '@/src/components/AdminRoute';
import { Layout } from '@/src/components/Layout';
import '@aws-amplify/ui-react/styles.css';

// Configure Amplify before rendering
configureAmplify();

export default function AdminSessionsPage() {

    return (
        <AdminRoute>
            <Layout>
                <AdminGameSessionManagement />
            </Layout>
        </AdminRoute>
    );
}
