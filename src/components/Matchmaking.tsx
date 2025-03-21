import React from 'react';
import { useMatchmaking } from '../hooks/useMatchmaking';

interface MatchmakingProps {
    playerId: string;
    onMatchFound: (gameSessionId: string) => void;
}

export const Matchmaking: React.FC<MatchmakingProps> = ({ playerId, onMatchFound }) => {
    const {
        isSearching,
        gameSessionId,
        matchStatus,
        players,
        error,
        startMatchmaking,
        cancelMatchmaking,
    } = useMatchmaking(playerId);

    React.useEffect(() => {
        if (matchStatus === 'IN_PROGRESS' && gameSessionId) {
            onMatchFound(gameSessionId);
        }
    }, [matchStatus, gameSessionId]);

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="matchmaking">
            {!isSearching ? (
                <button onClick={startMatchmaking}>
                    Find Match
                </button>
            ) : (
                <div>
                    <div>Searching for players... ({players.length}/2)</div>
                    <button onClick={cancelMatchmaking}>
                        Cancel
                    </button>
                </div>
            )}

            {matchStatus === 'WAITING' && (
                <div>
                    <h3>Players in lobby:</h3>
                    <ul>
                        {players.map(player => (
                            <li key={player}>{player}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};