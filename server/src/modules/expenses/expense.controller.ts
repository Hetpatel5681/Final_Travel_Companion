import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { expenseService } from './expense.service';

export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const expense = await expenseService.createExpense(req.user._id.toString(), req.body);
    res.status(201).json({ success: true, message: 'Expense created successfully', data: expense });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Validation Error' });
  }
};

export const getTripExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const expenses = await expenseService.getTripExpenses(req.params.tripId, req.user._id.toString());
    res.status(200).json({ success: true, message: 'Expenses retrieved successfully', data: expenses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const expense = await expenseService.updateExpense(req.params.expenseId, req.user._id.toString(), req.body);
    res.status(200).json({ success: true, message: 'Expense updated successfully', data: expense });
  } catch (error: any) {
    res.status(error.status || 400).json({ success: false, message: error.message || 'Error updating expense' });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    await expenseService.deleteExpense(req.params.expenseId, req.user._id.toString());
    res.status(200).json({ success: true, message: 'Expense deleted successfully', data: {} });
  } catch (error: any) {
    res.status(error.status || 400).json({ success: false, message: error.message || 'Error deleting expense' });
  }
};

export const getExpenseSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const summary = await expenseService.getExpenseSummary(req.params.tripId, req.user._id.toString());
    res.status(200).json({ success: true, message: 'Expense summary retrieved successfully', data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getCategoryBreakdown = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const breakdown = await expenseService.getCategoryBreakdown(req.params.tripId, req.user._id.toString());
    res.status(200).json({ success: true, message: 'Category breakdown retrieved successfully', data: breakdown });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getDailyExpenseAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const analytics = await expenseService.getDailyExpenseAnalytics(req.params.tripId, req.user._id.toString());
    res.status(200).json({ success: true, message: 'Daily analytics retrieved successfully', data: analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
