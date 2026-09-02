'use client'

import { useEffect, useState } from "react"
import getRequest from "./utils/getRequest"
import type { Property } from "./types/types"
import Loader from "./components/Loader/Loader"

export default function Home() {

  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const properties = await getRequest<Property[]>("api/properties")
        console.log(properties)
        setLoading(false)
      } catch (error) {
        console.error(error)
      }
    }

    loadProperties()
  }, [])

  
  return (
    <>
    {loading && (
      <Loader/>
    )}
    <div>Kasa</div>
    </>
   
    
  )
}
