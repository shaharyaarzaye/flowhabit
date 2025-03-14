export const Login = () =>{
    return(
        <div className='flex justify-center items-center h-[100vh]'>
      <form action="https://redesigned-fiesta-46xv5jpg465cq4r5-3000.app.github.dev/login" method="POST" className=' border-black border-2 rounded-md flex flex-col p-[2rem] gap-5'>
        <h1 className='text-center text-4xl'>Login Your Account</h1>
        <label htmlFor='email' className='text-lg'>Enter Your Email : </label>
        <input type="email" name="email" placeholder="Email" id="email" className=' border-black border-solid border-1 rounded-md p-1.5' />
        <label htmlFor='password' className='text-lg'>Enter Your Password : </label>
        <input type="password" name="password" placeholder="Password" id="password" className=' border-black border-solid border-1 rounded-md p-1.5' />
        <span>forget password ?</span>
        <button type='submit' className='bg-black text-white p-2 rounded-md cursor-pointer'>Login</button>
      </form>
    </div>
    )
}