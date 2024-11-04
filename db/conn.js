import {MongoClient} from 'mongodb'
import 'dotenv/config'
const connectionString = process.env.ATLAS_URI


const client = new MongoClient(connectionString)

let conn;
try {
    conn = await client.connect()
    console.log("connected to mongoDB")

    let db = conn.db("sample_training");
    let collection = db.collection("grades");
    await collection.createIndex({ class_id: 1 });
    await collection.createIndex({ learner_id: 1 });
    await collection.createIndex({ learner_id: 1, class_id: 1 });
  
    await db.command({
      collMod: 'grades',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['class_id', 'learner_id'],
          properties: {
            class_id: {
              bsonType: 'int',
              minimum: 0,
              maximum: 300,
              description: 'must be an integer in [0, 300] and is required'
            },
            learner_id: {
              bsonType: 'int',
              minimum: 0,
              description: 'must be an integer greater than or equal to 0 and is required'
            }
          }
        }
      },
      validationAction: 'warn'
    });
    
} catch (err) {
    console.log(err)
}
let db = await conn.db("sample_training")

export default db



