#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('❌ Please provide a module name.');
  process.exit(1);
}

const basePath = path.join(__dirname, '..', 'src', 'modules', moduleName);
const files = [
  { name: `${moduleName}.controller.ts`, content: `import { Request, Response } from 'express';\n\nclass ${capitalizeFirstLetter(moduleName)}Controller {\n\n  static async getAll(req: Request, res: Response) {\n    // Implement Get All logic\n  }\n\n  static async create(req: Request, res: Response) {\n    // Implement Create logic\n  }\n\n}\n\nexport default ${capitalizeFirstLetter(moduleName)}Controller;\n` },
  { name: `${moduleName}.service.ts`, content: `class ${capitalizeFirstLetter(moduleName)}Service {\n\n  static async getAll() {\n    // Implement Get All logic\n  }\n\n  static async create(data: any) {\n    // Implement Create logic\n  }\n\n}\n\nexport default ${capitalizeFirstLetter(moduleName)}Service;\n` },
  { name: `${moduleName}.model.ts`, content: `// Model for ${moduleName} (e.g., using Mongoose or TypeORM)\n` },
  { name: `${moduleName}.interface.ts`, content: `export interface ${capitalizeFirstLetter(moduleName)} {\n  id: string;\n  // Define properties\n}\n` },
  { name: `${moduleName}.routes.ts`, content: `import { Router } from 'express';\nimport ${capitalizeFirstLetter(moduleName)}Controller from './${moduleName}.controller';\n\nconst router = Router();\n\nrouter.get('/', ${capitalizeFirstLetter(moduleName)}Controller.getAll);\nrouter.post('/', ${capitalizeFirstLetter(moduleName)}Controller.create);\n\nexport default router;\n` },
];

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
  files.forEach(file => {
    fs.writeFileSync(path.join(basePath, file.name), file.content);
  });
  console.log(`✅ Module '${moduleName}' created successfully.`);
} else {
  console.log(`⚠️ Module '${moduleName}' already exists.`);
}
