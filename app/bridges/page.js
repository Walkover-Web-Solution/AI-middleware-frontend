"use client"
import { useCustomSelector } from "@/customSelector/customSelector";
import { getAllBridgesAction} from "@/store/action/bridgeAction";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
 
import { useRouter } from 'next/navigation'
import Protected from "@/components/protected";


function Home () {

  const allBridges = useCustomSelector((state) => state.bridgeReducer.allBridges) || []
  const dispatch = useDispatch()
  const router = useRouter()

  useEffect(() => {
     dispatch(getAllBridgesAction())

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
         {allBridges.map((item) => (
    <tr key={item._id} className="hover-row hover">
      {columns.map(column => (
        <td key={`${item._id}-${column}`}>{item[column]}</td>
      ))}
      <td className="button-container gap-3 flex justify-center align-center">
        <button onClick={() => router.push(`/history/${item._id}`)} className="btn btn-sm">History</button>
        <button onClick={() => router.push(`/configure/${item._id}`)} className="btn btn-sm">Configure</button>
      </td>
    </tr>
  ))}
      </tbody>
    </table>


  );
  
}
export default Protected(Home);