"use client"
import { useCustomSelector } from "@/customSelector/customSelector";
import { deleteBridgeAction, getAllBridgesAction, getSingleBridgesAction } from "@/store/action/bridgeAction";
import { useLayoutEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from 'react-toastify'
import { usePathname, useRouter } from 'next/navigation'
import Protected from "@/components/protected";
import CreateNewBridge from "@/components/createNewBridge";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/navbar";


function Home({ params }) {

  const allBridges = useCustomSelector((state) => state.bridgeReducer.org[params.org_id] || []).slice().reverse();
  const isLoading = useCustomSelector((state) => state.bridgeReducer.loading);
  const dispatch = useDispatch()
  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1);
  const [bridgesPerPage] = useState(10);

  const indexOfLastBridge = currentPage * bridgesPerPage;
  const indexOfFirstBridge = indexOfLastBridge - bridgesPerPage;
  const currentBridges = allBridges.slice(indexOfFirstBridge, indexOfLastBridge);

  const totalBridges = allBridges.length;
  const totalPages = Math.ceil(totalBridges / bridgesPerPage);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  // Next and Previous Page Handlers
  const nextPage = () => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage(prev => (prev > 1 ? prev - 1 : prev));


  /**
   * Handle Delete Bridge Action
   *
   * @param {string} bridgeId Bridge Id
   *
   * @returns {Promise<void>}
   */
  const handleDeleteBridge = async (bridgeId) => {
    // Confirm delete action
    const confirmDelete = window.confirm('Are you sure you want to delete this bridge?');

    // If confirmed
    if (confirmDelete) {
      try {
        // Dispatch delete bridge action and get all bridges
        dispatch(deleteBridgeAction({ bridgeId, orgId: params.org_id }));
        toast.success('Bridge deleted successfully');
        await dispatch(getAllBridgesAction());
      } catch (error) {
        // Log error
        console.error('Failed to delete bridge:', error);
        // Show toast error
        toast.error('Error deleting bridge');
      }
    }
  };


  // useLayoutEffect(() => {
  //   dispatch(getAllBridgesAction(params.org_id))
  // }, [params.org_id]);

  const columns = ["name", "_id", "service"];

  const onClickConfigure = (id) => {
    router.push(`/org/${params.org_id}/bridges/configure/${id}`);
  }

  return (<div className="drawer lg:drawer-open overflow-hidden">
    {isLoading &&
      (<div className="fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-filter backdrop-blur-lg flex justify-center items-center z-50">
        <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-xl">
          <div className="flex items-center justify-center space-x-2">
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
    <div className="drawer-content flex  flex-col items-start justify-start">
      <div className="flex w-full justify-start gap-16 items-start">
        <div className="w-full">
          {allBridges.length === 0 ? (
            <div className="text-center  w-full h-screen flex justify-center items-center py-10">
              <div className="flex flex-col items-center justify-center space-y-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-16 h-16 text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-lg font-semibold text-gray-800">Create Your First Bridge</p>
                <button className="btn  mt-2  mr-3 btn-primary" onClick={() => document.getElementById('my_modal_1').showModal()}>+ create new bridge</button>

              </div>
            </div>

          ) : (
            <div className="flex flex-col gap-5">
              {/* <Navbar orgId={params.org_id} isBridgePage /> */}
              <button className="btn  w-fit mt-2 mr-3  float-end btn-primary" onClick={() => document.getElementById('my_modal_1').showModal()}>
                + create new bridge
              </button>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5 lg:grid-cols-4 p-4">

                {allBridges.map((item) => (
                  <div key={item._id} onClick={() => onClickConfigure(item._id)} className="flex flex-col items-center rounded-md border cursor-pointer hover:shadow-lg">
                    <div className="w-full">
                      <div className="p-4">
                        <h1 className="inline-flex items-center text-lg font-semibold">
                          {item['name']}
                        </h1>
                        <p className="mt-3 text-sm text-gray-600">
                          {item['_id']}
                        </p>
                        <div className="mt-4">
                          <span className="mb-2 mr-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-900">
                            {item['service']}
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
    <CreateNewBridge orgid={params.org_id} />
  </div>


  );

}
export default Protected(Home);