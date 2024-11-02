import { Schema, model } from 'mongoose'

const postSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  likes: Number,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

export default model('Post', postSchema)