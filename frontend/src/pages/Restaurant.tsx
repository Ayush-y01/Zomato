import { useEffect, useState } from "react"
import type { IRestaurant } from "../types"
import axios from "axios";
import { restaurantService } from "../main";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";


const Restaurant = () => {

  const [restaurant, setRestaurant] = useState<IRestaurant | null> (null);
  const [loading, setLoading] = useState(true);


  const fetchMyRestaurant = async()=>{
    try {
      const {data} = await axios.get(`${restaurantService}/api/restaurant/my`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })

      setRestaurant(data.restaurant || null)

      if (data.token) {
        localStorage.setItem("token",data.token)
        window.location.reload();
      }

    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchMyRestaurant()
  },[]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="test-gray-500">Loading your restaurant</p></div>

  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />
  }

  return (
    <div className="min-h-screen bg-gray-500 px-4 py-6 space-y-6">
      <RestaurantProfile restaurant={restaurant} onUpdate={setRestaurant} isSeller={true} />
    </div>
  )
}

export default Restaurant