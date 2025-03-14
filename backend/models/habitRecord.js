import mongoose from 'mongoose'
const habitRecordSchema = new mongoose.Schema({
    dayCreated : Date, 
    allRecord : [
        {
            Date : Boolean,
        }
    ]

})

const HabitRecord = mongoose.model( 'HabitRecord' , habitRecordSchema)

export {HabitRecord}