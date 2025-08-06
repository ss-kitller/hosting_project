import React from 'react';

interface AlerteButtonProps {
  heureParJour: number;
  matricule: string;
  nom: string;
  prenom: string;
  type: 'conducteur' | 'docker';
}

const AlerteButton: React.FC<AlerteButtonProps> = ({ 
  heureParJour, 
  matricule, 
  nom, 
  prenom, 
  type
}) => {
  // Vérifier si une alerte est nécessaire
  const hasAlerte = heureParJour > 8 || heureParJour < 2;
  
  if (!hasAlerte) {
    return null; // Ne pas afficher le badge s'il n'y a pas d'alerte
  }

  const getAlerteType = () => {
    if (heureParJour > 8) return 'surcharge';
    if (heureParJour < 2) return 'sous-charge';
    return null;
  };

  const alerteType = getAlerteType();

  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      backgroundColor: alerteType === 'surcharge' ? '#ffebee' : '#fff3e0',
      color: alerteType === 'surcharge' ? '#d32f2f' : '#f57c00',
      border: `1px solid ${alerteType === 'surcharge' ? '#ffcdd2' : '#ffcc02'}`,
      display: 'inline-block',
      minWidth: '80px',
      textAlign: 'center'
    }}>
      {alerteType === 'surcharge' ? 'SURCHARGE' : 'SOUS CHARGE'}
    </span>
  );
};

export default AlerteButton; 