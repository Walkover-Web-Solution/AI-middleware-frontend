"use client"
import { useCustomSelector } from '@/customHooks/customSelector';
import { archiveBridgeAction, deleteBridgeAction, dicardBridgeVersionAction, duplicateBridgeAction, getAllBridgesAction, updateBridgeAction, updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { updateBridgeVersionReducer } from '@/store/reducer/bridgeReducer';
import { MODAL_TYPE } from '@/utils/enums';
import { getIconOfService, openModal, toggleSidebar } from '@/utils/utility';
import { Building2, ChevronDown, Ellipsis, FileSliders, History, Home, Rss, TestTube, MessageCircleMore, Play, Pause, File } from 'lucide-react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import BridgeSlider from './sliders/bridgeSlider';
import ChatBotSlider from './sliders/chatBotSlider';
import OrgSlider from './sliders/orgSlider';
import ConfigHistorySlider from "./sliders/configHistorySlider";

function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const versionId = searchParams.get('version')
  const dispatch = useDispatch();
  const pathName = usePathname();
  const path = pathName.split('?')[0].split('/')
  const bridgeId = path[5];
  const { organizations, bridgeData, chatbotData, bridge, publishedVersion, isdrafted } = useCustomSelector((state) => ({
    organizations: state.userDetailsReducer.organizations,
    bridgeData: state.bridgeReducer.allBridgesMap[bridgeId],
    chatbotData: state.ChatBot.ChatBotMap[bridgeId],
    bridge: state.bridgeReducer.allBridgesMap[bridgeId] || [],
    publishedVersion: state?.bridgeReducer?.allBridgesMap?.[bridgeId]?.published_version_id || [],
    isdrafted: state?.bridgeReducer?.bridgeVersionMapping?.[bridgeId]?.[versionId]?.is_drafted,
  }));
  const handleDeleteBridge = async (item, newStatus = 0) => {
    const orgId = path[2];

    switch (item.trim().toLowerCase()) {
      case 'duplicate':
        try {
          dispatch(duplicateBridgeAction(bridgeId)).then((newBridgeId) => {
            if (newBridgeId) {
              router.push(`/org/${path[2]}/bridges/configure/${newBridgeId}`)
              toast.success('Bridge duplicate successfully');
            }
          });
        } catch (error) {
          console.error('Failed to duplicate bridge:', error);
          toast.error('Error duplicating bridge');
        }
        break;

      case 'delete':
        // Confirm delete action
        const confirmDelete = window.confirm('Are you sure you want to delete this bridge?');

        if (confirmDelete) {
          try {
            // Dispatch delete bridge action and get all bridges
            await dispatch(deleteBridgeAction({ bridgeId, orgId }));
            router.push(`/org/${orgId}/bridges`);
            toast.success('Bridge deleted successfully');
            dispatch(getAllBridgesAction());
          } catch (error) {
            console.error('Failed to delete bridge:', error);
            toast.error('Error deleting bridge');
          }
        }
        break;

      case "archive":
        try {
          dispatch(archiveBridgeAction(bridgeId, newStatus)).then((bridgeStatus) => {
            if (bridgeStatus === 1) {
              toast.success('Bridge Unarchived Successfully');
            } else {
              toast.success('Bridge Archived Successfully');
            }
            router.push(`/org/${orgId}/bridges`);
          });
        } catch (error) {
          console.error('Failed to archive/unarchive bridge', error);
        }
        break;
      default:
        break;
    }
  };

  const handleDiscardChanges = async () => {
    dispatch(updateBridgeVersionReducer({ bridges: { ...bridge, _id: versionId, parent_id: bridgeId, is_drafted: false } }));
    dispatch(dicardBridgeVersionAction({ bridgeId, versionId }));
  }
   const handlePauseBridge = (status) => {
    dispatch(updateBridgeAction({
      bridgeId: bridgeId, 
      dataToSend: {
        bridge_status: status === 'paused' ? 0 : 1
      }
    }));
  }
  const toggleOrgSidebar = () => toggleSidebar('default-org-sidebar');
  const toggleBridgeSidebar = () => toggleSidebar('default-bridge-sidebar');
  const toggleChatbotSidebar = () => toggleSidebar('default-chatbot-sidebar');
  const toggleConfigHistorySidebar = () =>
    toggleSidebar("default-config-history-slider", "right");

  return (
    <div className='z-[999]'>
      <div className={` ${pathName === '/' || pathName.endsWith("alerts") ? 'hidden' : 'flex items-center justify-between '} w-full navbar border flex-wrap md:flex-nowrap z-[9] max-h-[4rem] bg-base-100 sticky top-0`}>
        <div className={`flex items-center w-full justify-start gap-2 ${path.length > 4 ? '' : 'hidden'}`}>
          <button className="btn m-1" onClick={() => router.push(`/org/${path[2]}/bridges`)}>
            <Home size={16} />
          </button>
          <button className="btn m-1" onClick={toggleOrgSidebar}>
            <Building2 size={16} /> {organizations[path[2]]?.name}
          </button>
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn capitalize m-1 ">{path[3] === 'apikeys' ? 'API Keys' : path[3]}<ChevronDown size={16} /></div>
            <ul tabIndex={0} className="dropdown-content z-[99] menu p-2 shadow bg-base-100 rounded-box w-52">
              {['bridges', 'pauthkey', 'apikeys', 'knowledge_base', 'alerts', 'invite', 'metrics'].map((item) => (
                <li key={item} onClick={() => router.push(`/org/${path[2]}/${item}`)}>
                  <a className={path[3] === item ? "active" : ""}>
                    {item === 'knowledge_base' ? 'Knowledge Base' : item.charAt(0).toUpperCase() + item.slice(1)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {path[3] === 'bridges' && path.length === 6 && <button className="btn m-1" onClick={toggleBridgeSidebar}> {getIconOfService(bridgeData?.service)}  {bridgeData?.name} </button>}
          {path[3] === 'chatbot' && path[4] === 'configure' && <button className="btn m-1" onClick={toggleChatbotSidebar}> <Rss size={16} /> {chatbotData?.title} </button>}
        </div>

        <div className="justify-end w-full" >
          {path.length === 6 && path[3] === 'bridges' ? (
            <>
          {/* Add Pause/Resume Button */}
          <button 
              className={`btn m-1 tooltip tooltip-left ${bridge?.bridge_status === 0 ? 'bg-green-200 hover:bg-green-300' : 'bg-red-200 hover:bg-red-300'}`}
              data-tip={bridge?.bridge_status === 0 ? 'Resume Bridge' : 'Pause Bridge'}
              onClick={() => handlePauseBridge(bridge?.bridge_status === 0 ? 'resume' : 'paused')}
            >
              {bridge?.bridge_status === 0 ? <Play size={16} /> : <Pause size={16} />}
            </button>
              <button className="btn m-1 tooltip tooltip-left" data-tip="Updates History" onClick={toggleConfigHistorySidebar}>
                <History size={16} />
              </button>
              {path[4] === 'configure' && (
                <div className='flex items-center'>
                  {(isdrafted && publishedVersion === versionId) && (
                    <div className="tooltip tooltip-left" data-tip="Your changes are discarded & will be synced by publish version.">
                      <div className='flex items-center gap-2'>
                        <button
                          className="btn bg-red-200 m-1 hover:bg-red-300"
                          onClick={handleDiscardChanges}
                        >
                          <span className='text-black'>Discard Changes</span>
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    className="btn bg-green-200 hover:bg-green-300"
                    onClick={() => openModal(MODAL_TYPE.PUBLISH_BRIDGE_VERSION)}
                    disabled={!isdrafted && publishedVersion === versionId}
                  >
                    Publish Version
                  </button>
                  <div className="divider divider-horizontal mx-1"></div>
                </div>
              )}
              <div className="join group flex">
              <button 
                onClick={() => router.push(`/org/${path[2]}/bridges/configure/${bridgeId}?version=${versionId}`)} 
                className={`${path[4] === 'configure' ? "btn-primary w-32" : "w-14"} btn join-item  hover:w-32 transition-all duration-200 overflow-hidden flex flex-col items-center gap-1 group/btn`}
              >
                <FileSliders size={16} className="shrink-0" />
                <span className={`${path[4] === 'configure' ? "opacity-100" : "opacity-0 group-hover/btn:opacity-100"} transition-opacity duration-200`}>Configure Bridge</span>
              </button>
                <button 
                onClick={() => router.push(`/org/${path[2]}/bridges/testcase/${bridgeId}?version=${versionId}`)} 
                className={`${path[4] === 'testcase' ? "btn-primary w-32" : "w-14"} btn join-item  hover:w-32 transition-all duration-200 overflow-hidden flex flex-col items-center gap-2 group/btn`}
              >
                <TestTube size={16} className="shrink-0" />
                <span className={`${path[4] === 'testcase' ? "opacity-100" : "opacity-0 group-hover/btn:opacity-100"} transition-opacity duration-200`}>Test Cases</span>
              </button>
              
                <button 
                onClick={() => router.push(`/org/${path[2]}/bridges/history/${bridgeId}?version=${versionId}`)} 
                className={`${path[4] === 'history' ? "btn-primary w-32" : "w-14"} btn join-item  hover:w-32 transition-all duration-200 overflow-hidden flex flex-col items-center gap-2 group/btn`}
              >
                <MessageCircleMore size={16} className="shrink-0" />
                <span className={`${path[4] === 'history' ? "opacity-100" : "opacity-0 group-hover/btn:opacity-100"} transition-opacity duration-200`}>Chat History</span>
              </button>
              </div>
              <div className='ml-2'>
              </div>
            </>
          ) : (
            path[3] === 'apikeys' ?
              <button className="btn  btn-primary" onClick={() => openModal(MODAL_TYPE.API_KEY_MODAL)}>+ Add new Api key</button>
              : path[3] === 'pauthkey' ?
                <button className="btn  btn-primary" onClick={() => openModal(MODAL_TYPE.PAUTH_KEY_MODAL)}>+ create new Pauth Key</button>
                :
                path[3] === 'alerts' ?
                  <button className="btn  btn-primary" onClick={() => openModal(MODAL_TYPE.WEBHOOK_MODAL)}>+ create new Alert</button>
                  :
                  path[3] === 'bridges' ?
                    <div>
                      <button className="btn btn-primary" onClick={() => openModal(MODAL_TYPE.CREATE_BRIDGE_MODAL)}>
                        + create new bridge
                      </button>
                    </div> :
                    path[3] === 'metrics' ?
                      <div>
                        <button className="btn btn-primary" onClick={() => router.push(`/org/${path[2]}/alerts`)}>
                          Configure Alerts
                        </button>
                      </div> :
                      (path[3] === 'chatbot' && path.length === 4) ?
                        <button className="btn btn-primary" onClick={() => openModal(MODAL_TYPE.CHATBOT_MODAL)}>
                          + create new chatbot
                        </button> : path[3] === 'knowledge_base' ?
                          <button className="btn btn-primary" onClick={() => openModal(MODAL_TYPE.KNOWLEDGE_BASE_MODAL)}>
                            + Add new Knowledge base
                          </button> : ""
          )}
        </div>
      </div>
      {/* org slider  */}
      <OrgSlider />

      {/* bridge slider */}
      <BridgeSlider />

      {/* chatbot slider */}
      <ChatBotSlider />
      <ConfigHistorySlider versionId={versionId} />
    </div>
  );
}

export default Navbar;
