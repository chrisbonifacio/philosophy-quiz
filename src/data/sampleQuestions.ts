
import { Schema } from '../../amplify/data/resource';

type Question = Schema['Question']['createType'];

export const sampleQuestions: Question[] = [
    // Logic Questions
    {
        text: "Which of the following is an example of a logical fallacy?",
        options: [
            "Appeal to authority without relevant expertise",
            "Using empirical evidence to support a claim",
            "Drawing a conclusion from valid premises",
            "Using deductive reasoning"
        ],
        correctAnswer: "Appeal to authority without relevant expertise",
        category: "LOGIC",
        difficulty: "MEDIUM"
    },
    {
        text: "In a valid syllogism, if the premises are true, what must be true about the conclusion?",
        options: [
            "It must also be true",
            "It could be either true or false",
            "It must be false",
            "It depends on the context"
        ],
        correctAnswer: "It must also be true",
        category: "LOGIC",
        difficulty: "EASY"
    },

    // Ethics Questions
    {
        text: "What is the central idea of Kantian deontological ethics?",
        options: [
            "Actions should be judged by their consequences",
            "Actions should be judged by universal moral duties",
            "Virtue is the key to moral behavior",
            "Pleasure is the highest good"
        ],
        correctAnswer: "Actions should be judged by universal moral duties",
        category: "ETHICS",
        difficulty: "HARD"
    },
    {
        text: "What is the trolley problem primarily designed to explore?",
        options: [
            "The nature of moral decision-making",
            "The efficiency of public transportation",
            "The psychology of train conductors",
            "The physics of moving vehicles"
        ],
        correctAnswer: "The nature of moral decision-making",
        category: "ETHICS",
        difficulty: "MEDIUM"
    },

    // Epistemology Questions
    {
        text: "What is the main focus of epistemology?",
        options: [
            "The nature of existence",
            "The nature of knowledge",
            "The nature of morality",
            "The nature of beauty"
        ],
        correctAnswer: "The nature of knowledge",
        category: "EPISTEMOLOGY",
        difficulty: "EASY"
    },
    {
        text: "What is Plato's definition of knowledge in the Theaetetus?",
        options: [
            "Justified true belief",
            "Pure reason",
            "Sensory experience",
            "Divine inspiration"
        ],
        correctAnswer: "Justified true belief",
        category: "EPISTEMOLOGY",
        difficulty: "HARD"
    },

    // Metaphysics Questions
    {
        text: "What is the mind-body problem in philosophy?",
        options: [
            "The relationship between mental and physical phenomena",
            "Physical exercise and mental health",
            "Brain surgery techniques",
            "Meditation practices"
        ],
        correctAnswer: "The relationship between mental and physical phenomena",
        category: "METAPHYSICS",
        difficulty: "MEDIUM"
    },
    {
        text: "What is the principle of sufficient reason?",
        options: [
            "Everything that exists has a reason or cause",
            "Reason is sufficient for knowledge",
            "Scientific reasoning is the only valid method",
            "Human reason is limited"
        ],
        correctAnswer: "Everything that exists has a reason or cause",
        category: "METAPHYSICS",
        difficulty: "HARD"
    },

    // Religion Questions
    {
        text: "What is the ontological argument for God's existence?",
        options: [
            "God exists because the universe needs a creator",
            "God exists because of the design in nature",
            "God exists because the concept of a perfect being implies existence",
            "God exists because of religious experiences"
        ],
        correctAnswer: "God exists because the concept of a perfect being implies existence",
        category: "RELIGION",
        difficulty: "HARD"
    },
    {
        text: "What is religious pluralism?",
        options: [
            "The view that all religions are equally valid paths to truth",
            "The practice of multiple religions",
            "The rejection of all religions",
            "The dominance of one religion"
        ],
        correctAnswer: "The view that all religions are equally valid paths to truth",
        category: "RELIGION",
        difficulty: "MEDIUM"
    }
];

// Helper function to add all sample questions
export const addAllSampleQuestions = async (client: any) => {
    for (const question of sampleQuestions) {
        try {
            await client.models.Question.create(question);
        } catch (error) {
            console.error('Error adding question:', error);
        }
    }
};
