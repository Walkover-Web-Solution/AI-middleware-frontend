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
        <>
            <EmbedList params={params} searchParams={searchParams} />
            <hr className="my-0 p-0 bg-base-200 border-base-300" />
            <ConnectedAgentList params={params} searchParams={searchParams} />
            <hr className="my-0 p-0 bg-base-200 border-base-300" />
            <KnowledgebaseList params={params} searchParams={searchParams} />
            <hr className="my-0 p-0 bg-base-200 border-base-300" />
        </>
    );
});

ToolsSection.displayName = 'ToolsSection';

export default ToolsSection;
