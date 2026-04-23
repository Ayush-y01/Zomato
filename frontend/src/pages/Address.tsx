import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import L from "leaflet";
import { LuLocateFixed } from "react-icons/lu";
import { BiLoader, BiPlus, BiTrash } from "react-icons/bi";


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const LocationPicker = ({
  setLocation,
}: {
  setLocation: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocateMeButton = ({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void;
}) => {
  const map = useMap();

  const locateUser = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16);
        onLocate(latitude, longitude);
      },
      () => toast.error("Location permission denied")
    );
  };

  return (
    <button
      onClick={locateUser}
      className="absolute right-4 top-4 z-50 flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm shadow-lg backdrop-blur hover:bg-white"
    >
      <LuLocateFixed size={16} />
      Locate Me
    </button>
  );
};

const AddAddressPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [mobile, setMobile] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const fetchFormattedAddress = async (lat: number, lng: number) => {
  try {
    const { data } = await axios.get(
      `${restaurantService}/api/geocode/reverse?lat=${lat}&lng=${lng}`
    );

    setFormattedAddress(data.display_name || "");
  } catch {
    toast.error("Failed to fetch address");
  }
};

  const setLocation = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    fetchFormattedAddress(lat, lng);
  };

  const fetchAddresses = async () => {
  try {
    const res = await axios.get(
      `${restaurantService}/api/address/all`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = res.data;

    // 🔥 handle all possible formats safely
    if (Array.isArray(data)) {
      setAddresses(data);
    } else if (Array.isArray(data.addresses)) {
      setAddresses(data.addresses);
    } else if (Array.isArray(data.data)) {
      setAddresses(data.data);
    } else {
      setAddresses([]);
      console.error("Unexpected API response:", data);
    }

  } catch (err) {
    toast.error("Failed to load addresses");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAddresses();
  }, []);

  const addAddress = async () => {
    if (!mobile || !formattedAddress || latitude === null || longitude === null) {
      toast.error("Select location + enter mobile");
      return;
    }

    try {
      setAdding(true);

      await axios.post(
        `${restaurantService}/api/address/new`,
        { formattedAddress, mobile, latitude, longitude },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Address added");

      setMobile("");
      setFormattedAddress("");
      setLatitude(null);
      setLongitude(null);

      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setAdding(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;

    try {
      setDeletingId(id);

      await axios.delete(`${restaurantService}/api/address/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Deleted");
      fetchAddresses();
    } catch {
      toast.error("Failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        📍 Delivery Address
      </h1>

      {/* MAP */}
      <div className="relative h-100 rounded-2xl overflow-hidden shadow-lg border">
        <MapContainer
          center={[latitude || 28.6139, longitude || 77.209]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationPicker setLocation={setLocation} />
          <LocateMeButton onLocate={setLocation} />
          {latitude && longitude && <Marker position={[latitude, longitude]} />}
        </MapContainer>
      </div>

      {/* SELECTED ADDRESS */}
      {formattedAddress && (
        <div className="rounded-xl bg-green-50 border p-4 text-sm shadow-sm">
          📍 {formattedAddress}
        </div>
      )}

      {/* FORM */}
      <div className="flex gap-3">
        <input
          type="tel"
          placeholder="Mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="flex-1 rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-400"
        />

        <button
          disabled={adding}
          onClick={addAddress}
          className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-white hover:bg-red-600 transition"
        >
          {adding ? <BiLoader className="animate-spin" /> : <BiPlus />}
          Save
        </button>
      </div>

      {/* ADDRESS LIST */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Saved</h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : addresses.length === 0 ? (
          <p className="text-gray-500">No addresses</p>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr._id}
              className="flex justify-between items-center rounded-xl border p-4 shadow-sm hover:shadow-md transition"
            >
              <div>
                <p className="font-medium">{addr.formattedAddress}</p>
                <p className="text-sm text-gray-500">📞 {addr.mobile}</p>
              </div>

              <button
                onClick={() => deleteAddress(addr._id)}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50"
              >
                {deletingId === addr._id ? (
                  <BiLoader className="animate-spin" />
                ) : (
                  <BiTrash />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddAddressPage;