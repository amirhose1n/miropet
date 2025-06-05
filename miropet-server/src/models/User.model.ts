import mongoose, { Document, Schema } from "mongoose";

export interface IAddress {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export interface IUser extends Document {
  name?: string;
  email: string;
  passwordHash: string;
  role: "customer" | "admin";
  addresses: IAddress[];
  createdAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    street: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String,
  },
  { _id: false }
);

const userSchema = new Schema<IUser>({
  name: String,
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  addresses: [addressSchema],
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>("User", userSchema);
