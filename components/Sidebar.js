"use client";
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBridgesAction } from '@/store/action/bridgeAction';

function Sidebar({ orgid }) {
  const path = usePathname();
  const route = useRouter();
  const dispatch = useDispatch()
  // const params = useParams();
  const currentOrgId = useSelector(state => state?.orgReducer?.currentOrgId) || 1374;

  // Function to generate button classes based on active state
  const buttonClasses = (isActive) =>
    `w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${isActive ? 'bg-gray-600 text-white hover:bg-gray-300' : 'text-gray-700 hover:bg-gray-300'}`;

  // Menu items mapping
  const menuItems = [
    { name: 'Bridges', path: `/org/${orgid}/bridges` },
    { name: 'Api key', path: `/org/${orgid}/apikey` },
    { name: 'Invite', path: `/org/${orgid}/invite` },
    { name: 'Metrics', path: `/org/${orgid}/metrics` },
  ];

  return (
    <div className="drawer-side shadow-xl h-full">
      <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
      <ul className="menu p-4 min-h-full bg-white rounded-lg">
        {menuItems.map((item) => (
          <li key={item.name}>
            <button
              onClick={() => { route.push(item.path); if (item.name === "Bridges") dispatch(getAllBridgesAction()) }}
              className={buttonClasses(path === item.path)}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;

