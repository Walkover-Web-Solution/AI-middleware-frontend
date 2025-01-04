import { useCustomSelector } from '@/customHooks/customSelector';
import { Building2, ChevronDown, Home, TriangleAlert, Key, KeyRound, UserPlus, LineChart, Bot, PlugZap, LogOut, Mail, Settings2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

function MainSlider() {
    const pathName = usePathname();
    const router = useRouter();
    const path = pathName.split('?')[0].split('/')
    const userdetails = useCustomSelector((state) => state?.userDetailsReducer?.userDetails);

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
    return (
        <div className="flex flex-col h-screen w-72 bg-base-100 border-r pt-6 relative drawer lg:drawer-open">
            <div className="flex-grow overflow-y-auto">
                <h2 className="text-xl font-bold text-center mb-3">AI Middleware</h2>
                <ul className="menu p-4 space-y-2">
                    {['bridges', 'chatbot', 'pauthkey', 'apikeys', 'alerts', 'invite', 'metrics'].map((item) => (
                        <li key={item} onClick={() => router.push(`/org/${path[2]}/${item}`)} className="transition-transform transform hover:scale-105 flex items-center">
                            <a className={` w-full font-medium ml-2 ${path[3] === item ? "active text-primary" : "text-gray-700"} `}>
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
                            <li ><a className='py-2 px-2 rounded-md'> <LogOut size={16} />  logout</a></li>
                        </ul>
                    </div>

                </details>
            </div>
        </div>
    );
}

export default MainSlider;