import React, { useState } from 'react';
import './App.css';
import Sidebar from "./components/SideBar";
import MainPage from "./components/MainPage"; // Assuming MainPage is located in the components folder

const App = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed((prevCollapsed) => !prevCollapsed);
    };

    return (
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
    );
}

export default App;
