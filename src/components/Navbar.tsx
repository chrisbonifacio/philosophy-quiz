'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { View, Text, Button } from '@aws-amplify/ui-react';

export const Navbar: React.FC = () => {
    const { isAdmin, isAuthenticated, signOut, user } = useAuth();

    return (
        <nav className="bg-gradient-to-r from-indigo-600/80 via-blue-600/80 to-blue-700/80 text-white py-4 px-6 shadow-lg backdrop-blur-md border-b border-white/20 sticky top-0 z-50 supports-[backdrop-filter]:bg-white/10">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-white hover:text-blue-100 transition-all duration-300 transform hover:scale-105">
                    Philosophy Quiz
                </Link>
                <div className="flex items-center space-x-6">
                    <Link href="/" className="relative text-white/90 hover:text-white transition-all duration-300 font-medium group">
                        <span>Home</span>
                        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                    </Link>
                    {isAdmin && (
                        <>
                            <Link href="/admin/questions" className="relative text-white/90 hover:text-white transition-all duration-300 font-medium group">
                                <span>Questions</span>
                                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                            </Link>
                            <Link href="/admin/sessions" className="relative text-white/90 hover:text-white transition-all duration-300 font-medium group">
                                <span>Sessions</span>
                                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                            </Link>
                        </>
                    )}
                    {isAuthenticated && (
                        <View className="flex items-center gap-4">
                            <Text className="text-sm glassmorphism-player-id">
                                {isAuthenticated && `👤 ${user?.userId}`}
                            </Text>
                            <Button
                                onClick={() => signOut()}
                                variation="destructive"
                                size="small"
                                className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-red-500/20 backdrop-blur-sm border border-red-400/30"
                            >
                                Sign Out
                            </Button>
                        </View>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;