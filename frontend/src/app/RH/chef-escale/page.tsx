"use client";
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaShip, FaExclamationTriangle, FaUserTie } from 'react-icons/fa';
import RHLayout from '../RHLayout';
import ModalAjoutChefEscale from './ModalAjoutChefEscale';
import ModalModifierChefEscale from './ModalModifierChefEscale';
import styles from './chef-escale.module.css';

interface ChefEscale {
  id_chef_escale: string;
  nbr_aff_manuelle: number;
  id_shift: number | null;
  nom: string;
  prenom: string;
  telephone: number | null;
  email: string | null;
  date_debut_shift?: string;
  date_fin_shift?: string;
}

interface ChefEscaleStats {
  total_chefs: number;
  chefs_limite_atteinte: number;
  chefs_avec_shift: number;
}

const ChefEscalePage: React.FC = () => {
  const [chefsEscale, setChefsEscale] = useState<ChefEscale[]>([]);
  const [stats, setStats] = useState<ChefEscaleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModalAjout, setShowModalAjout] = useState(false);
  const [showModalModifier, setShowModalModifier] = useState(false);
  const [chefAModifier, setChefAModifier] = useState<ChefEscale | null>(null);

  const API_URL = "http://localhost:8000/api";

  const fetchChefsEscale = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/chef-escale/liste/`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des chefs d\'escale');
      }
      const data = await response.json();
      setChefsEscale(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/chef-escale/stats/`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Erreur lors du chargement des stats:', err);
    }
  };

  useEffect(() => {
    fetchChefsEscale();
    fetchStats();
  }, []);

  const handleAjoutSuccess = () => {
    setShowModalAjout(false);
    fetchChefsEscale();
    fetchStats();
  };

  const handleModifierSuccess = () => {
    setShowModalModifier(false);
    setChefAModifier(null);
    fetchChefsEscale();
    fetchStats();
  };

  const handleModifier = (chef: ChefEscale) => {
    setChefAModifier(chef);
    setShowModalModifier(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatTelephone = (tel: number | null) => {
    if (!tel) return '—';
    return tel.toString().replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  };

  if (loading) {
    return (
      <RHLayout>
        <div className={styles.content}>
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
        <div className={styles.content}>
          <div className={styles.errorContainer}>
            <FaExclamationTriangle className={styles.errorIcon} />
            <h3>Erreur de chargement</h3>
            <p>{error}</p>
            <button onClick={fetchChefsEscale} className={styles.retryButton}>
              Réessayer
            </button>
          </div>
        </div>
      </RHLayout>
    );
  }

  return (
    <RHLayout>
      <div className={styles.content}>
        {/* En-tête avec résumé */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <FaShip className={styles.titleIcon} />
              <h1>Gestion des Chefs d'Escale</h1>
            </div>
            {stats && (
              <div className={styles.statsSummary}>
                <div className={styles.statCard}>
                  <FaUserTie className={styles.statIcon} />
                  <div className={styles.statContent}>
                    <span className={styles.statNumber}>{stats.total_chefs}</span>
                    <span className={styles.statLabel}>Chefs d'escale enregistrés</span>
                  </div>
                </div>
                {stats.chefs_limite_atteinte > 0 && (
                  <div className={styles.statCardWarning}>
                    <FaExclamationTriangle className={styles.statIconWarning} />
                    <div className={styles.statContent}>
                      <span className={styles.statNumber}>{stats.chefs_limite_atteinte}</span>
                      <span className={styles.statLabel}>Limite atteinte</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className={styles.actionsContainer}>
          <button 
            onClick={() => setShowModalAjout(true)}
            className={styles.addButton}
          >
            <FaPlus />
            Ajouter un chef d'escale
          </button>
          <button 
            onClick={() => {
              if (chefsEscale.length > 0) {
                handleModifier(chefsEscale[0]);
              }
            }}
            className={styles.editButton}
            disabled={chefsEscale.length === 0}
          >
            <FaEdit />
            Modifier Chef Escale
          </button>
        </div>

        {/* Tableau des chefs d'escale */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>Liste des Chefs d'Escale</h2>
            <span className={styles.tableCount}>
              {chefsEscale.length} chef{chefsEscale.length > 1 ? 's' : ''} d'escale
            </span>
          </div>

          {chefsEscale.length === 0 ? (
            <div className={styles.emptyState}>
              <FaShip className={styles.emptyIcon} />
              <h3>Aucun chef d'escale enregistré</h3>
              <p>Commencez par ajouter votre premier chef d'escale</p>
              <button 
                onClick={() => setShowModalAjout(true)}
                className={styles.emptyAddButton}
              >
                <FaPlus />
                Ajouter le premier chef d'escale
              </button>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nom & Prénom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>ID Shift</th>
                    <th>Affectations manuelles</th>
                  </tr>
                </thead>
                <tbody>
                  {chefsEscale.map((chef, index) => (
                    <tr key={chef.id_chef_escale} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                      <td className={styles.nameCell}>
                        <div className={styles.nameInfo}>
                          <span className={styles.fullName}>
                            {chef.nom} {chef.prenom}
                          </span>
                        </div>
                      </td>
                      <td className={styles.emailCell}>
                        {chef.email || '—'}
                      </td>
                      <td className={styles.phoneCell}>
                        {formatTelephone(chef.telephone)}
                      </td>
                      <td className={styles.shiftCell}>
                        {chef.id_shift ? (
                          <div className={styles.shiftInfo}>
                            <span className={styles.shiftId}>#{chef.id_shift}</span>
                            {chef.date_debut_shift && (
                              <span className={styles.shiftDate}>
                                {formatDate(chef.date_debut_shift)}
                              </span>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className={styles.affectationsCell}>
                        <div className={styles.affectationsInfo}>
                          <span className={styles.affectationsCount}>
                            {chef.nbr_aff_manuelle}/4
                          </span>
                          {chef.nbr_aff_manuelle === 0 && (
                            <span className={styles.limiteBadge}>
                              Limite atteinte
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modales */}
        {showModalAjout && (
          <ModalAjoutChefEscale
            onClose={() => setShowModalAjout(false)}
            onSuccess={handleAjoutSuccess}
          />
        )}

        {showModalModifier && chefAModifier && (
          <ModalModifierChefEscale
            chef={chefAModifier}
            onClose={() => setShowModalModifier(false)}
            onSuccess={handleModifierSuccess}
          />
        )}
      </div>
    </RHLayout>
  );
};

export default ChefEscalePage; 