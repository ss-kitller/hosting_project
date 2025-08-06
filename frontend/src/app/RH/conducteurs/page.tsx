"use client";
import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaUsers, FaUserTimes, FaBell, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import RHLayout from '../RHLayout';
import styles from './conducteurs.module.css';

interface Conducteur {
  matricule: string;
  nom: string;
  prenom: string;
  email?: string;
  phone_number?: string;
  date_embauche?: string;
  fonction?: string;
}

interface CumulConducteur {
  matricule: string;
  code_engin: string;
  heure_par_jour: number;
  date: string;
}

interface QualificationConducteur {
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

interface FormData {
  matricule: string;
  nom: string;
  prenom: string;
  date_embauche: string;
  email: string;
  phone_number: string;
  id_equipe: string;
  fonction: string;
  disponibilite: string;  // Sans accent pour correspondre au backend
}

export default function ConducteursPage() {
  const [conducteurs, setConducteurs] = useState<Conducteur[]>([]);
  const [cumuls, setCumuls] = useState<CumulConducteur[]>([]);
  const [qualifications, setQualifications] = useState<QualificationConducteur[]>([]);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [statsPresence, setStatsPresence] = useState<StatsPresence>({ presents: 0, absents: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [selectedConducteurToDelete, setSelectedConducteurToDelete] = useState<string>('');
  const [selectedQualification, setSelectedQualification] = useState<QualificationConducteur | null>(null);
  const [formData, setFormData] = useState<FormData>({
    matricule: '',
    nom: '',
    prenom: '',
    date_embauche: '',
    email: '',
    phone_number: '',
    id_equipe: 'eq01',
    fonction: 'conducteur',
    disponibilite: 'disponible'  // Valeur autorisée par la contrainte DB
  });
  const [submitting, setSubmitting] = useState(false);

  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les conducteurs
      console.log('Fetching conducteurs...');
      const conducteursResponse = await fetch(`${API_URL}/conducteurs/liste/`);
      console.log('Conducteurs response status:', conducteursResponse.status);
      
      if (!conducteursResponse.ok) {
        const errorText = await conducteursResponse.text();
        console.error('Conducteurs error response:', errorText);
        throw new Error(`Erreur HTTP ${conducteursResponse.status}: ${errorText}`);
      }
      
      const conducteursData = await conducteursResponse.json();
      console.log('Conducteurs data:', conducteursData);
      setConducteurs(conducteursData);

      // Récupérer les cumuls d'heures
      console.log('Fetching cumuls...');
      const cumulsResponse = await fetch(`${API_URL}/cumul/conducteurs/dump/`);
      console.log('Cumuls response status:', cumulsResponse.status);
      
      if (!cumulsResponse.ok) {
        const errorText = await cumulsResponse.text();
        console.error('Cumuls error response:', errorText);
        throw new Error(`Erreur HTTP ${cumulsResponse.status}: ${errorText}`);
      }
      
      const cumulsData = await cumulsResponse.json();
      console.log('Cumuls data:', cumulsData);
      setCumuls(cumulsData);

      // Récupérer les qualifications
      console.log('Fetching qualifications...');
      const qualificationsResponse = await fetch(`${API_URL}/qualifications/conducteurs/`);
      console.log('Qualifications response status:', qualificationsResponse.status);
      
      if (!qualificationsResponse.ok) {
        const errorText = await qualificationsResponse.text();
        console.error('Qualifications error response:', errorText);
        throw new Error(`Erreur HTTP ${qualificationsResponse.status}: ${errorText}`);
      }
      
      const qualificationsData = await qualificationsResponse.json();
      console.log('Qualifications data:', qualificationsData);
      setQualifications(qualificationsData);

      // Récupérer les alertes
      console.log('Fetching alertes...');
      const alertesResponse = await fetch(`${API_URL}/alertes/conducteurs/`);
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
      const presenceResponse = await fetch(`${API_URL}/stats/conducteurs/presence/`);
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

  const handleAddConducteur = () => {
    setShowAddModal(true);
  };

  const handleDeleteConducteur = () => {
    setShowDeleteModal(true);
  };

  const handleModifyQualification = (qualification: QualificationConducteur) => {
    setSelectedQualification(qualification);
    setShowQualificationModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitConducteur = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.matricule || !formData.nom || !formData.prenom || !formData.date_embauche) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`${API_URL}/info-equipe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matricule: formData.matricule,
          nom: formData.nom,
          prenom: formData.prenom,
          date_embauche: formData.date_embauche,
          email: formData.email || '',
          phone_number: formData.phone_number || '',
          id_equipe: formData.id_equipe,
          fonction: formData.fonction,
          disponibilite: formData.disponibilite
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'ajout du conducteur');
      }

      // Réinitialiser le formulaire
      setFormData({
        matricule: '',
        nom: '',
        prenom: '',
        date_embauche: '',
        email: '',
        phone_number: '',
        id_equipe: 'eq01',
        fonction: 'conducteur',
        disponibilite: 'disponible'  // Valeur autorisée par la contrainte DB
      });

      // Fermer le modal
      setShowAddModal(false);

      // Recharger les données
      await fetchAllData();

    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du conducteur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmQualificationModification = async (formData: any) => {
    if (!selectedQualification) return;

    try {
      const response = await fetch(`${API_URL}/qualifications/conducteurs/modifier/${selectedQualification.id_qualification}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification');
      }

      // Recharger les données
      fetchAllData();
      setShowQualificationModal(false);
      setSelectedQualification(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedConducteurToDelete) return;

    try {
      const response = await fetch(`${API_URL}/cumul/conducteurs/supprimer/${selectedConducteurToDelete}/`, {
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
      setSelectedConducteurToDelete('');
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
          <h1 className={styles.title}>Gestion des Conducteurs</h1>
          <p className={styles.subtitle}>
            Gérez vos conducteurs et leurs cumuls d'heures
          </p>
        </div>

        {/* Section 1: Boutons d'action */}
        <div className={styles.actionsSection}>
          <div className={styles.actionsContainer}>
            <button 
              onClick={handleAddConducteur}
              className={styles.addButton}
            >
              <FaPlus />
              Ajouter un conducteur
            </button>
            <button 
              onClick={handleDeleteConducteur}
              className={styles.deleteButton}
            >
              <FaTrash />
             Supprimer un conducteur
            </button>
          </div>

          {/* Formulaire d'ajout intégré */}
          {showAddModal && (
            <div className={styles.addFormContainer}>
              <div className={styles.addFormHeader}>
                <div className={styles.addFormTitle}>
                  <FaPlus className={styles.addFormIcon} />
                  <h3>Ajouter un conducteur</h3>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className={styles.addFormClose}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmitConducteur} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Matricule*</label>
                    <input 
                      type="text" 
                      name="matricule"
                      value={formData.matricule}
                      onChange={handleFormChange}
                      placeholder="Ex: C001" 
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
                      onChange={handleFormChange}
                      placeholder="Nom du conducteur" 
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
                      onChange={handleFormChange}
                      placeholder="Prénom du conducteur" 
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
                      onChange={handleFormChange}
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
                      onChange={handleFormChange}
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
                      onChange={handleFormChange}
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
                      onChange={handleFormChange}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Fonction</label>
                    <select 
                      name="fonction"
                      value={formData.fonction}
                      onChange={handleFormChange}
                      className={styles.select}
                    >
                      <option value="conducteur">Conducteur</option>
                      <option value="chef">Chef</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Disponibilité</label>
                    <select 
                      name="disponibilite"
                      value={formData.disponibilite}
                      onChange={handleFormChange}
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
                    onClick={() => setShowAddModal(false)} 
                    className={styles.cancelButton}
                    disabled={submitting}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className={styles.submitButton}
                    disabled={submitting}
                  >
                    <FaPlus />
                    {submitting ? 'Ajout en cours...' : 'Ajouter'}
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
                    <h3>Supprimer un conducteur</h3>
                  </div>
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className={styles.modalClose}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.modalContent}>
                  <p>Sélectionnez le conducteur à supprimer :</p>
                  <select 
                    value={selectedConducteurToDelete}
                    onChange={(e) => setSelectedConducteurToDelete(e.target.value)}
                    className={styles.select}
                    style={{ marginTop: '1rem' }}
                  >
                    <option value="">Sélectionner un conducteur</option>
                    {conducteurs.map((conducteur) => (
                      <option key={conducteur.matricule} value={conducteur.matricule}>
                        {conducteur.nom} {conducteur.prenom} ({conducteur.matricule})
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.modalActions}>
                  <button onClick={() => setShowDeleteModal(false)}>Annuler</button>
                  <button onClick={handleConfirmDelete} disabled={!selectedConducteurToDelete}>
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Tableau des conducteurs */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Liste des conducteurs</h2>
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
                {conducteurs.map((conducteur, index) => (
                  <tr key={conducteur.matricule} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    <td className={styles.matriculeCell}>{conducteur.matricule}</td>
                    <td className={styles.nameCell}>
                      {conducteur.nom} {conducteur.prenom}
                    </td>
                    <td className={styles.emailCell}>{conducteur.email || '—'}</td>
                    <td className={styles.phoneCell}>{conducteur.phone_number || '—'}</td>
                    <td className={styles.dateCell}>
                      {formatDate(conducteur.date_embauche || '')}
                    </td>
                    <td className={styles.fonctionCell}>{conducteur.fonction || '—'}</td>
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

          <h4 className={styles.sectionTitle} style={{ fontSize: '1.1rem', fontWeight: 400 }}>
  Classés par ordre alphabétique des matricules
</h4>

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

        {/* Section 6: Tableau des qualifications */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Qualifications des conducteurs</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                                 <tr>
                   <th>Matricule</th>
                   <th>Nom & Prénom</th>
                   <th>Code Engin</th>
                   <th>Niveau d'expertise</th>
                   <th>Date d'obtention</th>
                   <th>Actions</th>
                 </tr>
              </thead>
              <tbody>
                {qualifications.map((qualification, index) => (
                  <tr key={qualification.id_qualification} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                                         <td>{qualification.matricule}</td>
                     <td>{qualification.nom} {qualification.prenom}</td>
                     <td>{qualification.code_engin}</td>
                     <td className={styles.niveauCell}>
                       <span className={`${styles.niveauBadge} ${
                         qualification.niveau_expertise === 'expert' ? styles.expert :
                         qualification.niveau_expertise === 'confirmé' ? styles.confirme :
                         styles.debutant
                       }`}>
                         {qualification.niveau_expertise}
                       </span>
                     </td>
                     <td>{formatDate(qualification.date_obtention)}</td>
                     <td>
                       <button 
                         onClick={() => handleModifyQualification(qualification)}
                         className={styles.modifyButton}
                       >
                         ✏️ Modifier
                       </button>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
                     </div>
         </div>

         {/* Modal de modification des qualifications */}
         {showQualificationModal && selectedQualification && (
           <div className={styles.modalOverlay} onClick={() => setShowQualificationModal(false)}>
             <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
               <div className={styles.modalHeader}>
                 <div className={styles.modalTitle}>
                   <span className={styles.modalIcon}>✏️</span>
                   <h3>Modifier la qualification</h3>
                 </div>
                 <button 
                   onClick={() => setShowQualificationModal(false)}
                   className={styles.modalClose}
                 >
                   ×
                 </button>
               </div>
               <div className={styles.modalContent}>
                 <form onSubmit={(e) => {
                   e.preventDefault();
                   const formData = new FormData(e.currentTarget);
                   handleConfirmQualificationModification({
                     matricule: selectedQualification.matricule,
                     code_engin: formData.get('code_engin'),
                     niveau_expertise: formData.get('niveau_expertise'),
                     date_obtention: formData.get('date_obtention'),
                   });
                 }}>
                   <div className={styles.formGrid}>
                     <div className={styles.formGroup}>
                       <label>Matricule</label>
                       <input 
                         type="text" 
                         value={selectedQualification.matricule} 
                         disabled 
                         className={styles.input} 
                       />
                     </div>
                     <div className={styles.formGroup}>
                       <label>Code Engin*</label>
                       <input 
                         type="text" 
                         name="code_engin"
                         defaultValue={selectedQualification.code_engin}
                         className={styles.input} 
                         required
                       />
                     </div>
                     <div className={styles.formGroup}>
                       <label>Niveau d'expertise*</label>
                       <select 
                         name="niveau_expertise"
                         defaultValue={selectedQualification.niveau_expertise}
                         className={styles.select}
                         required
                       >
                         <option value="débutant">Débutant</option>
                         <option value="confirmé">Confirmé</option>
                         <option value="expert">Expert</option>
                       </select>
                     </div>
                     <div className={styles.formGroup}>
                       <label>Date d'obtention*</label>
                       <input 
                         type="date" 
                         name="date_obtention"
                         defaultValue={selectedQualification.date_obtention}
                         className={styles.input} 
                         required
                       />
                     </div>
                   </div>
                   <div className={styles.modalActions}>
                     <button type="button" onClick={() => setShowQualificationModal(false)}>
                       Annuler
                     </button>
                     <button type="submit">
                       Confirmer
                     </button>
                   </div>
                 </form>
               </div>
             </div>
           </div>
         )}
       </div>
     </RHLayout>
   );
} 