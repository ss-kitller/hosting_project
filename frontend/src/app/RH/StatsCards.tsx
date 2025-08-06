'use client';
import React, { useEffect, useState } from 'react';

interface StatsData {
  total: number;
  presents: number;
  absents: number;
}

interface StatsCardsProps {
  type: 'conducteurs' | 'dockers';
}

export default function StatsCards({ type }: StatsCardsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoint = type === 'conducteurs' 
          ? 'http://localhost:8000/api/stats/conducteurs/presence/'
          : 'http://localhost:8000/api/stats/dockers/presence/';
        
        const response = await fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des statistiques');
        }

        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setLoading(false);
      }
    };

    fetchStats();
  }, [type]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          flex: '1',
          minWidth: '200px',
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #cfd8dc',
          textAlign: 'center',
          color: '#666'
        }}>
          Chargement...
        </div>
        <div style={{
          flex: '1',
          minWidth: '200px',
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #cfd8dc',
          textAlign: 'center',
          color: '#666'
        }}>
          Chargement...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: '#ffebee',
        color: '#c62828',
        padding: '12px 16px',
        borderRadius: '6px',
        marginBottom: '20px',
        border: '1px solid #ffcdd2'
      }}>
        Erreur: {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
      flexWrap: 'wrap'
    }}>
      {/* Carte des présents */}
      <div style={{
        flex: '1',
        minWidth: '200px',
        background: '#e8f5e8',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #c8e6c9',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#4caf50'
          }} />
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#2e7d32'
          }}>
            Présents aujourd'hui
          </h3>
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#2e7d32',
          marginBottom: '4px'
        }}>
          {stats.presents}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#388e3c',
          opacity: 0.8
        }}>
          sur {stats.total} {type === 'conducteurs' ? 'conducteurs' : 'dockers'}
        </div>
      </div>

      {/* Carte des absents */}
      <div style={{
        flex: '1',
        minWidth: '200px',
        background: '#fff3e0',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #ffcc80',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#ff9800'
          }} />
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#e65100'
          }}>
            Absents aujourd'hui
          </h3>
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#e65100',
          marginBottom: '4px'
        }}>
          {stats.absents}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#f57c00',
          opacity: 0.8
        }}>
          sur {stats.total} {type === 'conducteurs' ? 'conducteurs' : 'dockers'}
        </div>
      </div>
    </div>
  );
} 