"use client"
// eslint-disable
import { useCustomSelector } from "@/customSelector/customSelector";
import { getAllBridgesAction } from "@/store/action/bridgeAction";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { useParams, usePathname, useRouter } from 'next/navigation'
import Protected from "@/components/protected";
import CreateNewBridge from "@/components/createNewBridge";


function Home() {

  const allBridges = useCustomSelector((state) => state.bridgeReducer.allBridges) || []
  const path = usePathname()
  const dispatch = useDispatch()
  const router = useRouter()

  useEffect(() => {
    dispatch(getAllBridgesAction())

  }, [])
  const columns = ["name", "_id", "service"];

  return (



    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex pl-2 flex-col items-start justify-start">
        <div className="flex w-full justify-start gap-16 items-start">
          <div className="w-full">
            <button className="btn float-end mt-2 btn-sm mr-3 btn-primary" onClick={() => document.getElementById('my_modal_1').showModal()}>+ create new bridge</button>
            <table className="table">
              <thead>
                <tr>
                  {columns.map(column => (
                    <th key={column}>{column.replace(/_/g, ' ').charAt(0).toUpperCase() + column.replace(/_/g, ' ').slice(1)}</th> // Beautify the column headers
                  ))}
                </tr>
              </thead>
              <tbody>
                {allBridges.map((item) => (
                  <tr key={item._id} className="hover-row hover">
                    {columns.map(column => (
                      <td key={`${item._id}-${column}`}>{item[column]}</td>
                    ))}
                    <td className="button-container gap-3 flex justify-center align-center">
                      <button onClick={() => router.push(`/history/${item._id}`)} className="btn btn-sm">History</button>
                      <button onClick={() => router.push(`/configure/${item._id}`)} className="btn btn-sm">Configure</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu p-4 w-50   min-h-full bg-base-200 text-base-content">
          {/* Sidebar content here */}
          <li><button className={path === "/bridges" ? "btn-active" : ""} onClick={()=> router.push("/bridges")} >Bridges </button></li>
          <li><button className={path === "/apikey" ? "btn-active" : ""} onClick={()=> router.push("/apikey")} >Api key</button></li>
        </ul>

      </div>
      <CreateNewBridge />
    </div>


  );

}
export default Protected(Home);