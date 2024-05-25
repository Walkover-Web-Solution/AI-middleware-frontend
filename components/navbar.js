"use client"

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { logoutUserFromMsg91, switchOrg, switchUser } from '@/config';
import { useCustomSelector } from '@/customSelector/customSelector';
import { setCurrentOrgIdAction } from '@/store/action/orgAction';
import { Building2, ChevronDown, FileSliders, History, Home, KeyRound, LogOut, Mail, Rss, Settings2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import CreateNewBridge from './createNewBridge';

function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathName = usePathname()
  const path = pathName.split('?')[0].split('/')
  const userdetails = useCustomSelector((state) => state?.userDetailsReducer?.userDetails);
  const organizations = useCustomSelector((state) => state.userDetailsReducer.organizations);
  const bridgesList = useCustomSelector((state) => state.bridgeReducer.org[path[2]]) || [];
  const bridgeData = useCustomSelector((state) => state.bridgeReducer.allBridgesMap[path[5]]);
  const chatbotList = useCustomSelector((state) => state.ChatBot.org[path[2]]) || [];
  const chatbotData = useCustomSelector((state) => state.ChatBot.ChatBotMap[path[4]])
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenBridge, setIsOpenBridge] = useState(false)
  const [isOpenChatbot, setIsOpenChatbot] = useState(false)
  const [searchQuery, setSearchQuery] = useState('');
  const [bridgeSearchQuery, setBridgeSearchQuery] = useState('');

  const sidebarRef = useRef(null);
  const sideBridgeRef = useRef(null);
  const sideBotRef = useRef(null);

  // Event handler for bridge search query change
  const handleBridgeSearchChange = (e) => {
    setBridgeSearchQuery(e.target.value);
  };

  // Filtered bridge list based on search query
  const filteredBridgesList = bridgesList.filter(
    (item) => item.name.toLowerCase().includes(bridgeSearchQuery.toLowerCase())
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

  return (
    <div className={` ${router.pathname === '/' ? 'hidden' : 'flex items-center justify-between '} navbar bg-white border `}>
      <div className='flex items-center justify-center gap-2'>
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
        {path.length === 6 && <button className="btn m-1" onClick={toggleBridgeSidebar}> {bridgeData?.service === 'openai' ? <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" className='fill-current'>
          <path d="M22.0265 10.3771C22.2889 9.58896 22.38 8.75389 22.2935 7.92775C22.2071 7.10161 21.9452 6.30347 21.5253 5.58676C20.9029 4.50269 19.9521 3.64439 18.8103 3.13571C17.6684 2.62703 16.3944 2.49428 15.1722 2.7566C14.6209 2.13532 13.9433 1.63897 13.1846 1.30076C12.426 0.962555 11.6039 0.7903 10.7733 0.795526C9.52367 0.79251 8.30538 1.18641 7.29406 1.92043C6.28274 2.65445 5.53065 3.69066 5.14621 4.87968C4.33215 5.04632 3.56309 5.38494 2.89049 5.87287C2.21789 6.3608 1.65729 6.98678 1.24621 7.70891C0.618824 8.78998 0.351017 10.0424 0.481417 11.2855C0.611816 12.5286 1.13368 13.6982 1.97175 14.6255C1.70934 15.4136 1.61831 16.2487 1.70475 17.0748C1.79119 17.901 2.05312 18.6991 2.47298 19.4158C3.09546 20.4999 4.04621 21.3581 5.18807 21.8668C6.32992 22.3754 7.60385 22.5082 8.82606 22.246C9.37735 22.8673 10.055 23.3636 10.8136 23.7018C11.5723 24.04 12.3944 24.2123 13.225 24.2071C14.4752 24.2103 15.6941 23.8163 16.7058 23.0818C17.7176 22.3473 18.4698 21.3104 18.8539 20.1206C19.668 19.954 20.437 19.6153 21.1096 19.1274C21.7822 18.6395 22.3428 18.0135 22.7539 17.2914C23.3805 16.2104 23.6477 14.9583 23.517 13.7157C23.3863 12.4731 22.8644 11.304 22.0265 10.3771ZM13.2268 22.6766C12.2006 22.678 11.2065 22.3186 10.4184 21.6612C10.4539 21.6418 10.5162 21.6077 10.5568 21.5828L15.2184 18.8901C15.3354 18.8236 15.4325 18.727 15.4999 18.6105C15.5672 18.4939 15.6022 18.3615 15.6014 18.2269V11.6551L17.5718 12.7928C17.5821 12.7979 17.591 12.8055 17.5977 12.815C17.6044 12.8244 17.6086 12.8353 17.6101 12.8468V18.2892C17.6086 19.4517 17.1465 20.5661 16.3249 21.3885C15.5033 22.2108 14.3893 22.674 13.2268 22.6766ZM3.80037 18.6506C3.2863 17.7624 3.10103 16.7217 3.27698 15.7106C3.3116 15.7314 3.37206 15.7683 3.41544 15.7932L8.07698 18.4858C8.19315 18.5537 8.32528 18.5895 8.45983 18.5895C8.59438 18.5895 8.72651 18.5537 8.84268 18.4858L14.5339 15.1997V17.4751C14.5346 17.4867 14.5323 17.4983 14.5274 17.5088C14.5225 17.5194 14.5151 17.5285 14.5058 17.5355L9.79344 20.2563C8.78549 20.8368 7.58841 20.9938 6.46487 20.6927C5.34132 20.3917 4.38307 19.6573 3.80037 18.6506ZM2.57406 8.47414C3.0859 7.58473 3.89432 6.90375 4.85775 6.55045C4.85775 6.5906 4.85544 6.66168 4.85544 6.71106V12.0963C4.85463 12.2308 4.88964 12.3631 4.95689 12.4796C5.02413 12.596 5.12118 12.6925 5.23806 12.7591L10.9293 16.0448L8.95898 17.1824C8.94926 17.1889 8.9381 17.1927 8.92651 17.1938C8.91491 17.1948 8.90324 17.193 8.89252 17.1884L4.17975 14.4654C3.17356 13.8827 2.4395 12.9248 2.1385 11.8017C1.8375 10.6786 1.99413 9.48193 2.57406 8.47414ZM18.7621 12.2412L13.0708 8.95506L15.0411 7.81783C15.0509 7.81143 15.062 7.80753 15.0736 7.80649C15.0852 7.80544 15.0969 7.80728 15.1076 7.81183L19.8204 10.5326C20.5424 10.9497 21.1306 11.5638 21.5162 12.3031C21.9018 13.0423 22.0689 13.8762 21.9977 14.7069C21.9266 15.5377 21.6202 16.331 21.1145 16.9939C20.6089 17.6569 19.9248 18.1621 19.1424 18.4503C19.1424 18.4097 19.1424 18.3386 19.1424 18.2892V12.904C19.1435 12.7697 19.1088 12.6376 19.042 12.5211C18.9752 12.4046 18.8785 12.308 18.7621 12.2412ZM20.7231 9.28968C20.6885 9.26845 20.6281 9.23199 20.5847 9.20706L15.9231 6.51445C15.8069 6.44665 15.6748 6.41093 15.5403 6.41093C15.4058 6.41093 15.2736 6.44665 15.1574 6.51445L9.46621 9.8006V7.52522C9.46556 7.5136 9.46779 7.502 9.4727 7.49145C9.47761 7.48091 9.48506 7.47174 9.49437 7.46476L14.2067 4.7463C14.9286 4.33002 15.7541 4.12793 16.5867 4.16367C17.4193 4.19942 18.2245 4.47151 18.9081 4.94812C19.5916 5.42473 20.1254 6.08615 20.4468 6.855C20.7682 7.62386 20.8641 8.46835 20.7231 9.28968ZM8.39498 13.3452L6.42421 12.2075C6.41388 12.2024 6.40497 12.1947 6.39829 12.1853C6.39161 12.1759 6.38735 12.165 6.38591 12.1535V6.71106C6.38645 5.87749 6.62442 5.06131 7.07197 4.35807C7.51951 3.65483 8.15812 3.09362 8.91303 2.74013C9.66795 2.38665 10.5079 2.25551 11.3347 2.36207C12.1614 2.46863 12.9407 2.80848 13.5813 3.34183C13.5458 3.36122 13.4839 3.39537 13.4428 3.4203L8.78129 6.11291C8.66433 6.1794 8.56718 6.27585 8.49986 6.39233C8.43253 6.50882 8.39744 6.64114 8.39821 6.77568L8.39498 13.3452ZM9.46529 11.0375L12.0001 9.57353L14.5348 11.0366V13.9637L12.0001 15.4268L9.46529 13.9637V11.0375Z" fill="currentColor" />
        </svg> : <Rss size={16} />}  {bridgeData?.name} </button>}
        {path.length === 5 && <button className="btn m-1" onClick={toggleChatbotSidebar}> <Rss size={16} /> {chatbotData?.title} </button>}

      </div>


      <div className="justify-end">
        {path.length === 6 ? (
          <div className="join">
            <button onClick={() => router.push(`/org/${path[2]}/bridges/configure/${path[5]}`)} className={` ${path[4] === 'configure' ? "btn-primary" : ""}   btn join-item `}> <FileSliders size={16} /> Configure</button>
            <button onClick={() => router.push(`/org/${path[2]}/bridges/history/${path[5]}`)} className={` ${path[4] === 'history' ? "btn-primary" : ""}   btn join-item `}><History size={16} /> History</button>
            {/* <button className={` ${path[4] === 'metrics' ? "btn-primary" : ""}   btn join-item `}> <Box size={16} /> Metrics</button> */}
          </div>
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
              {filteredOrganizations.map((item) => (
                <li key={item.id}><a className={`${item.id == path[2] ? "active" : `${item.id}`} py-2 px-2 rounded-md`} key={item.id} onClick={() => { handleSwitchOrg(item.id, item.name); router.push(`/org/${item.id}/${path[3]}`) }}  > <Building2 size={16} /> {item.name}</a></li>
              ))}
            </ul>
          </div>
          <div className='mt-auto w-full p-4'>
            <details
              class="overflow-hidden rounded border border-gray-300 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary
                class="flex cursor-pointer items-center justify-between gap-2 bg-white p-4 text-gray-900 transition"
              >
                <span class="text-sm font-medium flex justify-center items-center gap-2"> <Settings2 size={16} /> Setting </span>

                <span class="transition group-open:-rotate-180">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="h-4 w-4"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </summary>

              <div class="border-t border-gray-200 bg-white">
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
          <div className="p-4 flex flex-col gap-4">
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
            <ul className="menu p-0 w-full   text-base-content">
              {filteredBridgesList.map((item) => (
                <li key={item._id}>
                  <a
                    className={`  ${item._id == path[5] ? "active" : `${item.id}`} py-2 px-2 rounded-md`}
                    onClick={() => router.push(`/org/${path[2]}/bridges/configure/${item._id}`)}
                  >
                    {item.service === 'openai' ?
                      <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" className='fill-current'>
                        <path d="M22.0265 10.3771C22.2889 9.58896 22.38 8.75389 22.2935 7.92775C22.2071 7.10161 21.9452 6.30347 21.5253 5.58676C20.9029 4.50269 19.9521 3.64439 18.8103 3.13571C17.6684 2.62703 16.3944 2.49428 15.1722 2.7566C14.6209 2.13532 13.9433 1.63897 13.1846 1.30076C12.426 0.962555 11.6039 0.7903 10.7733 0.795526C9.52367 0.79251 8.30538 1.18641 7.29406 1.92043C6.28274 2.65445 5.53065 3.69066 5.14621 4.87968C4.33215 5.04632 3.56309 5.38494 2.89049 5.87287C2.21789 6.3608 1.65729 6.98678 1.24621 7.70891C0.618824 8.78998 0.351017 10.0424 0.481417 11.2855C0.611816 12.5286 1.13368 13.6982 1.97175 14.6255C1.70934 15.4136 1.61831 16.2487 1.70475 17.0748C1.79119 17.901 2.05312 18.6991 2.47298 19.4158C3.09546 20.4999 4.04621 21.3581 5.18807 21.8668C6.32992 22.3754 7.60385 22.5082 8.82606 22.246C9.37735 22.8673 10.055 23.3636 10.8136 23.7018C11.5723 24.04 12.3944 24.2123 13.225 24.2071C14.4752 24.2103 15.6941 23.8163 16.7058 23.0818C17.7176 22.3473 18.4698 21.3104 18.8539 20.1206C19.668 19.954 20.437 19.6153 21.1096 19.1274C21.7822 18.6395 22.3428 18.0135 22.7539 17.2914C23.3805 16.2104 23.6477 14.9583 23.517 13.7157C23.3863 12.4731 22.8644 11.304 22.0265 10.3771ZM13.2268 22.6766C12.2006 22.678 11.2065 22.3186 10.4184 21.6612C10.4539 21.6418 10.5162 21.6077 10.5568 21.5828L15.2184 18.8901C15.3354 18.8236 15.4325 18.727 15.4999 18.6105C15.5672 18.4939 15.6022 18.3615 15.6014 18.2269V11.6551L17.5718 12.7928C17.5821 12.7979 17.591 12.8055 17.5977 12.815C17.6044 12.8244 17.6086 12.8353 17.6101 12.8468V18.2892C17.6086 19.4517 17.1465 20.5661 16.3249 21.3885C15.5033 22.2108 14.3893 22.674 13.2268 22.6766ZM3.80037 18.6506C3.2863 17.7624 3.10103 16.7217 3.27698 15.7106C3.3116 15.7314 3.37206 15.7683 3.41544 15.7932L8.07698 18.4858C8.19315 18.5537 8.32528 18.5895 8.45983 18.5895C8.59438 18.5895 8.72651 18.5537 8.84268 18.4858L14.5339 15.1997V17.4751C14.5346 17.4867 14.5323 17.4983 14.5274 17.5088C14.5225 17.5194 14.5151 17.5285 14.5058 17.5355L9.79344 20.2563C8.78549 20.8368 7.58841 20.9938 6.46487 20.6927C5.34132 20.3917 4.38307 19.6573 3.80037 18.6506ZM2.57406 8.47414C3.0859 7.58473 3.89432 6.90375 4.85775 6.55045C4.85775 6.5906 4.85544 6.66168 4.85544 6.71106V12.0963C4.85463 12.2308 4.88964 12.3631 4.95689 12.4796C5.02413 12.596 5.12118 12.6925 5.23806 12.7591L10.9293 16.0448L8.95898 17.1824C8.94926 17.1889 8.9381 17.1927 8.92651 17.1938C8.91491 17.1948 8.90324 17.193 8.89252 17.1884L4.17975 14.4654C3.17356 13.8827 2.4395 12.9248 2.1385 11.8017C1.8375 10.6786 1.99413 9.48193 2.57406 8.47414ZM18.7621 12.2412L13.0708 8.95506L15.0411 7.81783C15.0509 7.81143 15.062 7.80753 15.0736 7.80649C15.0852 7.80544 15.0969 7.80728 15.1076 7.81183L19.8204 10.5326C20.5424 10.9497 21.1306 11.5638 21.5162 12.3031C21.9018 13.0423 22.0689 13.8762 21.9977 14.7069C21.9266 15.5377 21.6202 16.331 21.1145 16.9939C20.6089 17.6569 19.9248 18.1621 19.1424 18.4503C19.1424 18.4097 19.1424 18.3386 19.1424 18.2892V12.904C19.1435 12.7697 19.1088 12.6376 19.042 12.5211C18.9752 12.4046 18.8785 12.308 18.7621 12.2412ZM20.7231 9.28968C20.6885 9.26845 20.6281 9.23199 20.5847 9.20706L15.9231 6.51445C15.8069 6.44665 15.6748 6.41093 15.5403 6.41093C15.4058 6.41093 15.2736 6.44665 15.1574 6.51445L9.46621 9.8006V7.52522C9.46556 7.5136 9.46779 7.502 9.4727 7.49145C9.47761 7.48091 9.48506 7.47174 9.49437 7.46476L14.2067 4.7463C14.9286 4.33002 15.7541 4.12793 16.5867 4.16367C17.4193 4.19942 18.2245 4.47151 18.9081 4.94812C19.5916 5.42473 20.1254 6.08615 20.4468 6.855C20.7682 7.62386 20.8641 8.46835 20.7231 9.28968ZM8.39498 13.3452L6.42421 12.2075C6.41388 12.2024 6.40497 12.1947 6.39829 12.1853C6.39161 12.1759 6.38735 12.165 6.38591 12.1535V6.71106C6.38645 5.87749 6.62442 5.06131 7.07197 4.35807C7.51951 3.65483 8.15812 3.09362 8.91303 2.74013C9.66795 2.38665 10.5079 2.25551 11.3347 2.36207C12.1614 2.46863 12.9407 2.80848 13.5813 3.34183C13.5458 3.36122 13.4839 3.39537 13.4428 3.4203L8.78129 6.11291C8.66433 6.1794 8.56718 6.27585 8.49986 6.39233C8.43253 6.50882 8.39744 6.64114 8.39821 6.77568L8.39498 13.3452ZM9.46529 11.0375L12.0001 9.57353L14.5348 11.0366V13.9637L12.0001 15.4268L9.46529 13.9637V11.0375Z" fill="currentColor" />
                      </svg> : ""
                    }


                    {item.name}
                  </a>
                </li>
              ))}
              <li onClick={() => document.getElementById('my_modal_1')?.showModal()}>
                <a>
                  + create new bridge
                </a>
              </li>
            </ul>
          </div>

        </aside>
        <CreateNewBridge orgid={path[2]} Heading="Create New Bridge" />

      </div>


      <div
        ref={sideBotRef}
        className={`fixed inset-y-0 left-0 border-r-2 ${isOpenChatbot ? 'w-full md:w-1/3 lg:w-1/6 opacity-100' : 'w-0'
          } overflow-y-auto border-l bg-base-200 transition-all duration-300 z-50`}
      >
        <aside className="flex w-full  flex-col h-screen overflow-y-auto">
          <div className="p-4 flex flex-col gap-4">
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
            <ul className="menu p-0 w-full   text-base-content">
              {filteredBridgesList.map((item) => (
                <li key={item._id}>
                  <a
                    className={`  ${item._id == path[5] ? "active" : `${item.id}`} py-2 px-2 rounded-md`}
                    onClick={() => router.push(`/org/${path[2]}/bridges/configure/${item._id}`)}
                  >
                    {item.service === 'openai' ?
                      <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" className='fill-current'>
                        <path d="M22.0265 10.3771C22.2889 9.58896 22.38 8.75389 22.2935 7.92775C22.2071 7.10161 21.9452 6.30347 21.5253 5.58676C20.9029 4.50269 19.9521 3.64439 18.8103 3.13571C17.6684 2.62703 16.3944 2.49428 15.1722 2.7566C14.6209 2.13532 13.9433 1.63897 13.1846 1.30076C12.426 0.962555 11.6039 0.7903 10.7733 0.795526C9.52367 0.79251 8.30538 1.18641 7.29406 1.92043C6.28274 2.65445 5.53065 3.69066 5.14621 4.87968C4.33215 5.04632 3.56309 5.38494 2.89049 5.87287C2.21789 6.3608 1.65729 6.98678 1.24621 7.70891C0.618824 8.78998 0.351017 10.0424 0.481417 11.2855C0.611816 12.5286 1.13368 13.6982 1.97175 14.6255C1.70934 15.4136 1.61831 16.2487 1.70475 17.0748C1.79119 17.901 2.05312 18.6991 2.47298 19.4158C3.09546 20.4999 4.04621 21.3581 5.18807 21.8668C6.32992 22.3754 7.60385 22.5082 8.82606 22.246C9.37735 22.8673 10.055 23.3636 10.8136 23.7018C11.5723 24.04 12.3944 24.2123 13.225 24.2071C14.4752 24.2103 15.6941 23.8163 16.7058 23.0818C17.7176 22.3473 18.4698 21.3104 18.8539 20.1206C19.668 19.954 20.437 19.6153 21.1096 19.1274C21.7822 18.6395 22.3428 18.0135 22.7539 17.2914C23.3805 16.2104 23.6477 14.9583 23.517 13.7157C23.3863 12.4731 22.8644 11.304 22.0265 10.3771ZM13.2268 22.6766C12.2006 22.678 11.2065 22.3186 10.4184 21.6612C10.4539 21.6418 10.5162 21.6077 10.5568 21.5828L15.2184 18.8901C15.3354 18.8236 15.4325 18.727 15.4999 18.6105C15.5672 18.4939 15.6022 18.3615 15.6014 18.2269V11.6551L17.5718 12.7928C17.5821 12.7979 17.591 12.8055 17.5977 12.815C17.6044 12.8244 17.6086 12.8353 17.6101 12.8468V18.2892C17.6086 19.4517 17.1465 20.5661 16.3249 21.3885C15.5033 22.2108 14.3893 22.674 13.2268 22.6766ZM3.80037 18.6506C3.2863 17.7624 3.10103 16.7217 3.27698 15.7106C3.3116 15.7314 3.37206 15.7683 3.41544 15.7932L8.07698 18.4858C8.19315 18.5537 8.32528 18.5895 8.45983 18.5895C8.59438 18.5895 8.72651 18.5537 8.84268 18.4858L14.5339 15.1997V17.4751C14.5346 17.4867 14.5323 17.4983 14.5274 17.5088C14.5225 17.5194 14.5151 17.5285 14.5058 17.5355L9.79344 20.2563C8.78549 20.8368 7.58841 20.9938 6.46487 20.6927C5.34132 20.3917 4.38307 19.6573 3.80037 18.6506ZM2.57406 8.47414C3.0859 7.58473 3.89432 6.90375 4.85775 6.55045C4.85775 6.5906 4.85544 6.66168 4.85544 6.71106V12.0963C4.85463 12.2308 4.88964 12.3631 4.95689 12.4796C5.02413 12.596 5.12118 12.6925 5.23806 12.7591L10.9293 16.0448L8.95898 17.1824C8.94926 17.1889 8.9381 17.1927 8.92651 17.1938C8.91491 17.1948 8.90324 17.193 8.89252 17.1884L4.17975 14.4654C3.17356 13.8827 2.4395 12.9248 2.1385 11.8017C1.8375 10.6786 1.99413 9.48193 2.57406 8.47414ZM18.7621 12.2412L13.0708 8.95506L15.0411 7.81783C15.0509 7.81143 15.062 7.80753 15.0736 7.80649C15.0852 7.80544 15.0969 7.80728 15.1076 7.81183L19.8204 10.5326C20.5424 10.9497 21.1306 11.5638 21.5162 12.3031C21.9018 13.0423 22.0689 13.8762 21.9977 14.7069C21.9266 15.5377 21.6202 16.331 21.1145 16.9939C20.6089 17.6569 19.9248 18.1621 19.1424 18.4503C19.1424 18.4097 19.1424 18.3386 19.1424 18.2892V12.904C19.1435 12.7697 19.1088 12.6376 19.042 12.5211C18.9752 12.4046 18.8785 12.308 18.7621 12.2412ZM20.7231 9.28968C20.6885 9.26845 20.6281 9.23199 20.5847 9.20706L15.9231 6.51445C15.8069 6.44665 15.6748 6.41093 15.5403 6.41093C15.4058 6.41093 15.2736 6.44665 15.1574 6.51445L9.46621 9.8006V7.52522C9.46556 7.5136 9.46779 7.502 9.4727 7.49145C9.47761 7.48091 9.48506 7.47174 9.49437 7.46476L14.2067 4.7463C14.9286 4.33002 15.7541 4.12793 16.5867 4.16367C17.4193 4.19942 18.2245 4.47151 18.9081 4.94812C19.5916 5.42473 20.1254 6.08615 20.4468 6.855C20.7682 7.62386 20.8641 8.46835 20.7231 9.28968ZM8.39498 13.3452L6.42421 12.2075C6.41388 12.2024 6.40497 12.1947 6.39829 12.1853C6.39161 12.1759 6.38735 12.165 6.38591 12.1535V6.71106C6.38645 5.87749 6.62442 5.06131 7.07197 4.35807C7.51951 3.65483 8.15812 3.09362 8.91303 2.74013C9.66795 2.38665 10.5079 2.25551 11.3347 2.36207C12.1614 2.46863 12.9407 2.80848 13.5813 3.34183C13.5458 3.36122 13.4839 3.39537 13.4428 3.4203L8.78129 6.11291C8.66433 6.1794 8.56718 6.27585 8.49986 6.39233C8.43253 6.50882 8.39744 6.64114 8.39821 6.77568L8.39498 13.3452ZM9.46529 11.0375L12.0001 9.57353L14.5348 11.0366V13.9637L12.0001 15.4268L9.46529 13.9637V11.0375Z" fill="currentColor" />
                      </svg> : ""
                    }


                    {item.name}
                  </a>
                </li>
              ))}
              <li onClick={() => document.getElementById('my_modal_1')?.showModal()}>
                <a>
                  + create new bridge
                </a>
              </li>
            </ul>
          </div>

        </aside>
        <CreateNewBridge orgid={path[2]} Heading="Create New Bridge" />

      </div>
    </div>
  );
}

export default Navbar;
