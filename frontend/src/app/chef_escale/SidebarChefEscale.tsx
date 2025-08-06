"use client";
import React from "react";
import { FaUsers, FaTractor, FaClipboardList, FaCalendarAlt, FaBars, FaTimes, FaShip } from "react-icons/fa";
import styles from "../RH/Sidebar.module.css";
import { useNavigation } from "./page";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SidebarChefEscale: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { activeSection, setActiveSection } = useNavigation();

  const menuItems = [
    {
      key: "accueil",
      icon: <FaUsers />,
      title: "Accueil Chef d'Escale",
      description: "Résumé global"
    },
    {
      key: "engins",
      icon: <FaTractor />,
      title: "Engins",
      description: "Consulter les engins"
    },
    {
      key: "absences",
      icon: <FaClipboardList />,
      title: "Formulaire d'absence",
      description: "Soumettre une absence"
    },
    {
      key: "navires",
      icon: <FaShip />,
      title: "Navires Prévisionnels",
      description: "Gestion des navires"
    },
    {
      key: "affectations",
      icon: <FaCalendarAlt />,
      title: "Affectations",
      description: "Planifier les affectations"
    }
  ];

  const handleNavigation = (section: string) => {
    setActiveSection(section);
    // Fermer la sidebar
    onToggle();
  };

  return (
    <>
      {/* Bouton toggle toujours visible - en dehors de la sidebar */}
      <button 
        className={styles.alwaysVisibleToggle}
        onClick={onToggle}
        aria-label={isOpen ? "Fermer la sidebar" : "Ouvrir la sidebar"}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay */}
      <div 
        className={`${styles.overlay} ${isOpen ? styles.visible : ''}`}
        onClick={onToggle}
      />
      
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>
            <span style={{ color: '#005baa', fontWeight: 700 }}>Chef d'Escale</span> - Navigation
          </h2>
          <p className={styles.sidebarSubtitle}>
            Accès rapide aux fonctionnalités
          </p>
        </div>
        
        <nav className={styles.navigation}>
          {menuItems.map((item) => (
            <div
              key={item.key}
              className={`${styles.navItem} ${activeSection === item.key ? styles.active : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleNavigation(item.key)}
            >
              <div className={styles.navIcon}>{item.icon}</div>
              <div className={styles.navContent}>
                <h3 className={styles.navTitle}>{item.title}</h3>
                <p className={styles.navDescription}>{item.description}</p>
              </div>
            </div>
          ))}
        </nav>
        
        <div className={styles.sidebarFooter}>
          <div className={styles.footerText}>
            <span style={{ color: '#005baa', fontWeight: 600 }}>Marsa Maroc</span>
            <br />
            <span style={{ fontSize: '0.8rem', color: '#b0b8c1' }}>
              Gestion portuaire
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarChefEscale; 