"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaClipboardList, FaUserClock, FaHardHat, FaBars, FaTimes, FaShip } from "react-icons/fa";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/RH/",
      icon: <FaClipboardList />,
      title: "Accueil RH",
      description: "Tableau de bord principal"
    },
    {
      href: "/RH/absences",
      icon: <FaClipboardList />,
      title: "Absence",
      description: "Consulter et gérer les absences"
    },
    {
      href: "/RH/conducteurs",
      icon: <FaUserClock />,
      title: "Espace conducteurs",
      description: "Cliquer dessus pour plus d'informations"
    },
    {
      href: "/RH/dockers",
      icon: <FaHardHat />,
      title: "Espace dockers",
      description: "Cliquer dessus pour plus d'informations"
    },
    {
      href: "/RH/chef-escale",
      icon: <FaShip />,
      title: "Chef Escale",
      description: "Historique des shifts & CE"
    }
  ];

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
            <span style={{ color: '#005baa', fontWeight: 700 }}>RH</span> - Navigation
          </h2>
          <p className={styles.sidebarSubtitle}>
            Gestion des ressources humaines
          </p>
        </div>
        
        <nav className={styles.navigation}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
            >
              <div className={styles.navIcon}>{item.icon}</div>
              <div className={styles.navContent}>
                <h3 className={styles.navTitle}>{item.title}</h3>
                <p className={styles.navDescription}>{item.description}</p>
              </div>
            </Link>
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

export default Sidebar; 