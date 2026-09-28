@echo off
npx tsx src/modules/recommendations/dataset.verify.ts
npm run test:jest
npx tsc --noEmit
npm run build
