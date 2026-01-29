import { Survey } from '../contracts';

const MOCK_SURVEY: Survey = {
  id: '1',
  name: 'Q4 Customer Satisfaction',
  blocks: [
    {
      id: 'block-1',
      name: 'Introduction',
      questions: [
        {
          id: 'q1',
          type: 'MultipleChoice',
          text: 'How would you rate your overall experience?',
          required: true,
          allowMultiple: false,
          displayFormat: 'vertical',
          choices: [
            { id: 'c1', text: 'Excellent' },
            { id: 'c2', text: 'Good' },
            { id: 'c3', text: 'Fair' },
            { id: 'c4', text: 'Poor' },
          ],
        },
        {
          id: 'q2',
          type: 'TextEntry',
          text: 'Please provide any additional comments:',
          required: false,
          format: 'multiLine',
        },
      ],
    },
  ],
  welcomePage: {
    enabled: true,
    title: 'Welcome to our survey',
    content: '<p>Thank you for taking the time to complete this survey.</p>',
  },
  consentPage: {
    enabled: false,
    statement: 'I consent to participate in this survey.',
  },
  thankYouPage: {
    enabled: true,
    title: 'Thank you!',
    content: '<p>Your feedback has been recorded.</p>',
  },
  lookAndFeel: {
    primaryColor: '#1ca08f',
    accentColor: '#a3dcf6',
    fontFamily: 'Inter',
    headingFont: 'Inter',
    baseFontSize: 'md',
    progressBarStyle: 'bar',
    progressBarPosition: 'top',
    borderRadius: 8,
    backgroundType: 'color',
    backgroundColor: '#f3f4f6',
    backgroundImageOpacity: 1,
    questionLayout: 'stacked',
    contentWidth: 'medium',
    selectionStyle: 'radio',
    buttonStyle: 'filled',
    buttonTextTransform: 'none',
    cardShadow: 'sm',
  },
  settings: {
    anonymityThreshold: 5,
    consentRequired: false,
    keywords: [],
  },
  createdAt: '2023-10-01T10:00:00Z',
  updatedAt: '2023-10-15T14:30:00Z',
};

export const surveyService = {
  getSurvey: async (surveyId: string): Promise<Survey> => {
    // TODO:BACKEND - Implement GET_SURVEY
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { ...MOCK_SURVEY, id: surveyId };
  },

  updateSurvey: async (surveyId: string, updates: Partial<Survey>): Promise<Survey> => {
    // TODO:BACKEND - Implement UPDATE_SURVEY
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { ...MOCK_SURVEY, ...updates, id: surveyId, updatedAt: new Date().toISOString() };
  },
};
