import React from 'react';

function HabitAddTypePopup({ setShowAddDialog }) {

  // All styling here is composed of Tailwind CSS utility classes.
  const baseButtonClasses = `
    text-xl text-white 
    bg-zinc-800 border-b-4 border-r-2 border-zinc-600 
    hover:bg-zinc-700 hover:border-b-2 hover:border-r-1 
    p-4 
    shadow-md shadow-zinc-950/50 
    transition-all duration-100 ease-out 
    active:shadow-inner active:shadow-zinc-950 
    active:bg-zinc-900 
    cursor-pointer
    w-full text-left px-6
    transform hover:translate-x-0.5
  `;

  // Note: We've removed 'rounded-lg' from the base and will apply it specifically
  // to show a cleaner way to handle the two different button shapes.

  return (
    // Outer container styling (positioning, size, background, border)
    <div className='absolute top-1/2 left-1/2 w-70 min-w-70 md:w-90 transform -translate-x-1/2 -translate-y-1/2 border border-zinc-700 px-10 sm:px-20 py-10 bg-black/90 rounded-lg'>
      
      {/* Close Button (X) Styling */}
      <div 
        className='absolute top-3 right-3 text-xl text-white bg-zinc-800 hover:bg-zinc-700 h-10 w-10 rounded-full flex items-center justify-center border border-zinc-600 z-10 cursor-pointer transition-colors duration-200' 
        onClick={()=>{setShowAddDialog(false)}}
      >
        X
      </div>
      
      {/* Content Layout Styling */}
      <div className='flex flex-col gap-5'>
        <h1 className='text-2xl text-white text-center font-semibold mt-4 '>Select Habit Type</h1>
        
        {/* Yes or No Button - applies base classes + rounded-full for shape */}
        <button className={`${baseButtonClasses} text-center rounded-full`}> 
          Yes or No
        </button>
        
        {/* Measurable Button - applies base classes + rounded-lg for shape */}
        <button className={`${baseButtonClasses} rounded-full text-center   `}> 
          Measurable
        </button>

      </div>
    </div>
  )
}

export default HabitAddTypePopup;