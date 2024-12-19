const Header = () => {
  return (
    <div className="bg-gray-900 p-4 text-white flex justify-between items-center">
      <div className="text-xl">Chat Admin Dashboard</div>
      <div className="flex items-center space-x-4">
        <div>Admin</div>
        <div className="bg-gray-700 p-2 rounded-full cursor-pointer">
          Logout
        </div>
      </div>
    </div>
  );
};

export default Header;
