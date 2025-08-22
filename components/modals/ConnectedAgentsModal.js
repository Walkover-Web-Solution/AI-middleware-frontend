import { useCustomSelector } from '@/customHooks/customSelector';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import React, { useMemo } from 'react';
import Modal from '../UI/Modal';
import { BotIcon } from '../Icons';

const ConnectedAgentsModal = ({ apiKey, orgId }) => {
    // Get all bridges/agents from the store
    const { bridges, bridgeVersionMapping, apikeyData } = useCustomSelector((state) => ({
        bridges: state?.bridgeReducer?.allBridgesMap || {},
        bridgeVersionMapping: state?.bridgeReducer?.bridgeVersionMapping || {},
        apikeyData: state?.bridgeReducer?.apikeys[orgId] || []
    }));
  console.log(bridges,"sdlfj");
    // Find bridges/agents that use this API key
    const connectedAgents = useMemo(() => {
        const result = [];

        if (!apiKey || !apiKey._id) return result;

        // Loop through all bridges
        Object.values(bridges).forEach(bridge => {
            // Check if this bridge uses the API key
            if (bridge?.apikey_object_id) {
                const apikeyObjectIds = Object.values(bridge.apikey_object_id || {});

                if (apikeyObjectIds.includes(apiKey?._id)) {
                    // Get versions for this bridge
                    const versionsData = [];

                    if (bridge._id && bridgeVersionMapping && bridgeVersionMapping[bridge._id]) {
                        const versions = Object.values(bridgeVersionMapping[bridge._id])
                            .filter(version => version?.apikey_object_id &&
                                Object.values(version.apikey_object_id || {}).includes(apiKey?._id));

                        versions.forEach((version, index) => {
                            versionsData.push({
                                index: `V${index + 1}`,
                                id: version._id
                            });
                        });
                    }

                    result.push({
                        name: bridge.name,
                        bridgeId: bridge._id,
                        versions: versionsData
                    });
                }
            }

            // Check versions of this bridge too
            else if (bridge._id && bridgeVersionMapping && bridgeVersionMapping[bridge._id]) {
                const versionsWithApiKey = [];

                Object.values(bridgeVersionMapping[bridge._id]).forEach((version, index) => {
                    if (version?.apikey_object_id) {
                        const versionApikeyIds = Object.values(version.apikey_object_id || {});

                        if (versionApikeyIds.includes(apiKey?._id)) {
                            versionsWithApiKey.push({
                                index: `V${index + 1}`,
                                id: version._id
                            });
                        }
                    }
                });

                if (versionsWithApiKey.length > 0) {
                    result.push({
                        name: bridge.name,
                        bridgeId: bridge._id,
                        versions: versionsWithApiKey
                    });
                }
            }
        });

        return result;
    }, [bridges, bridgeVersionMapping, apiKey]);

    return (
        <Modal MODAL_ID={MODAL_TYPE.CONNECTED_AGENTS_MODAL}>
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Connected Agents for API Key: {apiKey?.name}</h3>

                {connectedAgents.length > 0 ? (
                    <div className="overflow-y-auto max-h-96">
                        {connectedAgents.map((agent) => (
                            <div key={agent.bridgeId} className="mb-4 p-4 border rounded-lg bg-base-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 mb-2">
                                    <BotIcon className="text-primary" />
                                    <h4 className="font-semibold text-base-content">{agent.name}</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-2 text-sm text-base-content/80">
                                    <div>
                                        <span className="font-medium">Bridge ID:</span>
                                        <span className="text-xs font-mono bg-base-300 p-1 rounded ml-1">{agent.bridgeId}</span>
                                    </div>

                                    {agent.versions && agent.versions.length > 0 && (
                                        <div className="col-span-2 mt-2">
                                            <div className="font-medium mb-1">Versions:</div>
                                            <div className="flex flex-col gap-1">
                                                {agent.versions.map((version, i) => (
                                                    <span key={i} className="inline text-xs font-mono bg-base-300 p-1 rounded w-fit">
                                                        {version.index}: {version.id}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-base-content/70">
                        <BotIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p>No agents are connected to this API key.</p>
                    </div>
                )}

                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn" onClick={() => closeModal(MODAL_TYPE.CONNECTED_AGENTS_MODAL)}>Close</button>
                    </form>
                </div>
            </div>
        </Modal>
    );
};

export default ConnectedAgentsModal;