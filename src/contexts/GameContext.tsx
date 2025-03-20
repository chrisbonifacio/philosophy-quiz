import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Game {
    // Add game properties as needed
    id: string;
}

interface GameContextType {
    currentGame: Game | null;
    setGame: (game: Game | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
    const [currentGame, setCurrentGame] = useState<Game | null>(null);

    const setGame = (game: Game | null) => {
        setCurrentGame(game);
    };

    return (
        <GameContext.Provider value={{ currentGame, setGame }}>
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
