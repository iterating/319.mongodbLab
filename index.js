import express from "express";
import "dotenv/config";
import grades from './routes/grades.js';
import grades_agg from "./routes/grades_agg.js";
import learnerSchema from "./models/Learner.js";
import db from "./db/conn.js";

const PORT = process.env.PORT || 3000
const app = express();

// Body parser middleware
app.use(express.json())

//Indexes
const createIndexes = async () => {
	try {
		await db.collection('grades').createIndex({ class_id: 1 });

		await db.collection('grades').createIndex({ learner_id: 1 });

		await db.collection('grades').createIndex({ learner_id: 1, class_id: 1 });

		console.log('Indexes created successfully');
	} catch (error) {
		console.error('Error creating indexes:', error);
	}
};

//Validation
db.collection('grades', {
	validator: {
		$jsonSchema: {
			bsonType: 'object',
			required: ['class_id', 'learner_id'],
			properties: {
				class_id: {
					bsonType: 'int',
					minimum: 0,
					maximum: 300,
					description: 'class_id must be an integer between 0 and 300'
				},
				learner_id: {
					bsonType: 'int',
					minimum: 0,
					description: 'learner_id must be an integer greater than or equal to 0'
				}
			}
		}
	},
	validationAction: 'warn'
});
// test db connection
// import "./db/conn.js"

app.get("/", (req, res) => {
  res.send("Welcome to the API")
})

app.use("/grades", grades)
app.use("/grades", grades_agg);



//Global Error handling middlware
app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).send("Seems like we messed up somewhere...")
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`)
})