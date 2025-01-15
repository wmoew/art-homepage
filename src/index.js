import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/index.css';
import ArtDisplay from './components/artDisplay';
import LoginSignup from './components/loginSignup';

/* ReactDOM.createRoot() is a modern React 18+ method that creates a root container
where your React components will live and be rendered */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ArtDisplay />} />
                <Route path="/auth" element={<LoginSignup />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);