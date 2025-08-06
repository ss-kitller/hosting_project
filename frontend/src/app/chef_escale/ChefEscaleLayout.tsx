"use client";
import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SidebarChefEscale from "./SidebarChefEscale";
import styles from "./ChefEscaleLayout.module.css";

interface ChefEscaleLayoutProps {
  children: React.ReactNode;
}

const ChefEscaleLayout: React.FC<ChefEscaleLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Fermer la sidebar quand on clique sur un lien
  const handleNavigation = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={styles.layout}>
      <Header />
      
      <SidebarChefEscale 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
      />
      
      <main 
        className={`${styles.mainContent} ${sidebarOpen ? styles.shifted : ''}`}
        onClick={handleNavigation}
      >
        <div className={styles.contentWrapper}>
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChefEscaleLayout; 