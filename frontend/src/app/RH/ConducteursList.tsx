'use client';
import React, { useEffect, useState } from 'react';

interface Conducteur {
  matricule: string;
  nom: string;
  prenom: string;
  fonction: string;
  email: string;
  phone_number: string;
  date_embauche: string;
  disponibilite: string;
}

export default function ConducteursList() {
  const [conducteurs, setConducteurs] = useState<Conducteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/conducteurs/liste/', {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des conducteurs');
        return res.json();
      })
      .then(data => {
        setConducteurs(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getDisponibiliteColor = (disponibilite: string) => {
    switch (disponibilite?.toLowerCase()) {
      case 'disponible':
        return { color: '#4caf50', backgroundColor: '#e8f5e8' };
      case 'en service':
        return { color: '#1976D2', backgroundColor: '#e3f2fd' };
      case 'en repos':
        return { color: '#666', backgroundColor: '#f5f5f5' };
      case 'non dispo':
      case 'non disponible':
        return { color: '#f44336', backgroundColor: '#ffe8e8' };
      default:
        return { color: '#666', backgroundColor: '#f5f5f5' };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666'
      }}>
        Chargement des conducteurs...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#f44336'
      }}>
        Erreur: {error}
      </div>
    );
  }

  return (
    <div style={{
      marginBottom: '40px'
    }}>
      <h2 style={{
        color: '#1E2A38',
        fontSize: '22px',
        fontWeight: '600',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '2px solid #cfd8dc'
      }}>
        Liste des conducteurs
      </h2>
      
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #cfd8dc',
        overflow: 'hidden'
      }}>
        <div style={{
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #cfd8dc'
              }}>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#1E2A38',
                  borderRight: '1px solid #cfd8dc'
                }}>
                  Matricule
                </th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#1E2A38',
                  borderRight: '1px solid #cfd8dc'
                }}>
                  Nom & Prénom
                </th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#1E2A38',
                  borderRight: '1px solid #cfd8dc'
                }}>
                  Email
                </th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#1E2A38',
                  borderRight: '1px solid #cfd8dc'
                }}>
                  Téléphone
                </th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#1E2A38',
                  borderRight: '1px solid #cfd8dc'
                }}>
                  Date d'embauche
                </th>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#1E2A38'
                }}>
                  Disponibilité
                </th>
              </tr>
            </thead>
            <tbody>
              {conducteurs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#b0b8c1',
                    fontSize: '16px'
                  }}>
                    Aucun conducteur trouvé.
                  </td>
                </tr>
              ) : (
                conducteurs.map((conducteur, index) => {
                  const disponibiliteStyle = getDisponibiliteColor(conducteur.disponibilite);
                  return (
                    <tr key={conducteur.matricule} style={{
                      borderBottom: '1px solid #cfd8dc',
                      backgroundColor: index % 2 === 0 ? 'white' : '#fafbfc',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f4f8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#fafbfc';
                    }}>
                      <td style={{
                        padding: '16px 12px',
                        fontWeight: '500',
                        color: '#1E2A38',
                        borderRight: '1px solid #cfd8dc'
                      }}>
                        {conducteur.matricule}
                      </td>
                      <td style={{
                        padding: '16px 12px',
                        borderRight: '1px solid #cfd8dc'
                      }}>
                        <div>
                          <div style={{ fontWeight: '500', color: '#1E2A38' }}>
                            {conducteur.nom} {conducteur.prenom}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                            {conducteur.fonction}
                          </div>
                        </div>
                      </td>
                      <td style={{
                        padding: '16px 12px',
                        borderRight: '1px solid #cfd8dc',
                        color: '#666'
                      }}>
                        {conducteur.email || 'N/A'}
                      </td>
                      <td style={{
                        padding: '16px 12px',
                        borderRight: '1px solid #cfd8dc',
                        color: '#666'
                      }}>
                        {conducteur.phone_number || 'N/A'}
                      </td>
                      <td style={{
                        padding: '16px 12px',
                        borderRight: '1px solid #cfd8dc',
                        color: '#666'
                      }}>
                        {formatDate(conducteur.date_embauche)}
                      </td>
                      <td style={{
                        padding: '16px 12px'
                      }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          display: 'inline-block',
                          ...disponibiliteStyle
                        }}>
                          {conducteur.disponibilite || 'Non défini'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 