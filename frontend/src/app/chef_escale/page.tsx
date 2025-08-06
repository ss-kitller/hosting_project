"use client";
import React, { useState, createContext, useContext, useEffect, useMemo } from "react";
import ChefEscaleLayout from "./ChefEscaleLayout";
import styles from "../RH/rh-dashboard.module.css";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import { PlusCircle, Edit2, Trash2, FileText, AlertTriangle, X, RefreshCw } from 'lucide-react';

// Contexte pour la navigation
interface NavigationContextType {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

// Composant DateTime Picker moderne avec Material UI
interface ModernDateTimePickerProps {
  value: Dayjs | null;
  onChange: (date: Dayjs | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Dayjs | null;
  maxDate?: Dayjs | null;
  required?: boolean;
}

const ModernDateTimePicker: React.FC<ModernDateTimePickerProps> = ({
  value,
  onChange,
  placeholder = "JJ/MM/AAAA HH:MM",
  disabled = false,
  minDate,
  maxDate,
  required = false
}) => {
  return (
    <DateTimePicker
      value={value}
      onChange={onChange}
      disabled={disabled}
      minDateTime={minDate || undefined}
      maxDateTime={maxDate || undefined}
      slotProps={{
        textField: {
          placeholder,
          required,
          fullWidth: true,
          size: "medium",
          sx: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              '& fieldset': {
                borderColor: '#ddd',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: '#005baa',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#005baa',
                borderWidth: '2px',
              },
              '& .MuiInputBase-input': {
                color: '#6b7280',
                fontSize: '1rem',
                padding: '0.75rem',
                '&::placeholder': {
                  color: '#9ca3af',
                  opacity: 1,
                },
              },
            },
          },
        },
        popper: {
          sx: {
            '& .MuiPaper-root': {
              borderRadius: '0.75rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e1e5e9',
            },
            '& .MuiPickersLayout-root': {
              backgroundColor: 'white',
            },
            '& .MuiPickersLayout-contentWrapper': {
              backgroundColor: 'white',
            },
          },
        },
      }}
      format="DD/MM/YYYY HH:mm"
      ampm={false}
      timeSteps={{ minutes: 15 }}
    />
  );
};

// Composant Accueil
const AccueilChefEscale = () => {
  const [navires, setNavires] = useState<any[]>([]);
  const [engins, setEngins] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [absencesImprevues, setAbsencesImprevues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setActiveSection } = useNavigation();

  // Charger les données du dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Charger les navires
        const naviresResponse = await fetch('http://localhost:8000/api/navires-previsionnels/csv_data/');
        if (naviresResponse.ok) {
          const naviresData = await naviresResponse.json();
          setNavires(naviresData.data || []);
        }

        // Charger les engins
        const enginsResponse = await fetch('http://localhost:8000/api/engins/');
        if (enginsResponse.ok) {
          const enginsData = await enginsResponse.json();
          setEngins(enginsData || []);
        }

        // Charger les absences
        const absencesResponse = await fetch('http://localhost:8000/api/absences/');
        if (absencesResponse.ok) {
          const absencesData = await absencesResponse.json();
          setAbsences(absencesData || []);
        }

        // Charger les absences imprévues
        const absencesImprevuesResponse = await fetch('http://localhost:8000/api/absences-imprevues/');
        if (absencesImprevuesResponse.ok) {
          const absencesImprevuesData = await absencesImprevuesResponse.json();
          setAbsencesImprevues(absencesImprevuesData || []);
        }

      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Calculer les statistiques des navires
  const statistiquesNavires = useMemo(() => {
    const total = navires.length;
    const prevus = navires.filter(n => (n.statut || '').toLowerCase().includes('prev')).length;
    const enQuai = navires.filter(n => (n.statut || '').toLowerCase().includes('quai')).length;
    const enRade = navires.filter(n => (n.statut || '').toLowerCase().includes('rade')).length;
    const appareillage = navires.filter(n => (n.statut || '').toLowerCase().includes('appareillage')).length;
    
    return { total, prevus, enQuai, enRade, appareillage };
  }, [navires]);

  // Calculer les statistiques des engins
  const statistiquesEngins = useMemo(() => {
    const total = engins.length;
    const disponibles = engins.filter(e => e.etat_engin === 'disponible').length;
    const affectes = engins.filter(e => e.etat_engin === 'affecté').length;
    const enPanne = engins.filter(e => e.etat_engin === 'en maintenance').length;
    
    return { total, disponibles, affectes, enPanne };
  }, [engins]);

  // Calculer les statistiques des absences
  const statistiquesAbsences = useMemo(() => {
    const aujourdhui = new Date().toISOString().split('T')[0];
    const absencesAujourdhui = absences.filter(a => a.date_debut === aujourdhui).length;
    const absencesImprevuesEnAttente = absencesImprevues.filter(a => !a.traitee).length;
    const absencesNonJustifiees = absences.filter(a => !a.justifiee).length;
    
    return { absencesAujourdhui, absencesImprevuesEnAttente, absencesNonJustifiees };
  }, [absences, absencesImprevues]);

  // Vérifier les alertes
  const alertes = useMemo(() => {
    const alertesList = [];
    
    // Alerte pour absences imprévues non traitées depuis 2h
    const maintenant = new Date();
    const absencesImprevuesNonTraitees = absencesImprevues.filter(a => {
      if (a.traitee) return false;
      const dateCreation = new Date(a.date_creation);
      const differenceHeures = (maintenant.getTime() - dateCreation.getTime()) / (1000 * 60 * 60);
      return differenceHeures > 2;
    });
    
    if (absencesImprevuesNonTraitees.length > 0) {
      alertesList.push({
        type: 'warning',
        message: `${absencesImprevuesNonTraitees.length} absence(s) imprévue(s) non traitée(s) depuis plus de 2h`,
        action: () => setActiveSection('absences')
      });
    }

    // Alerte pour navires en rade
    if (statistiquesNavires.enRade > 3) {
      alertesList.push({
        type: 'info',
        message: `${statistiquesNavires.enRade} navire(s) en rade - Vérifiez les priorités`,
        action: () => setActiveSection('navires')
      });
    }

    return alertesList;
  }, [absencesImprevues, statistiquesNavires.enRade, setActiveSection]);

  return (
    <div className={styles.dashboardContainer}>
      {/* En-tête du dashboard */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span style={{ color: '#005baa', fontWeight: 700 }}>Chef d'Escale</span> Dashboard
        </h1>
        <p className={styles.subtitle}>
          Supervisez et gérez vos opérations portuaires en temps réel
        </p>
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          {alertes.map((alerte: any, index: number) => (
            <div key={index} style={{
              background: alerte.type === 'warning' 
                ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              color: alerte.type === 'warning' ? '#92400e' : '#1e40af',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: `1px solid ${alerte.type === 'warning' ? '#f59e0b' : '#3b82f6'}`,
              marginBottom: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={alerte.action}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <span style={{ fontWeight: '500', fontFamily: 'Inter, sans-serif' }}>
                {alerte.message}
              </span>
              <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                Cliquer pour voir →
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Grille des cartes de statistiques */}
      <div className={styles.cardsGrid}>
        {/* Carte Total Navires */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <span style={{ fontSize: '1.5rem' }}>🚢</span>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Total Navires</h3>
            <p className={styles.cardNumber}>{statistiquesNavires.total}</p>
            <p className={styles.cardLabel}>enregistrés</p>
          </div>
        </div>

        {/* Carte Prévus */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <span style={{ fontSize: '1.5rem' }}>📅</span>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Prévus</h3>
            <p className={styles.cardNumber}>{statistiquesNavires.prevus}</p>
            <p className={styles.cardLabel}>navires</p>
          </div>
        </div>

        {/* Carte En Quai */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <span style={{ fontSize: '1.5rem' }}>⚓</span>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>En Quai</h3>
            <p className={styles.cardNumber}>{statistiquesNavires.enQuai}</p>
            <p className={styles.cardLabel}>navires</p>
          </div>
        </div>

        {/* Carte En Rade */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <span style={{ fontSize: '1.5rem' }}>🌊</span>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>En Rade</h3>
            <p className={styles.cardNumber}>{statistiquesNavires.enRade}</p>
            <p className={styles.cardLabel}>navires</p>
          </div>
        </div>

        {/* Carte Appareillage */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <span style={{ fontSize: '1.5rem' }}>🚢</span>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Appareillage</h3>
            <p className={styles.cardNumber}>{statistiquesNavires.appareillage}</p>
            <p className={styles.cardLabel}>navires</p>
          </div>
        </div>

        {/* Carte Total Engins */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <span style={{ fontSize: '1.5rem' }}>⚙️</span>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Total Engins</h3>
            <p className={styles.cardNumber}>{statistiquesEngins.total}</p>
            <p className={styles.cardLabel}>enregistrés</p>
          </div>
        </div>

        {/* Carte Engins Disponibles */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Engins Disponibles</h3>
            <p className={styles.cardNumber}>{statistiquesEngins.disponibles}</p>
            <p className={styles.cardLabel}>disponibles</p>
          </div>
        </div>

        {/* Carte Absences Aujourd'hui */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <span style={{ fontSize: '1.5rem' }}>📋</span>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Absences</h3>
            <p className={styles.cardNumber}>{statistiquesAbsences.absencesAujourdhui}</p>
            <p className={styles.cardLabel}>aujourd'hui</p>
          </div>
        </div>

        {/* Carte Alertes */}
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>Alertes</h3>
            <p className={styles.cardNumber}>{alertes.length}</p>
            <p className={styles.cardLabel}>actives</p>
          </div>
        </div>
      </div>

      {/* Sections principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        {/* Section Engins */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1a365d',
              margin: 0,
              fontFamily: 'Segoe UI, Arial, sans-serif'
            }}>
              Engins de Manutention
            </h3>
            <button
              onClick={() => setActiveSection('engins')}
              style={{
                background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 91, 170, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Voir tous
            </button>
          </div>

          {/* Statistiques Engins - Palette harmonisée */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(110%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(100%)';
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                {statistiquesEngins.total}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Total</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(110%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(100%)';
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                {statistiquesEngins.disponibles}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Disponibles</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(110%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(100%)';
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                {statistiquesEngins.affectes}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Affectés</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(110%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(100%)';
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                {statistiquesEngins.enPanne}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>En Panne</div>
            </div>
          </div>
        </div>

        {/* Section Absences */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1a365d',
              margin: 0,
              fontFamily: 'Segoe UI, Arial, sans-serif'
            }}>
              Gestion des Absences
            </h3>
            <button
              onClick={() => setActiveSection('absences')}
              style={{
                background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 91, 170, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Gérer
            </button>
          </div>

          {/* Statistiques Absences - Palette harmonisée */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(110%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(100%)';
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                {statistiquesAbsences.absencesAujourdhui}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Aujourd'hui</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.filter = 'brightness(110%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'brightness(100%)';
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                {statistiquesAbsences.absencesImprevuesEnAttente}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Imprévues</div>
            </div>
          </div>

          {/* Actions rapides - Palette harmonisée */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setActiveSection('absences')}
              style={{
                background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              + Ajouter
            </button>
            <button
              onClick={() => setActiveSection('absences')}
              style={{
                background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Convertir
            </button>
          </div>
        </div>
      </div>

      {/* Section Actions Rapides */}
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1a365d',
          margin: '0 0 1rem 0',
          fontFamily: 'Segoe UI, Arial, sans-serif'
        }}>
          Actions Rapides
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button
            onClick={() => setActiveSection('navires')}
            style={{
              background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 91, 170, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>🚢</span>
            Mettre à jour navires ANP
          </button>

          <button
            onClick={() => setActiveSection('affectations')}
            style={{
              background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 91, 170, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>⚙️</span>
            Générer affectations auto
          </button>

          <button
            onClick={() => setActiveSection('absences')}
            style={{
              background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 91, 170, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>📋</span>
            Ajouter justificatif
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.footerText}>
          Utilisez la navigation à gauche pour accéder aux fonctionnalités détaillées
        </p>
      </div>
    </div>
  );
};



// Composant Engins complet
const EnginsSection = () => {
  const [engins, setEngins] = useState<any[]>([]);
  const [familles, setFamilles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtreCode, setFiltreCode] = useState("");
  const [filtreEtat, setFiltreEtat] = useState("");
  const [filtreFamille, setFiltreFamille] = useState("");
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Fermer le dropdown d'export quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const exportDropdown = document.getElementById('exportDropdown');
      const exportButton = document.getElementById('exportButton');
      
      if (exportDropdown && exportButton && 
          !exportButton.contains(event.target as Node) && 
          !exportDropdown.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadEngins = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/engins/');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Données reçues:', data);
        setEngins(data);
        
        // Extraire les familles uniques
        const famillesUniques = [...new Set(data.map((e: any) => e.famille_engin).filter(Boolean))] as string[];
        console.log('Familles extraites:', famillesUniques);
        setFamilles(famillesUniques);
        
        setError(null);
      } else {
        const errorText = await response.text();
        console.error('Erreur HTTP:', response.status, errorText);
        setError(`Erreur ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError("Erreur de connexion au serveur - Vérifiez que le backend Django fonctionne");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEngins();
  }, []);

  // Calculer les statistiques
  const statistiques = {
    total: engins.length,
    disponibles: engins.filter(e => e.etat_engin === 'disponible').length,
    enMaintenance: engins.filter(e => e.etat_engin === 'en maintenance').length,
    affectes: engins.filter(e => e.etat_engin === 'affecté').length
  };

  // Filtrer les engins
  const enginsFiltres = engins.filter(engin => {
    const matchCode = !filtreCode || engin.code_engin.toLowerCase().includes(filtreCode.toLowerCase());
    const matchEtat = !filtreEtat || engin.etat_engin === filtreEtat;
    const matchFamille = !filtreFamille || engin.famille_engin === filtreFamille;
    return matchCode && matchEtat && matchFamille;
  });

  // Fonctions d'export
  const exportPDF = () => {
    // Implémentation PDF à venir
    console.log('Export PDF');
    setShowExportDropdown(false);
  };

  const exportExcel = () => {
    // Implémentation Excel à venir
    console.log('Export Excel');
    setShowExportDropdown(false);
  };

  return (
    <div className={styles.dashboardContainer}>
              <h1 className={styles.title}>Vue Globale des Engins</h1>
      
              {/* Cartes de statistiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '0.75rem',
            padding: '1rem',
            boxShadow: '0 4px 24px rgba(0, 32, 96, 0.1)',
            border: '1px solid rgba(0, 91, 170, 0.08)'
          }}>
            <h3 style={{ fontSize: '0.9rem', color: '#0A2540', marginBottom: '0.25rem' }}>Total Engins</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#005baa', margin: 0 }}>{statistiques.total}</p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '0.75rem',
            padding: '1rem',
            boxShadow: '0 4px 24px rgba(0, 32, 96, 0.1)',
            border: '1px solid rgba(0, 91, 170, 0.08)'
          }}>
            <h3 style={{ fontSize: '0.9rem', color: '#0A2540', marginBottom: '0.25rem' }}>Engins Disponibles</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#27ae60', margin: 0 }}>{statistiques.disponibles}</p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '0.75rem',
            padding: '1rem',
            boxShadow: '0 4px 24px rgba(0, 32, 96, 0.1)',
            border: '1px solid rgba(0, 91, 170, 0.08)'
          }}>
            <h3 style={{ fontSize: '0.9rem', color: '#0A2540', marginBottom: '0.25rem' }}>En Maintenance</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#e67e22', margin: 0 }}>{statistiques.enMaintenance}</p>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '0.75rem',
            padding: '1rem',
            boxShadow: '0 4px 24px rgba(0, 32, 96, 0.1)',
            border: '1px solid rgba(0, 91, 170, 0.08)'
          }}>
            <h3 style={{ fontSize: '0.9rem', color: '#0A2540', marginBottom: '0.25rem' }}>Engins Affectés</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2980b9', margin: 0 }}>{statistiques.affectes}</p>
          </div>
        </div>

      {/* Bouton Ajouter et Filtres */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 91, 170, 0.05) 0%, rgba(0, 51, 102, 0.03) 100%)',
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 24px rgba(0, 32, 96, 0.1)',
        border: '1px solid rgba(0, 91, 170, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          flex: 1
        }}>
          <input
            type="text"
            placeholder="Rechercher par code..."
            value={filtreCode}
            onChange={(e) => setFiltreCode(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #005baa',
              backgroundColor: 'white',
              color: '#212529',
              fontSize: '0.9rem',
              minWidth: '200px'
            }}
          />
          
                      <select
              value={filtreEtat}
              onChange={(e) => setFiltreEtat(e.target.value)}
              style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #005baa',
                backgroundColor: 'white',
                color: filtreEtat ? '#212529' : '#6c757d',
                fontSize: '0.9rem',
                minWidth: '150px'
              }}
            >
              <option value="" style={{ color: '#6c757d' }}>Tous les états</option>
              <option value="disponible" style={{ color: '#212529' }}>Disponible</option>
              <option value="en maintenance" style={{ color: '#212529' }}>En maintenance</option>
              <option value="affecté" style={{ color: '#212529' }}>Affecté</option>
            </select>
        </div>


      </div>

      {/* Tableau */}
      <div style={{
        background: '#fafdff',
        borderRadius: '1rem',
        padding: '0',
        boxShadow: '0 2px 8px rgba(0,32,96,0.06)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Chargement...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#e74c3c' }}>{error}</p>
        ) : (
          <>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '1rem'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e6eaf3', backgroundColor: '#eaf2fb' }}>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: '700', color: '#003366', fontSize: '1rem' }}>Code</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: '700', color: '#003366', fontSize: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Famille d'engin</span>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <select 
                          value={filtreFamille} 
                          onChange={e => setFiltreFamille(e.target.value)}
                          style={{
                            appearance: 'none',
                            padding: '4px 8px 4px 4px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            fontSize: '12px',
                            color: '#003366',
                            cursor: 'pointer',
                            minWidth: '20px',
                            width: '20px'
                          }}
                        >
                          <option value="">▼</option>
                          {familles && familles.length > 0 ? (
                            familles.map(f => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))
                          ) : (
                            <option value="">▼</option>
                          )}
                        </select>
                      </div>
                    </div>
                  </th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: '700', color: '#003366', fontSize: '1rem' }}>Capacité max</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: '700', color: '#003366', fontSize: '1rem' }}>État</th>
                </tr>
              </thead>
                              <tbody>
                  {enginsFiltres.map((engin: any) => (
                    <tr key={engin.code_engin} style={{ borderBottom: '1px solid #e6eaf3' }}>
                      <td style={{ padding: '0.85rem 1rem', color: '#2a3a4a', fontSize: '1rem' }}>{engin.code_engin}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#2a3a4a', fontSize: '1rem' }}>{engin.famille_engin}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#2a3a4a', fontSize: '1rem' }}>{engin.capacite_max}</td>
                                              <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          backgroundColor: engin.etat_engin === 'disponible' ? '#d4edda' : 
                                           engin.etat_engin === 'en maintenance' ? '#fff3cd' : '#d1ecf1',
                          color: engin.etat_engin === 'disponible' ? '#155724' : 
                                 engin.etat_engin === 'en maintenance' ? '#856404' : '#0c5460'
                        }}>
                          {engin.etat_engin}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
            
                         {/* Bouton d'export */}
             <div style={{ textAlign: 'right', position: 'relative' }}>
               <button
                 id="exportButton"
                 onClick={() => setShowExportDropdown(!showExportDropdown)}
                 style={{
                   padding: '0.75rem 1.5rem',
                   borderRadius: '0.5rem',
                   border: '1px solid #005baa',
                   backgroundColor: '#005baa',
                   color: 'white',
                   cursor: 'pointer',
                   fontSize: '0.9rem',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem'
                 }}
               >
                 Exporter
                 <span style={{ fontSize: '0.8rem' }}>▼</span>
               </button>
               
               {showExportDropdown && (
                 <div 
                   id="exportDropdown"
                   style={{
                     position: 'absolute',
                     top: '100%',
                     right: 0,
                     background: 'white',
                     borderRadius: '0.5rem',
                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                     border: '1px solid #ddd',
                     zIndex: 10,
                     minWidth: '150px'
                   }}
                 >
                   <button
                     onClick={exportPDF}
                     style={{
                       width: '100%',
                       padding: '0.75rem 1rem',
                       border: 'none',
                       background: 'none',
                       cursor: 'pointer',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '0.5rem',
                       color: '#e74c3c',
                       fontSize: '0.9rem'
                     }}
                   >
                     <FaFilePdf /> Exporter en PDF
                   </button>
                   <button
                     onClick={exportExcel}
                     style={{
                       width: '100%',
                       padding: '0.75rem 1rem',
                       border: 'none',
                       background: 'none',
                       cursor: 'pointer',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '0.5rem',
                       color: '#27ae60',
                       fontSize: '0.9rem'
                     }}
                   >
                     <FaFileExcel /> Exporter en Excel
                   </button>
                 </div>
               )}
             </div>
          </>
        )}
      </div>


    </div>
  );
};

// Composant Absences pour Chef d'Escale - Connecté au backend PostgreSQL
const AbsencesSection = () => {
  const [absences, setAbsences] = useState<any[]>([]);
  const [absencesNonDeclarees, setAbsencesNonDeclarees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<any | null>(null);
  const [convertingAbsence, setConvertingAbsence] = useState<any | null>(null);
  const [addingAbsenceImprevue, setAddingAbsenceImprevue] = useState(false);
  const [filtreType, setFiltreType] = useState('');
  const [filtreDateDebut, setFiltreDateDebut] = useState<Dayjs | null>(null);
  const [filtreDateFin, setFiltreDateFin] = useState<Dayjs | null>(null);
  const [formData, setFormData] = useState({
    matricule: '',
    date_debut_abs: '',
    date_fin_abs: '',
    justification: null as File | null
  });
  const [formDateDebut, setFormDateDebut] = useState<Dayjs | null>(null);
  const [formDateFin, setFormDateFin] = useState<Dayjs | null>(null);
  
  // États pour le formulaire d'ajout d'absence imprévue
  const [absenceImprevueData, setAbsenceImprevueData] = useState({
    matricule: '',
    id_shift: '',
    date_debut_abs: '',
    date_fin_abs: ''
  });
  const [absenceImprevueDateDebut, setAbsenceImprevueDateDebut] = useState<Dayjs | null>(null);
  const [absenceImprevueDateFin, setAbsenceImprevueDateFin] = useState<Dayjs | null>(null);
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<any | null>(null);
  const [justificationText, setJustificationText] = useState('');

  useEffect(() => {
    loadAbsences();
    loadAbsencesNonDeclarees();
  }, []);

  const loadAbsences = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/absences/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('Absences chargées:', data);
      setAbsences(data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des absences:', err);
      setError('Erreur lors du chargement des absences. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  const loadAbsencesNonDeclarees = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/absences-non-declarees/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`Erreur HTTP ${response.status} lors du chargement des absences non déclarées`);
        setAbsencesNonDeclarees([]);
        return;
      }

      const data = await response.json();
      console.log('Absences non déclarées chargées:', data);
      setAbsencesNonDeclarees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des absences non déclarées:', err);
      setAbsencesNonDeclarees([]);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAbsence(null);
    setConvertingAbsence(null);
    setFormData({
      matricule: '',
      date_debut_abs: '',
      date_fin_abs: '',
      justification: null
    });
    setFormDateDebut(null);
    setFormDateFin(null);
    loadAbsences();
    loadAbsencesNonDeclarees();
  };

  const handleEdit = (absence: any) => {
    console.log('Modification de l\'absence:', absence);
    setEditingAbsence(absence);
    setFormData({
      matricule: absence.matricule || '',
      date_debut_abs: '',
      date_fin_abs: '',
      justification: null // On ne peut pas pré-remplir un fichier, mais on garde la référence
    });
    setFormDateDebut(absence.date_debut_abs ? dayjs(absence.date_debut_abs) : null);
    setFormDateFin(absence.date_fin_abs ? dayjs(absence.date_fin_abs) : null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette absence ?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/absences/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      setSuccessMessage('Absence supprimée avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadAbsences();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression de l\'absence');
    }
  };

  const handleConvert = (absenceImprevue: any) => {
    console.log('Conversion de l\'absence imprévue:', absenceImprevue);
    setConvertingAbsence(absenceImprevue);
    setFormData({
      matricule: absenceImprevue.matricule || '',
      date_debut_abs: '',
      date_fin_abs: '',
      justification: null
    });
    setFormDateDebut(absenceImprevue.date_debut_abs ? dayjs(absenceImprevue.date_debut_abs) : null);
    setFormDateFin(absenceImprevue.date_fin_abs ? dayjs(absenceImprevue.date_fin_abs) : null);
    setShowForm(true);
  };

  const deleteAbsenceImprevue = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/absences-non-declarees/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      setSuccessMessage('Absence imprévue supprimée avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadAbsencesNonDeclarees();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression de l\'absence imprévue');
    }
  };

  const handleAddAbsenceImprevue = () => {
    setAddingAbsenceImprevue(true);
    setAbsenceImprevueData({
      matricule: '',
      id_shift: '',
      date_debut_abs: '',
      date_fin_abs: ''
    });
    setAbsenceImprevueDateDebut(null);
    setAbsenceImprevueDateFin(null);
  };

  const handleAbsenceImprevueInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAbsenceImprevueData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAbsenceImprevue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('Ajout d\'une absence imprévue:', absenceImprevueData);

      const dataToSend = {
        matricule: absenceImprevueData.matricule,
        id_shift: parseInt(absenceImprevueData.id_shift),
        date_debut_abs: absenceImprevueDateDebut ? absenceImprevueDateDebut.toISOString() : null,
        date_fin_abs: absenceImprevueDateFin ? absenceImprevueDateFin.toISOString() : null
      };

      console.log('Données à envoyer:', dataToSend);

      const response = await fetch('http://localhost:8000/api/absences-non-declarees/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      console.log('Réponse du serveur:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        console.error('Erreur du serveur:', errorData);
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('Absence imprévue ajoutée:', result);
      
      setSuccessMessage('Absence imprévue ajoutée avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Fermer le formulaire et recharger les données
      setAddingAbsenceImprevue(false);
      loadAbsencesNonDeclarees();
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'absence imprévue:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'absence imprévue');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData(prev => ({
      ...prev,
      justification: file || null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('matricule', formData.matricule);
      if (formDateDebut) formDataToSend.append('date_debut_abs', formDateDebut.toISOString());
      if (formDateFin) formDataToSend.append('date_fin_abs', formDateFin.toISOString());
      if (formData.justification) formDataToSend.append('justification_file', formData.justification);

      // Log du contenu du FormData
      console.log('Contenu du FormData envoyé :');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const url = editingAbsence 
        ? `http://localhost:8000/api/absences/${editingAbsence.id_absence}/`
        : 'http://localhost:8000/api/absences/';
      const method = editingAbsence ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          error = await response.text();
        }
        console.error('Erreur du serveur:', error);
        setError(`Erreur du serveur: ${JSON.stringify(error)}`);
        throw new Error(`Erreur HTTP: ${response.status}`);
      } else {
        const data = await response.json();
        console.log('Réponse du serveur (succès):', data);
        
        // Succès - mettre à jour l'état
        setSuccessMessage(editingAbsence ? 'Absence modifiée avec succès !' : 'Absence ajoutée avec succès !');
        setShowForm(false);
        setEditingAbsence(null);
        
        // Réinitialiser le formulaire
        setFormData({
          matricule: '',
          date_debut_abs: '',
          date_fin_abs: '',
          justification: null
        });
        setFormDateDebut(null);
        setFormDateFin(null);
        
        // Recharger les données
        await loadAbsences();
        
        // Masquer le message de succès après 3 secondes
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError(`Erreur lors de la soumission: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

    const absencesFiltrees = absences.filter(absence => {
    const matchMatricule = !filtreType || absence.matricule.toLowerCase().includes(filtreType.toLowerCase());
    
    // Filtre par plage de dates
    let matchDate = true;
    if (filtreDateDebut || filtreDateFin) {
      const absenceDateDebut = absence.date_debut_abs ? dayjs(absence.date_debut_abs) : null;
      const absenceDateFin = absence.date_fin_abs ? dayjs(absence.date_fin_abs) : null;
      
      if (filtreDateDebut && absenceDateDebut) {
        matchDate = matchDate && absenceDateDebut.isAfter(filtreDateDebut) || absenceDateDebut.isSame(filtreDateDebut);
      }
      if (filtreDateFin && absenceDateFin) {
        matchDate = matchDate && absenceDateFin.isBefore(filtreDateFin) || absenceDateFin.isSame(filtreDateFin);
      }
    }
    
    return matchMatricule && matchDate;
  });

  const handleToggleJustification = (absence: any) => {
    // Cette fonction peut être utilisée pour afficher les détails de justification
    console.log('Toggle justification pour:', absence);
  };

  const handleJustifier = (absence: any) => {
    setSelectedAbsence(absence);
    setJustificationText(absence.justification || '');
    setShowJustificationModal(true);
  };

  const handleSubmitJustification = async () => {
    if (!selectedAbsence) return;

    try {
      const response = await fetch(`http://localhost:8000/api/absences-non-declarees/${selectedAbsence.id}/justifier/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          justification: justificationText
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      setSuccessMessage('Absence justifiée avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowJustificationModal(false);
      setSelectedAbsence(null);
      setJustificationText('');
      loadAbsencesNonDeclarees();
    } catch (err) {
      console.error('Erreur lors de la justification:', err);
      setError('Erreur lors de la justification de l\'absence');
    }
  };

  const handleAnnulerJustification = async (absence: any) => {
    try {
      const response = await fetch(`http://localhost:8000/api/absences-non-declarees/${absence.id}/annuler_justification/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      setSuccessMessage('Justification annulée avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadAbsencesNonDeclarees();
    } catch (err) {
      console.error('Erreur lors de l\'annulation de la justification:', err);
      setError('Erreur lors de l\'annulation de la justification');
    }
  };

  const handleDeleteAbsenceImprevue = deleteAbsenceImprevue;

  return (
    <div className={styles.dashboardContainer}>
      {/* En-tête avec titre et bouton */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        background: '#fff',
        padding: '1.5rem 2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 24px rgba(0, 32, 96, 0.10)'
      }}>
        <div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#0A2540',
            margin: '0 0 0.5rem 0',
            fontFamily: 'Segoe UI, Arial, sans-serif'
          }}>
            Gestion des Absences
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#666',
            margin: 0,
            fontFamily: 'Segoe UI, Arial, sans-serif'
          }}>
            Suivi des absences déclarées et détection des absences non prévues.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '0.875rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(0, 91, 170, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 91, 170, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 91, 170, 0.3)';
          }}
        >
          <PlusCircle size={20} />
          Déclarer une absence
        </button>
      </div>

              {successMessage && (
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            color: '#155724',
            fontSize: '1rem',
            background: '#d4edda',
            borderRadius: '0.5rem',
            border: '1px solid #c3e6cb',
            marginBottom: '1rem'
          }}>
            {successMessage}
          </div>
        )}

        {error && (
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            color: '#721c24',
            fontSize: '1rem',
            background: '#f8d7da',
            borderRadius: '0.5rem',
            border: '1px solid #f5c6cb',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666',
            fontSize: '1.1rem',
            background: '#fff',
            borderRadius: '1rem',
            boxShadow: '0 4px 24px rgba(0, 32, 96, 0.10)'
          }}>
            Chargement...
          </div>
        ) : (
        <>
          {/* Tableau des absences déclarées */}
          <div style={{
            background: '#fff',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 24px rgba(0, 32, 96, 0.10)',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#0A2540',
              marginBottom: '1.5rem',
              fontFamily: 'Segoe UI, Arial, sans-serif'
            }}>
              Absences déclarées
            </h3>

            {/* Filtres */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <input
                type="text"
                placeholder="Filtrer par matricule..."
                value={filtreType}
                onChange={(e) => setFiltreType(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  minWidth: '200px',
                  backgroundColor: 'white',
                  color: '#6b7280'
                }}
              />
                                   <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.9rem', color: '#6b7280', whiteSpace: 'nowrap' }}>Du:</span>
                       <ModernDateTimePicker
                         value={filtreDateDebut}
                         onChange={setFiltreDateDebut}
                         placeholder="JJ/MM/AAAA"
                       />
                       <span style={{ fontSize: '0.9rem', color: '#6b7280', whiteSpace: 'nowrap' }}>Au:</span>
                       <ModernDateTimePicker
                         value={filtreDateFin}
                         onChange={setFiltreDateFin}
                         placeholder="JJ/MM/AAAA"
                       />
                     </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: 'transparent',
                borderRadius: '1rem',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#eaf2fb',
                    borderBottom: '2px solid #e6eaf3'
                  }}>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#003366', fontWeight: '700', fontSize: '1rem' }}>Matricule</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#003366', fontWeight: '700', fontSize: '1rem' }}>Date début</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#003366', fontWeight: '700', fontSize: '1rem' }}>Date fin</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#003366', fontWeight: '700', fontSize: '1rem' }}>Justification</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#003366', fontWeight: '700', fontSize: '1rem' }}>État</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#003366', fontWeight: '700', fontSize: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {absencesFiltrees.length === 0 ? (
                    <tr style={{ borderBottom: '1px solid #e6eaf3', backgroundColor: 'white' }}>
                      <td colSpan={6} style={{ 
                        padding: '2rem', 
                        textAlign: 'center', 
                        color: '#95a5a6', 
                        fontSize: '1rem',
                        fontStyle: 'italic'
                      }}>
                        Aucune absence trouvée
                      </td>
                    </tr>
                  ) : (
                    absencesFiltrees.map((absence) => (
                      <tr key={absence.id_absence} style={{ borderBottom: '1px solid #e6eaf3', backgroundColor: 'white' }}>
                        <td style={{ padding: '0.85rem 1rem', color: '#2a3a4a', fontSize: '1rem' }}>{absence.matricule}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#2a3a4a', fontSize: '1rem' }}>{formatDate(absence.date_debut_abs)}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#2a3a4a', fontSize: '1rem' }}>{formatDate(absence.date_fin_abs)}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#2a3a4a', fontSize: '1rem' }}>
                          {absence.justification ? (
                            <a 
                              href={`http://localhost:8000/media/${absence.justification}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                color: '#005baa', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.25rem',
                                textDecoration: 'none',
                                fontWeight: '500'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                                e.currentTarget.style.color = '#003366';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                                e.currentTarget.style.color = '#005baa';
                              }}
                            >
                              <FileText size={14} />
                              {absence.justification.split('/').pop()}
                            </a>
                          ) : (
                            <span style={{ color: '#95a5a6', fontStyle: 'italic' }}>Aucun fichier</span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            backgroundColor: 
                              absence.etat === 'approuve' ? '#d4edda' :
                              absence.etat === 'refuse' ? '#f8d7da' :
                              absence.etat === 'annule' ? '#fff3cd' :
                              '#e2e3e5',
                            color: 
                              absence.etat === 'approuve' ? '#155724' :
                              absence.etat === 'refuse' ? '#721c24' :
                              absence.etat === 'annule' ? '#856404' :
                              '#6c757d',
                            border: `1px solid ${
                              absence.etat === 'approuve' ? '#c3e6cb' :
                              absence.etat === 'refuse' ? '#f5c6cb' :
                              absence.etat === 'annule' ? '#ffeaa7' :
                              '#d6d8db'
                            }`
                          }}>
                            {absence.etat === 'en_attente' ? 'En attente' :
                             absence.etat === 'approuve' ? 'Approuvé' :
                             absence.etat === 'refuse' ? 'Refusé' :
                             absence.etat === 'annule' ? 'Annulé' :
                             absence.etat || 'Non défini'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleEdit(absence)}
                              style={{
                                background: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
                              title="Modifier"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(absence.id_absence)}
                              style={{
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section Absences Imprévues */}
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '1rem',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <AlertTriangle size={24} color="#dc3545" />
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#2a3a4a',
                  margin: 0
                }}>
                  Absences Imprévues
                </h3>
              </div>
              <button
                onClick={handleAddAbsenceImprevue}
                style={{
                  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                }}
              >
                <PlusCircle size={18} />
                Ajouter une absence imprévue
              </button>
            </div>

            {absencesNonDeclarees.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#6c757d',
                fontSize: '1rem',
                fontStyle: 'italic'
              }}>
                Aucune absence imprévue détectée
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: '#f8f9fa',
                      borderBottom: '2px solid #dee2e6'
                    }}>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#495057', fontWeight: '700', fontSize: '1rem' }}>Matricule</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#495057', fontWeight: '700', fontSize: '1rem' }}>Shift</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#495057', fontWeight: '700', fontSize: '1rem' }}>Date début</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#495057', fontWeight: '700', fontSize: '1rem' }}>Date fin</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#495057', fontWeight: '700', fontSize: '1rem' }}>Justifié</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'left', color: '#495057', fontWeight: '700', fontSize: '1rem' }}>Justification</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#495057', fontWeight: '700', fontSize: '1rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absencesNonDeclarees.map((absence) => (
                      <tr key={absence.id} style={{
                        borderBottom: '1px solid #e9ecef',
                        backgroundColor: 'white'
                      }}>
                        <td style={{ padding: '0.85rem 1rem', color: '#2a3a4a', fontSize: '1rem' }}>{absence.matricule}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#2a3a4a', fontSize: '1rem' }}>{absence.id_shift}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#2a3a4a', fontSize: '1rem' }}>{formatDate(absence.date_debut_abs)}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#2a3a4a', fontSize: '1rem' }}>{formatDate(absence.date_fin_abs)}</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleToggleJustification(absence)}
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: absence.est_justifie ? '#28a745' : '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '1rem',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            {absence.est_justifie ? '✅ Justifié' : '❌ Non justifié'}
                          </button>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#2a3a4a', fontSize: '1rem' }}>
                          {absence.justification ? (
                            <span style={{ 
                              color: '#495057', 
                              fontSize: '0.9rem',
                              fontStyle: 'italic'
                            }}>
                              {absence.justification.length > 50 
                                ? `${absence.justification.substring(0, 50)}...` 
                                : absence.justification
                              }
                            </span>
                          ) : (
                            <span style={{ 
                              color: '#95a5a6', 
                              fontSize: '0.9rem',
                              fontStyle: 'italic' 
                            }}>
                              Aucune justification
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleJustifier(absence)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                              title="Justifier"
                            >
                              Justifier
                            </button>
                            <button
                              onClick={() => handleDeleteAbsenceImprevue(absence.id)}
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal du formulaire */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e6eaf3'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#0A2540',
                margin: 0
              }}>
                {editingAbsence ? 'Modifier l\'absence' : convertingAbsence ? 'Convertir en absence déclarée' : 'Déclarer une absence'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAbsence(null);
                  setConvertingAbsence(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#95a5a6',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#e74c3c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#95a5a6'}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2a3a4a'
                  }}>
                    Matricule *
                  </label>
                  <input
                    type="text"
                    name="matricule"
                    value={formData.matricule}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      color: '#6b7280'
                    }}
                    required
                  />
                </div>



                                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                         <div>
                           <label style={{
                             display: 'block',
                             marginBottom: '0.5rem',
                             fontWeight: '600',
                             color: '#2a3a4a'
                           }}>
                             Date début *
                           </label>
                           <ModernDateTimePicker
                             value={formDateDebut}
                             onChange={setFormDateDebut}
                             placeholder="JJ/MM/AAAA HH:MM"
                             required={true}
                           />
                         </div>
                         <div>
                           <label style={{
                             display: 'block',
                             marginBottom: '0.5rem',
                             fontWeight: '600',
                             color: '#2a3a4a'
                           }}>
                             Date fin *
                           </label>
                           <ModernDateTimePicker
                             value={formDateFin}
                             onChange={setFormDateFin}
                             placeholder="JJ/MM/AAAA HH:MM"
                             required={true}
                             minDate={formDateDebut}
                           />
                         </div>
                       </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2a3a4a'
                  }}>
                    Justification (fichier)
                  </label>
                  {editingAbsence && editingAbsence.justification && (
                    <div style={{
                      marginBottom: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '0.25rem',
                      fontSize: '0.9rem',
                      color: '#6c757d'
                    }}>
                      <strong>Fichier actuel :</strong> {editingAbsence.justification.split('/').pop()}
                      <br />
                      <small>Laissez vide pour conserver le fichier existant</small>
                    </div>
                  )}
                  <input
                    type="file"
                    name="justification"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      color: '#6b7280'
                    }}
                  />
                </div>



                {error && (
                  <div style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #fecaca',
                    fontSize: '0.9rem'
                  }}>
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div style={{
                    background: '#d4edda',
                    color: '#155724',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #c3e6cb',
                    fontSize: '0.9rem'
                  }}>
                    {successMessage}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end',
                  marginTop: '1rem'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingAbsence(null);
                      setConvertingAbsence(null);
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '0.5rem',
                      background: 'white',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '0.5rem',
                      background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}
                  >
                    {editingAbsence ? 'Modifier' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pour ajouter une absence imprévue */}
      {addingAbsenceImprevue && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#2a3a4a',
                margin: 0
              }}>
                Ajouter une absence imprévue
              </h2>
              <button
                onClick={() => setAddingAbsenceImprevue(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#95a5a6',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#e74c3c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#95a5a6'}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitAbsenceImprevue}>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2a3a4a'
                  }}>
                    Matricule *
                  </label>
                  <input
                    type="text"
                    name="matricule"
                    value={absenceImprevueData.matricule}
                    onChange={handleAbsenceImprevueInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      color: '#6b7280'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2a3a4a'
                  }}>
                    ID Shift *
                  </label>
                  <input
                    type="number"
                    name="id_shift"
                    value={absenceImprevueData.id_shift}
                    onChange={handleAbsenceImprevueInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      color: '#6b7280'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '600',
                      color: '#2a3a4a'
                    }}>
                      Date début *
                    </label>
                    <ModernDateTimePicker
                      value={absenceImprevueDateDebut}
                      onChange={setAbsenceImprevueDateDebut}
                      placeholder="JJ/MM/AAAA HH:MM"
                      required={true}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '600',
                      color: '#2a3a4a'
                    }}>
                      Date fin *
                    </label>
                    <ModernDateTimePicker
                      value={absenceImprevueDateFin}
                      onChange={setAbsenceImprevueDateFin}
                      placeholder="JJ/MM/AAAA HH:MM"
                      required={true}
                      minDate={absenceImprevueDateDebut}
                    />
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #fecaca',
                    fontSize: '0.9rem'
                  }}>
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div style={{
                    background: '#d4edda',
                    color: '#155724',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #c3e6cb',
                    fontSize: '0.9rem'
                  }}>
                    {successMessage}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end',
                  marginTop: '1rem'
                }}>
                  <button
                    type="button"
                    onClick={() => setAddingAbsenceImprevue(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '0.5rem',
                      background: 'white',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '0.5rem',
                      background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de justification */}
      {showJustificationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e6eaf3'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#0A2540',
                margin: 0
              }}>
                Justifier l'absence
              </h2>
              <button
                onClick={() => setShowJustificationModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#95a5a6',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#e74c3c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#95a5a6'}
              >
                <X size={20} />
              </button>
            </div>

            <textarea
              value={justificationText}
              onChange={(e) => setJustificationText(e.target.value)}
              placeholder="Écrivez votre justification ici..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: 'white',
                color: '#6b7280',
                height: '150px',
                marginBottom: '1rem'
              }}
              required
            />

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              marginTop: '1rem'
            }}>
              <button
                onClick={handleSubmitJustification}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(135deg, #005baa 0%, #003366 100%)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Valider
              </button>
              <button
                onClick={handleAnnulerJustification}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant Navires Prévisionnels
const NaviresSection = () => {
  const [navires, setNavires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [filtreType, setFiltreType] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");

  useEffect(() => {
    loadNavires();
  }, []);

  const loadNavires = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des navires depuis CSV...');
      
      // Charger depuis le CSV
      const csvResponse = await fetch('http://localhost:8000/api/navires-previsionnels/csv_data/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Réponse CSV status:', csvResponse.status);
      
      if (csvResponse.ok) {
        const csvData = await csvResponse.json();
        console.log('📄 Données CSV reçues:', csvData);
        
        if (csvData.success && csvData.data && csvData.data.length > 0) {
          // Convertir les données CSV au format attendu par le frontend
          const formattedData = csvData.data.map((navire: any) => ({
            id: Math.random(), // ID temporaire
            nom: navire.nom,
            type: navire.type,
            statut: navire.statut,
            date_arrivee: navire.date,
            heure_arrivee: navire.heure,
            port: navire.port,
            consignataire: navire.consignataire,
            operateur: navire.operateur
          }));
          
                      setNavires(formattedData);
            setLastUpdate(new Date().toLocaleString('fr-FR'));
            console.log('✅ Navires chargés depuis CSV:', formattedData);
            console.log('📊 Nombre de navires reçus:', formattedData.length);
            console.log('📋 Détail des premiers navires:', formattedData.slice(0, 5));
          return;
        } else {
          console.warn('⚠️ CSV vide ou invalide:', csvData);
          setError('Aucun navire trouvé dans le fichier CSV');
          setNavires([]);
          setLastUpdate(new Date().toLocaleString('fr-FR'));
          return;
        }
      } else {
        console.error('❌ Erreur lors du chargement du CSV:', csvResponse.status, csvResponse.statusText);
        setError(`Erreur lors du chargement du fichier CSV: ${csvResponse.status}`);
        setNavires([]);
        setLastUpdate(new Date().toLocaleString('fr-FR'));
        return;
      }
      
      // Suppression de la logique de chargement depuis la DB - utilisation uniquement du CSV
    } catch (err) {
      console.error('❌ Erreur lors du chargement des navires:', err);
      setError(`Erreur lors du chargement des navires: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      setNavires([]);
      setLastUpdate(new Date().toLocaleString('fr-FR'));
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const statistiques = {
    total: navires.length,
    prevus: navires.filter(n => (n.statut || n.situation || '').toLowerCase().includes('prev')).length,
    enQuai: navires.filter(n => (n.statut || n.situation || '').toLowerCase().includes('quai')).length,
    enRade: navires.filter(n => (n.statut || n.situation || '').toLowerCase().includes('rade')).length,
    appareillage: navires.filter(n => (n.statut || n.situation || '').toLowerCase().includes('appareillage') || (n.statut || n.situation || '').toLowerCase().includes('départ')).length,
  };

  // Extraire les types de navires uniques
  const typesNavires = [...new Set(navires.map(n => n.type || n.type_navire || n.Type || n.TypeNavire).filter(Boolean))] as string[];
  
  // Extraire les statuts uniques
  const statutsUniques = [...new Set(navires.map(n => n.statut || n.situation || n.Situation).filter(Boolean))] as string[];

  // Filtrer les navires
  console.log('🔍 Navires avant filtrage:', navires.length);
  console.log('🔍 Premiers navires:', navires.slice(0, 5));
  
  const naviresFiltres = navires.filter(navire => {
    const matchType = !filtreType || (navire.type || navire.type_navire || navire.Type || navire.TypeNavire || '') === filtreType;
    const matchStatut = !filtreStatut || (navire.statut || navire.situation || navire.Situation || '') === filtreStatut;
    
    if (!matchType || !matchStatut) {
      console.log('❌ Navire filtré:', {
        nom: navire.nom,
        type: navire.type || navire.type_navire || navire.Type || navire.TypeNavire,
        statut: navire.statut || navire.situation || navire.Situation,
        filtreType,
        filtreStatut,
        matchType,
        matchStatut
      });
    }
    
    return matchType && matchStatut;
  });
  
  console.log('✅ Navires après filtrage:', naviresFiltres.length);
  console.log('✅ Premiers navires filtrés:', naviresFiltres.slice(0, 5));

  const updateNavires = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Déclenchement de la mise à jour des navires...');
      
      const response = await fetch('http://localhost:8000/api/navires-previsionnels/update_navires/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('Mise à jour réussie:', result);
      
      // Attendre un peu puis recharger les données
      setTimeout(async () => {
        await loadNavires();
      }, 3000);
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour des navires:', err);
      setError('Erreur lors de la mise à jour des navires. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  const clearNavires = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Suppression de toutes les données...');
      
      const response = await fetch('http://localhost:8000/api/navires-previsionnels/clear_navires/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('Suppression réussie:', result);
      
      // Recharger les données après suppression
      await loadNavires();
      
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression des données.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Non spécifié';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        console.warn('⚠️ Format de date invalide:', dateStr);
        return dateStr;
      }
      return d.toLocaleDateString('fr-FR');
    } catch (error) {
      console.warn('⚠️ Erreur formatage date:', dateStr, error);
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'Non spécifié';
    try {
      // Nettoyer la chaîne en supprimant les deux-points en trop
      let cleanTimeStr = timeStr.toString().trim();
      
      // Supprimer les deux-points en fin de chaîne
      cleanTimeStr = cleanTimeStr.replace(/:+$/, '');
      
      // Si c'est déjà au format HH:MM
      if (cleanTimeStr.includes(':')) {
        const parts = cleanTimeStr.split(':');
        if (parts.length >= 2) {
          const hours = parts[0].padStart(2, '0');
          const minutes = parts[1].padStart(2, '0');
          return `${hours}:${minutes}`;
        }
      }
      
      // Si c'est un objet Date
      if (typeof timeStr === 'object' && timeStr !== null && 'toTimeString' in timeStr) {
        return (timeStr as Date).toTimeString().substring(0, 5);
      }
      
      // Sinon, essayer de parser
      const d = new Date(`2000-01-01T${cleanTimeStr}`);
      if (!isNaN(d.getTime())) {
        return d.toTimeString().substring(0, 5);
      }
      
      return cleanTimeStr;
    } catch (error) {
      console.warn('⚠️ Erreur formatage heure:', timeStr, error);
      return timeStr.toString().replace(/:+$/, '');
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* En-tête moderne avec titre et boutons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        padding: '1.25rem 1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 2px 8px rgba(0, 32, 96, 0.08)',
        border: '1px solid rgba(0, 91, 170, 0.1)'
      }}>
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1e293b',
            margin: '0 0 0.25rem 0',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            Navires Prévisionnels - Port d'Agadir
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            margin: 0,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>Données extraites du site officiel de l'ANP</span>
            {lastUpdate && (
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#94a3b8',
                padding: '0.25rem 0.5rem',
                background: 'rgba(0, 91, 170, 0.05)',
                borderRadius: '0.375rem',
                border: '1px solid rgba(0, 91, 170, 0.1)'
              }}>
                Dernière mise à jour : {lastUpdate}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={updateNavires}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.15s ease',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
              }
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Actualisation...' : 'Actualiser'}
          </button>
          
          <button
            onClick={clearNavires}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.15s ease',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
              }
            }}
          >
            <Trash2 size={16} />
            Vider données
          </button>
        </div>
      </div>

      {/* Cartes de statistiques - Palette bleue harmonieuse */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        {/* Carte Total Navires - Bleu foncé */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          padding: '1rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.2s ease',
          minHeight: '100px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.filter = 'brightness(110%)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.filter = 'brightness(100%)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
            {statistiques.total}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'Inter, sans-serif' }}>Total Navires</div>
        </div>

        {/* Carte Prévus - Bleu classique */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
          color: 'white',
          padding: '1rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.2s ease',
          minHeight: '100px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.filter = 'brightness(110%)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.filter = 'brightness(100%)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
            {statistiques.prevus}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'Inter, sans-serif' }}>Prévus</div>
        </div>

        {/* Carte En Quai - Bleu moyen */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          color: 'white',
          padding: '1rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.2s ease',
          minHeight: '100px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.filter = 'brightness(110%)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.filter = 'brightness(100%)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
            {statistiques.enQuai}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'Inter, sans-serif' }}>En Quai</div>
        </div>

        {/* Carte En Rade - Bleu ciel doux */}
        <div style={{
          background: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)',
          color: 'white',
          padding: '1rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.2s ease',
          minHeight: '100px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.filter = 'brightness(110%)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.filter = 'brightness(100%)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
            {statistiques.enRade}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'Inter, sans-serif' }}>En Rade</div>
        </div>

        {/* Carte Appareillage - Bleu très clair */}
        <div style={{
          background: 'linear-gradient(135deg, #bfdbfe 0%, #dbeafe 100%)',
          color: '#1f2937',
          padding: '1rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          textAlign: 'center',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          transition: 'all 0.2s ease',
          minHeight: '100px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.filter = 'brightness(110%)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.filter = 'brightness(100%)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
            {statistiques.appareillage}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, fontFamily: 'Inter, sans-serif' }}>Appareillage</div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 24px rgba(0, 32, 96, 0.10)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#0A2540',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Filtres de recherche
          </h3>
          {(filtreType || filtreStatut) && (
            <button
              onClick={() => {
                setFiltreType("");
                setFiltreStatut("");
              }}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
              Effacer tous les filtres
            </button>
          )}
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Filtre par type de navire */}
          <div>
                        <label style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.75rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Type de navire
            </label>
            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                backgroundColor: '#fff',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }}
            >
              <option value="">Tous les types de navires</option>
              {typesNavires.sort().map((type, index) => (
                <option key={index} value={type}>
                  {type} ({navires.filter(n => (n.type || n.type_navire || n.Type || n.TypeNavire || '') === type).length})
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par situation */}
          <div>
                        <label style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.75rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Situation du navire
            </label>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                backgroundColor: '#fff',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
              }}
            >
              <option value="">Toutes les situations</option>
              {statutsUniques.sort().map((statut, index) => (
                <option key={index} value={statut}>
                  {statut} ({navires.filter(n => (n.statut || n.situation || n.Situation || '') === statut).length})
                </option>
              ))}
            </select>
          </div>


        </div>
        
        {/* Indicateur de filtres actifs */}
        {(filtreType || filtreStatut) && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            borderRadius: '0.5rem',
            border: '1px solid #93c5fd'
          }}>
                        <div style={{
              fontSize: '0.9rem',
              color: '#1e40af',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Filtres actifs :
              {filtreType && (
                <span style={{ marginLeft: '0.5rem', background: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}>
                  Type: {filtreType}
                </span>
              )}
              {filtreStatut && (
                <span style={{ marginLeft: '0.5rem', background: '#3b82f6', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}>
                  Situation: {filtreStatut}
                </span>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div style={{
          background: '#fef2f2',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #fecaca',
          fontSize: '0.9rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Tableau des navires */}
      <div style={{
        background: '#fff',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 24px rgba(0, 32, 96, 0.10)'
      }}>
        {loading ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#6c757d',
            fontSize: '1.1rem'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <RefreshCw size={40} className="animate-spin" style={{ color: '#005baa' }} />
            </div>
            Données en cours de chargement...
          </div>
        ) : naviresFiltres.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#6c757d',
            fontSize: '1.1rem',
            fontStyle: 'italic'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <AlertTriangle size={40} style={{ color: '#f59e0b' }} />
            </div>
            {navires.length === 0 ? (
              <>
                Aucun navire prévisionnel trouvé pour le port d'Agadir
                <br />
                <small style={{ fontSize: '0.9rem', marginTop: '0.5rem', display: 'block' }}>
                  Cliquez sur "Actualiser" pour récupérer les dernières données
                </small>
              </>
            ) : (
              <>
                Aucun navire ne correspond aux filtres sélectionnés
                <br />
                <small style={{ fontSize: '0.9rem', marginTop: '0.5rem', display: 'block' }}>
                  {navires.length} navire(s) disponible(s) au total
                </small>
              </>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* Indicateur de résultats */}
            <div style={{
              padding: '1rem 0',
              borderBottom: '1px solid #e6eaf3',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '0.9rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                {naviresFiltres.length} navire(s) affiché(s) sur {navires.length} total
              </span>

            </div>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'transparent',
              borderRadius: '1rem',
              overflow: 'hidden',
              fontSize: '0.75rem'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#eaf2fb',
                  borderBottom: '2px solid #e6eaf3'
                }}>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: '#003366', fontWeight: '700', fontSize: '0.75rem', minWidth: '120px' }}>Nom du navire</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: '#003366', fontWeight: '700', fontSize: '0.75rem', minWidth: '100px' }}>Type Navire</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: '#003366', fontWeight: '700', fontSize: '0.75rem', minWidth: '120px' }}>Situation</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: '#003366', fontWeight: '700', fontSize: '0.75rem', minWidth: '80px' }}>Date</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: '#003366', fontWeight: '700', fontSize: '0.75rem', minWidth: '100px' }}>Heure</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: '#003366', fontWeight: '700', fontSize: '0.75rem', minWidth: '120px' }}>Provenance</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: '#003366', fontWeight: '700', fontSize: '0.75rem', minWidth: '150px' }}>Consignataire</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: '#003366', fontWeight: '700', fontSize: '0.75rem', minWidth: '120px' }}>Opérateur</th>
                </tr>
              </thead>
              <tbody>
                {naviresFiltres.map((navire, index) => (
                  <tr key={navire.id || index} style={{ borderBottom: '1px solid #e6eaf3', backgroundColor: 'white' }}>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#2a3a4a', fontSize: '0.75rem', fontWeight: '600', wordBreak: 'break-word' }}>
                      {navire.nom || navire.nom_navire || navire.Navire || navire.Nom || 'Non spécifié'}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#2a3a4a', fontSize: '0.75rem', wordBreak: 'break-word' }}>
                      {navire.type || navire.type_navire || navire.Type || navire.TypeNavire || 'Non spécifié'}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', wordBreak: 'break-word' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        display: 'inline-block',
                        maxWidth: '100%',
                        wordBreak: 'break-word',
                        backgroundColor: 
                          (navire.statut || navire.situation || navire.Situation || '').toLowerCase().includes('arrivée') ? '#d4edda' :
                          (navire.statut || navire.situation || navire.Situation || '').toLowerCase().includes('départ') ? '#f8d7da' :
                          (navire.statut || navire.situation || navire.Situation || '').toLowerCase().includes('transit') ? '#fff3cd' :
                          '#e2e3e5',
                        color: 
                          (navire.statut || navire.situation || navire.Situation || '').toLowerCase().includes('arrivée') ? '#155724' :
                          (navire.statut || navire.situation || navire.Situation || '').toLowerCase().includes('départ') ? '#721c24' :
                          (navire.statut || navire.situation || navire.Situation || '').toLowerCase().includes('transit') ? '#856404' :
                          '#6c757d',
                        border: `1px solid ${
                          (navire.statut || navire.situation || navire.Situation || '').toLowerCase().includes('arrivée') ? '#c3e6cb' :
                          (navire.statut || navire.situation || navire.Situation || '').toLowerCase().includes('départ') ? '#f5c6cb' :
                          (navire.statut || navire.situation || navire.Situation || '').toLowerCase().includes('transit') ? '#ffeaa7' :
                          '#d6d8db'
                        }`
                      }}>
                        {navire.statut || navire.situation || navire.Situation || 'Non spécifié'}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#2a3a4a', fontSize: '0.75rem' }}>
                      {formatDate(navire.date_arrivee || navire.date || navire.Date)}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#2a3a4a', fontSize: '0.75rem', wordBreak: 'break-word', minWidth: '100px' }}>
                      {formatTime(navire.heure_arrivee || navire.heure || navire.Heure || navire.Time)}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#2a3a4a', fontSize: '0.75rem', wordBreak: 'break-word' }}>
                      {navire.port || navire.provenance || navire.Provenance || navire.Origin || 'Non spécifié'}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#2a3a4a', fontSize: '0.75rem', wordBreak: 'break-word' }}>
                      {navire.consignataire || navire.Consignataire || navire.Consignee || 'Non spécifié'}
                    </td>
                    <td style={{ padding: '0.6rem 0.8rem', color: '#2a3a4a', fontSize: '0.75rem', wordBreak: 'break-word' }}>
                      {navire.operateur || navire.operateur_manutention || navire.Operateur || navire.Operator || 'Non spécifié'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant Affectations (placeholder - sera remplacé par le vrai composant)
const AffectationsSection = () => (
      <div className={styles.dashboardContainer}>
      <h1 className={styles.title}>Gestion des Affectations</h1>
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.9)', 
      borderRadius: '1rem', 
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0, 32, 96, 0.1)',
      border: '1px solid rgba(0, 91, 170, 0.08)'
    }}>
      <p style={{ fontSize: '1.1rem', color: '#1A1A1A' }}>
        Section Affectations - Tableau et génération automatique à venir...
      </p>
    </div>
  </div>
);

// Composant principal
const ChefEscaleDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState("accueil");

  const renderContent = () => {
    switch (activeSection) {
      case "accueil":
        return <AccueilChefEscale />;
      case "engins":
        return <EnginsSection />;
      case "absences":
        return <AbsencesSection />;
      case "navires":
        return <NaviresSection />;
      case "affectations":
        return <AffectationsSection />;
      default:
        return <AccueilChefEscale />;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
      <NavigationContext.Provider value={{ activeSection, setActiveSection }}>
        <ChefEscaleLayout>
          {renderContent()}
        </ChefEscaleLayout>
      </NavigationContext.Provider>
    </LocalizationProvider>
  );
};

export default ChefEscaleDashboard;