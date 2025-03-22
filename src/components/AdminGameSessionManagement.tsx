import { useState, useEffect } from 'react';
import {
    Collection,
    Button,
    Card,
    Flex,
    Heading,
    View,
    Alert,
    Badge,
    Text,
} from '@aws-amplify/ui-react';
import { Schema } from '../../amplify/data/resource';
import { client } from '../lib/amplifyClient';

type GameSession = Schema['GameSession']['type'];

export const AdminGameSessionManagement = () => {
    const [sessions, setSessions] = useState<GameSession[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await client.models.GameSession.list();
            if (!response.data) {
                throw new Error('No data returned from API');
            }
            // Filter out any null sessions and ensure all required fields are present
            const validSessions = response.data.filter(session =>
                session &&
                session.id &&
                session.hostId &&
                session.players &&
                Array.isArray(session.players)
            );
            setSessions(validSessions);
            setIsLoading(false);
        } catch (err) {
            setError('Error fetching game sessions');
            console.error('Error fetching game sessions:', err);
            setSessions([]); // Set empty array on error
            setIsLoading(false);
        }
    };

    const handleDeleteSession = async (id: string) => {
        if (!id) {
            setError('Invalid session ID');
            return;
        }

        try {
            const response = await client.models.GameSession.delete({ id });
            if (!response.data) {
                throw new Error('Failed to delete session');
            }
            await fetchSessions();
            setError(null);
        } catch (err) {
            setError('Error deleting game session');
            console.error('Error deleting game session:', err);
        }
    };

    const getStatusBadgeVariation = (status: string) => {
        switch (status) {
            case 'WAITING':
                return 'warning';
            case 'IN_PROGRESS':
                return 'info';
            case 'COMPLETE':
                return 'success';
            default:
                return 'info';
        }
    };

    if (isLoading) {
        return <View padding="medium"><Text>Loading sessions...</Text></View>;
    }

    return (
        <View padding="1rem">
            <Heading level={2}>Game Session Management</Heading>

            {error && (
                <Alert variation="error" marginBottom="1rem">
                    {error}
                </Alert>
            )}

            <Collection
                type="list"
                items={sessions}
                gap="1rem"
            >
                {(session) => session && (
                    <Card key={session.id} variation="elevated" padding="1rem">
                        <Flex direction="column" gap="0.5rem">
                            <Flex justifyContent="space-between" alignItems="center">
                                <Heading level={4}>Session ID: {session.id || 'Unknown'}</Heading>
                                <Badge variation={getStatusBadgeVariation(session.status || 'UNKNOWN')}>
                                    {session.status || 'UNKNOWN'}
                                </Badge>
                            </Flex>

                            <View>Host: {session.hostId || 'Unknown'}</View>
                            <View>Players: {Array.isArray(session.players) ? session.players.filter(Boolean).join(', ') : 'None'}</View>
                            <View>Current Round: {session.currentRound ?? 0}</View>
                            <View>Time Left: {session.timeLeft ?? 0}s</View>

                            {session.scores && (
                                <View>
                                    <Text>Scores:</Text>
                                    <pre>
                                        {(() => {
                                            try {
                                                return JSON.stringify(JSON.parse(session.scores as string), null, 2);
                                            } catch (e) {
                                                return '{}';
                                            }
                                        })()}
                                    </pre>
                                </View>
                            )}

                            <Button
                                variation="destructive"
                                onClick={() => handleDeleteSession(session.id)}
                            >
                                Delete Session
                            </Button>
                        </Flex>
                    </Card>
                )}
            </Collection>
        </View>
    );
};