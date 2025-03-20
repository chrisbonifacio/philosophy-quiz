import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Card, Heading, Button, Collection, Text, Flex, View, Loader } from '@aws-amplify/ui-react';

const client = generateClient();

export function GameLobby({ user, onGameStart }) {

    useEffect(() => {
        const sub = client.models.GameSession.observeQuery()
            .subscribe({
                next: ({ items }) => {
                    const availableGames = items.filter(game =>
                        game.status === 'WAITING' &&
                        game.hostId !== user.username
                    );
                    setAvailableGames(availableGames);
                }
            });

        return () => {
            sub.unsubscribe();
        };
    }, [user.username]);

    const [isSearching, setIsSearching] = useState(false);
    const [availableGames, setAvailableGames] = useState([]);

    const createGame = async () => {
        try {
            const newGame = await client.models.GameSession.create({
                hostId: user.username,
                status: 'WAITING',
                players: [user.username],
                scores: {},
                currentRound: 0,
                timeLeft: 30,
                lastActionTime: new Date().toISOString(),
                playerAnswers: {},
                currentQuestion: '',
                currentOptions: [],
                correctAnswer: ''
            });

            setIsSearching(true);
            onGameStart(newGame.data);
        } catch (error) {
            console.error('Error creating game:', error);
        }
    };

    const joinGame = async (gameId) => {
        try {
            const game = await client.models.GameSession.get({ id: gameId });
            if (game.data) {
                const updatedGame = await client.models.GameSession.update({
                    id: gameId,
                    players: [...game.data.players, user.username],
                    status: 'IN_PROGRESS'
                });
                onGameStart(updatedGame.data);
            }
        } catch (error) {
            console.error('Error joining game:', error);
        }
    };

    return (
        <Card variation="elevated" padding="medium">
            <Heading level={2}>Game Lobby</Heading>

            {!isSearching ? (
                <View>
                    <Button
                        variation="primary"
                        onClick={createGame}
                        marginTop="medium"
                        marginBottom="large"
                    >
                        Create New Game
                    </Button>

                    <Heading level={3}>Available Games</Heading>
                    <Collection
                        type="list"
                        items={availableGames}
                        gap="medium"
                        marginTop="medium"
                    >
                        {(game) => (
                            <Card key={game.id} variation="outlined">
                                <Flex justifyContent="space-between" alignItems="center">
                                    <Text>Host: {game.hostId}</Text>
                                    <Button
                                        variation="link"
                                        onClick={() => joinGame(game.id)}
                                    >
                                        Join Game
                                    </Button>
                                </Flex>
                            </Card>
                        )}
                    </Collection>
                </View>
            ) : (
                <Flex direction="column" alignItems="center" gap="medium">
                    <Loader size="large" />
                    <Text>Waiting for opponent...</Text>
                    <Button
                        variation="destructive"
                        onClick={() => setIsSearching(false)}
                    >
                        Cancel
                    </Button>
                </Flex>
            )}
        </Card>
    );
}