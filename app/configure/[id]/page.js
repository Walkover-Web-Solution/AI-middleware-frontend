"use client"

import Protected from "@/components/protected"
import { useCustomSelector } from "@/customSelector/customSelector"
import DropdownMenu from "@/components/dropDown"
import { useEffect } from "react"
import { getSingleBridgesAction } from "@/store/action/bridgeAction"
import { useDispatch } from "react-redux"
import Playground from "@/components/playground"
import Chat from "@/components/chat"


function Page({ params }) {

  const dispatch = useDispatch()

  const { bridgeData } = useCustomSelector((state) => ({
    bridgeData: state?.bridgeReducer?.allBridgesMap?.[params?.id]
  }))



  useEffect(() => {
    dispatch(getSingleBridgesAction(params.id));

  }, [params.id]);

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex pl-2 flex-col items-start justify-start">
        {/* Page content here */}
        {/* <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open drawer</label> */}
        <h1 className="text-2xl font-bold capitalize pb-2">{bridgeData?.bridges?.name}</h1>
        <div className="flex w-full justify-start gap-16 items-start">
          <div className="w-full">
            <DropdownMenu params={params} />
          </div>
        </div>

      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu p-4 w-50   min-h-full bg-base-200 text-base-content">
          {/* Sidebar content here */}
          <li><a>History </a></li>
          <li><a>Api key</a></li>
        </ul>

      </div>
    </div>
  )
}
export default Protected(Page)

