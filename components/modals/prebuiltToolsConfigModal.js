import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../UI/Modal';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';

const PrebuiltToolsConfigModal = ({ initialDomains = [], onSave }) => {
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize domains when modal opens
  useEffect(() => {
    setDomains(initialDomains.length > 0 ? [...initialDomains] : []);
    setHasChanges(false); // Reset changes when modal opens
  }, [initialDomains]);

  // Check for changes whenever domains array changes
  useEffect(() => {
    const domainsChanged = JSON.stringify(domains.sort()) !== JSON.stringify([...initialDomains].sort());
    setHasChanges(domainsChanged);
  }, [domains, initialDomains]);

  // Validate URL or Domain
  const isValidUrlOrDomain = (input) => {
    const trimmedInput = input.trim();
    
    // Reject if input is too short or contains spaces
    if (trimmedInput.length < 3 || trimmedInput.includes(' ')) {
      return false;
    }
    
    // URL regex pattern (starts with http:// or https://)
    const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    
    // Domain regex pattern (without protocol) - must have at least one dot and valid TLD
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    
    const isUrl = urlPattern.test(trimmedInput);
    const isDomain = domainPattern.test(trimmedInput);
    
    console.log('Validating:', trimmedInput, 'URL:', isUrl, 'Domain:', isDomain);
    
    return isUrl || isDomain;
  };

  // Add new domain
  const handleAddDomain = () => {
    const trimmedDomain = newDomain.trim();
    
    if (!trimmedDomain) {
      setValidationError('Please enter a URL or domain');
      return;
    }
    
    if (!isValidUrlOrDomain(trimmedDomain)) {
      setValidationError('Please enter a valid URL or domain');
      return;
    }
    
    if (domains.includes(trimmedDomain)) {
      setValidationError('This URL/domain already exists');
      return;
    }
    
    setDomains([...domains, trimmedDomain]);
    setNewDomain('');
    setValidationError(''); // Clear error on success
  };

  // Handle input change
  const handleInputChange = (e) => {
    setNewDomain(e.target.value);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  // Handle Enter key press in input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDomain();
    }
  };

  // Remove domain at specific index
  const handleRemoveDomain = (index) => {
    const updatedDomains = domains.filter((_, i) => i !== index);
    setDomains(updatedDomains);
  };

  // Handle save
  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Filter out empty domains
      const filteredDomains = domains.filter(domain => domain.trim() !== '');
      await onSave(filteredDomains);
      closeModal(MODAL_TYPE.PREBUILT_TOOLS_CONFIG_MODAL);
    } catch (error) {
      console.error('Error saving prebuilt tools configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    closeModal(MODAL_TYPE.PREBUILT_TOOLS_CONFIG_MODAL);
  };

  return (
    <Modal MODAL_ID={MODAL_TYPE.PREBUILT_TOOLS_CONFIG_MODAL}>
      <div className="fixed max-w-11/12 inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-low-medium overflow-auto h-auto bg-base-100">
        {/* Header */}
        <div className='bg-base-100 mb-auto mt-auto rounded-lg shadow-2xl flex flex-col p-6 transition-all duration-300 ease-in-out animate-fadeIn'>
        <div className="flex items-center justify-between border-b border-base-300">
          <h3 className="font-bold text-xl mb-4">Configure Web Search</h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <div className="form-control">
              <label className="label !px-0">
                <span className="label-text font-medium text-md">Allowed Domains</span>
              </label>
              <p className="text-xs text-base-content/60 mb-3">
                Add domains to filter Web Search. Leave empty to allow all domains.
              </p>
            </div>

            {/* Add New Domain Input */}
            <div className="form-control mb-4">
              <label className="label !px-0">
                <span className="label-text text-sm font-medium">Add New Domain</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="domain"
                  value={newDomain}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter domain (example.com)"
                  className={`input input-bordered input-sm flex-1 focus:ring-1 ring-primary/40 ${
                    validationError ? 'input-error border-error' : ''
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleAddDomain}
                  className="btn btn-primary btn-sm"
                  disabled={isLoading || !newDomain.trim()}
                  title="Add URL or domain"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
              {validationError && (
                <div className="label">
                  <span className="label-text-alt text-error">{validationError}</span>
                </div>
              )}
            </div>

            {/* Domain List */}
            {domains.length > 0 && (
              <div className="space-y-2 mb-4">
                <label className="label !px-0">
                  <span className="label-text text-sm font-medium">Current Domains ({domains.length})</span>
                </label>
                {domains.map((domain, index) => (
                  <div key={index} className="flex items-center gap-2 bg-base-200 rounded-lg p-3 border border-base-300">
                    <div className="flex-1">
                      <span className="text-sm text-base-content font-medium">{domain}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDomain(index)}
                      className="btn btn-ghost btn-xs p-1 hover:bg-red-100 hover:text-error"
                      title="Remove domain"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="btn btn-sm hover:text-base-content"
              onClick={handleClose}
              disabled={isLoading}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-primary hover:bg-primary-focus"
              disabled={isLoading || !hasChanges}
            >
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </Modal>
  );
};

export default PrebuiltToolsConfigModal;
