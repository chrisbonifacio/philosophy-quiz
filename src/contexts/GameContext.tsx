import React, { createContext, useContext, useState, ReactNode } from 'react';

import { Schema } from '../../amplify/data/resource';
import { client } from '../lib/amplifyClient';

type Game = Schema['GameSession']['type'];

interface GameContextType {
    currentGame: Game | null;
    setGame: (game: Game | null) => void;
    updateGame: (updates: Partial<Game>) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
    const [currentGame, setCurrentGame] = useState<Game | null>(null);

    const updateGame = async (updates: Partial<Game>) => {
        if (!currentGame?.id) return;
        try {
            const response = await client.models.GameSession.update({
                id: currentGame.id,
                ...updates
            });
            if (response.data) {
                setCurrentGame(response.data);
            }
        } catch (error) {
            console.error('Error updating game:', error);
        }
    };

    return (
        <GameContext.Provider value={{
            currentGame,
            setGame: setCurrentGame,
            updateGame
        }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
