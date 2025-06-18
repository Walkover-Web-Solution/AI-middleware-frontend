import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { CircleX } from 'lucide-react';
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const PublicAgentForm = ({ params }) => {
  const dispatch = useDispatch();
  const { bridge } = useCustomSelector((state) => ({
    bridge: state.bridgeReducer.allBridgesMap?.[params?.id]?.page_config
  }))

  const [formData, setFormData] = useState({
    url_slugname: bridge?.url_slugname ||  '',
    availability: bridge?.availability || 'public',
    description: bridge?.description || "",
    allowedUsers: bridge?.allowedUsers || [],
    newEmail: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    let processedValue = value
    
    // Replace spaces with _ for url_slugname field
    if (name === 'url_slugname') {
      processedValue = value.replace(/\s+/g, '_')
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
  }

  const handleAddEmail = () => {
    if (formData.newEmail && formData.newEmail.includes('@')) {
      setFormData(prev => ({
        ...prev,
        allowedUsers: [...(prev.allowedUsers || []), prev.newEmail],
        newEmail: ''
      }))
    }
  }

  const handleRemoveUser = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      allowedUsers: prev.allowedUsers.filter((_, i) => i !== indexToRemove)
    }))
  }

  const handleSave = async () => {
    try {
      let { newEmail, ...page_config } = formData
      let allowedUsers = []
      if (page_config?.availability === 'private') {
        allowedUsers = formData?.allowedUsers
      }
      const dataToSend = { ...page_config, ...(page_config?.availability === 'private' ? { allowedUsers } : {}) }
      await dispatch(updateBridgeAction({bridgeId: params?.id, dataToSend}))
      toast.success('Configuration saved successfully')
    } catch (error) {
      toast.error('Failed to save configuration')
      console.error('Save error:', error)
    }
  }

  return (
    <div className="max-w-full mx-auto p-6 bg-base-100">
      <div className="space-y-6">
        {/* Slug Name Field */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">
              Slug Name <span className="text-error">*</span>
            </span>
            <span className="label-text-alt text-xs text-base-content/60">
              Must be globally unique
            </span>
          </label>
          <input 
            type="text"
            name="url_slugname"
            placeholder="Enter a unique slug name"
            className="input input-bordered w-full"
            value={formData.url_slugname}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description Field */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Description</span>
          </label>
          <textarea 
            name="description"
            placeholder="Enter a description"
            className="textarea textarea-bordered w-full h-20"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Visibility Field */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Visibility</span>
          </label>
          <select 
            className="select select-bordered w-full"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>

        {/* Allowed Users Field - Only show when private */}
        {formData.availability === 'private' && (
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Allowed Users</span>
            </label>
            
            {/* Display existing users as badges */}
            {formData.allowedUsers?.length > 0 && (
              <div className="mb-3 p-3 bg-base-200 rounded-lg min-h-[3rem]">
                <div className="flex flex-wrap gap-2">
                  {formData.allowedUsers.map((user, index) => (
                    <div 
                      key={index} 
                      className="badge badge-outline gap-2 py-3 px-3"
                    >
                      <span className="text-sm">{user}</span>
                      <button 
                        onClick={() => handleRemoveUser(index)}
                        className="hover:text-error transition-colors"
                        type="button"
                      >
                        <CircleX className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email input and add button */}
            <div className="join w-full">
              <input
                type="email" 
                placeholder="Enter email address"
                className="input input-bordered join-item flex-1"
                value={formData.newEmail || ''}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    newEmail: e.target.value
                  }))
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddEmail()
                  }
                }}
              />
              <button 
                type="button"
                className="btn join-item"
                onClick={handleAddEmail}
                disabled={!formData.newEmail || !formData.newEmail.includes('@')}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="form-control pt-4">
          <button 
            type="button"
            className="btn btn-neutral w-full"
            onClick={handleSave}
            disabled={!formData.url_slugname.trim()}
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  )
}

export default PublicAgentForm