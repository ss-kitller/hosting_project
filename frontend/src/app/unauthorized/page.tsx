"use client";
import { motion } from "framer-motion";
import Header from "../chef_escale/Header";
import Footer from "../chef_escale/Footer";
import styles from "./unauthorized.module.css";

export default function UnauthorizedPage() {
  return (
    <div>
      <Header />
      <div className={styles.container}>
        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className={styles.icon}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            ⛔
          </motion.div>
          
          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Accès refusé
          </motion.h1>
          
          <motion.p 
            className={styles.message}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Vous n'avez pas l'autorisation d'accéder à cette page.
          </motion.p>
          
          <motion.div 
            className={styles.actions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.button 
              className={styles.backButton}
              onClick={() => window.history.back()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retour
            </motion.button>
            
            <motion.button 
              className={styles.homeButton}
              onClick={() => window.location.href = "/"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Accueil
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
} 