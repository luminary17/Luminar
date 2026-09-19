(function (root) {
  'use strict';

  const INTRODUCTION = [
    {
      id: 'introduction-name',
      part: 1,
      assessed: false,
      answerLimitSeconds: 30,
      text: 'Good morning. My name is Mr. Monday. Can you tell me your full name, please?'
    },
    {
      id: 'introduction-id',
      part: 1,
      assessed: false,
      answerLimitSeconds: 30,
      text: 'Thank you. In a real test, I would now check your identification. For this practice, please just say that you are ready to continue.'
    }
  ];

  const TEST_SETS = [
    {
      id: 'skills-and-learning',
      part1: [
        { text: 'First, let’s talk about your work or studies. Do you work, or are you a student?' },
        { text: 'What do you find most interesting about your work or studies?' },
        { text: 'Is there anything you would like to change about your work or studies?' },
        { text: 'What would you like to do in the future?' },
        { text: 'Now let’s talk about learning new things. What is something new you have learned recently?' },
        { text: 'Do you prefer learning by yourself or with other people?' },
        { text: 'Was there a skill you found difficult to learn as a child?' },
        { text: 'Do you think you will learn a new skill in the next year?' }
      ],
      part2: {
        text: 'Now I’m going to give you a topic. I’d like you to describe a practical skill you would like to learn. You should say what the skill is, why you want to learn it, how you could learn it, and explain how it would be useful to you. You have one minute to prepare, and you may make notes if you wish.',
        startPrompt: 'All right? Remember, you have one to two minutes for this, so do not worry if I stop you. Please begin speaking now.',
        followUp: 'Do you think you will start learning this skill soon?'
      },
      part3: [
        'We’ve been talking about learning skills. What kinds of practical skills are most important for young people today?',
        'How is learning a skill from another person different from learning it online?',
        'Why do some adults stop trying to learn new things?',
        'Should schools give practical skills the same importance as academic subjects?',
        'How might the skills people need for work change in the future?'
      ]
    },
    {
      id: 'places-and-community',
      part1: [
        { text: 'First, let’s talk about where you live. Do you live in a house or an apartment?' },
        { text: 'What do you like most about the place where you live?' },
        { text: 'Is there anything you would like to change about it?' },
        { text: 'Do you think you will live there for a long time?' },
        { text: 'Now let’s talk about parks. Are there many parks near your home?' },
        { text: 'How often do you visit a park?' },
        { text: 'What do people in your area usually do in parks?' },
        { text: 'Did you spend much time in parks when you were a child?' }
      ],
      part2: {
        text: 'Now I’m going to give you a topic. I’d like you to describe a public place in your town or city that you enjoy visiting. You should say where it is, what it looks like, what people do there, and explain why you enjoy visiting it. You have one minute to prepare, and you may make notes if you wish.',
        startPrompt: 'All right? Remember, you have one to two minutes for this, so do not worry if I stop you. Please begin speaking now.',
        followUp: 'Would you recommend this place to a visitor?'
      },
      part3: [
        'We’ve been talking about public places. What makes a public place attractive to different age groups?',
        'Why are some public spaces used more than others?',
        'Who should be responsible for keeping public places clean and safe?',
        'Do modern cities provide enough places where people can meet each other?',
        'How might public spaces in cities change in the future?'
      ]
    },
    {
      id: 'objects-and-consumption',
      part1: [
        { text: 'First, let’s talk about shopping. How often do you go shopping for things you need?' },
        { text: 'Do you prefer shopping online or in a shop?' },
        { text: 'What kinds of things do you enjoy buying?' },
        { text: 'Has the way you shop changed in recent years?' },
        { text: 'Now let’s talk about keeping things. Do you keep many old possessions?' },
        { text: 'What kinds of things do people in your family keep for a long time?' },
        { text: 'Is it difficult for you to throw things away?' },
        { text: 'Do you think people keep more possessions now than in the past?' }
      ],
      part2: {
        text: 'Now I’m going to give you a topic. I’d like you to describe an object that is important to you. You should say what it is, how you got it, how long you have had it, and explain why it is important to you. You have one minute to prepare, and you may make notes if you wish.',
        startPrompt: 'All right? Remember, you have one to two minutes for this, so do not worry if I stop you. Please begin speaking now.',
        followUp: 'Would this object be easy to replace?'
      },
      part3: [
        'We’ve been talking about possessions. Why do people become emotionally attached to certain objects?',
        'Are the possessions people value today different from those valued in the past?',
        'What effect has advertising had on the number of things people buy?',
        'Should products be designed to last longer, even if that makes them more expensive?',
        'Do you think people will own fewer physical objects in the future?'
      ]
    }
  ];

  function createTest(setIndex) {
    const index = Number.isInteger(setIndex)
      ? Math.abs(setIndex) % TEST_SETS.length
      : Math.floor(Math.random() * TEST_SETS.length);
    const set = TEST_SETS[index];
    const part1 = set.part1.map((question, questionIndex) => ({
      id: `${set.id}-part1-${questionIndex + 1}`,
      part: 1,
      assessed: true,
      answerLimitSeconds: 30,
      ...question
    }));
    const part2 = {
      id: `${set.id}-part2`,
      part: 2,
      assessed: true,
      preparationSeconds: 60,
      answerLimitSeconds: 120,
      followUpAnswerLimitSeconds: 30,
      ...set.part2
    };
    const part3 = set.part3.map((text, questionIndex) => ({
      id: `${set.id}-part3-${questionIndex + 1}`,
      part: 3,
      assessed: true,
      answerLimitSeconds: 60,
      text
    }));
    return {
      id: set.id,
      questions: [...INTRODUCTION.map((question) => ({ ...question })), ...part1, part2, ...part3]
    };
  }

  const api = { TEST_SETS, createTest };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.IeltsSpeaking = api;
})(typeof window !== 'undefined' ? window : globalThis);
