import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignup from './components/loginSignup';

function App() {
    const [user, setUser] = useState(null);
    const handleLoginSuccess = () => {
    // Handle successful login (e.g., update global state)
    // Update user state with the returned user data
    setUser(userData);
    console.log('Login/Signup successful:', userData);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<LoginSignup onLoginSuccess={handleLoginSuccess} />} 
        />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}