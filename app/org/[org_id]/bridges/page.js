"use client"
import CreateNewBridge from "@/components/createNewBridge";
import Loader from "@/components/loader";
import Protected from "@/components/protected";
import { useCustomSelector } from "@/customSelector/customSelector";
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

      {isLoading && <Loader />}
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
                                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" className='fill-current'>
                                  <path d="M22.0265 10.3771C22.2889 9.58896 22.38 8.75389 22.2935 7.92775C22.2071 7.10161 21.9452 6.30347 21.5253 5.58676C20.9029 4.50269 19.9521 3.64439 18.8103 3.13571C17.6684 2.62703 16.3944 2.49428 15.1722 2.7566C14.6209 2.13532 13.9433 1.63897 13.1846 1.30076C12.426 0.962555 11.6039 0.7903 10.7733 0.795526C9.52367 0.79251 8.30538 1.18641 7.29406 1.92043C6.28274 2.65445 5.53065 3.69066 5.14621 4.87968C4.33215 5.04632 3.56309 5.38494 2.89049 5.87287C2.21789 6.3608 1.65729 6.98678 1.24621 7.70891C0.618824 8.78998 0.351017 10.0424 0.481417 11.2855C0.611816 12.5286 1.13368 13.6982 1.97175 14.6255C1.70934 15.4136 1.61831 16.2487 1.70475 17.0748C1.79119 17.901 2.05312 18.6991 2.47298 19.4158C3.09546 20.4999 4.04621 21.3581 5.18807 21.8668C6.32992 22.3754 7.60385 22.5082 8.82606 22.246C9.37735 22.8673 10.055 23.3636 10.8136 23.7018C11.5723 24.04 12.3944 24.2123 13.225 24.2071C14.4752 24.2103 15.6941 23.8163 16.7058 23.0818C17.7176 22.3473 18.4698 21.3104 18.8539 20.1206C19.668 19.954 20.437 19.6153 21.1096 19.1274C21.7822 18.6395 22.3428 18.0135 22.7539 17.2914C23.3805 16.2104 23.6477 14.9583 23.517 13.7157C23.3863 12.4731 22.8644 11.304 22.0265 10.3771ZM13.2268 22.6766C12.2006 22.678 11.2065 22.3186 10.4184 21.6612C10.4539 21.6418 10.5162 21.6077 10.5568 21.5828L15.2184 18.8901C15.3354 18.8236 15.4325 18.727 15.4999 18.6105C15.5672 18.4939 15.6022 18.3615 15.6014 18.2269V11.6551L17.5718 12.7928C17.5821 12.7979 17.591 12.8055 17.5977 12.815C17.6044 12.8244 17.6086 12.8353 17.6101 12.8468V18.2892C17.6086 19.4517 17.1465 20.5661 16.3249 21.3885C15.5033 22.2108 14.3893 22.674 13.2268 22.6766ZM3.80037 18.6506C3.2863 17.7624 3.10103 16.7217 3.27698 15.7106C3.3116 15.7314 3.37206 15.7683 3.41544 15.7932L8.07698 18.4858C8.19315 18.5537 8.32528 18.5895 8.45983 18.5895C8.59438 18.5895 8.72651 18.5537 8.84268 18.4858L14.5339 15.1997V17.4751C14.5346 17.4867 14.5323 17.4983 14.5274 17.5088C14.5225 17.5194 14.5151 17.5285 14.5058 17.5355L9.79344 20.2563C8.78549 20.8368 7.58841 20.9938 6.46487 20.6927C5.34132 20.3917 4.38307 19.6573 3.80037 18.6506ZM2.57406 8.47414C3.0859 7.58473 3.89432 6.90375 4.85775 6.55045C4.85775 6.5906 4.85544 6.66168 4.85544 6.71106V12.0963C4.85463 12.2308 4.88964 12.3631 4.95689 12.4796C5.02413 12.596 5.12118 12.6925 5.23806 12.7591L10.9293 16.0448L8.95898 17.1824C8.94926 17.1889 8.9381 17.1927 8.92651 17.1938C8.91491 17.1948 8.90324 17.193 8.89252 17.1884L4.17975 14.4654C3.17356 13.8827 2.4395 12.9248 2.1385 11.8017C1.8375 10.6786 1.99413 9.48193 2.57406 8.47414ZM18.7621 12.2412L13.0708 8.95506L15.0411 7.81783C15.0509 7.81143 15.062 7.80753 15.0736 7.80649C15.0852 7.80544 15.0969 7.80728 15.1076 7.81183L19.8204 10.5326C20.5424 10.9497 21.1306 11.5638 21.5162 12.3031C21.9018 13.0423 22.0689 13.8762 21.9977 14.7069C21.9266 15.5377 21.6202 16.331 21.1145 16.9939C20.6089 17.6569 19.9248 18.1621 19.1424 18.4503C19.1424 18.4097 19.1424 18.3386 19.1424 18.2892V12.904C19.1435 12.7697 19.1088 12.6376 19.042 12.5211C18.9752 12.4046 18.8785 12.308 18.7621 12.2412ZM20.7231 9.28968C20.6885 9.26845 20.6281 9.23199 20.5847 9.20706L15.9231 6.51445C15.8069 6.44665 15.6748 6.41093 15.5403 6.41093C15.4058 6.41093 15.2736 6.44665 15.1574 6.51445L9.46621 9.8006V7.52522C9.46556 7.5136 9.46779 7.502 9.4727 7.49145C9.47761 7.48091 9.48506 7.47174 9.49437 7.46476L14.2067 4.7463C14.9286 4.33002 15.7541 4.12793 16.5867 4.16367C17.4193 4.19942 18.2245 4.47151 18.9081 4.94812C19.5916 5.42473 20.1254 6.08615 20.4468 6.855C20.7682 7.62386 20.8641 8.46835 20.7231 9.28968ZM8.39498 13.3452L6.42421 12.2075C6.41388 12.2024 6.40497 12.1947 6.39829 12.1853C6.39161 12.1759 6.38735 12.165 6.38591 12.1535V6.71106C6.38645 5.87749 6.62442 5.06131 7.07197 4.35807C7.51951 3.65483 8.15812 3.09362 8.91303 2.74013C9.66795 2.38665 10.5079 2.25551 11.3347 2.36207C12.1614 2.46863 12.9407 2.80848 13.5813 3.34183C13.5458 3.36122 13.4839 3.39537 13.4428 3.4203L8.78129 6.11291C8.66433 6.1794 8.56718 6.27585 8.49986 6.39233C8.43253 6.50882 8.39744 6.64114 8.39821 6.77568L8.39498 13.3452ZM9.46529 11.0375L12.0001 9.57353L14.5348 11.0366V13.9637L12.0001 15.4268L9.46529 13.9637V11.0375Z" fill="currentColor" />
                                </svg>
                                : <svg width="24" height="25" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z" fill="url(#prefix__paint0_radial_980_20147)" /><defs><radialGradient id="prefix__paint0_radial_980_20147" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)"><stop offset=".067" stopColor="#9168C0" /><stop offset=".343" stopColor="#5684D1" /><stop offset=".672" stopColor="#1BA1E3" /></radialGradient></defs></svg>

                              }
                              
                              {item['name']}
                            </h1>
                            <p className="text-xs w-full flex items-center gap-2 line-clamp-5">
                           {item.slugName ? <p>SlugName: {item.slugName}</p>:""}
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
