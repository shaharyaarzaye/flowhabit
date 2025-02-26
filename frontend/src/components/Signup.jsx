export const Signup = () => {
  return (
    <div className='flex justify-center items-center h-[100vh]'>
      <form action="https://bookish-acorn-j9x7vjp467whjr5-3000.app.github.dev/signup" method="POST" className='border-black border-2 rounded-md flex flex-col p-[2rem] gap-5'>
        <h1 className='text-center text-4xl'>Create Your Account</h1>
        <label htmlFor='email' className='text-lg'>Enter Your Email : </label>
        <input type="email" name="email" placeholder="Email" id="email" className='border-black border-solid border-1 rounded-md p-1.5' />
        <label htmlFor='password' className='text-lg'>Enter Your Password : </label>
        <input type="password" name="password" placeholder="Password" id="password" className='border-black border-solid border-1 rounded-md p-1.5' />
        <span>forget password ?</span>
        <input type="submit" className='bg-black text-white p-2 rounded-md cursor-pointer'/>
      </form>
    </div>
  )
}