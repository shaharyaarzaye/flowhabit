import React from 'react'

export const Signup = () => {
  return (
    <div className=' flex flex-col justify-center  items-center gap-5 h-[100vh]'>
      <h1 className='text-2xl'>Create Your Account</h1>
      <div className='flex-col items-center h-[60%] w-[60%] bg-black rounded-md text-white p-10'>
      <form action="">
        <div className='flex-col '>
          <label htmlFor="email">Enter Your Email : </label>
          <input type="email" id="email" className="border border-white rounded-md"/>
        </div>
      </form>
      </div>
    </div>
  )
}
