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
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import ConfigSkeleton from "@/components/skeleton/ConfigSkeleton";


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


  useLayoutEffect(() => {
    dispatch(getAllBridgesAction(params.org_id))
  }, [params.org_id]);

  const columns = ["name", "_id", "service"];

  const onClickConfigure = (id) => {
    // dispatch(getSingleBridgesAction(id))
    router.push(`/org/${params.org_id}/bridges/configure/${id}`);
  }

  return (<div className="drawer lg:drawer-open overflow-hidden">
    {/* {isLoading && <TableSkeleton/>} */}
    <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
    <div className="drawer-content flex pl-2 flex-col items-start justify-start">
      <div className="flex w-full justify-start gap-16 items-start">
        <div className="w-full">
        {  isLoading ? (
        <TableSkeleton />  // Show skeleton loader when data is loading
      ) : allBridges.length === 0 ?   (
        // Show "Create Your First Bridge" if not loading and no bridges
        <div className="text-center w-full h-screen flex justify-center items-center py-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-16 h-16 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-lg font-semibold text-gray-800">Create Your First Bridge</p>
            <button className="btn mt-2 mr-3 btn-primary" onClick={() => document.getElementById('my_modal_1').showModal()}>+ Create New Bridge</button>
          </div>
        </div>
      ) : (
        // Show bridge list if not loading and bridges exist
        <>
          <button className="btn float-end mt-2 btn-sm mr-3 btn-primary" onClick={() => document.getElementById('my_modal_1').showModal()}>+ Create New Bridge</button>
          <table className="table">
            <thead>
              <tr>
                {columns.map(column => (
                  <th key={column}>{column.replace(/_/g, ' ').charAt(0).toUpperCase() + column.replace(/_/g, ' ').slice(1)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentBridges.map((item) => (
                <tr key={item._id} className="hover-row hover">
                  {columns.map(column => (
                    <td key={`${item._id}-${column}`}>{item[column]}</td>
                  ))}
                  <td key={item._id} className="button-container gap-3 flex justify-center align-center">
                    <button onClick={() => { router.push(`/org/${params.org_id}/bridges/history/${item._id}`); }} className="btn btn-sm">History</button>
                    <button onClick={() => onClickConfigure(item._id)} className="btn btn-sm">Configure</button>
                    <a onClick={() => handleDeleteBridge(item._id)} className="tooltip tooltip-primary" data-tip="delete">
                      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 4V2H17V4H22V6H20V21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H5C4.73478 22 4.48043 21.8946 4.29289 21.7071C4.10536 21.5196 4 21.2652 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z" fill="#03053D" />
                      </svg>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </>
          )}


          {totalPages > 1 && (
            <div className="flex justify-center items-center my-4">
              <div className="flex items-center space-x-1">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  Prev
                </button>
                {[...Array(totalPages).keys()].map(number => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    disabled={currentPage === number + 1}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === number + 1 ? 'bg-gray-800 text-white' : 'text-gray-700 bg-white'} hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}>
                    {number + 1}
                  </button>
                ))}
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>

    <Sidebar orgid={params.org_id} />
    <CreateNewBridge orgid={params.org_id} />
  </div>


  );

}
export default Protected(Home);