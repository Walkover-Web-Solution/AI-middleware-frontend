import { getStatusClass } from '@/utils/utility';
import { AddIcon } from '@/components/Icons';
import React, { useMemo, useState } from 'react';
import { InfoIcon } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';

function ConnectedAgentListSuggestion({ params, name, handleSelectAgents = () => { }, connect_agents = [], shouldToolsShow, modelName, bridges }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleInputChange = (e) => {
        setSearchQuery(e?.target?.value || "");
    };

    const handleItemClick = (bridge) => {
        handleSelectAgents(bridge);
    };

    const renderBridgeSuggestions = useMemo(() => (
        Object.values(bridges)
            .filter(bridge => {
                const isActive = bridge?.status === 1 && (bridge?.bridge_status === 1 || bridge?.bridge_status === undefined);
                const matchesSearch = bridge?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase());
                const isNotConnected = connect_agents && Object.keys(connect_agents).some(agentName => agentName === bridge?.name);
                const notSameBridge = bridge?._id !== params?.id
                return isActive && matchesSearch && !isNotConnected && notSameBridge;
            })
            .slice()
            .sort((a, b) => {
                if (!a?.name) return 1;
                if (!b?.name) return -1;
                return a?.name?.localeCompare(b?.name);
            })
            .map((bridge) => {
                return (
                    <li key={bridge?._id} onClick={() => bridge?.published_version_id ? handleItemClick(bridge) : null}>
                        <div className={`flex justify-between items-center w-full ${!bridge?.published_version_id ? 'opacity-50' : ''}`}>
                            <p className="overflow-hidden text-ellipsis whitespace-pre-wrap">
                                {bridge?.name || 'Untitled'}
                            </p>
                            <div>
                                {!bridge?.published_version_id ? (
                                    <span className={`rounded-full capitalize bg-base-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-black ${getStatusClass("unpublished")}`}>
                                        unpublished
                                    </span>
                                ) : (
                                    <span className={`rounded-full capitalize bg-base-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-black ${getStatusClass(bridge?.bridge_status === 0 ? "paused" : bridge?.status === 0 ? "archived" : "active")}`}>
                                        {bridge?.bridge_status ? (bridge?.bridge_status === 0 && "paused") : (bridge?.status === 0 ? "archived" : "active")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </li>
                )
            })
    ), [bridges, searchQuery, connect_agents]);

    return (
        <div className="dropdown dropdown-left mt-8">
           
            <ul tabIndex={0} className="menu menu-dropdown-toggle dropdown-content z-high px-4 shadow bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto pb-1">
                <div className='flex flex-col gap-2 w-full'>
                    <li className="text-sm font-semibold disabled">Suggested Agents</li>
                    <input
                        type='text'
                        placeholder='Search Agent'
                        value={searchQuery}
                        onChange={handleInputChange}
                        className='input input-bordered w-full input-sm'
                    />
                    {
                        renderBridgeSuggestions
                    }
                </div>
            </ul>
        </div>
    )
}

export default ConnectedAgentListSuggestion