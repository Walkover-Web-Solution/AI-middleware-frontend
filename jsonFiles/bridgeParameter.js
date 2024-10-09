export const ADVANCED_BRIDGE_PARAMETERS = {
    creativity_level: { name: 'Creativity Level', description: 'Controls the creativity of responses. Higher values (e.g., 0.7) increase creativity; lower values (e.g., 0.2) make responses more predictable.' },
    max_tokens: { name: 'Max Tokens Limit', description: 'Specifies the maximum number of text units (tokens) allowed in a response, limiting its length.' },
    token_selection_limit: { name: 'Max Tokens Limit (Top K)', description: 'Limits responses to the most likely words. Lower values focus on the most probable choices.' },
    response_type: { name: 'Response Type', description: 'Defines the format or type of the generated response.' },
    probability_cutoff: { name: 'Probability Cutoff (Top P)', description: 'Focuses on the most likely words based on a percentage of probability.' },
    repetition_penalty: { name: 'Repetition Penalty', description: 'The `frequency_penalty` controls how often the model repeats itself, with higher positive values reducing repetition and negative values encouraging it.' },
    novelty_penalty: { name: 'Novelty Penalty', description: 'Discourages responses that are too similar to previous ones.' },
    log_probability: { name: 'Log Probability', description: 'If true, returns the log probabilities of each output token returned in the content of message.' },
    response_count: { name: 'Response Count (n)', description: 'Specifies how many different responses to generate.' },
    response_suffix: { name: 'Response Suffix', description: 'Adds specific text at the end of each response.' },
    additional_stop_sequences: { name: 'Stop Sequences', description: 'Stops generating text when certain phrases are reached.' },
    input_text: { name: 'Input Text', description: 'The starting point for generating responses.' },
    echo_input: { name: 'Echo Input', description: 'Includes the original input text in the response.' },
    best_response_count: { name: 'Best Of', description: 'Generates multiple responses and selects the most suitable one.' },
    seed: { name: 'Seed', description: 'Ensures consistent responses by setting a fixed value.' },
    tool_choice: { name: 'Tool Choice', description: 'Decides whether to use tools or just the model for generating responses.' },
    stream: { name: 'Stream', description: 'Sends the response in real-time as it\'s being generated.' },
    stop: { name: 'Stop', description: 'This parameter tells the model to stop generating text when it reaches any of the specified sequences (like a word or punctuation)' }
};

export const KEYS_NOT_TO_DISPLAY = ['model', 'prompt', 'apikey', 'type', 'bridgeType', 'tools', 'response_format', 'stream'];

export const SERVICES = ['openai', 'anthropic', 'groq'];

export const DEFAULT_MODEL = {
    'openai': "gpt-4o",
    'google': 'gemini-pro',
    'anthropic': "claude-3-5-sonnet-20240620",
    'groq': "llama3-8b-8192"
}

export function getDefaultValues(additionalParams, bridgeParams) {
    const defaults = {};
    for (const key in bridgeParams) {
        if (additionalParams.hasOwnProperty(key) && additionalParams[key].hasOwnProperty('default')) {
            defaults[key] = additionalParams[key]['default'];
        }
    }
    return defaults;
}

export const parameterTypes = ['string', 'number', 'boolean','object'];