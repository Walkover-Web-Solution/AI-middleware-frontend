export const services = {
    openai:
    {
        // models: new Set(["gpt-3.5-turbo","gpt-3.5-turbo-0613","gpt-3.5-turbo-0125","gpt-3.5-turbo-1106","gpt-4","gpt-4-0613","gpt-4-1106-preview","gpt-4-turbo-preview","gpt-4-0125-preview","text-embedding-3-large","text-embedding-3-small","text-embedding-ada-002","gpt-3.5-turbo-instruct"]),
        completion: new Set(["gpt-3.5-turbo-instruct"]),
        chat: new Set(["gpt-3.5-turbo", "gpt-3.5-turbo-0613", "gpt-3.5-turbo-0125", "gpt-3.5-turbo-1106", "gpt-3.5-turbo-16k-0613", "gpt-3.5-turbo-16k", "gpt-4", "gpt-4o" ,  "gpt-4-0613", "gpt-4-1106-preview", "gpt-4-turbo-preview", "gpt-4-0125-preview", "gpt-4-turbo", "gpt-4-turbo-2024-04-09"]),
        embedding: new Set(["text-embedding-3-large", "text-embedding-3-small", "text-embedding-ada-002"])
    }
    // },
    // google:
    // {
    //     // models:new Set(["gemini-pro"]),
    //     // chat:new Set(["gemini-pro"]),
    //     completion:new Set(["gemini-pro"]),
    // embedding:new Set(["embedding-001"])//-m ""
    // }
}

export const messageRoles = { chat: ["system", "user"], completion: ["prompt"], embedding: ["input"] }
