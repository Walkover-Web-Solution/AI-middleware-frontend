export const ADVANCED_BRIDGE_PARAMETERS = {
    creativity_level: { name: 'Creativity Level', description: 'Controls how varied or focused the text is. Higher values (e.g., 0.7) make the text more creative; lower values (e.g., 0.2) make it more predictable.' },
    max_tokens: { name: 'Max Tokens Limit', description: 'Specifies the maximum number of tokens for the response.' },
    token_selection_limit: { name: 'Max Tokens Limit (Top K)', description: 'Limits choices to the top k most probable words. Lower values focus on more likely words.' },
    response_type: { name: 'Response Type', description: 'Defines the format or type of the generated response.' },
    probability_cutoff: { name: 'Probability Cutoff (Top P)', description: 'Chooses from a smaller set of likely words, focusing on a subset that adds up to a certain probability.' },
    repetition_penalty: { name: 'Repetition Penalty', description: 'Reduces the likelihood of repeated phrases in responses.' },
    novelty_penalty: { name: 'Novelty Penalty', description: 'Discourages responses that are too similar to previous ones.' },
    log_probability: { name: 'Log Probability', description: 'Records the probability scores of the generated tokens.' },
    response_count: { name: 'Response Count (n)', description: 'Specifies how many different responses to generate.' },
    response_suffix: { name: 'Response Suffix', description: 'Adds specified text at the end of each response.' },
    additional_stop_sequences: { name: 'Stop Sequences', description: 'Ends text generation at specified points, like the end of a sentence.' },
    input_text: { name: 'Input Text', description: 'The initial text provided as input for generating responses.' },
    echo_input: { name: 'Echo Input', description: 'Includes the input text within the generated response.' },
    best_response_count: { name: 'Best Of', description: 'Generates multiple responses and selects the best one.' },
    seed: { name: 'Seed', description: 'Sets a number to ensure AI returns consistent answers.' },
    tool_choice: { name: 'Tool Choice', description: 'Selects which tool or model to use for generating responses.' },
    stream: { name: 'Stream', description: 'Enables continuous streaming of the response.' },
    stop: { name: 'Stop', description: 'Halts text generation.' }
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

export const parameterTypes = ['string', 'number', 'boolean'];