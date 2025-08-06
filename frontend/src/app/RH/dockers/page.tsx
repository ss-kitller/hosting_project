"use client";
import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaShip, FaUserTimes, FaBell, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import RHLayout from '../RHLayout';
import styles from './dockers.module.css';

interface Docker {
  matricule: string;
  nom: string;
  prenom: string;
  email?: string;
  phone_number?: string;
  date_embauche?: string;
  fonction?: string;
}

interface CumulDocker {
  matricule: string;
  code_engin: string;
  heure_par_jour: number;
  date: string;
}

interface QualificationDocker {
  id_qualification: number;
  matricule: string;
  code_engin: string;
  niveau_expertise: string;
  date_obtention: string;
  nom?: string;
  prenom?: string;
}

interface Alerte {
  matricule: string;
  nom: string;
  prenom: string;
  heure_par_jour: number;
  type_alerte: 'excess' | 'lack';
  message: string;
}

interface StatsPresence {
  presents: number;
  absents: number;
}

export default function DockersPage() {
  const [dockers, setDockers] = useState<Docker[]>([]);
  const [cumuls, setCumuls] = useState<CumulDocker[]>([]);
  const [qualifications, setQualifications] = useState<QualificationDocker[]>([]);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [statsPresence, setStatsPresence] = useState<StatsPresence>({ presents: 0, absents: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDockerToDelete, setSelectedDockerToDelete] = useState<string>('');
  
  // État pour le formulaire d'ajout
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    phone_number: '',
    date_embauche: '',
    id_equipe: 'EQUIPE001',
    fonction: 'docker',
    disponibilite: 'disponible'  // Valeur autorisée par la contrainte DB
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les dockers
      console.log('Fetching dockers...');
      const dockersResponse = await fetch(`${API_URL}/dockers/liste/`);
      console.log('Dockers response status:', dockersResponse.status);
      
      if (!dockersResponse.ok) {
        const errorText = await dockersResponse.text();
        console.error('Dockers error response:', errorText);
        throw new Error(`Erreur HTTP ${dockersResponse.status}: ${errorText}`);
      }
      
      const dockersData = await dockersResponse.json();
      console.log('Dockers data:', dockersData);
      setDockers(dockersData);

      // Récupérer les cumuls d'heures
      console.log('Fetching cumuls...');
      const cumulsResponse = await fetch(`${API_URL}/cumul/dockers/dump/`);
      console.log('Cumuls response status:', cumulsResponse.status);
      
      if (!cumulsResponse.ok) {
        const errorText = await cumulsResponse.text();
        console.error('Cumuls error response:', errorText);
        throw new Error(`Erreur HTTP ${cumulsResponse.status}: ${errorText}`);
      }
      
      const cumulsData = await cumulsResponse.json();
      console.log('Cumuls data:', cumulsData);
      setCumuls(cumulsData);



      // Récupérer les alertes
      console.log('Fetching alertes...');
      const alertesResponse = await fetch(`${API_URL}/alertes/dockers/`);
      console.log('Alertes response status:', alertesResponse.status);
      
      if (!alertesResponse.ok) {
        const errorText = await alertesResponse.text();
        console.error('Alertes error response:', errorText);
        throw new Error(`Erreur HTTP ${alertesResponse.status}: ${errorText}`);
      }
      
      const alertesData = await alertesResponse.json();
      console.log('Alertes data:', alertesData);
      setAlertes(alertesData.alertes || []);

      // Récupérer les stats de présence
      console.log('Fetching presence stats...');
      const presenceResponse = await fetch(`${API_URL}/stats/dockers/presence/`);
      console.log('Presence response status:', presenceResponse.status);
      
      if (!presenceResponse.ok) {
        const errorText = await presenceResponse.text();
        console.error('Presence error response:', errorText);
        throw new Error(`Erreur HTTP ${presenceResponse.status}: ${errorText}`);
      }
      
      const presenceData = await presenceResponse.json();
      console.log('Presence data:', presenceData);
      
      // The API returns an object with presents, absents, total, and details
      const presents = presenceData.presents || 0;
      const absents = presenceData.absents || 0;
      setStatsPresence({ presents, absents });

    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocker = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    // Réinitialiser le formulaire
    setFormData({
      matricule: '',
      nom: '',
      prenom: '',
      email: '',
      phone_number: '',
      date_embauche: '',
      id_equipe: 'EQUIPE001',
      fonction: 'docker',
      disponibilite: 'disponible'  // Valeur autorisée par la contrainte DB
    });
    setError(null);
  };

  const handleDeleteDocker = () => {
    setShowDeleteModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitDocker = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.matricule || !formData.nom || !formData.prenom || !formData.date_embauche) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      console.log('Données envoyées:', formData);
      const response = await fetch(`${API_URL}/dockers/ajouter/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      // Réinitialiser le formulaire
      setFormData({
        matricule: '',
        nom: '',
        prenom: '',
        email: '',
        phone_number: '',
        date_embauche: '',
        id_equipe: 'EQUIPE001',
        fonction: 'docker',
        disponibilite: 'disponible'  // Valeur autorisée par la contrainte DB
      });
      
      // Fermer le modal et recharger les données
      setShowAddModal(false);
      fetchAllData();
      
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du docker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDockerToDelete) return;

    try {
      const response = await fetch(`${API_URL}/cumul/dockers/supprimer/${selectedDockerToDelete}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Recharger les données
      fetchAllData();
      setShowDeleteModal(false);
      setSelectedDockerToDelete('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <RHLayout>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Chargement des données...</p>
          </div>
        </div>
      </RHLayout>
    );
  }

  if (error) {
    return (
      <RHLayout>
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <FaExclamationTriangle className={styles.errorIcon} />
            <h3>Erreur de chargement</h3>
            <p>{error}</p>
            <button onClick={fetchAllData} className={styles.retryButton}>
              Réessayer
            </button>
          </div>
        </div>
      </RHLayout>
    );
  }

  return (
    <RHLayout>
      <div className={styles.container}>
        {/* En-tête */}
        <div className={styles.header}>
          <h1 className={styles.title}>Gestion des Dockers</h1>
          <p className={styles.subtitle}>
            Gérez vos dockers et leurs cumuls d'heures
          </p>
        </div>

        {/* Section 1: Boutons d'action */}
        <div className={styles.actionsSection}>
          <div className={styles.actionsContainer}>
            <button 
              onClick={handleAddDocker}
              className={styles.addButton}
            >
              <FaPlus />
              Ajouter un docker
            </button>
            <button 
              onClick={handleDeleteDocker}
              className={styles.deleteButton}
            >
              <FaTrash />
               Supprimer un docker
            </button>
          </div>

          {/* Formulaire d'ajout intégré */}
          {showAddModal && (
            <div className={styles.addFormContainer}>
              <div className={styles.addFormHeader}>
                <div className={styles.addFormTitle}>
                  <FaPlus className={styles.addFormIcon} />
                  <h3>Ajouter un docker</h3>
                </div>
                <button 
                  onClick={handleCloseAddModal}
                  className={styles.addFormClose}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmitDocker} className={styles.form}>
                {error && (
                  <div className={styles.errorMessage}>
                    <FaExclamationTriangle />
                    {error}
                  </div>
                )}
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Matricule*</label>
                    <input 
                      type="text" 
                      name="matricule"
                      value={formData.matricule}
                      onChange={handleInputChange}
                      placeholder="Ex: D001" 
                      className={styles.input} 
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nom*</label>
                    <input 
                      type="text" 
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      placeholder="Nom du docker" 
                      className={styles.input} 
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Prénom*</label>
                    <input 
                      type="text" 
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      placeholder="Prénom du docker" 
                      className={styles.input} 
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Date d'embauche*</label>
                    <input 
                      type="date" 
                      name="date_embauche"
                      value={formData.date_embauche}
                      onChange={handleInputChange}
                      className={styles.input} 
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@exemple.com" 
                      className={styles.input} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Téléphone</label>
                    <input 
                      type="tel" 
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="+33 1 23 45 67 89" 
                      className={styles.input} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>ID Équipe</label>
                    <input 
                      type="text" 
                      name="id_equipe"
                      value={formData.id_equipe}
                      onChange={handleInputChange}
                      className={styles.input} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Fonction</label>
                    <select 
                      name="fonction"
                      value={formData.fonction}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      <option value="docker">Docker</option>
                      <option value="chef">Chef</option>
                    </select>
                  </div>
                                     <div className={styles.formGroup}>
                     <label>Disponibilité</label>
                     <select 
                       name="disponibilite"
                       value={formData.disponibilite}
                       onChange={handleInputChange}
                       className={styles.select}
                     >
                       <option value="disponible">Disponible</option>
                       <option value="en service">En service</option>
                       <option value="en repos">En repos</option>
                       <option value="non disponible">Non disponible</option>
                     </select>
                   </div>
                </div>
                <div className={styles.formActions}>
                  <button 
                    type="button"
                    onClick={handleCloseAddModal} 
                    className={styles.cancelButton}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    <FaPlus />
                    {isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modal de suppression */}
          {showDeleteModal && (
            <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
              <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <div className={styles.modalTitle}>
                    <FaTrash className={styles.modalIcon} />
                    <h3>Supprimer un docker</h3>
                  </div>
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className={styles.modalClose}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.modalContent}>
                  <p>Sélectionnez le docker à supprimer :</p>
                  <select 
                    value={selectedDockerToDelete}
                    onChange={(e) => setSelectedDockerToDelete(e.target.value)}
                    className={styles.select}
                    style={{ marginTop: '1rem' }}
                  >
                    <option value="">Sélectionner un docker</option>
                    {dockers.map((docker) => (
                      <option key={docker.matricule} value={docker.matricule}>
                        {docker.nom} {docker.prenom} ({docker.matricule})
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.modalActions}>
                  <button onClick={() => setShowDeleteModal(false)}>Annuler</button>
                  <button onClick={handleConfirmDelete} disabled={!selectedDockerToDelete}>
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Tableau des dockers */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Liste des dockers</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Nom & Prénom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Date d'embauche</th>
                  <th>Fonction</th>
                </tr>
              </thead>
              <tbody>
                {dockers.map((docker, index) => (
                  <tr key={docker.matricule} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    <td className={styles.matriculeCell}>{docker.matricule}</td>
                    <td className={styles.nameCell}>
                      {docker.nom} {docker.prenom}
                    </td>
                    <td className={styles.emailCell}>{docker.email || '—'}</td>
                    <td className={styles.phoneCell}>{docker.phone_number || '—'}</td>
                    <td className={styles.dateCell}>
                      {formatDate(docker.date_embauche || '')}
                    </td>
                    <td className={styles.fonctionCell}>{docker.fonction || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Cartes de présence */}
        <div className={styles.cardsSection}>
          <div className={styles.presenceCard}>
            <div className={styles.cardIcon}>
              <FaCheckCircle />
            </div>
            <div className={styles.cardContent}>
              <h3>Présents aujourd'hui</h3>
              <p className={styles.cardNumber}>{statsPresence.presents}</p>
            </div>
          </div>
          <div className={styles.presenceCard}>
            <div className={styles.cardIcon}>
              <FaUserTimes />
            </div>
            <div className={styles.cardContent}>
              <h3>Absents aujourd'hui</h3>
              <p className={styles.cardNumber}>{statsPresence.absents}</p>
            </div>
          </div>
        </div>

        {/* Section 4: Alertes du jour */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FaBell />
            Alertes du jour
          </h2>
          <div className={styles.alertesContainer}>
            {alertes.length === 0 ? (
              <div className={styles.noAlertes}>
                <p>Aucune alerte aujourd'hui</p>
              </div>
            ) : (
              <div className={styles.alertesList}>
                {alertes.map((alerte, index) => (
                  <div key={index} className={styles.alerteItem}>
                    <div className={styles.alerteHeader}>
                      <span className={styles.alerteName}>
                        {alerte.nom} {alerte.prenom}
                      </span>
                      <span className={`${styles.alerteBadge} ${
                        alerte.type_alerte === 'excess' ? styles.surcharge : styles.sousCharge
                      }`}>
                        {alerte.type_alerte === 'excess' ? 'SURCHARGE' : 'SOUS-CHARGE'}
                      </span>
                    </div>
                    <p className={styles.alerteMessage}>{alerte.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Tableau des cumuls d'heures */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Cumuls d'heures</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Code Engin</th>
                  <th>Heures par jour</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {cumuls.map((cumul, index) => (
                  <tr key={index} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    <td>{cumul.matricule}</td>
                    <td>{cumul.code_engin}</td>
                    <td>{cumul.heure_par_jour}h</td>
                    <td>{formatDate(cumul.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        
      </div>
    </RHLayout>
  );
} 