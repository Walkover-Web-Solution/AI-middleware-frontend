"use client";
import React, { useState, useEffect } from "react";
import Modal from "@/components/UI/Modal";
import { MODAL_TYPE } from "@/utils/enums";
import { closeModal, RequiredItem } from "@/utils/utility";
import { toast } from "react-toastify";

const TemplateModal = ({selectedTemplate, setSelectedTemplate = () => { } }) => {
    const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
    const [schemaValue, setSchemaValue] = useState('');

    const [htmlValue, setHtmlValue] = useState('');

    useEffect(() => {
        if (selectedTemplate) {
            setSchemaValue(JSON.stringify(selectedTemplate.json_schema?.schema || {}, null, 2));
            setHtmlValue("<div class=\"relative max-w-xl w-full overflow-hidden rounded-2xl border border-base-300 bg-base-100 text-base-content shadow-xl p-7\"><div class=\"space-y-4\"><div class=\"flex flex-row gap-3 items-stretch\"><p class=\"text-xs text-base-content/60 font-semibold\">Welcome Message</p><p class=\"text-sm text-base-content/60\">Hello! How can I assist you today?</p></div><div class=\"relative mx-0\"><div class=\"border-t border-dashed border-base-300/80\"></div></div><div class=\"flex flex-row gap-3 items-stretch\"><p class=\"text-xs text-base-content/60 font-semibold\">Quick Actions</p><input type=\"text\" name=\"quickAction1\" class=\"input input-ghost w-full text-sm\" placeholder=\"Type your question...\" value=\"Ask a Question\" /></div><div class=\"relative mx-0\"><div class=\"border-t border-dashed border-base-300/80\"></div></div><div class=\"flex flex-row gap-3 items-stretch\"><p class=\"text-xs text-base-content/60 font-semibold\">Live Support</p><input type=\"text\" name=\"liveSupport\" class=\"input input-ghost w-full text-sm\" placeholder=\"Type your message...\" value=\"Chat with Support\" /></div><div class=\"relative mx-0\"><div class=\"border-t border-dashed border-base-300/80\"></div></div><textarea name=\"feedback\" rows=\"9\" class=\"textarea textarea-ghost w-full text-sm resize-none leading-relaxed\" placeholder=\"Provide feedback here...\">Feedback</textarea><div class=\"mt-4 flex justify-end gap-3 px-4 pb-4\"><button type=\"button\" class=\"btn btn-outline\">Cancel</button><button type=\"button\" class=\"btn btn-neutral\">Submit</button></div></div></div>");
        } else {
            setSchemaValue('{\n  "type": "object",\n  "properties": {\n    "description": {\n      "type": "string",\n      "description": "Main description text"\n    },\n    "christmas_day": {\n      "type": "string",\n      "description": "Christmas Day date"\n    },\n    "christmas_eve": {\n      "type": "string",\n      "description": "Christmas Eve date"\n    },\n    "new_years_eve": {\n      "type": "string",\n      "description": "New Year\'s Eve date"\n    },\n    "new_years_day": {\n      "type": "string",\n      "description": "New Year\'s Day date"\n    }\n  },\n  "required": ["description", "christmas_day", "christmas_eve", "new_years_eve", "new_years_day"]\n}');
            setHtmlValue('<div class="bg-base-100 p-6 rounded-lg shadow-lg max-w-md mx-auto">\n  <p class="text-base-content/70 text-sm mb-6 leading-relaxed">{{description}}</p>\n  \n  <div class="space-y-4">\n    <div class="flex items-center justify-between">\n      <span class="text-base-content/80 text-sm">• Christmas Day: {{christmas_day}}</span>\n      <input type="text" class="input input-bordered input-sm w-24" placeholder="Date" />\n    </div>\n    \n    <div class="flex items-center justify-between">\n      <span class="text-base-content/80 text-sm">• Christmas Eve: {{christmas_eve}}</span>\n      <input type="text" class="input input-bordered input-sm w-24" placeholder="Date" />\n    </div>\n    \n    <div class="flex items-center justify-between">\n      <span class="text-base-content/80 text-sm">• New Year\'s Eve: {{new_years_eve}}</span>\n      <input type="text" class="input input-bordered input-sm w-24" placeholder="Date" />\n    </div>\n    \n    <div class="flex items-center justify-between">\n      <span class="text-base-content/80 text-sm">• New Year\'s Day: {{new_years_day}}</span>\n      <input type="text" class="input input-bordered input-sm w-24" placeholder="Date" />\n    </div>\n  </div>\n  \n  <div class="flex gap-2 mt-6">\n    <button class="btn btn-ghost btn-sm">Cancel</button>\n    <button class="btn btn-primary btn-sm flex-1">Proceed with dates around Christmas and New Year?</button>\n  </div>\n</div>');
        }
    }, [selectedTemplate]);

    const handleCreateTemplate = async (event) => {
        event.preventDefault();
        setIsCreatingTemplate(true);
        
        const formData = new FormData(event.target);
        
        try {
            const schema = JSON.parse(schemaValue);
            
            const payload = {
                name: (formData.get("name") || "").trim(),
                description: (formData.get("description") || "").trim(),
                html: htmlValue.trim(),
                json_schema: {
                    schema: schema
                }
            };

            // Add create template action here
            console.log('Creating template:', payload);
            
            toast.success('Template created successfully');
            closeModal(MODAL_TYPE.TEMPLATE_MODAL);
            event.target.reset();
            setSchemaValue('');
        } catch {
            toast.error('Invalid JSON schema format');
        } finally {
            setIsCreatingTemplate(false);
        }
    };

    const handleUpdateTemplate = async (event) => {
        event.preventDefault();
        if (!selectedTemplate?._id) return;

        setIsCreatingTemplate(true);
        const formData = new FormData(event.target);

        try {
            const schema = JSON.parse(schemaValue);
            
            const payload = {
                name: (formData.get("name") || "").trim(),
                description: (formData.get("description") || "").trim(),
                html: htmlValue.trim(),
                json_schema: {
                    schema: schema
                }
            };

            // Add update template action here
            console.log('Updating template:', selectedTemplate._id, payload);
            
            toast.success('Template updated successfully');
            closeModal(MODAL_TYPE.TEMPLATE_MODAL);
            setSelectedTemplate(null);
            event.target.reset();
        } catch {
            toast.error('Invalid JSON schema format');
        } finally {
            setIsCreatingTemplate(false);
        }
    };

    const handleClose = () => {
        closeModal(MODAL_TYPE.TEMPLATE_MODAL);
        setSelectedTemplate(null);
        setSchemaValue('');
        setHtmlValue('');
    };

    const validateJSON = (value) => {
        try {
            JSON.parse(value);
            return true;
        } catch {
            return false;
        }
    };

    return (
        <Modal MODAL_ID={MODAL_TYPE.TEMPLATE_MODAL}>
            <div className="modal-box w-11/12 max-w-4xl border-2 border-base-300">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-300">
                    <h3 className="font-bold text-lg">
                        {selectedTemplate ? "Edit" : "Create"} Template
                    </h3>
                    <button
                        onClick={handleClose}
                        className="btn btn-circle btn-ghost btn-sm"
                        disabled={isCreatingTemplate}
                    >
                        ✕
                    </button>
                </div>

                <form 
                    onSubmit={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate} 
                    className="space-y-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name Field */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-sm font-medium">Name <RequiredItem /></span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="input input-bordered input-sm"
                                placeholder="Template name"
                                defaultValue={selectedTemplate?.name || ''}
                                key={selectedTemplate?._id || 'new'}
                                required
                                disabled={isCreatingTemplate}
                            />
                        </div>

                        {/* Description Field */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-sm font-medium">Description <RequiredItem /></span>
                            </label>
                            <input
                                type="text"
                                name="description"
                                className="input input-bordered input-sm"
                                placeholder="Brief description of the template"
                                defaultValue={selectedTemplate?.description || ''}
                                key={`desc-${selectedTemplate?._id || 'new'}`}
                                required
                                disabled={isCreatingTemplate}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* JSON Schema Field */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-sm font-medium">JSON Schema <RequiredItem /></span>
                            </label>
                            <textarea
                                value={schemaValue}
                                onChange={(e) => setSchemaValue(e.target.value)}
                                className={`textarea textarea-bordered w-full h-64 font-mono text-xs ${
                                    !validateJSON(schemaValue) ? 'textarea-error' : ''
                                }`}
                                placeholder="Enter JSON schema..."
                                disabled={isCreatingTemplate}
                            />
                            {!validateJSON(schemaValue) && (
                                <label className="label">
                                    <span className="label-text-alt text-error">Invalid JSON format</span>
                                </label>
                            )}
                        </div>

                        {/* HTML Template Field */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-sm font-medium">HTML Template <RequiredItem /></span>
                            </label>
                            <textarea
                                value={htmlValue}
                                onChange={(e) => setHtmlValue(e.target.value)}
                                className="textarea textarea-bordered w-full h-64 font-mono text-xs"
                                placeholder="Enter HTML template with `${variable}` placeholders..."
                                disabled={isCreatingTemplate}
                            />
                            <label className="label">
                                <span className="label-text-alt">Use variable syntax for dynamic content</span>
                            </label>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-sm font-medium">Schema Preview</span>
                        </label>
                        <div className="bg-base-200 p-4 rounded-lg">
                            <pre className="text-xs overflow-auto max-h-32">
                                {validateJSON(schemaValue) 
                                    ? JSON.stringify(JSON.parse(schemaValue), null, 2)
                                    : 'Invalid JSON'
                                }
                            </pre>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="modal-action">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-ghost"
                            disabled={isCreatingTemplate}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isCreatingTemplate || !validateJSON(schemaValue)}
                        >
                            {isCreatingTemplate ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    {selectedTemplate ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                selectedTemplate ? 'Update Template' : 'Create Template'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default TemplateModal;
