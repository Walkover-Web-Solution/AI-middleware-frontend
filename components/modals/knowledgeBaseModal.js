'use client';
import { useCallback, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { KNOWLEDGE_BASE_CUSTOM_SECTION, KNOWLEDGE_BASE_SECTION_TYPES, MODAL_TYPE } from '@/utils/enums';
import { closeModal, openModal, RequiredItem } from '@/utils/utility';
import { createKnowledgeBaseEntryAction, updateKnowledgeBaseAction } from '@/store/action/knowledgeBaseAction';
import Modal from '../UI/Modal';
import { toast } from 'react-toastify';

const KnowledgeBaseModal = ({ params, selectedKnowledgeBase = null, setSelectedKnowledgeBase = () => {}, knowledgeBaseData=[]}) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSectionType, setSelectedSectionType] = useState('default');
  const [chunkingType, setChunkingType] = useState('');
  const [file, setFile] = useState(null); // State to hold the uploaded file
  const [isUpload, setIsUpload] = useState(false); // State to toggle between link and upload

  const resetModal = useCallback(() => {
    setSelectedSectionType('default');
    setChunkingType('');
    setFile(null);
    setIsUpload(false);
    setIsLoading(false);
    setSelectedKnowledgeBase(null);
  }, [selectedKnowledgeBase]);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target);
    const newName = formData.get("name").trim();
    if (!newName) {
      toast.error('Please enter a valid name.');
      setIsLoading(false);
      return;
    }
    const newDescription = formData.get("description").trim();
    if (!newDescription) {
      toast.error('Please enter a valid description.');
      setIsLoading(false);
      return;
    }
    const isDuplicate = knowledgeBaseData.some(kb => 
      kb.name?.trim().toLowerCase() === newName.toLowerCase()?.trim() && kb._id !== selectedKnowledgeBase?._id
    );
    
    if (isDuplicate) {
      toast.error('Knowledge Base name already exists. Please choose a different name.');
      setIsLoading(false);
      return;
    }
    // Create payload object
    const payload = {
      orgId: params?.org_id,
      name: newName,
      description: newDescription,
    };

    if (selectedKnowledgeBase?._id) {
      payload.id = selectedKnowledgeBase._id;
    } else {
      payload.chunking_type = formData.get('chunking_type');
      payload.chunk_size = Number(formData.get('chunk_size')) || null;
      payload.chunk_overlap = Number(formData.get('chunk_overlap')) || null;

      if (payload.sectionType === 'default') {
        payload.chunking_type = null;
        payload.chunk_size = null;
        payload.chunk_overlap = null;
      }
    }

    // Convert payload to FormData
    const payloadFormData = new FormData();
    for (const key in payload) {
      if (payload[key] !== null) {
        payloadFormData.append(key, payload[key]);
      }
    }

    // Add file to FormData if present and not updating
    if (!selectedKnowledgeBase && isUpload && file) {
      payloadFormData.append('file', file);
    } else if (!selectedKnowledgeBase) {
      payloadFormData.append('url', formData.get('url'));
    }

    try {
      selectedKnowledgeBase ? await dispatch(updateKnowledgeBaseAction({ data: { data: payload, id: selectedKnowledgeBase?._id } }, params?.org_id)) : await dispatch(createKnowledgeBaseEntryAction(payloadFormData, params?.org_id));
      closeModal(MODAL_TYPE.KNOWLEDGE_BASE_MODAL);
      event.target.reset();
      resetModal();
      setFile(null); // Reset the file state after submission
    } finally {
      setSelectedSectionType("default");
      setChunkingType("");
      setIsLoading(false);
    }
  }, [dispatch, params.org_id, file, isUpload, selectedKnowledgeBase, knowledgeBaseData]);

  const handleClose = useCallback(() => {
    closeModal(MODAL_TYPE.KNOWLEDGE_BASE_MODAL);
    resetModal();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const validFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'csv'];

    if (selectedFile && validFileTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      alert('Please upload a valid file (PDF, Word, or CSV).');
      setFile(null);
    }
  };

  return (
    <Modal MODAL_ID={MODAL_TYPE.KNOWLEDGE_BASE_MODAL}>
      <div className="modal-box w-11/12 max-w-3xl border-2 border-base-300">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-300">
          <h3 className="font-bold text-xl">{selectedKnowledgeBase ? 'Update' : 'New'} Knowledge Base Configuration</h3>
          <button
            onClick={handleClose}
            className="btn btn-circle btn-ghost btn-sm"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 rounded-lg">
            <div className="space-y-2">
              <div className="form-control">
                <div className="label">
                  <span className="label-text font-medium text-md">Knowledge Base Name{RequiredItem()}</span>
                </div>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered input-md focus:ring-1 ring-primary/40"
                  placeholder="Enter knowledge base name"
                  required
                  disabled={isLoading}
                  key={selectedKnowledgeBase?._id}
                  defaultValue={selectedKnowledgeBase?.actual_name || ''}
                />
              </div>

              <div className="form-control">
                <label className="label !px-0">
                  <span className="label-text text-sm font-medium">Description{RequiredItem()}</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered h-14 focus:ring-1 ring-primary/40"
                  placeholder="Describe the purpose and content of this knowledge base..."
                  required
                  disabled={isLoading}
                  key={selectedKnowledgeBase?._id}
                  defaultValue={selectedKnowledgeBase?.description || ''}
                />
              </div>

              <div className="form-control">
                <label className="label !px-0">
                  <span className="label-text text-sm font-medium">Choose Upload Method </span>
                </label>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="uploadMethod"
                    value="link"
                    checked={!isUpload}
                    onChange={() => setIsUpload(false)}
                    className="radio mr-2"
                    disabled={selectedKnowledgeBase}
                  />
                  <span className="label-text">Link</span>
                  <input
                    type="radio"
                    name="uploadMethod"
                    value="upload"
                    checked={isUpload}
                    onChange={() => setIsUpload(true)}
                    className="radio ml-4 mr-2"
                    disabled={selectedKnowledgeBase}
                  />
                  <span className="label-text">Upload</span>
                </div>
              </div>

              {!isUpload ? (
                <div className="form-control">
                  <label className="label !px-0">
                    <span className="label-text text-sm font-medium">Google Documentation URL{RequiredItem()}</span>
                  </label>
                  <input
                    type="url"
                    name="url"
                    className="input input-bordered input-md focus:ring-1 ring-primary/40"
                    placeholder="https://example.com/documentation"
                    key={selectedKnowledgeBase?._id}
                    required={!selectedKnowledgeBase}
                    disabled={isLoading || selectedKnowledgeBase}
                    defaultValue={selectedKnowledgeBase?.source?.data?.url || ''}
                  />
                </div>
              ) : (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-sm font-medium">Upload Document (PDF, Word, CSV)</span>
                  </label>
                  <input
                    type="file"
                    name="file"
                    accept=".pdf, .doc, .docx, .csv"
                    className="file-input file-input-bordered file-input-sm w-full max-w-xs"
                    onChange={handleFileChange}
                    disabled={isLoading || selectedKnowledgeBase}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-lg">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label !px-0">
                    <span className="label-text text-sm font-medium">Processing Method </span>
                  </label>
                  <select
                    name="sectionType"
                    value={selectedSectionType}
                    className="select select-bordered select-md focus:ring-1 ring-primary/40"
                    required={!selectedKnowledgeBase}
                    disabled={isLoading || selectedKnowledgeBase}
                    onChange={(e) => setSelectedSectionType(e.target.value)}
                  >
                    {KNOWLEDGE_BASE_SECTION_TYPES?.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {selectedSectionType === 'custom' && (
                  <div className="form-control">
                    <label className="label !px-0">
                      <span className="label-text text-sm font-medium">Chunking Type</span>
                    </label>
                    <select
                      name="chunking_type"
                      className="select select-bordered select-md focus:ring-1 ring-primary/40"
                      required={selectedSectionType === 'custom' && !selectedKnowledgeBase}
                      disabled={isLoading || selectedKnowledgeBase}
                      value={chunkingType}
                      onChange={(e) => setChunkingType(e.target.value)}
                    >
                      <option value="" disabled>Select strategy</option>
                      {KNOWLEDGE_BASE_CUSTOM_SECTION?.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedSectionType === 'custom' && chunkingType !== 'semantic' && chunkingType && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label !px-0">
                      <span className="label-text text-sm font-medium text-base-content/70">Chunk Size{RequiredItem()}</span>
                    </label>
                    <input
                      type="number"
                      name="chunk_size"
                      className="input input-bordered input-md focus:ring-1 ring-primary/40"
                      required={selectedSectionType === 'custom' && !selectedKnowledgeBase}
                      min="100"
                      disabled={isLoading || selectedKnowledgeBase}
                      defaultValue={selectedKnowledgeBase?.chunk_size || ''}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label !px-0">
                      <span className="label-text text-sm font-medium text-base-content/70">Chunk Overlap{RequiredItem()}</span>
                    </label>
                    <input
                      type="number"
                      name="chunk_overlap"
                      className="input input-bordered input-md focus:ring-1 ring-primary/40"
                      required={selectedSectionType === 'custom' && !selectedKnowledgeBase}
                      min="0"
                      disabled={isLoading || selectedKnowledgeBase}
                      defaultValue={selectedKnowledgeBase?.chunk_overlap || ''}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="btn hover:text-base-content"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary hover:bg-primary-focus"
              disabled={isLoading}
            >
              {isLoading ? (selectedKnowledgeBase ? 'Updating...' : 'Creating...') : (selectedKnowledgeBase ? 'Update' : 'Create') + ' Knowledge Base'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default KnowledgeBaseModal;
