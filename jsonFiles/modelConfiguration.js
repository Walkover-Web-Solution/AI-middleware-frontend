export const modelInfo = {
    openai: {
        "gpt_3_5_turbo": {
            "model": {
                "field": "drop",
                "default": "gpt-3.5-turbo",
                "level": 1
            },
            "temperature": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "max_tokens": {
                "field": "slider",
                "min": 0,
                "max": 1024,
                "step": 1,
                "default": 256,
                "level": 2
            },
            "top_p": {
                "field": "slider",
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "logprobs": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "frequency_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "presence_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "n": {
                "field": "text",
                "default": 1,
                "typeOf": "number",
                "level": 0
            },
            "stop": {
                "field": "text",
                "default": null,
                "level": 0
            },
            "stream": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            }
        },
        "gpt_3_5_turbo_0613": {
            "model": {
                "field": "drop",
                "default": "gpt-3.5-turbo-0613",
                "level": 1
            },
            "temperature": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "max_tokens": {
                "field": "slider",
                "min": 0,
                "max": 1024,
                "step": 1,
                "default": 256,
                "level": 2
            },
            "top_p": {
                "field": "slider",
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "logprobs": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "frequency_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "presence_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "n": {
                "field": "text",
                "default": 1,
                "typeOf": "number",
                "level": 0
            },
            "stop": {
                "field": "text",
                "default": null,
                "level": 0
            },
            "stream": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            }
        },
        "gpt_3_5_turbo_0125": {
            "model": {
                "field": "drop",
                "default": "gpt-3.5-turbo-0125",
                "level": 1
            },
            "temperature": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "max_tokens": {
                "field": "slider",
                "min": 0,
                "max": 1024,
                "step": 1,
                "default": 256,
                "level": 2
            },
            "top_p": {
                "field": "slider",
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "logprobs": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "frequency_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "presence_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "n": {
                "field": "text",
                "default": 1,
                "typeOf": "number",
                "level": 0
            },
            "stop": {
                "field": "text",
                "default": null,
                "level": 0
            },
            "stream": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "tools": {
                "field": "text",
                "level": 0,
                "default": [],
                "typeOf": "array"
            },
            "tool_choice": {
                "field": "text",
                "default": "auto",
                "level": 0,
                "typeOf": "string"
            },
            "response_format": {
                "field": "json_object",
                "default": {
                    "type": "json_object"
                },
                "level": 0
            }
        },
        "gpt_3_5_turbo_1106": {
            "model": {
                "field": "drop",
                "default": "gpt-3.5-turbo-1106",
                "level": 1
            },
            "temperature": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "max_tokens": {
                "field": "slider",
                "min": 0,
                "max": 1024,
                "step": 1,
                "default": 256,
                "level": 2
            },
            "top_p": {
                "field": "slider",
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "logprobs": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "frequency_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "presence_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "n": {
                "field": "text",
                "default": 1,
                "typeOf": "number",
                "level": 0
            },
            "stop": {
                "field": "text",
                "default": null,
                "level": 0
            },
            "stream": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "tools": {
                "field": "text",
                "level": 0,
                "default": [],
                "typeOf": "array"
            },
            "tool_choice": {
                "field": "text",
                "default": "auto",
                "level": 0,
                "typeOf": "string"
            },
            "response_format": {
                "field": "json_object",
                "default": {
                    "type": "json_object"
                },
                "level": 0
            }
        },
        "gpt_4": {
            "model": {
                "field": "drop",
                "default": "gpt-4",
                "level": 1
            },
            "temperature": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "max_tokens": {
                "field": "slider",
                "min": 0,
                "max": 1024,
                "step": 1,
                "default": 256,
                "level": 2
            },
            "top_p": {
                "field": "slider",
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "logprobs": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "frequency_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "presence_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "n": {
                "field": "text",
                "default": 1,
                "typeOf": "number",
                "level": 0
            },
            "stop": {
                "field": "text",
                "default": null,
                "level": 0
            },
            "stream": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "tools": {
                "field": "text",
                "level": 0,
                "default": [],
                "typeOf": "array"
            },
            "tool_choice": {
                "field": "text",
                "default": "auto",
                "level": 0,
                "typeOf": "string"
            }
        },
        "gpt_4_0613": {
            "model": {
                "field": "drop",
                "default": "gpt-4-0613",
                "level": 1
            },
            "temperature": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "max_tokens": {
                "field": "slider",
                "min": 0,
                "max": 1024,
                "step": 1,
                "default": 256,
                "level": 2
            },
            "top_p": {
                "field": "slider",
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "logprobs": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "frequency_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "presence_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "n": {
                "field": "text",
                "default": 1,
                "typeOf": "number",
                "level": 0
            },
            "stop": {
                "field": "text",
                "default": null,
                "level": 0
            },
            "stream": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "tools": {
                "field": "text",
                "level": 0,
                "default": [],
                "typeOf": "array"
            },
            "tool_choice": {
                "field": "text",
                "default": "auto",
                "level": 0,
                "typeOf": "string"
            }
        },
        "gpt_4_1106_preview": {
            "model": {
                "field": "drop",
                "default": "gpt-4-1106-preview",
                "level": 1
            },
            "temperature": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "max_tokens": {
                "field": "slider",
                "min": 0,
                "max": 1024,
                "step": 1,
                "default": 256,
                "level": 2
            },
            "top_p": {
                "field": "slider",
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "logprobs": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "frequency_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "presence_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "n": {
                "field": "text",
                "default": 1,
                "typeOf": "number",
                "level": 0
            },
            "stop": {
                "field": "text",
                "default": null,
                "level": 0
            },
            "stream": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "tools": {
                "field": "text",
                "level": 0,
                "default": [],
                "typeOf": "array"
            },
            "tool_choice": {
                "field": "text",
                "default": "auto",
                "level": 0,
                "typeOf": "string"
            },
            "response_format": {
                "field": "json_object",
                "default": {
                    "type": "json_object"
                },
                "level": 0
            }
        },
        "gpt_4_turbo_preview": {
            "model": {
                "field": "drop",
                "default": "gpt-4-turbo-preview",
                "level": 1
            },
            "temperature": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "max_tokens": {
                "field": "slider",
                "min": 0,
                "max": 1024,
                "step": 1,
                "default": 256,
                "level": 2
            },
            "top_p": {
                "field": "slider",
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "logprobs": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "frequency_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "presence_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "n": {
                "field": "text",
                "default": 1,
                "typeOf": "number",
                "level": 0
            },
            "stop": {
                "field": "text",
                "default": null,
                "level": 0
            },
            "stream": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "tools": {
                "field": "text",
                "level": 0,
                "default": [],
                "typeOf": "array"
            },
            "tool_choice": {
                "field": "text",
                "default": "auto",
                "level": 0,
                "typeOf": "string"
            },
            "response_format": {
                "field": "json_object",
                "default": {
                    "type": "json_object"
                },
                "level": 0
            }
        },
        "gpt_4_0125_preview": {
            "model": {
                "field": "drop",
                "default": "gpt-4-0125-preview",
                "level": 1
            },
            "temperature": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "max_tokens": {
                "field": "slider",
                "min": 0,
                "max": 1024,
                "step": 1,
                "default": 256,
                "level": 2
            },
            "top_p": {
                "field": "slider",
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "logprobs": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "frequency_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "presence_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "n": {
                "field": "text",
                "default": 1,
                "typeOf": "number",
                "level": 0
            },
            "stop": {
                "field": "text",
                "default": null,
                "level": 0
            },
            "stream": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "tools": {
                "field": "text",
                "level": 0,
                "default": [],
                "typeOf": "array"
            },
            "tool_choice": {
                "field": "text",
                "default": "auto",
                "level": 0,
                "typeOf": "string"
            },
            "response_format": {
                "field": "json_object",
                "default": {
                    "text": "json_object"
                },
                "level": 0
            }
        },
        "text_embedding_3_large": {
            "model": {
                "field": "drop",
                "default": "text-embedding-3-large",
                "level": 1
            },
            "encoding_format": {
                "field": "text",
                "typeOf": "string",
                "level": 2
            },
            "dimensions": {
                "field": "text",
                "typeOf": "number",
                "level": 0
            }
        },
        "text_embedding_3_small": {
            "model": {
                "field": "drop",
                "default": "text-embedding-3-small",
                "level": 1
            },
            "encoding_format": {
                "field": "text",
                "typeOf": "string",
                "level": 2
            },
            "dimensions": {
                "field": "text",
                "typeOf": "number",
                "level": 0
            }
        },
        "text_embedding_ada_002": {
            "model": {
                "field": "drop",
                "default": "text-embedding-ada-002",
                "level": 1
            },
            "encoding_format": {
                "field": "text",
                "typeOf": "string",
                "level": 2
            }
        },
        "gpt_3_5_turbo_instruct": {
            "model": {
                "field": "drop",
                "default": "gpt-3.5-turbo-instruct",
                "level": 1
            },
            "best_of": {
                "field": "slider",
                "min": 1,
                "max": 20,
                "default": 1,
                "level": 2,
                "step": 1
            },
            "echo": {
                "field": "text",
                "default": false,
                "typeOf": "boolean",
                "level": 2
            },
            "frequency_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "logit_bias": {
                "field": "text",
                "typeOf": "json_object",
                "default": null,
                "level": 0
            },
            "logprobs": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "max_tokens": {
                "field": "slider",
                "min": 0,
                "max": 1024,
                "step": 1,
                "default": 256,
                "level": 2
            },
            "n": {
                "field": "text",
                "default": 1,
                "typeOf": "number",
                "level": 0
            },
            "presence_penalty": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.01,
                "default": 0,
                "level": 2
            },
            "seed": {
                "field": "text",
                "typeOf": "number",
                "default": null,
                "level": 0
            },
            "stop": {
                "field": "text",
                "default": null,
                "level": 0
            },
            "stream": {
                "field": "text",
                "default": false,
                "level": 0,
                "typeOf": "boolean"
            },
            "suffix": {
                "field": "text",
                "typeOf": "string",
                "default": null,
                "level": 2
            },
            "temperature": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "top_p": {
                "field": "slider",
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 1,
                "level": 2
            }
        }
    },
    google:
    {
        "gemini_pro": {
            "model": {
                "field": "drop",
                "default": "gemini-pro",
                "level": 1
            },
            "temperature": {
                "field": "slider",
                "min": 0,
                "max": 2,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "topK": {
                "field": "slider",
                "min": 1,
                "max": 40,
                "step": 1,
                "default": 40,
                "level": 2
            },
            "topP": {
                "field": "slider",
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 1,
                "level": 2
            },
            "maxOutputTokens": {
                "field": "slider",
                "min": 1,
                "max": 30720,
                "step": 1,
                "default": 2048,
                "level": 0
            },
            "stopSequences": {
                "field": "text",
                "default": null,
                "level": 0
            }
        }
    }


}