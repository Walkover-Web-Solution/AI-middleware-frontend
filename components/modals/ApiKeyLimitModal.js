'use client';
import React, { useState, useEffect } from 'react';
import Modal from '@/components/UI/Modal';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';

const ApiKeyLimitModal = ({ data, onConfirm }) => {
  const [limit, setLimit] = useState(data?.bridge_quota?.limit);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (data && data.bridge_quota?.limit) {
      setLimit(data.bridge_quota.limit);
    } else {
      setLimit('');
    }
  }, [data]);

  const handleClose = () => {
    closeModal(MODAL_TYPE.API_KEY_LIMIT_MODAL);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!limit || isNaN(parseInt(limit))) {
      setError('Please enter a valid number for the limit');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onConfirm(data, parseInt(limit));
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to set API key limit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal MODAL_ID={MODAL_TYPE.API_KEY_LIMIT_MODAL}>
      <div className="flex items-center justify-center">
        <div 
          className="min-w-[25rem] max-w-[50rem] bg-base-100 border border-base-300 rounded-lg p-6 mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col space-y-1 text-center sm:text-left">
            <h2 className="text-lg font-semibold text-base-content">
              Set Usage Limit
            </h2>
            <p className="text-sm text-base-content flex items-center gap-2">
              Set a usage limit for the: {data?.name}
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Limit in $</span>
              </label>
              <input
                type="number"
                placeholder="Enter limit"
                className="input input-bordered w-full"
                value={limit || ''}
                onChange={(e) => setLimit(e.target.value)}
                min="0"
              />
              {error && <p className="text-error text-sm mt-1">{error}</p>}
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="btn mt-3 sm:mt-0"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Limit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default ApiKeyLimitModal;
