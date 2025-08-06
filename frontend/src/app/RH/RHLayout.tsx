"use client";
import React, { useState } from "react";
import Header from "../chef_escale/Header";
import Footer from "../chef_escale/Footer";
import Sidebar from "./Sidebar";
import styles from "./RHLayout.module.css";

interface RHLayoutProps {
  children: React.ReactNode;
}

const RHLayout: React.FC<RHLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.layout}>
      <Header />
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
      />
      
      <main 
        className={`${styles.mainContent} ${sidebarOpen ? styles.shifted : ''}`}
      >
        <div className={styles.contentWrapper}>
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RHLayout; 