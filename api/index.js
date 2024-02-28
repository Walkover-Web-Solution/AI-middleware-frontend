"use client"

import axios from "@/utils/interceptor"


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

  export  const createBridge = async (dataToSend) => {
    try {
        return await axios.post(`${URL}/api/v1/config/createbridges` , dataToSend) 
    } catch (error) {
      console.error(error)
    }
  }


  export  const getAllBridges = async () => {
    try {
        return  await axios.get(`${URL}/api/v1/config/getbridges/all`)
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



export  const getSingleThreadData = async ( {threadId , bridgeId , dataToSend}) => {
    try {
        const getSingleThreadData = await axios.post(`${URL}/api/v1/config/threads/${threadId}/${bridgeId}` , dataToSend) 
        return getSingleThreadData
    } catch (error) {
      console.error(error)
    }
  }


  export const getHistory = async ( { bridgeId , dataToSend}) => {
    try {
        const getSingleThreadData = await axios.post(`${URL}/api/v1/config/history/${bridgeId}` , dataToSend) 
        return getSingleThreadData
    } catch (error) {
      console.error(error)
    }
  }

  export const dryRun = async ( {dataToSend}) => {
    try {
        const dryRun = await axios.post(`${URL}/api/v1/model/playground/chat/completion` , dataToSend) 
        return dryRun
    } catch (error) {
      console.error(error)
    }
  }






  // api keys api 

  export const userdetails = async() => {
    try{
      const details = await axios.get(`${PROXY_URL}/api/c/getCompanies`)
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