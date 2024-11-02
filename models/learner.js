import mongoose from "mongoose";

// Define the schema for learners.
// Mongoose will add the _id property to your schemas by default.
const learnerSchema = new mongoose.Schema({
  // Each property can have a type field that describdes
  // the valid data types for that field, and a
  // required field to specify whether it is required.
  name: {
    type: String,
    required: true,
  },
  enrolled: {
    type: Boolean,
    required: true,
  },
  // Other validation options like min, max, enum, etc.
  // are available for their appropriate data types.
  // You can also set a message to display when validation
  // fails due to these criteria.
  year: {
    type: Number,
    min: 1995,
    message: "The year must be greater than 1995.",
    required: true,
  },
  avg: {
    type: Number,
    required: false,
  },
  // Mongoose supports templating through the use of
  // {VALUE}, which will output the value that is
  // currently being validated (and failing).
  campus: {
    type: String,
    enum: [
      "Remote",
      "Boston",
      "New York",
      "Denver",
      "Los Angeles",
      "Seattle",
      "Dallas",
    ],
    message: "{VALUE} is not a valid campus location.",
    default: "Remote",
    required: true,
  },
});

// You can build indexing into your schemas.
learnerSchema.index({ name: 1 });
learnerSchema.index({ year: 1 });
learnerSchema.index({ avg: 1 });
learnerSchema.index({ campus: 1 });

// You can add methods to instances of a Mongoose model,
// which is simply a document object with its own instance methods.
learnerSchema.methods.getPeers = function (cb) {
  return mongoose
    .model("Learner")
    .find({ campus: this.campus, year: this.year }, cb);
};

// You can also add static methods to a model for common tasks.
learnerSchema.statics.findPassing = function () {
  return this.find({ avg: { $gte: 70 } });
};
learnerSchema.statics.findByCampus = function (campus) {
  return this.find({ campus });
};

// As an additional convenience option, you can add query helpers
// to models using the schema.query method, allowing you to extend
// the chainable query builder API.
learnerSchema.query.byName = function (name) {
  return this.where({ name: new RegExp(name, "i") });
};

// Virtuals allow us to get and set properties that are not
// stored in the MongoDB database. This is useful for a number
// of scenarios, like combining fields, repetitive processing,
// decomposing a value into multiple values for storage, etc.
// You cannot query with virtuals, since they are not
// stored in the database.
learnerSchema.virtual("passing").get(function () {
  return this.avg >= 70;
});

// Compile the schema into a model and export it.
// Models are used much like classes to create instances
// of the objects that the schema describes.
export default mongoose.model("Learner", learnerSchema);
