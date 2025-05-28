import { useCustomSelector } from '@/customHooks/customSelector'
import { updateBridgeAction } from '@/store/action/bridgeAction'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

const PublicAgentForm = ({params}) => {
    const { bridge } = useCustomSelector((state) => ({
      bridge: state.bridgeReducer.allBridgesMap?.[params?.id]?.page_id
    }))
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    url_slugname: bridge?.url_slugname ||  '',
    availability: bridge?.availability || 'private',
    description: bridge?.description || ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      const { newEmail, ...page_id } = formData
      const dataToSend = { page_config: page_id }
      await dispatch(updateBridgeAction({bridgeId: params?.id, dataToSend}))
      toast.success('Configuration saved successfully')
    } catch (error) {
      toast.error('Failed to save configuration')
      console.error('Save error:', error)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Slug Name <span className="text-red-500">*</span> (must be globally unique)</span>
        </label>
        <input 
          type="text"
          name="url_slugname"
          placeholder="Enter a unique slug name"
          className="input input-bordered w-full max-w-xs"
          value={formData.slug_name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Slug Name <span className="text-red-500">*</span> (must be globally unique)</span>
        </label>
        <input 
          type="text"
          name="description"
          placeholder="Enter a description"
          className="input input-bordered w-full max-w-xs"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Visibility</span>
        </label>
        <select 
          className="select select-bordered w-full max-w-xs"
          name="availability"
          value={formData.availability}
          onChange={handleChange}
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
      </div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Allowed Users</span>
        </label>
        
        {/* Chips display */}
        {formData.allowedUsers?.length > 0 && (
          <div className="flex flex-wrap gap-3 p-2 min-h-[40px] bg-white rounded-lg">
            {formData.allowedUsers.map((user, index) => (
              <div 
                key={index} 
                className="badge badge-primary gap-2 py-3 px-4 rounded-full shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-sm font-medium">{user}</span>
                <button 
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      allowedUsers: prev.allowedUsers.filter((_, i) => i !== index)
                    }))
                  }}
                  className="hover:bg-primary-focus rounded-full p-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Email input field */}
        <div className="flex items-center gap-2">
          <input
            type="email" 
            placeholder="Enter email address"
            className="input input-bordered join-item w-4/5"
            value={formData.newEmail || ''}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                newEmail: e.target.value
              }))
            }}
          />
          <button 
            className="btn bg-primary rounded-md text-white w-1/5"
            onClick={() => {
              if (formData.newEmail && formData.newEmail.includes('@')) {
                setFormData(prev => ({
                  ...prev,
                  allowedUsers: [...(prev.allowedUsers || []), prev.newEmail],
                  newEmail: ''
                }))
              }
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button 
          className="btn btn-primary"
          onClick={handleSave}
          // disabled={!formData.url_slugname}
        >
          Save Configuration
        </button>
      </div>
    </div>
  )
}

export default PublicAgentForm