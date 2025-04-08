import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserApi } from "../service/UserApi";
import { RootState, setUser } from "../redux/store";
import Profile from "./profile";
import { FaBell, FaExclamationCircle, FaListAlt } from "react-icons/fa";
import Activities from "./Activities";
import Layout from "../layouts/layout";
import UserNotifications from "./UserNotifications";
import UserReclamations from "./UserReclamationList";
import { Bell } from "lucide-react";

enum Section {
  Dashboard,
  Notifications,
  Activities,
  Reclamations,
}

const DashboardSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  children?: React.ReactNode;
  activeColor: string;
}> = ({ title, icon, isActive, onClick, children, activeColor }) => {
  return (
    <div
      className={`dashboard-section mb-6 ${
        isActive ? "w-full" : "w-full md:w-1/3"
      } transition-all duration-300 relative`}
    >
      <div
        className={`absolute top-0 left-0 h-1 w-full transition-all duration-300 ${
          isActive ? activeColor : "bg-transparent"
        }`}
      />
      <button
        className={`dashboard-section-title text-lg md:text-xl font-semibold flex items-center gap-2 mb-4 w-full text-left p-2 rounded-lg ${
          isActive
            ? `${activeColor} bg-opacity-10 ${activeColor.replace("text", "bg")}`
            : "text-gray-800 hover:bg-gray-100"
        }`}
        onClick={onClick}
      >
        {icon}
        {title}
      </button>
      {isActive && <div className="text-gray-600 px-2">{children}</div>}
    </div>
  );
};

const UserDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const [activeSection, setActiveSection] = useState<Section>(Section.Dashboard);
  const [noticesCount, setNoticesCount] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await UserApi.getUser();
      dispatch(setUser(userData.user));
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  useEffect(() => {
    const fetchUserNotices = async () => {
      try {
        const userData = await UserApi.getUser();
        setNoticesCount(userData.noticesCount);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUserNotices();
    if (token === "false" && !user) {
      fetchUser();
    }
  }, [user, token, dispatch]);

  const NotificationIcon = ({ count }: { count: number }) => {
    return (
      <div className="relative">
        <Bell className="w-5 h-5 md:w-6 md:h-6" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </div>
    );
  };

  const toggleSection = (section: Section) => {
    setActiveSection(activeSection === section ? Section.Dashboard : section);
  };

  return (
    <Layout>
      <div className="dashboard-container p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="dashboard-card bg-white shadow-sm md:shadow-md rounded-lg p-4 md:p-6">
          {/* Profile Section */}
          <div className="dashboard-section mb-6 w-full">
            <Profile />
          </div>

          {/* Dashboard Sections - Mobile Accordion / Desktop Tabs */}
          <div className="w-full flex flex-wrap gap-4">
            {isMobile ? (
              // Mobile view - accordion style
              <>
                <DashboardSection
                  title="Notifications"
                  icon={<NotificationIcon count={noticesCount} />}
                  isActive={activeSection === Section.Notifications}
                  onClick={() => toggleSection(Section.Notifications)}
                  activeColor="text-green-500"
                >
                  <UserNotifications setNoticesCount={setNoticesCount} userId={user?.id} />
                </DashboardSection>

                <DashboardSection
                  title="Activities"
                  icon={<FaListAlt className="w-5 h-5" />}
                  isActive={activeSection === Section.Activities}
                  onClick={() => toggleSection(Section.Activities)}
                  activeColor="text-yellow-500"
                >
                  <Activities />
                </DashboardSection>

                <DashboardSection
                  title="Reclamations"
                  icon={<FaExclamationCircle className="w-5 h-5" />}
                  isActive={activeSection === Section.Reclamations}
                  onClick={() => toggleSection(Section.Reclamations)}
                  activeColor="text-red-500"
                >
                  <UserReclamations />
                </DashboardSection>
              </>
            ) : (
              // Desktop view - tab style
              <>
                <DashboardSection
                  title="Notifications"
                  icon={<NotificationIcon count={noticesCount} />}
                  isActive={activeSection === Section.Notifications}
                  onClick={() => setActiveSection(Section.Notifications)}
                  activeColor="text-green-500"
                >
                  <UserNotifications setNoticesCount={setNoticesCount} userId={user?.id} />
                </DashboardSection>

                <DashboardSection
                  title="Activities"
                  icon={<FaListAlt />}
                  isActive={activeSection === Section.Activities}
                  onClick={() => setActiveSection(Section.Activities)}
                  activeColor="text-yellow-500"
                >
                  <Activities />
                </DashboardSection>

                <DashboardSection
                  title="Reclamations"
                  icon={<FaExclamationCircle />}
                  isActive={activeSection === Section.Reclamations}
                  onClick={() => setActiveSection(Section.Reclamations)}
                  activeColor="text-red-500"
                >
                  <UserReclamations />
                </DashboardSection>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;