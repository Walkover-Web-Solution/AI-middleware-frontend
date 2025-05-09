import React, { useMemo, useState } from 'react'
import ConnectedAgentListSuggestion from './ConnectAgentListSuggestion';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { Bot, CircleAlert, Settings, Trash } from 'lucide-react';
import { getStatusClass } from '@/utils/utility';

const ConnectedAgentList = ({params}) => {
    const { connect_agents } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
        return {
            connect_agents: versionData?.connected_agents || {}
        };
    });

    const dispatch = useDispatch();
    const handleSelectAgents = (bridge) => {
        dispatch(updateBridgeVersionAction({ 
            bridgeId: params.id,
            versionId: params.version,
            dataToSend: {
                connected_agents: {
                    [bridge?.name]: {
                        "description": "",
                        "bridge_id": bridge?._id
                    }
                }
            }}))
    }

    const renderEmbed = useMemo(() => (
        connect_agents && Object.entries(connect_agents)
            .map(([name, value]) => {
                const hasDescription = value?.description?.trim() !== "";
                const statusClass = getStatusClass(value.status || "active");
                
                return (
                    <div 
                        key={value.bridge_id} 
                        id={value.bridge_id} 
                        className={`flex w-[280px] flex-col items-start rounded-lg border-2 md:flex-row cursor-pointer bg-base-100 relative transition-all duration-200 ease-in-out 
                           } 
                            hover:shadow-lg hover:scale-[1.02]`}
                    >
                        <div className="p-4 w-full h-full flex flex-col justify-between gap-3">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <h1 className="text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-48 text-base-content flex items-center gap-2">
                                        <Bot size={18} className="text-primary" />
                                        {name}
                                    </h1>
                                    {!hasDescription && <CircleAlert color='red' size={18} className="shrink-0" />}
                                </div>
                                <p className="text-sm text-base-content/80 line-clamp-3">
                                    {value?.description || "A description is required for proper functionality."}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-full capitalize px-3 py-1 text-xs font-medium ${statusClass}`}>
                                    {hasDescription ? value.status : "Description Required"}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })
    ), [connect_agents]);

    return (
        <div>
            <div className="label flex-col items-start mb-2">
                {
                    <div className="flex flex-wrap gap-4">
                        {renderEmbed}
                    </div>
                }
            </div>
            <ConnectedAgentListSuggestion params={params} handleSelectAgents={handleSelectAgents} connect_agents={connect_agents}/>
        </div>
    );
}

export default ConnectedAgentList