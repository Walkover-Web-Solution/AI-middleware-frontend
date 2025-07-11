
// JsonSchemaModal.jsx
import { optimizeSchemaApi } from "@/config";
import { useCustomSelector } from "@/customHooks/customSelector";
import { updateBridgeVersionAction } from "@/store/action/bridgeAction";
import { MODAL_TYPE } from "@/utils/enums";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import OptimiseBaseModal from "./OptimiseBaseModal";
import { toast } from "react-toastify";

function JsonSchemaModal({ params, messages, setMessages, thread_id}) {
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");
  const { json_schema } = useCustomSelector((state) => ({
    json_schema: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.response_type?.json_schema,
  }));

  const [jsonSchemaRequirements, setJsonSchemaRequirements] = useState(
    typeof json_schema === "object" ? JSON.stringify(json_schema, null, 4) : json_schema
  );

  useEffect(() => {
    setJsonSchemaRequirements(
      typeof json_schema === "object" ? JSON.stringify(json_schema, null, 4) : json_schema
    );
  }, [json_schema]);

  const handleOptimizeApi = async (instructionText) => {
    const result = await optimizeSchemaApi({
      data: {
        thread_id,
        query: instructionText,
        json_schema: jsonSchemaRequirements,
      },
    });
    return result;
  };

  const handleApply = async (schemaToApply) => {
    await dispatch(
      updateBridgeVersionAction({
        bridgeId: params?.id,
        versionId: params?.version,
        dataToSend: {
          configuration: {
            response_type: {
              type: "json_schema",
              json_schema: JSON.parse(schemaToApply),
            },
          },
        },
      })
    );
  };

  const validateJsonSchema = (schema) => {
    if (!schema) return;
    try {
      JSON.parse(schema);
      setErrorMessage("");
    } catch (error) {
      toast.error("Invalid JSON Schema");
      setErrorMessage("Invalid JSON Schema");
    }
  };

  return (
    <OptimiseBaseModal
      modalType={MODAL_TYPE.JSON_SCHEMA}
      title="Improve Json Schema"
      contentLabel="Schema"
      content={jsonSchemaRequirements}
      optimizeApi={handleOptimizeApi}
      onApply={handleApply}
      params={params}
      messages={messages}
      setMessages={setMessages}
      additionalValidation={validateJsonSchema}
      textareaProps={{
        onBlur: (e) => validateJsonSchema(e.target.value)
      }}
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
      key="json_schema"
    />
  );
}

export default React.memo(JsonSchemaModal);