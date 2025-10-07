'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { PencilIcon, SaveIcon, RefreshIcon, CopyIcon } from '@/components/Icons';
import { useCustomSelector } from '@/customHooks/customSelector';
import { SaveAllIcon } from 'lucide-react';
import { getPrebuiltPrompts } from '@/config';

const BRIDGE_PROMPTS = {
  'optimize_prompt': {
    name: 'Optimize Prompt',
    description: 'AI-powered prompt optimization for better results',
    defaultPrompt: `You are an expert prompt engineer. Your task is to optimize the given prompt to make it more effective, clear, and likely to produce better results.

Guidelines:
- Make the prompt more specific and actionable
- Add relevant context and constraints
- Improve clarity and structure
- Maintain the original intent
- Provide examples if helpful

Original prompt: {{original_prompt}}

Please provide an optimized version of this prompt.`
  },
  'gpt_memory': {
    name: 'GPT Memory',
    description: 'Conversation memory management for context retention',
    defaultPrompt: `You are a memory management system for conversations. Your role is to:

1. Extract and store important information from conversations
2. Retrieve relevant context when needed
3. Maintain conversation continuity
4. Organize information by topics and relevance

Current conversation context: {{conversation_context}}
Previous memory: {{previous_memory}}

Based on the current conversation, update the memory with relevant information and provide context for the next response.`
  },
  'structured_output_optimizer': {
    name: 'Structured Output Optimizer',
    description: 'Optimizes responses for structured data formats',
    defaultPrompt: `You are a structured output optimizer. Your task is to format responses in a clear, structured manner.

Requirements:
- Use consistent formatting
- Organize information logically
- Include all relevant details
- Maintain readability
- Follow the specified output format

Input data: {{input_data}}
Required format: {{output_format}}

Please provide a well-structured response following the specified format.`
  },
  'chatbot_suggestions': {
    name: 'Chatbot Suggestions',
    description: 'Generates helpful conversation suggestions',
    defaultPrompt: `You are a conversation assistant that provides helpful suggestions to improve user interactions.

Your role:
- Analyze conversation context
- Suggest relevant follow-up questions
- Provide conversation starters
- Recommend helpful resources
- Guide users toward their goals

Current conversation: {{conversation_history}}
User intent: {{user_intent}}

Provide 3-5 relevant suggestions to help continue the conversation effectively.`
  },
  'generate_summary': {
    name: 'Generate Summary',
    description: 'Creates concise summaries of content',
    defaultPrompt: `You are a professional summarizer. Create clear, concise summaries that capture the essential information.

Guidelines:
- Include key points and main ideas
- Maintain factual accuracy
- Use clear, professional language
- Keep appropriate length for context
- Highlight important insights

Content to summarize: {{content}}
Summary length: {{length_preference}}

Please provide a well-structured summary of the content.`
  }
};

export default function PrebuiltPromptsPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const [selectedBridge, setSelectedBridge] = useState('optimize_prompt');
  const [prompts, setPrompts] = useState({});
  const [isEditing, setIsEditing] = useState({});
  const [hasChanges, setHasChanges] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  // Initialize prompts with default values
  useEffect(() => {
    const initialPrompts = {};
    Object.keys(BRIDGE_PROMPTS).forEach(key => {
      initialPrompts[key] = BRIDGE_PROMPTS[key].defaultPrompt;
    });
    getDefaultPrompts()
    setPrompts(initialPrompts);
  }, []);
  const getDefaultPrompts =async()=>{
    debugger
    const prompts= await dispatch(getPrebuiltPrompts())
    console.log(prompts,"hello")

  
  }
  const handlePromptChange = (bridgeKey, value) => {
    setPrompts(prev => ({
      ...prev,
      [bridgeKey]: value
    }));
    setHasChanges(prev => ({
      ...prev,
      [bridgeKey]: value !== BRIDGE_PROMPTS[bridgeKey].defaultPrompt
    }));
  };

  const handleSave = async (bridgeKey) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save prompt
      // await dispatch(saveBridgePromptAction({
      //   org_id: params.org_id,
      //   bridge_type: bridgeKey,
      //   prompt: prompts[bridgeKey]
      // }));
      
      toast.success(`${BRIDGE_PROMPTS[bridgeKey].name} prompt saved successfully!`);
      setHasChanges(prev => ({
        ...prev,
        [bridgeKey]: false
      }));
    } catch (error) {
      toast.error('Failed to save prompt. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = (bridgeKey) => {
    setPrompts(prev => ({
      ...prev,
      [bridgeKey]: BRIDGE_PROMPTS[bridgeKey].defaultPrompt
    }));
    setHasChanges(prev => ({
      ...prev,
      [bridgeKey]: false
    }));
    toast.info(`${BRIDGE_PROMPTS[bridgeKey].name} prompt reset to default.`);
  };

  const handleCopy = (bridgeKey) => {
    navigator.clipboard.writeText(prompts[bridgeKey]);
    toast.success('Prompt copied to clipboard!');
  };

  const toggleEdit = (bridgeKey) => {
    setIsEditing(prev => ({
      ...prev,
      [bridgeKey]: !prev[bridgeKey]
    }));
  };

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Simple Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Prebuilt Prompts</h1>
          <p className="text-base-content/60">
            Manage and customize prompts for your bridge integrations
          </p>
        </div>

        {/* Bridge Selection */}
        <div className="mb-6">
          <div className="tabs tabs-boxed bg-base-200">
            {Object.entries(BRIDGE_PROMPTS).map(([key, bridge]) => (
              <button
                key={key}
                className={`tab tab-lg ${selectedBridge === key ? 'tab-active' : ''}`}
                onClick={() => setSelectedBridge(key)}
              >
                {bridge.name}
                {hasChanges[key] && (
                  <div className="ml-2 w-2 h-2 bg-warning rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Editor */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            {/* Editor Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="card-title text-xl">
                  {BRIDGE_PROMPTS[selectedBridge]?.name}
                </h2>
                <p className="text-sm text-base-content/60 mt-1">
                  {BRIDGE_PROMPTS[selectedBridge]?.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {hasChanges[selectedBridge] && (
                  <div className="badge badge-warning">Unsaved</div>
                )}
                <button
                  onClick={() => handleCopy(selectedBridge)}
                  className="btn btn-sm btn-ghost"
                  title="Copy prompt"
                >
                  <CopyIcon size={16} />
                </button>
                <button
                  onClick={() => toggleEdit(selectedBridge)}
                  className={`btn btn-sm ${
                    isEditing[selectedBridge] ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  <PencilIcon size={16} />
                  {isEditing[selectedBridge] ? 'Editing' : 'Edit'}
                </button>
              </div>
            </div>

            {/* Prompt Content */}
            <div className="space-y-4">
              {isEditing[selectedBridge] ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Edit Prompt</label>
                    <span className="text-xs text-base-content/50">
                      Use {`{{variable_name}}`} for dynamic content
                    </span>
                  </div>
                  <textarea
                    className="textarea textarea-bordered w-full h-96 font-mono text-sm"
                    value={prompts[selectedBridge] || ''}
                    onChange={(e) => handlePromptChange(selectedBridge, e.target.value)}
                    placeholder="Enter your prompt here..."
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-2 block">Current Prompt</label>
                  <div className="bg-base-100 p-4 rounded-lg border min-h-96 font-mono text-sm whitespace-pre-wrap overflow-auto">
                    {prompts[selectedBridge] || (
                      <div className="text-center text-base-content/50 mt-32">
                        <div className="text-4xl mb-2">📝</div>
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
                  {prompts[selectedBridge]?.length || 0} characters
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReset(selectedBridge)}
                    className="btn btn-sm btn-ghost"
                    disabled={!hasChanges[selectedBridge]}
                  >
                    <RefreshIcon size={16} />
                    Reset
                  </button>
                  <button
                    onClick={() => handleSave(selectedBridge)}
                    className="btn btn-sm btn-primary"
                    disabled={!hasChanges[selectedBridge] || isLoading}
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
      </div>
    </div>
  );
}