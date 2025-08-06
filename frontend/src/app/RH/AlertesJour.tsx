import React, { useState, useEffect } from 'react';

const API_URL = "http://localhost:8000/api";

interface Alerte {
  matricule: string;
  nom: string;
  prenom: string;
  heure_par_jour: number;
  type_alerte: 'excess' | 'lack';
  message: string;
}

interface AlertesJourProps {
  type: 'conducteur' | 'docker';
}

const AlertesJour: React.FC<AlertesJourProps> = ({ type }) => {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlertes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/alertes/${type === 'conducteur' ? 'conducteurs' : 'dockers'}/`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des alertes');
        }
        const data = await response.json();
        setAlertes(data.alertes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchAlertes();
  }, [type]);

  if (loading) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        marginBottom: '20px'
      }}>
        <div style={{ color: '#666', fontSize: '14px' }}>Chargement des alertes...</div>
      </div>
    );
  }

  if (error) {
    return null; // Ne pas afficher la section en cas d'erreur
  }

  if (alertes.length === 0) {
    return null; // Ne pas afficher la section s'il n'y a pas d'alertes
  }

  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#1E2A38',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          backgroundColor: '#ff9800',
          borderRadius: '50%'
        }}></span>
        Alertes du jour ({alertes.length})
      </h3>
      
      <div style={{
        display: 'grid',
        gap: '8px'
      }}>
        {alertes.map((alerte, index) => (
          <div key={index} style={{
            padding: '8px 12px',
            backgroundColor: alerte.type_alerte === 'excess' ? '#fff3e0' : '#fff8e1',
            borderRadius: '4px',
            border: `1px solid ${alerte.type_alerte === 'excess' ? '#ffcc02' : '#ffb74d'}`,
            fontSize: '13px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ fontWeight: '500', color: '#1E2A38' }}>
                {alerte.prenom} {alerte.nom} ({alerte.matricule})
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontWeight: '500',
                  backgroundColor: alerte.type_alerte === 'excess' ? '#ff5722' : '#ff9800',
                  color: 'white'
                }}>
                  {alerte.type_alerte === 'excess' ? 'SURCHARGE' : 'SOUS CHARGE'}
                </span>
                <span style={{ color: '#666' }}>
                  {alerte.heure_par_jour}h
                </span>
              </div>
            </div>
            <div style={{
              marginTop: '4px',
              color: '#666',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              {alerte.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertesJour; 