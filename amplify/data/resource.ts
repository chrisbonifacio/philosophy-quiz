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
  GameSession: a
    .model({
      hostId: a.string().required(),
      status: a.ref("GameStatus").required(),
      players: a.string().array().required(),
      scores: a.json(),
      currentRound: a.integer(),
      timeLeft: a.integer(),
      lastActionTime: a.datetime(),
      playerAnswers: a.json(),
      currentQuestion: a.string(),
      currentOptions: a.string().array(),
      correctAnswer: a.string(),
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
