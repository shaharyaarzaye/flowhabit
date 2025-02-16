import React from 'react'

export const Signup = () => {
  return (
    <div className="flex justify-center items-center h-[100vh]">
      <div className="flex justify-center  h-[80vh] w-[70vw] bg-orange rounded-md text-white">
        <h1>Create Your Account</h1>
        <form action="/Signup">
        <input type="email" />
        <input type="Password" />
        </form>
      </div>
      
    </div>
  )
}
