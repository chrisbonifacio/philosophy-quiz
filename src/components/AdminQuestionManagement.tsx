import { useState, useEffect } from 'react';
import { sampleQuestions, addAllSampleQuestions } from '../data/sampleQuestions';
import {
    Collection,
    Button,
    Card,
    Flex,
    Heading,
    SelectField,
    TextField,
    View,
    Alert,
} from '@aws-amplify/ui-react';
import { Schema } from '../../amplify/data/resource';
import { client } from '../lib/amplifyClient';

type Question = Schema['Question'];
type QuestionCategory = Schema['QuestionCategory'];
type QuestionDifficulty = Schema['QuestionDifficulty'];

const AdminQuestionManagement = () => {
    const [questions, setQuestions] = useState<Question['type'][]>([]);
    const [newQuestion, setNewQuestion] = useState<Question['createType']>({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        category: 'LOGIC',
        difficulty: 'MEDIUM',
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const { data } = await client.models.Question.list();
            setQuestions(data);
        } catch (err) {
            setError('Error fetching questions');
            console.error('Error fetching questions:', err);
        }
    };

    const handleCreateQuestion = async () => {
        try {
            if (!isValidQuestion(newQuestion)) {
                setError('Please fill in all required fields');
                return;
            }

            await client.models.Question.create({
                text: newQuestion.text!,
                options: newQuestion.options!,
                correctAnswer: newQuestion.correctAnswer!,
                category: newQuestion.category! as QuestionCategory['type'],
                difficulty: newQuestion.difficulty! as QuestionDifficulty['type'],
            });

            setNewQuestion({
                text: '',
                options: ['', '', '', ''],
                correctAnswer: '',
                category: 'LOGIC',
                difficulty: 'MEDIUM',
            });

            await fetchQuestions();
            setError(null);
        } catch (err) {
            setError('Error creating question');
            console.error('Error creating question:', err);
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        try {
            await client.models.Question.delete({ id });
            await fetchQuestions();
            setError(null);
        } catch (err) {
            setError('Error deleting question');
            console.error('Error deleting question:', err);
        }
    };

    const isValidQuestion = (question: Question['createType']): boolean => {
        return !!(
            question.text &&
            question.options &&
            question.options.length === 4 &&
            question.options.every(option => option?.trim() !== '') &&
            question.correctAnswer &&
            question.category &&
            question.difficulty
        );
    };

    return (
        <View padding="1rem">
            <Heading level={2}>Question Management</Heading>

            {error && (
                <Alert variation="error" marginBottom="1rem">
                    {error}
                </Alert>
            )}

            <Card variation="elevated" padding="1rem" marginBottom="1rem">
                <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
                    <Heading level={3}>Create New Question</Heading>
                    <Button
                        onClick={() => {
                            addAllSampleQuestions(client)
                                .then(() => {
                                    fetchQuestions();
                                    setError(null);
                                })
                                .catch(err => {
                                    setError('Error importing sample questions');
                                    console.error('Error importing questions:', err);
                                });
                        }}
                    >
                        Import Sample Questions
                    </Button>
                </Flex>
                <Flex direction="column" gap="1rem">
                    <TextField
                        label="Question Text"
                        value={newQuestion.text}
                        onChange={e => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                    />

                    {newQuestion.options.map((option, index) => (
                        option ?
                            <TextField
                                key={index}
                                label={`Option ${index + 1}`}
                                value={option}
                                onChange={e => {
                                    const newOptions = [...newQuestion.options!];
                                    newOptions[index] = e.target.value;
                                    setNewQuestion(prev => ({ ...prev, options: newOptions }));
                                }}
                            /> : null
                    ))}

                    <TextField
                        label="Correct Answer"
                        value={newQuestion.correctAnswer}
                        onChange={e => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    />

                    <SelectField
                        label="Category"
                        value={newQuestion.category}
                        onChange={e => setNewQuestion(prev => ({ ...prev, category: e.target.value as QuestionCategory['type'] }))}
                    >
                        {['LOGIC', 'ETHICS', 'EPISTEMOLOGY', 'METAPHYSICS', 'RELIGION'].map(category => (
                            <option key={category} value={category}>
                                {category.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </SelectField>

                    <SelectField
                        label="Difficulty"
                        value={newQuestion.difficulty}
                        onChange={e => setNewQuestion(prev => ({ ...prev, difficulty: e.target.value } as Question['type']))}
                    >
                        {['EASY', 'MEDIUM', 'HARD'].map(difficulty => (
                            <option key={difficulty} value={difficulty}>
                                {difficulty}
                            </option>
                        ))}
                    </SelectField>

                    <Button onClick={handleCreateQuestion}>Create Question</Button>
                </Flex>
            </Card>

            <Collection
                type="list"
                items={questions}
                gap="1rem"
            >
                {(question, index) => (
                    <Card key={index} variation="elevated" padding="1rem">
                        <Flex direction="column" gap="0.5rem">
                            <Heading level={4}>{question.text}</Heading>
                            <View>
                                {question.options.map((option, optIndex) => (
                                    <View key={optIndex}>
                                        {optIndex + 1}. {option}
                                        {option === question.correctAnswer && ' (Correct)'}
                                    </View>
                                ))}
                            </View>
                            <View>Category: {question.category}</View>
                            <View>Difficulty: {question.difficulty}</View>
                            <Button
                                variation="destructive"
                                onClick={() => handleDeleteQuestion(question.id)}
                            >
                                Delete Question
                            </Button>
                        </Flex>
                    </Card>
                )}
            </Collection>
        </View >
    );
};

export default AdminQuestionManagement;