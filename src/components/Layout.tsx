'use client';

import React, { PropsWithChildren } from 'react';
import { Navbar } from './Navbar';


export const Layout = ({ children }: PropsWithChildren) => {
    return (
        <>
            <Navbar />
            <main className="min-h-screen p-4">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
        </>
    );
}
