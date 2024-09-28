export const ADVANCED_BRIDGE_PARAMETERS = {
    creativity_level: { name: 'Creativity Level', description: 'Adjusts how creative the responses are' },
    max_tokens: { name: 'Max Tokens Limit', description: 'Sets the maximum number of tokens' },
    token_selection_limit: { name: 'Max Tokens Limit (Top  K)', description: 'Sets the maximum number of tokens' },
    response_type: { name: 'Response Type', description: 'Response type for the response' },
    probability_cutoff: { name: 'Probability Cutoff (Top P)', description: 'Sets the threshold for probability' },
    repetition_penalty: { name: 'Repetition Penalty', description: 'Reduces repetition in responses' },
    novelty_penalty: { name: 'Novelty Penalty', description: 'Penalizes responses that lack novelty' },
    log_probability: { name: 'Log Probability', description: 'Log the probabilities of responses' },
    response_count: { name: 'Response Count (n)', description: 'Number of responses to generate' },
    response_suffix: { name: 'Response Suffix', description: 'Text to add at the end of responses' },
    additional_stop_sequences: { name: 'Stop Sequences', description: 'Sequences that signal the end of response' },
    input_text: { name: 'Input Text', description: 'The initial input text' },
    echo_input: { name: 'Echo Input', description: 'Repeat the input text in the response' },
    best_response_count: { name: 'Best Of', description: 'Generate multiple responses and select the best' },
    seed: { name: 'Seed', description: 'Set a seed for random number generation' },
    tool_choice: { name: 'Tool Choice', description: 'Choose the tool to use' },
    stream: { name: 'Stream', description: 'Stream the response' },
    stop: { name: 'Stop', description: 'Stop the response' },
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