import { dryRun } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { uploadImageAction } from '@/store/action/bridgeAction';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { SendHorizontalIcon, UploadIcon, LinkIcon, PlayIcon } from '@/components/Icons';
import { Paperclip } from 'lucide-react';
import { PdfIcon } from '@/icons/pdfIcon';
import { toggleSidebar } from '@/utils/utility';

function ChatTextInput({ setMessages, setErrorMessage, params, uploadedImages, setUploadedImages, conversation, setConversation, uploadedFiles, setUploadedFiles, handleSendMessageForOrchestralModel, isOrchestralModel, inputRef, loading, setLoading, searchParams, setTestCaseId, testCaseId, selectedStrategy}) {
    const [uploading, setUploading] = useState(false);
    const [uploadedVideos, setUploadedVideos] = useState(null);
    const [mediaUrls, setMediaUrls] = useState(null);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [showRunAnyway, setShowRunAnyway] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const [runAnywayUsed, setRunAnywayUsed] = useState(false);
    const dispatch = useDispatch();
    const [fileInput, setFileInput] = useState(null); // Use state for the file input element
    const versionId = searchParams?.version;
    const { bridge, modelType, modelName, variablesKeyValue, prompt, configuration, modelInfo, service } = useCustomSelector((state) => {
        const versionState = state?.variableReducer?.VariableMapping?.[params?.id]?.[versionId] || {};
        const activeGroupId = versionState?.activeGroupId;
        const groups = versionState?.groups || [];
        const activeGroup = groups.find(group => group.id === activeGroupId) || groups[0];
        
        return {
            bridge: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId],
            modelName: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.configuration?.model?.toLowerCase(),
            modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.configuration?.type?.toLowerCase(),
            prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.configuration?.prompt,
            variablesKeyValue: activeGroup?.variables || versionState?.variables || [],
            configuration: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.configuration,
            modelInfo: state?.modelReducer?.serviceModels,
            service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.service?.toLowerCase(),
        };
    });
    const dataToSend = useMemo(() => ({
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
    }), [modelName, modelType, bridge]);
    
    const [localDataToSend, setLocalDataToSend] = useState(dataToSend);
    
    const { isVision, isFileSupported, isVideoSupported} = useMemo(() => {
        const validationConfig = modelInfo?.[service]?.[configuration?.type]?.[configuration?.model]?.validationConfig || {};    
        return {
          isVision: validationConfig.vision,
          isFileSupported: validationConfig.files,
          isVideoSupported: validationConfig.video
        };
      }, [modelInfo, service, configuration?.type, configuration?.model]);

    useEffect(() => {
        setLocalDataToSend(dataToSend);
    }, [dataToSend]);

    const variables = useMemo(() => {
        const coerceValue = (rawValue, fallback, type) => {
            const candidate = rawValue ?? fallback ?? "";
            const trimmed = typeof candidate === "string" ? candidate.trim() : candidate;
            if (trimmed === "") {
                return undefined;
            }
            if (type === "number") {
                const parsed = Number(trimmed);
                return Number.isNaN(parsed) ? undefined : parsed;
            }
            if (type === "boolean") {
                if (typeof trimmed === "boolean") return trimmed;
                if (String(trimmed).toLowerCase() === "true") return true;
                if (String(trimmed).toLowerCase() === "false") return false;
                return undefined;
            }
            if (type === "object" || type === "array") {
                try {
                    const parsed = typeof candidate === "string" ? JSON.parse(candidate) : candidate;
                    return parsed;
                } catch (err) {
                    return undefined;
                }
            }
            return candidate;
        };

        return variablesKeyValue.reduce((acc, pair) => {
            if (!pair?.key) {
                return acc;
            }
            const resolved =
                pair.value && String(pair.value).length > 0
                    ? pair.value
                    : pair.defaultValue;

            if (
                resolved === undefined ||
                (typeof resolved === "string" && resolved.trim() === "")
            ) {
                return acc;
            }

            const coerced = coerceValue(pair.value, pair.defaultValue, pair.type || "string");
            if (coerced !== undefined) {
                acc[pair.key] = coerced;
            }
            return acc;
        }, {});
    }, [variablesKeyValue]);

    // Validate missing variables in prompt
    const validatePromptVariables = useCallback(() => {
        if (!prompt) return { isValid: true, missingVariables: [] };
        
        // Extract variables from prompt using regex
        const regex = /{{(.*?)}}/g;
        const matches = [...prompt.matchAll(regex)];
        const promptVariables = [...new Set(matches.map(match => match[1].trim()))];
        
        if (!promptVariables.length) return { isValid: true, missingVariables: [] };
        
        // Check which variables are missing values
        const missingVariables = promptVariables.filter(varName => {
            const variable = variablesKeyValue.find(v => v.key === varName);
            if (!variable) {
                return true; // Variable not defined at all
            }
            
            // Skip validation for optional variables
            if (!variable.required) {
                return false;
            }
            
            const hasValue = variable.value !== undefined && variable.value !== null && String(variable.value).trim() !== '';
            const hasDefault = variable.defaultValue !== undefined && variable.defaultValue !== null && String(variable.defaultValue).trim() !== '';
            return !hasValue && !hasDefault; // Missing both value and default
        });
        
        return {
            isValid: missingVariables.length === 0,
            missingVariables
        };
    }, [prompt, variablesKeyValue]);

    const clearState = () => {
        setUploadedImages([]);
            setUploadedFiles([]);
            setUploadedVideos(null);
            setMediaUrls(null);
            setShowUrlInput(false);
            setUrlInput('');
    }

    const handleSendMessage = async (e, forceRun = false) => {
        const timestamp = Date.now();
        
        if (inputRef.current) {
            inputRef.current.style.height = '40px'; // Set initial height
        }
        if (prompt?.trim() === "" && (modelType !== 'completion' && modelType !== 'embedding')) {
            setErrorMessage("Prompt is required");
            return;
        }

        // Validate variables in prompt (skip if forceRun is true OR if runAnywayUsed is true)
        if (!forceRun && !runAnywayUsed) {
            const validation = validatePromptVariables();
            
            if (!validation.isValid) {
                const missingVars = validation.missingVariables.join(', ');
                const errorMsg = `Missing values for variables: ${missingVars}. Please provide values or default values.`;
                
                setErrorMessage(errorMsg);
                setValidationError(errorMsg);
                setShowRunAnyway(true);
                
                // Open the variable collection slider
                toggleSidebar("variable-collection-slider", "right");
                
                // Store missing variables in sessionStorage for the slider to highlight
                sessionStorage.setItem('missingVariables', JSON.stringify(validation.missingVariables));
                
                return;
            } else {
                // Clear validation states if validation passes
                setValidationError(null);
                setShowRunAnyway(false);
                sessionStorage.removeItem('missingVariables');
            }
        } else if (forceRun) {
            // Clear validation states when running anyway
            setValidationError(null);
            setShowRunAnyway(false);
            setErrorMessage("");
            setRunAnywayUsed(true); // Mark Run Anyway as used
            sessionStorage.removeItem('missingVariables');
        }

        const newMessage = inputRef?.current?.value.replace(/\r?\n/g, '\n');

        if(newMessage?.trim() === "") {
            setErrorMessage("Message is required");
            return;
        }
        const images = uploadedImages?.length > 0 ? uploadedImages.filter(img => img !== null && img !== undefined) : [];
        const files = uploadedFiles?.length > 0 ? uploadedFiles.filter(file => file !== null && file !== undefined) : [];
        const videos = uploadedVideos ? uploadedVideos : null;
        const urls = mediaUrls ? mediaUrls : null;

        clearState();

        if ((videos?.length > 0 || urls?.length > 0) && newMessage?.trim() === "") {
            setErrorMessage("A message is required when uploading files or videos.");
            return;
        }

        if (modelType !== 'completion' && modelType !== 'embedding') {
            if (newMessage?.trim() === "" && images?.length === 0 && files?.length === 0 && videos?.length === 0 && urls?.length === 0) {
                setErrorMessage("Message is required");
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
                images: images, // Store images in the user role
                files: files,
                video_data: videos, // Store videos
                youtube_url: urls, // Store media URLs
            };           
            let response, responseData;
            let data;
            if (modelType !== 'completion' && modelType !== 'embedding') {
                data = {
                    role: "user",
                    content: newMessage,
                    images: images, // Include images in the data
                    files: files,
                    video_data: videos, // Include videos in the data
                    youtube_url: urls, // Include media URLs in the data
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
                const apiPayload = {
                    localDataToSend: {
                        version_id: versionId,
                        testcase_data,
                        configuration: {
                            conversation: conversation,
                            type: modelType
                        },
                        user: data.content,
                        images: images,
                        files: files,
                        video_data: videos,
                        youtube_url: urls,
                        variables
                    },
                    bridge_id: params?.id,
                };
                responseData = await dryRun(apiPayload);
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
                
                const embeddingPayload = {
                    localDataToSend: {
                        version_id: versionId,
                        testcase_data,
                        configuration: {
                            conversation: conversation,
                            type: modelType
                        },
                        text: newMessage,
                        images: images,
                        files: files,
                        video_data: videos,
                        youtube_url: urls,
                        variables
                    },
                    bridge_id: params?.id
                };
                responseData = await dryRun(embeddingPayload);
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
                
                const completionPayload = {
                    localDataToSend: {
                        ...localDataToSend,
                        version_id: versionId,
                        testcase_data,
                        configuration: {
                            ...localDataToSend.configuration
                        },
                        input: bridge?.inputConfig?.input?.input,
                        images: images,
                        files: files,
                        video_data: videos,
                        youtube_url: urls,
                        variables
                    },
                    bridge_id: params?.id
                };
                responseData = await dryRun(completionPayload);
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
        [loading, uploading, conversation, prompt, isOrchestralModel, selectedStrategy, inputRef, testCaseId, variables]
    );
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const largeFiles = files.filter(file => file.size > 35 * 1024 * 1024);
        if (largeFiles.length > 0) {
            toast.error('Each file should be less than 35MB.');
            return;
        }
        const newPdfs = files.filter(file => file.type === 'application/pdf');
        const newVideos = files.filter(file => file.type.startsWith('video/'));
        const newImages = files.filter(file => file.type.startsWith('image/'));
    
        const totalPdfs = uploadedFiles.length + newPdfs.length;
        const totalImages = uploadedImages.length + newImages.length;
        const hasExistingVideo = uploadedVideos !== null;
        const totalVideos = (hasExistingVideo ? 1 : 0) + newVideos.length;

        if (totalVideos > 1) {
            toast.error('Only one video is allowed.');
            return;
        }
    
        if (totalImages > 4) {
            toast.error('Only four images are allowed.');
            return;
        }
    
        if (files.length > 0) {
            setUploading(true);
    
            for (let file of files) {
                try {
                    const formData = new FormData();
                    const isVedio = file.type.startsWith('video/');
                    const isPdf = file.type === 'application/pdf';
                    let isVedioOrPdf = false;
                    if(isVedio || isPdf){
                        isVedioOrPdf = true;
                    }
                    formData.append(isVedio ? 'video' : isPdf ? 'file' : 'image', file);
                    const result = await dispatch(uploadImageAction(formData, isVedioOrPdf));
        
                    if (result && result.success) {
                        if (file.type === 'application/pdf') {
                            const fileUrl = result.image_url || result.file_url || result.url || result.data?.url || result.data?.image_url || result.data?.file_url;
                            if (fileUrl) {
                                setUploadedFiles(prev => [...prev, fileUrl]);
                            } else {
                                console.error('No file URL found in result for PDF:', result);
                                // Don't add null to the array, just skip
                                toast.error('File uploaded but URL not found');
                            }
                        } else if (file.type.startsWith('video/')) {
                            const videoData = result.file_data || result.video_data || result.data || result.data?.video_data;
                            setUploadedVideos(videoData); // Replace existing video
                        } else if (file.type.startsWith('image/')) {
                            const imageUrl = result.image_url || result.file_url || result.url || result.data?.url || result.data?.image_url || result.data?.file_url;
                            if (imageUrl) {
                                setUploadedImages(prev => [...prev, imageUrl]);
                            } else {
                                console.error('No image URL found in result for image:', result);
                                // Don't add null to the array, just skip
                                toast.error('Image uploaded but URL not found');
                            }
                        }
                    } else {
                        console.error('Upload failed or no success flag:', result);
                        toast.error(result?.data?.error || result?.error || result?.message || 'Upload failed');
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                    toast.error(`Failed to upload: ${error.message || 'Unknown error'}`);
                }
                finally{
                    setUploading(false);
                }
            }
    
            setUploading(false);
        }
        // Clear the file input value to allow re-uploading the same file
        if (fileInput) {
            fileInput.value = "";
        }
    };

    const addMediaUrl = () => {
        if (urlInput.trim() && !mediaUrls) {
            // Basic URL validation
            try {
                new URL(urlInput.trim());
                setMediaUrls(urlInput.trim());
                setUrlInput('');
                setShowUrlInput(false);
            } catch {
                toast.error('Please enter a valid URL.');
            }
        } else if (mediaUrls) {
            toast.error('Only one YouTube URL is allowed.');
        }
    };

    const removeUrl = () => {
        setMediaUrls(null);
    };


    const handleAttachmentOption = (type) => {
        switch(type) {
            case 'images':
                if (fileInput) {
                    fileInput.accept = 'image/*';
                    fileInput.click();
                }
                break;
            case 'videos':
                if (fileInput) {
                    fileInput.accept = 'video/*';
                    fileInput.click();
                }
                break;
            case 'files':
                if (fileInput) {
                    fileInput.accept = '.pdf';
                    fileInput.click();
                }
                break;
            case 'url':
                setShowUrlInput(true);
                break;
            default:
                if (fileInput) {
                    fileInput.accept = isVision && isFileSupported && isVideoSupported 
                        ? 'image/*,.pdf,video/*' 
                        : isVision && isVideoSupported 
                        ? 'image/*,video/*' 
                        : isVision && isFileSupported 
                        ? 'image/*,.pdf' 
                        : isVision 
                        ? 'image/*' 
                        : isFileSupported 
                        ? '.pdf' 
                        : 'image/*,.pdf,video/*';
                    fileInput.click();
                }
        }
    };

    return (
        <div className="w-full space-y-2">
            {/* Simplified Media Preview Container */}
            {(uploadedImages.length > 0 || uploadedFiles.length > 0 || uploadedVideos || mediaUrls) && (
                <div className="mb-2 p-3 bg-base-200 rounded-lg border border-base-content/30">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-base-content/70">
                            Attached Media ({uploadedImages.length + uploadedFiles.length + (uploadedVideos ? 1 : 0) + (mediaUrls ? 1 : 0)})
                        </span>
                        <button 
                            className="text-xs text-error hover:text-error-focus"
                            onClick={() => {
                                setUploadedImages([]);
                                setUploadedFiles([]);
                                setUploadedVideos(null);
                                setMediaUrls(null);
                            }}
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* Image Previews */}
                        {uploadedImages.map((url, index) => (
                            <div key={`image-${index}`} className="relative">
                                <Image
                                    src={url}
                                    alt={`Image ${index + 1}`}
                                    width={50}
                                    height={50}
                                    className="w-12 h-12 object-cover rounded-lg border"
                                />
                                <button
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-error text-error-content rounded-full flex items-center justify-center text-xs"
                                    onClick={() => {
                                        const newImages = uploadedImages.filter((_, i) => i !== index);
                                        setUploadedImages(newImages);
                                    }}
                                    title="Remove"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {/* File Previews */}
                        {uploadedFiles.map((url, index) => (
                            <div key={`file-${index}`} className="relative flex items-center gap-2 bg-base-100 border rounded-lg p-2">
                                <PdfIcon height={16} width={16} className="text-orange-500" />
                                <span className="text-xs">PDF</span>
                                <button
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-error text-error-content rounded-full flex items-center justify-center text-xs"
                                    onClick={() => {
                                        const newFiles = uploadedFiles.filter((_, i) => i !== index);
                                        setUploadedFiles(newFiles);
                                    }}
                                    title="Remove"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {/* Video Previews */}
                        {uploadedVideos && (
                            <div key={`video-`} className="relative">
                                <div className="relative w-12 h-12 bg-black rounded-lg overflow-hidden border">
                                    <video
                                        src={uploadedVideos}
                                        className="w-full h-full object-cover"
                                        muted
                                        preload="metadata"
                                        onLoadedMetadata={(e) => {
                                            // Seek to 1 second to get a frame for thumbnail
                                            e.target.currentTime = 1;
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <PlayIcon size={16} className="text-white" />
                                    </div>
                                </div>
                                <button
                                    className="absolute top-0 -right-1 w-4 h-4 bg-error text-error-content rounded-full flex items-center justify-center text-xs"
                                    onClick={() => setUploadedVideos(null)}
                                    title="Remove"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        {/* URL Previews */}
                        {mediaUrls && (
                            <div key="url" className="relative flex items-center gap-2 bg-base-100 border rounded-lg p-2 max-w-[120px]">
                                <LinkIcon size={16} className="text-blue-500" />
                                <span className="text-xs truncate" title={mediaUrls}>YouTube URL</span>
                                <button
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-error text-error-content rounded-full flex items-center justify-center text-xs"
                                    onClick={() => removeUrl()}
                                    title="Remove"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* URL Input Modal */}
            {showUrlInput && (
                <div className="w-full bg-base-100 border border-base-300 rounded-lg shadow-lg">
                    <div className="p-2">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-base-200 rounded-lg">
                                <LinkIcon size={16} className="text-base-content" />
                            </div>
                            <h3 className="text-sm font-semibold text-base-content">Add Youtube URL</h3>
                        </div>
                        
                        <div className="space-y-1 mt-2">
                            <div>
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                                    className="input input-bordered w-full focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    autoFocus
                                />
                            </div>
                            
                            <div className="flex gap-2 justify-between items-center">
                            <p className="text-xs text-base-content/60">
                                    Support Youtube videos url only
                                </p>
                            <div className="flex gap-2 items-center">
                            <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => {
                                        setShowUrlInput(false);
                                        setUrlInput('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={addMediaUrl}
                                    disabled={!urlInput.trim()}
                                >
                                    <LinkIcon size={14} />
                                    Add URL
                                </button>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Validation Error Display */}
            {validationError && (
                <div className="mb-2 p-3 bg-error/10 border border-error/30 rounded-lg">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-error mb-1">Variable Validation Error</h4>
                            <p className="text-sm text-error/80 mb-3">{validationError}</p>
                            {showRunAnyway && (
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-error btn-sm"
                                        onClick={() => handleSendMessage(null, true)}
                                        disabled={loading || uploading}
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Run Anyway
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => {
                                            setValidationError(null);
                                            setShowRunAnyway(false);
                                            setErrorMessage("");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Input Group */}
            <div className="input-group flex justify-end items-end gap-2 w-full relative">
                {(modelType !== "completion") && (modelType !== 'image') && (
                <textarea
                    ref={inputRef}
                    placeholder="Type here"
                    className={`textarea bg-white dark:bg-black/15 textarea-bordered w-full max-h-[200px] resize-none overflow-y-auto h-auto ${
                        validationError 
                            ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' 
                            : 'focus:border-primary'
                    }`}
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
                accept={
                    isVision && isFileSupported && isVideoSupported 
                        ? 'image/*,.pdf,video/*' 
                        : isVision && isVideoSupported 
                        ? 'image/*,video/*' 
                        : isVision && isFileSupported 
                        ? 'image/*,.pdf' 
                        : isVision 
                        ? 'image/*' 
                        : isFileSupported 
                        ? '.pdf' 
                        : 'image/*,.pdf,video/*'
                }
                multiple={isVision || isFileSupported || isVideoSupported}
                onChange={handleFileChange}
                className="hidden"
                data-max-size="35MB"
            />
            {/* DaisyUI Dropdown for Attachments */}
            {(isVision || isFileSupported || isVideoSupported) && (
                <div className="dropdown dropdown-top dropdown-end">
                    <div className="tooltip tooltip-top" data-tip="Attach files">
                        <label 
                            tabIndex={0} 
                            className={`btn btn-circle transition-all duration-200 ${
                                uploading 
                                    ? 'btn-disabled bg-base-300' 
                                    : 'btn-ghost hover:btn-primary hover:scale-105'
                            }`}
                            disabled={loading || uploading}
                        >
                            {uploading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <Paperclip size={18} />
                            )}
                        </label>
                    </div>

                    {/* DaisyUI Dropdown Content */}
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-60 border border-base-300">
                        <li className="menu-title">
                            <span className="text-xs font-semibold text-base-content/60">Attach files</span>
                        </li>
                        
                        {/* Images Option */}
                        {isVision && (
                            <li>
                                <a onClick={() => handleAttachmentOption('images')} className="flex items-center gap-3 p-3">
                                    <div className="p-1.5 bg-base-100 rounded-lg">
                                        <UploadIcon size={16} className="text-base-content" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium">Upload Images</div>
                                        <div className="text-xs text-base-content/60">JPG, PNG, GIF, WebP</div>
                                    </div>
                                </a>
                            </li>
                        )}

                        {/* Videos Option */}
                        {isVideoSupported && (
                            <li>
                                <a onClick={() => handleAttachmentOption('videos')} className="flex items-center gap-3 p-3">
                                    <div className="p-1.5 bg-base-100 rounded-lg">
                                        <PlayIcon size={16} className="text-base-content" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium">Upload Video</div>
                                        <div className="text-xs text-base-content/60">MP4, WebM, AVI (1 max)</div>
                                    </div>
                                </a>
                            </li>
                        )}

                        {/* Files Option */}
                        {isFileSupported && (
                            <li>
                                <a onClick={() => handleAttachmentOption('files')} className="flex items-center gap-3 p-3">
                                    <div className="p-1.5 bg-base-100 rounded-lg">
                                        <PdfIcon height={16} width={16} className="text-base-content" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium">Upload Documents</div>
                                        <div className="text-xs text-base-content/60">PDF files</div>
                                    </div>
                                </a>
                            </li>
                        )}

                        {/* URL Option */}
                        {(isVideoSupported) && (
                            <li>
                                <a onClick={() => handleAttachmentOption('url')} className="flex items-center gap-3 p-3">
                                    <div className="p-1.5 bg-base-100 rounded-lg">
                                        <LinkIcon size={16} className="text-base-content" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium">Add URL</div>
                                        <div className="text-xs text-base-content/60">Youtube URL</div>
                                    </div>
                                </a>
                            </li>
                        )}
                    </ul>
                </div>
            )}
            {/* Enhanced Send Button */}
            <div className="tooltip tooltip-top" data-tip="Send message">
                <button
                    className={`btn btn-circle transition-all duration-200 ${
                        loading || uploading || (modelType === 'image')
                            ? 'btn-disabled'
                            : 'btn-primary hover:btn-primary-focus hover:scale-105 shadow-lg hover:shadow-xl'
                    }`}
                    onClick={() => {isOrchestralModel ? handleSendMessageForOrchestralModel() : handleSendMessage()}}
                    disabled={loading || uploading || (modelType === 'image')}
                >
                    {(loading || uploading) ? (
                        <span className="loading loading-dots loading-md"></span>
                    ) : (
                        <SendHorizontalIcon size={18} />
                    )}
                </button>
            </div>
            </div>
        </div>
    )
}

export default ChatTextInput;
