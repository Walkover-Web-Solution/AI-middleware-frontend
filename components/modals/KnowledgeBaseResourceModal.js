"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import Modal from "@/components/UI/Modal";
import { MODAL_TYPE } from "@/utils/enums";
import { closeModal, RequiredItem } from "@/utils/utility";
import { createResourceAction, updateResourceAction } from "@/store/action/knowledgeBaseAction";

const KnowledgeBaseResourceModal = ({ activeCollection, selectedResource, setSelectedResource = () => { } }) => {
    const dispatch = useDispatch();
    const [isCreatingResource, setIsCreatingResource] = useState(false);
    const [inputType, setInputType] = useState('url'); // 'url', 'file', 'content'
    const [chunkingType, setChunkingType] = useState('recursive');

    React.useEffect(() => {
        if (selectedResource?.settings?.chunkingType) {
            setChunkingType(selectedResource.settings.chunkingType);
        } else {
            setChunkingType('recursive');
        }
    }, [selectedResource]);

    const handleCreateResource = async (event) => {
        event.preventDefault();
        if (!activeCollection?.collection_id) return;
        setIsCreatingResource(true);
        const formData = new FormData(event.target);

        const settings = {
            chunkSize: Number(formData.get("chunkSize")) || 0,
        };
        const chunkingUrl = (formData.get("chunkingUrl") || "").trim();
        const chunkingType = formData.get("chunkingType");
        const chunkingOverlap = Number(formData.get("chunkingOverlap"));

        if (chunkingUrl) settings.chunkingUrl = chunkingUrl;
        if (chunkingType) settings.chunkingType = chunkingType;
        if (chunkingOverlap) settings.chunkingOverlap = chunkingOverlap;

        let content = "";
        let resourceUrl = "";

        if (inputType === 'file') {
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
        } else if (inputType === 'content') {
            content = (formData.get("content") || "").trim();
            resourceUrl = "Manual Content";
        } else {
            resourceUrl = (formData.get("url") || "").trim();
            content = resourceUrl;
        }

        const payload = {
            collectionId: activeCollection.collection_id,
            title: (formData.get("title") || "").trim(),
            url: resourceUrl,
            content: content,
            settings: settings,
        };

        const result = await dispatch(createResourceAction(payload, activeCollection));
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
        const updatedUrl = (formData.get("url") || "").trim();
        const settings = {};
        const chunkingUrl = (formData.get("chunkingUrl") || "").trim();
        const chunkingType = formData.get("chunkingType");
        const chunkingOverlap = Number(formData.get("chunkingOverlap"));

        if (chunkingUrl) settings.chunkingUrl = chunkingUrl;
        if (chunkingType) settings.chunkingType = chunkingType;
        if (chunkingOverlap) settings.chunkingOverlap = chunkingOverlap;

        const payload = {
            title: (formData.get("title") || "").trim(),
            settings: settings,
        };

        const result = await dispatch(updateResourceAction(selectedResource._id, payload, activeCollection));
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
                                name="file"
                                className="file-input file-input-bordered file-input-sm w-full"
                                required
                                disabled={isCreatingResource}
                                accept=".txt,.md,.csv,.json"
                            />
                            <span className="label-text-alt text-gray-400 mt-1">Supported formats: .txt, .md, .csv, .json (Text content will be extracted)</span>
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
                    ) : (
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
                                disabled={isCreatingResource || selectedResource}
                                defaultValue={selectedResource?.url || selectedResource?.content || ""}
                                key={selectedResource?._id || "new"}
                            />
                        </div>
                    )}
                    {!selectedResource && (
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
                    )}
                    {!selectedResource && (
                        <>
                            {chunkingType === 'custom' && (
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
                                        defaultValue={selectedResource?.settings?.chunkingUrl || ""}
                                        key={`chunkingUrl-${selectedResource?._id || "new"}`}
                                    />
                                </div>
                            )}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-sm font-medium">Chunking Type</span>
                                </label>
                                <select
                                    name="chunkingType"
                                    className="select select-bordered select-sm"
                                    disabled={isCreatingResource}
                                    value={chunkingType}
                                    onChange={(e) => setChunkingType(e.target.value)}
                                >
                                    <option value="custom">Custom</option>
                                    <option value="semantic">Semantic</option>
                                    <option value="recursive">Recursive</option>
                                </select>
                            </div>
                            {chunkingType === 'semantic' && (
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text text-sm font-medium">Chunking Overlap</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="chunkingOverlap"
                                        className="input input-bordered input-sm"
                                        min={0}
                                        placeholder="0"
                                        disabled={isCreatingResource}
                                        defaultValue={selectedResource?.settings?.chunkingOverlap || 0}
                                        key={`chunkingOverlap-${selectedResource?._id || "new"}`}
                                    />
                                </div>
                            )}
                        </>
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
