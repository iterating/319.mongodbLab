import express from "express";
import db from "../db/conn.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Create a single grade entry
router.post("/", async (req, res) => {
  try {
    let collection = await db.collection("grades");
    let newDocument = req.body;

    // rename fields for backwards compatibility
    if (newDocument.student_id) {
      newDocument.learner_id = newDocument.student_id;
      delete newDocument.student_id;
    }

    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating grade entry");
  }
});

// Get a single grade entry
router.get("/:id", async (req, res) => {
  try {
    let collection = await db.collection("grades");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting grade entry");
  }
});

// Add a score to a grade entry
router.patch("/:id/add", async (req, res) => {
  try {
    let collection = await db.collection("grades");
    let query = { _id: new ObjectId(req.params.id) };

    let result = await collection.updateOne(query, {
      $push: { scores: req.body },
    });

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding score to grade entry");
  }
});

// Remove a score from a grade entry
router.patch("/:id/remove", async (req, res) => {
  try {
    let collection = await db.collection("grades");
    let query = { _id: new ObjectId(req.params.id) };

    let result = await collection.updateOne(query, {
      $pull: { scores: req.body },
    });

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error removing score from grade entry");
  }
});

// Delete a single grade entry
router.delete("/:id", async (req, res) => {
  try {
    let collection = await db.collection("grades");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.deleteOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting grade entry");
  }
});

// Get route for backwards compatibility
router.get("/student/:id", async (req, res) => {
  try {
    res.redirect(`learner/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error redirecting to learner route");
  }
});

// Get a learner's grade data
router.get("/learner/:id", async (req, res) => {
  try {
    let collection = await db.collection("grades");
    let query = { learner_id: Number(req.params.id) };

    // Check for class_id parameter
    if (req.query.class) query.class_id = Number(req.query.class);

    let result = await collection.find(query).toArray();

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting learner's grade data");
  }
});

// Delete a learner's grade data
router.delete("/learner/:id", async (req, res) => {
  try {
    let collection = await db.collection("grades");
    let query = { learner_id: Number(req.params.id) };

    let result = await collection.deleteOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting learner's grade data");
  }
});

// Get a class's grade data
router.get("/class/:id", async (req, res) => {
  try {
    let collection = await db.collection("grades");
    let query = { class_id: Number(req.params.id) };

    // Check for learner_id parameter
    if (req.query.learner) query.learner_id = Number(req.query.learner);

    let result = await collection.find(query).toArray();

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting class's grade data");
  }
});

// Update a class id
router.patch("/class/:id", async (req, res) => {
  try {
    let collection = await db.collection("grades");
    let query = { class_id: Number(req.params.id) };

    let result = await collection.updateMany(query, {
      $set: { class_id: req.body.class_id },
    });

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating class id");
  }
});

// Delete a class
router.delete("/class/:id", async (req, res) => {
  try {
    let collection = await db.collection("grades");
    let query = { class_id: Number(req.params.id)};

    let result = await collection.deleteMany(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting class");
  }
});

export default router;

