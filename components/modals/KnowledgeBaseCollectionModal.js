"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Modal from "@/components/UI/Modal";
import { MODAL_TYPE } from "@/utils/enums";
import { closeModal, RequiredItem } from "@/utils/utility";
import { createCollectionAction } from "@/store/action/knowledgeBaseAction";

const KnowledgeBaseCollectionModal = ({ collections = [] }) => {
    const dispatch = useDispatch();
    const [isCreatingCollection, setIsCreatingCollection] = useState(false);
    const [chunkingType, setChunkingType] = useState('none');

    const denseModelOptions = [
        "BAAI/bge-large-en-v1.5",
        "BAAI/bge-small-en-v1.5",
    ];
    const sparseModelOptions = [
        "Qdrant/bm25",
    ];
    const rerankerModelOptions = [
        "colbert-ir/colbertv2.0",
    ];

    const handleCreateCollection = async (event) => {
        event.preventDefault();
        setIsCreatingCollection(true);
        const formData = new FormData(event.target);
        const chunkingTypeValue = formData.get("chunkingType");
        
        const sparseModelValue = formData.get("sparseModel");
        const rerankerModelValue = formData.get("rerankerModel");
        
        const payload = {
            name: (formData.get("name") || "").trim(),
            settings: {
                denseModel: formData.get("denseModel"),
                ...(sparseModelValue && sparseModelValue.trim() !== "" && {
                    sparseModel: sparseModelValue,
                }),
                ...(rerankerModelValue && rerankerModelValue.trim() !== "" && {
                    rerankerModel: rerankerModelValue,
                }),
                ...(chunkingTypeValue !== 'none' && {
                    chunkSize: Number(formData.get("chunkSize")) || 0,
                    chunkOverlap: Number(formData.get("chunkOverlap")) || 0,
                    chunkingType: chunkingTypeValue,
                }),
            },
        };

        const normalizeValue = (value) => {
            if (value === undefined || value === null || value === "") return null;
            return value;
        };
        const normalizeSettings = (settings) => ({
            denseModel: normalizeValue(settings?.denseModel),
            sparseModel: normalizeValue(settings?.sparseModel),
            rerankerModel: normalizeValue(settings?.rerankerModel),
            ...(settings?.chunkingType && settings.chunkingType !== 'none' && {
                chunkSize: Number(settings?.chunkSize) || 0,
                chunkOverlap: Number(settings?.chunkOverlap) || 0,
                chunkingType: normalizeValue(settings?.chunkingType),
            }),
        });

        // Check duplicates locally before dispatching
        const targetSettings = normalizeSettings(payload.settings);
        const hasDuplicate = collections.some((collection) => {
            const existing = normalizeSettings(collection?.settings);
            return (
                existing.denseModel === targetSettings.denseModel &&
                existing.sparseModel === targetSettings.sparseModel &&
                existing.rerankerModel === targetSettings.rerankerModel &&
                (existing.chunkSize || 0) === (targetSettings.chunkSize || 0) &&
                (existing.chunkOverlap || 0) === (targetSettings.chunkOverlap || 0) &&
                (existing.chunkingType || null) === (targetSettings.chunkingType || null)
            );
        });
        if (hasDuplicate) {
            toast.error("This collection configuration already exists for the org.");
            setIsCreatingCollection(false);
            return;
        }

        const result = await dispatch(createCollectionAction(payload));
        if (result?.success) {
            closeModal(MODAL_TYPE.KNOWLEDGE_BASE_COLLECTION_MODAL);
            event.target.reset();
        }
        setIsCreatingCollection(false);
    };

    return (
        <Modal MODAL_ID={MODAL_TYPE.KNOWLEDGE_BASE_COLLECTION_MODAL}>
            <div className="modal-box w-11/12 max-w-4xl border-2 border-base-300">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-300">
                    <h3 className="font-bold text-lg">Create Collection</h3>
                    <button
                        onClick={() => closeModal(MODAL_TYPE.KNOWLEDGE_BASE_COLLECTION_MODAL)}
                        className="btn btn-circle btn-ghost btn-sm"
                        disabled={isCreatingCollection}
                    >
                        ✕
                    </button>
                </div>
                <form onSubmit={handleCreateCollection} className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-sm font-medium">Collection Name <RequiredItem /></span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            className="input input-bordered input-sm"
                            placeholder="Enter collection name"
                            required
                            maxLength={60}
                            disabled={isCreatingCollection}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-control">
                            <label className="label items-start p-0 pb-2">
                                <span className="label-text text-sm font-medium flex items-center flex-wrap">
                                    Embedding Model <RequiredItem />
                                </span>
                            </label>
                            <select
                                name="denseModel"
                                className="select select-bordered select-sm"
                                required
                                disabled={isCreatingCollection}
                                defaultValue=""
                            >
                                <option value="" disabled>Select embedding model</option>
                                {denseModelOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label items-start">
                                <span className="label-text text-sm font-medium flex items-center flex-wrap">
                                    Keyword Search Model <span className="badge badge-ghost badge-sm ml-2">Optional</span>
                                </span>
                            </label>
                            <select
                                name="sparseModel"
                                className="select select-bordered select-sm"
                                disabled={isCreatingCollection}
                                defaultValue=""
                            >
                                <option value="">Select keyword search model</option>
                                {sparseModelOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label items-start">
                                <span className="label-text text-sm font-medium flex items-center flex-wrap">
                                    Result Ranking Model <span className="badge badge-ghost badge-sm ml-2">Optional</span>
                                </span>
                            </label>
                            <select
                                name="rerankerModel"
                                className="select select-bordered select-sm"
                                disabled={isCreatingCollection}
                                defaultValue=""
                            >
                                <option value="">Select result ranking model</option>
                                {rerankerModelOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-sm font-medium">Chunking Type</span>
                            </label>
                            <select
                                name="chunkingType"
                                className="select select-bordered select-sm"
                                required
                                disabled={isCreatingCollection}
                                value={chunkingType}
                                onChange={(e) => setChunkingType(e.target.value)}
                            >
                                <option value="none">None</option>
                                <option value="recursive">Recursive</option>
                                <option value="semantic">Semantic</option>
                            </select>
                        </div>
                        {chunkingType !== 'none' && (
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
                                    defaultValue={1000}
                                    disabled={isCreatingCollection}
                                />
                            </div>
                        )}
                        {chunkingType === 'semantic' && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-sm font-medium">Chunk Overlap</span>
                                </label>
                                <input
                                    type="number"
                                    name="chunkOverlap"
                                    className="input input-bordered input-sm"
                                    min={0}
                                    required
                                    defaultValue={100}
                                    disabled={isCreatingCollection}
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => closeModal(MODAL_TYPE.KNOWLEDGE_BASE_COLLECTION_MODAL)}
                            disabled={isCreatingCollection}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={isCreatingCollection}
                        >
                            {isCreatingCollection ? "Creating..." : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default KnowledgeBaseCollectionModal;
