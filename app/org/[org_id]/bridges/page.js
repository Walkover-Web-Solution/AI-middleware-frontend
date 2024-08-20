"use client"
import CreateNewBridge from "@/components/createNewBridge";
import LoadingSpinner from "@/components/loadingSpinner";
import Protected from "@/components/protected";
import { useCustomSelector } from "@/customSelector/customSelector";
import { duplicateBridgeAction, getAllBridgesAction } from "@/store/action/bridgeAction";
import { getIconOfService } from "@/utils/utility";
import { Box, Ellipsis } from "lucide-react";
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export const runtime = 'edge';

function Home({ params }) {
  const allBridges = useCustomSelector((state) => state.bridgeReducer.org[params.org_id] || []).slice().reverse();
  useEffect(() => {
    dispatch(getAllBridgesAction((data) => {
      if (data === 0) {
        document.getElementById('my_modal_1') && document.getElementById('my_modal_1')?.showModal()
      }
      // document.getElementById('my_modal_1') && document.getElementById('my_modal_1')?.closeModel()
    }))
  }, [])

  const { isLoading } = useCustomSelector((state) => ({
    isLoading: state.bridgeReducer.loading,
  }));
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const filteredBridges = allBridges.filter((item) =>

    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item?.slugName?.toLowerCase()?.includes(searchTerm.toLocaleLowerCase()) ||
    item?.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.configuration?.model && item.configuration.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item._id.toLowerCase().includes(searchTerm.toLowerCase()) // Add this line

  );

  const onClickConfigure = (id) => {
    router.push(`/org/${params.org_id}/bridges/configure/${id}`);
  };

  const pathName = usePathname()
  const path = pathName.split('?')[0].split('/');
  
  const handleDuplicateBridge=(bridgeId)=>{
    try {
          dispatch(duplicateBridgeAction(bridgeId)).then((newBridgeId) => {
            if (newBridgeId) {
              router.push(`/org/${path[2]}/bridges/configure/${newBridgeId}`)
              toast.success('Bridge duplicate successfully');
            }
          });
        } catch (error) {
          console.error('Failed to duplicate bridge:', error);
          toast.error('Error duplicating bridge');
        }
  }

  return (
    <div className="drawer lg:drawer-open">
      <CreateNewBridge />
      {!allBridges && isLoading && <LoadingSpinner />}
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-start justify-start">
        <div className="flex w-full justify-start gap-4 lg:gap-16 items-start">
          <div className="w-full">
            {allBridges.length === 0 ? (
              <div className="text-center w-full h-screen flex justify-center items-center py-10">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-16 h-16 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-lg font-semibold text-base-content">Create Your First Bridge</p>
                  <button className="btn mt-2 btn-primary" onClick={() => document.getElementById('my_modal_1').showModal()}>+ create new bridge</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="relative flex flex-col md:flex-row items-center justify-between mx-4">
                  <input
                    type="text"
                    placeholder="Search for bridges"
                    className="input input-bordered md:max-w-sm input-md w-full mb-4 md:mb-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn w-full md:w-auto float-start md:m-4 btn-primary" onClick={() => router.push(`/org/${params.org_id}/metrics`)}>
                    <Box size={16} /> Metrics
                  </button>
                </div>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-4">
                 {filteredBridges.slice().sort((a, b) => a.name.localeCompare(b.name)).map((item) => (
                     <div  className="flex  items-start  justify-between rounded-md border cursor-pointer hover:shadow-lg bg-base-100">
                        <div key={item._id} onClick={() => onClickConfigure(item._id)} className="flex flex-col items-center gap-7 ">
                        <div className="w-full p-4 flex flex-col justify-between h-[200px] items-start">
                          <h1 className="inline-flex truncate items-center gap-2 text-lg leading-5 font-semibold text-base-content">
                            {getIconOfService(item.service)}
                            {item.name}
                          </h1>
                          <p className="text-xs w-full flex items-center gap-2 line-clamp-5">
                            {item.slugName && <span>SlugName: {item.slugName}</span>}
                            {item.configuration?.prompt && (
                              Array.isArray(item.configuration.prompt) ? item.configuration.prompt.map((promptItem, index) => (
                                <div key={index}>
                                  <p>Role: {promptItem.role}</p>
                                  <p>Content: {promptItem.content}</p>
                                </div>
                              )) : <p>Prompt: {item.configuration.prompt}</p>
                            )}
                            {item.configuration?.input && <span>Input: {item.configuration.input}</span>}
                          </p>
                          <div className="mt-auto">
                            <span className="mb-2 mr-2 inline-block rounded-full bg-base-100 px-3 py-1 text-[10px] font-semibold">
                              {item.service}
                            </span>
                            <span className="mb-2 mr-2 inline-block rounded-full bg-base-100 px-3 py-1 text-[10px] font-semibold">
                              {item.configuration?.model || ""}
                            </span>
                          </div>
                        </div>
                  </div>
                        <div className="pr-4 py-4">
                          <div className="dropdown bg-transparent">
                            <div tabIndex={0} role="button" className=""><Ellipsis className="rotate-90 h-[15px]"/></div>
                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                              <li><a onClick={() => handleDuplicateBridge(item._id)}>Duplicate Bridge</a></li>
                              </ul>
                          </div>
                        </div>
                     </div>
                    ))}
               </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Protected(Home);