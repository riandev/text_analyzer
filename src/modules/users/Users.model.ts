import bcrypt from "bcrypt";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user";
  createdAt: Date;
  updatedAt: Date;
  isValidPassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ["user"],
    },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password as string, salt);
      this.password = hashedPassword;
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.isValidPassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password as string);
};

const User: Model<IUser> = mongoose.model<IUser>("users", UserSchema);
export default User;
