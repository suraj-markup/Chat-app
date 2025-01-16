import { Button, Space } from "antd";
import React from "react";
// import { CgWebsite } from "react-icons/cg";
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
    <Space className="header_space">
      <Button className="header_space_brand" href="/" type="link">
        {/* <CgWebsite size={64} /> */}
      </Button>
      <Space className="auth_buttons">
        {user ? (
          <>
            <Button className="auth_button_login" href="/chat" type="link">
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