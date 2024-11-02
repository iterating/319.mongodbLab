import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    message: "Email is required."
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 20,
  },
  username: {
    type: String,
    required: true
  },
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }]
})

// Defining Indexes
userSchema.index({ username: 1 })

// Defining custom instance methods
userSchema.methods.sayHello = function () {
  return `Hello! My name is ${this.name}`
}


// Defining Static model method
userSchema.statics.getByUsername = async function (input) {
  return await this.findOne({username: input})
}


userSchema.virtual("yellName").get(function () {
  return this.name + "!!!"
})


export default model("User", userSchema)