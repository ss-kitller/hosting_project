import React from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import { FiLogOut } from "react-icons/fi";

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <img
          src="/logo.png"
          alt="Logo Marsa Maroc"
          className={styles.logoImg}
          height={38}
          style={{ maxHeight: 38, width: "auto" }}
        />
      </div>
      <div className={styles.right}>
        <Link href="/login" className={styles.logoutBtn}>
          <FiLogOut className={styles.logoutIcon} />
          <span>Déconnexion</span>
        </Link>
      </div>
    </header>
  );
};

export default Header; 