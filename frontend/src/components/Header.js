import { Button, Space } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import {useAuthContext} from "../auth/AuthContext"
import { removeToken } from "../helper";

const Header = () => {
  const { user,setUser } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <Space className="flex py-2 justify-end ">
   
      <Space className="mx-5 space-x-5">
        {user ? (
          <>
            <Button className="text-white bg-blue-800 border-2-solid border-gray-700" href="/chat" type="link">
              {user?.username||"Login"}
            </Button>
            <Button
              className="auth_button_signUp"
              type="primary"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button className="auth_button_login" href="/login" type="link">
              Login
            </Button>
            <Button
              className="auth_button_signUp"
              href="/signup"
              type="primary"
            >
              SignUp
            </Button>
          </>
        )}
      </Space>
    </Space>
  );
};

export default Header;