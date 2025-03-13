import { integration } from "@/config"
import { useCustomSelector } from "@/customHooks/customSelector";
import { useEffect, useState } from "react"

export default function TriggersList({params}){
    const { triggerEmbedToken} = useCustomSelector((state) => ({
        triggerEmbedToken: state?.bridgeReducer?.org?.[params?.org_id]?.triggerEmbedToken,
      }));
    function openTrigger(triggerId){
        openViasocket(triggerId, {
            embedToken:triggerEmbedToken,
            meta:{
                type: 'trigger',
                bridge_id:params?.id
            }
        })
    }
    const [triggers,setTriggers]=useState([])
    async function fetchTriggers(){
        const data=await integration(triggerEmbedToken)
    setTriggers((data?.flows || [])?.filter(flow=>flow?.metadata?.bridge_id===params?.id))
    }
   
    
    useEffect(() => {
        fetchTriggers()
        window.addEventListener("message", handleMessage);
    
        return () => {
          window.removeEventListener("message", handleMessage);
        };
      }, [params?.id]);
    
      async function handleMessage(e) {
        const newTrigger=e?.data
        if(e.data?.metadata?.type!=='trigger') return;
        
        setTriggers(prevTriggers => {
            const existingIndex = prevTriggers.findIndex(trigger => trigger.id === newTrigger.id);
            
            if (existingIndex !== -1) {
                // Update existing trigger
                const updatedTriggers = [...prevTriggers];
                updatedTriggers[existingIndex] = { ...prevTriggers[existingIndex], ...newTrigger };
                return updatedTriggers;
            } else {
                // Add new trigger to the beginning
                return [newTrigger, ...prevTriggers];
            }
        });
        
      }




    return  <div className="flex flex-col gap-5 " style={{border:'1px solid black'}}>
      {triggers?.length ?  (triggers?.map(trigger=>{
            return <div  key={trigger?.id}  onClick={()=>{
                openTrigger(trigger?.id)
            }} className="cursor-pointer">
            {trigger?.title}
            {trigger?.description}
            {trigger?.status}
            </div>
        })) : null}
<button  onClick={()=>{
                openTrigger()
            }}>add new trigger</button>
    </div> 
}