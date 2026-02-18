const fs = require('fs');

// Lê o arquivo
const content = fs.readFileSync('src/hooks/useLanguage.tsx', 'utf8');

// Extrai as seções pt, en, es
const ptSection = content.match(/pt:\s*{([\s\S]*?)},\s*en:/)?.[1];
const enSection = content.match(/en:\s*{([\s\S]*?)},\s*es:/)?.[1];
const esSection = content.match(/es:\s*{([\s\S]*?)}\s*};/)?.[1];

// Função para encontrar duplicatas
function findDuplicates(section, langName) {
  if (!section) return;
  
  const keys = {};
  const duplicates = [];
  
  // Regex para pegar chaves
  const regex = /"([^"]+)":\s*[^,\n]+/g;
  let match;
  let lineNum = 1;
  
  while ((match = regex.exec(section)) !== null) {
    const key = match[1];
    if (keys[key]) {
      duplicates.push({
        key,
        first: keys[key],
        duplicate: lineNum
      });
    } else {
      keys[key] = lineNum;
    }
    lineNum++;
  }
  
  if (duplicates.length > 0) {
    console.log(`\n🔴 DUPLICATAS ENCONTRADAS EM ${langName.toUpperCase()}:`);
    duplicates.forEach(dup => {
      console.log(`   - Chave: "${dup.key}"`);
      console.log(`     Primeira ocorrência: ~linha ${dup.first}`);
      console.log(`     Duplicata: ~linha ${dup.duplicate}`);
    });
  } else {
    console.log(`\n✅ Nenhuma duplicata em ${langName.toUpperCase()}`);
  }
}

// Verifica cada seção
findDuplicates(ptSection, 'pt');
findDuplicates(enSection, 'en');
findDuplicates(esSection, 'es');
