@echo off
npx tsx src/modules/recommendations/behavior.verify.ts
npx tsc --noEmit
npm run test:jest
npm run build
