import { FaPlus } from "react-icons/fa6";
import { FaSort } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";

function Navbar() {
  return (
    <div className="w-full text-white bg-black border-b border-b-zinc-600 md:px-10 md:py-4 p-2 flex justify-between items-center">
      <p className="text-xl">FlowHabit</p>
      <div className="flex justify-between gap-1 md:gap-10">
        <button className="p-2 rounded-full  hover:cursor-pointer hover:bg-neutral-600 transition-colors duration-200">
          <FaPlus className="text-lg" />
        </button>
        <button className="p-2 rounded-full hover:cursor-pointer  hover:bg-neutral-600 transition-colors duration-200">
          <FaSort className="text-lg" />
        </button>
        <button className="p-2 rounded-full hover:cursor-pointer hover:bg-neutral-600 transition-colors duration-200">
          <BsThreeDotsVertical className="text-lg" />
        </button>
      </div>
    </div>
  );
}

export default Navbar;