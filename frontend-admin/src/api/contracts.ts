export type ProjectStatus = 'Draft' | 'Ready' | 'Live' | 'Closed' | 'Archived';
export type ProjectType = 'Customer Experience' | 'Employee Experience';
export type ProjectSubType = 'Trigger' | 'Survey Event';

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  subType?: ProjectSubType;
  status: ProjectStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// INTERVIEW INSTANCE TYPES (Discovery Agent)
// ============================================

export type AgentType = 'explorer';
export type InstanceStatus = 'Draft' | 'Live' | 'Closed';
export type ParticipantStatus = 'invited' | 'started' | 'completed' | 'abandoned';

export interface InterviewInstance {
  id: string;
  projectId: string;
  name: string;
  agentType: AgentType;
  objective?: string;
  guidingQuestions?: string[];
  timeboxMinutes: number;
  maxTurns: number;
  status: InstanceStatus;
  participantCount?: number;
  sessionCount?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewConfig {
  id: string;
  name: string;
  agentType: AgentType;
  objective?: string;
  guidingQuestions: string[];
  timeboxMinutes: number;
  maxTurns: number;
}

export interface InterviewParticipant {
  id: string;
  instanceId: string;
  email: string;
  name?: string;
  background?: string;
  uniqueToken: string;
  status: ParticipantStatus;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  participantId: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  turnCount: number;
}

export interface InterviewMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  audioInput: boolean;
  timestamp: string;
}

// Agent type descriptions for UI
export const AGENT_TYPES: Record<AgentType, { name: string; description: string }> = {
  explorer: {
    name: 'Explorer',
    description: 'Open-ended discovery to uncover pain points, repetitive tasks, and workflow inefficiencies.',
  },
};

export type InstrumentType = 'Question' | 'Demographics' | 'Welcome Page' | 'Full Survey';
export type LibraryAccessLevel = 'global' | 'campaign' | 'project' | 'instance';
export type LibraryScope = 'system' | 'organization' | 'user';

export interface Instrument {
  id: string;
  name: string;
  type: InstrumentType;
  content: any; // Placeholder for complex survey logic
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // Access control
  accessLevel?: LibraryAccessLevel; // Determines visibility hierarchy
  scope?: LibraryScope; // System (built-in), Organization, or User-created
  ownerId?: string; // User who created it
  campaignId?: string; // If campaign-level
  projectId?: string; // If project-level
  instanceId?: string; // If instance-level
}

export interface Message {
  id: string;
  name: string;
  subject?: string;
  content: string;
  type: 'Email' | 'SMS';
  createdAt: string;
  updatedAt: string;
  // Access control
  accessLevel?: LibraryAccessLevel;
  scope?: LibraryScope;
  ownerId?: string;
  campaignId?: string;
  projectId?: string;
  instanceId?: string;
}

// ============================================
// SURVEY BUILDER DATA MODELS
// ============================================

// Embedded Data Types
export type EmbeddedDataType = 'text' | 'number' | 'boolean' | 'date';

export interface EmbeddedDataField {
  name: string;
  label?: string;
  dataType: EmbeddedDataType;
  suggestedValues?: string[];
  isSystemField: boolean;
}

export interface EmbeddedDataSchema {
  fields: EmbeddedDataField[];
  allowUndefinedFields: boolean;
}

export type QuestionType =
  | 'MultipleChoice'
  | 'TextEntry'
  | 'FormField'
  | 'MatrixTable'
  | 'SideBySide'
  | 'Slider'
  | 'RankOrder'
  | 'ConstantSum'
  | 'PickGroupRank'
  | 'NetPromoter'
  | 'TextGraphic'
  | 'HotSpot'
  | 'Heatmap'
  | 'PageBreak';

export type ValidationRule = {
  type: 'required' | 'minChoices' | 'maxChoices' | 'minLength' | 'maxLength' | 'contentType';
  value?: number | string;
  message?: string;
};

export type DisplayLogicOperator = 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan' | 'isAnswered' | 'isNotAnswered';

export type DisplayLogicSourceType = 'question' | 'embeddedData';

export interface DisplayLogicCondition {
  id: string;
  sourceType: DisplayLogicSourceType;
  // For question source
  questionId?: string;
  // For embedded data source
  embeddedFieldName?: string;
  embeddedFieldType?: 'defined' | 'custom';
  // Common
  operator: DisplayLogicOperator;
  value?: string | number | string[] | boolean;
}

export interface DisplayLogic {
  enabled: boolean;
  conditions: DisplayLogicCondition[];
  operator: 'AND' | 'OR';
}

export type SkipLogicTarget = 'question' | 'endOfSurvey' | 'endOfBlock';

export interface SkipLogic {
  enabled: boolean;
  conditions: DisplayLogicCondition[];
  operator: 'AND' | 'OR';
  targetType: SkipLogicTarget;
  targetQuestionId?: string;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  description?: string;
  required: boolean;
  validationType?: 'force' | 'request' | 'none';
  displayLogic?: DisplayLogic;
  skipLogic?: SkipLogic;
  randomize?: boolean;
  dimensions?: string[]; // Tags for reporting groupings
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'MultipleChoice';
  allowMultiple: boolean;
  choices: Array<{ id: string; text: string; isExclusive?: boolean }>;
  displayFormat: 'vertical' | 'horizontal' | 'dropdown' | 'columns';
  columnCount?: number;
  validation?: ValidationRule[];
}

export interface TextEntryQuestion extends BaseQuestion {
  type: 'TextEntry';
  format: 'singleLine' | 'multiLine' | 'essay' | 'password';
  contentType?: 'email' | 'phone' | 'date' | 'number' | 'postalCode' | 'url';
  validation?: ValidationRule[];
}

export interface MatrixTableQuestion extends BaseQuestion {
  type: 'MatrixTable';
  rows: Array<{ id: string; text: string; groupId?: string }>;
  columns: Array<{ id: string; text: string; value?: number }>;
  allowMultiple: boolean;
  variation: 'likert' | 'bipolar' | 'constantSum' | 'textEntry' | 'rankOrder' | 'profile' | 'maxDiff';
  // Display options
  transpose?: boolean;
  positionTextAbove?: boolean;
  repeatHeaders?: number; // Repeat headers every N rows (0 = disabled)
  addWhitespace?: boolean;
  mobileFriendly?: boolean;
  tableWidth?: 'auto' | 'narrow' | 'medium' | 'wide' | 'full'; // New table width setting
  // Statement groups
  groups?: Array<{ id: string; name: string }>;
  // Variation-specific options
  scalePoints?: Array<{ id: string; label: string; value: number }>; // For likert
  minLabel?: string; // For bipolar
  maxLabel?: string; // For bipolar
  profileScales?: Record<string, { min: number; max: number; type: 'stars' | 'slider' }>; // For profile
  validation?: ValidationRule[];
}

export type ReputationIndexPreset = 
  | 'likelihood'
  | 'probability' 
  | 'recommendation'
  | 'satisfaction'
  | 'emotional'
  | 'experience'
  | 'helpfulness'
  | 'expectations'
  | 'trust'
  | 'confidence'
  | 'retention'
  | 'value'
  | 'absolute';

export interface NetPromoterQuestion extends BaseQuestion {
  type: 'NetPromoter';
  minLabel?: string;
  maxLabel?: string;
  scalePreset?: ReputationIndexPreset;
  validation?: ValidationRule[];
}

export interface ConstantSumQuestion extends BaseQuestion {
  type: 'ConstantSum';
  items: Array<{ id: string; text: string; value?: number }>;
  displayFormat: 'textBoxes' | 'bars' | 'sliders';
  mustTotal?: number;
  showTotal: boolean;
  unit?: string;
  unitPosition: 'before' | 'after';
  minPerItem?: number;
  maxPerItem?: number;
  validation?: ValidationRule[];
}

export interface FormFieldQuestion extends BaseQuestion {
  type: 'FormField';
  fields: Array<{
    id: string;
    label: string;
    required: boolean;
    size: 'short' | 'medium' | 'long' | 'essay';
    contentType?: 'email' | 'phone' | 'date' | 'number' | 'postalCode' | 'url';
  }>;
  validation?: ValidationRule[];
}

export interface HeatMapQuestion extends BaseQuestion {
  type: 'Heatmap';
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  maxClicks: number;
  clicks: Array<{ id: string; x: number; y: number; regionId?: string }>;
  regions?: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  validation?: ValidationRule[];
}

export interface TextGraphicQuestion extends BaseQuestion {
  type: 'TextGraphic';
  contentType: 'text' | 'graphic' | 'file';
  content: string; // Rich text for 'text', URL for 'graphic' and 'file'
  caption?: string;
  fileName?: string; // For file type
}

export interface SliderQuestion extends BaseQuestion {
  type: 'Slider';
  statements: Array<{ id: string; text: string; value?: number }>;
  displayType: 'bars' | 'sliders' | 'stars';
  min: number;
  max: number;
  decimals: number;
  increments?: number;
  snapToIncrements: boolean;
  defaultValue?: number;
  showValue: boolean;
  labels?: Array<{ value: number; text: string }>;
  allowNA: boolean;
  naLabel?: string;
  starsInteraction?: 'discrete' | 'halfStep' | 'continuous';
  validation?: ValidationRule[];
}

export interface HotSpotQuestion extends BaseQuestion {
  type: 'HotSpot';
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  mode: 'onOff' | 'likeDislike';
  regions: Array<{
    id: string;
    name: string;
    shape: 'rectangle' | 'polygon';
    // For rectangles
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    // For polygons
    points?: Array<{ x: number; y: number }>;
    // Selection state
    selected?: boolean; // For onOff mode
    rating?: 'like' | 'dislike' | null; // For likeDislike mode
  }>;
  minRegions?: number;
  maxRegions?: number;
  showRegionOutlines?: boolean; // Always show outlines vs hover only
  validation?: ValidationRule[];
}

export interface RankOrderQuestion extends BaseQuestion {
  type: 'RankOrder';
  items: Array<{ id: string; text: string; rank?: number }>;
  format: 'dragDrop' | 'radioButtons' | 'textBox' | 'selectBox';
  mustRankAll?: boolean;
  minRank?: number;
  maxRank?: number;
  validation?: ValidationRule[];
}

export interface PickGroupRankQuestion extends BaseQuestion {
  type: 'PickGroupRank';
  items: Array<{ id: string; text: string; groupId?: string; rank?: number }>;
  groups: Array<{ id: string; name: string; minItems?: number; maxItems?: number }>;
  columns?: number; // 1 or 2 for group layout
  stackItems?: boolean;
  stackItemsInGroups?: boolean;
  validation?: ValidationRule[];
}

// Column logic for Side by Side questions - show/hide column based on prior column responses
export interface ColumnLogic {
  enabled: boolean;
  sourceColumnId: string; // Which column to check
  conditions: DisplayLogicCondition[];
  operator: 'AND' | 'OR';
}

export interface SideBySideQuestion extends BaseQuestion {
  type: 'SideBySide';
  statements: Array<{ id: string; text: string }>;
  columns: Array<{
    id: string;
    header: string;
    type: 'singleAnswer' | 'multipleAnswer' | 'dropdown' | 'textEntry';
    choices?: Array<{ id: string; text: string; value?: number }>;
    textSize?: 'short' | 'medium' | 'long' | 'essay';
    contentType?: 'email' | 'phone' | 'date' | 'number' | 'url';
    required?: boolean;
    columnLogic?: ColumnLogic; // Logic to show/hide this column based on prior column responses
  }>;
  repeatHeaders?: number;
  validation?: ValidationRule[];
}

export interface PageBreakQuestion extends BaseQuestion {
  type: 'PageBreak';
}

export type Question = 
  | MultipleChoiceQuestion 
  | TextEntryQuestion 
  | MatrixTableQuestion 
  | NetPromoterQuestion 
  | ConstantSumQuestion 
  | FormFieldQuestion 
  | HeatMapQuestion
  | TextGraphicQuestion
  | SliderQuestion
  | HotSpotQuestion
  | RankOrderQuestion
  | PickGroupRankQuestion
  | SideBySideQuestion
  | PageBreakQuestion;

// Block-level settings for randomization and validation
export interface BlockSettings {
  randomizeQuestions?: boolean; // Randomize order of questions in this block
  randomizeOptions?: boolean; // Randomize response options for all questions in block
  startOnNewPage?: boolean; // Force this block to start on a new page
  requiredQuestions?: 'all' | 'inherit';
  allQuestionsRequired?: boolean; // Deprecated
  minQuestionsRequired?: number; // Deprecated
  minRequired?: number; // Deprecated
}

export interface Block {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  randomize?: boolean; // Legacy - use settings.randomizeQuestions
  displayLogic?: DisplayLogic;
  settings?: BlockSettings;
}

export interface WelcomePage {
  enabled: boolean;
  title: string;
  content: string;
}

export interface ConsentPage {
  enabled: boolean;
  statement: string;
}

export interface ThankYouPage {
  enabled: boolean;
  title: string;
  content: string;
  redirectUrl?: string;
  redirectDelay?: number;
}

export interface EmailTemplate {
  id: string;
  type: 'invitation' | 'reminder1' | 'reminder2' | 'reminderFinal' | 'completion';
  subject: string;
  content: string;
  enabled: boolean;
  schedule?: {
    trigger: 'daysAfterLaunch' | 'daysBeforeClose' | 'specificDate';
    value: number | string;
  };
}

// Selection style for multiple choice questions
export type SelectionStyle = 'radio' | 'bubble' | 'pill' | 'button';

export interface LookAndFeel {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  headingFont?: string; // New: Separate font for headings
  baseFontSize?: 'sm' | 'md' | 'lg'; // New: Base font size
  progressBarStyle: 'bar' | 'percentage' | 'pageCount';
  progressBarPosition?: 'top' | 'bottom';
  borderRadius: number;
  backgroundColor?: string;
  backgroundType?: 'color' | 'image';
  backgroundImageOpacity?: number; // New: Opacity for background image
  headerImageUrl?: string;
  questionLayout?: 'stacked' | 'multi';
  contentWidth?: 'narrow' | 'medium' | 'wide';
  selectionStyle?: SelectionStyle; // Global style for MC selections
  buttonStyle?: 'filled' | 'outline' | 'soft'; // New: Button style
  buttonTextTransform?: 'uppercase' | 'capitalize' | 'none'; // New: Button text transform
  cardShadow?: 'none' | 'sm' | 'md' | 'lg'; // New: Card shadow intensity
  
  // Advanced Customization
  animation?: 'none' | 'fade' | 'slide' | 'scale';
  glassOpacity?: number; // 0-100, enables glassmorphism
  inputStyle?: 'standard' | 'flushed' | 'filled' | 'floating';
  borderWidth?: number; // 0-8
  borderColor?: string;
}

export interface SurveySettings {
  anonymityThreshold: number;
  consentRequired: boolean;
  keywords: Array<{ term: string; definition: string }>;
  itemsPerPage?: number; // Overrides manual page breaks if set
  globalRandomizeQuestions?: boolean; // Randomize all questions across survey
  globalRandomizeOptions?: boolean; // Randomize options for all applicable questions
}

// Dimension definitions for reporting groupings
export interface DimensionDefinition {
  id: string;
  name: string;
  color?: string; // For UI display
  description?: string;
}

export interface Survey {
  id: string;
  name: string;
  blocks: Block[];
  welcomePage: WelcomePage;
  consentPage: ConsentPage;
  thankYouPage: ThankYouPage;
  lookAndFeel: LookAndFeel;
  settings: SurveySettings;
  embeddedDataSchema?: EmbeddedDataSchema;
  dimensionDefinitions?: DimensionDefinition[]; // Available dimensions for tagging questions
  createdAt: string;
  updatedAt: string;
}

// Note: InstanceStatus is defined at the top of this file with Interview types

export interface SurveyInstance {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  surveyId: string;
  status: InstanceStatus;
  launchDate?: string;
  closeDate?: string;
  respondentCount?: number;
  responseCount?: number;
  emailTemplates: EmailTemplate[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ApiContract = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  route: string;
  auth: 'required' | 'optional' | 'none';
  requestSchema?: any;
  responseSchema: any;
  errors: Record<number, string>;
  usedIn: string[];
};

// ============================================
// DISTRIBUTION DATA MODELS
// ============================================

export type DistributionMethod = 'email' | 'anonymousLink' | 'qrCode' | 'sms' | 'webOverlay';

export type EmailDistributionStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed';

export type ContactStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'started' | 'completed' | 'bounced' | 'unsubscribed';

export interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  customFields?: Record<string, string | number | boolean>;
  status: ContactStatus;
  uniqueLink?: string;
  sentAt?: string;
  openedAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface ContactList {
  id: string;
  name: string;
  description?: string;
  contacts: Contact[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailMessageTemplate {
  id: string;
  type: 'invitation' | 'reminder' | 'thankYou';
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  htmlContent: string;
  textContent?: string;
  enabled: boolean;
}

export interface EmailSchedule {
  id: string;
  templateId: string;
  type: 'immediate' | 'scheduled' | 'triggered';
  // For scheduled sends
  scheduledDate?: string;
  // For triggered sends (e.g., reminders)
  triggerType?: 'daysAfterInvite' | 'daysBeforeClose' | 'nonResponders';
  triggerValue?: number;
  // Status
  status: EmailDistributionStatus;
  sentCount?: number;
  deliveredCount?: number;
  openedCount?: number;
  clickedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnonymousLinkSettings {
  enabled: boolean;
  url: string;
  allowMultipleResponses: boolean;
  expiresAt?: string;
  maxResponses?: number;
  currentResponses: number;
  password?: string;
  createdAt: string;
}

export interface QRCodeSettings {
  enabled: boolean;
  linkType: 'anonymous' | 'unique';
  url: string;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  logoUrl?: string;
  downloadCount: number;
  createdAt: string;
}

export interface Distribution {
  id: string;
  instanceId: string;
  method: DistributionMethod;
  name: string;
  status: EmailDistributionStatus;
  // Email-specific
  contactListId?: string;
  emailTemplates?: EmailMessageTemplate[];
  emailSchedules?: EmailSchedule[];
  // Anonymous link settings
  anonymousLink?: AnonymousLinkSettings;
  // QR Code settings
  qrCode?: QRCodeSettings;
  // Stats
  totalSent?: number;
  totalStarted?: number;
  totalCompleted?: number;
  responseRate?: number;
  createdAt: string;
  updatedAt: string;
}

// Define the contracts registry
export const API_CONTRACTS = {
  GET_PROJECTS: {
    method: 'GET',
    route: '/api/projects',
    auth: 'required',
    responseSchema: {} as Project[],
    errors: { 401: 'Unauthorized' },
    usedIn: ['ProjectsPage'],
  },
  CREATE_PROJECT: {
    method: 'POST',
    route: '/api/projects',
    auth: 'required',
    requestSchema: {} as Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'owner' | 'status'>,
    responseSchema: {} as Project,
    errors: { 400: 'Validation Error' },
    usedIn: ['NewProjectModal'],
  },
  GET_INSTRUMENTS: {
    method: 'GET',
    route: '/api/library/instruments',
    auth: 'required',
    responseSchema: {} as Instrument[],
    errors: { 401: 'Unauthorized' },
    usedIn: ['InstrumentLibraryPage'],
  },
  GET_MESSAGES: {
    method: 'GET',
    route: '/api/library/messages',
    auth: 'required',
    responseSchema: {} as Message[],
    errors: { 401: 'Unauthorized' },
    usedIn: ['MessageLibraryPage'],
  },
  GET_SURVEY: {
    method: 'GET',
    route: '/api/surveys/:surveyId',
    auth: 'required',
    responseSchema: {} as Survey,
    errors: { 404: 'Survey Not Found' },
    usedIn: ['SurveyBuilder'],
  },
  UPDATE_SURVEY: {
    method: 'PATCH',
    route: '/api/surveys/:surveyId',
    auth: 'required',
    requestSchema: {} as Partial<Survey>,
    responseSchema: {} as Survey,
    errors: { 400: 'Validation Error', 404: 'Survey Not Found' },
    usedIn: ['SurveyBuilder'],
  },
  GET_INSTANCES: {
    method: 'GET',
    route: '/api/projects/:projectId/instances',
    auth: 'required',
    responseSchema: {} as SurveyInstance[],
    errors: { 404: 'Project Not Found' },
    usedIn: ['ProjectInstancesPage'],
  },
  GET_INSTANCE: {
    method: 'GET',
    route: '/api/instances/:instanceId',
    auth: 'required',
    responseSchema: {} as SurveyInstance,
    errors: { 404: 'Instance Not Found' },
    usedIn: ['SurveyBuilder'],
  },
  CREATE_INSTANCE: {
    method: 'POST',
    route: '/api/projects/:projectId/instances',
    auth: 'required',
    requestSchema: {} as Pick<SurveyInstance, 'name' | 'description'>,
    responseSchema: {} as SurveyInstance,
    errors: { 400: 'Validation Error' },
    usedIn: ['NewInstanceModal'],
  },
  
  // ============================================
  // DISTRIBUTION API CONTRACTS
  // ============================================
  
  GET_DISTRIBUTIONS: {
    method: 'GET',
    route: '/api/instances/:instanceId/distributions',
    auth: 'required',
    responseSchema: {} as Distribution[],
    errors: { 404: 'Instance Not Found' },
    usedIn: ['DistributionsTab'],
  },
  GET_DISTRIBUTION: {
    method: 'GET',
    route: '/api/distributions/:distributionId',
    auth: 'required',
    responseSchema: {} as Distribution,
    errors: { 404: 'Distribution Not Found' },
    usedIn: ['DistributionsTab'],
  },
  CREATE_DISTRIBUTION: {
    method: 'POST',
    route: '/api/instances/:instanceId/distributions',
    auth: 'required',
    requestSchema: {} as Pick<Distribution, 'method' | 'name'>,
    responseSchema: {} as Distribution,
    errors: { 400: 'Validation Error' },
    usedIn: ['DistributionsTab'],
  },
  UPDATE_DISTRIBUTION: {
    method: 'PATCH',
    route: '/api/distributions/:distributionId',
    auth: 'required',
    requestSchema: {} as Partial<Distribution>,
    responseSchema: {} as Distribution,
    errors: { 400: 'Validation Error', 404: 'Distribution Not Found' },
    usedIn: ['DistributionsTab'],
  },
  DELETE_DISTRIBUTION: {
    method: 'DELETE',
    route: '/api/distributions/:distributionId',
    auth: 'required',
    responseSchema: {} as { success: boolean },
    errors: { 404: 'Distribution Not Found' },
    usedIn: ['DistributionsTab'],
  },
  
  // Anonymous Link
  GET_ANONYMOUS_LINK: {
    method: 'GET',
    route: '/api/instances/:instanceId/anonymous-link',
    auth: 'required',
    responseSchema: {} as AnonymousLinkSettings,
    errors: { 404: 'Instance Not Found' },
    usedIn: ['AnonymousLinkView'],
  },
  UPDATE_ANONYMOUS_LINK: {
    method: 'PATCH',
    route: '/api/instances/:instanceId/anonymous-link',
    auth: 'required',
    requestSchema: {} as Partial<AnonymousLinkSettings>,
    responseSchema: {} as AnonymousLinkSettings,
    errors: { 400: 'Validation Error' },
    usedIn: ['AnonymousLinkView'],
  },
  
  // QR Code
  GET_QR_CODE_SETTINGS: {
    method: 'GET',
    route: '/api/instances/:instanceId/qr-code',
    auth: 'required',
    responseSchema: {} as QRCodeSettings,
    errors: { 404: 'Instance Not Found' },
    usedIn: ['QRCodeView'],
  },
  UPDATE_QR_CODE_SETTINGS: {
    method: 'PATCH',
    route: '/api/instances/:instanceId/qr-code',
    auth: 'required',
    requestSchema: {} as Partial<QRCodeSettings>,
    responseSchema: {} as QRCodeSettings,
    errors: { 400: 'Validation Error' },
    usedIn: ['QRCodeView'],
  },
  
  // Contact Lists
  GET_CONTACT_LISTS: {
    method: 'GET',
    route: '/api/contact-lists',
    auth: 'required',
    responseSchema: {} as ContactList[],
    errors: { 401: 'Unauthorized' },
    usedIn: ['EmailDistributionView'],
  },
  CREATE_CONTACT_LIST: {
    method: 'POST',
    route: '/api/contact-lists',
    auth: 'required',
    requestSchema: {} as Pick<ContactList, 'name' | 'description' | 'contacts'>,
    responseSchema: {} as ContactList,
    errors: { 400: 'Validation Error' },
    usedIn: ['EmailDistributionView'],
  },
  IMPORT_CONTACTS: {
    method: 'POST',
    route: '/api/contact-lists/:listId/import',
    auth: 'required',
    requestSchema: {} as { file: File; mappings: Record<string, string> },
    responseSchema: {} as { imported: number; failed: number; errors: string[] },
    errors: { 400: 'Import Error' },
    usedIn: ['EmailDistributionView'],
  },
  
  // Email Templates
  GET_EMAIL_TEMPLATES: {
    method: 'GET',
    route: '/api/instances/:instanceId/email-templates',
    auth: 'required',
    responseSchema: {} as EmailMessageTemplate[],
    errors: { 404: 'Instance Not Found' },
    usedIn: ['EmailDistributionView'],
  },
  CREATE_EMAIL_TEMPLATE: {
    method: 'POST',
    route: '/api/instances/:instanceId/email-templates',
    auth: 'required',
    requestSchema: {} as Omit<EmailMessageTemplate, 'id'>,
    responseSchema: {} as EmailMessageTemplate,
    errors: { 400: 'Validation Error' },
    usedIn: ['EmailDistributionView'],
  },
  UPDATE_EMAIL_TEMPLATE: {
    method: 'PATCH',
    route: '/api/email-templates/:templateId',
    auth: 'required',
    requestSchema: {} as Partial<EmailMessageTemplate>,
    responseSchema: {} as EmailMessageTemplate,
    errors: { 400: 'Validation Error', 404: 'Template Not Found' },
    usedIn: ['EmailDistributionView'],
  },
  
  // Email Schedules
  GET_EMAIL_SCHEDULES: {
    method: 'GET',
    route: '/api/instances/:instanceId/email-schedules',
    auth: 'required',
    responseSchema: {} as EmailSchedule[],
    errors: { 404: 'Instance Not Found' },
    usedIn: ['EmailDistributionView'],
  },
  CREATE_EMAIL_SCHEDULE: {
    method: 'POST',
    route: '/api/instances/:instanceId/email-schedules',
    auth: 'required',
    requestSchema: {} as Omit<EmailSchedule, 'id' | 'createdAt' | 'updatedAt'>,
    responseSchema: {} as EmailSchedule,
    errors: { 400: 'Validation Error' },
    usedIn: ['EmailDistributionView'],
  },
  UPDATE_EMAIL_SCHEDULE: {
    method: 'PATCH',
    route: '/api/email-schedules/:scheduleId',
    auth: 'required',
    requestSchema: {} as Partial<EmailSchedule>,
    responseSchema: {} as EmailSchedule,
    errors: { 400: 'Validation Error', 404: 'Schedule Not Found' },
    usedIn: ['EmailDistributionView'],
  },
  SEND_EMAIL_DISTRIBUTION: {
    method: 'POST',
    route: '/api/distributions/:distributionId/send',
    auth: 'required',
    requestSchema: {} as { contactListId: string; scheduleId?: string },
    responseSchema: {} as { queued: number; estimatedDelivery: string },
    errors: { 400: 'Send Error', 404: 'Distribution Not Found' },
    usedIn: ['EmailDistributionView'],
  },
} as const;
