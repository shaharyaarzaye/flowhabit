import mongoose from 'mongoose'
import { HabitRecord } from './habitRecord.js'
const UserSchema = new mongoose.Schema({
    email : String,
    password : String,
    name : String,
    HabitList : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'HabitRecord'
        }
    ]
})

export const User = mongoose.model( 'User' , UserSchema)

