import express from 'express';
import dotenv from 'dotenv'
dotenv.config()
import grades from './routes/grades.js'

const PORT = process.env.PORT || 3000
const app = express()


app.use(express.json());

app.use("/grades", grades)

app.get("/", (req, res) => {
    res.send('Hello World!')
})


// Global error handling
app.use((err, _req, res, next) => {
    res.status(500).send("Seems like we messed up somewhere...");
  });

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})