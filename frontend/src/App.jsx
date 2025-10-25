import './css/App.css';
import Navbar from './components/Navbar';
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import { Route, Routes, Navigate } from "react-router-dom";
import { EventProvider } from './contexts/EventContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { user, loading } = useAuth(); 

  if (loading) return <p>Loading...</p>; 
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route 
        path="/checkout" 
        element={user ? <Checkout /> : <Navigate to="/login" />}
      />
      <Route 
        path="/profile" 
        element={user ? <Profile /> : <Navigate to="/login" />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <Navbar />
        <main className="main-content">
          <AppRoutes />
        </main>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;