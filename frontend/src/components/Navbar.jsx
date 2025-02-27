import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
            <nav className="flex justify-between bg-black p-5 text-white ">
              <h1 >FlowHabit</h1>
              <div className="flex gap-5">
                <Link to="/signup">
                    <div className="border border-white rounded-md px-4 py-2">Sign Up</div>
                </Link>
                <Link to="/login">
                    <div className="border border-white rounded-md px-4 py-2">Login</div>
                </Link>
              </div>
            </nav>
  )
}