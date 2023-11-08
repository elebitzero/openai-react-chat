import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import './tailwind.css';
import './globalStyles.css';
import {ThemeProvider} from "./ThemeContext";
import 'react-toastify/dist/ReactToastify.css';
import App from "./App";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
        <React.StrictMode>
            <ThemeProvider>
                <App/>
            </ThemeProvider>
        </React.StrictMode>
        <Routes>
            <Route path="/" element={<App/>}/>
            <Route path="/c/:conversationId" element={<div/>}/>
            {/* ... other routes ... */}
            {/* Redirect from incorrect double slash URLs */}
            <Route path="//*" element={<Navigate to="/" replace/>}/>
        </Routes>
    </BrowserRouter>
);

