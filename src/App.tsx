import React, { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import './App.css';
import Sidebar from "./components/SideBar";
import MainPage from "./components/MainPage"; // Assuming MainPage is located in the components folder

const App = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed((prevCollapsed) => !prevCollapsed);
    };

    return (
      <I18nextProvider i18n={i18n}>
        <div className="overflow-hidden w-full h-full relative flex z-0">
            <Sidebar
                isSidebarCollapsed={isSidebarCollapsed}
                toggleSidebarCollapse={toggleSidebarCollapse}
            />
            <MainPage
                isSidebarCollapsed={isSidebarCollapsed}
                toggleSidebarCollapse={toggleSidebarCollapse}
            />
        </div>
      </I18nextProvider>
    );
}

export default App;
