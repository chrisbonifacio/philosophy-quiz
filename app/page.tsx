'use client';

import { useEffect, useState } from 'react';
import { isUserAdmin } from '@/src/utils/auth';
import { Authenticator } from '@aws-amplify/ui-react';
import { configureAmplify } from '@/src/utils/amplifyConfig';
import { Matchmaking } from '../src/components/Matchmaking';
import { Game } from '../src/components/Game';
import '@aws-amplify/ui-react/styles.css';
import { GameProvider, useGame } from '../src/contexts/GameContext';
import { Layout } from '@/src/components/Layout';
import { client } from '@/src/lib/amplifyClient';

export default function Home() {
  return (
    <Authenticator>
      {({ signOut, user }) => {
        const GameContent = () => {
          const { currentGame, setGame } = useGame();
          const [isAdmin, setIsAdmin] = useState(false);

          useEffect(() => {
            const checkAdminStatus = async () => {
              const adminStatus = await isUserAdmin();
              setIsAdmin(adminStatus);
            };
            checkAdminStatus();
          }, []);

          return (
            <Layout >
              {currentGame ? <Game gameId={currentGame.id} user={user} /> : <Matchmaking playerId={user?.username || ''} onMatchFound={async (gameId) => {
                try {
                  const gameResponse = await client.models.GameSession.get({ id: gameId });
                  if (gameResponse.data) {
                    setGame(gameResponse.data);
                  }
                } catch (error) {
                  console.error('Error fetching game session:', error);
                }
              }} />}
            </Layout>
          );
        };

        return (
          <GameProvider>
            <GameContent />
          </GameProvider>
        );
      }}
    </Authenticator>
  );
}