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

        return <div className={`relative flex gap-4 rounded-lg bg-white shadow-sm transition ${!item.isAvailable ? "opacity-700" : ""}`}></div>
      } )}
    </div>
  )
}

export default MenuItems