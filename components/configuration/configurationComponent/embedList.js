import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { CircleAlert, Plus } from 'lucide-react';
import { useCustomSelector } from '@/customSelector/customSelector';
import { updateTools } from '@/store/reducer/bridgeReducer';
import { useDispatch } from 'react-redux';
import { updateBridgeAction } from '@/store/action/bridgeAction';

const EmbedList = ({ params }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [checkedState, setCheckedState] = useState({});
  const [index, setIndex] = useState(null);
  const [updateCompleted, setUpdateCompleted] = useState(false);

   const { bridge_tools } = useCustomSelector((state) => ({
    bridge_tools: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.tools || [],
  }));

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
 

  const handleOpenModal = (tool, index) => {
    setSelectedTool(tool);
    setIndex(index);
    const required = bridge_tools[index]?.required || [];
    setCheckedState(Object.keys(tool?.properties || {}).reduce((acc, key) => {
      acc[key] = required.includes(key);
      return acc;
    }, {}));
    setIsModalOpen(true);
  };
  
 
  const handleData = useCallback(async () => {
    if(!bridge_tools[index].required){
       setIsModalOpen(false);
       return;
    }
    const checkedKeysArray = Object.keys(checkedState).filter(key => checkedState[key]);
    await dispatch(updateTools({ data: checkedKeysArray, bridgeId: params?.id, index }));
    setUpdateCompleted(true); 
    setIsModalOpen(false);
    setSelectedTool(null);
  }, [checkedState, dispatch, params?.id, index]);

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
    bridge_tools
      .map((value,index) => (
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
              <span className={`mr-2 inline-block rounded-full capitalize bg-base-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-base-content ${value.status?.toLowerCase() === 'drafted' ? 'bg-yellow-100' : value?.status?.toLowerCase() === 'paused' ? 'bg-red-100' : 'bg-green-100'}`}>
                {value?.description?.trim() === "" ? "Description Required" : "active"}
              </span>
            </div>
          </div>
          <div className="dropdown m-1 shadow-none border-none">
            <div tabIndex={0} role="button" className="btn m-1 bg-transparent shadow-none border-none outline-none hover:bg-base-200" onClick={() => handleOpenModal(value, index)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                <path d="M 10.490234 2 C 10.011234 2 9.6017656 2.3385938 9.5097656 2.8085938 L 9.1757812 4.5234375 C 8.3550224 4.8338012 7.5961042 5.2674041 6.9296875 5.8144531 L 5.2851562 5.2480469 C 4.8321563 5.0920469 4.33375 5.2793594 4.09375 5.6933594 L 2.5859375 8.3066406 C 2.3469375 8.7216406 2.4339219 9.2485 2.7949219 9.5625 L 4.1132812 10.708984 C 4.0447181 11.130337 4 11.559284 4 12 C 4 12.440716 4.0447181 12.869663 4.1132812 13.291016 L 2.7949219 14.4375 C 2.4339219 14.7515 2.3469375 15.278359 2.5859375 15.693359 L 4.09375 18.306641 C 4.33275 18.721641 4.8321562 18.908906 5.2851562 18.753906 L 6.9296875 18.1875 C 7.5958842 18.734206 8.3553934 19.166339 9.1757812 19.476562 L 9.5097656 21.191406 C 9.6017656 21.661406 10.011234 22 10.490234 22 L 13.509766 22 C 13.988766 22 14.398234 21.661406 14.490234 21.191406 L 14.824219 19.476562 C 15.644978 19.166199 16.403896 18.732596 17.070312 18.185547 L 18.714844 18.751953 C 19.167844 18.907953 19.66625 18.721641 19.90625 18.306641 L 21.414062 15.691406 C 21.653063 15.276406 21.566078 14.7515 21.205078 14.4375 L 19.886719 13.291016 C 19.955282 12.869663 20 12.440716 20 12 C 20 11.559284 19.955282 11.130337 19.886719 10.708984 L 21.205078 9.5625 C 21.566078 9.2485 21.653063 8.7216406 21.414062 8.3066406 L 19.90625 5.6933594 C 19.66725 5.2783594 19.167844 5.0910937 18.714844 5.2460938 L 17.070312 5.8125 C 16.404116 5.2657937 15.644607 4.8336609 14.824219 4.5234375 L 14.490234 2.8085938 C 14.398234 2.3385937 13.988766 2 13.509766 2 L 10.490234 2 z M 12 8 C 14.209 8 16 9.791 16 12 C 16 14.209 14.209 16 12 16 C 9.791 16 8 14.209 8 12 C 8 9.791 9.791 8 12 8 z" />
              </svg>
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
          <button onClick={() => openViasocket()} className="btn btn-outline btn-sm mt-4">
            <Plus size={16} /> Add new Function
          </button>
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
            // className="text-gray-600 hover:text-gray-800"
          >
            <svg
      height="30px"
      width="30px"
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 26 26"
      xmlSpace="preserve"
    >
      <g>
        <path
          style={{ fill: '#030104' }}
          d="M21.125,0H4.875C2.182,0,0,2.182,0,4.875v16.25C0,23.818,2.182,26,4.875,26h16.25
          C23.818,26,26,23.818,26,21.125V4.875C26,2.182,23.818,0,21.125,0z M18.78,17.394l-1.388,1.387c-0.254,0.255-0.67,0.255-0.924,0
          L13,15.313L9.533,18.78c-0.255,0.255-0.67,0.255-0.925-0.002L7.22,17.394c-0.253-0.256-0.253-0.669,0-0.926l3.468-3.467
          L7.221,9.534c-0.254-0.256-0.254-0.672,0-0.925l1.388-1.388c0.255-0.257,0.671-0.257,0.925,0L13,10.689l3.468-3.468
          c0.255-0.257,0.671-0.257,0.924,0l1.388,1.386c0.254,0.255,0.254,0.671,0.001,0.927l-3.468,3.467l3.468,3.467
          C19.033,16.725,19.033,17.138,18.78,17.394z"
        />
      </g>
    </svg>
     </button>
        </div>
        <p className="mt-4">
          <span className="font-semibold">Description: </span> {selectedTool?.description}
        </p>
        <div className="mt-4">
          {selectedTool?.properties ? (
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
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(selectedTool.properties).map(([key, value], index) => (
                      <tr key={key}>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <input
                            type="checkbox"
                            className="checkbox mr-2"
                            id={`modal-param-${index}`}
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
                </table>
              </div>
            </>
          ) : (
            <p>No parameters</p>
          )}
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
