"use client"

import axios from "@/utils/interceptor"
import { toast } from "react-toastify";


const URL = process.env.NEXT_PUBLIC_SERVER_URL;
const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;




export const getSingleModels = async () => {
    try {
      const getSingleModels = await axios.get(`${URL}/api/v1/config/models`)
      return getSingleModels
    } catch (error) {
      console.error(error)
      throw new Error(error)
    }
  }



export  const getSingleBridge = async (bridgeId) => {
    try {
      const response  = await axios.get(`${URL}/api/v1/config/getbridges/${bridgeId}`)
      return response
    } catch (error) {
      console.error(error)
      throw new Error(error)
    }
  }

  export const deleteBridge = async (bridgeId) => {
    try {
        const response = await axios.delete(`${URL}/api/v1/config/deletebridges/${bridgeId}`);
        return response;
    } catch (error) {
        console.error(error);
        toast.error("Failed to delete the bridge");
        throw new Error(error);
    }
};



  export  const createBridge = async (dataToSend) => {
    try {
        return await axios.post(`${URL}/api/v1/config/createbridges` , dataToSend) 
    } catch (error) {
      toast.error(error.response.data.error)
    }
  }


  export  const getAllBridges = async () => {
    try {
        const data = await axios.get(`${URL}/api/v1/config/getbridges/all`)
        return data;
    } catch (error) {
      console.error(error)
      throw new Error(error)
    }
  }



export  const updateBridge = async ( {bridgeId , dataToSend}) => {
    try {
         await axios.post(`${URL}/api/v1/config/updatebridges/${bridgeId}` , dataToSend) 
    } catch (error) {
      console.error(error)
    }
  }



export  const getSingleThreadData = async ( threadId , bridgeId) => {
    try {
        const getSingleThreadData = await axios.get(`${URL}/api/v1/config/threads/${threadId}/${bridgeId}`) 
        return getSingleThreadData
    } catch (error) {
      console.error(error)
    }
  }


  export const getHistory = async ( bridgeId) => {
    try {
        const getSingleThreadData = await axios.get(`${URL}/api/v1/config/history/${bridgeId}`) 
        return getSingleThreadData
    } catch (error) {
      console.error(error)
    }
  }

  export const dryRun = async (localDataToSend) => {

    try {
      let dryRun
      if(localDataToSend.configuration.type === "chat") dryRun = await axios.post(`${URL}/api/v1/model/playground/chat/completion` , localDataToSend) 
      if(localDataToSend.configuration.type === "completion") dryRun = await axios.post(`${URL}/api/v1/model/playground/completion` , localDataToSend) 
      if(localDataToSend.configuration.type === "embedding") dryRun = await axios.post(`${URL}/api/v1/model/playground/embeddings` , localDataToSend) 
      
        return dryRun.data
    } catch (error) {
      console.error(error)
    }
  }






  // api keys api 

  export const userdetails = async() => {
    try{
      console.log(`${PROXY_URL}/api/c/getCompanies`)
      const details = await axios.get(`${PROXY_URL}/api/c/getDetails`)
      return details
    }
    catch(error)
    {
      console.error(error)
    }
  }

  export const logout = async()=> {
    try{
 await axois.delete(`${PROXY_URL}/{featureId}/deleteCCompany/{cCompanyId}`)

    }catch{
      console.error("problem in logout ")
    }
  }

  export const allAuthKey = async()=> {
    try {
      
      const response = await axios(`${PROXY_URL}/api/c/authkey`)
      return response?.data?.data
    } catch (error) {
      console.error(error)
    }
  } 

 export const logoutUserFromMsg91 = async (headers) => {
    const User = await axios.delete(`${PROXY_URL}/api/c/logout`, headers)
    return User
  }

  export const createAuthKey = async (dataToSend) => {
    try {
      return await axios.post(`${PROXY_URL}/api/c/authkey` , dataToSend)

    } catch (error) {
      console.error(error)
    }
  }

  export const deleteAuthkey = async(id) => {
    
    try {
      await axios.delete(`${PROXY_URL}/api/c/authkey/${id}`)
    } catch (error) {
      console.error(error)
    }
  }

  export  const createOrg = async (dataToSend) => {
    try {
        // console.log(dataToSend)
        const data = await axios.post(`${PROXY_URL}/api/c/createCompany` ,dataToSend) 
        return data;  
    } catch (error) {
      toast.error(error.response.data.error)
    }
  }


  export  const getAllOrg = async () => {
    try {
        const data = await axios.get(`${PROXY_URL}/api/c/getCompanies`)
        return data;
    } catch (error) {
      console.error(error)
      throw new Error(error)
    }
  }


  export const switchOrg = async (company_ref_id) => {
    try {
      const data = await axios.post(`${PROXY_URL}/api/c/switchCompany`, { company_ref_id }); 
      // console.log(data);
      return data;
    } catch (error) {
      console.log(error);
      return error;
    }
  };


  export const inviteUser = async (email) => {
    console.log(email)
    try{
       const response = await axios.post(`${PROXY_URL}/api/c/addUser`,email)
       console.log(response.data);
       return response.data;
    }catch(error){
      console.log(error);
      return error;
    }
  }

  export const getInvitedUsers = async() => {
    try{
         const data = await axios.get(`${PROXY_URL}/api/c/getUsers`);
         console.log(data)
         return data;
    }catch(error){
      console.log(error);
      return error;
    }
  }
  