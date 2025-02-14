'use client';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { KNOWLEDGE_BASE_CUSTOM_SECTION, KNOWLEDGE_BASE_SECTION_TYPES, MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import { createKnowledgeBaseEntryAction } from '@/store/action/knowledgeBaseAction';

const KnowledgeBaseModal = ({ params }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSectionType, setSelectedSectionType] = useState('default');
  const [chunkingType, setChunkingType] = useState('');

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target);

    try {
      const payload = {
        orgId: params?.org_id,
        name: formData.get('name'),
        description: formData.get('description'),
        doc_url: formData.get('doc_url'),
        sectionType: formData.get('sectionType'),
        chunking_type: formData.get('chunking_type'),
        chunk_size: Number(formData.get('chunk_size')) || null,
        chunk_overlap: Number(formData.get('chunk_overlap')) || null
      };

      if (payload.sectionType === 'default') {
        payload.chunking_type = null;
        payload.chunk_size = null;
        payload.chunk_overlap = null;
      }

      await dispatch(createKnowledgeBaseEntryAction(payload));
      closeModal(MODAL_TYPE.KNOWLEDGE_BASE_MODAL);
      event.target.reset();
    } finally {
      setSelectedSectionType("default");
      setChunkingType("");
      setIsLoading(false);
    }
  }, [dispatch, params.org_id]);

  const handleClose = useCallback(() => {
    closeModal(MODAL_TYPE.KNOWLEDGE_BASE_MODAL);
  }, []);

  return (
    <dialog id={MODAL_TYPE.KNOWLEDGE_BASE_MODAL} className="modal backdrop-blur-sm">
      <div className="modal-box w-11/12 max-w-3xl bg-gradient-to-br from-base-100 via-[#f4f4f5] to-base-200 shadow-2xl border-2 border-primary/20">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-base-300">
          <h3 className="font-bold text-xl">New Knowledge Base Configuration</h3>
          <button
            onClick={handleClose}
            className="btn btn-circle btn-ghost btn-sm"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 p-4 bg-base-200 rounded-lg">
            <div className="space-y-4">
              <div className="form-control">
                <label className="label !px-0">
                  <span className="label-text text-sm font-medium text-base-content/70">Knowledge Base Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered input-md focus:ring-1 ring-primary/40"
                  placeholder="Enter knowledge base name"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-control">
                <label className="label !px-0">
                  <span className="label-text text-sm font-medium text-base-content/70">Google Documentation URL</span>
                </label>
                <input
                  type="url"
                  name="doc_url"
                  className="input input-bordered input-md focus:ring-1 ring-primary/40"
                  placeholder="https://example.com/documentation"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-control">
                <label className="label !px-0">
                  <span className="label-text text-sm font-medium text-base-content/70">Description</span>
                </label>
                <textarea
                  name="description"
                  className="textarea textarea-bordered h-14 focus:ring-1 ring-primary/40"
                  placeholder="Describe the purpose and content of this knowledge base..."
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 bg-base-200 rounded-lg">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label !px-0">
                    <span className="label-text text-sm font-medium text-base-content/70">Processing Method</span>
                  </label>
                  <select
                    name="sectionType"
                    defaultValue="default"
                    className="select select-bordered select-md focus:ring-1 ring-primary/40"
                    required
                    disabled={isLoading}
                    onChange={(e) => setSelectedSectionType(e.target.value)}
                  >
                    {KNOWLEDGE_BASE_SECTION_TYPES.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {selectedSectionType === 'custom' && (
                  <div className="form-control">
                    <label className="label !px-0">
                      <span className="label-text text-sm font-medium text-base-content/70">Chunking Type</span>
                    </label>
                    <select
                      name="chunking_type"
                      className="select select-bordered select-md focus:ring-1 ring-primary/40"
                      required={selectedSectionType === 'custom'}
                      disabled={isLoading}
                      defaultValue=""
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

              {selectedSectionType === 'custom' && chunkingType !== 'semantic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label !px-0">
                      <span className="label-text text-sm font-medium text-base-content/70">Chunk Size</span>
                    </label>
                    <input
                      type="number"
                      name="chunk_size"
                      className="input input-bordered input-md focus:ring-1 ring-primary/40"
                      required={selectedSectionType === 'custom'}
                      min="100"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label !px-0">
                      <span className="label-text text-sm font-medium text-base-content/70">Chunk Overlap</span>
                    </label>
                    <input
                      type="number"
                      name="chunk_overlap"
                      className="input input-bordered input-md focus:ring-1 ring-primary/40"
                      required={selectedSectionType === 'custom'}
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
            <button
              type="button"
              className="btn btn-ghost btn-sm px-6 text-base-content/70 hover:text-base-content"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm px-6 text-white hover:bg-primary-focus"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Knowledge Base'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default KnowledgeBaseModal;
