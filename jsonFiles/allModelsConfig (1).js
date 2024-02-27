export const modelInfo = {
    openai: {
        "gpt-3.5-turbo": {
            configuration: {
                "model": { field: "drop", default: "gpt-3.5-turbo", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: null, level: 0 },
                "stream": { field: "boolean", default: false, level: 0 }
            },

            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                asiistant:"choices[0].message",
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
                },

                user: {
                    "default": {
                        "role": "user",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                },

                rawData: {
                    "default": `
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I assist you today?"
                    }`
                }
            }
        },
        "gpt_3_5_turbo_0613": {
            configuration: {
                "model": { field: "drop", default: "gpt-3.5-turbo-0613", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0},
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: null, level: 0 },
                "stream": { field: "boolean", default: false, level: 0}
            },
            outputConfig: {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
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

                },

                user: {
                    "default": {
                        "role": "user",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                },

                rawData: {
                    "default": `
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I assist you today?"
                    }`
                }
            }
        },
        "gpt-3.5-turbo-0125": {
            configuration : {
                "model": { field: "drop", default: "gpt-3.5-turbo-0125", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0 },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: null, level: 0 },
                "stream": { field: "boolean", default: false, level: 0 },
                "tools": { field: "array", level: 0, default: []},
                "tool_choice": { field: "text", default: "auto", level: 0 },
                "response_format": { field: "json_object", default: { "type": "json_object" }, level: 0 }
            },
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
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

                },

                user: {
                    "default": {
                        "role": "user",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                },

                rawData: {
                    "default": `
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I assist you today?"
                    }`
                }
            }
        },
        "gpt-3.5-turbo-0301": {
            configuration : {
                "model": { field: "drop", default: "gpt-3.5-turbo-0301", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0 },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1, level: 0 },
                "stop": { field: "text", default: null, level: 0 },
                "stream": { field: "boolean", default: false, level: 0},
                "tools": { field: "array", level: 0, default: [],  },
                "tool_choice": { field: "text", default: "auto", level: 0,  },
                "response_format": { field: "json_object", default: { "type": "json_object" }, level: 0 }
            },
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                id: "id"
            },
            inputConfig : {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
    
                },
    
                user: {
                    "default": {
                        "role": "user",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                },
    
                rawData: {
                    "default": `
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I assist you today?"
                    }`
                }
            }
        },
        "gpt-3.5-turbo-1106": {
            configuration : {
                "model": { field: "drop", default: "gpt-3.5-turbo-1106", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1,  level: 0 },
                "stop": { field: "text", default: null, level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [],  },
                "tool_choice": { field: "string", default: "auto", level: 0,  },
                "response_format": { field: "json_object", default: { "type": "json_object" }, level: 0 }
            },
    
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                id: "id"
            },

            inputConfig : {
            system: {
                "default": {
                    "role": "system",
                    "content": ""
                },
                "contentKey": "content",
                "type": "json",

            },

            user: {
                "default": {
                    "role": "user",
                    "content": ""
                },
                "contentKey": "content",
                "type": "json",
            },

            rawData: {
                "default": `
                {
                    "role": "system",
                    "content": "You are a helpful assistant."
                },
                {
                    "role": "user",
                    "content": "Hello"
                },
                {
                    "role": "assistant",
                    "content": "Hello! How can I assist you today?"
                }`
            }
            }
        },
        "gpt-3.5-turbo-16k": {
            configuration : {
                "model": { field: "drop", default: "gpt-3.5-turbo-16k", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1,  level: 0 },
                "stop": { field: "text", default: null, level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [],  },
                "tool_choice": { field: "text", default: "auto", level: 0,  },
                "response_format": { field: "json_object", default: { "type": "json_object" }, level: 0 }
            },
    
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                id: "id"
            },
    
            inputConfig : {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
    
                },
    
                user: {
                    "default": {
                        "role": "user",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                },
    
                rawData: {
                    "default": `
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I assist you today?"
                    }`
                }
            }
        },
        "gpt-3.5-turbo-16k-0613": {
            configuration : {
                "model": { field: "drop", default: "gpt-3.5-turbo-16k-0613", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1,  level: 0 },
                "stop": { field: "text", default: null, level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [],  },
                "tool_choice": { field: "text", default: "auto", level: 0,  },
                "response_format": { field: "json_object", default: { "type": "json_object" }, level: 0 }
            },
    
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                id: "id"
            },
    
            inputConfig : {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
    
                },
    
                user: {
                    "default": {
                        "role": "user",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                },
    
                rawData: {
                    "default": `
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I assist you today?"
                    }`
                }
            }
        },
        "gpt-4": {
            configuration : {
                "model": { field: "drop", default: "gpt-4", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1,  level: 0 },
                "stop": { field: "text", default: null, level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [],  },
                "tool_choice": { field: "text", default: "auto", level: 0,  },
            },
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                id: "id"
            },
    
            inputConfig : {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
    
                },
    
                user: {
                    "default": {
                        "role": "user",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                },
    
                rawData: {
                    "default": `
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I assist you today?"
                    }`
                }
            }
        },
        "gpt-4-0613": {
            configuration : {
                "model": { field: "drop", default: "gpt-4-0613", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1,  level: 0 },
                "stop": { field: "text", default: null, level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [],  },
                "tool_choice": { field: "text", default: "auto", level: 0,  },
            },
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                id: "id"
            },
    
            inputConfig : {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
    
                },
    
                user: {
                    "default": {
                        "role": "user",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                },
    
                rawData: {
                    "default": `
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I assist you today?"
                    }`
                }
            }
        },
        "gpt-4-1106-preview": {
            configuration : {
                "model": { field: "drop", default: "gpt-4-1106-preview", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1,  level: 0 },
                "stop": { field: "text", default: null, level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [],  },
                "tool_choice": { field: "text", default: "auto", level: 0,  },
                "response_format": { field: "json_object", default: { "type": "json_object" }, level: 0 }
            },

            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                id: "id"
            },
    
    
             inputConfig : {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
    
                },
    
                user: {
                    "default": {
                        "role": "user",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                },
    
                rawData: {
                    "default": `
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I assist you today?"
                    }`
                }
             }
        },
        "gpt-4-turbo-preview": {
            configuration : {
                "model": { field: "drop", default: "gpt-4-turbo-preview", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1,  level: 0 },
                "stop": { field: "text", default: null, level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [],  },
                "tool_choice": { field: "text", default: "auto", level: 0,  },
                "response_format": { field: "json_object", default: { "type": "json_object" }, level: 0 }
            },
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                id: "id"
            },
    

            inputConfig : {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
    
                },
    
                user: {
                    "default": {
                        "role": "user",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                },
    
                rawData: {
                    "default": `
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I assist you today?"
                    }`
                }
            }
        },
        "gpt-4-0125-preview": {
            configuration : {
                "model": { field: "drop", default: "gpt-4-0125-preview", "level": 1 },
                "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "logprobs": { field: "boolean", default: false, level: 0, },
                "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
                "n": { field: "number", default: 1,  level: 0 },
                "stop": { field: "text", default: null, level: 0 },
                "stream": { field: "boolean", default: false, level: 0, },
                "tools": { field: "array", level: 0, default: [],  },
                "tool_choice": { field: "text", default: "auto", level: 0,  },
                "response_format": { field: "json_object", default: { "text": "json_object" }, level: 0 }
            },
    
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                tools: "choices[0].message.tool_calls",
                id: "id"
            },
    
            inputConfig : {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
    
                },
    
                user:{
                    "default": {
                        "role": "user",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                },
    
                rawData: {
                    "default": `
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I assist you today?"
                    }`
                }
            }
        },
        "text-embedding-3-large": {
            configuration : {
                "model": ["text-embedding-3-large", 1],
                "encoding_format": ["float", 2],
                "dimensions": [null, 0],
            },
    
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", total_tokens: "usage.total_tokens" }],
                message: "data[0].embedding"
            },
    
            inputConfig : {
                input: {
                    "input": "",
                    "contentKey": "input",
                    "type": "text",
                }
            }
        },
        "text-embedding-3-small": {
            configuration : {
                "model": ["text-embedding-3-small", 1],
                "encoding_format": ["float", 2],
                "dimensions": [null, 0],
            },
    
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", total_tokens: "usage.total_tokens" }],
                message: "data[0].embedding"
            },
    
            inputConfig : {
                input: {
                    "input": "",
                    "contentKey": "input",
                    "type": "text",
                }
            }
        },
        "text-embedding-ada-002": {
            configuration : {
                "model": ["text-embedding-ada-002", 1],
                "encoding_format": ["float", 2]
                // dimensions is fixed here, 1536 will be the size of the vector
            },
    
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", total_tokens: "usage.total_tokens" }],
                message: "data[0].embedding"
            },
            
            inputConfig : {
                input: {
                    "input": "",
                    "contentKey": "input",
                    "type": "text",
                }
            }
        },
        "gpt-3.5-turbo-instruct": {
            configuration : {
                "model": ["gpt-3.5-turbo-instruct", 1],
                "best_of": [1, 2],
                "echo": [false, 2],
                "frequency_penalty":[0, 2],
                "logit_bias": [null, 0],
                "logprobs": [null, 0],
                "max_tokens": [16, 2],
                "n": [1, 2],
                "presence_penalty": [0, 2],
                "seed": [null, 0],
                "stop": [null, 2],
                "stream": [null, 2],
                "suffix": [null, 2],
                "temperature": [1, 2],
                "top_p": [1, 2],
            },
    
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].text",
                id: "id"
            },
    
            inputConfig : {
                prompt: {
                    "prompt": "",
                    "contentKey": "prompt",
                    "type": "text",
                }
            }
        }
    },
    google:
    {
        "gemini-1.0-pro": {
            configuration : {
                "model": { field: "drop", default: "gemini-1.0-pro", "level": 1 },
                "temperature": [0, 9, 2],
                "topK": ["none", 0],
                "topP": [1.0, 2],
                "maxOutputTokens": [8192, 2],
                "stopSequences": ["none", 0]
            },
    
            outputConfig : {
                usage: [],
                message: "candidates[0].content.parts[0].text",
                role: "model"
            },
    
            inputConfig : {
                user: {
                    "default": {
                        "role": "user",
                        "parts": [
                            {
                                "text": ""
                            }
                        ]
                    },
                    "contentKey": "parts[0].text",
                    "type": "json"
                },
    
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
    
                },
    
                rawData: {
                    "default": `
                    {
                        "role": "user",
                        "parts": [
                          {
                            "text": "Hello"
                          }
                        ]
                      },
                      {
                        "role": "model",
                        "parts": [
                          {
                            "text": "Greetings! How may I assist you today?"
                          }
                        ]
                    }`
                }
            }
        }
    },
    mistral:
    {
        "mistral-tiny": {
            configuration : {
                "model": { field: "dropdown", default: "mistral-tiny", level: 1 },
                "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.7, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "number",  default: null, level: 2 },
                "stream": { field: "dropdown", value: ["true", "false", "null"], default: false, level: 2 },
                "safe_prompt": { field: "boolean",  default: false, level: 2 },
                "random_seed": { field: "number",  default: null, level: 2 },
            },
    
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                id: "id"
            },
    
            inputConfig : {
                system : {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
    
                },
    
                user: {
                    "default": {
                        "role": "user",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                },
    
                rawData: {
                    "default": `
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I assist you today?"
                    }`
                }
            }
        },

        "mistral-small": {
            configuration : {
                "model": { field: "dropdown", default: "mistral-small", level: 1 },
                "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.7, level: 2 },
                "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
                "max_tokens": { field: "number",  default: "null", level: 2 },
                "stream": { field: "dropdown", value: ["true", "false", "null"], default: false, level: 2 },
                "safe_prompt": { field: "boolean",  default: false, level: 2 },
                "random_seed": { field: "number",  default: null, level: 2 },
            },
    
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                id: "id"
            },
    
            inputConfig : {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
    
                },
    
                user: {
                    "default": {
                        "role": "user",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                },
    
                rawData: {
                    "default": `
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I assist you today?"
                    }`
                }
            }
        },

        "mistral-medium": {
            configuration : {
                "model": { field: "dropdown", default: "mistral-medium", level: 1 },
                "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.3, level: 2 },
                "prompt_truncation": { field: "dropdown", values: ['AUTO', 'OFF'], default: "AUTO", level: 2 },
                "citation_quality": { field: "dropdown", values: ['accurate', 'fast'], default: "accurate", level: 2 },
                "connectors": { field: "array", default: [{ "id": "web-search" }], level: 0 },
                "documents": { field: "array", default: [], level: 0 }
            },
    
            outputConfig : {
                usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
                message: "choices[0].message.content",
                id: "id"
            },
    
            inputConfig : {
                system: {
                    "default": {
                        "role": "system",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
    
                },
    
                user: {
                    "default": {
                        "role": "user",
                        "content": ""
                    },
                    "contentKey": "content",
                    "type": "json",
                },
    
                rawData: {
                    "default": `
                    {
                        "role": "system",
                        "content": "You are a helpful assistant."
                    },
                    {
                        "role": "user",
                        "content": "Hello"
                    },
                    {
                        "role": "assistant",
                        "content": "Hello! How can I assist you today?"
                    }`
                }
            }
        }
    },
    cohere:
    {
        Generate: {
            "c4ai-aya": {
                configuration : {
                    "model": { field: "dropdown", default: "c4ai-aya", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.9, level: 2 },
                    "max_tokens": { field: "slider", min: 0, max: 4096, step: 1, default: 300, level: 2 },
                    "k": { field: "slider", min: 0, max: 500, step: 1, default: 0, level: 2 },
                    "stop_sequences": { field: "array", default: [], level: 0 },
                    "return_likelihoods": { field: "dropdown", values: ['GENERATION', 'NONE'], default: "NONE", level: 2 }
                },
        
                outputConfig : {
                    usage: [{ input_tokens: "meta.billed_units.input_tokens", output_tokens: "meta.billed_units.output_tokens" }],
                    message: "generations[0].text",
                    id: "id"
                },
        
                inputConfig : {
                    prompt: {
                        "prompt": "",
                        "contentKey": "prompt",
                        "type": "text",
                    }
                }
            },

            "command": {
                configuration : {
                    "model": { field: "dropdown", default: "command", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.9, level: 2 },
                    "max_tokens": { field: "slider", min: 0, max: 4096, step: 1, default: 300, level: 2 },
                    "k": { field: "slider", min: 0, max: 500, step: 1, default: 0, level: 2 },
                    "stop_sequences": { field: "array", default: [], level: 0 },
                    "return_likelihoods": { field: "dropdown", values: ['GENERATION', 'NONE'], default: "NONE", level: 2 }
                },
        
                outputConfig : {
                    usage: [{ input_tokens: "meta.billed_units.input_tokens", output_tokens: "meta.billed_units.output_tokens" }],
                    message: "generations[0].text",
                    id: "id"
                },

                inputConfig : {
                    prompt: {
                        "prompt": "",
                        "contentKey": "prompt",
                        "type": "text",
                    }
                }
            },
            "command-light": {
                configuration : {
                    "model": { field: "dropdown", default: "command-light", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.9, level: 2 },
                    "max_tokens": { field: "slider", min: 0, max: 4096, step: 1, default: 300, level: 2 },
                    "k": { field: "slider", min: 0, max: 500, step: 1, default: 0, level: 2 },
                    "stop_sequences": { field: "array", default: [], level: 0 },
                    "return_likelihoods": { field: "dropdown", values: ['GENERATION', 'NONE'], default: "NONE", level: 2 }
                },
        
                outputConfig : {
                    usage: [{ input_tokens: "meta.billed_units.input_tokens", output_tokens: "meta.billed_units.output_tokens" }],
                    message: "generations[0].text",
                    id: "id"
                },
                
                inputConfig : {
                    prompt: {
                        "prompt": "",
                        "contentKey": "prompt",
                        "type": "text",
                    }
                }
            },
            "command-light-nightly": {
                configuration : {
                    "model": { field: "dropdown", default: "command-light-nightly", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.9, level: 2 },
                    "max_tokens": { field: "slider", min: 0, max: 1365, step: 1, default: 100, level: 2 },
                    "k": { field: "slider", min: 0, max: 500, step: 1, default: 0, level: 2 },
                    "stop_sequences": { field: "array", default: [], level: 0 },
                    "return_likelihoods": { field: "checkbox", default: "NONE", level: 2 }
                },
        
                outputConfig : {
                    usage: [{ prompt_tokens: "token_count.prompt_tokens", completion_tokens: "token_count.response_tokens", total_tokens: "token_count.total_tokens" }],
                    message: "generations[0].text",
                    id: "id"
                },
                
                inputConfig : {
                    prompt: {
                        "prompt": "",
                        "contentKey": "prompt",
                        "type": "text",
                    }
                }
            },
            "command-nightly": {
                configuration : {
                    "model": { field: "dropdown", default: "command-nightly", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.9, level: 2 },
                    "max_tokens": { field: "slider", min: 0, max: 1365, step: 1, default: 100, level: 2 },
                    "k": { field: "slider", min: 0, max: 500, step: 1, default: 0, level: 2 },
                    "stop_sequences": { field: "array", default: [], level: 0 },
                    "return_likelihoods": { field: "checkbox", default: "NONE", level: 2 }
                },
        
                outputConfig : {
                    usage: [{ prompt_tokens: "token_count.prompt_tokens", completion_tokens: "token_count.response_tokens", total_tokens: "token_count.total_tokens" }],
                    message: "generations[0].text",
                    id: "id"
                },
                
                inputConfig : {
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
                configuration : {
                    "model": { field: "dropdown", default: "command", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.3, level: 2 },
                    "prompt_truncation": { field: "dropdown", values: ['AUTO', 'OFF'], default: "AUTO", level: 2 },
                    "citation_quality": { field: "dropdown", values: ['accurate', 'fast'], default: "accurate", level: 2 },
                    "connectors": { field: "array", default: [{ "id": "web-search" }], level: 0 },
                    "documents": { field: "array", default: [], level: 0 }
                },
        
                outputConfig : {
                    usage: [{ prompt_tokens: "token_count.prompt_tokens", completion_tokens: "token_count.response_tokens", total_tokens: "token_count.total_tokens", billed_tokens: "token_count.billed_tokens" }],
                    message: "text",
                    id: "response_id"
                },
        
                inputConfig : {
                    User: {
                        "default": {
                            "role": "User",
                            "message": ""
                        },
                        "contentKey": "message",
                        "type": "json",
        
                    },
        
                    Chatbot: {
                        "default": {
                            "role": "Chatbot", 
                            "message": ""
                        },
                        "contentKey": "message",
                        "type": "json",
                    },
        
                    rawData: {
                        "default": `
                        {   
                            "role": "User",
                            "message": "Hello"
                        }, 
                        {
                            "role": "Chatbot", 
                            "message": "Hello! I\'m happy to help you with any questions you may have!"
                        }`
                    }
                }
            },
            "command-light": {
                configuration : {
                    "model": { field: "dropdown", default: "command-light", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.3, level: 2 },
                    "prompt_truncation": { field: "dropdown", values: ['AUTO', 'OFF'], default: "AUTO", level: 2 },
                    "citation_quality": { field: "dropdown", values: ['accurate', 'fast'], default: "accurate", level: 2 },
                    "connectors": { field: "array", default: [{ "id": "web-search" }], level: 0 },
                    "documents": { field: "array", default: [], level: 0 }
                },
        
                outputConfig : {
                    usage: [{ prompt_tokens: "token_count.prompt_tokens", completion_tokens: "token_count.response_tokens", total_tokens: "token_count.total_tokens", billed_tokens: "token_count.billed_tokens" }],
                    message: "text",
                    id: "response_id"
                },

                inputConfig : {
                    User: {
                        "default": {
                            "role": "User",
                            "message": ""
                        },
                        "contentKey": "message",
                        "type": "json",
        
                    },
        
                    Chatbot: {
                        "default": {
                            "role": "Chatbot", 
                            "message": ""
                        },
                        "contentKey": "message",
                        "type": "json",
                    },
        
                    rawData: {
                        "default": `
                        {   
                            "role": "User",
                            "message": "Hello"
                        }, 
                        {
                            "role": "Chatbot", 
                            "message": "Hello! I\'m happy to help you with any questions you may have!"
                        }`
                    }
                }
            },
            "command-light-nightly": {
                configuration : {
                    "model": { field: "dropdown", default: "command-light-nightly", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.3, level: 2 },
                    "prompt_truncation": { field: "dropdown", values: ['AUTO', 'OFF'], default: "AUTO", level: 2 },
                    "citation_quality": { field: "dropdown", values: ['accurate', 'fast'], default: "accurate", level: 2 },
                    "connectors": { field: "array", default: [{ "id": "web-search" }], level: 0 },
                    "documents": { field: "array", default: [], level: 0 }
                },
        
                outputConfig : {
                    usage: [{ prompt_tokens: "token_count.prompt_tokens", completion_tokens: "token_count.response_tokens", total_tokens: "token_count.total_tokens", billed_tokens: "token_count.billed_tokens" }],
                    message: "text",
                    id: "response_id"
                },
                inputConfig : {
                    User: {
                        "default": {
                            "role": "User",
                            "message": ""
                        },
                        "contentKey": "message",
                        "type": "json",
        
                    },
        
                    Chatbot: {
                        "default": {
                            "role": "Chatbot", 
                            "message": ""
                        },
                        "contentKey": "message",
                        "type": "json",
                    },
        
                    rawData: {
                        "default": `
                        {   
                            "role": "User",
                            "message": "Hello"
                        }, 
                        {
                            "role": "Chatbot", 
                            "message": "Hello! I\'m happy to help you with any questions you may have!"
                        }`
                    }
                }
            },
            "command-nightly": {
                configuration : {
                    "model": { field: "dropdown", default: "command-nightly", level: 1 },
                    "temperature": { field: "slider", min: 0, max: 1, step: 0.1, default: 0.3, level: 2 },
                    "prompt_truncation": { field: "dropdown", values: ['AUTO', 'OFF'], default: "AUTO", level: 2 },
                    "citation_quality": { field: "dropdown", values: ['accurate', 'fast'], default: "accurate", level: 2 },
                    "connectors": { field: "array", default: [{ "id": "web-search" }], level: 0 },
                    "documents": { field: "array", default: [], level: 0 }
                },
        
                outputConfig : {
                    usage: [{ prompt_tokens: "token_count.prompt_tokens", completion_tokens: "token_count.response_tokens", total_tokens: "token_count.total_tokens", billed_tokens: "token_count.billed_tokens" }],
                    message: "text",
                    id: "response_id"
                },

                inputConfig : {
                    User: {
                        "default": {
                            "role": "User",
                            "message": ""
                        },
                        "contentKey": "message",
                        "type": "json",
        
                    },
        
                    Chatbot: {
                        "default": {
                            "role": "Chatbot", 
                            "message": ""
                        },
                        "contentKey": "message",
                        "type": "json",
                    },
        
                    rawData: {
                        "default": `
                        {   
                            "role": "User",
                            "message": "Hello"
                        }, 
                        {
                            "role": "Chatbot", 
                            "message": "Hello! I\'m happy to help you with any questions you may have!"
                        }`
                    }
                }
            }
        }
    }

}