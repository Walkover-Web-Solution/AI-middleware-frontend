"use client"
import { useCustomSelector } from "@/customSelector/customSelector";
import { getAllBridgesAction } from "@/store/action/bridgeAction";
import { useEffect , useState} from "react";
import { useDispatch } from "react-redux";

import { useParams, usePathname, useRouter } from 'next/navigation'
import Protected from "@/components/protected";
import CreateNewBridge from "@/components/createNewBridge";


function Home() {

  const allBridges = useCustomSelector((state) => state.bridgeReducer.allBridges) || []
  const path = usePathname()
  const dispatch = useDispatch()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(getAllBridgesAction())

  }, [])
  const columns = ["name", "_id", "service"];

  return (



    <div className="drawer lg:drawer-open overflow-hidden">
      {isLoading &&  
                (<div className="fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-filter backdrop-blur-lg flex justify-center items-center z-50">
                <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-xl">
                  <div className="flex items-center justify-center space-x-2">
                    {/* Tailwind CSS Spinner */}
                    <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xl font-medium text-gray-700">Loading...</span>
                  </div>
                </div>
              </div>
              )}
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
                    <button onClick={() => { setIsLoading(true); router.push(`/history/${item._id}`); }} className="btn btn-sm">History</button>
                    <button onClick={() => { setIsLoading(true); router.push(`/configure/${item._id}`); }} className="btn btn-sm">Configure</button>

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