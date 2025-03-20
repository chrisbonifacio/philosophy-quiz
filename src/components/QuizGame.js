import React, { useState, useEffect } from 'react';
import { client } from '../lib/amplifyClient';

const PHILOSOPHERS = {
    'Plato': ['Theory of Forms', 'The Republic', 'The Cave Allegory'],
    'Aristotle': ['Golden Mean', 'Four Causes', 'Virtue Ethics'],
    'Kant': ['Categorical Imperative', 'Synthetic A Priori', 'Transcendental Idealism'],
    'Nietzsche': ['Will to Power', 'Eternal Recurrence', 'Death of God']
};

export function QuizGame({ user, gameSession, onGameEnd }) {
    const [currentRound, setCurrentRound] = useState(0);
    const [score, setScore] = useState(0);
    const [statement, setStatement] = useState('');
    const [options, setOptions] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    useEffect(() => {
        // Initialize game round
        startNewRound();
    }, []);

    const startNewRound = () => {
        // Generate random philosophical statement and options
        const philosophers = Object.keys(PHILOSOPHERS);
        const correctPhilosopher = philosophers[Math.floor(Math.random() * philosophers.length)];
        const statement = PHILOSOPHERS[correctPhilosopher][Math.floor(Math.random() * PHILOSOPHERS[correctPhilosopher].length)];

        // Create shuffled options
        const shuffledOptions = [...philosophers].sort(() => Math.random() - 0.5);

        setStatement(statement);
        setOptions(shuffledOptions);
        setSelectedAnswer(null);
    };

    const handleAnswer = async (philosopher) => {
        setSelectedAnswer(philosopher);

        try {
            // Update game session with player's answer
            await client.models.GameSession.update({
                id: gameSession.id,
                playerAnswers: {
                    ...gameSession.playerAnswers,
                    [user.username]: philosopher
                }
            });

            if (currentRound < 5) {
                setTimeout(() => {
                    setCurrentRound(prev => prev + 1);
                    startNewRound();
                }, 1500);
            } else {
                onGameEnd();
            }
        } catch (error) {
            console.error('Error updating game session:', error);
        }
    };

    return (
        <div className="quiz-game">
            <div className="game-info">
                <span>Round: {currentRound + 1}/5</span>
                <span>Score: {score}</span>
            </div>

            <div className="question">
                <h3>Who said this?</h3>
                <p className="statement">{statement}</p>
            </div>

            <div className="options">
                {options.map(philosopher => (
                    <button
                        key={philosopher}
                        onClick={() => handleAnswer(philosopher)}
                        disabled={selectedAnswer !== null}
                        className={selectedAnswer === philosopher ? 'selected' : ''}
                    >
                        {philosopher}
                    </button>
                ))}
            </div>
        </div>
    );
}