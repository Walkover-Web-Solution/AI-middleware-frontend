"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import Modal from "@/components/UI/Modal";
import { MODAL_TYPE } from "@/utils/enums";
import { closeModal, RequiredItem } from "@/utils/utility";
import { createResourceAction, updateResourceAction } from "@/store/action/knowledgeBaseAction";
import { uploadImage } from "@/config/utilityApi";
import { toast } from "react-toastify";

const KnowledgeBaseResourceModal = ({ activeCollection, selectedResource, setSelectedResource = () => { } }) => {
    const dispatch = useDispatch();
    const [isCreatingResource, setIsCreatingResource] = useState(false);
    const [inputType, setInputType] = useState('url'); // 'url', 'file', 'content'
    const [chunkingType, setChunkingType] = useState('recursive');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [useCollectionSettings, setUseCollectionSettings] = useState(false);
    React.useEffect(() => {
        if (selectedResource?.settings?.chunkingType) {
            setChunkingType(selectedResource.settings.chunkingType);
        } else {
            setChunkingType('recursive');
        }
        const hasCollectionChunking = activeCollection?.settings?.chunkSize;
        setUseCollectionSettings(hasCollectionChunking);
    }, [selectedResource, activeCollection]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            // Determine if it's video or PDF based on file type
            const isVedioOrPdf = file.type.includes('video') || file.type === 'application/pdf';
            
            const response = await uploadImage(formData, isVedioOrPdf);
            const fileUrl = response.url || response.file_url || response.data?.url;
            
            setUploadedFile({
                name: file.name,
                url: fileUrl,
                type: file.type,
                size: file.size
            });
            
            toast.success(`Successfully uploaded ${file.name}`);
        } catch (error) {
            toast.error(`Failed to upload ${file.name}: ${error.message}`);
        } finally {
            setIsUploading(false);
            // Reset file input
            event.target.value = '';
        }
    };

    const removeUploadedFile = () => {
        setUploadedFile(null);
    };

    const handleCreateResource = async (event) => {
        event.preventDefault();
        if (!activeCollection?.collection_id) return;
        setIsCreatingResource(true);
        const formData = new FormData(event.target);

        let settings = {};
        
        if (useCollectionSettings && activeCollection?.settings) {
            // Use collection settings
            settings = {
                chunkSize: activeCollection.settings.chunkSize,
            };
            if (activeCollection.settings.chunkingType) {
                settings.chunkingType = activeCollection.settings.chunkingType;
            }
            if (activeCollection.settings.chunkOverlap) {
                settings.chunkingOverlap = activeCollection.settings.chunkOverlap;
            }
            if (activeCollection.settings.chunkingUrl) {
                settings.chunkingUrl = activeCollection.settings.chunkingUrl;
            }
        } else {
            // Use manual settings
            settings = {
                chunkSize: Number(formData.get("chunkSize")) || 0,
            };
            const chunkingUrl = (formData.get("chunkingUrl") || "").trim();
            const chunkingType = formData.get("chunkingType");
            const chunkingOverlap = Number(formData.get("chunkingOverlap"));

            if (chunkingUrl) settings.chunkingUrl = chunkingUrl;
            if (chunkingType) settings.chunkingType = chunkingType;
            if (chunkingOverlap) settings.chunkingOverlap = chunkingOverlap;
        }

        let content = "";
        let resourceUrl = "";

        if (inputType === 'file') {
            if (uploadedFile) {
                // Use uploaded file URL
                resourceUrl = uploadedFile.url;
                content = uploadedFile.url;
            } else {
                // Fallback to local file reading (existing behavior)
                const file = formData.get("file");
                if (file) {
                    try {
                        content = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (e) => resolve(e.target.result);
                            reader.onerror = (e) => reject(e);
                            reader.readAsText(file);
                        });
                        resourceUrl = file.name;
                    } catch (error) {
                        console.error("Error reading file:", error);
                        setIsCreatingResource(false);
                        return;
                    }
                }
            }
        } else if (inputType === 'content') {
            content = (formData.get("content") || "").trim();
            // No resourceUrl needed for content input
        } else {
            resourceUrl = (formData.get("url") || "").trim();
            content = resourceUrl;
        }

        const payload = {
            collectionId: activeCollection.collection_id,
            title: (formData.get("title") || "").trim(),
            settings: settings,
        };

        // Only add content if there's actual content data (not just URL)
        if (content && content !== resourceUrl && content.trim() !== "") {
            payload.content = content;
        } else {
            payload.url = resourceUrl;
        }

        const result = await dispatch(createResourceAction(payload));
        if (result?.success) {
            closeModal(MODAL_TYPE.KNOWLEDGE_BASE_RESOURCE_MODAL);
            event.target.reset();
            setInputType('url');
        }
        setIsCreatingResource(false);
    };

    const handleUpdateResource = async (event) => {
        event.preventDefault();
        if (!selectedResource?._id) return;

        setIsCreatingResource(true);
        const formData = new FormData(event.target);

        const payload = {
            title: (formData.get("title") || "").trim(),
        };

        // Add content if the resource has content and it's being updated
        const updatedContent = (formData.get("content") || "").trim();
        if (selectedResource?.content && updatedContent) {
            payload.content = updatedContent;
        }

        const result = await dispatch(updateResourceAction(selectedResource._id, payload));
        if (result?.success) {
            closeModal(MODAL_TYPE.KNOWLEDGE_BASE_RESOURCE_MODAL);
            setSelectedResource(null);
            event.target.reset();
        }
        setIsCreatingResource(false);
    };

    const handleClose = () => {
        closeModal(MODAL_TYPE.KNOWLEDGE_BASE_RESOURCE_MODAL);
        setSelectedResource(null);
        setInputType('url');
        setChunkingType('recursive');
        setUploadedFile(null);
    };

    return (
        <Modal MODAL_ID={MODAL_TYPE.KNOWLEDGE_BASE_RESOURCE_MODAL}>
            <div className="modal-box w-11/12 max-w-xl border-2 border-base-300">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-300">
                    <h3 className="font-bold text-lg">{selectedResource ? "Edit" : "Add"} Resource</h3>
                    <button
                        onClick={handleClose}
                        className="btn btn-circle btn-ghost btn-sm"
                        disabled={isCreatingResource}
                    >
                        ✕
                    </button>
                </div>
                <div className="text-xs text-gray-500 mb-4">
                    Collection: {activeCollection?.name || "—"}
                </div>
                {!selectedResource && (
                    <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="inputType"
                                className="radio radio-primary radio-sm"
                                checked={inputType === 'url'}
                                onChange={() => setInputType('url')}
                            />
                            <span className="text-sm font-medium">URL</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="inputType"
                                className="radio radio-primary radio-sm"
                                checked={inputType === 'file'}
                                onChange={() => setInputType('file')}
                            />
                            <span className="text-sm font-medium">Upload File</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="inputType"
                                className="radio radio-primary radio-sm"
                                checked={inputType === 'content'}
                                onChange={() => setInputType('content')}
                            />
                            <span className="text-sm font-medium">Content</span>
                        </label>
                    </div>
                )}

                <form onSubmit={selectedResource ? handleUpdateResource : handleCreateResource} className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-sm font-medium">Title <RequiredItem /></span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            className="input input-bordered input-sm"
                            placeholder="Resource title"
                            required
                            maxLength={80}
                            disabled={isCreatingResource}
                            defaultValue={selectedResource?.title || ""}
                            key={selectedResource?._id || "new"}
                        />
                    </div>

                    {inputType === 'file' && !selectedResource ? (
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-sm font-medium">File <RequiredItem /></span>
                            </label>
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                className="file-input file-input-bordered file-input-sm w-full"
                                disabled={isCreatingResource || isUploading}
                                accept=".pdf,.doc,.docx,.txt"
                            />
                            {isUploading && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="loading loading-spinner loading-sm"></span>
                                    <span className="text-sm text-gray-600">Uploading file...</span>
                                </div>
                            )}
                            
                            {/* Display uploaded file */}
                            {uploadedFile && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between bg-base-200 p-2 rounded text-sm">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className="truncate">{uploadedFile.name}</span>
                                            <span className="text-xs text-gray-500">
                                                ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeUploadedFile}
                                            className="btn btn-ghost btn-xs text-error"
                                            disabled={isCreatingResource}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <span className="label-text-alt text-gray-400 mt-1">Supported formats: .pdf, .doc, .docx, .txt</span>
                        </div>
                    ) : inputType === 'content' && !selectedResource ? (
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-sm font-medium">Content <RequiredItem /></span>
                            </label>
                            <textarea
                                name="content"
                                className="textarea textarea-bordered textarea-sm w-full h-32"
                                placeholder="Enter content here..."
                                required
                                disabled={isCreatingResource}
                            ></textarea>
                        </div>
                    ) : selectedResource ? (
                        // Edit mode - show content or URL based on what the resource contains
                        selectedResource?.content ? (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-sm font-medium">Content <RequiredItem /></span>
                                </label>
                                <textarea
                                    name="content"
                                    className="textarea textarea-bordered textarea-sm w-full h-32"
                                    placeholder="Enter content here..."
                                    required
                                    disabled={isCreatingResource}
                                    defaultValue={selectedResource.content}
                                    key={selectedResource._id}
                                ></textarea>
                            </div>
                        ) : (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-sm font-medium">URL</span>
                                </label>
                                <input
                                    type="url"
                                    name="url"
                                    className="input input-bordered input-sm"
                                    placeholder="https://example.com/resource"
                                    disabled={true}
                                    defaultValue={selectedResource?.url || ""}
                                    key={selectedResource._id}
                                />
                                <span className="label-text-alt text-gray-400 mt-1">URL cannot be edited</span>
                            </div>
                        )
                    ) : (
                        // Create mode - URL input
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-sm font-medium">URL <RequiredItem /></span>
                            </label>
                            <input
                                type="url"
                                name="url"
                                className="input input-bordered input-sm"
                                placeholder="https://example.com/resource"
                                required={inputType === 'url'}
                                disabled={isCreatingResource}
                            />
                        </div>
                    )}
                    
                    {/* Chunking Settings Section */}
                    {!selectedResource && (
                        <div className="space-y-4">
                            {/* Collection Settings Toggle */}
                            {activeCollection?.settings?.chunkSize && (
                                <div className="form-control">
                                    <label className="label cursor-pointer">
                                        <span className="label-text text-sm font-medium">Use Collection Chunking Settings</span>
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-primary toggle-sm"
                                            checked={useCollectionSettings}
                                            onChange={(e) => setUseCollectionSettings(e.target.checked)}
                                            disabled={isCreatingResource}
                                        />
                                    </label>
                                    {useCollectionSettings && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Using: {activeCollection.settings.chunkingType || 'default'} chunking, size: {activeCollection.settings.chunkSize}
                                            {activeCollection.settings.chunkOverlap && activeCollection.settings.chunkingType === 'semantic' && `, overlap: ${activeCollection.settings.chunkOverlap}`}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Manual Chunking Settings */}
                            {!useCollectionSettings && (
                                <>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-sm font-medium">Chunking Type</span>
                                        </label>
                                        <select
                                            name="chunkingType"
                                            className="select select-bordered select-sm"
                                            value={chunkingType}
                                            onChange={(e) => setChunkingType(e.target.value)}
                                            disabled={isCreatingResource}
                                        >
                                            <option value="recursive">Recursive</option>
                                            <option value="semantic">Semantic</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                    </div>
                                    
                                    {chunkingType === 'custom' ? (
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-sm font-medium">Chunking URL</span>
                                            </label>
                                            <input
                                                type="url"
                                                name="chunkingUrl"
                                                className="input input-bordered input-sm"
                                                placeholder="https://example.com/chunking-service"
                                                disabled={isCreatingResource}
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text text-sm font-medium">Chunk Size</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="chunkSize"
                                                    className="input input-bordered input-sm"
                                                    min={1}
                                                    required
                                                    defaultValue={4000}
                                                    disabled={isCreatingResource}
                                                />
                                            </div>
                                            
                                            {chunkingType === 'semantic' && (
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text text-sm font-medium">Chunk Overlap</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="chunkingOverlap"
                                                        className="input input-bordered input-sm"
                                                        min={0}
                                                        defaultValue={200}
                                                        disabled={isCreatingResource}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                            
                            {/* Collection Settings Display (Read-only) */}
                            {useCollectionSettings && activeCollection?.settings && (
                                <div className="space-y-3">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-sm font-medium">Chunking Type</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered input-sm"
                                            value={activeCollection.settings.chunkingType}
                                            disabled={true}
                                        />
                                    </div>
                                    
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-sm font-medium">Chunk Size</span>
                                        </label>
                                        <input
                                            type="number"
                                            className="input input-bordered input-sm"
                                            value={activeCollection.settings.chunkSize}
                                            disabled={true}
                                        />
                                    </div>
                                    
                                    {activeCollection.settings.chunkOverlap !== undefined && activeCollection.settings.chunkingType === 'semantic' && (
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-sm font-medium">Chunk Overlap</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="input input-bordered input-sm"
                                                value={activeCollection.settings.chunkOverlap}
                                                disabled={true}
                                            />
                                        </div>
                                    )}
                                    
                                    {activeCollection.settings.chunkingUrl && (
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-sm font-medium">Chunking URL</span>
                                            </label>
                                            <input
                                                type="url"
                                                className="input input-bordered input-sm"
                                                value={activeCollection.settings.chunkingUrl}
                                                disabled={true}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={handleClose}
                            disabled={isCreatingResource}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={isCreatingResource}
                        >
                            {isCreatingResource ? (selectedResource ? "Updating..." : "Adding...") : (selectedResource ? "Update Resource" : "Add Resource")}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default KnowledgeBaseResourceModal;
