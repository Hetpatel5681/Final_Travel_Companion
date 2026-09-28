import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import {
  createExpense,
  getTripExpenses,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getCategoryBreakdown,
  getDailyExpenseAnalytics
} from './expense.controller';

const router = Router();

router.use(protect);

router.route('/')
  .post(createExpense);

router.route('/:expenseId')
  .put(updateExpense)
  .delete(deleteExpense);

router.route('/trip/:tripId')
  .get(getTripExpenses);

router.route('/summary/:tripId')
  .get(getExpenseSummary);

router.route('/categories/:tripId')
  .get(getCategoryBreakdown);

router.route('/daily/:tripId')
  .get(getDailyExpenseAnalytics);

export default router;
