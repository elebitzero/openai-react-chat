import React from 'react';
import ReactDOM from 'react-dom/client';
import './tailwind.css';
import './globalStyles.css';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from "./ThemeContext";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
      <ThemeProvider>
          <App />
      </ThemeProvider>
  </React.StrictMode>
);
