import mongoose, { Document, Model, Schema } from "mongoose";

export interface IText extends Document {
  user: mongoose.Schema.Types.ObjectId;
  text: string;
  word_count: number;
  character_count: number;
  sentence_count: number;
  paragraph_count: number;
  longest_word: string;
}

const TextSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    word_count: {
      type: Number,
      required: true,
    },
    character_count: {
      type: Number,
      required: true,
    },
    sentence_count: {
      type: Number,
      required: true,
    },
    paragraph_count: {
      type: Number,
      required: true,
    },
    longest_word: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const Text: Model<IText> = mongoose.model<IText>("texts", TextSchema);
export default Text;
