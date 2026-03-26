import axios from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../main";
import { type LocationData, type AppContextType, type User } from "../types";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    const [location, setLocation] = useState<LocationData | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [city, setCity] = useState("fetching location...");

    async function fetchUser() {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setUser(null);
                setIsAuth(false);
                return;
            }

            const { data } = await axios.get(`${authService}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(data);
            setIsAuth(true);
        } catch (error) {
            console.log(error);
            setUser(null);
            setIsAuth(false);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) return;

        setLoadingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );

                    const data = await res.json();

                    
                    setLocation({
                        latitude,
                        longitude,
                        formattedAddress: data.display_name || "current location",
                    });

                    setCity(
                        data?.address?.city ||
                        data?.address?.town ||
                        data?.address?.village ||
                        data?.address?.suburb ||
                        data?.address?.state_district ||
                        data?.address?.county ||
                        "your location"
                    );
                } catch (error) {
                    setLocation({
                        latitude,
                        longitude,
                        formattedAddress: "current location",
                    });
                    setCity("failed to load");
                } finally {
                    setLoadingLocation(false);
                }
            },
            () => {
                setLoadingLocation(false);
                setCity("location denied");
            }
        );
    }, []);

    return (
        <AppContext.Provider
            value={{
                isAuth,
                loading,
                setUser,
                setIsAuth,
                setLoading,
                user,
                location,
                loadingLocation,
                city,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppData = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppData must be used within AppProvider");
    }
    return context;
};