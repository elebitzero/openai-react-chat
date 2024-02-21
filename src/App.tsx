import React, {useState} from 'react';
import {Routes, Route, Navigate, BrowserRouter, useSearchParams} from 'react-router-dom';
import {I18nextProvider} from 'react-i18next';
import i18n from './i18n';
import Sidebar from "./components/SideBar";
import MainPage from "./components/MainPage";
import ChatSettingsForm from './components/ChatSettingsForm';
import './App.css';

const App = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };


  const ChatSettingsFormRoute = () => {
    const [searchParams] = useSearchParams();
    const readOnly = searchParams.get('readOnly') === 'true';
    return <ChatSettingsForm readOnly={readOnly} />;
  };

  return (
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <div className="App">
          <div className="flex overflow-hidden w-full h-full relative z-0">
            <Sidebar
              className="sidebar-container flex-shrink-0"
              isSidebarCollapsed={isSidebarCollapsed}
              toggleSidebarCollapse={toggleSidebarCollapse}
            />
            <div className="flex-grow h-full overflow-hidden">
              <Routes>
                <Route path="/" element={<MainPage className={'main-content'} isSidebarCollapsed={isSidebarCollapsed}
                                                   toggleSidebarCollapse={toggleSidebarCollapse}/>}/>
                <Route path="/c/:id"
                       element={<MainPage className={'main-content'} isSidebarCollapsed={isSidebarCollapsed}
                                          toggleSidebarCollapse={toggleSidebarCollapse}/>}/>
                <Route path="/chatsettings" element={<ChatSettingsFormRoute />} />
                {/* Catch-all route redirects to main page */}
                <Route path="*" element={<Navigate to="/" replace/>}/>
              </Routes>
            </div>
          </div>
        </div>
      </I18nextProvider>
    </BrowserRouter>
  );
};

export default App;
