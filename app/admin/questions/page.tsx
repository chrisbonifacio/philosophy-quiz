'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import AdminQuestionManagement from '../../../src/components/AdminQuestionManagement';
import '@aws-amplify/ui-react/styles.css';
import { Navbar } from '@/src/components/Navbar';

export default function AdminQuestionsPage() {
    return (
        <Authenticator>
            {({ signOut }) => (
                <>
                    <Navbar signOut={signOut} />
                    <main className="min-h-screen p-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-3xl font-bold">Question Management</h1>
                                <button
                                    onClick={signOut}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg"
                                >
                                    Sign Out
                                </button>
                            </div>

                            <AdminQuestionManagement />
                        </div>
                    </main>
                </>
            )}
        </Authenticator>
    );
}
