'use client';
import React, { useEffect, useState } from 'react';
import RHLayout from './RHLayout';
import styles from '../chef_escale/absences.module.css';
import { apiFetch } from '../../services/api';
import { FaFilePdf, FaExternalLinkAlt } from 'react-icons/fa';

interface MatriculeInfo {
  matricule: string;
  nom: string;
  prenom: string;
  fonction: string;
}

interface EtatDisplay {
  value: string;
  display: string;
  color: string;
}

interface Absence {
  id_absence: number;
  matricule: string;
  matricule_info: MatriculeInfo;
  date_debut_abs: string;
  date_fin_abs: string;
  date_debut_formatted: string;
  date_fin_formatted: string;
  justification: string;
  justification_url?: string;  // URL complète fournie par l'API
  uploaded_at: string;
  uploaded_at_formatted: string;
  etat: string;
  etat_display: EtatDisplay;
}

export default function RHAbsencesPage() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [absencesNonDeclarees, setAbsencesNonDeclarees] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/absences/', {
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`, // Temporairement commenté
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des absences');
        return res.json();
      })
      .then(data => {
        setAbsences(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/api/absences-non-declarees/', {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des absences non justifiées');
        return res.json();
      })
      .then(data => setAbsencesNonDeclarees(data))
      .catch(() => setAbsencesNonDeclarees([]));
  }, []);



  // Fonction pour afficher le lien de justification
  const renderJustificationLink = (absence: Absence) => {
    if (!absence.justification) {
      return '--';
    }

    // Si la justification se termine par .pdf ou .PDF, afficher le lien
    if (absence.justification.toLowerCase().endsWith('.pdf')) {
      // Utiliser l'URL fournie par l'API si disponible, sinon construire l'URL
      const fileUrl = absence.justification_url 
        ? `http://localhost:8000${absence.justification_url}`
        : `http://localhost:8000/media/justifications/${absence.justification}`;
      
      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#1976D2',
            textDecoration: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: '#e3f2fd',
            fontSize: '12px',
            fontWeight: '500'
          }}
          title={`Ouvrir ${absence.justification}`}
        >
          📄 Voir le PDF
        </a>
      );
    }

    // Sinon, afficher "--"
    return '--';
  };

  // Fonction pour gérer le changement d'état
  const handleEtatChange = async (newEtat: 'validée' | 'refusée', absence: Absence) => {
    try {
      await apiFetch(`/absences/${absence.id_absence}/`, {
        method: 'PATCH',
        body: JSON.stringify({ etat: newEtat }),
      });
      setAbsences(absences => absences.map(a => 
        a.id_absence === absence.id_absence 
          ? { ...a, etat: newEtat, etat_display: { ...a.etat_display, value: newEtat } } 
          : a
      ));
    } catch (err: any) {
      alert('Erreur lors de la mise à jour de l\'état : ' + err.message);
    }
  };

  // Fonction pour afficher l'état avec les couleurs appropriées
  const renderEtat = (absence: Absence) => {
    if (absence.etat === 'en attente') {
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            type="button" 
            style={{ 
              background: '#4caf50', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              padding: '6px 12px', 
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }} 
            onClick={() => handleEtatChange('validée', absence)}
          >
            Valider
          </button>
          <button 
            type="button" 
            style={{ 
              background: '#f44336', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              padding: '6px 12px', 
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }} 
            onClick={() => handleEtatChange('refusée', absence)}
          >
            Refuser
          </button>
        </div>
      );
    } else if (absence.etat === 'validée') {
      return (
        <span style={{ 
          color: '#4caf50', 
          fontWeight: 500,
          padding: '4px 8px',
          borderRadius: 4,
          backgroundColor: '#e8f5e8',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
         Validée
        </span>
      );
    } else if (absence.etat === 'refusée') {
      return (
        <span style={{ 
          color: '#f44336', 
          fontWeight: 500,
          padding: '4px 8px',
          borderRadius: 4,
          backgroundColor: '#ffe8e8',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          Refusée
        </span>
      );
    } else {
      return (
        <span style={{ 
          color: '#666', 
          fontWeight: 500,
          padding: '4px 8px',
          borderRadius: 4,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          ⚪ {absence.etat}
        </span>
      );
    }
  };

  return (
    <RHLayout>
      <div className={styles.container}>
        <h1 className={styles.sectionTitle}>Liste des absences déclarées par les chefs d'escale</h1>
        {loading && <p>Chargement...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.absTable}>
                <thead>
                  <tr>
                    <th>Matricule</th>
                    <th>Date début</th>
                    <th>Date fin</th>
                    <th>Justificatif</th>
                    <th>Date d'upload</th>
                    <th>État</th>
                  </tr>
                </thead>
                <tbody>
                  {absences.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#b0b8c1' }}>Aucune absence à afficher.</td>
                    </tr>
                  ) : (
                    absences.map((abs, idx) => (
                      <tr key={abs.id_absence || idx}>
                        <td>
                          {abs.matricule_info ? (
                            <div>
                              <strong>{abs.matricule_info.matricule}</strong>
                              <br />
                              <small>{abs.matricule_info.nom} {abs.matricule_info.prenom}</small>
                              <br />
                              <small style={{ color: '#666' }}>{abs.matricule_info.fonction}</small>
                            </div>
                          ) : (
                            abs.matricule
                          )}
                        </td>
                        <td>{abs.date_debut_formatted || 'N/A'}</td>
                        <td>{abs.date_fin_formatted || 'N/A'}</td>
                        <td>{renderJustificationLink(abs)}</td>
                        <td>{abs.uploaded_at_formatted || 'N/A'}</td>
                        <td>
                          {renderEtat(abs)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Table des absences non justifiées */}
            <h2 className={styles.sectionTitle}>Absences non déclarées</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.absTable}>
                <thead>
                  <tr>
                    <th>Matricule</th>
                    <th>Shift</th>
                    <th>Date début</th>
                    <th>Date fin</th>
                  </tr>
                </thead>
                <tbody>
                  {absencesNonDeclarees.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#b0b8c1' }}>Aucune absence non justifiée à afficher.</td>
                    </tr>
                  ) : (
                    absencesNonDeclarees.map((abs, idx) => (
                      <tr key={abs.id || idx}>
                        <td>{abs.matricule}</td>
                        <td>{abs.id_shift}</td>
                        <td>{abs.date_debut_abs ? new Date(abs.date_debut_abs).toLocaleString('fr-FR') : 'N/A'}</td>
                        <td>{abs.date_fin_abs ? new Date(abs.date_fin_abs).toLocaleString('fr-FR') : 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </RHLayout>
  );
} 