import React from "react";
import { FaCheckCircle, FaTools, FaUserTie } from 'react-icons/fa';
import styles from "./dev-tech.module.css";

type Props = {
  stats: Record<"disponible" | "en maintenance" | "affecté", number>;
};

export default function DashboardEngins({ stats }: Props) {
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardCard}>
        <FaCheckCircle style={{ color: "#4caf50" }} />
        <div className={styles.statContent}>
          <span className={styles.statNumber}>{stats["disponible"]}</span>
          <span className={styles.statLabel}>Disponible</span>
        </div>
      </div>
      <div className={styles.dashboardCard}>
        <FaTools style={{ color: "#ff9800" }} />
        <div className={styles.statContent}>
          <span className={styles.statNumber}>{stats["en maintenance"]}</span>
          <span className={styles.statLabel}>En maintenance</span>
        </div>
      </div>
      <div className={styles.dashboardCard}>
        <FaUserTie style={{ color: "#2196f3" }} />
        <div className={styles.statContent}>
          <span className={styles.statNumber}>{stats["affecté"]}</span>
          <span className={styles.statLabel}>Affecté</span>
        </div>
      </div>
    </div>
  );
} 