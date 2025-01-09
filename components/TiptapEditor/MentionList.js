import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import "@/app/globals.css"
import { openModal } from "@/utils/utility";
import { MODAL_TYPE } from "@/utils/enums";
  
  const MentionList = forwardRef((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
  
    const selectItem = (index) => {
      const item = props.items[index];
      if (item) {
        // Insert the selected item's type wrapped with delimiters
        props.command({ id: `${item.key}}}` });
      }
    };
  
    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length
      );
    };
  
    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };
  
    const enterHandler = () => {
      selectItem(selectedIndex);
    };
  
    useEffect(() => setSelectedIndex(0), [props.items]);
  
    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          upHandler();
          return true;
        }
  
        if (event.key === "ArrowDown") {
          downHandler();
          return true;
        }
  
        if (event.key === "Enter") {
          enterHandler();
          return true;
        }
  
        return false;
      },
    }));
  
    return (
      <>
        <div className="mention-list p-4 rounded-md shadow-lg bg-white">
          {props.items.length > 0 ? (
            <>
              <div className="text-lg font-semibold mb-2 text-gray-700">Available Variables</div>
              {props.items.map((item, index) => (
                <button
                  className={`mention-item ${
                    index === selectedIndex ? "is-selected" : ""
                  }`}
                  key={item.type}
                  onClick={() => selectItem(index)}
                >
                  <div className="flex gap-3 items-center">
                    <span className="inline-block w-2 h-2 bg-blue-300 rounded-full"></span>
                    <span className="text-gray-800">{item.key}</span>
                  </div>
                </button>
              ))}
              <button
                className="mention-item mt-2 bg-blue-500 text-white rounded-md px-3 py-1"
                onClick={()=>openModal(MODAL_TYPE.CREATE_VARIABLE)}
              >
                Add Variables
              </button>
            </>
          ) : (
            <>
              <div className="text-lg font-semibold text-gray-500">No Variables Available</div>
              <button
                className="mention-item mt-2 bg-blue-500 text-white rounded-md px-3 py-1"
                onClick={()=>openModal(MODAL_TYPE.CREATE_VARIABLE)}
              >
                Add Variables
              </button>
            </>
          )}
        </div>
      </>
    );
  });
  
  export default MentionList;
  