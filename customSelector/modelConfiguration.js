
class ModelsConfig {  //params:[vlaue,enum(0,1,2) 0->optional, 1->required, 2->optional with default value]
    static gpt_3_5_turbo = () => {
        const configuration = {
            "model": { field: "drop", default: "gpt-3.5-turbo", "level": 1 },
            "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
            "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
            "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
            "logprobs": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "n": { field: "text", default: 1, typeOf: "number", level: 0 },
            "stop": { field: "text", default: null, level: 0 },
            "stream": { field: "text", default: false, level: 0, typeOf: "boolean" }
        }
        const outputConfig = {
            usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
            message: "choices[0].message.content",
            tools: "choices[0].message.tool_calls",
            id: "id"
        }
        return { configuration, outputConfig }
    }
    static gpt_3_5_turbo_0613 = () => {
        const configuration = {
            "model": { field: "drop", default: "gpt-3.5-turbo-0613", "level": 1 },
            "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
            "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
            "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
            "logprobs": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "n": { field: "text", default: 1, typeOf: "number", level: 0 },
            "stop": { field: "text", default: null, level: 0 },
            "stream": { field: "text", default: false, level: 0, typeOf: "boolean" }
        }
        const outputConfig = {
            usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
            message: "choices[0].message.content",
            tools: "choices[0].message.tool_calls",
            id: "id"
        }
        return { configuration, outputConfig }
    }
    static gpt_3_5_turbo_0125 = () => {
        const configuration = {
            "model": { field: "drop", default: "gpt-3.5-turbo-0125", "level": 1 },
            "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
            "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
            "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
            "logprobs": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "n": { field: "text", default: 1, typeOf: "number", level: 0 },
            "stop": { field: "text", default: null, level: 0 },
            "stream": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "tools": { field: "text", level: 0, default: [], typeOf: "array" },
            "tool_choice": { field: "text", default: "auto", level: 0, typeOf: "string" },
            "response_format": { field: "json_object", default: { "type": "json_object" }, level: 0 }
        }
        const outputConfig = {
            usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
            message: "choices[0].message.content",
            tools: "choices[0].message.tool_calls",
            id: "id"
        }
        return { configuration, outputConfig }
    }
    static gpt_3_5_turbo_1106 = () => {
        const configuration = {
            "model": { field: "drop", default: "gpt-3.5-turbo-1106", "level": 1 },
            "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
            "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
            "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
            "logprobs": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "n": { field: "text", default: 1, typeOf: "number", level: 0 },
            "stop": { field: "text", default: null, level: 0 },
            "stream": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "tools": { field: "text", level: 0, default: [], typeOf: "array" },
            "tool_choice": { field: "text", default: "auto", level: 0, typeOf: "string" },
            "response_format": { field: "json_object", default: { "type": "json_object" }, level: 0 }
        }
        const outputConfig = {
            usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
            message: "choices[0].message.content",
            tools: "choices[0].message.tool_calls",
            id: "id"
        }
        return { configuration, outputConfig }
    }
    static gpt_4 = () => {
        const configuration = {
            "model": { field: "drop", default: "gpt-4", "level": 1 },
            "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
            "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
            "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
            "logprobs": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "n": { field: "text", default: 1, typeOf: "number", level: 0 },
            "stop": { field: "text", default: null, level: 0 },
            "stream": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "tools": { field: "text", level: 0, default: [], typeOf: "array" },
            "tool_choice": { field: "text", default: "auto", level: 0, typeOf: "string" },
        }
        const outputConfig = {
            usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
            message: "choices[0].message.content",
            tools: "choices[0].message.tool_calls",
            id: "id"
        }
        return { configuration, outputConfig }
    }
    static gpt_4_0613 = () => {
        const configuration = {
            "model": { field: "drop", default: "gpt-4-0613", "level": 1 },
            "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
            "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
            "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
            "logprobs": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "n": { field: "text", default: 1, typeOf: "number", level: 0 },
            "stop": { field: "text", default: null, level: 0 },
            "stream": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "tools": { field: "text", level: 0, default: [], typeOf: "array" },
            "tool_choice": { field: "text", default: "auto", level: 0, typeOf: "string" },
        }
        const outputConfig = {
            usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
            message: "choices[0].message.content",
            tools: "choices[0].message.tool_calls",
            id: "id"
        }
        return { configuration, outputConfig }
    }
    static gpt_4_1106_preview = () => {
        const configuration = {
            "model": { field: "drop", default: "gpt-4-1106-preview", "level": 1 },
            "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
            "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
            "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
            "logprobs": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "n": { field: "text", default: 1, typeOf: "number", level: 0 },
            "stop": { field: "text", default: null, level: 0 },
            "stream": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "tools": { field: "text", level: 0, default: [], typeOf: "array" },
            "tool_choice": { field: "text", default: "auto", level: 0, typeOf: "string" },
            "response_format": { field: "json_object", default: { "type": "json_object" }, level: 0 }
        }
        const outputConfig = {
            usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
            message: "choices[0].message.content",
            tools: "choices[0].message.tool_calls",
            id: "id"
        }
        return { configuration, outputConfig }
    }
    static gpt_4_turbo_preview = () => {
        const configuration = {
            "model": { field: "drop", default: "gpt-4-turbo-preview", "level": 1 },
            "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
            "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
            "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
            "logprobs": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "n": { field: "text", default: 1, typeOf: "number", level: 0 },
            "stop": { field: "text", default: null, level: 0 },
            "stream": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "tools": { field: "text", level: 0, default: [], typeOf: "array" },
            "tool_choice": { field: "text", default: "auto", level: 0, typeOf: "string" },
            "response_format": { field: "json_object", default: { "type": "json_object" }, level: 0 }
        }
        const outputConfig = {
            usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
            message: "choices[0].message.content",
            tools: "choices[0].message.tool_calls",
            id: "id"
        }
        return { configuration, outputConfig }
    }
    static gpt_4_0125_preview = () => {
        const configuration = {
            "model": { field: "drop", default: "gpt-4-0125-preview", "level": 1 },
            "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
            "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
            "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
            "logprobs": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "n": { field: "text", default: 1, typeOf: "number", level: 0 },
            "stop": { field: "text", default: null, level: 0 },
            "stream": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "tools": { field: "text", level: 0, default: [], typeOf: "array" },
            "tool_choice": { field: "text", default: "auto", level: 0, typeOf: "string" },
            "response_format": { field: "json_object", default: { "text": "json_object" }, level: 0 }
        }
        const outputConfig = {
            usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
            message: "choices[0].message.content",
            tools: "choices[0].message.tool_calls",
            id: "id"
        }
        return { configuration, outputConfig }
    }
    static text_embedding_3_large = () => {
        const configuration = {
            "model": { field: "drop", default: "text-embedding-3-large", "level": 1 },
            "encoding_format": { field: "text", typeOf: "string", level: 2 },
            "dimensions": { field: "text", typeOf: "number", level: 0 }
        }

        const outputConfig = {
            usage: [{ prompt_tokens: "usage.prompt_tokens", total_tokens: "usage.total_tokens" }],
            message: "data[0].embedding"
        }
        return { configuration, outputConfig }
    }
    static text_embedding_3_small = () => {
        const configuration = {
            "model": { field: "drop", default: "text-embedding-3-small", "level": 1 },
            "encoding_format": { field: "text", typeOf: "string", level: 2 },
            "dimensions": { field: "text", typeOf: "number", level: 0 }
        }

        const outputConfig = {
            usage: [{ prompt_tokens: "usage.prompt_tokens", total_tokens: "usage.total_tokens" }],
            message: "data[0].embedding"
        }
        return { configuration, outputConfig }
    }

    static text_embedding_ada_002 = () => {
        const configuration = {
            "model": { field: "drop", default: "text-embedding-ada-002", "level": 1 },
            "encoding_format": { field: "text", typeOf: "string", level: 2 }
            // dimensions is fixed here, 1536 will be the size of the vector
        }

        const outputConfig = {
            usage: [{ prompt_tokens: "usage.prompt_tokens", total_tokens: "usage.total_tokens" }],
            message: "data[0].embedding"
        }
        return { configuration, outputConfig }
    }
    static gpt_3_5_turbo_instruct = () => {
        const configuration = {
            "model": { field: "drop", default: "gpt-3.5-turbo-instruct", "level": 1 },
            "best_of": { field: "slider", min: 1, max: 20, default: 1, level: 2, step: 1 },
            "echo": { field: "text", default: false, typeOf: "boolean", level: 2 },
            "frequency_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "logit_bias": { field: "text", typeOf: "json_object", default: null, level: 0 },
            "logprobs": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "max_tokens": { field: "slider", min: 0, max: 1024, step: 1, default: 256, level: 2 },
            "n": { field: "text", default: 1, typeOf: "number", level: 0 },
            "presence_penalty": { field: "slider", min: 0, max: 2, step: 0.01, default: 0, level: 2 },
            "seed": { field: "text", typeOf: "number", default: null, level: 0 },
            "stop": { field: "text", default: null, level: 0 },
            "stream": { field: "text", default: false, level: 0, typeOf: "boolean" },
            "suffix": { field: "text", typeOf: "string", default: null, level: 2 },
            "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
            "top_p": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
        }

        const outputConfig = {
            usage: [{ prompt_tokens: "usage.prompt_tokens", completion_tokens: "usage.completion_tokens", total_tokens: "usage.total_tokens" }],
            message: "choices[0].text",
            id: "id"
        }
        return { configuration, outputConfig }
    }
    static gemini_pro = () => {
        const configuration = {
            "model": { field: "drop", default: "gemini-pro", "level": 1 },
            "temperature": { field: "slider", min: 0, max: 2, step: 0.1, default: 1, level: 2 },
            "topK": { field: "slider", min: 1, max: 40, step: 1, default: 40, level: 2 },
            "topP": { field: "slider", min: 0, max: 1, step: 0.1, default: 1, level: 2 },
            "maxOutputTokens": { field: "slider", min: 1, max: 30720, step: 1, default: 2048, level: 0 },
            "stopSequences": { field: "text", default: null, level: 0 },
        }

        const outputConfig = {
            usage: [],
            message: "candidates[0].content.parts[0].text",
            role: "model"
        }
        return { configuration, outputConfig }
    }
    static embedding_001 = () => {
        const configuration = {
            "model": { field: "drop", default: "embedding-001", "level": 1 }
        }
        const outputConfig = {
            usage: [],
            message: "values",
            role: "model"
        }
        return { configuration, outputConfig }
    }
} ``

module.exports = ModelsConfig