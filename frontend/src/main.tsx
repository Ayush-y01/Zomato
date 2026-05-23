import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext.tsx';
import 'leaflet/dist/leaflet.css';
import { SocketProvider } from './context/socketContext.tsx'

export const authService = "http://localhost:5000";
export const restaurantService = "http://localhost:5001";
export const utilsService = "http://localhost:5002";
export const RealtimeService = "http://localhost:5004";
export const RiderService = "http://localhost:5005";

createRoot(document.getElementById('root')!).render(
    <GoogleOAuthProvider clientId="284911799169-8e8vg0jufb5pmo0ee8ging0cnbfechd0.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
          <App />   
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
)
