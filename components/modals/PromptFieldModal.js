import React, { useState, useEffect } from "react";
import { MODAL_TYPE } from "@/utils/enums";
import { closeModal } from "@/utils/utility";
import Modal from "../UI/Modal";

const PromptFieldModal = ({ existingFields = {}, onSave, fieldToEdit = null }) => {
  const [label, setLabel] = useState(fieldToEdit?.label || "");
  const [key, setKey] = useState(fieldToEdit?.key || "");
  const [type, setType] = useState(fieldToEdit?.type || "input");
  const [error, setError] = useState("");

  // Sync state when fieldToEdit changes
  useEffect(() => {
    if (fieldToEdit) {
      setLabel(fieldToEdit.label || "");
      setKey(fieldToEdit.key || "");
      setType(fieldToEdit.type || "input");
    } else {
      setLabel("");
      setKey("");
      setType("input");
    }
  }, [fieldToEdit]);

  // Auto-generate key from label ONLY when creating new field
  useEffect(() => {
    if (!fieldToEdit && label) {
      const generatedKey = label.toLowerCase().replace(/[^a-z0-9]/g, "_");
      setKey(generatedKey);
    }
  }, [label, fieldToEdit]);

  const handleSave = (e) => {
    e.preventDefault();
    setError("");

    if (!label || !key) {
      setError("Label is required");
      return;
    }

    // Check for duplicate keys only if key changed or it's new
    // logic: if it is new (fieldToEdit null) -> check duplicate
    // if editing -> check duplicate only if key somehow changed (it shouldn't here)
    // actually if editing, we might not need to check unless we allow key change.
    // Since key is derived from label on create, and fixed on edit, we are safe.
    // BUT strict check:
    if (!fieldToEdit) {
      const isDuplicate = Array.isArray(existingFields)
        ? existingFields.some((field) => field.key === key)
        : existingFields[key];

      if (isDuplicate) {
        setError("Field with this name already exists (duplicate key)");
        return;
      }
    }

    // Check for reserved keys
    const reservedKeys = ["role", "goal", "instructions"];
    if (reservedKeys.includes(key)) {
      setError("Reserved name used. Please use a different label.");
      return;
    }

    onSave({ key, label, type, visible: true });
    handleClose();
  };

  const handleClose = () => {
    setLabel("");
    setKey("");
    setType("input");
    setError("");
    closeModal(MODAL_TYPE.PROMPT_FIELD_MODAL);
  };

  return (
    <Modal MODAL_ID={MODAL_TYPE.PROMPT_FIELD_MODAL}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">{fieldToEdit ? "Edit Custom Field" : "Add Custom Field"}</h3>

        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">Field Label</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Tone, Context"
            className="input input-bordered w-full"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            autoFocus
          />
        </div>

        {/* Key is auto-generated and hidden/readonly */}
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text text-xs opacity-50">Generated Key: {key}</span>
          </label>
        </div>

        <div className="form-control w-full mb-6">
          <label className="label">
            <span className="label-text">Input Type</span>
          </label>
          <select className="select select-bordered w-full" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="input">Single Line Input</option>
            <option value="textarea">Multi-line Textarea</option>
          </select>
        </div>

        {error && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>{error}</span>
          </div>
        )}

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {fieldToEdit ? "Update Field" : "Add Field"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PromptFieldModal;
