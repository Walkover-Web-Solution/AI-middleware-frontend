import { optimizeSchemaApi } from "@/config";
import { useCustomSelector } from "@/customHooks/customSelector";
import { updateBridgeVersionAction } from "@/store/action/bridgeAction";
import { MODAL_TYPE } from "@/utils/enums";
import { closeModal } from "@/utils/utility";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function JsonSchemaModal({ params }) {
    const dispatch = useDispatch();

    const { json_schema } = useCustomSelector((state) => ({
        json_schema:
            state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[
                params?.version
            ]?.configuration?.response_type?.json_schema,
    }));

    const [jsonSchemaRequirenments, setJsonSchemaRequirenments] = useState(
        typeof json_schema === "object"
            ? JSON.stringify(json_schema, null, 4)
            : json_schema
    );
    const [loading, setLoading] = useState(false);
    const [newJsonSchema, setNewJsonSchema] = useState("");

    useEffect(() => {
        setJsonSchemaRequirenments(
            typeof json_schema === "object"
                ? JSON.stringify(json_schema, null, 4)
                : json_schema
        );
    }, [json_schema]);

    const optimizeSchema = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await optimizeSchemaApi({
                data: {
                    json_schema: jsonSchemaRequirenments,
                },
            });
            const parsedResult = JSON.stringify(result, undefined, 4);
            setNewJsonSchema(parsedResult);
        } catch (error) {
            console.error("Optimization Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = (e) => {
        e.preventDefault();
        setNewJsonSchema("");
        closeModal(MODAL_TYPE.JSON_SCHEMA);
    };

    const handleFinalize = async () => {
        try {
            await dispatch(
                updateBridgeVersionAction({
                    bridgeId: params.id,
                    versionId: params.version,
                    dataToSend: {
                        configuration: {
                            response_type: {
                                type: "json_schema",
                                json_schema: JSON.parse(newJsonSchema),
                            },
                        },
                    },
                })
            );
            setLoading(false);
        } catch (error) {
            console.error("Error:", error);
            setLoading(false);
        }
    };

    return (
        <dialog id={MODAL_TYPE.JSON_SCHEMA} className="modal">
            <div className="modal-box w-11/12 max-w-7xl bg-white">
                <h3 className="font-bold text-lg mb-4">Optimize Json Schema</h3>
                <div className="flex gap-3 w-full">
                    <div className="w-full">
                        <div className="label">
                            <span className="label-text">Example Json Schema</span>
                        </div>
                        <textarea
                            className="textarea textarea-bordered border w-full min-h-96 focus:border-primary caret-black p-2"
                            autoFocus={false}
                            value={jsonSchemaRequirenments}
                            onChange={(e) => setJsonSchemaRequirenments(e.target.value)}
                            readOnly
                        />
                    </div>
                    <div className="w-full">
                        <div className="label">
                            <span className="label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text">
                                AI Generated Schema
                            </span>
                            <button
                                className="label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text"
                                onClick={handleFinalize}
                                disabled={!newJsonSchema.trim()}
                            >
                                Apply
                            </button>
                        </div>
                        <textarea
                            className="textarea textarea-bordered border w-full min-h-96 resize-y focus:border-primary caret-black p-2"
                            value={newJsonSchema}
                            onChange={(e) => setNewJsonSchema(e.target.value)}
                            readOnly
                        />
                    </div>
                </div>
                <div className="modal-action">
                    <form method="dialog" onSubmit={optimizeSchema}>
                        <button className="btn" onClick={handleCloseModal}>
                            Close
                        </button>
                        <button
                            className="btn btn-primary ml-2"
                            disabled={loading}
                            type="submit"
                        >
                            {loading && <span className="loading loading-spinner"></span>}
                            Optimize
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    );
}

export default React.memo(JsonSchemaModal);