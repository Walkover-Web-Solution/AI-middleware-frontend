"use client"
import { logoutUserFromMsg91 } from '@/api'
import { useCustomSelector } from '@/customSelector/customSelector'
import { userDetails } from '@/store/action/userDetailsAction'
import { usePathname, useRouter } from 'next/navigation'
import React , {useEffect} from 'react'
import { useDispatch } from 'react-redux'
import Protected from './protected'

function Navbar() {
    const router = useRouter()
    const path = usePathname()
    const dispatch = useDispatch()
    const userdetails = useCustomSelector((state) => state?.userDetailsReducer?.userDetails)

    useEffect(() => {
        dispatch(userDetails())
    }, [])
    
    const logoutHandler = async () => {
        try {
          await logoutUserFromMsg91({
            headers: {
              proxy_auth_token: localStorage.getItem('proxy_auth_token')
            }
          })
        //   removeCookie(getSubdomain())
          localStorage.clear()
          sessionStorage.clear()
          router.replace('/')
        //   else navigate('/')
        } catch (e) {
          console.error(e)
        }
      }
    


    return (
        <div className={` ${path === "/" ? "hidden"  : "flex items-center justify-between"} navbar bg-base-300 `}>
            <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden"><svg className="swap-off fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512"><path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" /></svg></label>

            <button className="btn btn-ghost text-xl">{path.split("/")[1].toUpperCase()}</button>
            <div className="justify-end">
                <button className="btn">Api Docs</button>
                <button className="dropdown dropdown-bottom dropdown-end">
                    <div tabIndex={0} role="button" className="btn m-1 rounded-full  ">{userdetails?.name?.substring(0,2).toUpperCase()}</div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li><a>{userdetails.name}</a></li>
                        <li><a>{userdetails.email}</a></li>
                        <li onClick={logoutHandler}><a>logout</a></li>
                    </ul>
                </button>
            </div>
        </div>
    )
}

export default Navbar