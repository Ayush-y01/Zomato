import axios from "axios"
import { useState } from "react"
import { restaurantService } from "../main"
import toast from "react-hot-toast"

const AddMenuItem = () => {

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [image, setImage ] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)


    const resetForm = () => {
        setName("")
        setDescription("")
        setPrice("")
        setImage(null)
    }

    const handleSubmit = async() => {
        if (!name || !price || !image) {
            alert("Name Price and image is reuired")
            return
        }

        const formData = new FormData()

        formData.append("name",name)
        formData.append("description", description)
        formData.append("price", price)
        formData.append("file", image)

        try {
            setLoading(true)
            await axios.post(`${restaurantService}/api/item/new`,formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })

            toast.success("item added succssfully")
            resetForm()
            // onItemAdded();
        } catch (error) {
            console.log(error);
            toast.error("Failed to add file")
            
        }
    }
  return (
    <div>AddMenuItem</div>
  )
}

export default AddMenuItem