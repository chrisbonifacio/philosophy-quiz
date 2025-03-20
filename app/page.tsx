'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import amplifyConfig from '../amplify_outputs.json';
import { Matchmaking } from '../src/components/Matchmaking';
import { Game } from '../src/components/Game';

import '@aws-amplify/ui-react/styles.css';
import { GameProvider, useGame } from '../src/contexts/GameContext';

Amplify.configure(amplifyConfig);

export default function Home() {
  return (
    <Authenticator>
      {({ signOut, user }) => {
        const GameContent = () => {
          const { currentGame } = useGame();
          return (
            <main className="min-h-screen p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold">Philosophy Quiz</h1>
                  <button
                    onClick={signOut}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>

                {currentGame ? <Game /> : <Matchmaking />}
              </div>
            </main>
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