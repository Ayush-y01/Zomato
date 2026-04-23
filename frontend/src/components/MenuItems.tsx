import { useState } from "react";
import type { IMenuItem } from "../types";

import { FiEyeOff } from "react-icons/fi";
import { BsCartPlus, BsEye } from "react-icons/bs";
import { BiTrash } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

interface menuItemsProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItems = ({ items, onItemDeleted, isSeller }: menuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const handleDelete = async(itemId: string)=> {
    const confirm = window.confirm("Are you Sure to delete")

    if (!confirm) return

    try {
      await axios.delete(`${restaurantService}/api/item/${itemId}`, {
        headers :{
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })

      toast.success("item deleted")
      onItemDeleted()
    } catch (error:any) {
      console.log(error.message)
      toast.error("Failed to delete item")
    }
  }
  const toggleAvailblity = async(itemId: string)=> {

    try {
      const {data} = await axios.put(`${restaurantService}/api/item/status/${itemId}`,{} ,{
        headers :{
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })

      toast.success(data.message)
      onItemDeleted()
    } catch (error:any) {
      console.log(error.message)
      toast.error("Failed to update status")
    }
  }

  const {fetchCart} = useAppData()
  
  const addToCart = async(restaurantId:string, itemId:string, ) => {
    try {
      setLoadingItemId(itemId)

      const {data} = await axios.post(`${restaurantService}/api/cart/add`,{
        restaurantId, itemId
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      toast.success(data.message)
      fetchCart()
    } catch (error:any) {
      toast.error(error.response.data.message)
    }finally{
      setLoadingItemId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const isItemLoading = loadingItemId === item._id;

        return (
          <div
            key={item._id}
            className={`relative flex gap-4 rounded-lg bg-white p-3 shadow-sm transition ${
              !item.isAvailable ? "opacity-70" : ""
            }`}
          >

            <div className="relative shrink-0">
              <img
                src={item.image || "/fallback.png"} 
                alt={item.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/fallback.png";
                }}
                className={`h-20 w-20 rounded object-cover ${
                  !item.isAvailable ? "grayscale brightness-75" : ""
                }`}
              />

              {!item.isAvailable && (
                <span className="absolute inset-0 flex items-center justify-center rounded bg-black/60 text-xs font-semibold text-white">
                  Not Available
                </span>
              )}
            </div>


            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="font-semibold">{item.name}</h3>

                {item.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>


              <div className="flex items-center justify-between mt-2">
                <p className="font-medium">₹{item.price}</p>

                {isSeller ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAvailblity(item._id)}
                      className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                    >
                      {item.isAvailable ? (
                        <BsEye size={18} />
                      ) : (
                        <FiEyeOff size={18} />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <BiTrash size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={!item.isAvailable || isItemLoading}
                    onClick={() => addToCart(item.restaurantId, item._id )}
                    className={`flex items-center justify-center rounded-lg p-2 ${
                      !item.isAvailable || isItemLoading
                        ? "cursor-not-allowed text-gray-400"
                        : "text-red-400 hover:bg-red-50"
                    }`}
                  >
                    {isItemLoading ? (
                      <VscLoading size={18} className="animate-spin" />
                    ) : (
                      <BsCartPlus size={18} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuItems;