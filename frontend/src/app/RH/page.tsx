"use client";
import React, { useState, useEffect } from 'react';
import { FaUsers, FaShip, FaUserTie, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import RHLayout from './RHLayout';
import styles from './rh-dashboard.module.css';
import ProtectedRoute from '../../components/ProtectedRoute';

interface DashboardStats {
  totalConducteurs: number;
  totalDockers: number;
  totalChefsEscale: number;
  absencesEnAttente: number;
  alertesAujourdhui: number;
}

export default function RHHome() {
  const [stats, setStats] = useState<DashboardStats>({
    totalConducteurs: 0,
    totalDockers: 0,
    totalChefsEscale: 0,
    absencesEnAttente: 0,
    alertesAujourdhui: 0
  });
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:8000/api";

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        // Récupérer les statistiques des conducteurs
        const conducteursResponse = await fetch(`${API_URL}/conducteurs/liste/`);
        const conducteursData = await conducteursResponse.json();
        
        // Récupérer les statistiques des dockers
        const dockersResponse = await fetch(`${API_URL}/dockers/liste/`);
        const dockersData = await dockersResponse.json();
        
        // Récupérer les statistiques des chefs d'escale
        const chefsResponse = await fetch(`${API_URL}/chef-escale/stats/`);
        const chefsData = await chefsResponse.json();
        
        // Récupérer les absences en attente
        const absencesResponse = await fetch(`${API_URL}/absences/`);
        const absencesData = await absencesResponse.json();
        
        // Récupérer les alertes du jour
        const alertesConducteursResponse = await fetch(`${API_URL}/alertes/conducteurs/`);
        const alertesDockersResponse = await fetch(`${API_URL}/alertes/dockers/`);
        const alertesConducteursData = await alertesConducteursResponse.json();
        const alertesDockersData = await alertesDockersResponse.json();
        
        setStats({
          totalConducteurs: conducteursData.length || 0,
          totalDockers: dockersData.length || 0,
          totalChefsEscale: chefsData.total_chefs || 0,
          absencesEnAttente: absencesData.filter((abs: any) => abs.etat === 'en attente').length || 0,
          alertesAujourdhui: (alertesConducteursData.alertes?.length || 0) + (alertesDockersData.alertes?.length || 0)
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <RHLayout>
        <div className={styles.dashboardContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Chargement du tableau de bord...</p>
          </div>
        </div>
      </RHLayout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'RH']}>
      <RHLayout>
        <div className={styles.dashboardContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              <span style={{ color: '#005baa', fontWeight: 700 }}>RH</span> Dashboard
            </h1>
            <p className={styles.subtitle}>
              Vue d'ensemble de vos ressources humaines
            </p>
          </div>

          <div className={styles.cardsGrid}>
            {/* Carte 1: Conducteurs */}
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <FaUsers />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Conducteurs</h3>
                <p className={styles.cardNumber}>{stats.totalConducteurs}</p>
                <p className={styles.cardLabel}>enregistrés</p>
              </div>
            </div>

            {/* Carte 2: Dockers */}
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <FaShip />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Dockers</h3>
                <p className={styles.cardNumber}>{stats.totalDockers}</p>
                <p className={styles.cardLabel}>enregistrés</p>
              </div>
            </div>

            {/* Carte 3: Chefs d'escale */}
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <FaUserTie />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Chefs d'escale</h3>
                <p className={styles.cardNumber}>{stats.totalChefsEscale}</p>
                <p className={styles.cardLabel}>enregistrés</p>
              </div>
            </div>

            {/* Carte 4: Absences en attente */}
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <FaClock />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Absences</h3>
                <p className={styles.cardNumber}>{stats.absencesEnAttente}</p>
                <p className={styles.cardLabel}>en attente</p>
              </div>
            </div>

            {/* Carte 5: Alertes du jour */}
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <FaExclamationTriangle />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Alertes</h3>
                <p className={styles.cardNumber}>{stats.alertesAujourdhui}</p>
                <p className={styles.cardLabel}>aujourd'hui</p>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Utilisez la navigation à gauche pour accéder aux fonctionnalités détaillées
            </p>
          </div>
        </div>
      </RHLayout>
    </ProtectedRoute>
  );
} 