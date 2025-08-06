"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./chef_escale/Header";
import Footer from "./chef_escale/Footer";
import styles from "./login/login.module.css";

export default function LoginPage() {
  const [idUtilisateur, setIdUtilisateur] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await fetch("http://localhost:8000/api/users/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_utilisateur: idUtilisateur, mot_de_passe: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Connexion réussie ! Redirection en cours...");
        localStorage.setItem("role", data.role);
        setTimeout(() => {
          window.location.href = `/${data.role}-dashboard`;
          window.location.href = "/RH/";
        }, 1500);
      } else {
        setError(data.error || "Erreur d'authentification");
      }
    } catch (err) {
      setError("Erreur réseau - Vérifiez votre connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
  };

  return (
    <div>
      <Header />
      <div className={styles.loginContainer}>
        {/* Particules flottantes */}
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>

        <motion.div 
          className={styles.loginContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className={styles.welcomeText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className={styles.welcomeTitle}>
              Bienvenue sur <span style={{ color: '#005baa', fontWeight: 700 }}>Marsa Maroc</span>
            </h1>
            <p className={styles.welcomeSubtitle}>
              Connectez-vous à votre espace de travail pour accéder à la gestion portuaire.<br/>
              Votre partenaire de confiance pour l'excellence opérationnelle.
            </p>
          </motion.div>
          
          <motion.div 
            className={styles.loginCard}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <motion.h2 
              className={styles.loginTitle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Connexion
            </motion.h2>
            <motion.p 
              className={styles.loginSubtitle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Entrez vos identifiants pour accéder à votre tableau de bord
            </motion.p>
            
            <form onSubmit={handleSubmit}>
              <motion.div 
                className={styles.formGroup}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <label className={styles.formLabel}>Identifiant utilisateur</label>
                <motion.input 
                  type="text" 
                  value={idUtilisateur} 
                  onChange={e => setIdUtilisateur(e.target.value)} 
                  required 
                  className={styles.formInput}
                  placeholder="Votre identifiant"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  aria-label="Identifiant utilisateur"
                />
              </motion.div>
              
              <motion.div 
                className={styles.formGroup}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <label className={styles.formLabel}>Mot de passe</label>
                <motion.input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className={styles.formInput}
                  placeholder="Votre mot de passe"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  aria-label="Mot de passe"
                />
              </motion.div>
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    className={styles.errorMessage}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error}
                  </motion.div>
                )}
                
                {success && (
                  <motion.div 
                    className={styles.successMessage}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.button 
                type="submit" 
                className={styles.loginButton} 
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                {loading ? (
                  <>
                    <span className={styles.loadingSpinner}></span>
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </motion.button>
            </form>
            
            <motion.div 
              className={styles.forgotPassword}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              <button 
                type="button"
                onClick={handleForgotPassword}
                className={styles.forgotPasswordLink}
                aria-label="Mot de passe oublié"
              >
                Mot de passe oublié ?
              </button>
            </motion.div>
            
            <motion.div 
              className={styles.securityMessage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.8 }}
            >
              🔒 Vos données sont sécurisées et protégées
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      <Footer />

      {/* Modal Mot de passe oublié */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeForgotPassword}
          >
            <motion.div 
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={styles.modalTitle}>Mot de passe oublié</h3>
              <p className={styles.modalText}>
                Pour récupérer votre mot de passe, veuillez contacter notre équipe support :
              </p>
              <a 
                href="mailto:anassbensmina04@gmail.com" 
                className={styles.modalEmail}
                aria-label="Envoyer un email à anassbensmina04@gmail.com"
              >
                anassbensmina04@gmail.com
              </a>
              <motion.button 
                className={styles.modalButton}
                onClick={closeForgotPassword}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ marginTop: '1.5rem' }}
              >
                Fermer
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
