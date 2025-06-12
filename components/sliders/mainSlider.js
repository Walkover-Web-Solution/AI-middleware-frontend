import { logoutUserFromMsg91 } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { toggleSidebar, getIconOfService } from '@/utils/utility';
import { truncate } from "@/components/historyPageComponents/assistFile";
import { AlignJustify, BookOpen, MessageSquare, Building2, ChevronDown, Cog, Database, Shield, BarChart3, LogOut, Mail, MessageSquareMore, Users, Settings2, AlertTriangle, UserPlus, Home, FileSliders, TestTube, History, Rss, Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function MainSlider() {
  const pathName = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams()
  const path = pathName.split('?')[0].split('/')
  const bridgeId = path[5];
  const versionId = searchParams.get('version')
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const { userdetails, organizations, bridgeData, chatbotData } = useCustomSelector((state) => ({
    userdetails: state?.userDetailsReducer?.userDetails,
    organizations: state.userDetailsReducer.organizations,
    bridgeData: state.bridgeReducer.allBridgesMap[bridgeId],
    chatbotData: state.ChatBot.ChatBotMap[bridgeId],
  }));

  useEffect(()=>{
    if(path.length === 4) setIsExpanded(true)
  },[path])

  useEffect(()=>{
    if(path.length > 4) setIsExpanded(false)
  },[path.length])

  const Icons = {
    org: <Building2 />,
    agents: <Users />,
    chatbot: <MessageSquare />,
    pauthkey: <Shield />,
    apikeys: <Database />,
    alerts: <AlertTriangle />,
    invite: <UserPlus />,
    metrics: <BarChart3 />,
    knowledge_base: <BookOpen />,
    feedback: <MessageSquareMore />
  }
console.log(path.length)
  // Navigation sections
  const navigationSections = [
    {
      items: ['agents']
    },
    {
      title: 'SECURITY & ACCESS', 
      items: ['pauthkey', 'apikeys']
    },
    {
      title: 'MONITORING & SUPPORT',
      items: ['alerts', 'metrics', 'knowledge_base']
    },
    {
      title: 'TEAM & COLLABORATION',
      items: ['invite', 'feedback']
    }
  ];

  const logoutHandler = async () => {
    try {
      await logoutUserFromMsg91({
        headers: {
          proxy_auth_token: localStorage.getItem('proxy_token'),
        },
      });
      localStorage.clear();
      sessionStorage.clear();
      router.replace('/');
    } catch (e) {
      console.error(e);
    }
  };

  const toggleOrgSidebar = () => toggleSidebar('default-org-sidebar');
  const toggleBridgeSidebar = () => toggleSidebar('default-agent-sidebar');
  const toggleChatbotSidebar = () => toggleSidebar('default-chatbot-sidebar');
  const toggleConfigHistorySidebar = () => toggleSidebar("default-config-history-slider", "right");

  const handleSwitchOrganization = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const drawer = document.getElementById("my-drawer-2");
    if (drawer) {
      drawer.checked = false;
    }
    setTimeout(() => {
      toggleOrgSidebar();
    }, 100);
    e.target.blur();
  };

  const getItemDisplayName = (item) => {
    if (item === 'knowledge_base') return 'Knowledge base';
    if (item === 'feedback') return 'Feedback';
    return item.charAt(0).toUpperCase() + item.slice(1);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    setHoveredItem(null); // Reset hovered item when toggling
  };

  const handleItemHover = (itemKey, event) => {
    if (!isExpanded) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8
      });
      setHoveredItem(itemKey);
    }
  };

  const handleItemLeave = () => {
    setHoveredItem(null);
  };

  // Tooltip component for individual items
  const ItemTooltip = ({ itemKey, children, text }) => {
    const isHovered = hoveredItem === itemKey && !isExpanded;
    
    return (
      <>
        {children}
        {isHovered && (
          <div 
            className="fixed z-[200] bg-base-300 text-base-content px-3 py-2 rounded-lg shadow-lg whitespace-nowrap border"
            style={{
              top: `${tooltipPosition.top - 20}px`,
              left: `${tooltipPosition.left}px`
            }}
          >
            <div className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-base-300 border rotate-45 -left-1 border-r-0 border-b-0"></div>
            {text}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="relative">
      <div className={`${path.length === 4 ? '' : 'fixed left-0 top-0'}  h-screen bg-base-100 border-r transition-all duration-300 z-[100] ${
        isExpanded ? 'w-72' : 'w-16'
      }`}>
        
        {/* Toggle Button at Border */}
        {path.length !== 4 && <button 
          onClick={toggleExpanded}
          className="absolute -right-3 top-6 w-6 h-6 bg-base-100 border border-base-300 rounded-full flex items-center justify-center hover:bg-base-200 transition-colors z-10 shadow-sm"
        >
          {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>}

        <div className="flex flex-col h-full py-4">
          {/* Navigation Items */}
          <div className="flex-grow overflow-y-auto px-2">
            {/* Organization */}
            {path.length > 4 && (
              <div className="mb-6">
                <ItemTooltip itemKey="org" text={organizations[path[2]]?.name}>
                  <button 
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                    onClick={toggleOrgSidebar}
                    onMouseEnter={(e) => handleItemHover('org', e)}
                    onMouseLeave={handleItemLeave}
                  >
                    <Building2 size={20} className="shrink-0" />
                    {isExpanded && <span>{truncate(organizations[path[2]]?.name, 15)}</span>}
                  </button>
                </ItemTooltip>
              </div>
            )}

            {/* Sectioned Navigation */}
            {navigationSections.map((section, sectionIndex) => (
              <div key={section.title || sectionIndex} className="mb-6">
                {isExpanded && section.title && (
                  <h3 className="px-3 mb-3 text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section?.items?.map((item) => (
                    <ItemTooltip key={item} itemKey={item} text={getItemDisplayName(item)}>
                      <button
                        onClick={() => router.push(`/org/${path[2]}/${item}`)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          path[3] === item ? "bg-primary text-primary-content" : "hover:bg-base-200"
                        }`}
                        onMouseEnter={(e) => handleItemHover(item, e)}
                        onMouseLeave={handleItemLeave}
                      >
                        <div className="shrink-0">
                          {Icons[item]}
                        </div>
                        {isExpanded && (
                          <span className="font-medium">
                            {getItemDisplayName(item)}
                          </span>
                        )}
                      </button>
                    </ItemTooltip>
                  ))}
                </div>
              </div>
            ))}

            {/* Agent Section */}
            {path[3] === 'agents' && path.length === 6 && (
              <div className="border-t pt-4 mb-4">
                {/* Current Agent */}
                <div className="mb-2">
                  <ItemTooltip itemKey="current-agent" text={bridgeData?.name}>
                    <button 
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                      onClick={toggleBridgeSidebar}
                      onMouseEnter={(e) => handleItemHover('current-agent', e)}
                      onMouseLeave={handleItemLeave}
                    >
                      <div className="shrink-0">
                        {getIconOfService(bridgeData?.service, 20, 20)}
                      </div>
                      {isExpanded && <span>{truncate(bridgeData?.name, 15)}</span>}
                    </button>
                  </ItemTooltip>
                </div>

                {/* Updates History Button */}
                <div className="ml-2">
                  <ItemTooltip itemKey="updates-history" text="Updates History">
                    <button
                      onClick={toggleConfigHistorySidebar}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors"
                      onMouseEnter={(e) => handleItemHover('updates-history', e)}
                      onMouseLeave={handleItemLeave}
                    >
                      <History size={16} className="shrink-0" />
                      {isExpanded && <span className="text-sm">Updates History</span>}
                    </button>
                  </ItemTooltip>
                </div>
              </div>
            )}

            {/* Chatbot Section */}
            {path[3] === 'chatbot' && path[4] === 'configure' && (
              <div className="border-t pt-4 mb-4">
                <ItemTooltip itemKey="chatbot" text={chatbotData?.title}>
                  <button 
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                    onClick={toggleChatbotSidebar}
                    onMouseEnter={(e) => handleItemHover('chatbot', e)}
                    onMouseLeave={handleItemLeave}
                  >
                    <Rss size={20} className="shrink-0" />
                    {isExpanded && <span>{chatbotData?.title}</span>}
                  </button>
                </ItemTooltip>
              </div>
            )}

          </div>

          {/* Bottom Section */}
          <div className="mt-auto px-2">
            {/* Settings */}
            <div className="w-full">
              <ItemTooltip itemKey="settings" text="Settings">
                <details className="w-full">
                  <summary 
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors cursor-pointer list-none"
                    onMouseEnter={(e) => handleItemHover('settings', e)}
                    onMouseLeave={handleItemLeave}
                  >
                    <Settings2 size={20} className="shrink-0" />
                    {isExpanded && (
                      <>
                        <span className="flex-1">Settings</span>
                        <ChevronDown size={16} />
                      </>
                    )}
                  </summary>
                  
                  {isExpanded && (
                    <div className="mt-2 space-y-1 bg-base-200 rounded-lg p-2">
                      <div className="flex items-center gap-3 p-2 text-sm">
                        <Mail size={16} />
                        <span className="truncate">{userdetails.email}</span>
                      </div>
                      
                      <button
                        onClick={() => router.push(`/org/${path[2]}/userDetails`)}
                        className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
                      >
                        <Cog size={16} />
                        <span>Update User Details</span>
                      </button>
                      
                      <button
                        onClick={() => router.push(`/org/${path[2]}/workspaceSetting`)}
                        className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
                      >
                        <Cog size={16} />
                        <span>Workspace Setting</span>
                      </button>
                      
                      <button
                        onClick={logoutHandler}
                        className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </details>
              </ItemTooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Content Spacer */}
      <div className={`${path.length === 3 ? 'relative' : 'absolute'} top-0 left-0 transition-all duration-300`} style={{width: isExpanded ? '288px' : '64px'}}>
        {/* Your main content goes here */}
      </div>
    </div>
  );
}

export default MainSlider;