"use client"
// eslint-disable
import { logoutUserFromMsg91 } from '@/api'
import { useCustomSelector } from '@/customSelector/customSelector'
import { userDetails } from '@/store/action/userDetailsAction'
import { usePathname, useRouter } from 'next/navigation'
import React , {useEffect} from 'react'
import { useDispatch } from 'react-redux'


function Navbar() {
    const router = useRouter()
    const path = usePathname()
    const dispatch = useDispatch()
    const userdetails = useCustomSelector((state) => state?.userDetailsReducer?.userDetails)

    useEffect(() => {
        dispatch(userDetails())
    }, [])
    
    /**
     * Handler function to logout the user.
     * It clears the localStorage and sessionStorage
     * and redirects the user to the login page
     */
    const logoutHandler = async () => {
        try {
            // Call the logout API
            await logoutUserFromMsg91({
                headers: {
                    proxy_auth_token: localStorage.getItem('proxy_token')
                }
            });
            // Clear the localStorage and sessionStorage
            localStorage.clear();
            sessionStorage.clear();
            // Redirect the user to the login page
            router.replace('/');
        } catch (e) {
            // Log the error to the console
            console.error(e);
        }
    }

    

      /**
       * Function to format the navbar title based on the URL path
       * @param {string} path The URL path
       * @returns {string} The formatted navbar title
       */
      const formatNavbarTitle = (path) => {
        // Split the path into segments
        const segments = path.split("/").filter(Boolean); // filter(Boolean) removes any empty strings from the array
        
        // Determine the title based on the number of segments and their values
        if (segments.length === 3) {
          // If there are 3 segments in the path,
          // return the 3rd (last) segment as the title
          return segments[2];
        } else if (segments.length === 1 || segments.length === 2) {
          // If there are 1 or 2 segments in the path,
          // return the first (or only) segment as the title
          // or "ORG" if the segment is empty
          const pageName = segments[0]; 
          return pageName ? pageName : "ORG"; 
        }
        
        // If the path has an invalid number of segments,
        // return "ORG" as the title
        return "ORG";  
      };


    return (
      <div className={` ${path === "/" ? "hidden"  : "flex items-center justify-between"} navbar bg-base-300 `}>
      <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden"><svg className="swap-off fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512"><path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" /></svg></label>

      <p className="text-xl capitalize">{formatNavbarTitle(path) === "org" ? "Organization" : formatNavbarTitle(path)}</p>
      <div className="justify-end">
          {/* <button className="btn">Api Docs</button> */}
          <button className="dropdown dropdown-bottom dropdown-end">
              <div tabIndex={0} role="button" className="btn m-1 rounded-full">{userdetails?.name?.substring(0,2).toUpperCase()}</div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li><a>{userdetails.name}</a></li>
                  <li><a>{userdetails.email}</a></li>
                  <li onClick={logoutHandler}><a>logout</a></li>
                  <li onClick={() => router.push('/org')} ><a>Switch Org</a></li>
              </ul>
          </button>
      </div>
    </div>
    )
}

export default Navbar