"use client";
import dynamic from "next/dynamic";
import { FaCogs, FaExclamationTriangle } from 'react-icons/fa';
import styles from './dev-tech.module.css';

const KanbanEngins = dynamic(() => import("./KanbanEngins"), { ssr: false });

export default function DevTechPage() {
  return (
    <div className={styles.content}>
      {/* En-tête avec résumé */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <FaCogs className={styles.titleIcon} />
            <div>
              <h1>Espace Dev Technique</h1>
              <h2>
                Bonjour dans l'interface <span style={{ color: '#1976D2', fontWeight: 700 }}>Dev Technique</span> de <span style={{ color: '#009688', fontWeight: 700 }}>Marsa Maroc</span>.<br/>
                Gérez vos équipements et interventions avec créativité et efficacité.
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Container du kanban */}
      <div className={styles.kanbanContainer}>
        <div className={styles.kanbanHeader}>
          <h2>Gestion des Engins</h2>
          <span className={styles.kanbanCount}>
            Tableau Kanban des équipements
          </span>
        </div>
        <KanbanEngins />
      </div>
    </div>
  );
} 