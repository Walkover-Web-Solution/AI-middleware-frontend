import React, { useState, useEffect, useRef } from 'react';
import { FileSliders, TestTube, MessageCircleMore, Pause, Play, ClipboardX, BookCheck,Settings,MoreVertical,Copy,Archive,Trash2,Bot,Home, Building,} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toggleSidebar } from '@/utils/utility';
import OrgSlider from './sliders/orgSlider';
import BridgeSlider from './sliders/bridgeSlider';
import ChatBotSlider from './sliders/chatBotSlider';
import ConfigHistorySlider from './sliders/configHistorySlider';

const Navbar = ({ params }) => {
  const [activeTab, setActiveTab] = useState('configure');
  const [bridgeStatus, setBridgeStatus] = useState(1); // 1 = active, 0 = paused
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDrafted, setIsDrafted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  
  // Mock data for demonstration
  const agentName = "Customer Support AI";
  const orgName = "Acme Corp";
  const currentPath = pathname.split('?')[0].split('/').filter(Boolean);
  
  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Keyboard navigation for dropdown
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isDropdownOpen && event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isDropdownOpen]);
  
  // Check if we should show the navbar
  const shouldShowNavbar = () => {
    if (currentPath.length === 3) return false;
    return pathname.includes('configure') || pathname.includes('history');
  };

  // Check if current page is history
  const isHistoryPage = pathname.includes('history');
  
  const handlePauseBridge = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setBridgeStatus(prev => prev === 0 ? 1 : 0);
    } catch (error) {
      console.error('Failed to toggle bridge status:', error);
      // Handle error - could show toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardChanges = () => {
    if (window.confirm('Are you sure you want to discard all changes? This action cannot be undone.')) {
      setIsDrafted(false);
      console.log('Discarding changes...');
    }
  };

  const handlePublish = async () => {
    if (!isDrafted) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsDrafted(false);
      console.log('Publishing version...');
      // Could show success toast
    } catch (error) {
      console.error('Failed to publish:', error);
      // Handle error - could show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleDropdownAction = (action) => {
    console.log(`Action: ${action}`);
    setIsDropdownOpen(false);
    
    // Handle different actions with confirmations for destructive actions
    switch (action) {
      case 'delete':
        if (window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
          console.log('Deleting agent...');
        }
        break;
      case 'archive':
        if (window.confirm('Are you sure you want to archive this agent?')) {
          console.log('Archiving agent...');
        }
        break;
      case 'duplicate':
        console.log('Duplicating agent...');
        break;
      default:
        break;
    }
  };

  const tabs = [
    { id: 'configure', label: 'Configure', icon: FileSliders },
    { id: 'testcase', label: 'Test Cases', icon: TestTube },
    { id: 'history', label: 'Chat History', icon: MessageCircleMore }
  ];

  // Fixed sidebar toggle functions
  const toggleOrgSidebar = () => toggleSidebar('default-org-sidebar');
  const toggleBridgeSidebar = () => toggleSidebar('default-agent-sidebar');
  const toggleChatbotSidebar = () => toggleSidebar('default-chatbot-sidebar');
  const toggleConfigHistorySidebar = () =>
    toggleSidebar("default-config-history-slider", "right");

  // Fixed breadcrumb items with proper click handlers
  const breadcrumbItems = [
    { 
      label: 'org', 
      icon: Building, 
      handleClick: (e) => {
        e.preventDefault();
        toggleOrgSidebar();
      }
    },
    { 
      label: orgName, 
      icon: Settings, 
      handleClick: (e) => {
        e.preventDefault();
        router.push(`/org`);
      }
    },
    { 
      label: 'Agents', 
      icon: Bot, 
      handleClick: (e) => {
        e.preventDefault();
        toggleBridgeSidebar();
      }
    },
    { 
      label: agentName, 
      icon: null, 
      handleClick: (e) => {
        e.preventDefault();
        // Current page - no action needed
      }, 
      current: true 
    }
  ];

  // Don't render navbar if conditions aren't met
  if (!shouldShowNavbar()) {
    return null;
  }

  const handleSwitchTab = (tab) => {
    router.push(`org/${currentPath[1]}/agents/${currentPath[3]}/${currentPath[4]}/${tab.id}`);
    setActiveTab(tab.id);
  };

  return (
    <div className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-50 shadow-sm min-h-16 ml-4">
      <div className="navbar-start flex-1">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumbs text-sm max-w-none">
          <ul>
            {breadcrumbItems.map((item, index) => (
              <li key={index} className={item?.current ? 'font-semibold' : ''}>
                <a 
                  href="#" 
                  className={`flex items-center gap-2 ${
                    item?.current 
                      ? 'text-primary cursor-default' 
                      : 'text-base-content/70 hover:text-base-content transition-colors cursor-pointer'
                  }`}
                  onClick={item?.handleClick}
                >
                  {item?.icon && <item.icon size={14} />}
                  <span className="truncate max-w-[120px] sm:max-w-[200px]">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Agent Controls */}
        {currentPath.includes('agents') && (
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-base-300">
            {/* Pause/Resume Button */}
            <div className="tooltip" data-tip={bridgeStatus === 0 ? 'Resume Agent' : 'Pause Agent'}>
              <button 
                className={`btn btn-sm gap-2 flex-col ${
                  bridgeStatus === 0 ? 'btn-success' : 'btn-error'
                } ${isLoading ? 'loading' : ''}`}
                onClick={handlePauseBridge}
                disabled={isLoading}
                aria-label={bridgeStatus === 0 ? 'Resume Agent' : 'Pause Agent'}
              >
                {!isLoading && (bridgeStatus === 0 ? <Play size={14} /> : <Pause size={14} />)}
                <span className="hidden sm:inline">
                  {bridgeStatus === 0 ? 'Resume' : 'Pause'}
                </span>
              </button>
            </div>

            {/* Version Control Actions */}
            {!isHistoryPage && (
              <div className="flex items-center gap-2">
                {isDrafted && (
                  <div className="tooltip" data-tip="Discard all changes">
                    <button
                      className="btn btn-sm btn-outline btn-error gap-2 flex-col"
                      onClick={handleDiscardChanges}
                      disabled={isLoading}
                    >
                      <ClipboardX size={14} />
                      <span className="hidden sm:inline">Discard</span>
                    </button>
                  </div>
                )}
                
                <div className="tooltip tooltip-bottom" data-tip={isDrafted ? "Publish changes" : "No changes to publish"}>
                  <button
                    className={`btn btn-sm gap-2 flex-col ${
                      isDrafted ? 'btn-success' : 'btn-success btn-disabled'
                    } ${isLoading ? 'loading' : ''}`}
                    onClick={handlePublish}
                    disabled={!isDrafted || isLoading}
                  >
                    {!isLoading && <BookCheck size={14} />}
                    <span className="hidden sm:inline">Publish</span>
                  </button>
                </div>
                
                <div className="divider divider-horizontal"></div>
              </div>
            )}

            {/* Agent Actions Dropdown */}
            {/* <div className="dropdown dropdown-end" ref={dropdownRef}>
              <div 
                tabIndex={0} 
                role="button" 
                className="btn btn-sm btn-ghost gap-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="Agent actions"
              >
                <MoreVertical size={14} />
              </div>
              
              {isDropdownOpen && (
                <ul 
                  tabIndex={0} 
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg border border-base-300"
                >
                  <li>
                    <button
                      className="flex items-center gap-3"
                      onClick={() => handleDropdownAction('duplicate')}
                    >
                      <Copy size={14} />
                      Duplicate Agent
                    </button>
                  </li>
                  <li>
                    <button
                      className="flex items-center gap-3"
                      onClick={() => handleDropdownAction('archive')}
                    >
                      <Archive size={14} />
                      Archive Agent
                    </button>
                  </li>
                  <div className="divider my-1"></div>
                  <li>
                    <button
                      className="flex items-center gap-3 text-error hover:bg-error hover:text-error-content"
                      onClick={() => handleDropdownAction('delete')}
                    >
                      <Trash2 size={14} />
                      Delete Agent
                    </button>
                  </li>
                </ul>
              )}
            </div> */}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      {currentPath.includes('agents') && (
        <div className="navbar-end">
          <div className="tabs tabs-boxed bg-base-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleSwitchTab(tab)}
                className={`tab gap-2 ${
                  activeTab === tab.id ? 'tab-active' : ''
                }`}
                aria-label={tab.label}
              >
                <tab.icon size={16} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Agent Status Bar */}
      {currentPath.includes('agents') && (
        <div className={`absolute top-full left-0 right-0 px-6 py-2 text-xs mb-3 ${
          bridgeStatus === 1 
            ? 'bg-base-300 text-success-content' 
            : 'bg-error text-error-content'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                bridgeStatus === 1 ? 'bg-success-content' : 'bg-error-content'
              } animate-pulse`}></div>
              <span className="font-medium">
                Agent is currently {bridgeStatus === 1 ? 'active' : 'paused'}
              </span>
            </div>
            
            {!isHistoryPage && isDrafted && (
              <div className="badge badge-warning badge-sm gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-warning-content"></div>
                Draft Changes
              </div>
            )}
          </div>
        </div>
      )}
       {/* org slider  */}
       <OrgSlider />

{/* Agent slider */}
<BridgeSlider />

{/* chatbot slider */}
<ChatBotSlider />
<ConfigHistorySlider versionId={currentPath[4]} />
    </div>
  );
};

export default Navbar;