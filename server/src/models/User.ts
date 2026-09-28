import mongoose, { Schema, Document } from 'mongoose';

export interface ITravelPreferences {
  travelStyle: 'luxury' | 'budget' | 'adventure' | 'cultural' | 'relaxation';
  favoriteDestinations: string[];
  interests: string[];
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  profilePicture?: string;
  phone?: string;
  country?: string;
  preferredCurrency: string;
  preferredLanguage: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  travelPreferences?: ITravelPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    profilePicture: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    preferredCurrency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP'],
      trim: true,
      uppercase: true,
    },
    preferredLanguage: {
      type: String,
      default: 'en',
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    travelPreferences: {
      travelStyle: {
        type: String,
        enum: ['luxury', 'budget', 'adventure', 'cultural', 'relaxation'],
        default: 'relaxation',
      },
      favoriteDestinations: [{ type: String, trim: true }],
      interests: [{ type: String, trim: true }],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
