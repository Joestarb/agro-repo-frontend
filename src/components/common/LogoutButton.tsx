// src/components/common/LogoutButton.tsx
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../../slices/authSlice";

const LogoutButton: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearToken());
    localStorage.removeItem("access_token");
    navigate("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
    >
      Cerrar sesión
    </button>
  );
};

export default LogoutButton;
