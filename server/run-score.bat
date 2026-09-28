@echo off
npx tsx src/modules/recommendations/score.verify.ts
del src\modules\recommendations\score.verify.ts
npx tsc --noEmit
npm run test:jest
npm run build
