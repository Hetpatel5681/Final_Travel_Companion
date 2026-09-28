import { Expense, IExpense } from './expense.model';
import mongoose from 'mongoose';

export class ExpenseService {
  async createExpense(userId: string, data: Partial<IExpense>) {
    const expense = new Expense({
      ...data,
      userId,
    });
    return await expense.save();
  }

  async getTripExpenses(tripId: string, userId: string) {
    return await Expense.find({ tripId, userId }).sort({ date: -1 });
  }

  async updateExpense(expenseId: string, userId: string, updateData: Partial<IExpense>) {
    const expense = await Expense.findOne({ _id: expenseId, userId });
    
    if (!expense) throw { status: 404, message: 'Expense not found' };

    delete updateData.userId;
    delete updateData.tripId;

    Object.assign(expense, updateData);
    return await expense.save();
  }

  async deleteExpense(expenseId: string, userId: string) {
    const expense = await Expense.findOne({ _id: expenseId, userId });
    if (!expense) throw { status: 404, message: 'Expense not found' };
    
    return await Expense.findByIdAndDelete(expenseId);
  }

  async getExpenseSummary(tripId: string, userId: string) {
    const result = await Expense.aggregate([
      { 
        $match: { 
          tripId: new mongoose.Types.ObjectId(tripId), 
          userId: new mongoose.Types.ObjectId(userId) 
        } 
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);
    return result.length > 0 ? result[0] : { totalSpent: 0 };
  }

  async getCategoryBreakdown(tripId: string, userId: string) {
    const result = await Expense.aggregate([
      { 
        $match: { 
          tripId: new mongoose.Types.ObjectId(tripId), 
          userId: new mongoose.Types.ObjectId(userId) 
        } 
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          _id: 0
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);
    return result;
  }

  async getDailyExpenseAnalytics(tripId: string, userId: string) {
    const result = await Expense.aggregate([
      { 
        $match: { 
          tripId: new mongoose.Types.ObjectId(tripId), 
          userId: new mongoose.Types.ObjectId(userId) 
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $project: {
          date: '$_id',
          total: 1,
          _id: 0
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);
    return result;
  }
}

export const expenseService = new ExpenseService();
