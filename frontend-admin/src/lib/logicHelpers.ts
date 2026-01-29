import type {
  Question,
  QuestionType,
  DisplayLogicOperator,
  DisplayLogicCondition,
  MultipleChoiceQuestion,
  RankOrderQuestion,
  ConstantSumQuestion,
  SliderQuestion,
  MatrixTableQuestion,
  PickGroupRankQuestion,
  NetPromoterQuestion,
  EmbeddedDataField,
} from '@/api/contracts';

// ============================================
// OPERATOR CONFIGURATION
// ============================================

export interface OperatorInfo {
  value: DisplayLogicOperator;
  label: string;
  requiresValue: boolean;
}

// Operators available for each question type category
const OPERATOR_CONFIG: Record<string, OperatorInfo[]> = {
  // Single select choice questions
  singleChoice: [
    { value: 'equals', label: 'Equals', requiresValue: true },
    { value: 'notEquals', label: 'Does Not Equal', requiresValue: true },
    { value: 'isAnswered', label: 'Is Answered', requiresValue: false },
    { value: 'isNotAnswered', label: 'Is Not Answered', requiresValue: false },
  ],
  // Multiple answer questions
  multipleChoice: [
    { value: 'contains', label: 'Contains', requiresValue: true },
    { value: 'notContains', label: 'Does Not Contain', requiresValue: true },
    { value: 'equals', label: 'Equals (Exact Match)', requiresValue: true },
    { value: 'isAnswered', label: 'Is Answered', requiresValue: false },
    { value: 'isNotAnswered', label: 'Is Not Answered', requiresValue: false },
  ],
  // Numeric/slider questions
  numeric: [
    { value: 'equals', label: 'Equals', requiresValue: true },
    { value: 'notEquals', label: 'Does Not Equal', requiresValue: true },
    { value: 'greaterThan', label: 'Greater Than', requiresValue: true },
    { value: 'lessThan', label: 'Less Than', requiresValue: true },
    { value: 'isAnswered', label: 'Is Answered', requiresValue: false },
    { value: 'isNotAnswered', label: 'Is Not Answered', requiresValue: false },
  ],
  // Text entry questions
  text: [
    { value: 'equals', label: 'Equals', requiresValue: true },
    { value: 'notEquals', label: 'Does Not Equal', requiresValue: true },
    { value: 'contains', label: 'Contains', requiresValue: true },
    { value: 'notContains', label: 'Does Not Contain', requiresValue: true },
    { value: 'isAnswered', label: 'Is Answered', requiresValue: false },
    { value: 'isNotAnswered', label: 'Is Not Answered', requiresValue: false },
  ],
  // Embedded data fields (text-based)
  embeddedData: [
    { value: 'equals', label: 'Equals', requiresValue: true },
    { value: 'notEquals', label: 'Does Not Equal', requiresValue: true },
    { value: 'contains', label: 'Contains', requiresValue: true },
    { value: 'notContains', label: 'Does Not Contain', requiresValue: true },
  ],
  // Default operators
  default: [
    { value: 'isAnswered', label: 'Is Answered', requiresValue: false },
    { value: 'isNotAnswered', label: 'Is Not Answered', requiresValue: false },
  ],
};

/**
 * Get the operator category for a question type
 */
function getOperatorCategory(questionType: QuestionType, allowMultiple?: boolean): string {
  switch (questionType) {
    case 'MultipleChoice':
      return allowMultiple ? 'multipleChoice' : 'singleChoice';
    case 'RankOrder':
    case 'PickGroupRank':
      return 'singleChoice';
    case 'Slider':
    case 'ConstantSum':
    case 'NetPromoter':
      return 'numeric';
    case 'TextEntry':
    case 'FormField':
      return 'text';
    case 'MatrixTable':
      return 'singleChoice';
    default:
      return 'default';
  }
}

/**
 * Get available operators for a specific question
 */
export function getOperatorsForQuestion(question: Question | undefined): OperatorInfo[] {
  if (!question) return OPERATOR_CONFIG.default;

  const allowMultiple = 'allowMultiple' in question ? question.allowMultiple : false;
  const category = getOperatorCategory(question.type, allowMultiple);
  return OPERATOR_CONFIG[category] || OPERATOR_CONFIG.default;
}

/**
 * Get available operators for embedded data fields
 */
export function getOperatorsForEmbeddedData(): OperatorInfo[] {
  return OPERATOR_CONFIG.embeddedData;
}

/**
 * Check if an operator requires a value
 */
export function operatorRequiresValue(operator: DisplayLogicOperator): boolean {
  return !['isAnswered', 'isNotAnswered'].includes(operator);
}

// ============================================
// CHOICE EXTRACTION
// ============================================

export interface ChoiceOption {
  id: string;
  text: string;
  value: string | number;
}

/**
 * Check if a question type has selectable choices for value input
 */
export function questionHasChoices(question: Question | undefined): boolean {
  if (!question) return false;

  switch (question.type) {
    case 'MultipleChoice':
    case 'RankOrder':
    case 'PickGroupRank':
    case 'ConstantSum':
    case 'MatrixTable':
    case 'NetPromoter':
      return true;
    default:
      return false;
  }
}

/**
 * Get available choices/options for a question
 */
export function getQuestionChoices(question: Question | undefined): ChoiceOption[] {
  if (!question) return [];

  switch (question.type) {
    case 'MultipleChoice':
      return (question as MultipleChoiceQuestion).choices.map((c) => ({
        id: c.id,
        text: c.text,
        value: c.id,
      }));

    case 'RankOrder':
      return (question as RankOrderQuestion).items.map((item) => ({
        id: item.id,
        text: item.text,
        value: item.id,
      }));

    case 'ConstantSum':
      return (question as ConstantSumQuestion).items.map((item) => ({
        id: item.id,
        text: item.text,
        value: item.id,
      }));

    case 'PickGroupRank':
      return (question as PickGroupRankQuestion).items.map((item) => ({
        id: item.id,
        text: item.text,
        value: item.id,
      }));

    case 'MatrixTable':
      // Return columns as choices
      return (question as MatrixTableQuestion).columns.map((col) => ({
        id: col.id,
        text: col.text,
        value: col.value?.toString() || col.id,
      }));

    case 'NetPromoter':
      // Return 0-10 scale
      return Array.from({ length: 11 }, (_, i) => ({
        id: `nps-${i}`,
        text: i.toString(),
        value: i,
      }));

    default:
      return [];
  }
}

// ============================================
// DISPLAY HELPERS
// ============================================

/**
 * Get a display label for a question in the dropdown
 */
export function getQuestionDisplayLabel(question: Question, index: number): string {
  // Strip HTML tags from question text
  const plainText = question.text
    ? question.text.replace(/<[^>]*>/g, '').trim()
    : '';
  
  const truncatedText = plainText
    ? plainText.length > 40
      ? plainText.substring(0, 40) + '...'
      : plainText
    : 'Untitled Question';

  return `Q${index + 1}: ${truncatedText}`;
}

/**
 * Get a human-readable summary of a logic condition
 */
export function getConditionSummary(
  condition: DisplayLogicCondition,
  questions: Question[],
  embeddedFields: EmbeddedDataField[]
): string {
  let sourceName = 'Unknown';
  
  if (condition.sourceType === 'question') {
    const question = questions.find((q) => q.id === condition.questionId);
    if (question) {
      const idx = questions.findIndex((q) => q.id === condition.questionId);
      const plainText = question.text?.replace(/<[^>]*>/g, '').trim() || 'Untitled';
      sourceName = `Q${idx + 1}: ${plainText.substring(0, 20)}${plainText.length > 20 ? '...' : ''}`;
    }
  } else {
    const field = embeddedFields.find((f) => f.name === condition.embeddedFieldName);
    sourceName = field?.label || condition.embeddedFieldName || 'Unknown Field';
  }

  const operatorLabels: Record<DisplayLogicOperator, string> = {
    equals: 'equals',
    notEquals: 'does not equal',
    contains: 'contains',
    notContains: 'does not contain',
    greaterThan: 'is greater than',
    lessThan: 'is less than',
    isAnswered: 'is answered',
    isNotAnswered: 'is not answered',
  };

  const operatorText = operatorLabels[condition.operator] || condition.operator;
  
  if (!operatorRequiresValue(condition.operator)) {
    return `${sourceName} ${operatorText}`;
  }

  const valueText = condition.value !== undefined ? `"${condition.value}"` : '(no value)';
  return `${sourceName} ${operatorText} ${valueText}`;
}

// ============================================
// DEFAULT EMBEDDED FIELDS
// ============================================

export const DEFAULT_EMBEDDED_FIELDS: EmbeddedDataField[] = [
  { name: 'firstName', label: 'First Name', dataType: 'text', isSystemField: true },
  { name: 'lastName', label: 'Last Name', dataType: 'text', isSystemField: true },
  { name: 'email', label: 'Email', dataType: 'text', isSystemField: true },
  { name: 'department', label: 'Department', dataType: 'text', isSystemField: false },
  { name: 'location', label: 'Location', dataType: 'text', isSystemField: false },
  { name: 'manager', label: 'Manager', dataType: 'text', isSystemField: false },
  { name: 'employeeId', label: 'Employee ID', dataType: 'text', isSystemField: false },
  { name: 'jobTitle', label: 'Job Title', dataType: 'text', isSystemField: false },
  { name: 'hireDate', label: 'Hire Date', dataType: 'date', isSystemField: false },
];

/**
 * Get placeholder syntax for an embedded field
 */
export function getFieldPlaceholder(fieldName: string): string {
  return `{{${fieldName}}}`;
}

/**
 * Parse placeholder syntax to get field name
 */
export function parseFieldPlaceholder(placeholder: string): string | null {
  const match = placeholder.match(/^\{\{(.+)\}\}$/);
  return match ? match[1] : null;
}

// ============================================
// VALIDATION
// ============================================

export interface LogicValidationResult {
  valid: boolean;
  warnings: LogicWarning[];
}

export interface LogicWarning {
  type: 'broken' | 'unlinked' | 'unreachable' | 'conflict';
  message: string;
  conditionId?: string;
}

/**
 * Validate a single logic condition
 */
export function validateCondition(
  condition: DisplayLogicCondition,
  previousQuestions: Question[],
  embeddedFields: EmbeddedDataField[]
): LogicWarning[] {
  const warnings: LogicWarning[] = [];

  if (condition.sourceType === 'question') {
    // Check if referenced question exists
    const question = previousQuestions.find((q) => q.id === condition.questionId);
    if (!question) {
      warnings.push({
        type: 'broken',
        message: 'Referenced question not found or comes after this question',
        conditionId: condition.id,
      });
    } else {
      // Check if operator is valid for question type
      const validOperators = getOperatorsForQuestion(question);
      if (!validOperators.some((op) => op.value === condition.operator)) {
        warnings.push({
          type: 'broken',
          message: `Operator "${condition.operator}" is not valid for ${question.type} questions`,
          conditionId: condition.id,
        });
      }

      // Check if value is provided when required
      if (operatorRequiresValue(condition.operator) && !condition.value) {
        warnings.push({
          type: 'broken',
          message: 'Value is required for this operator',
          conditionId: condition.id,
        });
      }
    }
  } else if (condition.sourceType === 'embeddedData') {
    // Check if embedded field exists
    const field = embeddedFields.find((f) => f.name === condition.embeddedFieldName);
    if (!field) {
      warnings.push({
        type: 'unlinked',
        message: `Embedded field "${condition.embeddedFieldName}" is not defined`,
        conditionId: condition.id,
      });
    }

    // Check if value is provided when required
    if (operatorRequiresValue(condition.operator) && !condition.value) {
      warnings.push({
        type: 'broken',
        message: 'Value is required for this operator',
        conditionId: condition.id,
      });
    }
  }

  return warnings;
}

/**
 * Validate skip logic target
 */
export function validateSkipTarget(
  targetQuestionId: string | undefined,
  targetType: 'question' | 'endOfSurvey' | 'endOfBlock',
  allQuestions: Question[],
  currentQuestionIndex: number
): LogicWarning[] {
  const warnings: LogicWarning[] = [];

  if (targetType === 'question') {
    if (!targetQuestionId) {
      warnings.push({
        type: 'broken',
        message: 'Skip target question is not specified',
      });
    } else {
      const targetIndex = allQuestions.findIndex((q) => q.id === targetQuestionId);
      if (targetIndex === -1) {
        warnings.push({
          type: 'broken',
          message: 'Skip target question not found',
        });
      } else if (targetIndex <= currentQuestionIndex) {
        warnings.push({
          type: 'broken',
          message: 'Skip target must be after the current question',
        });
      }
    }
  }

  return warnings;
}

/**
 * Check if a question has any logic warnings
 */
export function getQuestionLogicWarnings(
  question: Question,
  questionIndex: number,
  allQuestions: Question[],
  embeddedFields: EmbeddedDataField[]
): LogicWarning[] {
  const warnings: LogicWarning[] = [];
  const previousQuestions = allQuestions.slice(0, questionIndex);

  // Validate display logic
  if (question.displayLogic?.enabled) {
    for (const condition of question.displayLogic.conditions) {
      warnings.push(...validateCondition(condition, previousQuestions, embeddedFields));
    }
  }

  // Validate skip logic
  if (question.skipLogic?.enabled) {
    for (const condition of question.skipLogic.conditions) {
      warnings.push(...validateCondition(condition, previousQuestions, embeddedFields));
    }
    warnings.push(
      ...validateSkipTarget(
        question.skipLogic.targetQuestionId,
        question.skipLogic.targetType,
        allQuestions,
        questionIndex
      )
    );
  }

  return warnings;
}
