import React from 'react';
import { BrowserRouter as Router, Routes, Route,Navigate  } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Chat from './pages/Chat';
import AuthProvider from './auth/AuthProvider';
import ProtectedRoute from './ProtectedRoute';
import { getToken } from "./helper";
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
const AppWrapper = () => {
  const navigate = useNavigate();

  return (
  
    <AuthProvider navigate={navigate}>
        <Header/>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
            path="/chat"
            element={getToken() ? <Chat /> : <Navigate to="/login" />}
          />
      </Routes>
    </AuthProvider>

  );
};


const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);
export default App;