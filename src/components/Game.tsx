import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();
import { Card, Heading, Text, Button, Flex, Grid, View, Badge } from '@aws-amplify/ui-react';

export const Game: React.FC = () => {
    const [currentGame, setCurrentGame] = useState<any>(null);
    const [players, setPlayers] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentRound, setCurrentRound] = useState(0);

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                // Fetch current game session
                const gameResponse = await client.models.GameSession.get({ id: currentGame?.id });
                setCurrentGame(gameResponse.data);

                // Fetch questions for the game
                const questionsResponse = await client.models.Question.list();
                setQuestions(questionsResponse.data);
            } catch (error) {
                console.error('Error fetching game data:', error);
            }
        };

        fetchGameData();
    }, [currentGame?.id]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);

    const currentQuestion = questions[currentRound];

    useEffect(() => {
        if (timeLeft > 0 && currentGame?.status === 'IN_PROGRESS') {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, currentGame?.status]);

    const handleOptionSelect = (optionIndex: number) => {
        setSelectedOption(optionIndex);
        // TODO: Submit answer to API
    };

    if (!currentGame || !currentQuestion) {
        return <View padding="medium">Loading...</View>;
    }

    return (
        <View maxWidth="800px" margin="0 auto" padding="medium">
            <Card>
                <Flex direction="row" justifyContent="space-between" alignItems="center">
                    <Heading level={4}>Round {currentRound + 1}</Heading>
                    <Badge variation="info">Time left: {timeLeft}s</Badge>
                </Flex>

                <View marginTop="medium">
                    <Heading level={3}>{currentQuestion.text}</Heading>
                    <Flex direction="column" gap="small" marginTop="medium">
                        {currentQuestion.options.map((option: any, index: number) => (
                            <Button
                                key={index}
                                onClick={() => handleOptionSelect(index)}
                                variation={selectedOption === index ? "primary" : "destructive"}
                                width="100%"
                                textAlign="left"
                            >
                                {option}
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
                        {players.map((player) => (
                            <Card key={player.id} variation="elevated">
                                <Text fontWeight="bold">{player.userId}</Text>
                                <Text>Score: {player.score}</Text>
                            </Card>
                        ))}
                    </Grid>
                </View>
            </Card>
        </View>
    );
};