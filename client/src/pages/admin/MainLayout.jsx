import Dashboard from "./Dashboard";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-6">
          <Dashboard />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
