
export const modelInfo = {
    openai: {
        "gpt-3.5-turbo": {
            configuration: {
                "model": { field: "dropdown", default: "gpt-3.5-turbo", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0 },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0 },

            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },

            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                }
            }
        },

        "gpt-3.5-turbo-0613": {
            configuration: {
                "model": { field: "dropdown", default: "gpt-3.5-turbo-0613", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0 },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0 }
            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },

            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },

        "gpt-3.5-turbo-0125": {
            configuration: {
                "model": { field: "dropdown", default: "gpt-3.5-turbo-0125", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0 },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0 },
                "tools": { field: "array", level: 0, default: [] },
                "tool_choice": { field: "text", default: "auto", level: 0 },
                "response_format": { field: "boolean", default: { type: "text" }, level: 0 }
            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },

            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },

        "gpt-3.5-turbo-0301": {
            configuration: {
                "model": { field: "dropdown", default: "gpt-3.5-turbo-0301", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0 },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0 },
                "tools": { field: "array", level: 0, default: [], },
                "tool_choice": { field: "text", default: "auto", level: 0, },
                "response_format": { field: "boolean", default: { type: "text" }, level: 0 }
            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },

            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },
        "gpt-3.5-turbo-1106": {
            configuration: {
                "model": { field: "dropdown", default: "gpt-3.5-turbo-1106", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [], },
                "tool_choice": { field: "string", default: "auto", level: 0, },
                "response_format": { field: "boolean", default: { type: "text" }, level: 0 }
            },



            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },

            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },

        "gpt-3.5-turbo-16k": {
            configuration: {
                "model": { field: "dropdown", default: "gpt-3.5-turbo-16k", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [], },
                "tool_choice": { field: "text", default: "auto", level: 0, },
                "response_format": { field: "boolean", default: { type: "text" }, level: 0 }
            },



            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },

            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },

        "gpt-3.5-turbo-16k-0613": {
            configuration: {
                "model": { field: "dropdown", default: "gpt-3.5-turbo-16k-0613", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [], },
                "tool_choice": { field: "text", default: "auto", level: 0, },
                "response_format": { field: "boolean", default: { type: "text" }, level: 0 }
            },



            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },

            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },
        "gpt-4": {
            configuration: {
                "model": { field: "dropdown", default: "gpt-4", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [], },
                "tool_choice": { field: "text", default: "auto", level: 0, },
            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },

            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },      
        "gpt-4-0613": {
            configuration: {
                "model": { field: "dropdown", default: "gpt-4-0613", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [], },
                "tool_choice": { field: "text", default: "auto", level: 0, },
            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },

            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },
        "gpt-4-1106-preview": {
            configuration: {
                "model": { field: "dropdown", default: "gpt-4-1106-preview", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [], },
                "tool_choice": { field: "text", default: "auto", level: 0, },
                "response_format": { field: "boolean", default: { type: "text" }, level: 0 }
            },



            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },


            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },
        "gpt-4-turbo-preview": {
            configuration: {
                "model": { field: "dropdown", default: "gpt-4-turbo-preview", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [], },
                "tool_choice": { field: "text", default: "auto", level: 0, },
                "response_format": { field: "boolean", default: { type: "text" }, level: 0 }
            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },


            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },
        "gpt-4-0125-preview": {
            configuration: {
                "model": { field: "dropdown", default: "gpt-4-0125-preview", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [], },
                "tool_choice": { field: "text", default: "auto", level: 0, },
                "response_format": { field: "boolean", default: { type: "text" }, level: 0 }
            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },

            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },
        "gpt-4-turbo-2024-04-09": {
            configuration: {
                "model": { field: "drop", default: "gpt-4-turbo-2024-04-09", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, typeOf: "boolean" },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, typeOf: "number", level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0, typeOf: "boolean" },
                "tools": { field: "array", level: 0, default: [], typeOf: "array" },
                "tool_choice": { field: "text", default: "auto", level: 0, typeOf: "string" },
                "response_format": { field: "boolean", default: { type: "text" }, level: 0 }

            },
            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens", total_cost: { input_cost: 0.01, output_cost: 0.03 } }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },

            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },
        "gpt-4-turbo": {
            configuration: {
                "model": { field: "drop", default: "gpt-4-turbo", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, typeOf: "boolean" },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, typeOf: "number", level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0, typeOf: "boolean" },
                "tools": { field: "array", level: 0, default: [], typeOf: "array" },
                "tool_choice": { field: "text", default: "auto", level: 0, typeOf: "string" },
                "response_format": { field: "boolean", default: { type: "text" }, level: 0 }

            },
            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens", total_cost: { input_cost: 0.01, output_cost: 0.03 } }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },
            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },
        "gpt-4o-mini": {
            configuration: {
                "model": { field: "drop", default: "gpt-4o-mini", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, typeOf: "boolean" },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, typeOf: "number", level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0, typeOf: "boolean" },
                "tools": { field: "array", level: 0, default: [], typeOf: "array" },
                "tool_choice": { field: "text", default: "auto", level: 0, typeOf: "string" },
                "response_format": { field: "boolean", default: { type: "text" }, level: 0 }

            },
            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens", total_cost: { input_cost: 0.01, output_cost: 0.03 } }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },
            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },

        "gpt-4o": {
            configuration: {
                "model": { field: "drop", default: "gpt-4-turbo", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, typeOf: "boolean" },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, typeOf: "number", level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0, typeOf: "boolean" },
                "tools": { field: "array", level: 0, default: [], typeOf: "array" },
                "tool_choice": { field: "text", default: "auto", level: 0, typeOf: "string" },
                "response_format": { field: "boolean", default: { type: "text" }, level: 0 }

            },
            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens", total_cost: { input_cost: 0.01, output_cost: 0.03 } }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                assistant: "choices[0].message",
                id: "id"
            },
            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },

        "text-embedding-3-large": {
            configuration: {
                "model": { field: "dropdown", default: "text-embedding-3-large", "level": 1 },
                "encoding_format": { field: "dropdown", values: ['float', 'base64'], default: "float", level: 2 },
                "dimensions": { field: "number", level: 0 }
            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", total_tokens: "usage.total_tokens" }],
                message: "data[0].embedding"
            },

            inputConfig: {
                input: {
                    "input": "",
                    "contentKey": "input",
                    "type": "text",
                }
            }
        },

        "text-embedding-3-small": {
            configuration: {
                "model": { field: "dropdown", default: "text-embedding-3-large", "level": 1 },
                "encoding_format": { field: "dropdown", values: ['float', 'base64'], default: "float", level: 2 },
                "dimensions": { field: "number", level: 0 }
            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", total_tokens: "usage.total_tokens" }],
                message: "data[0].embedding"
            },

            inputConfig: {
                input: {
                    "input": "",
                    "contentKey": "input",
                    "type": "text",
                }
            }
        },
        "text-embedding-ada-002": {
            configuration: {
                "model": { field: "dropdown", default: "text-embedding-3-large", "level": 1 },
                "encoding_format": { field: "dropdown", values: ['float', 'base64'], default: "float", level: 2 },
                // dimensions is fixed here, 1536 will be the size of the vector
            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", total_tokens: "usage.total_tokens" }],
                message: "data[0].embedding"
            },

            inputConfig: {
                input: {
                    "input": "",
                    "contentKey": "input",
                    "type": "text",
                }
            }
        },
        "gpt-3.5-turbo-instruct": {
            configuration: {

                "model": { field: "drop", default: "gpt-3.5-turbo-instruct", "level": 1 },
                "best_of": { field: "slider", min: 1, max: 20, default: 1, level: 2, step: 1 },
                "echo": { field: "text", default: false, typeOf: "boolean", level: 2 },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                // "logit_bias": { field: "text", typeOf: "json_object", default: null, level: 0 }, 
                "logprobs": { field: "boolean", default: false, level: 0 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "seed": { field: "number", default: 0, level: 0 },
                "stop": { field: "text", default: "", level: 0 },
                "stream": { field: "boolean", default: false, level: 0 },
                "suffix": { field: "text", default: null, level: 2 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 0, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].text",
                assistant: "choices",
                id: "id"
            },

            inputConfig: {
                prompt: {
                    "prompt": "",
                    "contentKey": "prompt",
                    "type": "text",
                }
            }
        },
        chatmessage: {
            chat: {
                role: "user",
                content: ""
            }, chatpath: "content"
        }
    },
    google:
    {
        "gemini-pro": {
            configuration: {
                "model": { field: "drop", default: "gemini-pro", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "topK": { field: "slider", min: 1, max: 40, step: 1, default: 40, level: 2 },
                "topP": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "maxOutputTokens": { field: "slider", min: 1, max: 8192, step: 1, default: 2048, level: 0 },
                "stopSequences": { field: "text", default: "", level: 0 },
            },


            "apikey": "",
            outputConfig: {
                usage: [],
                message: "candidates[0].content.parts[0].text",
                assistant: "candidates[0].content",
                role: "model"
            },

            inputConfig: {
                model: {
                    "default": {
                        "role": "model",
                        "parts": [
                            {
                                "text": ""
                            }
                        ]
                    },
                    "contentKey": "parts[0].text",
                    "type": "json"

                }
            }
        },
        "gemini-1.5-pro": {
            configuration: {
                "model": { field: "drop", default: "gemini-1.5-pro", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "topK": { field: "slider", min: 1, max: 40, step: 1, default: 40, level: 2 },
                "topP": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "maxOutputTokens": { field: "slider", min: 1, max: 8192, step: 1, default: 2048, level: 0 },
                "stopSequences": { field: "text", default: "", level: 0 },
            },


            "apikey": "",
            outputConfig: {
                usage: [],
                message: "candidates[0].content.parts[0].text",
                assistant: "candidates[0].content",
                role: "model"
            },

            inputConfig: {
                model: {
                    "default": {
                        "role": "model",
                        "parts": [
                            {
                                "text": ""
                            }
                        ]
                    },
                    "contentKey": "parts[0].text",
                    "type": "json"

                }
            }
        },
        "gemini-1.5-Flash": {
            configuration: {
                "model": { field: "drop", default: "gemini-1.5-Flash", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "topK": { field: "slider", min: 1, max: 40, step: 1, default: 40, level: 2 },
                "topP": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "maxOutputTokens": { field: "slider", min: 1, max: 8192, step: 1, default: 2048, level: 0 },
                "stopSequences": { field: "text", default: "", level: 0 },
            },


            "apikey": "",
            outputConfig: {
                usage: [],
                message: "candidates[0].content.parts[0].text",
                assistant: "candidates[0].content",
                role: "model"
            },

            inputConfig: {
                model: {
                    "default": {
                        "role": "model",
                        "parts": [
                            {
                                "text": ""
                            }
                        ]
                    },
                    "contentKey": "parts[0].text",
                    "type": "json"

                }
            }
        },
        "gemini-1.0-pro": {
            configuration: {
                "model": { field: "drop", default: "gemini-1.0-pro", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "topK": { field: "slider", min: 1, max: 40, step: 1, default: 40, level: 2 },
                "topP": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "maxOutputTokens": { field: "slider", min: 1, max: 8192, step: 1, default: 2048, level: 0 },
                "stopSequences": { field: "text", default: "", level: 0 },
            },


            "apikey": "",
            outputConfig: {
                usage: [],
                message: "candidates[0].content.parts[0].text",
                assistant: "candidates[0].content",
                role: "model"
            },

            inputConfig: {
                model: {
                    "default": {
                        "role": "model",
                        "parts": [
                            {
                                "text": ""
                            }
                        ]
                    },
                    "contentKey": "parts[0].text",
                    "type": "json"

                }
            }
        },
        "gemini-1.0-pro-vision": {
            configuration: {
                "model": { field: "drop", default: "gemini-1.0-pro-vision", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "topK": { field: "slider", min: 1, max: 40, step: 1, default: 40, level: 2 },
                "topP": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "maxOutputTokens": { field: "slider", min: 1, max: 4096, step: 1, default: 2048, level: 0 },
                "stopSequences": { field: "text", default: "", level: 0 },
            },


            "apikey": "",
            outputConfig: {
                usage: [],
                message: "candidates[0].content.parts[0].text",
                assistant: "candidates[0].content",
                role: "model"
            },

            inputConfig: {
                model: {
                    "default": {
                        "role": "model",
                        "parts": [
                            {
                                "text": ""
                            }
                        ]
                    },
                    "contentKey": "parts[0].text",
                    "type": "json"

                }
            }
        },
        "embedding-001": {
            configuration: {
                "model": { field: "drop", default: "embedding-001", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "topK": { field: "slider", min: 1, max: 40, step: 1, default: 40, level: 2 },
                "topP": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "maxOutputTokens": { field: "slider", min: 1, max: 4096, step: 1, default: 2048, level: 0 },
                "stopSequences": { field: "text", default: "", level: 0 },
            },


            "apikey": "",
            outputConfig: {
                usage: [],
                message: "candidates[0].content.parts[0].text",
                assistant: "candidates[0].content",
                role: "model"
            },

            inputConfig: {
                model: {
                    "default": {
                        "role": "model",
                        "parts": [
                            {
                                "text": ""
                            }
                        ]
                    },
                    "contentKey": "parts[0].text",
                    "type": "json"

                }
            }
        },
        chatmessage: {
            chat: {
                role: "user",
                content: ""
            }, chatpath: "content"
        }
    },
    mistral:
    {
        "mistral-tiny": {
            configuration: {
                "model": { field: "dropdown", default: "mistral-tiny", level: 1 },
                "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.7, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "number", default: null, level: 2 },
                "stream": { field: "dropdown", value: ["true", "false", "null"], default: false, level: 2 },
                "safe_prompt": { field: "boolean", default: false, level: 2 },
                "random_seed": { field: "number", default: null, level: 2 },
            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                assistant: "choices",
                id: "id"
            },

            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },

        "mistral-small": {
            configuration: {
                "model": { field: "dropdown", default: "mistral-small", level: 1 },
                "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.7, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "number", default: "null", level: 2 },
                "stream": { field: "dropdown", value: ["true", "false", "null"], default: false, level: 2 },
                "safe_prompt": { field: "boolean", default: false, level: 2 },
                "random_seed": { field: "number", default: null, level: 2 },
            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                assistant: "choices",
                id: "id"
            },

            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        },

        "mistral-medium": {
            configuration: {
                "model": { field: "dropdown", default: "mistral-medium", level: 1 },
                "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.3, level: 2 },
                "prompt_truncation": { field: "dropdown", values: ['AUTO', 'OFF'], default: "AUTO", level: 2 },
                "citation_quality": { field: "dropdown", values: ['accurate', 'fast'], default: "accurate", level: 2 },
                "connectors": { field: "array", default: [{ "id": "web-search" }], level: 0 },
                "documents": { field: "array", default: [], level: 0 }
            },


            "apikey": "",
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                assistant: "choices",
                id: "id"
            },

            inputConfig: {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",

                }
            }
        }
    },
    cohere:
    {
        Generate: {
            "c4ai-aya": {
                configuration: {
                    "model": { field: "dropdown", default: "c4ai-aya", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.9, level: 2 },
                    "max_tokens": { field: "slider", min: 0, max: 4096, step: 1, default: 300, level: 2 },
                    "k": { field: "slider", min: 0, max: 500, step: 1, default: 0, level: 2 },
                    "stop_sequences": { field: "array", default: [], level: 0 },
                    "return_likelihoods": { field: "dropdown", values: ['GENERATION', 'NONE'], default: "NONE", level: 2 }
                },


                "apikey": "",
                outputConfig: {
                    usage: [{ input_tokens: "meta.billed_units.input_tokens", output_tokens: "meta.billed_units.output_tokens" }],
                    message: "generations[0].text",
                    assistant: "generations",
                    id: "id"
                },

                inputConfig: {
                    prompt: {
                        "prompt": "",
                        "contentKey": "prompt",
                        "type": "text",
                    }
                }
            },

            "command": {
                configuration: {
                    "model": { field: "dropdown", default: "command", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.9, level: 2 },
                    "max_tokens": { field: "slider", min: 0, max: 4096, step: 1, default: 300, level: 2 },
                    "k": { field: "slider", min: 0, max: 500, step: 1, default: 0, level: 2 },
                    "stop_sequences": { field: "array", default: [], level: 0 },
                    "return_likelihoods": { field: "dropdown", values: ['GENERATION', 'NONE'], default: "NONE", level: 2 }
                },


                "apikey": "",
                outputConfig: {
                    usage: [{ input_tokens: "meta.billed_units.input_tokens", output_tokens: "meta.billed_units.output_tokens" }],
                    message: "generations[0].text",
                    assistant: "generations",
                    id: "id"
                },

                inputConfig: {
                    prompt: {
                        "prompt": "",
                        "contentKey": "prompt",
                        "type": "text",
                    }
                }
            },
            "command-light": {
                configuration: {
                    "model": { field: "dropdown", default: "command-light", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.9, level: 2 },
                    "max_tokens": { field: "slider", min: 0, max: 4096, step: 1, default: 300, level: 2 },
                    "k": { field: "slider", min: 0, max: 500, step: 1, default: 0, level: 2 },
                    "stop_sequences": { field: "array", default: [], level: 0 },
                    "return_likelihoods": { field: "dropdown", values: ['GENERATION', 'NONE'], default: "NONE", level: 2 }
                },


                "apikey": "",
                outputConfig: {
                    usage: [{ input_tokens: "meta.billed_units.input_tokens", output_tokens: "meta.billed_units.output_tokens" }],
                    message: "generations[0].text",
                    assistant: "generations",
                    id: "id"
                },

                inputConfig: {
                    prompt: {
                        "prompt": "",
                        "contentKey": "prompt",
                        "type": "text",
                    }
                }
            },
            "command-light-nightly": {
                configuration: {
                    "model": { field: "dropdown", default: "command-light-nightly", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.9, level: 2 },
                    "max_tokens": { field: "slider", min: 0, max: 1365, step: 1, default: 100, level: 2 },
                    "k": { field: "slider", min: 0, max: 500, step: 1, default: 0, level: 2 },
                    "stop_sequences": { field: "array", default: [], level: 0 },
                    "return_likelihoods": { field: "checkbox", default: "NONE", level: 2 }
                },


                "apikey": "",
                outputConfig: {
                    usage: [{ prompt_tokens: "token_count.prompt_tokens", completion_tokens: "token_count.response_tokens", total_tokens: "token_count.total_tokens" }],
                    message: "generations[0].text",
                    assistant: "generations",
                    id: "id"
                },

                inputConfig: {
                    prompt: {
                        "prompt": "",
                        "contentKey": "prompt",
                        "type": "text",
                    }
                }
            },
            "command-nightly": {
                configuration: {
                    "model": { field: "dropdown", default: "command-nightly", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.9, level: 2 },
                    "max_tokens": { field: "slider", min: 0, max: 1365, step: 1, default: 100, level: 2 },
                    "k": { field: "slider", min: 0, max: 500, step: 1, default: 0, level: 2 },
                    "stop_sequences": { field: "array", default: [], level: 0 },
                    "return_likelihoods": { field: "checkbox", default: "NONE", level: 2 }
                },


                "apikey": "",
                outputConfig: {
                    usage: [{ prompt_tokens: "token_count.prompt_tokens", completion_tokens: "token_count.response_tokens", total_tokens: "token_count.total_tokens" }],
                    message: "generations[0].text",
                    assistant: "generations",
                    id: "id"
                },

                inputConfig: {
                    prompt: {
                        "prompt": "",
                        "contentKey": "prompt",
                        "type": "text",
                    }
                }
            }
        },
        "Chat BETA": {
            "command": {
                configuration: {
                    "model": { field: "dropdown", default: "command", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.3, level: 2 },
                    "prompt_truncation": { field: "dropdown", values: ['AUTO', 'OFF'], default: "AUTO", level: 2 },
                    "citation_quality": { field: "dropdown", values: ['accurate', 'fast'], default: "accurate", level: 2 },
                    "connectors": { field: "array", default: [{ "id": "web-search" }], level: 0 },
                    "documents": { field: "array", default: [], level: 0 }
                },


                "apikey": "",
                outputConfig: {
                    usage: [{ prompt_tokens: "token_count.prompt_tokens", completion_tokens: "token_count.response_tokens", total_tokens: "token_count.total_tokens", billed_tokens: "token_count.billed_tokens" }],
                    message: "text",
                    id: "response_id"
                },

                inputConfig: {
                    Chatbot: {
                        "default": {
                            "role": "Chatbot",
                            "message": ""
                        },
                        "contentKey": "message",
                        "type": "json",
                    }
                }
            },
            "command-light": {
                configuration: {
                    "model": { field: "dropdown", default: "command-light", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.3, level: 2 },
                    "prompt_truncation": { field: "dropdown", values: ['AUTO', 'OFF'], default: "AUTO", level: 2 },
                    "citation_quality": { field: "dropdown", values: ['accurate', 'fast'], default: "accurate", level: 2 },
                    "connectors": { field: "array", default: [{ "id": "web-search" }], level: 0 },
                    "documents": { field: "array", default: [], level: 0 }
                },


                "apikey": "",
                outputConfig: {
                    usage: [{ prompt_tokens: "token_count.prompt_tokens", completion_tokens: "token_count.response_tokens", total_tokens: "token_count.total_tokens", billed_tokens: "token_count.billed_tokens" }],
                    message: "text",
                    id: "response_id"
                },

                inputConfig: {
                    Chatbot: {
                        "default": {
                            "role": "Chatbot",
                            "message": ""
                        },
                        "contentKey": "message",
                        "type": "json",
                    }
                }
            },
            "command-light-nightly": {
                configuration: {
                    "model": { field: "dropdown", default: "command-light-nightly", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.3, level: 2 },
                    "prompt_truncation": { field: "dropdown", values: ['AUTO', 'OFF'], default: "AUTO", level: 2 },
                    "citation_quality": { field: "dropdown", values: ['accurate', 'fast'], default: "accurate", level: 2 },
                    "connectors": { field: "array", default: [{ "id": "web-search" }], level: 0 },
                    "documents": { field: "array", default: [], level: 0 }
                },


                "apikey": "",
                outputConfig: {
                    usage: [{ prompt_tokens: "token_count.prompt_tokens", completion_tokens: "token_count.response_tokens", total_tokens: "token_count.total_tokens", billed_tokens: "token_count.billed_tokens" }],
                    message: "text",
                    id: "response_id"
                },
                inputConfig: {
                    Chatbot: {
                        "default": {
                            "role": "Chatbot",
                            "message": ""
                        },
                        "contentKey": "message",
                        "type": "json",
                    }
                }
            },
            "command-nightly": {
                configuration: {
                    "model": { field: "dropdown", default: "command-nightly", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.3, level: 2 },
                    "prompt_truncation": { field: "dropdown", values: ['AUTO', 'OFF'], default: "AUTO", level: 2 },
                    "citation_quality": { field: "dropdown", values: ['accurate', 'fast'], default: "accurate", level: 2 },
                    "connectors": { field: "array", default: [{ "id": "web-search" }], level: 0 },
                    "documents": { field: "array", default: [], level: 0 }
                },


                "apikey": "",
                outputConfig: {
                    usage: [{ prompt_tokens: "token_count.prompt_tokens", completion_tokens: "token_count.response_tokens", total_tokens: "token_count.total_tokens", billed_tokens: "token_count.billed_tokens" }],
                    message: "text",
                    id: "response_id"
                },

                inputConfig: {
                    Chatbot: {
                        "default": {
                            "role": "Chatbot",
                            "message": ""
                        },
                        "contentKey": "message",
                        "type": "json",
                    }
                }
            }
        }
    }

}