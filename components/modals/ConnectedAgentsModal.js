import { useCustomSelector } from '@/customHooks/customSelector';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal } from '@/utils/utility';
import React, { useMemo } from 'react';
import Modal from '../UI/Modal';
import { BotIcon } from '../Icons';

const ConnectedAgentsModal = ({ apiKey, orgId }) => {
    // Get all bridges/agents from the store
    const { bridges, apikeyData } = useCustomSelector((state) => ({
        bridges: state?.bridgeReducer?.allBridgesMap || {},
        apikeyData: state?.bridgeReducer?.apikeys[orgId] || []
    }));
    
    // Find bridges/agents that use this API key
    const connectedAgents = useMemo(() => {
        if (!apiKey || !apiKey._id) return [];
        
        // Get version IDs associated with this API key from the full apikeys data
        const currentApiKey = apikeyData?.find(item => item._id === apiKey._id);
        const connectedVersionIds = currentApiKey?.version_ids || [];
         if (!connectedVersionIds.length) {
            return [];
        }
        
        // Create a map to collect bridges by their ID
        const bridgeMap = new Map();
        
        // Check all bridges to see if they include any of the connected versions
        Object.values(bridges).forEach(bridge => {
            if (!bridge || !bridge._id || !Array.isArray(bridge.versions)) return;
            
            // Find all versions that match between this bridge and our API key
            const matchingVersions = bridge.versions.filter(
                versionId => connectedVersionIds.includes(versionId)
            );
            
            if (matchingVersions.length > 0) {
                
                bridgeMap.set(bridge._id, {
                    name: bridge.name ,
                    bridgeId: bridge._id,
                    versions: matchingVersions.map(vId => ({ id: vId }))
                });
            }
        });
        
        const result = Array.from(bridgeMap.values());
        return result;
    }, [bridges, apiKey, apikeyData]);


    if (!apiKey) {
        return null;
    }

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
                                                        {version.id}
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