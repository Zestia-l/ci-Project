//promise、同步和回调风格，这里选择promise风格
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

async function findFiles(dir) {
  //获取当前目录下所有的目录和文件
  //（withFileTypes设置为true是因为需要isDirectory()函数来判断是否是目录）
  const entries = await fs.readdir(dir, { withFileTypes: true });
  //递归调用，确保所有的文件被包含在内，以数组形式返回所有的文件名
  const files = await Promise.all(entries.map(entry => {
    const fullPath = path.join(dir, entry.name);
    return (entry.isDirectory()&&entry.name!=='node_modules') ? findFiles(fullPath) : fullPath;
  }));
  //数组扁平化之后，筛选所有ts或者tsx的文件
  return files.flat().filter(file => 
    file.endsWith('.ts') || file.endsWith('.tsx')
  );
}

async function removeConsoles(filePath) {
  try {
    //读取文件内容
    const content = await fs.readFile(filePath, 'utf8');
    //正则表达式判断
    const updatedContent = content.replace(/console\.(log|warn|error|info|debug)\([^)]*\);?/g, '');
    if (content !== updatedContent) {
      //修改文件内容
      await fs.writeFile(filePath, updatedContent, 'utf8');
      console.log(`Removed console statements from ${filePath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
    return false;
  }
}

async function main() {
  const rootDir = process.cwd();
  const files = await findFiles(rootDir);
  console.log(`Found ${files.length} TypeScript files`);
  let modifiedFiles = 0;

  for (const file of files) {
    const modified = await removeConsoles(file);
    if (modified) {
      modifiedFiles++;
    }
  }

  if (modifiedFiles > 0) {
    console.log(`Removed console statements from ${modifiedFiles} files`);
    process.exit(0);
  } else {
    console.log('No console statements found');
  }
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});    