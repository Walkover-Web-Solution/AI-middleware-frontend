import { BookIcon, BotIcon, KeyIcon, SettingsIcon, TestTubeDiagonalIcon, WrenchIcon } from "@/components/Icons";
export const PAUTH_KEY_COLUMNS = ["name", "authkey", "created_at"];
export const API_KEY_COLUMNS = ["name", "apikey", "comment", 'apikey_usage', "last_used"];
export const WEBHOOKALERT_COLUMNS = ['name', 'url', 'headers', 'alertType', 'bridges'];
export const ALERT_TYPE = ['Error', 'Variable'];

export const AVAILABLE_MODEL_TYPES = {
  API: 'api',
  CHAT: 'chat',
  FINETUNE: 'finetune',
  COMPLETION: 'completion',
  IMAGE: 'image',
  EMBEDDING: 'embedding',
  REASONING: 'reasoning',
};
// Canonical descriptions for finish_reason values

export const MODAL_TYPE = {
  CREATE_VARIABLE: 'CREATE_VARIABLE',
  CREATE_BRIDGE_MODAL: 'CREATE_BRIDGE_MODAL',
  OPTIMIZE_PROMPT: 'optmize_prompt_modal',
  PUBLISH_BRIDGE_VERSION: 'publish_bridge_version_modal',
  VERSION_DESCRIPTION_MODAL: "version_description_modal",
  API_KEY_MODAL: "API_KEY_MODAL",
  PAUTH_KEY_MODAL: "PAUTH_KEY_MODAL",
  FINE_TUNE_MODAL: "fine-tune-modal",
  PRE_FUNCTION_PARAMETER_MODAL: "pre-function-parameter-modal",
  TOOL_FUNCTION_PARAMETER_MODAL: "tool-function-parameter-modal",
  ACTION_MODAL: "actionModel",
  CHATBOT_MODAL: "chatBot_model",
  CREATE_ORG_MODAL: "create-org-modal",
  WEBHOOK_MODAL: "WEBHOOK_MODAL",
  CHAT_DETAILS_VIEW_MODAL: "chat_details_view",
  JSON_SCHEMA: "JSON_SCHEMA",
  KNOWLEDGE_BASE_MODAL: 'KNOWLEDGE_BASE_MODAL',
  PROMPT_SUMMARY: 'PROMPT_SUMMARY',
  TESTCASE_MODAL: "TESTCASE_MODAL",
  DEMO_MODAL: "DEMO_MODAL",
  ADD_TEST_CASE_MODAL: "ADD_TEST_CASE_MODAL",
  HISTORY_PAGE_PROMPT_UPDATE_MODAL: "HISTORY_PAGE_PROMPT_UPDATE_MODAL",
  AGENT_DESCRIPTION_MODAL: "AGENT_DESCRIPTION_MODAL",
  AGENT_VARIABLE_MODAL: "AGENT_VARIABLE_MODAL",
  TUTORIAL_MODAL: "TUTORIAL_MODAL",
  EDIT_MESSAGE_MODAL: "EDIT_MESSAGE_MODAL",
  INTEGRATION_MODAL: "INTEGRATION_MODAL",
  INTEGRATION_GUIDE_MODAL: "INTEGRATION_GUIDE_MODAL",
  AUTH_DATA_MODAL: "AUTH_DATA_MODAL",
  KNOWLEDGE_BASE_MODAL: "KNOWLEDGE_BASE_MODAL",
  DELETE_MODAL: "DELETE_MODAL",
  DELETE_PREBUILT_TOOL_MODAL: "DELETE_PREBUILT_TOOL_MODAL",
  DELETE_TOOL_MODAL: "DELETE_TOOL_MODAL",
  DELETE_AGENT_MODAL: "DELETE_AGENT_MODAL",
  DELETE_PRE_TOOL_MODAL: "DELETE_PRE_TOOL_MODAL",
  DELETE_KNOWLEDGE_BASE_MODAL: "DELETE_KNOWLEDGE_BASE_MODAL",
  BRIDGE_TYPE_MODAL: "BRIDGE_TYPE_MODAL",
  ADD_NEW_MODEL_MODAL: "ADD_NEW_MODEL_MODAL",
  USAGE_DETAILS_MODAL: "USAGE_DETAILS_MODAL",
  CONNECTED_AGENTS_MODAL: "CONNECTED_AGENTS_MODAL",
  DIFF_PROMPT: "DIFF_PROMPT",
  ORCHESTRAL_AGENT_PARAMETER_MODAL: "ORCHESTRAL_AGENT_PARAMETER_MODAL",
  CREATE_ORCHESTRAL_FLOW_MODAL :"CREATE_ORCHESTRAL_FLOW_MODAL",
  API_KEY_LIMIT_MODAL: "API_KEY_LIMIT_MODAL",
  PROMPT_SUMMARY_PUBLISH: "PROMPT_SUMMARY_PUBLISH",
  DELETE_VERSION_MODAL: 'DELETE_VERSION_MODAL',
  PREBUILT_TOOLS_CONFIG_MODAL: 'PREBUILT_TOOLS_CONFIG_MODAL',
  INVITE_USER: 'INVITE_USER',
  ORCHESTRAL_DELETE_MODAL:"ORCHESTRAL_DELETE_MODAL"
};

export const API_KEY_MODAL_INPUT = ['name', 'apikey', 'comment', 'apikey_limit'];

export const USER_FEEDBACK_FILTER_OPTIONS = ["all", "1", "2"];

export const TIME_RANGE_OPTIONS = ['1 hour', '3 hours', '6 hours', '12 hours','1 day', '2 days','7 days','14 days','30 days'];

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

export const AUTH_COLUMNS = ['name', 'redirection_url', 'client_id']

export const AGENT_SETUP_GUIDE_STEPS = [
  {
    step: '1',
    title: 'Define Your Agent\'s Purpose',
    detail: 'Write a clear prompt describing what you want your agent to accomplish.',
    icon: '✨',
    example: 'Example: "Help customers with product inquiries and provide personalized recommendations based on their purchase history."'
  },
  {
    step: '2',
    title: 'Connect External Functions',
    detail: 'Enhance your agent\'s capabilities by connecting APIs, databases, or custom functions.',
    optional: true,
    icon: '🔗',
    example: 'Examples: CRM systems (Salesforce), Payment processors (Stripe), Database queries, Email services'
  },
  {
    step: '3',
    title: 'Choose Your AI Service',
    detail: 'Select from available AI providers like OpenAI, Anthropic, or others.',
    optional: true,
    icon: '⚡',
    example: 'Examples: OpenAI GPT-4, Claude 3.5 Sonnet'
  },
  {
    step: '4',
    title: 'Select the Right Model',
    detail: 'Pick an AI model that matches your requirements.',
    optional: true,
    icon: '🧠',
    example: 'Examples: GPT-4 for complex tasks, GPT-3.5 for cost efficiency, Claude for long conversations'
  },
  {
    step: '5',
    title: 'Configure API Access',
    detail: 'Add your API keys and configure authentication to enable your agent.',
    icon: '🔐',
    example: 'Examples: OpenAI API key, Anthropic API key, Custom webhook URLs, Database connection strings'
  },
];

export const TUTORIALS = [
  {
    title: 'Agent Creation',
    description: 'Learn how to create and manage agents in GTWY.ai platform',
    videoUrl: null, // Will be populated dynamically from Redux
    icon: BotIcon
  },
  {
    title: 'Pauth Key Setup',
    description: 'Configure authentication keys for secure access',
    videoUrl: null, // Will be populated dynamically from Redux
    icon: KeyIcon
  },
  {
    title: 'Tool Configuration',
    description: 'Set up and configure tools for your workflow',
    videoUrl: null, // Will be populated dynamically from Redux
    icon: WrenchIcon

  },
  {
    title: 'Variable Management',
    description: 'Add and manage variables in your environment',
    videoUrl: null, // Will be populated dynamically from Redux
    icon: SettingsIcon
  },
  {
    title: 'KnowledgeBase Configuration',
    description: 'Set up and manage your knowledge base for intelligent responses',
    videoUrl: null, // Will be populated dynamically from Redux
    icon: BookIcon
  },
  {
    title: 'Advanced Parameters',
    description: 'Set up and update advanced parameters for your workflow',
    videoUrl: null, // Will be populated dynamically from Redux
    icon: BookIcon
  },
  {
    title: 'TestCases Creation',
    description: 'Set up TestCase',
    videoUrl: "https://app.supademo.com/embed/cmav1ocfu4thnho3rijvpzlrq?embed_v=2",
    icon: TestTubeDiagonalIcon
  }
];

export const template = [{
  "template_1": {
    "type": "Card",
    "children": [
      {
        "type": "Col",
        "align": "center",
        "gap": 4,
        "padding": 4,
        "children": [
          {
            "type": "Box",
            "background": "green-400",
            "radius": "full",
            "padding": 3,
            "children": [
              {
                "type": "Icon",
                "name": "check",
                "size": "3xl",
                "color": "white"
              }
            ]
          },
          {
            "type": "Col",
            "align": "center",
            "gap": 1,
            "children": [
              {
                "type": "Title",
                "value": "Enable notification"
              },
              {
                "type": "Text",
                "value": "Notify me when this item ships",
                "color": "secondary"
              }
            ]
          }
        ]
      },
      {
        "type": "Row",
        "children": [
          {
            "type": "Button",
            "label": "Yes",
            "block": true,
            "onClickAction": {
              "type": "notification.settings",
              "payload": {
                "enable": true
              }
            }
          },
          {
            "type": "Button",
            "label": "No",
            "block": true,
            "variant": "outline",
            "onClickAction": {
              "type": "notification.settings",
              "payload": {
                "enable": false
              }
            }
          }
        ]
      }
    ]
  },

  "json_schema": {
    "name": "nested_ui_components",
    "schema": {
      "type": "object",
      "properties": {
        "children[0].children[0].children[0].name": {
          "type": "string",
          "description": "Logical name used to reference this field."
        },
        "children[0].children[1].children[0].value": {
          "type": "string",
          "description": "Static text content displayed in the UI."
        },
        "children[0].children[1].children[1].value": {
          "type": "string",
          "description": "Static text content displayed in the UI."
        },
        "children[1].children[0].label": {
          "type": "string",
          "description": "Button label text shown to the user."
        },
        "children[1].children[1].label": {
          "type": "string",
          "description": "Button label text shown to the user."
        }
      },
      "required": [
        "children[0].children[0].children[0].name",
        "children[0].children[1].children[0].value",
        "children[0].children[1].children[1].value",
        "children[1].children[0].label",
        "children[1].children[1].label"
      ],
      "additionalProperties": false
    },
    "strict": true
  },

  "html": "<div class=\"relative max-w-xl w-full overflow-hidden rounded-[20px] border border-slate-200 bg-white text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.10)] p-6\"><div class=\"space-y-4\"><div class=\"flex flex-col gap-4 p-4 w-full items-center\"><div class=\"flex items-center justify-center rounded-xl p-3 bg-green-400\" style=\"width:40px;height:40px;\"><span class=\"inline-flex h-5 w-5 items-center justify-center\"><span class=\"text-[0.7rem] uppercase tracking-tight\">UserMessage</span></span></div><div class=\"flex flex-col gap-1 w-full items-center\"><h2 class=\"text-xl md:text-2xl font-semibold text-slate-900 tracking-tight\">Hello! How can I assist you today?</h2><p class=\"text-sm text-slate-500\">Need any help or information?</p></div></div><div class=\"flex flex-row gap-3 items-stretch\"><button type=\"button\" class=\"inline-flex items-center justify-center px-5 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 rounded-full focus:ring-slate-300 w-full\">Ask a Question</button><button type=\"button\" class=\"inline-flex items-center justify-center px-5 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 rounded-full focus:ring-slate-300 w-full\">Get Support</button></div></div></div>"
},
{
  "template_2":{
  "type": "Card",
  "size": "lg",
  "confirm": {
    "action": {
      "type": "email.send"
    },
    "label": "Send email"
  },
  "cancel": {
    "action": {
      "type": "email.discard"
    },
    "label": "Discard"
  },
  "children": [
    {
      "type": "Row",
      "children": [
        {
          "type": "Text",
          "value": "FROM",
          "width": 80,
          "weight": "semibold",
          "color": "tertiary",
          "size": "xs"
        },
        {
          "type": "Text",
          "value": "zj@openai.com",
          "color": "tertiary"
        }
      ]
    },
    {
      "type": "Divider",
      "flush": true
    },
    {
      "type": "Row",
      "children": [
        {
          "type": "Text",
          "value": "TO",
          "width": 80,
          "weight": "semibold",
          "color": "tertiary",
          "size": "xs"
        },
        {
          "type": "Text",
          "value": "weedon@openai.com",
          "editable": {
            "name": "email.to",
            "required": true,
            "placeholder": "name@example.com"
          }
        }
      ]
    },
    {
      "type": "Divider",
      "flush": true
    },
    {
      "type": "Row",
      "children": [
        {
          "type": "Text",
          "value": "SUBJECT",
          "width": 80,
          "weight": "semibold",
          "color": "tertiary",
          "size": "xs"
        },
        {
          "type": "Text",
          "value": "ChatKit Roadmap",
          "editable": {
            "name": "email.subject",
            "required": true,
            "placeholder": "Email subject"
          }
        }
      ]
    },
    {
      "type": "Divider",
      "flush": true
    },
    {
      "type": "Text",
      "value": "Hey David, \n\nHope you're doing well! Just wanted to check in and see if there are any updates on the ChatKit roadmap. We're excited to see what's coming next and how we can make the most of the upcoming features.\n\nEspecially curious to see how you support widgets!\n\nBest, Zach",
      "minLines": 9,
      "editable": {
        "name": "email.body",
        "required": true,
        "placeholder": "Write your message…"
      }
    }
  ]
},
"json_schema":{
  "name": "nested_ui_components",
  "schema": {
    "type": "object",
    "properties": {
      "confirm.label": {
        "type": "string",
        "description": "Display label text shown to the user."
      },
      "cancel.label": {
        "type": "string",
        "description": "Display label text shown to the user."
      },
      "children[0].children[0].value": {
        "type": "string",
        "description": "Static text content displayed in the UI."
      },
      "children[0].children[1].value": {
        "type": "string",
        "description": "Static text content displayed in the UI."
      },
      "children[2].children[0].value": {
        "type": "string",
        "description": "Static text content displayed in the UI."
      },
      "children[2].children[1].value": {
        "type": "string",
        "description": "Static text content displayed in the UI."
      },
      "children[2].children[1].editable.name": {
        "type": "string",
        "description": "Logical name used to reference this field."
      },
      "children[2].children[1].editable.placeholder": {
        "type": "string",
        "description": "Placeholder text shown when the input field is empty."
      },
      "children[4].children[0].value": {
        "type": "string",
        "description": "Static text content displayed in the UI."
      },
      "children[4].children[1].value": {
        "type": "string",
        "description": "Static text content displayed in the UI."
      },
      "children[4].children[1].editable.name": {
        "type": "string",
        "description": "Logical name used to reference this field."
      },
      "children[4].children[1].editable.placeholder": {
        "type": "string",
        "description": "Placeholder text shown when the input field is empty."
      },
      "children[6].value": {
        "type": "string",
        "description": "Static text content displayed in the UI."
      },
      "children[6].editable.name": {
        "type": "string",
        "description": "Logical name used to reference this field."
      },
      "children[6].editable.placeholder": {
        "type": "string",
        "description": "Placeholder text shown when the input field is empty."
      }
    },
    "required": [
      "confirm.label",
      "cancel.label",
      "children[0].children[0].value",
      "children[0].children[1].value",
      "children[2].children[0].value",
      "children[2].children[1].value",
      "children[2].children[1].editable.name",
      "children[2].children[1].editable.placeholder",
      "children[4].children[0].value",
      "children[4].children[1].value",
      "children[4].children[1].editable.name",
      "children[4].children[1].editable.placeholder",
      "children[6].value",
      "children[6].editable.name",
      "children[6].editable.placeholder"
    ],
    "additionalProperties": false
  },
  "strict": true
},
"html":"<div class=\"relative max-w-xl w-full overflow-hidden rounded-[20px] border border-slate-200 bg-white text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.10)] p-7\">\n  <div class=\"space-y-4\">\n    <div class=\"flex flex-row gap-3 items-stretch   \">\n  <p class=\"text-xs text-slate-400 font-semibold  \">Welcome Message</p>\n<p class=\"text-sm text-slate-400   \">Hello! How can I assist you today?</p>\n</div>\n<div class=\"relative mx-0\">\n  <div class=\"border-t border-dashed border-slate-200/80\"></div>\n</div>\n<div class=\"flex flex-row gap-3 items-stretch   \">\n  <p class=\"text-xs text-slate-400 font-semibold  \">Quick Actions</p>\n<input\n  type=\"text\"\n  name=\"quickAction1\"\n  class=\"block w-full bg-transparent text-sm   text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0\"\n  placeholder=\"Type your question...\"\n  value=\"Ask a Question\"\n/>\n</div>\n<div class=\"relative mx-0\">\n  <div class=\"border-t border-dashed border-slate-200/80\"></div>\n</div>\n<div class=\"flex flex-row gap-3 items-stretch   \">\n  <p class=\"text-xs text-slate-400 font-semibold  \">Live Support</p>\n<input\n  type=\"text\"\n  name=\"liveSupport\"\n  class=\"block w-full bg-transparent text-sm   text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0\"\n  placeholder=\"Type your message...\"\n  value=\"Chat with Support\"\n/>\n</div>\n<div class=\"relative mx-0\">\n  <div class=\"border-t border-dashed border-slate-200/80\"></div>\n</div>\n<textarea\n  name=\"feedback\"\n  rows=\"9\"\n  class=\"block w-full bg-transparent text-sm   text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 resize-none leading-relaxed\"\n  placeholder=\"Provide feedback here...\"\n>Feedback</textarea>\n    <div class=\"mt-4 flex justify-end gap-3 px-4 pb-4\">\n  <button\n  type=\"button\"\n  class=\"inline-flex items-center justify-center px-5 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 rounded-full focus:ring-slate-300 \"\n>\n  Cancel\n</button>\n<button\n  type=\"button\"\n  class=\"inline-flex items-center justify-center px-5 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-black text-white hover:bg-zinc-900 rounded-full focus:ring-black \"\n>\n  Submit\n</button>\n</div>\n  </div>\n</div>"
}]