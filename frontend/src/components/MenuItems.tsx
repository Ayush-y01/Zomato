import { useState } from "react";
import type { IMenuItem } from "../types"


interface menuItemsProps {
  items: IMenuItem[];
  onItemDeleted: ()=>void;
  isSeller: boolean
}

const MenuItems = ({items, onItemDeleted, isSeller}: menuItemsProps) => {

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null)


  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const isLoading = loadingItemId === item._id;

        return <div 
        className={`relative flex gap-4 rounded-lg bg-white shadow-sm transition ${!item.isAvailable ? "opacity-700" : ""}`}
        >
          <div className="relative shrink-0">
            <img src={item.image} alt="" 
            className={`h-20 w-20 rounded object-cover ${!item.isAvailable ? "grayscale brightness-75" : ""}`} />
            {
              !item.isAvailable &&( <span className="absolute inset-0 flex  items-center
              rounded bg-black/60 text-xs justify-center font-semibold text-white
              ">Not Available</span>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h3 className="font-semibold ">
              {item.name}
              </h3>
              {
                item.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {item.description}
                  </p>
                )}
            </div>
            <div className="flex items-center justify-center">
                <p className="font-medium">₹{item.price}</p>
                {
                  isSeller && <div className="flex gap-2 ">
                    <button onClick={() => {}} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100" >{} </button>
                  </div>
                }
            </div>

          </div>
        </div>
      } )}
    </div>
  )
}

export default MenuItems