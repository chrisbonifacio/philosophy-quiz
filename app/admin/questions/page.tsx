'use client';

import AdminQuestionManagement from '../../../src/components/AdminQuestionManagement';
import { configureAmplify } from '@/src/utils/amplifyConfig';
import { AdminRoute } from '@/src/components/AdminRoute';
import { Layout } from '@/src/components/Layout';
import '@aws-amplify/ui-react/styles.css';

export default function AdminQuestionsPage() {
    return (
        <AdminRoute>
            <Layout>
                <AdminQuestionManagement />
            </Layout>
        </AdminRoute>
    );
}
