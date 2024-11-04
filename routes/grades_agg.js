import express from "express";
import db from "../db/conn.js";
import { ObjectId } from "mongodb";
import * as learnerSchema from "../models/Learner.js";

const router = express.Router();

/**
 * It is not best practice to seperate these routes
 * like we have done here. This file was created
 * specifically for educational purposes, to contain
 * all aggregation routes in one place.
 */

/**
 * Grading Weights by Score Type:
 * - Exams: 50%
 * - Quizes: 30%
 * - Homework: 20%
 */

// Get the weighted average of a specified learner's grades, per class
router.get("/learner/:id/avg-class", async (req, res) => {
	console.log(req.params.id);

  let collection = await db.collection("grades");

  let result = await collection
    .aggregate([
      {
        $match: { learner_id: Number(req.params.id) },
      },
      {
        $unwind: { path: "$scores" },
      },
      {
        $group: {
          _id: "$class_id",
          quiz: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "quiz"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          exam: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "exam"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
          homework: {
            $push: {
              $cond: {
                if: { $eq: ["$scores.type", "homework"] },
                then: "$scores.score",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          class_id: "$_id",
          avg: {
            $sum: [
              { $multiply: [{ $avg: "$exam" }, 0.5] },
              { $multiply: [{ $avg: "$quiz" }, 0.3] },
              { $multiply: [{ $avg: "$homework" }, 0.2] },
            ],
          },
        },
      },
    ])
    .toArray();

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

router.get('/grades/stats', async (req, res, next) => {
	console.log(req.params.id);

	let collection = await db.collection('grades');
	let totalStudents = await collection
		.aggregate([
			{
				$count: 'totalStudents'
			}
		])
		.toArray();
	let learnersAbove50 = await collection
		.aggregate([
			{
				$project: {
					_id: 0,
					student_id: 1,
					avg: { $avg: '$scores.score' }
				}
			},
			{
				$match: {
					avg: { $gt: 50 }
				}
			},
			{ $count: 'numOfLearners' }
		])
		.toArray();
	let result = totalStudents[0].totalStudents / learnersAbove50[0].numOfLearners;
	res.send({
		totalLearners: totalStudents[0].totalStudents,
		learnersAvgAbove50: learnersAbove50[0].numOfLearners,
		ratioOfStudentsAbove50: result
	});
});



router.get('/grades/stats/:id', async (req, res) => {
	let collection = await db.collection('grades');
	let result = await collection
		.aggregate([
			{
				'$match': {
					'class_id': Number(req.params.id)
				}
			},
			{
				'$unwind': {
					'path': '$scores'
				}
			},
			{
				'$group': {
					'_id': '$student_id',
					'quiz': {
						'$push': {
							'$cond': {
								'if': {
									'$eq': ['$scores.type', 'quiz']
								},
								'then': '$scores.score',
								'else': '$$REMOVE'
							}
						}
					},
					'exam': {
						'$push': {
							'$cond': {
								'if': {
									'$eq': ['$scores.type', 'exam']
								},
								'then': '$scores.score',
								'else': '$$REMOVE'
							}
						}
					},
					'homework': {
						'$push': {
							'$cond': {
								'if': {
									'$eq': ['$scores.type', 'homework']
								},
								'then': '$scores.score',
								'else': '$$REMOVE'
							}
						}
					}
				}
			},
			{
				'$project': {
					'_id': 0,
					'class_id': '$_id',
					'avg': {
						'$sum': [
							{
								'$multiply': [
									{
										'$avg': '$exam'
									},
									0.5
								]
							},
							{
								'$multiply': [
									{
										'$avg': '$quiz'
									},
									0.3
								]
							},
							{
								'$multiply': [
									{
										'$avg': '$homework'
									},
									0.2
								]
							}
						]
					}
				}
			},
			{
				'$group': {
					'_id': null,
					'class_id': {
						'$push': '$class_id'
					},
					'totalStudents': {
						'$sum': 1
					},
					'above50Students': {
						'$sum': {
							'$cond': {
								'if': { '$gt': ['$avg', 50] },
								'then': 1,
								'else': 0
							}
						}
					}
				}
			},
			{
				'$project': {
					'ratio': {
						'$divide': ['$above50Students', '$totalStudents']
					}
				}
			}
		])
		.toArray();
	//  console.log(result)
	res.send(result);
});


export default router;
