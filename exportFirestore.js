const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportFirestoreToJSON() {
  const collections = await db.listCollections();
  const result = {};

  for (const collection of collections) {
    const colName = collection.id;
    result[colName] = {};

    const snapshot = await collection.get();
    snapshot.forEach(doc => {
      result[colName][doc.id] = doc.data();
    });
  }

  fs.writeFileSync("firestore_export.json", JSON.stringify(result, null, 2));
  console.log("✅ Exported Firestore to 'firestore_export.json'");
}

exportFirestoreToJSON();
