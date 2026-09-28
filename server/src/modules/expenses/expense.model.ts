import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  tripId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  category: 'Hotel' | 'Food' | 'Transport' | 'Shopping' | 'Entertainment' | 'Activities' | 'Miscellaneous';
  description: string;
  amount: number;
  paymentMethod: 'Cash' | 'Credit Card' | 'UPI' | 'Debit Card';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Hotel', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Activities', 'Miscellaneous']
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Cash', 'Credit Card', 'UPI', 'Debit Card']
    },
    date: { type: Date, required: true }
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying by a user for a specific trip
expenseSchema.index({ tripId: 1, userId: 1 });

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
