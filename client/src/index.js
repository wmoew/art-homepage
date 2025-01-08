import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import MyArtHomepage from './App';

/* ReactDOM.createRoot() is a modern React 18+ method that creates a root container
where your React components will live and be rendered */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <MyArtHomepage />
    </React.StrictMode>
);