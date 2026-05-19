import {Server} from "socket.io"
import http from "http"
import jwt from 'jsonwebtoken'

let io: Server;

export const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: "*"
        }
    })

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error("Umauthorized"))
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

            if (!decoded || !decoded.user) {
                return next(new Error("Umauthorized"))
            }

            socket.data.user = decoded.user;

            next();
            
        } catch (error) {
            console.log("❌ socket auth failed: " ,error);
            next(new Error("Umauthorized"))
        }
    })

    io.on("connection", (socket)=>{
        const user = socket.data.user;

        if (!user) {
            socket.disconnect()
            return
        }

        const userId = user._id;


        socket.join(`user: ${userId}`)

        if (user.restaurantId) {
            socket.join(`Restaurant: ${user.restaurantId}`)
        }

        console.log(`user Connected: ${userId}`);
        console.log("Socket Room ", [...socket.rooms])


        socket.on("disconnect",() => {
            console.log(`User Disconnected: ${userId}`);
            
        })
    })

    return io;
}

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}