// import { useState } from "react";
// export const Habit = () => {
//         let daystoshow = 6;
        // let [HabitStatus , setHabitStatus] = useState(true)
        // const handelClick = ()=>{
        //     setHabitStatus((prev) => !prev)
        // }
    
//         return (
//         <div className="flex flex-row grid grid-cols-2 border-1 rounded-md border-white mt-[4rem] p-5">
//             <p>Habit Name</p>
//             <div className="flex justify-between">
//             {Array.from({ length: daystoshow }, (_, index) => (
//                 <div key={index} className="text-white" onClick={handelClick}>{HabitStatus ? "✔" : "x"}</div>
//       ))}
//             </div>
//         </div>
//     )
// }
import { useState } from "react"

export const Habits = ()=>{
    let [HabitStatus , setHabitStatus] = useState(true)
    const handelClick = (e)=>{
        console.log(e.target)
        setHabitStatus((prev) => !prev)

    }
    const today = new Date();
    console.log(today.getDate().toString() -2)

    return(
        <div>
            <div className="flex flex-row grid grid-cols-2 border-b border-b-blue-500 mt-[1rem] p-5">
                <div></div>
                <div className="flex justify-between">
                {Array.from({ length: 4 }).map((_, index) => (
                     <div key={index}>{today.getDate().toString() - index}</div>
                ))}
                </div>
            </div>

            <div className="flex flex-row grid grid-cols-2 border-1  rounded-md border-white mt-[1rem] p-5">
            
            <p>Habit Name</p>
            <div className="flex justify-between">
            {Array.from({ length: 4 }, (_, index) => (
                 <div key={index}  className="cursor-pointer" >{HabitStatus ? <span onClick={handelClick} className="text-green-200">✔</span> : <span onClick={handelClick} className="text-[#ff0000]">x</span>}</div>
       ))}
             </div>

        </div>
        </div>
    )
}