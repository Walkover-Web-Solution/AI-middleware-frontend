import { dryRun } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { uploadImageAction } from '@/store/action/bridgeAction';
import _ from 'lodash';
import { ImageUp, ImageUpIcon } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

function ChatTextInput({ setMessages, setErrorMessage, params }) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [conversation, setConversation] = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);
    const dispatch = useDispatch();
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const versionId = params?.version;
    const { bridge, modelType, modelName, variablesKeyValue, prompt, configuration } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version],
        modelName: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.model?.toLowerCase(),
        modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.type?.toLowerCase(),
        prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.prompt,
        variablesKeyValue: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.variables || [],
        configuration: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration,
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
            if (pair.key && pair.value && pair.checked) {
                acc[pair.key] = pair.value;
            }
            return acc;
        }, {});
    }, [variablesKeyValue]);

    const handleSendMessage = async (e) => {
        if (prompt?.trim() === "" && (modelType !== 'completion' && modelType !== 'embedding')) {
            setErrorMessage("Prompt is required");
            return;
        }
        const newMessage = inputRef?.current?.value;
        if (modelType !== 'completion' && modelType !== 'embedding') {
            if (newMessage?.trim() === "") {
                setErrorMessage("Message cannot be empty");
                return;
            }
        }
        setErrorMessage("");
        if (modelType !== "completion" && modelType !== "embedding") inputRef.current.value = "";
        setLoading(true);
        try {
            const newChat = {
                id: conversation.length + 1,
                sender: "user",
                time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                content: newMessage,
            };
            let response, responseData;
            let data;
            if (modelType !== 'completion' && modelType !== 'embedding') {
                data = {
                    role: "user",
                    content: newMessage
                };
                setMessages(prevMessages => [...prevMessages, newChat]);
                responseData = await dryRun({
                    localDataToSend: {
                        version_id: versionId,
                        configuration: {
                            conversation: conversation,
                            type: modelType
                        },
                        user: data.content,
                        images: uploadedImages,
                        variables
                    },
                    bridge_id: params?.id,
                });
            } else if (modelType === "completion") {
                responseData = await dryRun({
                    localDataToSend: {
                        ...localDataToSend,
                        version_id: versionId,
                        configuration: {
                            ...localDataToSend.configuration
                        },
                        prompt: bridge?.inputConfig?.prompt?.prompt
                    },
                    bridge_id: params?.id
                });
            } else if (modelType === "embedding") {
                responseData = await dryRun({
                    localDataToSend: {
                        ...localDataToSend,
                        version_id: versionId,
                        configuration: {
                            ...localDataToSend.configuration
                        },
                        input: bridge?.inputConfig?.input?.input
                    },
                    bridge_id: params?.id
                });
            }
            if (!responseData || !responseData.success) {
                if (modelType !== 'completion' && modelType !== 'embedding') {
                    inputRef.current.value = data.content;
                    setMessages(prevMessages => prevMessages.slice(0, -1));
                }
                toast.error(responseData?.error || "An error occurred");
                setLoading(false);
                return;
            }
            response = responseData.response?.data;
            const content = response?.content || "";
            const assistConversation = {
                role: response?.role || "assistant",
                content: content,
                image_urls: response?.image_urls || []
            };

            if (modelType !== 'completion' && modelType !== 'embedding') {
                setConversation(prevConversation => [...prevConversation, _.cloneDeep(data), assistConversation].slice(-6));
            }
            const newChatAssist = {
                id: conversation.length + 2,
                sender: "Assist",
                time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                content: Array.isArray(content) ? content.join(", ") : content.toString(),
                image_urls: assistConversation.image_urls
            };
            
            setMessages(prevMessages => [...prevMessages, newChatAssist]);
        } catch (error) {
            console.log(error);
            setErrorMessage("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
            setUploadedImages([]);
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
    const handleFileChange = async (e) => {
        const files = fileInputRef.current.files;
        if (files.length > 4 || uploadedImages.length > 4) {
            toast.error('Only four images are allowed.');
            return;
        }
        if (files.length > 0) {
            setUploading(true);
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append('image', files[i]);
                const result = await dispatch(uploadImageAction(formData));
                if (result.success) {
                    setUploadedImages(prevImages => [...prevImages, result.image_url]);
                }
            }
            setUploading(false);
        }
    };

    return (
        <div className="input-group flex gap-2 w-full relative">
            {uploadedImages.length > 0 && (
                <div className="absolute bottom-16 left-0 flex bg-base-300 w-auto p-2 rounded-lg">
                    {uploadedImages.map((url, index) => (
                        <img key={index} src={url} alt={`Uploaded Preview ${index + 1}`} className="w-16 h-16 object-cover mb-2 m-3" />
                    ))}
                </div>
            )}
            {(modelType !== "completion") && (modelType !== "embedding") && (modelType !== 'image') && (
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type here"
                    className="input input-bordered w-full focus:border-primary"
                    onKeyPress={handleKeyPress}
                />
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
            />
            {configuration && configuration?.vision && configuration['vision'] &&<button
                className="btn"
                onClick={() => fileInputRef.current.click()}
                disabled={loading || uploading}
            >
                <ImageUpIcon />
            </button>}
            <button
                className="btn"
                onClick={handleSendMessage}
                disabled={loading || uploading || (modelType === 'image')}
            >
                {(loading || uploading) ? (
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