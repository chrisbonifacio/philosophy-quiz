
import Link from 'next/link';
import { Button } from '@aws-amplify/ui-react';

interface NavbarProps {
    signOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ signOut }) => {
    return (
        <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-3">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                            Philosophy Quiz
                        </span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link
                            href="/admin/questions"
                            className="text-gray-100 hover:text-white transition-colors duration-200 font-medium px-3 py-2 rounded-md hover:bg-white/10"
                        >
                            Admin
                        </Link>
                        {signOut && (
                            <Button
                                onClick={signOut}
                                variation="primary"
                                className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md font-medium transition-colors duration-200"
                                size="small"
                            >
                                Sign Out
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};