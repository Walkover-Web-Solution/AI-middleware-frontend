"use client"
import { useCustomSelector } from "@/customSelector/customSelector";
import { deleteBridgeAction, getAllBridgesAction } from "@/store/action/bridgeAction";
import { useEffect , useState} from "react";
import { useDispatch } from "react-redux";
import { toast } from 'react-toastify'
import { usePathname, useRouter } from 'next/navigation'
import Protected from "@/components/protected";
import CreateNewBridge from "@/components/createNewBridge";
import Sidebar from "@/components/Sidebar";


function Home() {

  const allBridges = useCustomSelector((state) => state.bridgeReducer.allBridges) || []
  const path = usePathname()
  const dispatch = useDispatch()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);

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
      dispatch(deleteBridgeAction(bridgeId));
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

useEffect(() => {
    dispatch(getAllBridgesAction())
  }, [])
  const columns = ["name", "_id", "service"];

  return ( <div className="drawer lg:drawer-open overflow-hidden">
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
              {currentBridges.map((item) => (
                  <tr key={item._id} className="hover-row hover">
                       {/* Table row content */}
                       
                    {columns.map(column => (
                      <td key={`${item._id}-${column}`}>{item[column]}</td>
                    ))}
                    <td key={item._id} className="button-container gap-3 flex justify-center align-center">
                    <button onClick={() => { setIsLoading(true); router.push(`/history/${item._id}`); }} className="btn btn-sm">History</button>
                    <button onClick={() => { setIsLoading(true); router.push(`/configure/${item._id}`); }} className="btn btn-sm">Configure</button>
                    <a onClick={() => handleDeleteBridge(item._id)} className="tooltip tooltip-primary" data-tip="delete">
                            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                              <g clip-path="url(#clip0_117_1501)" >
                                <path d="M7 4V2H17V4H22V6H20V21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H5C4.73478 22 4.48043 21.8946 4.29289 21.7071C4.10536 21.5196 4 21.2652 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z" fill="#03053D" />
                              </g>
                              {/* <defs>
                                <clipPath id={item._id} >
                                  <rect width="24 " height="24" fill="white" />
                                </clipPath>
                              </defs> */}
                            </svg>
                          </a>

                    </td>
                  </tr>
                ))}

                
              </tbody>
            </table>


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
     
      <Sidebar/>
      <CreateNewBridge />
    </div>


  );

}
export default Protected(Home);