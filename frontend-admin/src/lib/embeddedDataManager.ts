import type { EmbeddedDataField, EmbeddedDataType, DisplayLogicOperator } from '@/api/contracts';

/**
 * System-defined embedded data fields that are commonly used
 * These serve as templates and can be enabled by users
 */
export function getSystemFields(): EmbeddedDataField[] {
  return [
    {
      name: 'Gender',
      label: 'Gender',
      dataType: 'text',
      suggestedValues: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
      isSystemField: true,
    },
    {
      name: 'AgeGroup',
      label: 'Age Group',
      dataType: 'text',
      suggestedValues: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
      isSystemField: true,
    },
    {
      name: 'Department',
      label: 'Department',
      dataType: 'text',
      suggestedValues: ['Sales', 'Marketing', 'Engineering', 'HR', 'Finance', 'Operations'],
      isSystemField: true,
    },
    {
      name: 'Location',
      label: 'Location',
      dataType: 'text',
      suggestedValues: [],
      isSystemField: true,
    },
    {
      name: 'EmployeeType',
      label: 'Employee Type',
      dataType: 'text',
      suggestedValues: ['Full-time', 'Part-time', 'Contract', 'Intern'],
      isSystemField: true,
    },
    {
      name: 'StartDate',
      label: 'Start Date',
      dataType: 'date',
      suggestedValues: [],
      isSystemField: true,
    },
    {
      name: 'Tenure',
      label: 'Tenure (Years)',
      dataType: 'number',
      suggestedValues: [],
      isSystemField: true,
    },
    {
      name: 'JobLevel',
      label: 'Job Level',
      dataType: 'text',
      suggestedValues: ['Individual Contributor', 'Manager', 'Senior Manager', 'Director', 'Executive'],
      isSystemField: true,
    },
    {
      name: 'Region',
      label: 'Region',
      dataType: 'text',
      suggestedValues: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'],
      isSystemField: true,
    },
    {
      name: 'CustomerSegment',
      label: 'Customer Segment',
      dataType: 'text',
      suggestedValues: ['Enterprise', 'Mid-Market', 'SMB', 'Consumer'],
      isSystemField: true,
    },
  ];
}

/**
 * Get valid operators for a given data type
 */
export function getOperatorsByDataType(dataType: EmbeddedDataType): DisplayLogicOperator[] {
  switch (dataType) {
    case 'text':
      return ['equals', 'notEquals', 'contains', 'notContains'];
    case 'number':
      return ['equals', 'notEquals', 'greaterThan', 'lessThan'];
    case 'boolean':
      return ['equals', 'notEquals'];
    case 'date':
      return ['equals', 'notEquals', 'greaterThan', 'lessThan'];
    default:
      return ['equals', 'notEquals'];
  }
}

/**
 * Validate field name for custom fields
 * Must be alphanumeric + underscores, no leading numbers, max 50 chars
 */
export function validateFieldName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Field name cannot be empty' };
  }

  if (name.length > 50) {
    return { isValid: false, error: 'Field name must be 50 characters or less' };
  }

  if (/^\d/.test(name)) {
    return { isValid: false, error: 'Field name cannot start with a number' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return { isValid: false, error: 'Field name can only contain letters, numbers, and underscores' };
  }

  return { isValid: true };
}

/**
 * Check if a field exists in the schema
 */
export function fieldExists(fieldName: string, fields: EmbeddedDataField[]): boolean {
  return fields.some(f => f.name.toLowerCase() === fieldName.toLowerCase());
}

/**
 * Get suggested values for a field (if any)
 */
export function getSuggestedValues(fieldName: string, fields: EmbeddedDataField[]): string[] {
  const field = fields.find(f => f.name.toLowerCase() === fieldName.toLowerCase());
  return field?.suggestedValues || [];
}

/**
 * Get data type for a field
 */
export function getFieldDataType(fieldName: string, fields: EmbeddedDataField[]): EmbeddedDataType {
  const field = fields.find(f => f.name.toLowerCase() === fieldName.toLowerCase());
  return field?.dataType || 'text';
}

/**
 * Create a new custom field
 */
export function createCustomField(
  name: string,
  dataType: EmbeddedDataType,
  label?: string,
  suggestedValues?: string[]
): EmbeddedDataField {
  return {
    name,
    label: label || name,
    dataType,
    suggestedValues: suggestedValues || [],
    isSystemField: false,
  };
}

/**
 * Parse suggested values from comma-separated string
 */
export function parseSuggestedValues(input: string): string[] {
  return input
    .split(',')
    .map(v => v.trim())
    .filter(v => v.length > 0);
}

/**
 * Extract unique values from CSV data for a column
 * Limits to 50 most common values
 */
export function extractUniqueValues(columnData: string[]): string[] {
  const valueCounts = new Map<string, number>();
  
  columnData.forEach(value => {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      valueCounts.set(trimmed, (valueCounts.get(trimmed) || 0) + 1);
    }
  });

  return Array.from(valueCounts.entries())
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .slice(0, 50) // Limit to 50
    .map(([value]) => value);
}

/**
 * Infer data type from sample values
 */
export function inferDataType(values: string[]): EmbeddedDataType {
  if (values.length === 0) return 'text';

  // Check if all values are boolean-like
  const booleanPattern = /^(true|false|yes|no|1|0)$/i;
  if (values.every(v => booleanPattern.test(v.trim()))) {
    return 'boolean';
  }

  // Check if all values are numeric
  const numericPattern = /^-?\d+\.?\d*$/;
  if (values.every(v => numericPattern.test(v.trim()))) {
    return 'number';
  }

  // Check if all values are date-like
  const datePattern = /^\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}/;
  if (values.every(v => datePattern.test(v.trim()))) {
    return 'date';
  }

  return 'text';
}

/**
 * Get field label for display (falls back to name if no label)
 */
export function getFieldLabel(field: EmbeddedDataField): string {
  return field.label || field.name;
}

/**
 * Format field name for piped text syntax
 */
export function formatPipedText(fieldName: string): string {
  return `\${e://Field/${fieldName}}`;
}
