"use client"

import axios from "axios"


const URL = process.env.NEXT_PUBLIC_SERVER_URL


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
      const response  = await axios.get(`http://localhost:7072/api/v1/config/getbridges/${bridgeId}`)
      return response
    } catch (error) {
      console.error(error)
      throw new Error(error)
    }
  }

  export  const createBridge = async (dataToSend) => {
    try {
         await axios.post(`${URL}/api/v1/config/createbridges` , dataToSend) 
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