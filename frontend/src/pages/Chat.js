import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Spin } from "antd";
import ChatBox from '../components/ChatBox';
import { getToken } from '../helper';

const Chat = () => {
  const { user, isLoading, setUser } = useAuthContext(); // Access user from AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !isLoading) {
      // If the user is not available and we are not loading, redirect to login page
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <Spin size="large" />; // Show loading spinner while fetching user data
  }

  // Socket connection, using the token for authentication
  const socket = io('https://prized-nature-98a1af9371.strapiapp.com', {
    withCredentials: true,
    headers: '*',
    auth: {
      token: getToken(), // Retrieve JWT token
    },
  });

  return (
    <div className='overflow-y-hidden'>
      {user ? (
        <>
         
          <ChatBox socket={socket} user={user} />
        </>
      ) : (
        <h1>Please login</h1> // Display if the user is not logged in
      )}
    </div>
  );
};

export default Chat;
