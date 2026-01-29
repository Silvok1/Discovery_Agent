import type { 
  DisplayLogicCondition, 
  DisplayLogic,
  SkipLogic,
  Question,
  DisplayLogicOperator 
} from '@/api/contracts';

/**
 * Response data structure: questionId -> answer value
 */
export type ResponseData = Record<string, any>;

/**
 * Embedded data structure: fieldName -> field value
 */
export type EmbeddedData = Record<string, any>;

/**
 * Evaluate a single condition
 */
export function evaluateCondition(
  condition: DisplayLogicCondition,
  responseData: ResponseData,
  embeddedData: EmbeddedData
): boolean {
  let actualValue: any;

  // Get the value based on source type
  if (condition.sourceType === 'question') {
    if (!condition.questionId) {
      console.warn('Condition has no questionId', condition);
      return false;
    }
    actualValue = responseData[condition.questionId];
  } else if (condition.sourceType === 'embeddedData') {
    if (!condition.embeddedFieldName) {
      console.warn('Condition has no embeddedFieldName', condition);
      return false;
    }
    actualValue = embeddedData[condition.embeddedFieldName];
    
    // If field is undefined and not in embedded data, log warning and return false
    if (actualValue === undefined) {
      if (condition.embeddedFieldType === 'custom') {
        console.warn(`Custom embedded field "${condition.embeddedFieldName}" not found in embedded data`);
      }
      return false;
    }
  }

  // Handle isAnswered and isNotAnswered operators
  if (condition.operator === 'isAnswered') {
    return actualValue !== undefined && actualValue !== null && actualValue !== '';
  }
  if (condition.operator === 'isNotAnswered') {
    return actualValue === undefined || actualValue === null || actualValue === '';
  }

  // If actual value is undefined/null, condition fails (except for isAnswered/isNotAnswered handled above)
  if (actualValue === undefined || actualValue === null) {
    return false;
  }

  const expectedValue = condition.value;

  // Evaluate based on operator
  switch (condition.operator) {
    case 'equals':
      return coerceEquals(actualValue, expectedValue);
    
    case 'notEquals':
      return !coerceEquals(actualValue, expectedValue);
    
    case 'contains':
      if (Array.isArray(actualValue)) {
        // For multi-select questions, check if array contains the value
        return actualValue.some(v => coerceEquals(v, expectedValue));
      }
      // For text, check if string contains substring
      return String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase());
    
    case 'notContains':
      if (Array.isArray(actualValue)) {
        return !actualValue.some(v => coerceEquals(v, expectedValue));
      }
      return !String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase());
    
    case 'greaterThan':
      return coerceNumber(actualValue) > coerceNumber(expectedValue);
    
    case 'lessThan':
      return coerceNumber(actualValue) < coerceNumber(expectedValue);
    
    default:
      console.warn('Unknown operator', condition.operator);
      return false;
  }
}

/**
 * Coerce values for equality comparison (handles type mismatches gracefully)
 */
function coerceEquals(actual: any, expected: any): boolean {
  // Exact match
  if (actual === expected) return true;

  // Case-insensitive string comparison
  if (typeof actual === 'string' && typeof expected === 'string') {
    return actual.toLowerCase() === expected.toLowerCase();
  }

  // Boolean coercion
  if (typeof expected === 'boolean' || typeof actual === 'boolean') {
    return coerceBoolean(actual) === coerceBoolean(expected);
  }

  // Numeric coercion
  const actualNum = Number(actual);
  const expectedNum = Number(expected);
  if (!isNaN(actualNum) && !isNaN(expectedNum)) {
    return actualNum === expectedNum;
  }

  // Fallback to string comparison
  return String(actual).toLowerCase() === String(expected).toLowerCase();
}

/**
 * Coerce value to number
 */
function coerceNumber(value: any): number {
  if (typeof value === 'number') return value;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Coerce value to boolean
 */
function coerceBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'yes' || lower === '1';
  }
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

/**
 * Evaluate multiple conditions with AND/OR logic
 */
export function evaluateLogic(
  conditions: DisplayLogicCondition[],
  operator: 'AND' | 'OR',
  responseData: ResponseData,
  embeddedData: EmbeddedData
): boolean {
  if (!conditions || conditions.length === 0) {
    return true; // No conditions = always true
  }

  if (operator === 'AND') {
    // All conditions must be true
    return conditions.every(condition => 
      evaluateCondition(condition, responseData, embeddedData)
    );
  } else {
    // At least one condition must be true
    return conditions.some(condition => 
      evaluateCondition(condition, responseData, embeddedData)
    );
  }
}

/**
 * Evaluate display logic for a question
 */
export function evaluateDisplayLogic(
  displayLogic: DisplayLogic | undefined,
  responseData: ResponseData,
  embeddedData: EmbeddedData
): boolean {
  if (!displayLogic || !displayLogic.enabled) {
    return true; // No display logic = always visible
  }

  return evaluateLogic(
    displayLogic.conditions,
    displayLogic.operator,
    responseData,
    embeddedData
  );
}

/**
 * Evaluate skip logic for a question
 * Returns skip target information if conditions are met
 */
export function evaluateSkipLogic(
  skipLogic: SkipLogic | undefined,
  responseData: ResponseData,
  embeddedData: EmbeddedData
): {
  shouldSkip: boolean;
  targetType?: string;
  targetQuestionId?: string;
} {
  if (!skipLogic || !skipLogic.enabled) {
    return { shouldSkip: false };
  }

  const conditionsMet = evaluateLogic(
    skipLogic.conditions,
    skipLogic.operator,
    responseData,
    embeddedData
  );

  if (conditionsMet) {
    return {
      shouldSkip: true,
      targetType: skipLogic.targetType,
      targetQuestionId: skipLogic.targetQuestionId,
    };
  }

  return { shouldSkip: false };
}

/**
 * Get all visible questions based on display logic
 * Preserves question order
 */
export function getVisibleQuestions(
  allQuestions: Question[],
  responseData: ResponseData,
  embeddedData: EmbeddedData
): Question[] {
  return allQuestions.filter(question =>
    evaluateDisplayLogic(question.displayLogic, responseData, embeddedData)
  );
}

/**
 * Check if there's a potential circular logic issue
 * (for debugging purposes)
 */
export function detectCircularLogic(questions: Question[]): {
  hasIssue: boolean;
  details?: string;
} {
  // Simple check: a question cannot reference itself in display logic
  for (const question of questions) {
    if (question.displayLogic?.enabled) {
      for (const condition of question.displayLogic.conditions) {
        if (condition.sourceType === 'question' && condition.questionId === question.id) {
          return {
            hasIssue: true,
            details: `Question ${question.id} references itself in display logic`,
          };
        }
      }
    }
  }

  return { hasIssue: false };
}

/**
 * Get summary of logic rules for a question (for debugging/display)
 */
export function getLogicSummary(
  question: Question,
  allQuestions: Question[],
  embeddedFields?: Array<{name: string; label?: string}>
): {
  displayLogic?: string;
  skipLogic?: string;
} {
  const summary: { displayLogic?: string; skipLogic?: string } = {};

  // Display logic summary
  if (question.displayLogic?.enabled && question.displayLogic.conditions.length > 0) {
    const conditionStrings = question.displayLogic.conditions.map(condition => {
      if (condition.sourceType === 'question') {
        const sourceQ = allQuestions.find(q => q.id === condition.questionId);
        const qText = sourceQ ? `Q${allQuestions.indexOf(sourceQ) + 1}` : 'Unknown';
        return `${qText} ${condition.operator} ${condition.value}`;
      } else {
        const fieldLabel = embeddedFields?.find(f => f.name === condition.embeddedFieldName)?.label || condition.embeddedFieldName;
        return `[${fieldLabel}] ${condition.operator} ${condition.value}`;
      }
    });
    
    const operator = question.displayLogic.operator;
    summary.displayLogic = `When ${conditionStrings.join(` ${operator} `)}`;
  }

  // Skip logic summary
  if (question.skipLogic?.enabled && question.skipLogic.conditions.length > 0) {
    const skipLogic = question.skipLogic;
    const conditionStrings = skipLogic.conditions.map(condition => {
      if (condition.sourceType === 'question') {
        const sourceQ = allQuestions.find(q => q.id === condition.questionId);
        const qText = sourceQ ? `Q${allQuestions.indexOf(sourceQ) + 1}` : 'Unknown';
        return `${qText} ${condition.operator} ${condition.value}`;
      } else {
        const fieldLabel = embeddedFields?.find(f => f.name === condition.embeddedFieldName)?.label || condition.embeddedFieldName;
        return `[${fieldLabel}] ${condition.operator} ${condition.value}`;
      }
    });
    
    const operator = skipLogic.operator;
    let targetText = '';
    if (skipLogic.targetType === 'question' && skipLogic.targetQuestionId) {
      const targetQ = allQuestions.find(q => q.id === skipLogic.targetQuestionId);
      targetText = targetQ ? `Q${allQuestions.indexOf(targetQ) + 1}` : 'Unknown';
    } else if (skipLogic.targetType === 'endOfSurvey') {
      targetText = 'End of Survey';
    } else if (skipLogic.targetType === 'endOfBlock') {
      targetText = 'End of Block';
    }
    
    summary.skipLogic = `When ${conditionStrings.join(` ${operator} `)}, skip to ${targetText}`;
  }

  return summary;
}
