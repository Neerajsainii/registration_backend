import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export const User = new mongoose.model("user", new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required:true},
    email: {
        type: String,required: true,
        // unique: true,  // match: /^\S+@\S+\.\S+$/ // Regular expression for basic email validation
    },
    password:{type:String, required:true},
    gender: { type: String, required:true,enum: ['Male', 'Female', 'Other'] }, // Specify allowed values
    dob: { type: Date ,required:true},
    country: { type: String, required:true,enum: ['USA', 'Canada', 'India', 'Other'] },
    state: { type: String, required:true,enum: ['State1', 'State2', 'State3', 'Other'] },
    city: { type: String ,required:true},
    zip: { type: String ,required:true},
    areaInterest: [{ type: String, required:true,enum: ['Interest1', 'Interest2', 'Interest3', 'Other'] }],
    profilePicture: {
        data: Buffer,
        contentType: String
    },
    document:{type:String},
    createBy: { type: mongoose.Schema.Types.ObjectId, default: null },

}), 'User');