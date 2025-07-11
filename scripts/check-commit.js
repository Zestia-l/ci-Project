const simpleGit = require('simple-git');
const git = simpleGit();
const fs = require('fs');
// 检查提交信息
function validateCommitMessage(message) {
  // 自定义验证规则
  const regex = /^(feat|fix|docs|style|refactor|test|chore|ci|perf|revert):\s.{1,50}/;
  return regex.test(message);
}
// 主函数
async function main() {
  const commitMsgFile = process.argv[2];//读取命令的参数
  if (!commitMsgFile) {
    console.error('未找到提交信息文件');
    process.exit(1);
  }
  try {
  //读取并去掉空格
    const commitMessage = fs.readFileSync(commitMsgFile, 'utf8').trim();
    
    if (!validateCommitMessage(commitMessage)) {
      console.error(`
        提交信息格式不符合规范！
        正确格式: type(scope?): subject  (scope 是可选的)
        示例:
          feat: 添加新功能
          fix: 修复bug
          docs: 更新文档
      `);
      process.exit(1);
    }
    console.log('提交信息格式正确');
    process.exit(0);
  } catch (error) {
    console.error('验证过程中出错:', error);
    process.exit(1);
  }
}
main();