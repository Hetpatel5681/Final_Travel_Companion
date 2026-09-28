import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "AI Travel Companion API is running",
    version: "v1"
  });
});

export default router;
