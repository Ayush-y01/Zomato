import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'


export interface AuthenticationRequest extends Request {
    user?: IUser | null;

}
export interface IUser{
    _id: string,
    name: string,
    email:string,
    image:string,
    role:string,
    restaurantId: string
}

export const isAuth = async (req: AuthenticationRequest, res: Response, next: NextFunction):Promise<void> => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer")) {
            res.status(401).json({
                message: "Please Login - No auth Header",
            })
            return;
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            res.status(401).json({
                messaage: "Please Login - Token missing"
            })
            return;
        }

        const decodedValue = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload

        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({
                messaage: "Invalid Token"
            })
            return;
        }

        req.user = decodedValue.user
        next()
    } catch (error) {
        res.status(500).json({
            message: "Please login - jwt error"
        })
    }
}

export const isSeller = async (req: AuthenticationRequest, res: Response, next: NextFunction):Promise<void> => {
    const user = req.user

    if (user && user.role !== "Seller") {
        res.status(401).json({
            message:"You are Not Authorized Seller"
        })
        return;
    }
    next();
}