import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { CircleAlert, Plus, Settings, X } from 'lucide-react';
import { useCustomSelector } from '@/customSelector/customSelector';
import { updateTools } from '@/store/reducer/bridgeReducer';
import { useDispatch } from 'react-redux';
import { updateBridgeAction } from '@/store/action/bridgeAction';


const EmbedList = ({ params }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [checkedState, setCheckedState] = useState({});
  const [toolsId, settoolsId] = useState(null);
  const [updateCompleted, setUpdateCompleted] = useState(false);

   const {integrationData, bridge_tools } = useCustomSelector((state) => ({
    integrationData: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.integrationData,
    bridge_tools: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.tools || [],
  }));

     const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'drafted':
                return 'bg-yellow-100';
            case 'paused':
                return 'bg-red-100';
            case 'active':
            case 'published':
                return 'bg-green-100';
            case 'rejected':
                return 'bg-gray-100';
            // Add more cases as needed
            default:
                return 'bg-gray-100';
        }
    };
   useEffect(() => {
    const closeModalOnEsc = (event) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false)
      }
    };

    document.addEventListener("keydown", closeModalOnEsc);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", closeModalOnEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const modalRef = useRef(null)
  const dispatch = useDispatch();
 

  const handleOpenModal = (tool, toolsId) => {
    setSelectedTool(tool);
    settoolsId(toolsId);
    const required = tool?.required || [];
    // const required = bridge_tools.forEach((tool) => {
    //     if (tool.name === toolsId) {
    //         return tool;
    //     }
    // });
    setCheckedState(Object.keys(tool?.properties || {}).reduce((acc, key) => {
      acc[key] = required.includes(key);
      return acc;
    }, {}));
    setIsModalOpen(true);
  };
  
 
  const handleData = useCallback(() => {
    const checkedKeysArray = Object.keys(checkedState)?.filter(key => checkedState[key]);
    dispatch(updateTools({ data: checkedKeysArray, bridgeId: params?.id, toolsId:toolsId }));
    setUpdateCompleted(true); 
    setIsModalOpen(false);
    setSelectedTool(null);
  }, [checkedState, dispatch, params?.id]);

  useEffect(() => {
    if (updateCompleted) {
      const updateBridge = async () => {
        await dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: { tools: bridge_tools } } }));
        setUpdateCompleted(false); // Reset updateCompleted after dispatching
      };

      if (bridge_tools.length > 0) {
        updateBridge();
      }
    }
  }, [updateCompleted, dispatch,bridge_tools]);

  const handleCheckboxChange = (key) => {
    setCheckedState(prevState => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };
  const renderEmbed = useMemo(() => (
   [...bridge_tools]?.sort((a, b) => {
            const titleA = integrationData[a.name]?.title || '';
            const titleB = integrationData[b.name]?.title || '';
            return titleA.localeCompare(titleB);
        })
      .map((value) => (
        <div key={value.name} className="flex flex-col w-[250px] md:flex-row items-start rounded-md border cursor-pointer justify-between hover:bg-base-200">
          <div id={value.name} className={`p-4 ${value?.description?.trim() === "" ? "border-red-600" : ""}`} onClick={() => openViasocket(value?.name)}>
            <div className="flex justify-between items-center">
              <h1 className="text-base sm:text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-full text-base-content">
                {value.name}
              </h1>
              {value?.description?.trim() === "" && <CircleAlert color='red' size={16} />}
            </div>
            <p className="mt-3 text-xs sm:text-sm line-clamp-3">
              {value.description ? value.description : "A description is required for proper functionality."}
            </p>
            <div className="mt-4">
               <span className={`mr-2 inline-block rounded-full capitalize bg-base-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-base-content ${getStatusClass(integrationData[value.name]?.status)}`}>
                {value?.description?.trim() === "" ? "Description Required" : integrationData[value.name]?.status}
                </span>
            </div>
          </div>
          <div className="dropdown m-1 shadow-none border-none">
            <div tabindex={0} role="button" className="btn m-1 bg-transparent shadow-none border-none outline-none hover:bg-base-200" onClick={()=> handleOpenModal(value,value.name)}>
              <Settings/>
            </div>
          </div>
        </div>
      ))
  ), [bridge_tools]);

  return ( bridge_tools &&
    (<div className="p-4">
      <div className="form-control">
        <div className="label flex-col mt-2 items-start">
          <div className="flex flex-wrap gap-4">
            {renderEmbed}
          </div>
          <button onClick={() => openViasocket()} className="btn btn-outline btn-sm mt-4"><Plus size={16} /> Add new Function</button>
        </div>
      </div>
      {isModalOpen && (
  <div className='p-10'>
    <div  className="fixed inset-0  flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
      
      <div className="bg-white rounded-lg p-8 w-full max-w-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-[16px] font-semibold">
            <span>Function Name: </span> {selectedTool?.name}
          </h2>
          <button
            onClick={handleData}
            
          >
            <X/>
     </button>
        </div>
        <p className="mt-4">
          <span className="font-semibold">Description: </span> {selectedTool?.description}
        </p>
        <div className="mt-4">
         
           
            <>
              <h2 className="font-semibold mb-4 text-[16px]">Required Parameters:</h2>
              <div className="overflow-y-auto max-h-[300px] ">
                <table className="min-w-full divide-y divide-gray-200 overflow-y-auto">
                  <thead className="bg-gray-100">
                    <tr>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameters</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                   {selectedTool?.properties ? (
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(selectedTool.properties).map(([key, value], toolsId) => (
                      <tr key={key}>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="checkbox"
                            className="checkbox mr-2"
                            id={`modal-param-${toolsId}`}
                            checked={checkedState[key]}
                            onChange={() => handleCheckboxChange(key)}
                          />

                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{key}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {typeof value === 'object' ? JSON.stringify(value) : value || ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  ) : (
            <p className='m-auto w-full pt-[30px] text-center'>No parameters</p>
          )}
                </table>
              </div>
            </>
          
         
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleData}
            className="bg-gray-200 hover:bg-gray-400 px-4 py-2 rounded"
          >
            OK
          </button>
        </div>
      </div>
    </div>
 </div>
)}
</div>
    )
  );
  
};

export default EmbedList;
