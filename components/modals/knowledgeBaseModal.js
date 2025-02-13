'use client';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import { createKnowledgeBaseEntryAction, updateKnowledgeBaseEntryAction } from '@/store/action/knowledgeBaseAction';

const KnowledgeBaseModal = ({ orgId, isEditing, selectedTale, setSelectedTale, setIsEditing, taleData }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: selectedTale?.name || '',
    description: selectedTale?.description || '',
    doc_url: selectedTale?.url || '',
    sectionType: 'default',
    chunking_type: null,
    chunk_size: selectedTale?.chunk_size || 1000, 
    chunk_overlap: selectedTale?.chunk_overlap || 200
  });
  
  const sectionTypes = [
    { value: 'default', label: 'Default' },
    { value: 'custom', label: 'Custom' }
  ];

  const customSections = [
    { value: 'semantic_chunking', label: 'Semantic Chunking' },
    { value: 'manual_chunking', label: 'Manual Chunking' },
    { value: 'recursive_chunking', label: 'Recursive Chunking' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'chunk_size' || name === 'chunk_overlap' ? Number(value) : value,
      ...(name === 'sectionType' && value === 'default' && { chunking_type: null })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      orgId,
      name: formData.name,
      description: formData.description,
      doc_url: formData.doc_url,
      chunking_type: formData.chunking_type,
      chunk_size: formData.chunk_size,
      chunk_overlap: formData.chunk_overlap
    };

    dispatch(createKnowledgeBaseEntryAction(payload));
    closeModal(MODAL_TYPE.KNOWLEDGE_BASE_MODAL);
  };

  return (
    <dialog id={MODAL_TYPE.KNOWLEDGE_BASE_MODAL} className="modal backdrop-blur-sm">
      <div className="modal-box w-11/12 max-w-5xl bg-gradient-to-br from-base-100 to-base-200 shadow-2xl">
        <h3 className="font-bold text-2xl mb-6">
          {isEditing ? 'Edit Knowledge Base Entry' : 'Add New Knowledge Base Entry'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg font-medium">Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg font-medium">URL</span>
              </label>
              <input
                type="url"
                name="doc_url"
                value={formData.doc_url}
                onChange={handleChange}
                className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-lg font-medium">Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full focus:ring-2 focus:ring-primary focus:border-primary"
              rows="4"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg font-medium">Chunk Type</span>
              </label>
              <select
                name="sectionType"
                value={formData.sectionType}
                onChange={handleChange}
                className="select select-bordered w-full focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                {sectionTypes.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.sectionType === 'custom' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-medium">Chunking type</span>
                </label>
                <select
                  name="chunking_type"
                  value={formData.chunking_type || ''}
                  onChange={handleChange}
                  className="select select-bordered w-full focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                >
                  {customSections.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {(formData.chunking_type === 'manual_chunking' || formData.chunking_type === 'recursive_chunking') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-medium">Chunk Size</span>
                </label>
                <input
                  type="number"
                  name="chunk_size"
                  value={formData.chunk_size}
                  onChange={handleChange}
                  className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                  min="100"
                  max="10000"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-medium">Chunk Overlap</span>
                </label>
                <input
                  type="number"
                  name="chunk_overlap"
                  value={formData.chunk_overlap}
                  onChange={handleChange}
                  className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                  min="0"
                  max="1000"
                />
              </div>
            </div>
          )}

          <div className="modal-action mt-8">
            <button 
              type="button" 
              className="btn btn-ghost hover:bg-base-300 text-lg" 
              onClick={() => closeModal(MODAL_TYPE.KNOWLEDGE_BASE_MODAL)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary text-lg hover:bg-primary-focus"
            >
              {isEditing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default KnowledgeBaseModal;
