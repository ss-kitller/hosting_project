"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService } from "../../services/auth";
import Header from "../chef_escale/Header";
import Footer from "../chef_escale/Footer";
import styles from "./login.module.css";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // États pour le login
  const [idUtilisateur, setIdUtilisateur] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // États pour le signup
  const [signupData, setSignupData] = useState({
    id_utilisateur: "",
    nom_utilisateur: "",
    mot_de_passe: "",
    confirm_mot_de_passe: "",
    email: "",
    role: "utilisateur"
  });
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      console.log("🔍 Tentative de connexion avec:", { idUtilisateur, password });
      
      const res = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_utilisateur: idUtilisateur, mot_de_passe: password }),
      });
      const data = await res.json();
      console.log("📡 Réponse du serveur:", data);
      
      if (res.ok) {
        setSuccess("Connexion réussie ! Redirection en cours...");
        console.log("✅ Connexion réussie, token reçu:", data.access);
        
        // Stocker le token et rediriger selon le rôle
        AuthService.setToken(data.access);
        console.log("🔐 Token stocké dans les cookies");
        
        // Vérifier le rôle décodé
        const role = AuthService.getUserRole();
        console.log("👤 Rôle décodé:", role);
        
        setTimeout(() => {
          console.log("🔄 Début de la redirection...");
          AuthService.redirectByRole();
        }, 1500);
      } else {
        console.error("❌ Erreur de connexion:", data);
        setError(data.error || "Erreur d'authentification");
      }
    } catch (err) {
      console.error("💥 Erreur réseau:", err);
      setError("Erreur réseau - Vérifiez votre connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError("");
    setSignupSuccess("");
    
    // Validation des mots de passe
    if (signupData.mot_de_passe !== signupData.confirm_mot_de_passe) {
      setSignupError("Les mots de passe ne correspondent pas");
      setSignupLoading(false);
      return;
    }
    
    try {
      const res = await fetch("http://localhost:8000/api/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_utilisateur: signupData.id_utilisateur,
          nom_utilisateur: signupData.nom_utilisateur,
          mot_de_passe: signupData.mot_de_passe,
          email: signupData.email,
          role: signupData.role
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSignupSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        // Réinitialiser le formulaire
        setSignupData({
          id_utilisateur: "",
          nom_utilisateur: "",
          mot_de_passe: "",
          confirm_mot_de_passe: "",
          email: "",
          role: "utilisateur"
        });
        // Basculer vers le login après 2 secondes
        setTimeout(() => {
          setActiveTab('login');
          setSignupSuccess("");
        }, 2000);
      } else {
        setSignupError(data.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setSignupError("Erreur réseau - Vérifiez votre connexion");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleSignupChange = (field: string, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
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
            {/* Onglets */}
            <div className={styles.tabContainer}>
              <button
                className={`${styles.tabButton} ${activeTab === 'login' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Connexion
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'signup' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('signup')}
              >
                Inscription
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
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
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.h2 
                    className={styles.loginTitle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    Inscription
                  </motion.h2>
                  <motion.p 
                    className={styles.loginSubtitle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    Créez votre compte pour accéder à la plateforme
                  </motion.p>
                  
                  <form onSubmit={handleSignupSubmit}>
                    <motion.div 
                      className={styles.formGroup}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 }}
                    >
                      <label className={styles.formLabel}>Identifiant *</label>
                      <motion.input 
                        type="text" 
                        value={signupData.id_utilisateur} 
                        onChange={e => handleSignupChange('id_utilisateur', e.target.value)} 
                        required 
                        className={styles.formInput}
                        placeholder="Votre identifiant (3-30 caractères)"
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                    
                    <motion.div 
                      className={styles.formGroup}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.1 }}
                    >
                      <label className={styles.formLabel}>Nom complet *</label>
                      <motion.input 
                        type="text" 
                        value={signupData.nom_utilisateur} 
                        onChange={e => handleSignupChange('nom_utilisateur', e.target.value)} 
                        required 
                        className={styles.formInput}
                        placeholder="Votre nom complet"
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                    
                    <motion.div 
                      className={styles.formGroup}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                    >
                      <label className={styles.formLabel}>Email</label>
                      <motion.input 
                        type="email" 
                        value={signupData.email} 
                        onChange={e => handleSignupChange('email', e.target.value)} 
                        className={styles.formInput}
                        placeholder="Votre email (optionnel)"
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                    
                    <motion.div 
                      className={styles.formGroup}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.3 }}
                    >
                      <label className={styles.formLabel}>Mot de passe *</label>
                      <motion.input 
                        type="password" 
                        value={signupData.mot_de_passe} 
                        onChange={e => handleSignupChange('mot_de_passe', e.target.value)} 
                        required 
                        className={styles.formInput}
                        placeholder="Votre mot de passe"
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                    
                    <motion.div 
                      className={styles.formGroup}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.4 }}
                    >
                      <label className={styles.formLabel}>Confirmer le mot de passe *</label>
                      <motion.input 
                        type="password" 
                        value={signupData.confirm_mot_de_passe} 
                        onChange={e => handleSignupChange('confirm_mot_de_passe', e.target.value)} 
                        required 
                        className={styles.formInput}
                        placeholder="Confirmez votre mot de passe"
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                    
                    <motion.div 
                      className={styles.formGroup}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.5 }}
                    >
                      <label className={styles.formLabel}>Rôle</label>
                      <motion.select 
                        value={signupData.role} 
                        onChange={e => handleSignupChange('role', e.target.value)} 
                        className={styles.formInput}
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <option value="utilisateur">Utilisateur (DT)</option>
                        <option value="chef_escale">Chef d'escale (CE)</option>
                        <option value="rh">Ressources Humaines (RH)</option>
                        <option value="admin">Administrateur</option>
                      </motion.select>
                    </motion.div>
                    
                    <AnimatePresence>
                      {signupError && (
                        <motion.div 
                          className={styles.errorMessage}
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                        >
                          {signupError}
                        </motion.div>
                      )}
                      
                      {signupSuccess && (
                        <motion.div 
                          className={styles.successMessage}
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                        >
                          {signupSuccess}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <motion.button 
                      type="submit" 
                      className={styles.loginButton} 
                      disabled={signupLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.6 }}
                    >
                      {signupLoading ? (
                        <>
                          <span className={styles.loadingSpinner}></span>
                          Inscription en cours...
                        </>
                      ) : (
                        "S'inscrire"
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
            
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