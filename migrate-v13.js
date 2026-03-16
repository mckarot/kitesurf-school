// Script à exécuter dans la console du navigateur pour migrer la DB
// Ouvre https://kitesurf-school.vercel.app (ou localhost:5173)
// Puis F12 > Console et colle ce script :

(async function migrateToV13() {
  console.log('🔄 Démarrage migration vers v13...');
  
  const request = indexedDB.open('KiteSurfSchoolDB');
  
  request.onerror = () => {
    console.error('❌ Erreur ouverture DB:', request.error);
  };
  
  request.onsuccess = () => {
    const db = request.result;
    const currentVersion = db.version;
    console.log('📊 Version actuelle:', currentVersion);
    
    // Vérifier si les tables existent
    const tables = Array.from(db.objectStoreNames);
    console.log('📋 Tables existantes:', tables);
    
    const hasUserWallets = tables.includes('userWallets');
    const hasCoursePricing = tables.includes('coursePricing');
    
    if (hasUserWallets && hasCoursePricing) {
      console.log('✅ Les tables v13 existent déjà !');
      return;
    }
    
    console.log('⚠️ Tables manquantes detected. Fermeture DB...');
    db.close();
    
    // Supprimer et recréer
    console.log('🗑️ Suppression ancienne DB...');
    const deleteRequest = indexedDB.deleteDatabase('KiteSurfSchoolDB');
    
    deleteRequest.onsuccess = () => {
      console.log('✅ DB supprimée. Rechargez la page pour recréer avec v13.');
      alert('Base de données supprimée. Rechargez la page (F5) pour initialiser la v13 avec les tables userWallets et coursePricing.');
    };
    
    deleteRequest.onerror = () => {
      console.error('❌ Erreur suppression DB:', deleteRequest.error);
    };
  };
})();
