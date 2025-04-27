import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();
  return <button className="logout-button" onClick={() => (localStorage.removeItem("token"), navigate("/intro"))}>
    <FaSignOutAlt /> Logout
  </button>;
};

export default LogoutButton;
