import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Chat App</h1>
      {/* <Header/> */}
      <Link to="/login">Login</Link>
      <Link to="/signup">Signup</Link>
      <Link to="/chat">Chat</Link>
    </div>
  );
};

export default Home;
