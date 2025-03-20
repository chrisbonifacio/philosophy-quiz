import React, { useEffect, useState } from 'react';
import { useGame } from '../contexts/GameContext';

export const Matchmaking: React.FC = () => {
    const [searching, setSearching] = useState(false);
    const { setGame } = useGame();

    const startMatchmaking = async () => {
        setSearching(true);
        // TODO: Implement matchmaking logic with Amplify API
    };

    const cancelMatchmaking = () => {
        setSearching(false);
        // TODO: Cancel matchmaking request
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Philosophy Quiz Game</h1>

            {!searching ? (
                <button
                    onClick={startMatchmaking}
                    className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Find Game
                </button>
            ) : (
                <div>
                    <div className="text-center mb-4">Searching for players...</div>
                    <button
                        onClick={cancelMatchmaking}
                        className="w-full py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};