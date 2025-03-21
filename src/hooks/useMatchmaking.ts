import { useState, useEffect } from 'react';
import { MatchmakingService } from '../services/matchmaking';

export const useMatchmaking = (playerId: string) => {
    const [isSearching, setIsSearching] = useState(false);
    const [gameSessionId, setGameSessionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [matchStatus, setMatchStatus] = useState<'WAITING' | 'IN_PROGRESS' | 'COMPLETE' | null>(null);
    const [players, setPlayers] = useState<string[]>([]);

    const matchmakingService = new MatchmakingService();

    const startMatchmaking = async () => {
        try {
            setIsSearching(true);
            setError(null);

            const sessionId = await matchmakingService.findMatch({
                playerId,
            });

            setGameSessionId(sessionId);
            pollMatchStatus(sessionId);
        } catch (err) {
            setError('Failed to start matchmaking');
            setIsSearching(false);
        }
    };

    const pollMatchStatus = async (sessionId: string) => {
        try {
            const status = await matchmakingService.checkMatchStatus(sessionId);
            setMatchStatus(status.status);
            setPlayers(status.players);

            if (status.status === 'WAITING') {
                // Continue polling if still waiting
                setTimeout(() => pollMatchStatus(sessionId), 2000);
            } else if (status.status === 'IN_PROGRESS') {
                setIsSearching(false);
            }
        } catch (err) {
            setError('Failed to check match status');
            setIsSearching(false);
        }
    };

    const cancelMatchmaking = async () => {
        if (gameSessionId) {
            try {
                await matchmakingService.cancelMatchmaking(gameSessionId, playerId);
                setIsSearching(false);
                setGameSessionId(null);
                setMatchStatus(null);
                setPlayers([]);
            } catch (err) {
                setError('Failed to cancel matchmaking');
            }
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (gameSessionId && isSearching) {
                cancelMatchmaking();
            }
        };
    }, []);

    return {
        isSearching,
        gameSessionId,
        matchStatus,
        players,
        error,
        startMatchmaking,
        cancelMatchmaking,
    };
};