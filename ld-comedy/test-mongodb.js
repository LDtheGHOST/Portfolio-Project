const { MongoClient } = require('mongodb');

async function testConnection() {
  try {
    const uri = process.env.DATABASE_URL;
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    console.log('Connexion à MongoDB réussie');
    
    const db = client.db('ld_comedy');
    const testCollection = db.collection('test');
    
    // Essayons d'insérer un document de test
    const result = await testCollection.insertOne({
      name: 'Test Document',
      timestamp: new Date()
    });
    
    console.log('Document inséré avec succès:', result.insertedId);
    
    // Essayons de lire le document
    const insertedDoc = await testCollection.findOne({ _id: result.insertedId });
    console.log('Document lu:', insertedDoc);
    
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
}

testConnection();
