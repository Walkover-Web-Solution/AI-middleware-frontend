import { logoutUserFromMsg91 } from '@/config';
import { useCustomSelector } from '@/customHooks/customSelector';
import { toggleSidebar } from '@/utils/utility';
import { Bot, Building2, ChevronDown, Key, KeyRound, LineChart, LogOut, Mail, PlugZap, Settings2, TriangleAlert, UserPlus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

function MainSlider() {
  const pathName = usePathname();
  const router = useRouter();
  const path = pathName.split('?')[0].split('/')
  const { userdetails, organizations } = useCustomSelector((state) => ({
    userdetails: state?.userDetailsReducer?.userDetails,
    organizations: state.userDetailsReducer.organizations,
  }));

  const Icons = {
    org: <Building2 />,
    bridges: <PlugZap />,
    chatbot: <Bot />,
    pauthkey: <KeyRound />,
    apikeys: <Key />,
    alerts: <TriangleAlert />,
    invite: <UserPlus />,
    metrics: <LineChart />
  }

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
  const toggleMainSidebar = () => toggleSidebar("main-sidebar");
  return (
    <div className="relative">
      <label htmlFor="my-drawer-2" className="drawer-button lg:hidden z-0 absolute">
        <PanelRightClose
          width="30px"
          height="30px"
          onClick={toggleMainSidebar}
        />
      </label> <div className={`drawer lg:drawer-open relative z-[101] lg:z-0`}>
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">

        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
          <div className="flex flex-col h-screen w-72 bg-base-100 border-r py-4">
            <div className="flex-grow overflow-y-auto px-4">
              <div className='mb-4 flex-col gap-2'>
                <h2 className="text-xl font-bold text-start">
                  {organizations[path[2]]?.name.length > 15
                    ? organizations[path[2]]?.name.substring(0, 15) + '...'
                    : organizations[path[2]]?.name}
                </h2>
                <a
                  href="#"
                  onClick={() => {
                    toggleOrgSidebar();
                    document.getElementById("my-drawer-2").checked = false;
                  }}
                  className="text-sm text-blue-500 hover:underline z-[102]"
                >
                  Switch Organization
                </a>
              </div>
              <ul className="menu space-y-2 p-0">
                {['bridges', 'pauthkey', 'apikeys', 'alerts', 'invite', 'metrics'].map((item) => (
                  <li key={item} onClick={() => router.push(`/org/${path[2]}/${item}`)} className="transition-transform transform hover:scale-105 flex items-center">
                    <a className={` w-full font-medium ${path[3] === item ? "active text-primary" : "text-gray-700"} `}>
                      {Icons[item]}
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className='mt-auto'>
              <details
                className="overflow-hidden rounded-lg border-t border-gray-300 [&_summary::-webkit-details-marker]:hidden"
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
                    <li ><a className='py-2 px-2 rounded-md' onClick={logoutHandler}> <LogOut size={16} />  logout</a></li>
                  </ul>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainSlider;
