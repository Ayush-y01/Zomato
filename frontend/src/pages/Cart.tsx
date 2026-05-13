import { useNavigate } from "react-router-dom"
import { useAppData } from "../context/AppContext"
import { useState } from "react"
import type { ICart, IMenuItem, IRestaurant } from "../types"
import axios from "axios"
import { restaurantService } from "../main"
import toast from "react-hot-toast"
import { TbTrash } from "react-icons/tb"

const Cart = () => {
  const {cart, subTotal, quantity, fetchCart} = useAppData()
  const navigate = useNavigate()

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null)
  const [clearingCart, setClearingCart] = useState(false)


  if (!cart || cart.length === 0) {
    return <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-gray-500 text-lg">Your Cart is empty</p>
    </div>
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryFee = subTotal < 300 ? 49 : 0;

  const platFormFee = 7;

  const grandTotal = subTotal + deliveryFee + platFormFee

  const increaseQty = async(itemId: string) => {
    try {
      setLoadingItemId(itemId)

      await axios.put(`${restaurantService}/api/cart/inc`,{itemId},{
        headers: {
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }
      })
      await fetchCart()
    } catch (error) {
      toast.error("Something went wrong")
    }finally{
      setLoadingItemId(null)
    }
  }

    const decreaseQty = async(itemId: string) => {
    try {
      setLoadingItemId(itemId)

      await axios.put(`${restaurantService}/api/cart/dec`,{itemId},{
        headers: {
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }
      })
      await fetchCart()
    } catch (error) {
      toast.error("Something went wrong")
    }finally{
      setLoadingItemId(null)
    }
  }
    const clearCart = async () => {
      const confirm = window.confirm("Are You Sure You want to clear cart")
    try {
      setClearingCart(true)
      await axios.delete(`${restaurantService}/api/cart/clear`,{
        headers: {
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }
      })
      await fetchCart()
    } catch (error) {
      toast.error("Something went wrong")
    }finally {
      setClearingCart(false)
    }
  }

  const checkout = () => {
    navigate("/checkout")
  }
return (
  <div className="bg-gray-50 min-h-screen py-8">
    <div className="mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

      <div className="md:col-span-2 space-y-6">

        <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-md border">
          <h2 className="text-2xl font-bold text-gray-800">{restaurant.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {restaurant.autoLocation?.formattedAddress}
          </p>
        </div>


        {cart.map((cartItem: ICart) => {
          const item = cartItem.itemId as IMenuItem;
          const isLoading = loadingItemId === item._id;

          return (
            <div
              key={item._id}
              className="group flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 rounded-xl object-cover group-hover:scale-105 transition"
                />

                <div>
                  <h3 className="font-semibold text-gray-800">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">₹{item.price}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-1">
                <button
                  onClick={() => decreaseQty(item._id)}
                  disabled={isLoading}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-200 transition"
                >
                  -
                </button>

                <span className="font-medium w-6 text-center">
                  {cartItem.quantity}
                </span>

                <button
                  onClick={() => increaseQty(item._id)}
                  disabled={isLoading}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-200 transition"
                >
                  +
                </button>
              </div>

              <div className="text-lg font-semibold text-gray-800">
                ₹{item.price * cartItem.quantity}
              </div>
            </div>
          );
        })}

        <button
          onClick={clearCart}
          disabled={clearingCart}
          className="text-red-500 flex gap-2 text-sm hover:text-red-600 transition"
        >
          Clear Cart <TbTrash size={16} />
        </button>
      </div>

      <div className="sticky top-24 h-fit">
        <div className="rounded-2xl bg-white p-6 shadow-lg border">

          <h2 className="text-xl font-semibold mb-5">Bill Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Item Total</span>
              <span>₹{subTotal}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span> {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee</span>
              <span>₹{platFormFee}</span>
            </div>
          </div>

           {subTotal < 250 && (
              <p className="text-sm text-gray-500">
                Add Item worth ${250 - subTotal} more
                to get Free delivery
              </p>
            )}


          <div className="my-5 border-t pt-4 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-green-600">₹{grandTotal}</span>
          </div>


          <button
            onClick={checkout}
            disabled={!restaurant.isOpen}
            className={`w-full bg-linear-to-r from-red-500 to-red-600 hover:opacity-90 text-white 
            py-3 rounded-xl font-semibold shadow-md transition ${!restaurant.isOpen ? "opacity-50 cursor-not-allowed" : ""} `}
          >
            {!restaurant.isOpen ? "Restaurant is Closed" : "Proceed to Checkout"}
          </button>

          <div className="mt-4 text-xs text-gray-500 bg-gray-100 p-3 rounded-lg">
            🎉 Apply coupon at checkout & save more
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

export default Cart