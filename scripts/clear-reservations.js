// Script pour supprimer toutes les réservations des élèves
// Exécuter dans la console du navigateur (F12) sur http://localhost:5173

(async function clearStudentReservations() {
  // Importer Dexie si nécessaire
  const { db } = await import('/src/db/db.ts');
  
  // Compter les réservations avant suppression
  const count = await db.reservations.count();
  console.log(`📋 Nombre de réservations avant suppression: ${count}`);
  
  if (count === 0) {
    console.log('✅ Aucune réservation à supprimer');
    return;
  }
  
  // Supprimer toutes les réservations
  await db.reservations.clear();
  
  // Vérifier après suppression
  const remaining = await db.reservations.count();
  console.log(`✅ Toutes les réservations ont été supprimées !`);
  console.log(`📊 Réservations restantes: ${remaining}`);
})();
