import React from "react";
import Modal from "../UI/Modal";
import ComparisonCheck from "@/utils/comparisonCheck";
import { MODAL_TYPE } from "@/utils/enums";
import { closeModal } from "@/utils/utility";
import { CloseIcon } from "@/components/Icons";

const Diff_Modal = ({ oldContent, newContent, isFromPublishModal = false }) => {
  const extractFields = (prompt) => {
    if (!prompt) {
      return { role: "", goal: "", instructions: "", customFields: [] };
    }

    if (typeof prompt === "string") {
      return { role: "", goal: "", instructions: prompt, customFields: [] };
    } else if (typeof prompt === "object" && prompt !== null) {
      return {
        role: prompt.role || "",
        goal: prompt.goal || "",
        instructions: prompt.instructions || "",
        customFields: prompt.embedCustomFields || [],
      };
    }

    return { role: "", goal: "", instructions: "", customFields: [] };
  };

  const oldFields = extractFields(oldContent);
  const newFields = extractFields(newContent);

  const customFieldKeys = Array.from(
    new Set([...oldFields.customFields.map((f) => f.key), ...newFields.customFields.map((f) => f.key)])
  );

  return (
    <Modal MODAL_ID={MODAL_TYPE.DIFF_PROMPT}>
      <div id="diff-modal-box" className="modal-box max-w-[80%]">
        <div id="diff-modal-header" className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Compare Published Prompt and Current Prompt</h3>
          <button
            id="diff-modal-close-button"
            onClick={() => closeModal(MODAL_TYPE.DIFF_PROMPT)}
            className="btn btn-sm btn-ghost"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="space-y-6">
          {/* Role Comparison - Always show */}
          <div className="border border-base-300 rounded-lg p-4">
            <h4 className="text-md font-semibold mb-3 text-primary">Role</h4>
            <ComparisonCheck
              oldContent={oldFields.role}
              newContent={newFields.role}
              isFromPublishModal={isFromPublishModal}
            />
          </div>

          {/* Goal Comparison - Always show */}
          <div className="border border-base-300 rounded-lg p-4">
            <h4 className="text-md font-semibold mb-3 text-primary">Goal</h4>
            <ComparisonCheck
              oldContent={oldFields.goal}
              newContent={newFields.goal}
              isFromPublishModal={isFromPublishModal}
            />
          </div>

          {/* Instructions Comparison - Always show */}
          <div className="border border-base-300 rounded-lg p-4">
            <h4 className="text-md font-semibold mb-3 text-primary">Instructions</h4>
            <ComparisonCheck
              oldContent={oldFields.instructions}
              newContent={newFields.instructions}
              isFromPublishModal={isFromPublishModal}
            />
          </div>

          {/* Custom Fields Comparison - Always show if any exist */}
          {customFieldKeys.length > 0 && (
            <div className="border border-base-300 rounded-lg p-4">
              <h4 className="text-md font-semibold mb-3 text-primary">Custom Fields</h4>
              <div className="space-y-4">
                {customFieldKeys.map((key) => {
                  const oldField = oldFields.customFields.find((f) => f.key === key);
                  const newField = newFields.customFields.find((f) => f.key === key);
                  const label = newField?.label || oldField?.label || key;

                  return (
                    <div key={key} className="border-l-2 border-primary/30 pl-4">
                      <h5 className="text-sm font-medium mb-2">{label}</h5>
                      <ComparisonCheck
                        oldContent={oldField?.value || ""}
                        newContent={newField?.value || ""}
                        isFromPublishModal={isFromPublishModal}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default Diff_Modal;
