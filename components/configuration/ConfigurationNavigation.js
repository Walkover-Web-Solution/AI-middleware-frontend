import React from 'react';
import { BotIcon, SettingsIcon } from "@/components/Icons";

const ConfigurationNavigation = ({ 
    bridgeType, 
    currentView, 
    handleNavigation, 
    isEmbedUser, 
    showConfigType 
}) => {
    if (!((isEmbedUser && showConfigType) || !isEmbedUser) || bridgeType !== 'chatbot') {
        return null;
    }

    return (
        <div className="join group flex">
            <button
                onClick={() => handleNavigation('config')}
                className={`${currentView === 'config' ? "btn-primary w-32" : "w-14"} btn join-item hover:w-32 transition-all duration-200 overflow-hidden flex flex-col items-center gap-1 group/btn`}
            >
                <SettingsIcon size={16} className="shrink-0" />
                <span className={`${currentView === 'config' ? "opacity-100" : "opacity-0 group-hover/btn:opacity-100"} transition-opacity duration-200`}>
                    Agent Config
                </span>
            </button>
            <button
                onClick={() => handleNavigation('chatbot-config')}
                className={`${currentView === 'chatbot-config' ? "btn-primary w-32" : "w-14"} btn join-item hover:w-32 transition-all duration-200 overflow-hidden flex flex-col items-center gap-1 group/btn`}
            >
                <BotIcon size={16} className="shrink-0" />
                <span className={`${currentView === 'chatbot-config' ? "opacity-100" : "opacity-0 group-hover/btn:opacity-100"} transition-opacity duration-200`}>
                    Chatbot Config
                </span>
            </button>
        </div>
    );
};

export default React.memo(ConfigurationNavigation);
