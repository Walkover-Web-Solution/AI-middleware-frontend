import { memo } from 'react';
import { AlertIcon } from "@/components/Icons";
import EmbedList from "./configurationComponent/embedList";
import ConnectedAgentList from "./configurationComponent/ConnectedAgentList";
import KnowledgebaseList from "./configurationComponent/knowledgebaseList";
import { useConfigurationContext } from './ConfigurationContext';

const ToolsSection = memo(() => {
    const { params, searchParams, shouldToolsShow } = useConfigurationContext();

    if (!shouldToolsShow) {
        return (
            <div className="flex items-center gap-2 mt-3 mb-3">
                <AlertIcon size={18} className="text-warning" />
                <h2 className="text-center">This model does not support tools</h2>
            </div>
        );
    }

    return (
        <div className='flex mt-4 gap-4 flex-col'>
            <EmbedList params={params} searchParams={searchParams} />
            <ConnectedAgentList params={params} searchParams={searchParams} />
            <KnowledgebaseList params={params} searchParams={searchParams} />
        </div>
    );
});

ToolsSection.displayName = 'ToolsSection';

export default ToolsSection;
