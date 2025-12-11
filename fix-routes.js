const fs = require('fs');

const content = fs.readFileSync('server/routes.ts', 'utf8');
const lines = content.split('\n');

const newLines = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];
  
  // Si es una línea que define const storage = await getStorage(); duplicada, saltarla
  if (line.trim() === 'const storage = await getStorage();') {
    // Verificar si ya existe una antes en esta función
    let hasStorage = false;
    let j = i - 1;
    let depth = 0;
    while (j >= 0) {
      if (lines[j].trim() === 'const storage = await getStorage();') {
        hasStorage = true;
        break;
      }
      if (lines[j].includes('async (req, res)') || lines[j].includes('app.')) {
        break;
      }
      if (lines[j].includes('{')) depth++;
      if (lines[j].includes('}')) depth--;
      j--;
    }
    
    // Solo agregar si no existe
    if (!hasStorage) {
      newLines.push(line);
    }
    // Si ya existe, saltarla (no agregar)
  } else {
    newLines.push(line);
  }
  
  i++;
}

fs.writeFileSync('server/routes.ts', newLines.join('\n'));
console.log('Fixed duplicate storage declarations');
