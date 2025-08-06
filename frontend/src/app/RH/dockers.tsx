"use client";
import React, { useEffect, useState } from "react";
import RHLayout from "./RHLayout";
import DockersList from "./DockersList";

interface NouveauDocker {
  matricule: string;
  nom: string;
  prenom: string;
  date_embauche: string;
  email?: string;
  phone_number?: string;
  id_equipe?: string;
  fonction?: string;
  disponibilite?: string;
}

export default function DockersPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDocker, setSelectedDocker] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // État pour le formulaire d'ajout
  const [nouveauDocker, setNouveauDocker] = useState<NouveauDocker>({
    matricule: '',
    nom: '',
    prenom: '',
    date_embauche: '',
    email: '',
    phone_number: '',
    id_equipe: 'EQUIPE001',
    fonction: 'docker',
    disponibilite: 'disponible'
  });

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddDocker = () => {
    setShowAddForm(true);
  };

  const handleDeleteDocker = () => {
    if (selectedDocker) {
      setShowDeleteConfirm(true);
    } else {
      showToastMessage("Veuillez sélectionner un docker à supprimer");
    }
  };

  const confirmDelete = async () => {
    if (selectedDocker) {
      try {
        const response = await fetch(`http://localhost:8000/api/dockers/supprimer/${selectedDocker}/`, {
          method: 'DELETE',
          headers: {
            "Content-Type": "application/json",
          }
        });

        const result = await response.json();

        if (response.ok) {
          showToastMessage(`Docker ${selectedDocker} supprimé avec succès`);
          setSelectedDocker(null);
          setShowDeleteConfirm(false);
        } else {
          showToastMessage(`Erreur: ${result.error || 'Erreur lors de la suppression'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showToastMessage("Erreur de connexion lors de la suppression");
      }
    }
  };

  const handleSubmitNouveauDocker = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:8000/api/dockers/ajouter/", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matricule: nouveauDocker.matricule,
          nom: nouveauDocker.nom,
          prenom: nouveauDocker.prenom,
          email: nouveauDocker.email || '',
          phone_number: nouveauDocker.phone_number || '',
          date_embauche: nouveauDocker.date_embauche,
          fonction: nouveauDocker.fonction || 'docker',
          disponibilite: nouveauDocker.disponibilite || 'disponible',
          id_equipe: nouveauDocker.id_equipe || 'EQUIPE001'
        })
      });

      const result = await response.json();

      if (response.ok) {
        showToastMessage("Docker ajouté avec succès");
        setShowAddForm(false);
        setNouveauDocker({
          matricule: '',
          nom: '',
          prenom: '',
          date_embauche: '',
          email: '',
          phone_number: '',
          id_equipe: 'EQUIPE001',
          fonction: 'docker',
          disponibilite: 'disponible'
        });
      } else {
        showToastMessage(`Erreur: ${result.error || 'Erreur lors de l\'ajout'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      showToastMessage("Erreur de connexion lors de l'ajout");
    }
  };

  return (
    <RHLayout>
      <div style={{
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
        padding: '20px'
      }}>
        {/* Toast Message */}
        {showToast && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#1976D2',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease'
          }}>
            {toastMessage}
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{
                marginBottom: '20px',
                color: '#1E2A38',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Confirmer la suppression
              </h3>
              <p style={{
                marginBottom: '24px',
                color: '#666',
                lineHeight: '1.5'
              }}>
                Êtes-vous sûr de vouloir supprimer le docker <strong>{selectedDocker}</strong> ?
                Cette action est irréversible.
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    background: '#cfd8dc',
                    color: '#1E2A38',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    background: '#d32f2f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenu principal dans une carte */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}>
          {/* En-tête */}
          <div style={{
            padding: '30px',
            borderBottom: '1px solid #cfd8dc',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
          }}>
            <h1 style={{
              color: '#1E2A38',
              fontSize: '28px',
              fontWeight: '700',
              margin: 0,
              marginBottom: '8px'
            }}>
              Gestion des dockers
            </h1>
            <p style={{
              color: '#666',
              margin: 0,
              fontSize: '16px'
            }}>
              Informations des dockers de l'équipe
            </p>
          </div>

          {/* Contenu */}
          <div style={{ padding: '30px' }}>
            {/* Boutons d'action */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '30px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleAddDocker}
                style={{
                  background: '#1976D2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1565c0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1976D2';
                }}
              >
                <span style={{ fontSize: '16px' }}>+</span>
                Ajouter un docker
              </button>
              <button
                onClick={handleDeleteDocker}
                style={{
                  background: 'transparent',
                  color: '#d32f2f',
                  border: '1px solid #d32f2f',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ffebee';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: '14px' }}>🗑️</span>
                Supprimer un docker
              </button>
            </div>

            {/* Liste des dockers */}
            <DockersList />

            {/* Formulaire d'ajout */}
            {showAddForm && (
              <div style={{
                background: '#f8f9fa',
                padding: '24px',
                borderRadius: '8px',
                marginBottom: '30px',
                border: '1px solid #cfd8dc'
              }}>
                <h3 style={{ 
                  marginBottom: '20px', 
                  color: '#1E2A38', 
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  Ajouter un nouveau docker
                </h3>
                <form onSubmit={handleSubmitNouveauDocker}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '500',
                        color: '#1E2A38',
                        fontSize: '14px'
                      }}>
                        Matricule *
                      </label>
                      <input
                        type="text"
                        value={nouveauDocker.matricule}
                        onChange={(e) => setNouveauDocker({...nouveauDocker, matricule: e.target.value})}
                        required
                        placeholder="Ex: D001"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #cfd8dc',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#e0e0e0',
                          color: '#1E2A38',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1976D2';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cfd8dc';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '500',
                        color: '#1E2A38',
                        fontSize: '14px'
                      }}>
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={nouveauDocker.nom}
                        onChange={(e) => setNouveauDocker({...nouveauDocker, nom: e.target.value})}
                        required
                        placeholder="Nom du docker"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #cfd8dc',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#e0e0e0',
                          color: '#1E2A38',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1976D2';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cfd8dc';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '500',
                        color: '#1E2A38',
                        fontSize: '14px'
                      }}>
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={nouveauDocker.prenom}
                        onChange={(e) => setNouveauDocker({...nouveauDocker, prenom: e.target.value})}
                        required
                        placeholder="Prénom du docker"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #cfd8dc',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#e0e0e0',
                          color: '#1E2A38',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1976D2';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cfd8dc';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '500',
                        color: '#1E2A38',
                        fontSize: '14px'
                      }}>
                        Date d'embauche *
                      </label>
                      <input
                        type="date"
                        value={nouveauDocker.date_embauche}
                        onChange={(e) => setNouveauDocker({...nouveauDocker, date_embauche: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #cfd8dc',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#e0e0e0',
                          color: '#1E2A38',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1976D2';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cfd8dc';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '500',
                        color: '#1E2A38',
                        fontSize: '14px'
                      }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={nouveauDocker.email}
                        onChange={(e) => setNouveauDocker({...nouveauDocker, email: e.target.value})}
                        placeholder="email@exemple.com"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #cfd8dc',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#e0e0e0',
                          color: '#1E2A38',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1976D2';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cfd8dc';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '500',
                        color: '#1E2A38',
                        fontSize: '14px'
                      }}>
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={nouveauDocker.phone_number}
                        onChange={(e) => setNouveauDocker({...nouveauDocker, phone_number: e.target.value})}
                        placeholder="+33 1 23 45 67 89"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #cfd8dc',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#e0e0e0',
                          color: '#1E2A38',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1976D2';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cfd8dc';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '500',
                        color: '#1E2A38',
                        fontSize: '14px'
                      }}>
                        ID Équipe
                      </label>
                      <input
                        type="text"
                        value={nouveauDocker.id_equipe}
                        onChange={(e) => setNouveauDocker({...nouveauDocker, id_equipe: e.target.value})}
                        placeholder="EQUIPE001"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #cfd8dc',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#e0e0e0',
                          color: '#1E2A38',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1976D2';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cfd8dc';
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '500',
                        color: '#1E2A38',
                        fontSize: '14px'
                      }}>
                        Disponibilité
                      </label>
                      <select
                        value={nouveauDocker.disponibilite}
                        onChange={(e) => setNouveauDocker({...nouveauDocker, disponibilite: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #cfd8dc',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#e0e0e0',
                          color: '#1E2A38',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1976D2';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cfd8dc';
                        }}
                      >
                        <option value="disponible">Disponible</option>
                        <option value="en service">En service</option>
                        <option value="en repos">En repos</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button
                      type="submit"
                      style={{
                        background: '#1976D2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '12px 24px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1565c0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#1976D2';
                      }}
                    >
                      Ajouter
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      style={{
                        background: '#cfd8dc',
                        color: '#1E2A38',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '12px 24px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#b0bec5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#cfd8dc';
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </RHLayout>
  );
} 