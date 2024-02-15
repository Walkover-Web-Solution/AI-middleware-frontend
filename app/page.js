"use client"
import { useCustomSelector } from "@/customSelector/customSelector";
import { createBridgeAction, getAllBridgesAction, getSingleBridgesAction, updateBridgeAction } from "@/store/action/bridgeAction";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
 
import { useRouter } from 'next/navigation'
import { getAllBridges } from "@/api";
// import { getAllBridges } from "@/api";

export default  function Home () {

  const allBridges = useCustomSelector((state) => state.bridgeReducer.allBridges) || []
  const dispatch = useDispatch()
  const router = useRouter()
  const getBridges = async () => {
    try {
      const response = await getAllBridges();
      console.log(response, "response")
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
     dispatch(getAllBridgesAction())
    //  getBridges() 
  },[])
  const columns = [ "name", "_id", "service"];

 return (

    <table className="table">
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column}>{column.replace(/_/g, ' ').charAt(0).toUpperCase() + column.replace(/_/g, ' ').slice(1)}</th> // Beautify the column headers
          ))}
        </tr>
      </thead>
      <tbody>
        {/* {allBridges.map((item) => (
          <tr key={item._id} className="hover cursor-pointer">
            {columns.map(column => (
              <td key={`${item._id}-${column}`}>{item[column]}</td>
            ))}
          </tr>
        ))} */}
         {allBridges.map((item) => (
    <tr key={item._id} className="hover-row hover">
      {columns.map(column => (
        <td key={`${item._id}-${column}`}>{item[column]}</td>
      ))}
      <td className="button-container gap-3 flex justify-center align-center">
        {/* Buttons are hidden by default, shown on row hover */}
        <button onClick={() => router.push(`/history/${item._id}`)} className="btn btn-sm">History</button>
        <button onClick={() => router.push(`/configure/${item._id}`)} className="btn btn-sm">Configure</button>
      </td>
    </tr>
  ))}
      </tbody>
    </table>


  );
}
