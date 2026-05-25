import mongoose,{ Schema, Document } from "mongoose";


export interface IRider extends Document{
    userId: string;
    picture:string;
    phoneNumber:number;
    aadharNumber:number;
    drivingLicense:string;
    isVerified:boolean;
    location: {
        type:"Point";
        coordinates:[number, number];
    };
    isAvailable:boolean;
    lastActiveAt:Date;
    createdAt:Date;
    updateAt:Date;
}

const schema = new Schema<IRider>(
    {
        userId:{
            type:String,
            required:true,
            unique:true
        },
        picture:{
            type:String,
            required:true
        },
        phoneNumber:{
            type:Number,
            required:true,
        },
        aadharNumber:{
            type:Number,
            required:true,
            unique:true
        },
        drivingLicense: {
            type:String,
            required:true,
            unique:true
        },
        isVerified:{
            type:Boolean,
            default:true
        },
        location:{
            type:{
                type:String,
                enum:["Point"],
                default:"Point",
            },
            coordinates: {
                type:[Number],
                required:true
            },

        },
        isAvailable:{
            type:Boolean,
            default:false
        },
        lastActiveAt:{
            type:Date,
            default:Date.now,
        }

    },
    {timestamps:true}
);

schema.index({location: "2dsphere"});


export const Rider = mongoose.model<IRider>("Rider",schema)