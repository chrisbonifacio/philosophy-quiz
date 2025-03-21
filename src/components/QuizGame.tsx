
import React, { useState, useEffect } from 'react';
import { Schema } from '../../amplify/data/resource';
import { Card, Heading, Text, Button, Flex, View, Badge } from '@aws-amplify/ui-react';
import { client } from '../lib/amplifyClient';

type Question = Schema['Question']['type'];
type GameSession = Schema['GameSession']['type'];

interface QuizGameProps {
    gameId: string;
    onGameComplete?: (scores: Record<string, number>) => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ gameId, onGameComplete }) => {
    const [currentGame, setCurrentGame] = useState<GameSession | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                const [gameResponse, questionsResponse] = await Promise.all([
                    client.models.GameSession.get({ id: gameId }),
                    client.models.Question.list()
                ]);

                if (!gameResponse.data) {
                    throw new Error('Game not found');
                }

                if (!questionsResponse.data || questionsResponse.data.length === 0) {
                    throw new Error('No questions available');
                }

                setCurrentGame(gameResponse.data);
                setQuestions(questionsResponse.data);
                setIsLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load game data');
                setIsLoading(false);
            }
        };

        fetchGameData();
    }, [gameId]);

    useEffect(() => {
        if (timeLeft > 0 && currentGame?.status === 'IN_PROGRESS' && !hasAnswered) {
            const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, currentGame?.status, hasAnswered]);

    const handleOptionSelect = async (optionIndex: number) => {
        if (!currentGame || hasAnswered) return;

        const currentQuestion = questions[currentRound];
        if (!currentQuestion) return;

        setSelectedOption(optionIndex);
        setHasAnswered(true);

        const selectedAnswer = currentQuestion.options[optionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        try {
            const currentAnswers = currentGame.playerAnswers ?
                JSON.parse(currentGame.playerAnswers as string) : {};

            const updatedAnswers = {
                ...currentAnswers,
                [currentRound]: {
                    ...currentAnswers[currentRound],
                    [currentGame.hostId]: {
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

            if (isCorrect) {
                const timeBonus = Math.floor(timeLeft / 5);
                const pointsEarned = 10 + timeBonus;

                setScores(prev => {
                    const newScores = {
                        ...prev,
                        [currentGame.hostId]: (prev[currentGame.hostId] || 0) + pointsEarned
                    };
                    return newScores;
                });
            }

            // Check if this was the last question
            if (currentRound >= questions.length - 1) {
                await handleGameComplete();
            } else {
                // Prepare for next question
                setTimeout(() => {
                    setCurrentRound(prev => prev + 1);
                    setSelectedOption(null);
                    setHasAnswered(false);
                    setTimeLeft(30);
                }, 2000);
            }
        } catch (err) {
            setError('Failed to submit answer');
        }
    };

    const handleGameComplete = async () => {
        try {
            await client.models.GameSession.update({
                id: gameId,
                status: 'COMPLETE',
                scores: JSON.stringify(scores)
            });
            onGameComplete?.(scores);
        } catch (err) {
            setError('Failed to complete game');
        }
    };

    if (isLoading) {
        return (
            <View padding="medium">
                <Text>Loading quiz...</Text>
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

    const currentQuestion = questions[currentRound];
    if (!currentQuestion) {
        return (
            <View padding="medium">
                <Text>No questions available</Text>
            </View>
        );
    }

    return (
        <Card variation="elevated">
            <Flex direction="column" gap="medium">
                <Flex justifyContent="space-between" alignItems="center">
                    <Heading level={4}>Question {currentRound + 1} of {questions.length}</Heading>
                    <Badge variation="info">Time: {timeLeft}s</Badge>
                </Flex>

                <Text>{currentQuestion.text}</Text>

                <Flex direction="column" gap="small">
                    {currentQuestion.options.map((option, index) => (
                        <Button
                            key={index}
                            onClick={() => handleOptionSelect(index)}
                            variation={selectedOption === index ? "primary" : "destructive"}
                            isDisabled={hasAnswered}
                        >
                            {option}
                        </Button>
                    ))}
                </Flex>

                {hasAnswered && (
                    <View>
                        <Text>
                            {selectedOption !== null &&
                                currentQuestion.options[selectedOption] === currentQuestion.correctAnswer
                                ? "Correct! ✓"
                                : `Incorrect. The correct answer was: ${currentQuestion.correctAnswer}`
                            }
                        </Text>
                    </View>
                )}

                <View>
                    <Heading level={5}>Score: {scores[currentGame?.hostId || ''] || 0}</Heading>
                </View>
            </Flex>
        </Card>
    );
};
