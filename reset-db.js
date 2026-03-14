/**
 * Script de réinitialisation de la base de données
 * 
 * À exécuter dans la console du navigateur (F12)
 * sur la page http://localhost:5173
 * 
 * Usage:
 * 1. Ouvrir la console (F12)
 * 2. Copier-coller ce script
 * 3. Appuyer sur Entrée
 */

(async function resetKiteSurfDB() {
  console.log('🔄 Démarrage de la réinitialisation...');
  
  try {
    // Étape 1: Supprimer la base de données
    console.log('🗑️ Suppression de la base de données...');
    
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('KiteSurfSchoolDB');
      
      request.onsuccess = () => {
        console.log('✅ Base de données supprimée');
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('❌ Erreur:', event.target.error);
        reject(event.target.error);
      };
      
      request.onblocked = () => {
        console.error('⚠️ Base de données verrouillée');
        reject(new Error('Fermez tous les onglets et réessayez'));
      };
    });
    
    // Étape 2: Recharger la page pour que le seed se fasse automatiquement
    console.log('📥 Rechargement de la page...');
    console.log('💡 Les données de seed seront rechargées automatiquement');
    console.log('');
    console.log('📚 Comptes de test disponibles:');
    console.log('   Admin:     admin@kiteschool.com / admin123');
    console.log('   Moniteur:  instructor@kiteschool.com / instructor123');
    console.log('   Étudiant:  student@kiteschool.com / student123');
    console.log('   Étudiant 2: student2@kiteschool.com / student123');
    console.log('');
    console.log('✅ Réinitialisation terminée !');
    
    // Rechargement automatique après 2 secondes
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error.message);
  }
})();
