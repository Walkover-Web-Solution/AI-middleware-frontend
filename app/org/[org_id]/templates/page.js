'use client';
import MainLayout from "@/components/layoutComponents/MainLayout";
import PageHeader from "@/components/Pageheader";
import { useCustomSelector } from '@/customHooks/customSelector';
import { MODAL_TYPE } from "@/utils/enums";
import { openModal, formatRelativeTime, closeModal, RequiredItem } from "@/utils/utility";
import { SquarePenIcon, TrashIcon, PlayIcon, ArrowUp, Plus, Sparkles, X, ArrowLeft } from "lucide-react";
import React, { useEffect, useState, use } from 'react';
import { useDispatch } from "react-redux";
import DeleteModal from "@/components/UI/DeleteModal";
import SearchItems from "@/components/UI/SearchItems";
import useDeleteOperation from "@/customHooks/useDeleteOperation";
import TemplatePlayground from "@/components/modals/TemplatePlayground";
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { generateRichUITemplate } from '@/config/utilityApi';

export const runtime = 'edge';

const TemplatesPage = ({ params }) => {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const createParam = searchParams.get('create');

  const _dispatch = useDispatch();

  const { templatesData } = useCustomSelector((state) => ({
    templatesData: state?.richUiTemplateReducer?.templates || [],
  }));

  // State for Navigation/View Mode
  // Modes: 'list' | 'create_prompt' | 'editor'
  const [viewMode, setViewMode] = useState('list');

  // Data States
  const [filterTemplates, setFilterTemplates] = useState(templatesData || []);
  const [selectedDataToDelete, setSelectedDataToDelete] = useState(null);
  const [playgroundTemplate, setPlaygroundTemplate] = useState(null);
  const { isDeleting, executeDelete } = useDeleteOperation();

  // Chat State
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Editor State
  const [editorTemplate, setEditorTemplate] = useState(null); // The template being edited (or new data)
  const [schemaValue, setSchemaValue] = useState('');
  const [htmlValue, setHtmlValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFilterTemplates(templatesData || []);
  }, [templatesData]);

  // Handle URL params for direct access to create mode
  useEffect(() => {
    if (createParam === 'true') {
      setViewMode('create_prompt');
    } else {
      // Only reset to list if we were in create_prompt mode to allow internal navigation changes 
      // without fighting URL. But usually we want URL to drive this or sync.
      // For simplicity, let's treat URL as entry point only for now, or primary driver.
      // If we want full sync:
      if (viewMode === 'create_prompt') {
        setViewMode('list');
      }
    }
  }, [createParam]);

  // --- Actions ---

  const handleUpdateTemplate = (item) => {
    const originalItem = templatesData.find(template => template._id === item._id);
    setEditorTemplate(originalItem);
    setSchemaValue(JSON.stringify(originalItem?.json_schema?.schema || {}, null, 2));
    setHtmlValue(originalItem?.html || '');
    setViewMode('editor');
  };

  const handleDeleteTemplate = async (item) => {
    await executeDelete(async () => {
      // Add delete template action here
      console.log('Delete template:', item?._id);
      return Promise.resolve();
    });
  };

  const handleOpenPlayground = (item) => {
    const originalItem = templatesData.find(template => template._id === item._id);
    setPlaygroundTemplate(originalItem);
    // Playground still uses a modal
    openModal(MODAL_TYPE?.TEMPLATE_PLAYGROUND);
  };

  const handleCreateNew = () => {
    router.push(`?create=true`);
    // viewMode will update via useEffect or we can force it for faster UI
    setViewMode('create_prompt');
  };

  const handleBackToList = () => {
    router.replace(`/org/${resolvedParams.org_id}/templates`);
    setViewMode('list');
    setMessages([]);
    setCurrentInput('');
    setChatStarted(false);
    setIsAnimating(false);
    setEditorTemplate(null);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;
    
    // Start animation if this is the first message
    if (!chatStarted) {
      setIsAnimating(true);
      setTimeout(() => {
        setChatStarted(true);
        setIsAnimating(false);
      }, 500); // Animation duration
    }
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentInput.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsGenerating(true);

    try {
      // Call GTWY AI API for rich UI template generation
      const data = await generateRichUITemplate({
        message: userMessage.content,
        context: 'template_generation'
      });
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.result || data.response || 'Sorry, I could not generate a response.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling AI API:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };
  const handleSaveTemplate = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData(event.target);

    try {
      const schema = JSON.parse(schemaValue);
      const payload = {
        name: (formData.get("name") || "").trim(),
        description: (formData.get("description") || "").trim(),
        html: htmlValue.trim(),
        json_schema: { schema: schema }
      };

      if (editorTemplate?._isNew) {
        console.log('Creating template:', payload);
        toast.success('Template created successfully');
      } else {
        console.log('Updating template:', editorTemplate._id, payload);
        toast.success('Template updated successfully');
      }

      // Return to list
      handleBackToList();
    } catch (err) {
      console.error(err);
      toast.error('Invalid JSON schema format or error saving');
    } finally {
      setIsSaving(false);
    }
  };

  const validateJSON = (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  };

  // --- RENDERERS ---

  if (viewMode === 'create_prompt') {
    return (
      <div className="w-full h-[calc(100vh-100px)] flex flex-col relative animate-fade-in">
        <button
          onClick={handleBackToList}
          className="absolute top-4 left-4 btn btn-ghost btn-circle z-10"
        >
          <X size={24} />
        </button>

        {/* Chat Started Layout */}
        {chatStarted ? (
          <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[75%] ${message.type === 'user' ? 'ml-16' : 'mr-16'}`}>
                    <div className={`rounded-2xl px-5 py-4 shadow-sm ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-content' 
                        : 'bg-base-100 text-base-content border border-base-200'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      <div className={`text-xs mt-3 ${
                        message.type === 'user' ? 'text-primary-content/60' : 'text-base-content/40'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isGenerating && (
                <div className="flex justify-start animate-fade-in">
                  <div className="mr-16 max-w-[75%]">
                    <div className="bg-base-100 border border-base-200 rounded-2xl px-5 py-4 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm text-base-content/60">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Input - Fixed at bottom */}
            <div className="border-t border-base-200 bg-base-50/50 backdrop-blur-sm px-6 py-4">
              <div className="max-w-4xl mx-auto">
                <div className="relative flex items-center w-full rounded-2xl bg-base-100 border border-base-300 transition-all hover:border-primary/30 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary shadow-lg p-2">
                  <div className="p-3 text-base-content/50">
                    <Plus size={20} />
                  </div>
                  <input
                    type="text"
                    className="w-full py-4 px-2 bg-transparent border-none outline-none text-base-content placeholder:text-base-content/40 text-base"
                    placeholder="Continue the conversation..."
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={isGenerating}
                    autoFocus
                  />
                  <button
                    className={`p-3 m-1 rounded-xl transition-all duration-200 ${
                      currentInput.trim() && !isGenerating
                        ? 'bg-primary text-primary-content hover:bg-primary/90 shadow-md hover:shadow-lg transform hover:scale-105' 
                        : 'bg-base-200 text-base-content/30 cursor-not-allowed'
                    }`}
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim() || isGenerating}
                  >
                    <ArrowUp size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Initial Center Layout */
          <div className={`flex flex-col items-center justify-center h-full transition-all duration-700 ease-out ${
            isAnimating ? 'transform translate-y-full opacity-0 scale-95' : 'transform translate-y-0 opacity-100 scale-100'
          }`}>
            {isGenerating ? (
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28 mb-8">
                  <div className="absolute inset-0 border-4 border-base-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse" size={36} />
                </div>
                <h3 className="text-2xl font-medium mb-3 text-base-content">Generating Widget...</h3>
                <p className="text-base-content/60 max-w-md text-center text-lg leading-relaxed">
                  Interpreting your request and building the perfect widget structure for you.
                </p>
              </div>
            ) : (
              <div className="text-center max-w-2xl mx-auto px-6">
                <h2 className="text-4xl font-bold text-base-content mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Create New Widget
                </h2>
                <p className="text-base-content/60 text-lg mb-12 leading-relaxed">
                  Describe your widget idea and I'll help you build it step by step
                </p>
                
                <div className="w-full max-w-2xl relative">
                  <div className="relative flex items-center w-full shadow-2xl rounded-2xl bg-base-100 border border-base-200/50 transition-all hover:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary p-3">
                    <div className="p-3 text-primary/60">
                      <Plus size={24} />
                    </div>
                    <input
                      type="text"
                      className="w-full py-5 px-3 bg-transparent border-none outline-none text-base-content placeholder:text-base-content/40 text-lg"
                      placeholder="Describe your widget..."
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      autoFocus
                    />
                    <button
                      className={`p-4 m-1 rounded-xl transition-all duration-300 ${
                        currentInput.trim() 
                          ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-content hover:shadow-xl transform hover:scale-110 shadow-lg' 
                          : 'bg-base-200 text-base-content/30 cursor-not-allowed'
                      }`}
                      onClick={handleSendMessage}
                      disabled={!currentInput.trim()}
                    >
                      <ArrowUp size={22} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (viewMode === 'editor') {
    return (
      <div className="w-full h-full p-4 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => {
            // If new, go back to prompt? Or list? 
            // Usually back to List if Editing, back to Prompt if Creating?
            // Let's go to list for safety/simplicity
            handleBackToList();
          }} className="btn btn-circle btn-ghost btn-sm">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold">{editorTemplate?._isNew ? 'Create New Template' : 'Edit Template'}</h2>
        </div>

        <form onSubmit={handleSaveTemplate} className="space-y-6 max-w-5xl mx-auto pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Name <RequiredItem /></span>
              </label>
              <input
                type="text"
                name="name"
                className="input input-bordered w-full"
                placeholder="Template name"
                defaultValue={editorTemplate?.name || ''}
                required
                disabled={isSaving}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Description <RequiredItem /></span>
              </label>
              <input
                type="text"
                name="description"
                className="input input-bordered w-full"
                placeholder="Brief description"
                defaultValue={editorTemplate?.description || ''}
                required
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">JSON Schema (defines variables) <RequiredItem /></span>
              </label>
              <textarea
                value={schemaValue}
                onChange={(e) => setSchemaValue(e.target.value)}
                className={`textarea textarea-bordered font-mono text-xs min-h-[400px] leading-relaxed ${!validateJSON(schemaValue) ? 'textarea-error' : ''}`}
                placeholder="Enter JSON schema..."
                disabled={isSaving}
              />
              {!validateJSON(schemaValue) && (
                <label className="label">
                  <span className="label-text-alt text-error">Invalid JSON</span>
                </label>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">HTML Template <RequiredItem /></span>
                </label>
                <textarea
                  value={htmlValue}
                  onChange={(e) => setHtmlValue(e.target.value)}
                  className="textarea textarea-bordered font-mono text-xs min-h-[300px] leading-relaxed"
                  placeholder="HTML content with {{variable}} placeholders"
                  disabled={isSaving}
                />
              </div>

              <div className="bg-base-200 rounded-lg p-4">
                <label className="label p-0 mb-2">
                  <span className="label-text font-medium">Preview</span>
                </label>
                <div className="bg-white rounded border border-gray-200 p-2 min-h-[100px] max-h-[200px] overflow-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: htmlValue.replace(/\{\{(\w+)\}\}/g, '<span class="bg-yellow-200 px-1 rounded mx-0.5 text-xs font-mono">$1</span>')
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={handleBackToList}
              className="btn btn-ghost"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-8"
              disabled={isSaving || !validateJSON(schemaValue)}
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                'Save Template'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render List View (Default)
  return (
    <div className="w-full">
      <div className="px-2 pt-4">
        <MainLayout>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between w-full gap-2">
            <PageHeader
              title="Templates"
              description="Create and manage reusable UI templates for your agents."
            />
          </div>
        </MainLayout>

        <div className="flex flex-row gap-4">
          {filterTemplates?.length > 5 && (
            <SearchItems
              data={templatesData || []}
              setFilterItems={setFilterTemplates}
              item="Template"
            />
          )}
          <div className={`flex-shrink-0 ${filterTemplates?.length > 5 ? 'mr-2' : 'ml-2'}`}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleCreateNew}
            >
              + Create Template
            </button>
          </div>
        </div>
      </div>

      {filterTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
          {filterTemplates.map((template) => (
            <div
              key={template._id}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              {/* Template Preview */}
              <div className="h-32 bg-base-200 border-b border-base-300 relative overflow-hidden group">
                {template.html ? (
                  <div className="absolute inset-0 p-2 text-xs overflow-hidden">
                    <div
                      className="w-full h-full transform scale-75 origin-top-left"
                      dangerouslySetInnerHTML={{
                        __html: template.html.replace(/\{\{(\w+)\}\}/g, '<span class="bg-warning px-1 rounded">$1</span>')
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-base-content/60">
                    <div className="text-center">
                      <div className="text-2xl mb-1">📄</div>
                      <div className="text-xs">No Preview</div>
                    </div>
                  </div>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => handleOpenPlayground(template)} className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20" title="Preview">
                    <PlayIcon size={16} />
                  </button>
                </div>
              </div>

              {/* Template Info */}
              <div className="card-body p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="card-title text-base-content truncate flex-1 text-sm">
                    {template.name || 'Untitled Template'}
                  </h3>
                </div>

                <p className="text-xs text-base-content/70 mb-3 line-clamp-2 min-h-[2.5em]">
                  {template.description || 'No description available'}
                </p>

                <div className="text-[10px] text-base-content/50 uppercase tracking-wider font-medium">
                  {formatRelativeTime(template.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-500 text-lg mb-2">No templates found</p>
          <p className="text-gray-400 text-sm mb-6">Create your first template to get started</p>
          <button
            className="btn btn-primary"
            onClick={handleCreateNew}
          >
            + Create Template
          </button>
        </div>
      )}

      {/* No TemplateModal here anymore! */}

      <TemplatePlayground
        template={playgroundTemplate}
        setTemplate={setPlaygroundTemplate}
      />

      <DeleteModal
        onConfirm={handleDeleteTemplate}
        item={selectedDataToDelete}
        title="Delete Template"
        description={`Are you sure you want to delete the template "${selectedDataToDelete?.actual_name}"? This action cannot be undone.`}
        loading={isDeleting}
        isAsync={true}
      />
    </div>
  );
};

export default TemplatesPage;
