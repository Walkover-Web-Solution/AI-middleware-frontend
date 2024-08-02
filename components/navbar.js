"use client"
import { logoutUserFromMsg91, switchOrg, switchUser } from '@/config';
import { useCustomSelector } from '@/customSelector/customSelector';
import { deleteBridgeAction, duplicateBridgeAction, getAllBridgesAction } from '@/store/action/bridgeAction';
import { setCurrentOrgIdAction } from '@/store/action/orgAction';
import { Building2, ChevronDown, Ellipsis, FileSliders, History, Home, KeyRound, LogOut, Mail, Rss, Settings2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import CreateNewBridge from './createNewBridge';
import OpenAiIcon from '@/icons/OpenAiIcon';
import GeminiIcon from '@/icons/GeminiIcon';
import AddVariable from './addVariable';

function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathName = usePathname()
  const path = pathName.split('?')[0].split('/')
  const userdetails = useCustomSelector((state) => state?.userDetailsReducer?.userDetails);
  const organizations = useCustomSelector((state) => state.userDetailsReducer.organizations);
  const bridgesList = useCustomSelector((state) => state.bridgeReducer.org[path[2]]) || [];
  const bridgeData = useCustomSelector((state) => state.bridgeReducer.allBridgesMap[path[5]]);
  const chatbotList = useCustomSelector((state) => state?.ChatBot?.org[path[2]]) || [];
  const chatbotData = useCustomSelector((state) => state.ChatBot.ChatBotMap[path[5]])
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenBridge, setIsOpenBridge] = useState(false)
  const [isOpenChatbot, setIsOpenChatbot] = useState(false)
  const [searchQuery, setSearchQuery] = useState('');
  const [bridgeSearchQuery, setBridgeSearchQuery] = useState('');
  const [chatbotSearchQuery, setChatbotSearchQuery] = useState(''); 
    const [showAddVaribablePopup, setShowAddVariablePopup] = useState(false);
  const sidebarRef = useRef(null);
  const sideBridgeRef = useRef(null);
  const sideBotRef = useRef(null);

  // Event handler for bridge search query change
  const handleBridgeSearchChange = (e) => {
    setBridgeSearchQuery(e.target.value);
  };

  const handleChatbotSearchChange = (e) => {
    setChatbotSearchQuery(e.target.value);
  };

  // Filtered bridge list based on search query
  const filteredBridgesList = bridgesList.filter(
    (item) => item.name.toLowerCase().includes(bridgeSearchQuery.toLowerCase())
  );


  const filteredChatbotsList = chatbotList.filter(
    (item) => item?.title?.toLowerCase().includes(chatbotSearchQuery.toLowerCase())
  );



  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
      if (sideBridgeRef.current && !sideBridgeRef.current.contains(e.target)) {
        setIsOpenBridge(false);
      }
    };

    const handleEscapePress = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsOpenBridge(false);
        setSearchQuery("");
        setBridgeSearchQuery("");
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscapePress);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapePress);
    };
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const toggleBridgeSidebar = () => {
    setIsOpenBridge(!isOpenBridge);
  };
  const toggleChatbotSidebar = () => {
    setIsOpenChatbot(!isOpenChatbot);
  };

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

  const handleSwitchOrg = async (id, name) => {
    try {
      const response = await switchOrg(id);
      if (process.env.NEXT_PUBLIC_ENV === 'local') {
        const localToken = await switchUser({
          orgId: id,
          orgName: name
        })
        localStorage.setItem('local_token', localToken.token);
      }
      router.push(`/org/${id}/bridges`);
      dispatch(setCurrentOrgIdAction(id));
      if (response.status !== 200) {
        console.error('Failed to switch organization', response.data);
      }
    } catch (error) {
      console.error('Error switching organization', error);
    }
  };

  const filteredOrganizations = Object.values(organizations).filter(
    (item) => item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
      if (sideBridgeRef.current && !sideBridgeRef.current.contains(e.target)) {
        setIsOpenBridge(false);
      }
      if (sideBotRef.current && !sideBotRef.current.contains(e.target)) {
        setIsOpenChatbot(false);
      }
    };

    const handleEscapePress = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsOpenBridge(false);
        setIsOpenChatbot(false);
        setSearchQuery("");
        setBridgeSearchQuery("");
        setChatbotSearchQuery("");
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscapePress);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapePress);
    };
  }, []);

  const handleDeleteBridge = async (item) => {
    const bridgeId = path[5];
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
      default:
        break;
    }
  };


  return (
    <div className={` ${router.pathname === '/' ? 'hidden' : 'flex items-center justify-between '} w-full navbar bg-white border `}>
      <div className='flex items-center w-full justify-start gap-2'>
        <button className="btn m-1" onClick={() => router.push(`/org/${path[2]}/${path[3]}`)}>
          <Home size={16} />
        </button>
        <button className="btn m-1" onClick={toggleSidebar}>
          <Building2 size={16} /> {organizations[path[2]]?.name}
        </button>
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn capitalize m-1">{path[3] === 'apikey' ? 'API Key' : path[3]} <ChevronDown size={16} /></div>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            {['bridges', "chatbot", 'apikey', 'metrics', 'invite'].map((item) => (
              <li key={item} onClick={() => router.push(`/org/${path[2]}/${item}`)}>
                <a className={path[3] === item ? "active" : ""}>{item.charAt(0).toUpperCase() + item.slice(1)}</a>
              </li>
            ))}
          </ul>
        </div>
        {path[3] === 'bridges' && path.length === 6 && <button className="btn m-1" onClick={toggleBridgeSidebar}> {bridgeData?.service === 'openai' ? <OpenAiIcon /> : <GeminiIcon />}  {bridgeData?.name} </button>}
        {path[3] === 'chatbot' && path[4] === 'configure' && <button className="btn m-1" onClick={toggleChatbotSidebar}> <Rss size={16} /> {chatbotData?.title} </button>}

      </div>


      <div className="justify-end w-full" >
        {path.length === 6 && path[3] === 'bridges' ? (
          <>
          <div className="pr-3">
              <div className="dropdown dropdown-bottom dropdown-end">
                <div tabIndex={0} role="button" className="btn m-1">
                  Add Variable
                  <ChevronDown size={16} />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                >
                  <li>
                    <a>No Envirnoment Variable</a>
                  </li>
                  <li>
                    <a>local</a>
                  </li>
                  <li>
                    <a>Testing</a>
                  </li>
                  <li>
                    <a onClick={() => setShowAddVariablePopup(true)}>
                      Add Variable
                    </a>
                  </li>
                </ul>
              </div>
              <AddVariable id={path[5]} setShowAddVariablePopup={setShowAddVariablePopup} showAddVaribablePopup={showAddVaribablePopup}/>
              
            </div>
            <div className="join">
              <button onClick={() => router.push(`/org/${path[2]}/bridges/configure/${path[5]}`)} className={` ${path[4] === 'configure' ? "btn-primary" : ""}   btn join-item `}> <FileSliders size={16} /> Configure</button>
              <button onClick={() => router.push(`/org/${path[2]}/bridges/history/${path[5]}`)} className={` ${path[4] === 'history' ? "btn-primary" : ""}   btn join-item `}><History size={16} /> History</button>
            </div>
            <div className='ml-2'>
            </div>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn capitalize m-1">
                <Ellipsis />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[9999999999] menu p-2 shadow bg-base-100 rounded-box w-52 custom-dropdown">
                {['Duplicate', 'Delete'].map((item) => (
                  <li key={item} onClick={() => handleDeleteBridge(item)}>
                    <a className={path[3] === item ? "active" : ""}>{item.charAt(0).toUpperCase() + item.slice(1)}</a>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          path[3] === 'apikey' ?
            <button className="btn  btn-primary" onClick={() => document.getElementById('my_modal_5').showModal()}>+ create new key</button>
            :
            path[3] === 'bridges' ?
              <button className="btn btn-primary" onClick={() => document.getElementById('my_modal_1').showModal()}>
                + create new bridge
              </button> : (path[3] === 'chatbot' && path.length === 4) ?
                <button className="btn btn-primary" onClick={() => document.getElementById('chatBot_model').showModal()}>
                  + create new chatbot
                </button> : ""
        )}
      </div>
      
      {/* org slider  */}

      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 border-r-2 ${isOpen ? 'w-full md:w-1/3 lg:w-1/6 opacity-100' : 'w-0'
          } overflow-y-auto border-l bg-base-200 transition-all duration-300 z-50`}
      >
        <aside className="flex w-full  flex-col h-screen overflow-y-auto">
          <div className="p-4 flex flex-col gap-4">
            <p className='text-xl'> Organization </p>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full"
            />
            <ul className="menu p-0 w-full   text-base-content">
              {filteredOrganizations.slice() // Create a copy of the array to avoid mutating the original
                .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically based on title
                .map((item) => (
                  <li key={item.id}><a className={`${item.id == path[2] ? "active" : `${item.id}`} py-2 px-2 rounded-md`} key={item.id} onClick={() => { handleSwitchOrg(item.id, item.name); router.push(`/org/${item.id}/${path[3]}`) }}  > <Building2 size={16} /> {item.name}</a></li>
                ))}
            </ul>
          </div>
          <div className='mt-auto w-full p-4'>
            <details
              className="overflow-hidden rounded border border-gray-300 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary
                className="flex cursor-pointer items-center justify-between gap-2 bg-white p-4 text-gray-900 transition"
              >
                <span className="text-sm font-medium flex justify-center items-center gap-2"> <Settings2 size={16} /> Setting </span>

                <span className="transition group-open:-rotate-180">
                  <ChevronDown strokeWidth={1.25} />
                </span>
              </summary>

              <div className="border-t border-gray-200 bg-white">
                <ul className="menu w-full   text-base-content">
                  <li> <a className='py-2 px-2 rounded-md'> <Mail size={16} /> {userdetails.email}</a> </li>
                  <li> <a className={`py-2 px-2  ${path[3] === 'apikey' ? "active" : ""}  rounded-md`} onClick={() => { router.push(`/org/${path[2]}/apikey`); setIsOpen(false); }}> <KeyRound size={16} />API key</a> </li>
                  <li onClick={logoutHandler}><a className='py-2 px-2 rounded-md'> <LogOut size={16} />  logout</a></li>
                </ul>
              </div>

            </details>
          </div>
        </aside>
      </div>

      {/* bridge slider */}
      <div
        ref={sideBridgeRef}
        className={`fixed inset-y-0 left-0 border-r-2 ${isOpenBridge ? 'w-full md:w-1/3 lg:w-1/6 opacity-100' : 'w-0'
          } overflow-y-auto border-l bg-base-200 transition-all duration-300 z-50`}
      >
        <aside className="flex w-full  flex-col h-screen overflow-y-auto">
          <div className="p-4 flex w-full flex-col gap-4">
            <p className='text-xl'> Bridges </p>
            {/* Input field for bridge search */}
            <input
              type="text"
              placeholder="Search..."
              value={bridgeSearchQuery}
              onChange={handleBridgeSearchChange}
              className="border border-gray-300 rounded p-2 w-full"
            />
            {/* Render filtered bridge list */}
            <ul className="menu  p-0 w-full truncate text-base-content">
              {filteredBridgesList.slice() // Create a copy of the array to avoid mutating the original
                .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically based on title
                .map((item) => (
                  <li key={item._id} className='max-w-full'>
                    <a
                      className={`  ${item._id == path[5] ? "active" : `${item.id}`} py-2 px-2 rounded-md truncate max-w-full`}
                      onClick={() => router.push(`/org/${path[2]}/bridges/configure/${item._id}`)}
                    >
                      {item.service === 'openai' ?
                        <OpenAiIcon /> : <GeminiIcon />
                      }
                      {item.name}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

        </aside>
        <CreateNewBridge orgid={path[2]} Heading="Create New Bridge" />

      </div>

      {/* chatbot slider */}
      <div
        ref={sideBotRef}
        className={`fixed inset-y-0 left-0 border-r-2 ${isOpenChatbot ? 'w-full md:w-1/3 lg:w-1/6 opacity-100' : 'w-0'
          } overflow-y-auto border-l bg-base-200 transition-all duration-300 z-50`}
      >
        <aside className="flex w-full flex-col h-screen overflow-y-auto">
          <div className="p-4 flex flex-col overflow-hidden gap-4">
            <p className='text-xl'> Chatbots </p>
            {/* Input field for chatbot search */}
            <input
              type="text"
              placeholder="Search..."
              value={chatbotSearchQuery}
              onChange={handleChatbotSearchChange}
              className="border border-gray-300 rounded p-2 w-full"
            />
            {/* Render filtered chatbot list */}
            <ul className="menu p-0 w-full  text-base-content">
              {filteredChatbotsList.slice() // Create a copy of the array to avoid mutating the original
                .sort((a, b) => a.title.localeCompare(b.title)) // Sort alphabetically based on title
                .map((item) => (
                  <li key={item._id} className=' w-full'>
                    <a
                      className={`${item._id == path[5] ? "active" : `${item.id}`} py-2 px-2 rounded-md`}
                      onClick={() => router.push(`/org/${path[2]}/chatbot/configure/${item._id}`)}
                    >
                      {item?.title}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Navbar;