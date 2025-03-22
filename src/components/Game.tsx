import React, { JSX, useEffect, useState } from 'react';
import { Schema } from '../../amplify/data/resource';
import { Card, Heading, Text, Button, Flex, Grid, View, Badge } from '@aws-amplify/ui-react';
import { client } from '../lib/amplifyClient';
import { useGame } from '../contexts/GameContext';
import { Question } from '../types/question';


const ROUND_TIME = 30;
const MAX_ROUNDS = 5;

export const Game: React.FC<{ gameId: string; user?: { username: string } }> = ({ gameId, user }): JSX.Element => {
    const { currentGame, setGame, updateGame } = useGame();
    const players = currentGame?.players || [];
    const [questions, setQuestions] = useState<NonNullable<Schema['Question']['type']>[]>([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [hasAnswered, setHasAnswered] = useState(false);
    const [roundEnded, setRoundEnded] = useState(false);
    const [roundAnswers, setRoundAnswers] = useState<Schema['PlayerAnswer']['type'][]>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!gameId) {
                setError('No game ID provided');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Get the game session first to get selected questions
                const gameResponse = await client.models.GameSession.get({ id: gameId });
                if (!gameResponse.data) {
                    throw new Error('Game session not found');
                }

                // Fetch the selected questions for this game
                const selectedQuestionIds = gameResponse.data.selectedQuestions;
                const questionsPromises = selectedQuestionIds.filter((id): id is string => id !== null).map(id =>
                    client.models.Question.get({ id })
                );

                const questionResponses = await Promise.all(questionsPromises);
                const loadedQuestions = questionResponses
                    .map(response => response.data)
                    .filter(isQuestion);

                // Type guard function for Question type
                function isQuestion(q: unknown): q is Schema['Question']['type'] {
                    if (!q || typeof q !== 'object') return false;

                    const question = q as Partial<Schema['Question']['type']>;
                    return (
                        typeof question.text === 'string' &&
                        Array.isArray(question.options) &&
                        question.options.every((opt: string | null) => typeof opt === 'string' || opt === null) &&
                        typeof question.correctAnswer === 'string' &&
                        typeof question.category === 'string' &&
                        typeof question.difficulty === 'string'
                    );
                }




                if (loadedQuestions.length !== MAX_ROUNDS) {
                    throw new Error('Failed to load all selected questions');
                }

                setQuestions(loadedQuestions as Question['type'][]);

                // Subscribe to game session updates
                const sub = client.models.GameSession.observeQuery({
                    filter: { id: { eq: gameId } }
                }).subscribe({
                    next: async ({ items }) => {
                        const game = items[0];
                        if (game) {
                            setGame(game);

                            // Handle game state updates
                            const answers = await game.answers();
                            if (answers.data) {
                                const roundAnswers = answers.data.filter(a => a.roundNumber === currentRound);
                                const allPlayersAnswered = game.players?.every(
                                    playerId => roundAnswers.some(a => a.playerId === playerId)
                                );

                                console.log({
                                    currentRound,
                                    roundAnswers,
                                    allPlayersAnswered,
                                    roundEnded,
                                    players: game.players
                                });

                                if (allPlayersAnswered && !roundEnded) {
                                    console.log('Advancing to next round');
                                    handleRoundEnd();
                                }
                            }
                        }
                    },
                    error: (error) => {
                        console.error('Subscription error:', error);
                        setError('Error receiving game updates');
                    }
                });

                return () => {
                    sub.unsubscribe();
                };
            } catch (error) {
                console.error('Error fetching initial data:', error);
                setError(error instanceof Error ? error.message : 'Failed to load game data');
            } finally {
                setIsLoading(false);
            }
        };

        const cleanup = fetchInitialData();
        return () => {
            cleanup.then(cleanupFn => cleanupFn?.());
        };
    }, [gameId, currentRound, roundEnded]);

    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);

    const currentQuestion = questions[currentRound];

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (timeLeft > 0 && currentGame?.status === 'IN_PROGRESS' && !hasAnswered && !roundEnded) {
            timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0 && !roundEnded) {
            handleRoundEnd();
        }

        // Subscribe to PlayerAnswer updates using the bidirectional relationship
        const sub = client.models.PlayerAnswer.observeQuery({
            filter: {
                gameSessionId: { eq: currentGame?.id },
                roundNumber: { eq: currentRound }
            }
        }).subscribe({
            next: ({ items }) => {
                if (!currentGame) return;

                // Update roundAnswers state with only current round answers
                setRoundAnswers(items.filter(answer => answer.roundNumber === currentRound));

                const playerAnswer = items.find(
                    answer => answer.playerId === user?.username &&
                        answer.roundNumber === currentRound
                );

                if (playerAnswer) {
                    setHasAnswered(true);
                    setSelectedOption(
                        currentQuestion?.options.findIndex(opt => opt === playerAnswer.answer) ?? null
                    );
                }

                // Check if all players have answered this round
                const allPlayersAnswered = currentGame.players.every(playerId =>
                    items.some(
                        answer => answer.playerId === playerId &&
                            answer.roundNumber === currentRound
                    )
                );

                if (allPlayersAnswered && !roundEnded) {
                    console.log('All players answered, ending round');
                    handleRoundEnd();
                }

                // Only update scores if they've changed
                const currentScores = currentGame?.scores ? JSON.parse(currentGame.scores as string) : {};
                if (JSON.stringify(currentScores) !== JSON.stringify(scores)) {
                    setScores(currentScores);
                }
            },
            error: (error) => {
                console.error('Subscription error:', error);
                setError('Error receiving answer updates');
            }
        });

        // Subscribe to game updates for score and round changes
        const gameSub = client.models.GameSession.observeQuery({
            filter: { id: { eq: gameId } }
        }).subscribe({
            next: ({ items }) => {
                const game = items[0];
                if (game) {
                    setGame(game);

                    if (game.scores) {
                        setScores(JSON.parse(game.scores as string));
                    }

                    if (game.currentRound !== currentRound) {
                        setCurrentRound(game.currentRound);
                        setTimeLeft(ROUND_TIME);
                        setHasAnswered(false);
                        setSelectedOption(null);
                        setRoundEnded(false);
                    }
                }
            }
        });

        return () => {
            clearTimeout(timer);
            sub.unsubscribe();
            gameSub.unsubscribe();
        };
    }, [timeLeft, currentGame?.status, hasAnswered, roundEnded, gameId, currentRound, currentQuestion?.options]);

    const handleOptionSelect = async (optionIndex: number) => {
        if (!currentGame || hasAnswered || roundEnded) return;

        const selectedAnswer = currentQuestion.options[optionIndex] || '';
        if (!selectedAnswer) return;
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
        const playerId = user?.username || '';

        try {
            // Create PlayerAnswer record using the bidirectional relationship
            const playerAnswer = await client.models.PlayerAnswer.create({
                gameSessionId: currentGame.id,
                playerId: playerId,
                roundNumber: currentRound,
                answer: selectedAnswer,
                isCorrect: isCorrect,
                timeLeft: timeLeft,
                timestamp: new Date().toISOString()
            });

            if (playerAnswer.data) {
                if (playerAnswer.data) {
                    setRoundAnswers(prev => [...prev, playerAnswer.data as Schema['PlayerAnswer']['type']]);
                }
            }

            // Update scores if correct
            if (isCorrect) {
                const pointsEarned = 1; // Award exactly 1 point for correct answer
                const currentScores = currentGame.scores ?
                    JSON.parse(currentGame.scores as string) : {};
                const newScores = {
                    ...currentScores,
                    [playerId]: (currentScores[playerId] || 0) + pointsEarned
                };

                await updateGame({
                    scores: JSON.stringify(newScores),
                    lastActionTime: new Date().toISOString()
                });
                setScores(newScores); // Update local state immediately
            }

            setHasAnswered(true);
            setSelectedOption(optionIndex);
        } catch (error) {
            console.error('Error submitting answer:', error);
            setError('Failed to submit answer');
        }
    };

    const handleRoundEnd = async () => {
        if (roundEnded || !currentGame) return;

        console.log('Handling round end', { currentRound, roundEnded });

        setRoundEnded(true);

        // If this is the last round, end the game
        if (currentRound >= MAX_ROUNDS - 1) {
            try {
                const finalScores = currentGame.scores ?
                    JSON.parse(currentGame.scores as string) : scores;

                await updateGame({
                    status: 'COMPLETE',
                    scores: JSON.stringify(finalScores),
                    lastActionTime: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error ending game:', error);
                setError('Failed to end game');
            }
            return;
        }

        // Wait 3 seconds before starting next round
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Reset states for next round
        setRoundAnswers([]);
        setSelectedOption(null);
        setHasAnswered(false);
        setRoundEnded(false);
        setTimeLeft(ROUND_TIME);

        try {
            const nextQuestion = questions[currentRound + 1];
            await updateGame({
                currentRound: currentRound + 1,
                timeLeft: ROUND_TIME,
                currentQuestion: nextQuestion.id,
                currentOptions: nextQuestion.options,
                correctAnswer: nextQuestion.correctAnswer,
                lastActionTime: new Date().toISOString(),
                status: 'IN_PROGRESS'
            });
        } catch (error) {
            console.error('Error updating round:', error);
            setError('Failed to start next round');
        }
    };

    if (isLoading) {
        return (
            <View padding="medium">
                <Text>Loading game data...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View padding="medium">
                <Text color="red">{error}</Text>
            </View>
        );
    }

    if (!currentGame || !currentQuestion) {
        return (
            <View padding="medium">
                <Text>No game data available</Text>
            </View>
        );
    }

    return (
        <View maxWidth="800px" margin="0 auto" padding="medium">
            <Card>
                <Flex direction="row" justifyContent="space-between" alignItems="center">
                    <Heading level={4}>Round {currentRound + 1} of {MAX_ROUNDS}</Heading>
                    <Badge variation="info">Time left: {timeLeft}s</Badge>
                </Flex>

                {currentGame?.status === 'COMPLETE' ? (
                    <View marginTop="medium">
                        <Heading level={3}>Game Complete!</Heading>
                        <View marginTop="medium">
                            <Heading level={4}>Final Scores:</Heading>
                            {Object.entries(scores).map(([playerId, score]) => (
                                <Text key={playerId}>
                                    {playerId}: {score} points
                                </Text>
                            ))}
                        </View>
                        <Button
                            onClick={() => window.location.reload()}
                            marginTop="medium"
                        >
                            Play Again
                        </Button>
                    </View>
                ) : (
                    <>
                        <View marginTop="medium">
                            <Heading level={3}>{currentQuestion?.text}</Heading>
                            <Flex direction="column" gap="small" marginTop="medium">
                                {currentQuestion?.options?.filter((option): option is string => option !== null).map((option, index) => {
                                    const userAnswer = roundAnswers.find(
                                        answer => answer.playerId === user?.username &&
                                            answer.roundNumber === currentRound
                                    );
                                    const allPlayersAnswered = currentGame.players.every(playerId =>
                                        roundAnswers.some(
                                            answer => answer.playerId === playerId &&
                                                answer.roundNumber === currentRound
                                        )
                                    );

                                    return (
                                        <Button
                                            key={index}
                                            onClick={() => handleOptionSelect(index)}
                                            variation={selectedOption === index ? "primary" : "destructive"}
                                            isDisabled={userAnswer !== undefined || (allPlayersAnswered && roundEnded)}
                                            width="100%"
                                            textAlign="left"
                                        >
                                            {option}
                                            {roundEnded && option === currentQuestion.correctAnswer &&
                                                " ✓ (Correct Answer)"}
                                        </Button>
                                    );
                                })}
                            </Flex>
                            {roundEnded && (
                                <View marginTop="medium" textAlign="center">
                                    <Text variation="info">
                                        Next round starting in 3 seconds...
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View marginTop="large">
                            <Heading level={4}>Players</Heading>
                            <Grid
                                templateColumns="1fr 1fr"
                                gap="medium"
                                marginTop="small"
                            >
                                {currentGame.players.map((playerId) => {
                                    const isCurrentPlayer = playerId === user?.username;
                                    const playerAnswer = roundAnswers.find(
                                        a => a.playerId === playerId && a.roundNumber === currentRound
                                    );

                                    return (
                                        <Card key={playerId} variation="elevated">
                                            <Flex direction="column" gap="small">
                                                <Text fontWeight="bold">
                                                    {isCurrentPlayer ? 'You' : `Player ${currentGame.players.indexOf(playerId) + 1}`}
                                                    {playerId === currentGame.hostId && " (Host)"}
                                                </Text>
                                                <Text>Score: {scores[playerId] || 0}</Text>
                                                {roundAnswers.length > 0 && (
                                                    <View>
                                                        <Text>Round {currentRound + 1}:</Text>
                                                        {playerAnswer ? (
                                                            <Badge
                                                                variation={
                                                                    isCurrentPlayer ?
                                                                        (playerAnswer.isCorrect ? "success" : "error") :
                                                                        (playerAnswer.isCorrect ? "success" : "warning")
                                                                }
                                                            >
                                                                {isCurrentPlayer ?
                                                                    (playerAnswer.isCorrect ? "Correct!" : "Incorrect") :
                                                                    "Answered"
                                                                }
                                                            </Badge>
                                                        ) : (
                                                            <Badge variation="warning">Waiting...</Badge>
                                                        )}
                                                    </View>
                                                )}
                                            </Flex>
                                        </Card>
                                    );
                                })}
                            </Grid>
                        </View>
                    </>
                )}
            </Card>
        </View>
    );
};