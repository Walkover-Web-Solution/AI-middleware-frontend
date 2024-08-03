export const ADVANCED_BRIDGE_PARAMETERS = {
    creativity_level: { name: 'Creativity Level', description: 'Adjusts how creative the responses are' },
    max_output_tokens: { name: 'Max Tokens Limit', description: 'Sets the maximum number of tokens' },
    token_selection_limit: { name: 'Max Tokens Limit (Top  K)', description: 'Sets the maximum number of tokens' },
    json_mode: { name: 'JSON Mode', description: 'Enable or disable JSON format' },
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
    seed: { name: 'Seed', description: 'Set a seed for random number generation' }
};

export const KEYS_NOT_TO_DISPLAY = ['model', 'prompt', 'apikey', 'type', 'bridgeType', 'tools', 'response_format'];

export const SERVICES = ['openai', 'google'];