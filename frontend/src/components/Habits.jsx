import { useState } from "react";

export const Habits = () => {
    const today = new Date();
    const daysToDisplay = 5;
    const days = [];
    let recordObj = {};



    // Generate the last 4 days dynamically
    for (let i = 0; i < daysToDisplay; i++) {
        const day = today.getDate();
        days.push(day);
        recordObj[day] = false; // Default: false (X)
        today.setDate(today.getDate() - 1);
    }

    // State to track habit records
    const [habit, setHabit] = useState(recordObj);

    const handleClick = (dateKey) => {
        setHabit((prevState) => ({
            ...prevState, 
            [dateKey]: !prevState[dateKey], // Toggle the true/false value
        }));
    };
    recordObj = {...habit}
    
    fetch("https://redesigned-fiesta-46xv5jpg465cq4r5-3000.app.github.dev/api/data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(recordObj)  // Convert object to JSON string
    })
    .then(response => response.json())
    .then(result => console.log("Server Response:", result))
    .catch(error => console.error("Error:", error));



    console.log("robj" , recordObj , "hab" , habit)
    return (
        <div>
            {/* Display the date headers */}
            <div className="flex flex-row grid grid-cols-2 border-b border-b-blue-500 mt-[1rem] p-5">
                <div></div>
                <div className="flex justify-between">
                    {days.map((date) => (
                        <div key={date}>{date}</div>
                    ))}
                </div>
            </div>

            {/* Display the habit tracker */}
            <div className="flex flex-row grid grid-cols-2 border-1 rounded-md border-white mt-[1rem] p-5">
                <p>Habit Name</p>
                <div className="flex justify-between">
                    {days.map((date) => (
                        <div 
                            className="cursor-pointer border px-3 py-1 rounded text-green-200 hover:bg-gray-100"
                            key={date} 
                            onClick={() =>{ 
                                handleClick(date)
                            }

                                
                            } 
                        >
                            {habit[date] ? "✔️" : "❌"}  {/* Shows "Y" if true, "X" if false */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
