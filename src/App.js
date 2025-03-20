import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Authenticator, View, Heading, Button, Flex } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { GameLobby } from './components/GameLobby';
import { QuizGame } from './components/QuizGame';

const client = generateClient();

function App() {
    const [gameState, setGameState] = useState('lobby'); // lobby, playing
    const [gameSession, setGameSession] = useState(null);

    return (
        <Authenticator>
            {({ signOut, user }) => (
                <View padding="medium" maxWidth="1200px" margin="0 auto">
                    <Flex
                        as="header"
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        marginBottom="large"
                    >
                        <Heading level={1}>Philosophy Quiz Battle</Heading>
                        <Button onClick={signOut} variation="destructive">
                            Sign Out
                        </Button>
                    </Flex>

                    <View as="main">
                        {gameState === 'lobby' ? (
                            <GameLobby
                                user={user}
                                onGameStart={(session) => {
                                    setGameSession(session);
                                    setGameState('playing');
                                }}
                            />
                        ) : (
                            <QuizGame
                                user={user}
                                gameSession={gameSession}
                                onGameEnd={() => setGameState('lobby')}
                            />
                        )}
                    </View>
                </View>
            )}
        </Authenticator>
    );
}

export default App;