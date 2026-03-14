// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { seedDatabase } from './utils/seed';
import { updateCompletedReservations } from './utils/reservationUtils';
import './index.css';

// Initialize database with seed data and update completed reservations
Promise.all([
  seedDatabase(),
  updateCompletedReservations(),
])
  .then(([_, updatedCount]) => {
    console.log('Database initialized');
    if (updatedCount > 0) {
      console.log(`${updatedCount} réservation(s) marquée(s) comme terminée(s)`);
    }
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  })
  .finally(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
