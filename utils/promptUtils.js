/**
 * Utility functions for handling prompt formats (string vs structured object)
 */

/**
 * Normalize prompt to structured format
 * - If string: convert to { role: "", goal: "", instruction: string }
 * - If object: ensure it has role, goal, instruction fields
 * @param {string|object} prompt - The prompt (string or object)
 * @returns {object} - Normalized prompt object
 */
export const normalizePromptToStructured = (prompt) => {
  if (!prompt) {
    return { role: "", goal: "", instruction: "" };
  }

  // If it's a string (legacy format), put it in instruction field
  if (typeof prompt === "string") {
    return {
      role: "",
      goal: "",
      instruction: prompt,
    };
  }

  // If it's already an object, ensure it has the required fields
  if (typeof prompt === "object") {
    return {
      role: prompt.role || "",
      goal: prompt.goal || "",
      instruction: prompt.instruction || "",
      // Preserve embed-specific fields if present
      customPrompt: prompt.customPrompt || "",
      embedFields: prompt.embedFields || [],
      useDefaultPrompt: prompt.useDefaultPrompt ?? true,
    };
  }

  return { role: "", goal: "", instruction: "" };
};

/**
 * Convert structured prompt to string for backward compatibility
 * @param {object} promptObj - Structured prompt object
 * @returns {string} - String representation
 */
export const convertStructuredPromptToString = (promptObj) => {
  if (!promptObj || typeof promptObj !== "object") {
    return "";
  }

  // For embed users with custom prompt
  if (promptObj.customPrompt && !promptObj.useDefaultPrompt) {
    return promptObj.customPrompt;
  }

  // For main users: combine role, goal, instruction
  const parts = [];
  if (promptObj.role) {
    parts.push(`Role: ${promptObj.role}`);
  }
  if (promptObj.goal) {
    parts.push(`Goal: ${promptObj.goal}`);
  }
  if (promptObj.instruction) {
    parts.push(promptObj.instruction);
  }

  return parts.join("\n\n");
};

/**
 * Check if prompt is in legacy string format
 * @param {string|object} prompt - The prompt to check
 * @returns {boolean} - True if string, false if object
 */
export const isLegacyPromptFormat = (prompt) => {
  return typeof prompt === "string";
};

/**
 * Safely convert prompt to string (handles both string and object formats)
 * @param {string|object} prompt - The prompt
 * @returns {string} - String representation of the prompt
 */
export const promptToString = (prompt) => {
  if (!prompt) return "";

  if (typeof prompt === "string") {
    return prompt;
  }

  if (typeof prompt === "object") {
    return convertStructuredPromptToString(prompt);
  }

  return String(prompt);
};

/**
 * Extract text from prompt for variable extraction (works with both string and structured formats)
 * @param {string|object} prompt - The prompt
 * @returns {string} - Combined text from all prompt fields
 */
const extractTextFromPrompt = (prompt) => {
  if (!prompt) return "";

  if (typeof prompt === "string") {
    return prompt;
  }

  if (typeof prompt === "object") {
    let textToSearch = "";
    // Extract from all text fields
    if (prompt.role) textToSearch += prompt.role + " ";
    if (prompt.goal) textToSearch += prompt.goal + " ";
    if (prompt.instruction) textToSearch += prompt.instruction + " ";
    if (prompt.customPrompt) textToSearch += prompt.customPrompt + " ";
    // Extract from embed fields
    if (Array.isArray(prompt.embedFields)) {
      prompt.embedFields.forEach((field) => {
        if (field.value) textToSearch += field.value + " ";
      });
    }
    return textToSearch;
  }

  return "";
};

/**
 * Extract variables from prompt (works with both string and structured formats)
 * @param {string|object} prompt - The prompt
 * @returns {string[]} - Array of variable names
 */
export const extractVariablesFromPrompt = (prompt) => {
  if (!prompt) return [];

  const textToSearch = extractTextFromPrompt(prompt);
  if (!textToSearch) return [];

  // Extract {{variable}} patterns
  const matches = textToSearch.matchAll(/\{\{([^}]+)\}\}/g);
  const variables = [];
  for (const match of matches) {
    if (match[1]) {
      variables.push(match[1].trim());
    }
  }

  return [...new Set(variables)];
};
