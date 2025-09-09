import { dryRun } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { uploadImageAction } from '@/store/action/bridgeAction';
import _ from 'lodash';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { CloseCircleIcon, SendHorizontalIcon, UploadIcon } from '@/components/Icons';
import { PdfIcon } from '@/icons/pdfIcon';

function ChatTextInput({ setMessages, setErrorMessage, messages, params, uploadedImages, setUploadedImages, conversation, setConversation, uploadedFiles, setUploadedFiles, handleSendMessageForOrchestralModel, isOrchestralModel, inputRef, loading, setLoading, searchParams }) {
    const [uploading, setUploading] = useState(false);
    const dispatch = useDispatch();
    const [fileInput, setFileInput] = useState(null); // Use state for the file input element
    const versionId = searchParams?.version;
    const { bridge, modelType, modelName, variablesKeyValue, prompt, configuration, modelInfo, service } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId],
        modelName: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.configuration?.model?.toLowerCase(),
        modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.configuration?.type?.toLowerCase(),
        prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.configuration?.prompt,
        variablesKeyValue: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.variables || [],
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
        setErrorMessage("");
        if (modelType !== "completion") inputRef.current.value = "";
        setLoading(true);
        try {
            const newChat = {
                id: conversation.length + 1,
                sender: "user",
                time: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                content: newMessage.replace(/\n/g, "  \n"), // Markdown line break
                images: uploadedImages, // Store images in the user role
                files: uploadedFiles,
            };           
            setUploadedImages([]);
            setUploadedFiles([]);
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
                responseData = await dryRun({
                    localDataToSend: {
                        version_id: versionId,
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
            } else if (modelType === "embedding") {
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
                        text: newMessage
                    },
                    bridge_id: params?.id
                });
            } else if (modelType !== "image") {
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
                setLoading(false);
                return;
            }
            response = modelType === 'embedding' ? responseData.data?.response.data.embedding : responseData.response?.data;
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

            if (modelType !== 'completion' && modelType !== 'embedding') {
                setConversation(prevConversation => [...prevConversation, _.cloneDeep(_.omit(data, 'files')), assistConversation].slice(-6));
            } else if (modelType === 'embedding') {
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
                image_urls: assistConversation.image_urls,
                fallback : assistConversation?.fallback,
                finish_reason: assistConversation?.finish_reason,
                firstAttemptError: response?.firstAttemptError,
                modelName : assistConversation?.model
            };

            // Show alert for non-completed finish_reason
            // const finishReason = assistConversation?.finish_reason;
            // if (finishReason && finishReason !== "completed" && finishReason !== "no_reason") {
            //     const description = FINISH_REASON_DESCRIPTIONS[finishReason] || 
            //                        FINISH_REASON_DESCRIPTIONS["other"];
            //     toast.warning(`${finishReason}: ${description}`, {
            //         position: "bottom-right",
            //         autoClose: 5000,
            //         hideProgressBar: false,
            //         closeOnClick: true,
            //         pauseOnHover: true,
            //         draggable: true,
            //         progress: undefined,
            //         icon: () => <AlertIcon size={20} className="text-warning" />
            //     });
            // }

            setMessages(prevMessages => [...prevMessages, newChatAssist]);
        } catch (error) {
            console.log(error);
            setErrorMessage("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
            setUploadedImages([]);
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
        [loading, uploading, conversation, prompt, isOrchestralModel]
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