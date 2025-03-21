import { Schema } from '../../amplify/data/resource';
import { client } from '../lib/amplifyClient';

export interface MatchmakingRequest {
    playerId: string;
    preferredCategories?: string[];
}

export class MatchmakingService {
    private static MAX_PLAYERS = 2; // Number of players per game

    async findMatch(request: MatchmakingRequest): Promise<string> {
        // First look for available game sessions
        const availableGames = await client.models.GameSession.list({
            filter: {
                status: { eq: 'WAITING' },
                players: { size: { lt: MatchmakingService.MAX_PLAYERS } }
            }
        });

        // If there's an available game, join it
        if (availableGames.data && availableGames.data.length > 0) {
            const gameSession = availableGames.data[0];
            if (!gameSession) {
                throw new Error('No game session found');
            }

            // Update the game session with the new player
            const updatedPlayers = [...(gameSession.players || []), request.playerId];

            const updatedSession = await client.models.GameSession.update({
                id: gameSession.id,
                players: updatedPlayers,
                status: updatedPlayers.length >= MatchmakingService.MAX_PLAYERS ? 'IN_PROGRESS' : 'WAITING'
            });

            if (!updatedSession.data) {
                throw new Error('Failed to update game session');
            }
            return updatedSession.data.id;
        }

        // If no available games, create a new one
        const newSession = await client.models.GameSession.create({
            hostId: request.playerId,
            status: 'WAITING',
            players: [request.playerId],
            scores: JSON.stringify({ [request.playerId]: 0 }),
            currentRound: 0,
            timeLeft: 0,
            playerAnswers: JSON.stringify({}),
            currentQuestion: '',
            currentOptions: [],
            correctAnswer: '',
            lastActionTime: new Date().toISOString()
        });

        if (!newSession.data) {
            throw new Error('Failed to create game session');
        }
        return newSession.data.id;
    }

    async checkMatchStatus(gameSessionId: string): Promise<{
        status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETE';
        players: string[];
    }> {
        const response = await client.models.GameSession.get({ id: gameSessionId });
        const session = response.data;
        if (!session) {
            throw new Error('Game session not found');
        }

        return {
            status: session.status as 'WAITING' | 'IN_PROGRESS' | 'COMPLETE',
            players: (session.players || []).filter((player): player is string => player !== null)
        };
    }

    async cancelMatchmaking(gameSessionId: string, playerId: string): Promise<void> {
        const response = await client.models.GameSession.get({ id: gameSessionId });
        const session = response.data;

        if (!session) {
            return;
        }

        // If player is the host and only player, delete the session
        if (session.hostId === playerId && session.players && session.players.length === 1) {
            await client.models.GameSession.delete({ id: gameSessionId });
            return;
        }

        // Otherwise remove the player from the session
        const updatedPlayers = (session.players || []).filter(p => p !== playerId);
        await client.models.GameSession.update({
            id: gameSessionId,
            players: updatedPlayers
        });
    }
}