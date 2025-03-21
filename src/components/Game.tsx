import React, { useEffect, useState } from 'react';
import { Schema } from '../../amplify/data/resource';
import { Card, Heading, Text, Button, Flex, Grid, View, Badge } from '@aws-amplify/ui-react';
import { client } from '../lib/amplifyClient';

const ROUND_TIME = 30;
const MAX_ROUNDS = 5;

export const Game: React.FC<{ gameId: string }> = ({ gameId }) => {
    const [currentGame, setCurrentGame] = useState<Schema['GameSession']['type'] | null>(null);
    const [players] = useState<string[]>([]);
    const [questions, setQuestions] = useState<Schema['Question']['type'][]>([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [hasAnswered, setHasAnswered] = useState(false);
    const [roundEnded, setRoundEnded] = useState(false);

    useEffect(() => {
        const fetchGameData = async () => {
            if (!gameId) {
                setError('No game ID provided');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Fetch current game session
                const gameResponse = await client.models.GameSession.get({ id: gameId });
                if (!gameResponse.data) {
                    throw new Error('Game not found');
                }
                setCurrentGame(gameResponse.data);

                // Fetch questions for the game
                const questionsResponse = await client.models.Question.list();
                if (!questionsResponse.data || questionsResponse.data.length === 0) {
                    throw new Error('No questions available');
                }
                setQuestions(questionsResponse.data);
            } catch (error) {
                console.error('Error fetching game data:', error);
                setError(error instanceof Error ? error.message : 'Failed to load game data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchGameData();
    }, [gameId]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);

    const currentQuestion = questions[currentRound];

    useEffect(() => {
        if (timeLeft > 0 && currentGame?.status === 'IN_PROGRESS' && !hasAnswered) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !roundEnded) {
            handleRoundEnd();
        }
    }, [timeLeft, currentGame?.status, hasAnswered]);

    const handleOptionSelect = async (optionIndex: number) => {
        if (hasAnswered || roundEnded) return;

        setSelectedOption(optionIndex);
        setHasAnswered(true);

        const selectedAnswer = currentQuestion.options[optionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        // Update player's answer in the game session
        try {
            const currentAnswers = currentGame?.playerAnswers ?
                JSON.parse(currentGame.playerAnswers as string) : {};

            const updatedAnswers = {
                ...currentAnswers,
                [currentRound]: {
                    ...currentAnswers[currentRound],
                    [currentGame?.hostId || '']: {
                        answer: selectedAnswer,
                        isCorrect,
                        timeLeft
                    }
                }
            };

            await client.models.GameSession.update({
                id: gameId,
                playerAnswers: JSON.stringify(updatedAnswers)
            });

            // Update local scores
            if (isCorrect) {
                const timeBonus = Math.floor(timeLeft / 5);
                const pointsEarned = 10 + timeBonus;

                setScores(prev => ({
                    ...prev,
                    [currentGame?.hostId || '']: (prev[currentGame?.hostId || ''] || 0) + pointsEarned
                }));
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    };

    const handleRoundEnd = async () => {
        setRoundEnded(true);

        // If this is the last round, end the game
        if (currentRound >= MAX_ROUNDS - 1) {
            try {
                await client.models.GameSession.update({
                    id: gameId,
                    status: 'COMPLETE',
                    scores: JSON.stringify(scores)
                });
            } catch (error) {
                console.error('Error ending game:', error);
            }
            return;
        }

        // Prepare for next round
        setTimeout(async () => {
            setCurrentRound(prev => prev + 1);
            setSelectedOption(null);
            setHasAnswered(false);
            setRoundEnded(false);
            setTimeLeft(ROUND_TIME);

            try {
                await client.models.GameSession.update({
                    id: gameId,
                    currentRound: currentRound + 1,
                    timeLeft: ROUND_TIME
                });
            } catch (error) {
                console.error('Error updating round:', error);
            }
        }, 3000);
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
                                {currentQuestion?.options?.filter((option): option is string => option !== null).map((option, index) => (
                                    <Button
                                        key={index}
                                        onClick={() => handleOptionSelect(index)}
                                        variation={selectedOption === index ? "primary" : "destructive"}
                                        isDisabled={hasAnswered || roundEnded}
                                        width="100%"
                                        textAlign="left"
                                    >
                                        {option}
                                        {roundEnded && option === currentQuestion.correctAnswer &&
                                            " ✓ (Correct Answer)"}
                                    </Button>
                                ))}
                            </Flex>
                        </View>

                        <View marginTop="large">
                            <Heading level={4}>Players</Heading>
                            <Grid
                                templateColumns="1fr 1fr"
                                gap="medium"
                                marginTop="small"
                            >
                                {players.map((playerId) => (
                                    <Card key={playerId} variation="elevated">
                                        <Text fontWeight="bold">{playerId}</Text>
                                        <Text>Score: {scores[playerId] || 0}</Text>
                                        {hasAnswered && currentGame?.playerAnswers && (
                                            <Badge
                                                variation={
                                                    JSON.parse(currentGame.playerAnswers as string)[currentRound]?.[playerId]?.isCorrect
                                                        ? "success"
                                                        : "error"
                                                }
                                            >
                                                {JSON.parse(currentGame.playerAnswers as string)[currentRound]?.[playerId]?.isCorrect
                                                    ? "Correct!"
                                                    : "Incorrect"}
                                            </Badge>
                                        )}
                                    </Card>
                                ))}
                            </Grid>
                        </View>
                    </>
                )}
            </Card>
        </View>
    );
};