import { dryRun } from '@/config';
import { useCustomSelector } from '@/customSelector/customSelector';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function ChatTextInput({ setMessages, setErrorMessage, params }) {
    const [loading, setLoading] = useState(false);
    const [conversation, setConversation] = useState([]);
    const inputRef = useRef(null);

    const { bridge, modelType, modelName, variablesKeyValue, prompt } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
        modelName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.model?.toLowerCase(),
        modelType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.type?.toLowerCase(),
        prompt: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.prompt,
        variablesKeyValue: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.variables || [],
    }));

    const dataToSend = {
        configuration: {
            model: modelName,
            type: modelType
        },
        service: bridge?.service?.toLowerCase(),
        apikey_object_id: bridge?.apikey,
        bridgeType: bridge?.bridgeType,
        slugName: bridge?.slugName,
        response_format: {
            type: 'default'
        }
    };
    const [localDataToSend, setLocalDataToSend] = useState(dataToSend);

    useEffect(() => {
        setLocalDataToSend(dataToSend);
    }, [bridge]);

    const variables = useMemo(() => {
        return variablesKeyValue.reduce((acc, pair) => {
            if (pair.key && pair.value) {
                acc[pair.key] = pair.value;
            }
            return acc;
        }, {});
    }, [variablesKeyValue]);

    const handleSendMessage = async (e) => {
        if (prompt?.trim() === "" && (modelType === "chat" || modelType == 'fine-tune')) {
            setErrorMessage("Prompt is required");
            return;
        }
        const newMessage = inputRef?.current?.value;
        if (modelType === "chat" || modelType == 'fine-tune') if (newMessage?.trim() === "") return;
        setErrorMessage("");
        if (modelType !== "completion" && modelType !== "embedding") inputRef.current.value = "";
        // setNewMessage("");
        setLoading(true);
        try {
            // Create user chat
            const newChat = {
                id: messages.length + 1,
                sender: "user",
                time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                content: newMessage,
            };
            let response, responseData;
            let data;
            if (modelType === "chat" || modelType === 'fine-tune') {
                data = {
                    role: "user",
                    content: ""
                }
                // data = modelInfo[localDataToSend.service].chatmessage.chat;
                // const chatPath = modelInfo[localDataToSend.service].chatmessage.chatpath;
                _.set(data, "content", newMessage);
                setMessages(prevMessages => [...prevMessages, newChat]);
                responseData = await dryRun({
                    localDataToSend: {
                        configuration: {
                            conversation: conversation,
                            type: modelType
                        },
                        user: newMessage,
                        variables // Include variables in the request data
                    },
                    bridge_id: params?.id
                });
            }
            else if (modelType === "completion") {
                responseData = await dryRun({
                    localDataToSend: {
                        ...localDataToSend,
                        configuration: {
                            ...localDataToSend.configuration
                        },
                        prompt: bridge?.inputConfig?.prompt?.prompt
                    },
                    bridge_id: params?.id
                });
            }
            else if (modelType === "embedding") {
                responseData = await dryRun({
                    localDataToSend: {
                        ...localDataToSend,
                        configuration: {
                            ...localDataToSend.configuration
                        },
                        input: bridge?.inputConfig?.input?.input
                    },
                    bridge_id: params?.id
                });
            }
            if (!responseData.success) {
                if (modelType === "chat" || modelType == 'fine-tune') {
                    inputRef.current.value = data.content;
                    setMessages(prevMessages => prevMessages.slice(0, -1)); // Remove the last message
                    // setConversation(prevConversation => [...prevConversation, _.cloneDeep(data)].slice(-6));
                }
                toast.error(responseData.error);
                setLoading(false);
                return;
            }
            response = responseData.response?.data;
            // const outputPath = outputConfig.message;
            // const assistPath = outputConfig.assistant;
            // const content = _.get(response.response, outputPath, "");
            const content = response?.content || "";
            // let assistConversation = _.get(response.response, assistPath, ""); // in anthropic assistant
            // if(typeof assistConversation  != 'object'){
            const assistConversation = {
                role: response?.role || "assistant",
                content: content
            }
            // }
            // Update localDataToSend with assistant conversation
            if (modelType === "chat" || modelType == 'fine-tune') {
                setConversation(prevConversation => [...prevConversation, _.cloneDeep(data), assistConversation].slice(-6));
            }
            const newChatAssist = {
                id: messages.length + 2,
                sender: "Assist",
                time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                content: Array.isArray(content) ? content.join(", ") : content.toString(),
            };

            // Add assistant chat to messages
            setMessages(prevMessages => [...prevMessages, newChatAssist]);
        } catch (error) {
            setErrorMessage("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = useCallback(
        event => {
            if (event.key === "Enter") {
                handleSendMessage(event);
            }
        },
        [handleSendMessage]
    );

    return (
        <div className="input-group flex gap-2 w-full">
            {(modelType !== "completion") && (modelType !== "embedding") && (
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type here"
                    className="input input-bordered w-full focus:border-primary"
                    // value={newMessage}
                    // onChange={e => setNewMessage(e.target.value)}
                    // onBlur={e => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
            )}
            <button
                className="btn"
                onClick={handleSendMessage}
                disabled={loading}
            >
                {loading ? (
                    <span className="loading loading-dots loading-lg"></span>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-6 w-6 ml-2 transform rotate-90"
                    >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                    </svg>
                )}
            </button>
        </div>
    )
}

export default ChatTextInput