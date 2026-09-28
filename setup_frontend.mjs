import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, 'client');
const srcDir = path.join(rootDir, 'src');

const dirs = [
  rootDir,
  srcDir,
  path.join(rootDir, 'public'),
  path.join(srcDir, 'assets'),
  path.join(srcDir, 'components'),
  path.join(srcDir, 'config'),
  path.join(srcDir, 'constants'),
  path.join(srcDir, 'contexts'),
  path.join(srcDir, 'features'),
  path.join(srcDir, 'hooks'),
  path.join(srcDir, 'layouts'),
  path.join(srcDir, 'pages'),
  path.join(srcDir, 'services'),
  path.join(srcDir, 'store'),
  path.join(srcDir, 'types'),
  path.join(srcDir, 'utils'),
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const files = {
  'package.json': `{
  "name": "client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.0",
    "framer-motion": "^11.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.50.0",
    "react-router-dom": "^7.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.0"
  }
}`,
  'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,
  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
  'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
  'tsconfig.node.json': `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`,
  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Travel Companion</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  '.env': `VITE_API_URL=http://localhost:5000/api`,
  '.env.example': `VITE_API_URL=http://localhost:5000/api`,
  'src/main.tsx': `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);`,
  'src/App.tsx': `function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600">AI Travel Companion</h1>
    </div>
  );
}
export default App;`,
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`,
  'src/vite-env.d.ts': `/// <reference types="vite/client" />`
};

for (const [relativePath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(rootDir, relativePath), content);
}
console.log('Frontend scaffolded successfully!');
