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

export const AVAILABLE_MODEL_TYPES = {
  API: 'api',
  CHAT: 'chat',
  FINETUEN: 'finetune',
  COMPLETION: 'completion',
  IMAGE: 'image',
  EMBEDDING: 'embedding',
  REASONING: 'reasoning',
};

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
  KNOWLEDGE_BASE_MODAL: 'KNOWLEDGE_BASE_MODAL',
  PROMPT_SUMMARY: 'PROMPT_SUMMARY',
  TESTCASE_MODAL: "TESTCASE_MODAL",
  DEMO_MODAL: "DEMO_MODAL",
  ADD_TEST_CASE_MODAL: "ADD_TEST_CASE_MODAL",
}

export const API_KEY_MODAL_INPUT = ['name', 'apikey', 'comment'];

export const USER_FEEDBACK_FILTER_OPTIONS = ["all", "1", "2"];

export const TIME_RANGE_OPTIONS = ['Today', 'Last 3 Days', 'Last Week', 'Last Month'];

export const METRICS_FACTOR_OPTIONS = ['bridge_id', 'apikey_id', 'model'];
export const KNOWLEDGE_BASE_COLUMNS = ['name', 'description'];
export const KNOWLEDGE_BASE_SECTION_TYPES = [
  { value: 'default', label: 'Default' },
  { value: 'custom', label: 'Custom' }
];
export const KNOWLEDGE_BASE_CUSTOM_SECTION = [
  { value: 'semantic', label: 'Semantic Chunking' },
  { value: 'manual', label: 'Manual Chunking' },
  { value: 'recursive', label: 'Recursive Chunking' }
];
export const PROMPT_SUPPORTED_REASIONING_MODELS = ['o1', 'o3-mini', 'o4-mini'];

export const FAQSIDEBARLINKS = [
  {
    title: "How use Gtwy Ai",
    href: "/faq/how-to-use-gtwy-ai",
  },
  {
    title: "Addvance Parameter Guide",
    href: "/faq/guide",
  },
  {
    title: "JSON Format Guide",
    href: "/faq/jsonformatdoc",
  },
  {
    title: "Create JWT Token Chatbot",
    href: "/faq/create-jwt-for-chatbot",
  },
];

export const PRICINGPLANS = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started and exploring our core features',
    features: [
      '1,000 API calls/month',
      'Basic support via email',
      'Core API features & integrations',
      'Access to public documentation',
      'Basic analytics dashboard',
      'Chatbot Integration'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom Pricing',
    description: 'Tailored solutions for large-scale organizations',
    features: [
      'Unlimited API calls',
      '24/7 priority support',
      'Custom feature development',
      'Enterprise SLA guarantees',
      'On-premise deployment options',
      'Advanced security features',
      'Dedicated account manager',
      'Custom analytics & reporting'
    ]
  }
];

export const FAQ_QUESTION_ANSWER = [
  {
    question: "What is GTWY AI, and how does it work?",
    answer:
      "GTWY AI is a powerful platform that simplifies the integration of AI into your products. It provides tools like model suggestions, web crawling, and database integrations to help businesses easily build and deploy AI-powered workflows and applications.",
  },
  {
    question: "Can I use GTWY AI without technical expertise?",
    answer:
      "Yes! GTWY AI is designed for both technical and non-technical users. Its intuitive interface and pre-built features make it easy to create and manage AI solutions without requiring deep coding knowledge.",
  },
  {
    question:
      "What types of AI models can I use with GTWY AI?",
    answer:
      "GTWY AI supports a wide variety of AI models, from pre-trained Large Language Models (LLMs) to custom APIs. You can select models tailored to your specific needs, such as content generation, data analysis, or customer service.",
  },
  {
    question: "Is my data secure with GTWY AI?",
    answer:
      "Absolutely. GTWY AI is built with robust security measures to ensure that all your data integrations and workflows are secure and compliant with industry standards.",
  },
  {
    question:
      "How can GTWY AI help reduce costs for my business?",
    answer:
      "GTWY AI reduces costs by offering ready-made AI tools and integrations, removing the need for expensive in-house AI development. It also optimizes workflows, saving time and resources while boosting productivity.",
  },
]

export const FEATURE_DATA = [
  {
    title: "Connect Apps:",
    subtitle: "Seamlessly Integrate Your Tools and Automate Workflows",
    description: "Effortlessly integrate various apps and platforms, allowing them to work together seamlessly. From CRM tools to marketing platforms and databases, connect apps in one place to automate tasks, streamline workflows, and enhance productivity across different services.",
    image: "./ConnectApps.svg",
    icon: "/live.svg"
  },

  {
    title: "Test Cases:",
    subtitle: "Achieve Perfection with Intelligent Testing",
    description: "With test cases, you can ensure your workflows, integrations, and AI interactions work exactly as intended from start to finish. They help you catch potential issues, validate every step, and keep everything running seamlessly and reliably.",
    image: "./TestCase.svg",
    icon: "/live.svg"
  },
]

