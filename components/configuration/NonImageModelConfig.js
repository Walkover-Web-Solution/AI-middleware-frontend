"use client";

import React, { memo, useMemo, useState } from 'react';
import TabsLayout from './sections/TabsLayout';
import PromptTab from './sections/PromptTab';
import ModelTab from './sections/ModelTab';
import ConnectorsTab from './sections/ConnectorsTab';
import MemoryTab from './sections/MemoryTab';
import SettingsTab from './sections/SettingsTab';
import { SparklesIcon, BotIcon, LinkIcon, BrainIcon, SettingsIcon } from '@/components/Icons';
import { useConfigurationContext } from './ConfigurationContext';

const NonImageModelConfig = memo(() => {
     const { 
        isPublished,
        isEditor
    } = useConfigurationContext();
    const [activeTab, setActiveTab] = useState('prompt');

    const tabs = useMemo(() => ([
        { id: 'prompt', label: 'Prompt', icon: SparklesIcon, content: <PromptTab isPublished={isPublished}  /> },
        { id: 'model', label: 'Model', icon: BotIcon, content: <ModelTab isPublished={isPublished} /> },
        { id: 'connectors', label: 'Connectors', icon: LinkIcon, content: <ConnectorsTab isPublished={isPublished} /> },
        { id: 'memory', label: 'Memory', icon: BrainIcon, content: <MemoryTab isPublished={isPublished} /> },
        { id: 'settings', label: 'Settings', icon: SettingsIcon, content: <SettingsTab isPublished={isPublished} /> },
    ]), []);

    return (
        <TabsLayout
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        />
    );
});

NonImageModelConfig.displayName = 'NonImageModelConfig';

export default NonImageModelConfig;
