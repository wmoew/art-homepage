import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Home from './pages/index';
import './styles/index.css';

/* ReactDOM.createRoot() is a modern React 18+ method that creates a root container
where your React components will live and be rendered */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Home />
    </React.StrictMode>
);