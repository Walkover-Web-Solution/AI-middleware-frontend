"use client"
import CreateNewBridge from "@/components/createNewBridge";
import LoadingSpinner from "@/components/loadingSpinner";
import Protected from "@/components/protected";
import { useCustomSelector } from "@/customSelector/customSelector";
import GeminiIcon from "@/icons/GeminiIcon";
import OpenAiIcon from "@/icons/OpenAiIcon";
import { getAllBridgesAction } from "@/store/action/bridgeAction";
import { Box } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

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

  return (
    <div className="drawer lg:drawer-open">
      <CreateNewBridge />
      {isLoading && <LoadingSpinner />}
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
                    className="input input-bordered max-w-sm input-md w-full mb-4 md:mb-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn w-full md:w-auto float-start md:m-4 btn-primary" onClick={() => router.push(`/org/${params.org_id}/metrics`)}>
                    <Box size={16} /> Metrics
                  </button>
                </div>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-4">
                  {filteredBridges.slice().sort((a, b) => a.name.localeCompare(b.name)).map((item) => (
                    <div key={item._id} onClick={() => onClickConfigure(item._id)} className="flex flex-col items-center gap-7 rounded-md border cursor-pointer hover:shadow-lg bg-base-100">
                      <div className="w-full">
                        <div className="p-4 flex flex-col justify-between h-[200px] items-start">
                          <div className="w-full">
                            <h1 className="inline-flex truncate w-full items-center gap-2 text-lg font-semibold text-base-content">
                              {item.service === 'openai' ?
                                <OpenAiIcon /> : <GeminiIcon />
                              }

                              {item['name']}
                            </h1>
                            <p className="text-xs w-full flex items-center gap-2 line-clamp-5">
                              {item.slugName ? <p>SlugName: {item.slugName}</p> : ""}
                              {item.configuration?.prompt && (
                                <>
                                {Array.isArray(item.configuration.prompt) ? item.configuration.prompt.map((promptItem, index) => (
                                    <div key={index}>
                                      <p>Role: {promptItem.role}</p>
                                      <p>Content: {promptItem.content}</p>
                                    
                                    </div>
                                  )) : (
                                    <p>Prompt: {item.configuration.prompt}</p>
                                  )}
                                </>
                              )}
                              {item.configuration?.input && <p className="text-xs">Input: {item.configuration.input}</p>}
                            </p>
                          </div>
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
