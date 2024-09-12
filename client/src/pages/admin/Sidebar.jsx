import { FaUser, FaChartLine, FaComments, FaCog } from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="h-screen bg-gray-800 text-white w-64 flex flex-col">
      <div className="text-2xl font-bold p-4">Admin Dashboard</div>
      <nav className="flex-1 px-4">
        <a href="/" className="flex items-center p-2 hover:bg-gray-700">
          <FaChartLine className="mr-2" /> Dashboard
        </a>
        <a href="/users" className="flex items-center p-2 hover:bg-gray-700">
          <FaUser className="mr-2" /> Users
        </a>
        <a href="/chats" className="flex items-center p-2 hover:bg-gray-700">
          <FaComments className="mr-2" /> Chat Rooms
        </a>
        <a href="/settings" className="flex items-center p-2 hover:bg-gray-700">
          <FaCog className="mr-2" /> Settings
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
