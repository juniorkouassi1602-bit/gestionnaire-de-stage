
// Route API pour envoyer les données au format JSON vers le profil HTML
app.get('/api/profil-actuel', async (req, res) => {
  try {
    // Plus tard, tu utiliseras les sessions pour trouver le bon étudiant (ex: req.session.email)
    // Pour tester tout de suite, on récupère le dernier inscrit :
    const [rows] = await db.query("SELECT * FROM etudiant ORDER BY id_etudiant DESC LIMIT 1");
    
    if (rows.length > 0) {
      res.json(rows[0]); // On envoie la ligne SQL de l'étudiant au format JSON
    } else {
      res.status(404).json({ message: "Aucun étudiant trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});