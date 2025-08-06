import React from "react";
import Link from "next/link";
import styles from "./DashboardCard.module.css";

interface DashboardCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  cardType?: string; // Nouveau prop pour définir le type de carte
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  href, 
  icon, 
  title, 
  description, 
  className,
  cardType 
}) => {
  return (
    <Link 
      href={href} 
      className={`${styles.card} ${className || ""}`.trim()}
      data-type={cardType}
    >
      <div className={styles.icon}>{icon}</div>
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
    </Link>
  );
};

export default DashboardCard; 