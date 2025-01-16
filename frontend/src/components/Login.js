import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
  Spin,
  Typography,
} from "antd";
import React, { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";
import useScreenSize from "../utils/useScreenSize";
import { API } from "../constant";
import { setToken } from "../helper";

const Login = () => {
  const { isDesktopView } = useScreenSize();
 
  const { user, setUser } = useAuthContext(); // Access user from AuthContext
    const navigate = useNavigate();
  
    useEffect(() => {
      if (user) {
        // If the user is not available and we are not loading, redirect to login page
        navigate('/chat');
      }
    }, [user, navigate]);


  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      const value = {
        identifier: values.email,
        password: values.password,
      };
      const response = await fetch(`${API}/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, 
        body: JSON.stringify(value),
      });

      const data = await response.json();
      if (data?.error) {
        throw data?.error;
      } else {
        // set the token
        setToken(data.jwt);

        // set the user
        setUser(data.user);

        message.success(`Welcome back ${data.user.username}!`);

        navigate("/chat", { replace: true });
      }
    } catch (error) {
      console.error(error);
      setError(error?.message ?? "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[92vh] flex flex-col justify-center items-center ">
     <h1 className="text-3xl font-bold  mb-10">Welocme to the Chat Room</h1>
      <Row align="midle" className="w-full px-5 mx-5" >
        <Col span={isDesktopView ? 8 : 24} offset={isDesktopView ? 8 : 0} className="border-2-solid border-gray-700">
          <Card title="SignIn" className="border-2-solid border-gray-800">
            {error ? (
              <Alert
                className="alert_error"
                message={error}
                type="error"
                closable
                afterClose={() => setError("")}
              />
            ) : null}
            <Form
              name="basic"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    type: "email",
                  },
                ]}
              >
                <Input placeholder="Email address"  className="border-2-solid border-gray-800"/>
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true }]}
              >
                <Input.Password placeholder="Password" className="border-2-solid border-gray-800" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login_submit_btn"
                >
                  Login {isLoading && <Spin size="small" />}
                </Button>
              </Form.Item>
            </Form>
            <Typography.Paragraph className="form_help_text">
              New to Chat Room? <Link to="/signup">Sign Up</Link>
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
