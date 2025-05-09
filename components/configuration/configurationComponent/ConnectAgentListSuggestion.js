import { useCustomSelector } from '@/customHooks/customSelector';
import { getStatusClass } from '@/utils/utility';
import { Info, Plus } from 'lucide-react';
import React, { useMemo, useState } from 'react';

function ConnectedAgentListSuggestion({ params, name, handleSelectAgents = () => {}, connect_agents = [], shouldToolsShow, modelName }) {
    const { bridges } = useCustomSelector((state) => ({
        bridges: state?.bridgeReducer?.org?.[params?.org_id]?.orgs || {}
    }));
    const [searchQuery, setSearchQuery] = useState('');

    const handleInputChange = (e) => {
        setSearchQuery(e.target?.value || "");
    };

    const handleItemClick = (bridge) => {
        handleSelectAgents(bridge);
    };

    const renderBridgeSuggestions = useMemo(() => (
        Object.values(bridges)
            .filter(bridge =>
                (bridge?.status === 1 || (bridge?.bridge_status && bridge?.bridge_status === 0)) && 
                (bridge.name?.toLowerCase()?.includes(searchQuery.toLowerCase())) &&
                bridge?.published_version_id
            )
            .slice()
            .sort((a, b) => {
                if (!a.name) return 1;
                if (!b.name) return -1;
                return a.name?.localeCompare(b.name);
            })
            .map((bridge) => {
                return (
                    <li key={bridge.id} onClick={() => handleItemClick(bridge)}>
                        <div className="flex justify-between items-center w-full">
                            <p className="overflow-hidden text-ellipsis whitespace-pre-wrap">
                                {bridge.name || 'Untitled'}
                            </p>
                            <div>
                                <span className={`rounded-full capitalize bg-base-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-base-content ${getStatusClass(bridge?.bridge_status === 1 ? "paused" : bridge?.status === 0 ? "archived" : "active")}`}>
                                    {bridge?.bridge_status ? (bridge?.bridge_status === 1 && "paused") : (bridge?.status === 0 ? "archived" : "active")}
                                </span>
                            </div>
                        </div>
                    </li>
                )
            })
    ), [bridges, searchQuery, connect_agents]);

    return (
        <div className="dropdown dropdown-right">
            <div className="flex items-center gap-2">
                <button tabIndex={0}
                    className="btn btn-outline btn-sm"><Plus size={16} />{name || "Connect Agent"}
                </button>
            </div>
            <ul tabIndex={0} className="menu menu-dropdown-toggle dropdown-content z-[9999999] px-4 shadow bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto pb-1">
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