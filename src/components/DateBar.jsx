import React from 'react';

// Get a date object for a specific day offset (e.g., offset = 0 for Today, offset = -1 for Yesterday)
const getOffsetDate = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date;
};

// Generate the array of dates to show: 3 Days Ago, 2 Days Ago, Yesterday, Today.
const datesToShow = [-3, -2, -1, 0].map(offset => {
  const dateObj = getOffsetDate(offset);
  return {
    date: dateObj.getDate(),
    day: dateObj.toLocaleString("en-US", { weekday: "short" }),
    isToday: offset === 0, // Flag to easily style the current day
  };
});

function DateBar() {
  return (
    <div className="grid grid-cols-2 text-white  p-2">
      <div className='col-span-1'>{/* Placeholder for future content */}</div>
      <div className="flex col-span-1 justify-evenly gap-2 text-sm">
        {datesToShow.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-evenly text-sm"
          >
            <div className="text-center flex items-center justify-center">{item.day}</div>
            <div className="text-center flex items-center justify-center">{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DateBar;