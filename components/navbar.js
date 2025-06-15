import React, { useState, useEffect, useRef } from 'react';
import { FileSliders, TestTube, MessageCircleMore, Pause, Play, ClipboardX, BookCheck, Bot, Building, ChevronRight, MoreVertical } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCustomSelector } from '@/customHooks/customSelector';
import { toggleSidebar } from '@/utils/utility';
import OrgSlider from './sliders/orgSlider';
import BridgeSlider from './sliders/bridgeSlider';
import ChatBotSlider from './sliders/chatBotSlider';
import ConfigHistorySlider from './sliders/configHistorySlider';

const SimpleNavbar = () => {
  const [activeTab, setActiveTab] = useState('configure');
  const [bridgeStatus, setBridgeStatus] = useState(1); // 1 = active, 0 = paused
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDrafted, setIsDrafted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();

  const { organizations, bridgeData } = useCustomSelector((state) => ({
    organizations: state.userDetailsReducer.organizations[pathname.split('/')[2]],
    bridgeData: state.bridgeReducer.allBridgesMap[pathname.split('/')[5]],
  }));
console.log(organizations, bridgeData);
  // Mock data for demonstration
  const agentName = bridgeData?.name || "Customer Support AI";
  const orgName = organizations?.name || "Acme Corp";
  const currentPath = pathname.split('?')[0].split('/').filter(Boolean);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const shouldShowNavbar = () => {
    if (currentPath.length === 3) return false;
    return pathname.includes('configure') || pathname.includes('history');
  };

  const handlePauseBridge = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setBridgeStatus(prev => prev === 0 ? 1 : 0);
    } catch (error) {
      console.error('Failed to toggle bridge status:', error);
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsDrafted(false);
      console.log('Publishing version...');
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'configure', label: 'Configure', icon: FileSliders },
    { id: 'testcase', label: 'Test Cases', icon: TestTube },
    { id: 'history', label: 'Chat History', icon: MessageCircleMore }
  ];
  const toggleOrgSidebar = () => toggleSidebar('default-org-sidebar');
  const toggleBridgeSidebar = () => toggleSidebar('default-agent-sidebar');
  const toggleConfigHistorySidebar = () =>
    toggleSidebar("default-config-history-slider", "right");


  const breadcrumbItems = [
    {
      label: orgName,
      icon: Building,
      handleClick: (e) => {
        e.preventDefault();
        toggleOrgSidebar();
      },
      isClickable: true
    },
    {
      label: 'Agents',
      icon: Bot,
      handleClick: (e) => {
        e.preventDefault();
        toggleBridgeSidebar();
      },
      isClickable: true
    },
    {
      label: agentName,
      icon: null,
      handleClick: (e) => {
        e.preventDefault();
      },
      current: true,
      isClickable: false
    }
  ];

  if (!shouldShowNavbar()) {
    return null;
  }

  return (
    <div className="bg-base-100">
      {/* Main Navbar */}
      <div className={`navbar sticky top-0 z-50 bg-base-100 border-b border-base-300 transition-all duration-300 ${
        isScrolled ? 'shadow-lg backdrop-blur-sm bg-base-100/95' : 'shadow-sm'
      }`}>
        
        {/* Navbar Start - Breadcrumbs */}
        <div className="navbar-start flex-1 min-w-0 ml-3">
        <div className="flex items-center gap-1 min-w-0 flex-1">
            <nav className="flex items-center space-x-1 min-w-0 flex-1" aria-label="Breadcrumb">
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <ChevronRight 
                      size={14} 
                      className="text-base-content/40 flex-shrink-0 mx-1" 
                    />
                  )}
                  <div className={`flex items-center gap-2 min-w-0 ${
                    item.current ? 'flex-shrink-0' : 'flex-shrink'
                  }`}>
                    {item.isClickable ? (
                      <button
                        onClick={item.handleClick}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200 min-w-0 ${
                          item.current
                            ? 'bg-primary/10 text-primary font-semibold cursor-default'
                            : 'text-base-content/70 hover:text-base-content hover:bg-base-200 cursor-pointer'
                        }`}
                        disabled={item.current}
                      >
                        {item.icon && (
                          <item.icon 
                            size={isMobile ? 16 : 14} 
                            className="flex-shrink-0" 
                          />
                        )}
                        <span className={`truncate ${
                          isMobile ? 'max-w-[80px]' : 'max-w-[120px] sm:max-w-[200px]'
                        } ${item.current ? 'font-semibold' : ''}`}>
                          {item.label}
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-primary/10 text-primary min-w-0">
                        {item.icon && (
                          <item.icon 
                            size={isMobile ? 16 : 14} 
                            className="flex-shrink-0" 
                          />
                        )}
                        <span className={`truncate font-semibold ${
                          isMobile ? 'max-w-[80px]' : 'max-w-[120px] sm:max-w-[200px]'
                        }`}>
                          {item.label}
                        </span>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              ))}
            {isDrafted && (
              <div className="badge badge-warning gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-warning-content animate-pulse"></div>
                <span className="hidden sm:inline">Draft</span>
              </div>
            )}
            </nav>

          </div>
          </div>

        {/* Navbar Center - Control Buttons (Desktop) */}
       
        {/* Navbar End - Tabs & More Menu */}
        <div className="navbar-end">
        {!isMobile && (
          <div className="">
            <div className="flex items-center gap-2">
              {/* Pause/Resume Button */}
              <button
                className={`btn btn-sm gap-2 ${
                  bridgeStatus === 0 ? 'btn-success' : 'btn-error'
                } ${isLoading ? 'loading' : ''}`}
                onClick={handlePauseBridge}
                disabled={isLoading}
              >
                {!isLoading && (bridgeStatus === 0 ? <Play size={14} /> : <Pause size={14} />)}
                <span className="hidden lg:inline">
                  {bridgeStatus === 0 ? 'Resume' : 'Pause'}
                </span>
              </button>

              {/* Version Control Buttons */}
              {isDrafted && (
                <button
                  className="btn btn-sm btn-outline btn-error gap-2"
                  onClick={handleDiscardChanges}
                  disabled={isLoading}
                >
                  <ClipboardX size={14} />
                  <span className="hidden lg:inline">Discard</span>
                </button>
              )}

              <button
                className={`btn btn-sm gap-2 ${
                  isDrafted ? 'btn-success' : 'btn-success btn-disabled'
                } ${isLoading ? 'loading' : ''}`}
                onClick={handlePublish}
                disabled={!isDrafted || isLoading}
              >
                {!isLoading && <BookCheck size={14} />}
                <span className="hidden lg:inline">Publish</span>
              </button>
            </div>
          </div>
        )}
<div className="flex items-center gap-2">
  {/* Tab Navigation */}
  <div className="tabs tabs-boxed bg-base-200">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`${
          activeTab === tab.id ? 'tab-active w-32' : 'w-14'
        } tab gap-2 hover:w-32 transition-all duration-200 overflow-hidden flex items-center group/btn hover:bg-base-200 flex-col`}
        title={activeTab !== tab.id ? tab.label : ''}
      >
        <tab.icon size={16} className="shrink-0" />
        <span className={`${
          activeTab === tab.id 
            ? 'opacity-100'
            : 'opacity-0 group-hover/btn:opacity-100'
        } transition-opacity duration-200 whitespace-nowrap`}>
          {tab.label}
        </span>
      </button>
    ))}
  </div>
</div>
        </div>
      </div>

      {/* Mobile Control Bar */}
      {isMobile && (
        <div className="bg-base-100 border-b border-base-300 px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Pause/Resume Button */}
            <button
              className={`btn btn-sm gap-2 flex-1 ${
                bridgeStatus === 0 ? 'btn-success' : 'btn-error'
              } ${isLoading ? 'loading' : ''}`}
              onClick={handlePauseBridge}
              disabled={isLoading}
            >
              {!isLoading && (bridgeStatus === 0 ? <Play size={14} /> : <Pause size={14} />)}
              {bridgeStatus === 0 ? 'Resume' : 'Pause'}
            </button>

            {/* Version Control Buttons */}
            {isDrafted && (
              <button
                className="btn btn-sm btn-outline btn-error gap-2 flex-1"
                onClick={handleDiscardChanges}
                disabled={isLoading}
              >
                <ClipboardX size={14} />
                Discard
              </button>
            )}

            <button
              className={`btn btn-sm gap-2 flex-1 ${
                isDrafted ? 'btn-success' : 'btn-success btn-disabled'
              } ${isLoading ? 'loading' : ''}`}
              onClick={handlePublish}
              disabled={!isDrafted || isLoading}
            >
              {!isLoading && <BookCheck size={14} />}
              Publish
            </button>
          </div>
        </div>
      )}
       {/* Sliders */}
       <OrgSlider />
      <BridgeSlider />
      <ChatBotSlider />
      <ConfigHistorySlider versionId={currentPath[4]} />
    </div>
  );
};

export default SimpleNavbar;