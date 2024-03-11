// Sidebar.jsx
import React from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter
function Sidebar() {
    const path = usePathname();
    const route = useRouter();
    
    return (
      <div className="drawer-side border-r-4">
        <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu p-4 w-50 min-h-full bg-base-200 text-base-content">
          <li><button className={path === "/bridges" ? "btn-active" : ""} onClick={()=> route.push("/bridges")} >Bridges </button></li>
          <li><button className={path === "/apikey" ? "btn-active" : ""} onClick={()=> route.push("/apikey")} >Api key</button></li>
        </ul>
      </div>
    );
  }
  
  // Providing default props
  Sidebar.defaultProps = {
    threads: [],
    onThreadSelect: () => {},
  };

  export default Sidebar;
  