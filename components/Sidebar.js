// Sidebar.jsx
"use client";
import React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

function Sidebar() {
  const path = usePathname();
  const route = useRouter();
  const params = useParams();
  const currentOrgId = useSelector(state => state?.orgReducer?.currentOrgId) || 1374;

  // Function to generate button classes based on active state
  const buttonClasses = (isActive) =>
    `w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${isActive ? 'bg-gray-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`;

  // Menu items mapping
  const menuItems = [
    { name: 'Bridges', path: `/org/${params.id}/bridges` },
    { name: 'Api key', path: `/org/${params.id}/apikey` },
    { name: 'Invite', path: `/org/${params.id}/invite` },
    { name: 'Metrics', path: `/org/${params.id}/metrics` },
  ];

  return (
    <div className="drawer-side shadow-xl">
      <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
      <ul className="menu p-4 min-h-full bg-white rounded-lg">
        {menuItems.map((item) => (
          <li key={item.name}>
            <button
              onClick={() => route.push(item.path)}
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

  
