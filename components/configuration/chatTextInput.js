import { dryRun } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { uploadImageAction } from '@/store/action/bridgeAction';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { CloseCircleIcon, SendHorizontalIcon, UploadIcon } from '@/components/Icons';
import { PdfIcon } from '@/icons/pdfIcon';

function ChatTextInput({ setMessages, setErrorMessage, messages, params, uploadedImages, setUploadedImages, conversation, setConversation, uploadedFiles, setUploadedFiles, handleSendMessageForOrchestralModel, isOrchestralModel, inputRef, loading, setLoading, searchParams, setTestCaseId, testCaseId, selectedStrategy}) {
    const [uploading, setUploading] = useState(false);
    const dispatch = useDispatch();
    const [fileInput, setFileInput] = useState(null); // Use state for the file input element
    const versionId = searchParams?.version;
    const { bridge, modelType, modelName, variablesKeyValue, prompt, configuration, modelInfo, service } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId],
        modelName: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.configuration?.model?.toLowerCase(),
        modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.configuration?.type?.toLowerCase(),
        prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.configuration?.prompt,
        variablesKeyValue: state?.variableReducer?.VariableMapping?.[params?.id]?.[versionId]?.variables || [],
        configuration: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.configuration,
        modelInfo: state?.modelReducer?.serviceModels,
        service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.service?.toLowerCase(),
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
    
    const { isVision, isFileSupported } = useMemo(() => {
        const validationConfig = modelInfo?.[service]?.[configuration?.type]?.[configuration?.model]?.validationConfig || {};
        
        return {
          isVision: validationConfig.vision,
          isFileSupported: validationConfig.files,
        };
      }, [modelInfo, service, configuration?.type, configuration?.model]);

    useEffect(() => {
        setLocalDataToSend(dataToSend);
    }, [bridge]);

    const variables = useMemo(() => {
        return variablesKeyValue.reduce((acc, pair) => {
            if (pair?.key && pair?.value) {
                acc[pair.key] = pair.value;
            }
            return acc;
        }, {});
    }, [variablesKeyValue]);

    const handleSendMessage = async (e) => {
        const timestamp = Date.now();
        
        if (inputRef.current) {
            inputRef.current.style.height = '40px'; // Set initial height
        }
        if (prompt?.trim() === "" && (modelType !== 'completion' && modelType !== 'embedding')) {
            setErrorMessage("Prompt is required");
            return;
        }
        const newMessage = inputRef?.current?.value.replace(/\r?\n/g, '\n');

        if (uploadedFiles?.length > 0 && newMessage?.trim() === "") {
            setErrorMessage("A message is required when uploading a PDF.");
            return;
        }

        if (modelType !== 'completion' && modelType !== 'embedding') {
            if (newMessage?.trim() === "" && uploadedImages?.length === 0 && uploadedFiles?.length === 0) {
                setErrorMessage("Message cannot be empty");
                return;
            }
        }
        let testcase_data = {
            matching_type: selectedStrategy,
        }
        testCaseId ? testcase_data.testcase_id = testCaseId : testcase_data = null
        setErrorMessage("");
        if (modelType !== "completion") inputRef.current.value = "";
        setLoading(true);
        try {
            const newChat = {
                id: `user_${timestamp}`,
                sender: "user",
                time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                content: newMessage.replace(/\n/g, "  \n"), // Markdown line break
                images: uploadedImages, // Store images in the user role
                files: uploadedFiles,
            };           
            let response, responseData;
            let data;
            if (modelType !== 'completion' && modelType !== 'embedding') {
                data = {
                    role: "user",
                    content: newMessage,
                    images: uploadedImages, // Include images in the data
                    files: uploadedFiles,
                };
                setMessages(prevMessages => [...prevMessages, newChat]);
                // Insert temporary assistant typing message
                const tempAssistantId = `assistant_${timestamp}`;
                const loadingAssistant = {
                    id: tempAssistantId,
                    sender: "assistant",
                    time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    content: "",
                    isLoading: true,
                };
                setMessages(prev => [...prev, loadingAssistant]);
                responseData = await dryRun({
                    localDataToSend: {
                        version_id: versionId,
                        testcase_data,
                        configuration: {
                            conversation: conversation,
                            type: modelType
                        },
                        user: data.content,
                        images: uploadedImages,
                        files: uploadedFiles,
                        variables
                    },
                    bridge_id: params?.id,
                });
                // Handle unsuccessful response: rollback loading placeholder and user message
                if (!responseData || !responseData.success) {
                    inputRef.current.value = data.content;
                    // remove loading placeholder and the user message we just added
                    setMessages(prev => prev.filter(m => m.id !== tempAssistantId && m.id !== `user_${timestamp}`));
                    setLoading(false);
                    return;
                }
            } else if (modelType === "embedding") {
                data = {
                    role: "user",
                    content: newMessage
                };
                setMessages(prevMessages => [...prevMessages, newChat]);
                // Insert temporary assistant typing message for embedding as well
                const tempAssistantId = `assistant_${timestamp}`;
                const loadingAssistant = {
                    id: tempAssistantId,
                    sender: "assistant",
                    time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    content: "",
                    isLoading: true,
                };
                setMessages(prev => [...prev, loadingAssistant]);
                responseData = await dryRun({
                    localDataToSend: {
                        version_id: versionId,
                        testcase_data,
                        configuration: {
                            conversation: conversation,
                            type: modelType
                        },
                        text: newMessage
                    },
                    bridge_id: params?.id
                });
                if (!responseData || !responseData.success) {
                    inputRef.current.value = data.content;
                    // remove loading placeholder and the user message we just added
                    setMessages(prev => prev.filter(m => m.id !== tempAssistantId && m.id !== `user_${timestamp}`));
                    setLoading(false);
                    return;
                }
            } else if (modelType !== "image") {
                if(testCaseId){
                    testcase_data.testcase_id = testCaseId;
                }
                // Insert temporary assistant typing message for completion path as well
                const tempAssistantId = `assistant_${timestamp}`;
                const loadingAssistant = {
                    id: tempAssistantId,
                    sender: "assistant",
                    time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    content: "",
                    isLoading: true,
                };
                setMessages(prev => [...prev, loadingAssistant]);
                responseData = await dryRun({
                    localDataToSend: {
                        ...localDataToSend,
                        version_id: versionId,
                        testcase_data,
                        configuration: {
                            ...localDataToSend.configuration
                        },
                        input: bridge?.inputConfig?.input?.input
                    },
                    bridge_id: params?.id
                });
                if (!responseData || !responseData.success) {
                    // remove loading placeholder if present
                    setMessages(prev => prev.filter(m => m.id !== tempAssistantId));
                    setLoading(false);
                    return;
                }
            }
            // if(Object.entries(responseData?.response?.data?.tools_data)?.length>0)
            // {
            //     const toolData = {
            //     id: conversation.length + 3,
            //     sender: "tools_call",
            //     time: new Date().toLocaleTimeString([], {
            //         hour: "2-digit",
            //         minute: "2-digit",
            //     }),
            //     tools_call_data: responseData.response?.data?.tools_data
            //     }
            //     setMessages(prevMessages => [...prevMessages, toolData]);
            // }
            // success is ensured in branches above for non-completion and embedding
            if (!responseData || !responseData.success) {
                setLoading(false);
                return;
            }
            response = modelType === 'embedding' ? responseData.data?.response.data.embedding : responseData.response?.data;
            if(responseData?.response?.testcase_id){
                setTestCaseId(responseData?.response?.testcase_id);
            }
            const content = modelType === 'embedding' ? response : response?.content || "";
            const assistConversation = {
                role: response?.role || "assistant",
                content: content,
                fallback : response?.fallback ? response?.fallback : response?.fall_back,
                finish_reason: response?.finish_reason || "no_reason",
                firstAttemptError: response?.firstAttemptError,
                image_urls: response?.image_urls || [],
                model: response?.model
            };

            // Replace the temporary loading message with the actual response first
            const tempAssistantIdFinal = `assistant_${timestamp}`;
            const newChatAssist = {
                id: tempAssistantIdFinal,
                sender: "assistant",
                time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                content: Array.isArray(content) ? content.join(", ") : content.toString(),
                image_urls: assistConversation.image_urls,
                fallback : assistConversation?.fallback,
                finish_reason: assistConversation?.finish_reason,
                firstAttemptError: response?.firstAttemptError,
                modelName : assistConversation?.model
            };

            // Update conversation and messages together to maintain synchronization
            if (modelType !== 'completion' && modelType !== 'embedding') {
                const updatedConversation = [...conversation, cloneDeep(omit(data, 'files')), assistConversation].slice(-6);
                setConversation(updatedConversation);
                setMessages(prevMessages => {
                    const updatedMessages = prevMessages.map(m => m.id === tempAssistantIdFinal ? newChatAssist : m);
                    return updatedMessages;
                });
            } else if (modelType === 'embedding') {
                const updatedConversation = [...conversation, cloneDeep(data), assistConversation].slice(-6);
                setConversation(updatedConversation);
                setMessages(prevMessages => {
                    const updatedMessages = prevMessages.map(m => m.id === tempAssistantIdFinal ? newChatAssist : m); 
                    return updatedMessages;
                });
            } else {
                // For completion models, just replace the loading message
                setMessages(prevMessages => prevMessages.map(m => m.id === tempAssistantIdFinal ? newChatAssist : m));
            }
            //         pauseOnHover: true,
            //         draggable: true,
            //         progress: undefined,
            //         icon: () => <AlertIcon size={20} className="text-warning" />
            //     });
             
        } catch (error) {
            setErrorMessage("Something went wrong. Please try again.");
            setMessages(prev => prev.filter(m => 
                m.id !== `assistant_${timestamp}` && m.id !== `user_${timestamp}`
            ));
        } finally {
            setLoading(false);
            // Remove the redundant append of newChatAssist since we already replace the loading placeholder with it.
            // setMessages(prevMessages => [...prevMessages, newChatAssist]);
            setUploadedFiles([]);
        }
    };

    const handleKeyDown = useCallback(
        event => {
            if (event.key === "Enter") {
                if (event.shiftKey) {
                    // Do nothing, let the default behavior create a new line
                } else {
                    // Only prevent default and send if not loading
                    if (!loading && !uploading) {
                        event.preventDefault();
                        isOrchestralModel ? handleSendMessageForOrchestralModel() : handleSendMessage(event);
                    }
                }
            }
        },
        [loading, uploading, conversation, prompt, isOrchestralModel, selectedStrategy, inputRef, testCaseId]
    );
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const largeFiles = files.filter(file => file.size > 35 * 1024 * 1024);
        if (largeFiles.length > 0) {
            toast.error('Each file should be less than 35MB.');
            return;
        }

        const newPdfs = files.filter(file => file.type === 'application/pdf');
        const newImages = files.filter(file => file.type !== 'application/pdf');
    
        const totalPdfs = uploadedFiles.length + newPdfs.length;
        const totalImages = uploadedImages.length + newImages.length;
    
        if (totalPdfs > 2) {
            toast.error('Only two PDFs are allowed.');
            return;
        }
    
        if (totalImages > 4) {
            toast.error('Only four images are allowed.');
            return;
        }
    
        if (files.length > 0) {
            setUploading(true);
    
            for (let file of files) {
                const formData = new FormData();
                formData.append('image', file);
                const result = await dispatch(uploadImageAction(formData));
    
                if (result.success) {
                    if (file.type === 'application/pdf') {
                        setUploadedFiles(prev => [...prev, result.image_url]);
                    } else {
                        setUploadedImages(prev => [...prev, result.image_url]);
                    }
                }
            }
    
            setUploading(false);
        }
        // Clear the file input value to allow re-uploading the same file
        if (fileInput) {
            fileInput.value = "";
        }
    };
    

    return (
        <div className="input-group flex justify-end items-end gap-2 w-full relative">
            {/* --- CORRECTED PREVIEW CONTAINER --- */}
            {(uploadedImages.length > 0 || uploadedFiles.length > 0) && (
                <div className="absolute bottom-16 left-0 w-full flex flex-nowrap overflow-x-auto items-end gap-2 p-2 bg-base-100 border-t rounded-t-lg">
                    {/* Image Previews */}
                    {uploadedImages.map((url, index) => (
                        <div key={index} className="relative flex-shrink-0">
                            <Image
                                src={url}
                                alt={`Uploaded Preview ${index + 1}`}
                                width={64}
                                height={64}
                                className="w-16 h-16 object-cover bg-base-300 p-1 rounded-lg"
                            />
                            <button
                                className="absolute -top-2 -right-2 text-white rounded-full"
                                onClick={() => {
                                    const newImages = uploadedImages.filter((_, i) => i !== index);
                                    setUploadedImages(newImages);
                                }}
                            >
                                <CloseCircleIcon className='text-base-content bg-base-200 rounded-full' size={20} />
                            </button>
                        </div>
                    ))}
                    {/* File Previews */}
                    {uploadedFiles.map((url, index) => (
                        <div key={index} className="relative flex-shrink-0">
                            <div className="flex items-center h-16 gap-2 bg-base-300 p-2 rounded-lg">
                                <PdfIcon height={24} width={24} />
                                <p className='text-sm max-w-[120px] truncate' title={url}>{url.split('/').pop()}</p>
                            </div>
                            <button
                                className="absolute -top-2 -right-2 text-white rounded-full"
                                onClick={() => {
                                    const newFiles = uploadedFiles.filter((_, i) => i !== index);
                                    setUploadedFiles(newFiles);
                                }}
                            >
                                <CloseCircleIcon className='text-base-content bg-base-200 rounded-full' size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            {(modelType !== "completion") && (modelType !== 'image') && (
                <textarea
                    ref={inputRef}
                    placeholder="Type here"
                    className="textarea textarea-bordered w-full focus:border-primary max-h-[200px] resize-none overflow-y-auto h-auto"
                    onKeyDown={handleKeyDown}
                    rows={1}
                    onInput={(e) => {
                        e.target.style.height = 'auto'; // Reset height
                        e.target.style.height = `${e.target.scrollHeight}px`; // Set to scroll height
                    }}
                />
            )}
            <input
                ref={(el) => setFileInput(el)} // Use callback ref to set the state
                type="file"
                accept={isVision && isFileSupported ? 'image/*,.pdf' : isVision ? 'image/*' : isFileSupported ? '.pdf' : 'image/*,.pdf'}
                multiple={isVision || isFileSupported}
                onChange={handleFileChange}
                className="hidden"
                data-max-size="35MB"
            />
            {(isVision || isFileSupported) && <button
                className="btn btn-ghost btn-circle"
                onClick={() => fileInput && fileInput.click()} // Use state variable to trigger click
                disabled={loading || uploading}
            >
                <UploadIcon />
            </button>}
            <button
                className="btn btn-primary btn-circle"
                onClick={() => {isOrchestralModel ? handleSendMessageForOrchestralModel() : handleSendMessage()}}
                disabled={loading || uploading || (modelType === 'image')}
            >
                {(loading || uploading) ? (
                    <span className="loading loading-dots loading-md"></span>
                ) : (
                    <SendHorizontalIcon/>
                )}
            </button>
        </div>
    )
}

export default ChatTextInput;