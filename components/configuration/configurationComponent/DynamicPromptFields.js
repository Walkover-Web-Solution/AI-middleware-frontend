import React, { useState, useEffect, useCallback } from "react";
import { useCustomSelector } from "@/customHooks/customSelector";
import DefaultVariablesSection from "./DefaultVariablesSection";

const DynamicPromptFields = ({
  promptData,
  onChange,
  isPublished = false,
  isEditor = true,
  onSave, // Add onSave prop like PromptTextarea
  setIsTextareaFocused = () => {}, // Add focus state setter
  isEmbedUser = false, // Add isEmbedUser prop to control custom fields visibility
}) => {
  const [fields, setFields] = useState({
    role: "",
    goal: "",
    instructions: "",
    embedCustomFields: [],
  });

  // Get global embed config from Redux
  const { embedUserDetails } = useCustomSelector((state) => state.appInfoReducer);
  const globalEmbedCustomFields = embedUserDetails?.prompt?.embedCustomFields;

  // Auto-migrate old string format and sync with global config
  useEffect(() => {
    let currentData = {};

    if (typeof promptData === "string") {
      // Old format
      currentData = {
        role: "",
        goal: "",
        instructions: promptData,
        embedCustomFields: [],
      };
    } else if (promptData && typeof promptData === "object") {
      // New format
      currentData = {
        role: promptData.role || "",
        goal: promptData.goal || "",
        instructions: promptData.instructions || "",
        embedCustomFields: promptData.embedCustomFields || [],
      };
    }

    // Merge with global configuration if available
    if (globalEmbedCustomFields) {
      // Map global definitions to current values, preserving existing values
      const mergedCustomFields = globalEmbedCustomFields.map((globalField) => {
        const existingField = currentData.embedCustomFields?.find((f) => f.key === globalField.key);
        return {
          ...globalField, // Use global definition (label, type, key)
          value: existingField?.value || "", // Use existing value or empty
        };
      });

      currentData.embedCustomFields = mergedCustomFields;
    }

    setFields(currentData);
  }, [promptData, globalEmbedCustomFields]);

  // Handle field changes
  const handleFieldChange = useCallback(
    (fieldName, value) => {
      const updatedFields = {
        ...fields,
        [fieldName]: value,
      };
      setFields(updatedFields);
      onChange?.(updatedFields);
    },
    [fields, onChange]
  );

  // Handle embed custom field changes
  const handleCustomFieldChange = useCallback(
    (index, value) => {
      const updatedCustomFields = [...fields.embedCustomFields];
      updatedCustomFields[index] = {
        ...updatedCustomFields[index],
        value: value,
      };
      const updatedFields = {
        ...fields,
        embedCustomFields: updatedCustomFields,
      };
      setFields(updatedFields);
      onChange?.(updatedFields);
    },
    [fields, onChange]
  );

  // Handle blur - save prompt object (same approach as PromptTextarea)
  const handleBlur = useCallback(() => {
    // Build prompt object from current fields
    const promptObject = {
      role: fields.role || "",
      goal: fields.goal || "",
      instructions: fields.instructions || "",
      embedCustomFields: fields.embedCustomFields || [],
    };

    // Call onSave with the prompt object
    onSave?.(promptObject);
  }, [fields, onSave]);

  const isDisabled = isPublished && !isEditor;

  return (
    <div className="space-y-4">
      {/* Role Field - Input */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Role</span>
        </label>
        <input
          type="text"
          value={fields.role}
          onChange={(e) => handleFieldChange("role", e.target.value)}
          onFocus={() => setIsTextareaFocused(true)}
          onBlur={(e) => {
            handleBlur(e);
            setIsTextareaFocused(false);
          }}
          disabled={isDisabled}
          placeholder="e.g., Math teacher, Customer support agent"
          className="input input-bordered w-full"
          title={isDisabled ? "Cannot edit in published mode" : ""}
        />
      </div>

      {/* Goal Field - Textarea */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Goal</span>
        </label>
        <input
          value={fields.goal}
          onChange={(e) => handleFieldChange("goal", e.target.value)}
          onFocus={() => setIsTextareaFocused(true)}
          onBlur={(e) => {
            handleBlur(e);
            setIsTextareaFocused(false);
          }}
          disabled={isDisabled}
          placeholder="e.g., Solve math questions, Help customers with inquiries"
          className="input input-bordered w-full"
          title={isDisabled ? "Cannot edit in published mode" : ""}
        />
      </div>

      {/* Instructions Field - Textarea */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Instructions</span>
        </label>
        <textarea
          value={fields.instructions}
          onChange={(e) => handleFieldChange("instructions", e.target.value)}
          onFocus={() => setIsTextareaFocused(true)}
          onBlur={(e) => {
            handleBlur(e);
            setIsTextareaFocused(false);
          }}
          disabled={isDisabled}
          placeholder="e.g., Provide step-by-step solutions, Be friendly and professional"
          className="textarea textarea-bordered w-full h-32 resize-y"
          title={isDisabled ? "Cannot edit in published mode" : ""}
        />
        {/* Manage Variables Section - No gap with Instructions */}
        <div className="-mt-1">
          <DefaultVariablesSection isPublished={isPublished} prompt={fields.instructions} isEditor={isEditor} />
        </div>
      </div>

      {/* Embed Custom Fields - Only show for embed users */}
      {isEmbedUser && fields.embedCustomFields && fields.embedCustomFields.length > 0 && (
        <div className="space-y-3">
          <div className="divider">Custom Fields</div>
          {fields.embedCustomFields.map((field, index) => (
            <div key={field.key} className="form-control">
              <label className="label">
                <span className="label-text font-medium">{field.label}</span>
              </label>
              {field.type === "input" ? (
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => handleCustomFieldChange(index, e.target.value)}
                  onFocus={() => setIsTextareaFocused(true)}
                  onBlur={(e) => {
                    handleBlur(e);
                    setIsTextareaFocused(false);
                  }}
                  disabled={isDisabled}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="input input-bordered w-full"
                  title={isDisabled ? "Cannot edit in published mode" : ""}
                />
              ) : (
                <textarea
                  value={field.value}
                  onChange={(e) => handleCustomFieldChange(index, e.target.value)}
                  onFocus={() => setIsTextareaFocused(true)}
                  onBlur={(e) => {
                    handleBlur(e);
                    setIsTextareaFocused(false);
                  }}
                  disabled={isDisabled}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="textarea textarea-bordered w-full h-24 resize-y"
                  title={isDisabled ? "Cannot edit in published mode" : ""}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicPromptFields;
