import { dryRun } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { uploadImageAction } from '@/store/action/bridgeAction';
import { 
  sendUserMessage,
  addLoadingAssistantMessage,
  updateAssistantMessageWithResponse,
  setChatLoading,
  setChatError,
  setChatUploadedFiles,
  setChatUploadedImages,
  sendMessageWithRtLayer
} from '@/store/action/chatAction';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { CloseCircleIcon, SendHorizontalIcon, UploadIcon } from '@/components/Icons';
import { PdfIcon } from '@/icons/pdfIcon';

function ChatTextInput({ channelIdentifier, params, handleSendMessageForOrchestralModel, isOrchestralModel, inputRef, searchParams, setTestCaseId, testCaseId, selectedStrategy}) {
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

    // Redux selectors for chat state
    const messages = useCustomSelector((state) => 
        state?.chatReducer?.messagesByChannel?.[channelIdentifier] || []
    );
    const conversation = useCustomSelector((state) => 
        state?.chatReducer?.conversationsByChannel?.[channelIdentifier] || []
    );
    const loading = useCustomSelector((state) => 
        state?.chatReducer?.loadingByChannel?.[channelIdentifier] || false
    );
    const uploadedFiles = useCustomSelector((state) => 
        state?.chatReducer?.uploadedFilesByChannel?.[channelIdentifier] || []
    );
    const uploadedImages = useCustomSelector((state) => 
        state?.chatReducer?.uploadedImagesByChannel?.[channelIdentifier] || []
    );
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
            dispatch(setChatError(channelIdentifier, "Prompt is required"));
            return;
        }
        const newMessage = inputRef?.current?.value.replace(/\r?\n/g, '\n');

        if (uploadedFiles?.length > 0 && newMessage?.trim() === "") {
            dispatch(setChatError(channelIdentifier, "A message is required when uploading a PDF."));
            return;
        }

        if (modelType !== 'completion' && modelType !== 'embedding') {
            if (newMessage?.trim() === "" && uploadedImages?.length === 0 && uploadedFiles?.length === 0) {
                dispatch(setChatError(channelIdentifier, "Message cannot be empty"));
                return;
            }
        }
        let testcase_data = {
            matching_type: selectedStrategy,
        }
        testCaseId ? testcase_data.testcase_id = testCaseId : testcase_data = null
        dispatch(setChatError(channelIdentifier, ""));
        if (modelType !== "completion") inputRef.current.value = "";
        
        try {
            // Generate unique IDs using timestamp to avoid conflicts
            const timestamp = Date.now();
            let response, responseData;
            let data;
            if (modelType !== 'completion' && modelType !== 'embedding') {
                data = {
                    role: "user",
                    content: newMessage,
                    images: uploadedImages, // Include images in the data
                    files: uploadedFiles,
                };
                
                // Use RT layer action for non-orchestral models
                const apiCall = async () => {
                    return await dryRun({
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
                };
                
                // Send message with RT layer handling (loading will persist until RT response)
                const result = await dispatch(sendMessageWithRtLayer(
                    channelIdentifier, 
                    newMessage, 
                    apiCall, 
                    isOrchestralModel
                ));
                
                responseData = result.response;
                
                // Handle unsuccessful response: rollback via Redux
                if (!responseData || !responseData.success) {
                    inputRef.current.value = data.content;
                    dispatch(setChatError(channelIdentifier, "Failed to get response"));
                    return;
                }
            } else if (modelType === "embedding") {
                data = {
                    role: "user",
                    content: newMessage
                };
                
                // Use RT layer action for embedding models too
                const apiCall = async () => {
                    return await dryRun({
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
                };
                
                // Send message with RT layer handling (loading will persist until RT response)
                const result = await dispatch(sendMessageWithRtLayer(
                    channelIdentifier, 
                    newMessage, 
                    apiCall, 
                    isOrchestralModel
                ));
                
                responseData = result.response;
                
                if (!responseData || !responseData.success) {
                    inputRef.current.value = data.content;
                    dispatch(setChatError(channelIdentifier, "Failed to get response"));
                    return;
                }
            } else if (modelType !== "image") {
                if(testCaseId){
                    testcase_data.testcase_id = testCaseId;
                }
                
                // Use RT layer action for completion models too
                const apiCall = async () => {
                    return await dryRun({
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
                };
                
                // Send message with RT layer handling (loading will persist until RT response)
                const result = await dispatch(sendMessageWithRtLayer(
                    channelIdentifier, 
                    bridge?.inputConfig?.input?.input || "", 
                    apiCall, 
                    isOrchestralModel
                ));
                
                responseData = result.response;
                
                if (!responseData || !responseData.success) {
                    dispatch(setChatError(channelIdentifier, "Failed to get response"));
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
            // Store testcase_id if present
            if(responseData?.response?.testcase_id){
                setTestCaseId(responseData?.response?.testcase_id);
            }
            
            // For orchestral models or non-RT responses, the response is already handled
            // For RT layer responses, the message will be updated when RT layer sends the response
            //         pauseOnHover: true,
            //         draggable: true,
            //         progress: undefined,
            //         icon: () => <AlertIcon size={20} className="text-warning" />
            //     });
             
        } catch (error) {
            dispatch(setChatError(channelIdentifier, "Something went wrong. Please try again."));
            dispatch(setChatLoading(channelIdentifier, false)); // Clear loading on error
        }
        // Note: Loading is cleared by RT layer when response is received, not in finally block
        
        // Clear uploaded files after successful send
        dispatch(setChatUploadedFiles(channelIdentifier, []));
        dispatch(setChatUploadedImages(channelIdentifier, []));
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
                        dispatch(setChatUploadedFiles(channelIdentifier, [...uploadedFiles, result.image_url]));
                    } else {
                        dispatch(setChatUploadedImages(channelIdentifier, [...uploadedImages, result.image_url]));
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
                                    dispatch(setChatUploadedImages(channelIdentifier, newImages));
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
                                    dispatch(setChatUploadedFiles(channelIdentifier, newFiles));
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