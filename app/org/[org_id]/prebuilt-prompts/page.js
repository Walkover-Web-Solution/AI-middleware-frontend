'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { PencilIcon, SaveIcon, RefreshIcon, CopyIcon } from '@/components/Icons';
import { useCustomSelector } from '@/customHooks/customSelector';
import { SaveAllIcon } from 'lucide-react';
import { resetPrebuiltPromptAction, updatePrebuiltPromptAction } from '@/store/action/prebuiltPromptAction';


export default function PrebuiltPromptsPage() {
  const dispatch = useDispatch();
  const prebuiltPrompts = useCustomSelector((state) => state.prebuiltPromptReducer.PrebuiltPrompts || []);
  
  // Convert array of objects to a more usable format
  const processedPrompts = React.useMemo(() => {
    const processed = {};
    prebuiltPrompts.forEach(promptObj => {
      const key = Object.keys(promptObj)[0];
      const value = promptObj[key];
      processed[key] = {
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `${key.replace(/_/g, ' ')} agent configuration`,
        prompt: value,
      };
    });
    return processed;
  }, [prebuiltPrompts]);

  const availableKeys = Object.keys(processedPrompts);
  const [selectedAgent, setSelectedAgent] = useState(availableKeys[0] || '');
  const [prompts, setPrompts] = useState({});
  const [isEditing, setIsEditing] = useState({});
  const [hasChanges, setHasChanges] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize prompts with actual data from reducer
  useEffect(() => {
    const initialPrompts = {};
    Object.keys(processedPrompts).forEach(key => {
      initialPrompts[key] = processedPrompts[key].prompt;
    });
    setPrompts(initialPrompts);
  }, [processedPrompts]);
  
  const handlePromptChange = (agentKey, value) => {
    setPrompts(prev => ({
      ...prev,
      [agentKey]: value
    }));
    setHasChanges(prev => ({
      ...prev,
      [agentKey]: value !== processedPrompts[agentKey]?.originalPrompt
    }));
  };

  // Dummy action for updating prebuilt prompts
  const updatePrebuiltPrompt = async (dataToUpdate) => {
    console.log(dataToUpdate,'dataToUpdate')
     dispatch(updatePrebuiltPromptAction(dataToUpdate));
  };

  // Dummy action for resetting prebuilt prompts
  const resetPrebuiltPrompt = async (agentKey) => {
     dispatch(resetPrebuiltPromptAction({
      agentKey
    }));
  };
  
  const handleSave = async (agentKey) => {
    setIsLoading(true);
    console.log(agentKey,'ewhllo')
    try {
      const dataToUpdate = {
        [agentKey]: prompts[agentKey],
      }
      await updatePrebuiltPrompt(dataToUpdate);
      
      toast.success((processedPrompts[agentKey]?.name || 'Agent') + ' prompt updated successfully!');
      setHasChanges(prev => ({
        ...prev,
        [agentKey]: false
      }));
      
      // Update the original prompt to the new saved value
      processedPrompts[agentKey].prompt = prompts[agentKey];
    } catch (error) {
      toast.error('Failed to update prompt. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (agentKey) => {
    try {
      await resetPrebuiltPrompt(agentKey);
      
      setPrompts(prev => ({
        ...prev,
        [agentKey]: processedPrompts[agentKey]?.prompt
      }));
      setHasChanges(prev => ({
        ...prev,
        [agentKey]: false
      }));
      toast.info((processedPrompts[agentKey]?.name || 'Agent') + ' prompt reset to default.');
    } catch (error) {
      toast.error('Failed to reset prompt. Please try again.');
      console.error('Reset error:', error);
    }
  };

  const handleCopy = (agentKey) => {
    navigator.clipboard.writeText(prompts[agentKey]);
    toast.success('Prompt copied to clipboard!');
  };

  const toggleEdit = (agentKey) => {
    setIsEditing(prev => ({
      ...prev,
      [agentKey]: !prev[agentKey]
    }));
  };

  if (availableKeys.length === 0) {
    return (
      <div className="min-h-screen bg-base-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold mb-2">No Prebuilt Agents Found</h2>
          <p className="text-base-content/60">Loading agent configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Prebuilt Agent Prompts</h1>
          <p className="text-base-content/60">
            Customize and manage prompts for your prebuilt AI agents
          </p>
        </div>

        {/* Agent Selection Tabs */}
        <div className="mb-6">
          <div className="tabs tabs-boxed bg-base-200 overflow-x-auto">
            <div className="flex flex-nowrap min-w-max">
              {Object.entries(processedPrompts).map(([key, agent]) => (
                <button
                  key={key}
                  className={'tab tab-lg whitespace-nowrap flex-shrink-0 ' + (selectedAgent === key ? 'tab-active' : '')}
                  onClick={() => setSelectedAgent(key)}
                >
                  <span className="truncate max-w-[150px]">{agent.name}</span>
                  {hasChanges[key] && (
                    <div className="ml-2 w-2 h-2 bg-warning rounded-full flex-shrink-0"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor */}
        {selectedAgent && (
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              {/* Editor Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="card-title text-xl">
                    {processedPrompts[selectedAgent]?.name}
                  </h2>
                  <p className="text-sm text-base-content/60 mt-1">
                    {processedPrompts[selectedAgent]?.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hasChanges[selectedAgent] && (
                    <div className="badge badge-warning">Unsaved Changes</div>
                  )}
                  <button
                    onClick={() => handleCopy(selectedAgent)}
                    className="btn btn-sm btn-ghost"
                    title="Copy prompt"
                  >
                    <CopyIcon size={16} />
                  </button>
                  <button
                    onClick={() => toggleEdit(selectedAgent)}
                    className={'btn btn-sm ' + (isEditing[selectedAgent] ? 'btn-primary' : 'btn-outline')}
                  >
                    <PencilIcon size={16} />
                    {isEditing[selectedAgent] ? 'Editing' : 'Edit'}
                  </button>
                </div>
              </div>

              {/* Prompt Content */}
              <div className="space-y-4">
                {isEditing[selectedAgent] ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Edit Agent Prompt</label>
                      <span className="text-xs text-base-content/50">
                        Customize the behavior and instructions for this agent
                      </span>
                    </div>
                    <textarea
                      className="textarea textarea-bordered w-full h-96 font-mono text-sm"
                      value={prompts[selectedAgent] || ''}
                      onChange={(e) => handlePromptChange(selectedAgent, e.target.value)}
                      placeholder="Enter agent prompt here..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Current Agent Prompt</label>
                    <div className="bg-base-100 p-4 rounded-lg border min-h-96 font-mono text-sm whitespace-pre-wrap overflow-auto">
                      {prompts[selectedAgent] || (
                        <div className="text-center text-base-content/50 mt-32">
                          <div className="text-4xl mb-2">🤖</div>
                          <p>No prompt configured</p>
                          <p className="text-xs mt-1">Click Edit to get started</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-base-content/60">
                    {(prompts[selectedAgent] || '').length} characters
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReset(selectedAgent)}
                      className="btn btn-sm btn-ghost"
                      disabled={!hasChanges[selectedAgent]}
                    >
                      <RefreshIcon size={16} />
                      Reset to Default
                    </button>
                    <button
                      onClick={() => handleSave(selectedAgent)}
                      className="btn btn-sm btn-primary"
                      disabled={!hasChanges[selectedAgent] || isLoading}
                    >
                      {isLoading && <span className="loading loading-spinner loading-sm"></span>}
                      <SaveAllIcon size={16} />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}