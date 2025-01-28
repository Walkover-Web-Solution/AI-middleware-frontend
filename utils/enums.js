export const PAUTH_KEY_COLUMNS = ["name", "authkey", "created_at"];
export const API_KEY_COLUMNS = ["name", "apikey", "comment", "service"];
export const WEBHOOKALERT_COLUMNS = ['name', 'url', 'headers', 'alertType', 'bridges'];
export const ALERT_TYPE = ['Error', 'Variable'];
export const DOCUMENT_SECTIONS = [
  {
    id: "model",
    title: "Model",
    description:
      "The specific model to use for generating responses. Different models may have various capabilities and performance characteristics.",
  },
  {
    id: "temperature",
    title: "Temperature",
    description:
      "Controls the level of randomness in the model's responses. A lower value (e.g., 0.2) makes the responses more focused and deterministic, meaning the model will be more likely to choose the most probable next word. A higher value (e.g., 0.8) increases randomness and creativity, allowing the model to explore more diverse and less probable word choices.",
  },
  {
    id: "max-tokens",
    title: "Maximum Tokens",
    description:
      "Sets a limit on the number of tokens (words or subwords) that the model can generate in its response. It helps control the length of the output.",
  },
  {
    id: "top-p",
    title: "Top P Probability",
    description:
      "Adjusts the diversity of the response by sampling from the top P percentage of the probability mass. For instance, if set to 0.9, the model considers only the smallest set of words whose cumulative probability is 90%. This technique is known as nucleus sampling.",
  },
  {
    id: "logprobs",
    title: "Log Probabilities",
    description:
      "When enabled, returns the log probabilities of the generated tokens. This can be useful for understanding how confident the model is in its choices.",
  },
  {
    id: "frequency-penalty",
    title: "Frequency Penalty",
    description:
      "Applies a penalty to the model for using tokens that appear frequently. It reduces the likelihood of the model repeating the same words, promoting more varied language.",
  },
  {
    id: "presence-penalty",
    title: "Presence Penalty",
    description:
      "Similar to the frequency penalty, this discourages the model from repeating tokens that have already appeared in the response, encouraging it to generate new content instead.",
  },
  {
    id: "num-completions",
    title: "Number of Completions",
    description:
      "Specifies how many separate completions or responses the model should generate for a given prompt. It allows users to receive multiple responses and choose the best one.",
  },
  {
    id: "stop-sequence",
    title: "Stop Sequence",
    description:
      "Defines specific sequences of characters or words at which the model should stop generating further tokens. It helps to control the endpoint of the generated response.",
  },
  {
    id: "stream-output",
    title: "Stream Output",
    description:
      "When enabled, allows the model to stream back partial progress of the response as it is being generated. This can be useful for real-time applications.",
  },
  {
    id: "tools",
    title: "Tools",
    description:
      "Lists the tools available for the model to use during the generation process, such as specific APIs or databases it can query.",
  },
  {
    id: "tool-choice",
    title: "Tool Choice",
    description:
      "Specifies the particular tool the model should use for generating the response. It allows for more targeted and relevant output.",
  },
  {
    id: "response-format",
    title: "Response Format",
    description:
      "Defines the format in which the response will be returned, such as plain text or JSON. It ensures the output is structured in a way that meets the user's needs.",
  },
  {
    id: "stop-sequences",
    title: "Stop Sequences",
    description:
      "An array of sequences at which the model should stop generating tokens. This can be useful for setting multiple end conditions for the response.",
  },
  {
    id: "stop-key",
    title: "Stop Key",
    description:
      "An arbitrary key used for stopping generation. This key doesn't have a standard use and is provided as an example.",
  },
  {
    id: "top-k",
    title: "Top K",
    description:
      "Limits the sampling pool to the top K most probable tokens. It promotes more deterministic responses by focusing on the most likely next words.",
  },
  {
    id: "input-text",
    title: "Input Text",
    description:
      "The text input provided by the user for which the model will generate responses. It serves as the starting point for the model's output.",
  },
  {
    id: "echo-input",
    title: "Echo Input",
    description:
      "If set to true, includes the input text in the output. This can be useful for context or reference in the generated response.",
  },
  {
    id: "best-of",
    title: "Best Of",
    description:
      "Instructs the model to generate multiple completions server-side and return the best one based on internal evaluation. It helps ensure higher quality responses.",
  },
  {
    id: "random-seed",
    title: "Random Seed",
    description:
      "Sets a seed value for random number generation, ensuring that the responses are reproducible. Using the same seed with the same prompt will produce the same output.",
  },
  {
    id: "suffix-text",
    title: "Suffix Text",
    description:
      "Appends additional text to the input before generating the response. It can be used to provide extra context or direct the model's output.",
  },
];

export const JSONFORMATDATA = [
  {
    title: "String, Number, Boolean",
    json: `{
      "data": {
        "type": "string",
        "description": "Your description",
        "enum": [
          "your Enum value like 'a', 'b', 'c' for string and for number 1, 2, 3"
        ],
        "required_params": []
      },
      "data1": {
        "type": "number",
        "description": "Your description",
        "enum": [
          "your Enum value like 'a', 'b', 'c' for string and for number 1, 2, 3"
        ],
        "required_params": []
      },
      "data2": {
        "type": "boolean",
        "description": "Your description",
        "enum": [
          "your Enum value like 'a', 'b', 'c' for string and for number 1, 2, 3"
        ],
        "required_params": []
      }
    }`
  },
  {
    title: "Object of Object",
    json: `{
      "data": {
        "type": "object",
        "description": "Your description",
        "enum": [
          "your Enum value like 'a', 'b', 'c' for string and for number 1, 2, 3"
        ],
        "required_params": [
          "data1"
        ],
        "parameters": {
          "data1": {
            "type": "object",
            "description": "Your description",
            "enum": [
              "your Enum value like 'a', 'b', 'c' for string and for number 1, 2, 3"
            ],
            "required_params": [
              "order_id"
            ],
            "parameter": {
              "order_id": {
                "type": "string",
                "description": "The customer's order ID."
              }
            }
          }
        }
      }
    }`
  },
  {
    title: "Array of Array",
    json: `{
      "data": {
        "type": "array",
        "description": "Your description",
        "items": {
          "type": "array",
          "description": "Your description",
          "items": {
            "type": "object",
            "description": "Your description",
            "required_params": ["data1"],
            "properties": {
              "data1": {
                "type": "object",
                "description": "Your description",
                "enum": [
                  "your Enum value like 'a', 'b', 'c' for string and for number 1, 2, 3"
                ],
                "required_params": [
                  "order_id"
                ],
                "parameter": {
                  "order_id": {
                    "type": "string",
                    "description": "The customer's order ID."
                  }
                }
              }
            }
          }
        }
      }
    }`
  },
  {
    title: "Array of Object",
    json: `{
      "data": {
        "type": "array",
        "description": "Your description",
        "items": {
          "type": "object",
          "required_params": ["data1"],
          "properties": {
            "data1": {
              "type": "object",
              "description": "Your description",
              "enum": [
                "your Enum value like 'a', 'b', 'c' for string and for number 1, 2, 3"
              ],
              "required_params": [
                "order_id"
              ],
              "parameter": {
                "order_id": {
                  "type": "string",
                  "description": "The customer's order ID."
                }
              }
            }
          }
        }
      }
    }`
  },
  {
    title: "Object of Array",
    json: `{
      "data": {
        "type": "object",
        "description": "Your description",
        "enum": [
          "your Enum value like 'a', 'b', 'c' for string and for number 1, 2, 3"
        ],
        "parameter": {
          "type": "array",
          "required_params": [
            "data1"
          ],
          "items": {
            "type": "object",
            "description": "Your Description",
            "required_params": [
              "data1"
            ],
            "properties": {
              "data1": {
                "type": "object",
                "description": "Your description",
                "enum": [
                  "your Enum value like 'a', 'b', 'c' for string and for number 1, 2, 3"
                ],
                "required_params": [
                  "order_id"
                ],
                "parameter": {
                  "order_id": {
                    "type": "string",
                    "description": "The customer's order ID."
                  }
                }
              }
            }
          }
        }
      }
    }`
  }
];

export const MODAL_TYPE = {
  CREATE_VARIABLE: 'CREATE_VARIABLE',
  CREATE_BRIDGE_MODAL: 'CREATE_BRIDGE_MODAL',
  OPTIMIZE_PROMPT: 'optmize_prompt_modal',
  PUBLISH_BRIDGE_VERSION: 'publish_bridge_version_modal',
  VERSION_DESCRIPTION_MODAL: "version_description_modal",
  API_KEY_MODAL: "API_KEY_MODAL",
  PAUTH_KEY_MODAL: "PAUTH_KEY_MODAL",
  FINE_TUNE_MODAL: "fine-tune-modal",
  FUNCTION_PARAMETER_MODAL: "function-parameter-modal",
  ACTION_MODAL: "actionModel",
  CHATBOT_MODAL: "chatBot_model",
  CREATE_ORG_MODAL: "create-org-modal",
  PAUTH_KEY_DELETE_MODAL: "PAUTH_KEY_DELETE_MODAL",
  WEBHOOK_MODAL: "WEBHOOK_MODAL",
  CHAT_DETAILS_VIEW_MODAL: "chat_details_view",
  JSON_SCHEMA: "JSON_SCHEMA",

}

export const API_KEY_MODAL_INPUT = ['name', 'apikey', 'comment']
export const USER_FEEDBACK_FILTER_OPTIONS = ["all", "1", "2"];
export const TIME_RANGE_OPTIONS = ['Today', 'Last 3 Days', 'Last Week', 'Last Month'];
export const METRICS_FACTOR_OPTIONS = ['bridge_id', 'apikey_id', 'model'];
