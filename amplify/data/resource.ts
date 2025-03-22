import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  QuestionCategory: a.enum([
    "LOGIC",              // Reasoning, argumentation, fallacies
    "ETHICS",              // Moral philosophy, values, right/wrong
    "EPISTEMOLOGY",        // Theory of knowledge, truth, belief,
    "ONTOLOGY",           // Study of being, existence, categories of being
    "METAPHYSICS",         // Broader questions of reality, time, causation
    "POLITICAL",          // Political philosophy, justice, governance
    "EXISTENTIALISM",     // Meaning, authenticity, freedom
    "AESTHETICS",         // Beauty, art, taste
    "EASTERN",            // Buddhist, Taoist, Confucian philosophy
    "ANCIENT_GREEK",      // Pre-Socratics, Plato, Aristotle
    "MODERN",             // Enlightenment to 19th century
    "CONTEMPORARY",       // 20th century onwards
    "PHILOSOPHY_OF_MIND", // Consciousness, AI, mind-body problem
    "PHENOMENOLOGY",      // Study of consciousness and experience
    "LANGUAGE",           // Philosophy of language and meaning
    "RELIGION"            // Philosophy of religion and theology
  ]),
  QuestionDifficulty: a.enum(["EASY", "MEDIUM", "HARD"]),
  Question: a
    .model({
      text: a.string().required(),
      options: a.string().array().required(),
      correctAnswer: a.string().required(),
      category: a.ref('QuestionCategory').required(),
      difficulty: a.ref('QuestionDifficulty').required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .secondaryIndexes(index => [
      index('difficulty'),
      index('category')
    ])
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'update', 'delete']),
      allow.group('Admin')
    ]),
  GameStatus: a.enum(["WAITING", "IN_PROGRESS", "COMPLETE"]),
  PlayerAnswer: a
    .model({
      gameSessionId: a.id().required(),
      gameSession: a.belongsTo('GameSession', 'gameSessionId'),
      playerId: a.string().required(),
      roundNumber: a.integer().required(),
      answer: a.string().required(),
      isCorrect: a.boolean().required(),
      timeLeft: a.integer().required(),
      timestamp: a.string().required()
    })
    .secondaryIndexes(index => [
      index('gameSessionId'),
      index('playerId')
    ])
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.owner().to(['create']),
      allow.group('Admin')
    ]),
  GameSession: a
    .model({
      hostId: a.string().required(),
      status: a.ref("GameStatus").required(),
      players: a.string().array().required(),
      scores: a.json(),
      currentRound: a.integer().required().default(0),
      timeLeft: a.integer(),
      lastActionTime: a.datetime(),
      selectedQuestions: a.string().array().required(),  // Array of question IDs for this game session
      currentQuestion: a.string(),  // Current question ID
      currentOptions: a.string().array(),
      correctAnswer: a.string(),
      answers: a.hasMany('PlayerAnswer', 'gameSessionId')
    })
    .secondaryIndexes(index => [
      index('hostId').queryField("byHost"),
      index('status')
    ])
    .authorization(allow => [
      allow.authenticated().to(['read', 'update']),
      allow.ownersDefinedIn('players'),
      allow.group("Admin")
    ])
})

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  }
});
