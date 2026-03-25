#!/usr/bin/env node

/**
 * FluentRead 扩展打包脚本
 * 自动构建并打包成 CRX 文件
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  extensionDir: path.join(__dirname, '..', '.output', 'chrome-mv3'),
  outputPath: path.join(__dirname, '..', '.output'),
  crxFile: path.join(__dirname, '..', '.output', 'chrome-mv3.crx'),
};

// 颜色代码
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 检查 Chrome 安装路径
function findChromePath() {
  const platforms = {
    win32: [
      process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env.PROGRAMFILES || '', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google\\Chrome\\Application\\chrome.exe'),
    ].filter(Boolean),
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '~/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ],
    linux: [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/snap/bin/google-chrome',
    ],
  };

  const platformPaths = platforms[process.platform] || [];
  
  for (const chromePath of platformPaths) {
    if (fs.existsSync(chromePath)) {
      return chromePath;
    }
  }
  
  return null;
}

// 执行命令
function runCommand(command, options = {}) {
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      ...options 
    });
    return true;
  } catch (err) {
    error(`执行命令失败：${command}`);
    return false;
  }
}

// 主函数
async function main() {
  log('\n🔍 FluentRead 扩展打包工具\n', 'cyan');
  
  // 步骤 1: 检查构建产物
  info('检查构建产物...');
  if (!fs.existsSync(CONFIG.extensionDir)) {
    warning('未找到构建产物，正在执行构建...');
    const buildSuccess = runCommand('pnpm build');
    if (!buildSuccess) {
      error('构建失败，请检查错误信息');
      process.exit(1);
    }
  }
  
  // 验证 manifest.json
  const manifestPath = path.join(CONFIG.extensionDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    error(`未找到 manifest.json: ${CONFIG.extensionDir}`);
    process.exit(1);
  }
  
  success('构建产物验证通过');
  
  // 步骤 2: 查找 Chrome 浏览器
  info('查找 Chrome 浏览器...');
  const chromePath = findChromePath();
  
  if (!chromePath) {
    error('未找到 Chrome 浏览器');
    log('\n请手动打包：', 'yellow');
    log('1. 打开 Chrome 浏览器', 'yellow');
    log('2. 访问 chrome://extensions/', 'yellow');
    log('3. 开启"开发者模式"', 'yellow');
    log('4. 点击"打包扩展程序"', 'yellow');
    log(`5. 输入目录：${CONFIG.extensionDir}`, 'yellow');
    log('\n或者先安装 Chrome 浏览器后再运行此脚本', 'yellow');
    process.exit(1);
  }
  
  success(`找到 Chrome: ${chromePath}`);
  
  // 步骤 3: 打包 CRX
  info('开始打包扩展程序...');
  log(`源目录：${CONFIG.extensionDir}`);
  log(`输出目录：${CONFIG.outputPath}\n`);
  
  return new Promise((resolve, reject) => {
    const chromeArgs = [
      '--pack-extension',
      `"${CONFIG.extensionDir}"`,
    ];
    
    const chromeProcess = spawn(chromePath, chromeArgs, {
      shell: true,
      stdio: 'pipe',
    });
    
    let stderr = '';
    chromeProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    chromeProcess.on('close', (code) => {
      // 等待文件系统同步
      setTimeout(() => {
        // 检查 CRX 文件是否生成
        if (fs.existsSync(CONFIG.crxFile)) {
          const stats = fs.statSync(CONFIG.crxFile);
          const sizeKB = (stats.size / 1024).toFixed(2);
          const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
          
          success('打包成功！');
          log(`\n📦 CRX 文件：${CONFIG.crxFile}`, 'green');
          log(`   文件大小：${sizeKB} KB (${sizeMB} MB)`, 'cyan');
          
          // 检查私钥文件
          const keyFile = path.join(CONFIG.extensionDir, 'key.pem');
          if (fs.existsSync(keyFile)) {
            log(`\n💡 私钥文件已保存：${keyFile}`, 'yellow');
            log('   ⚠️  下次更新扩展时需要使用相同的私钥文件', 'yellow');
          }
          
          // 显示安装说明
          log('\n📌 安装方法:', 'cyan');
          console.log('   1. 打开 Chrome 浏览器');
          console.log('   2. 访问 chrome://extensions/');
          console.log('   3. 开启"开发者模式"');
          console.log('   4. 将 CRX 文件拖拽到扩展页面');
          console.log('   5. 点击"添加扩展程序"');
          
          resolve();
        } else {
          error('CRX 文件生成失败');
          if (stderr) {
            log(`错误信息：${stderr}`, 'red');
          }
          log('\n建议手动打包：', 'yellow');
          log('1. 打开 Chrome 浏览器', 'yellow');
          log('2. 访问 chrome://extensions/', 'yellow');
          log('3. 开启"开发者模式"', 'yellow');
          log('4. 点击"打包扩展程序"', 'yellow');
          log(`5. 输入目录：${CONFIG.extensionDir}`, 'yellow');
          reject(new Error('打包失败'));
        }
      }, 2000);
    });
    
    chromeProcess.on('error', (err) => {
      error(`启动 Chrome 失败：${err.message}`);
      reject(err);
    });
  });
}

// 运行主函数
main()
  .then(() => {
    log('\n✨ 打包完成！\n', 'green');
    process.exit(0);
  })
  .catch((err) => {
    error(`打包过程出错：${err.message}`);
    process.exit(1);
  });
