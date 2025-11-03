import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/index.css';
import ArtDisplay from './components/artDisplay';
import LoginSignup from './components/loginSignup';
import AuthFavorites from './components/AuthFavorites';

/* ReactDOM.createRoot() is a modern React 18+ method that creates a root container
where your React components will live and be rendered */

// Create application routes
const AppRoutes = () => (
    <Routes>
      <Route path="/" element={<ArtDisplay />} />
      <Route path="/auth" element={<LoginSignup />} />
      <Route path="/favorites" element={<AuthFavorites />} />
    </Routes>
  );

// Initialize the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    </React.StrictMode>
);