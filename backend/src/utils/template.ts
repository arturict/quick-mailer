/**
 * Substitutes variables in template text using mustache-style syntax {{variable}}
 * @param text Template text containing variables like {{name}}, {{link}}, etc.
 * @param variables Object with key-value pairs for substitution
 * @returns Text with variables substituted
 */
export function substituteVariables(text: string, variables: Record<string, string>): string {
  if (!text) return text;
  
  return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] !== undefined ? variables[varName] : match;
  });
}

/**
 * Extracts variable names from template text
 * @param text Template text containing variables like {{name}}, {{link}}, etc.
 * @returns Array of unique variable names
 */
export function extractVariables(text: string): string[] {
  if (!text) return [];
  
  const matches = text.matchAll(/\{\{(\w+)\}\}/g);
  const variables = new Set<string>();
  
  for (const match of matches) {
    variables.add(match[1]);
  }
  
  return Array.from(variables);
}

/**
 * Extracts all variables from subject and body fields
 * @param subject Template subject
 * @param bodyText Plain text body
 * @param bodyHtml HTML body
 * @returns Array of unique variable names
 */
export function extractAllVariables(
  subject: string,
  bodyText?: string,
  bodyHtml?: string
): string[] {
  const allVars = new Set<string>();
  
  extractVariables(subject).forEach(v => allVars.add(v));
  if (bodyText) extractVariables(bodyText).forEach(v => allVars.add(v));
  if (bodyHtml) extractVariables(bodyHtml).forEach(v => allVars.add(v));
  
  return Array.from(allVars);
}
