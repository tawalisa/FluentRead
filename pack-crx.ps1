# FluentRead 扩展打包脚本
# 用于自动生成 CRX 文件

param(
    [string]$extensionDir = ".output\chrome-mv3",
    [string]$outputPath = ".output",
    [switch]$Help
)

if ($Help) {
    Write-Host @"
FluentRead 扩展打包工具

用法:
  .\pack-crx.ps1 [-extensionDir <目录>] [-outputPath <输出目录>]

参数:
  -extensionDir    扩展程序构建输出目录 (默认：.output\chrome-mv3)
  -outputPath      CRX 文件输出目录 (默认：.output)
  -Help           显示帮助信息

示例:
  .\pack-crx.ps1
  .\pack-crx.ps1 -extensionDir ".output\chrome-mv3" -outputPath ".output"

"@
    exit 0
}

Write-Host "🔍 检查 Chrome 浏览器安装位置..." -ForegroundColor Cyan

# 查找 Chrome 浏览器路径
$chromePaths = @(
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "$env:PROGRAMFILES\Google\Chrome\Application\chrome.exe",
    "${env:PROGRAMFILES(X86)}\Google\Chrome\Application\chrome.exe"
)

$chromeExe = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromeExe = $path
        break
    }
}

if (-not $chromeExe) {
    Write-Host "❌ 未找到 Chrome 浏览器，请确保已安装 Chrome" -ForegroundColor Red
    Write-Host "`n手动打包步骤：" -ForegroundColor Yellow
    Write-Host "1. 打开 Chrome 浏览器" -ForegroundColor White
    Write-Host "2. 访问 chrome://extensions/" -ForegroundColor White
    Write-Host "3. 开启右上角的 '开发者模式'" -ForegroundColor White
    Write-Host "4. 点击 '打包扩展程序' 按钮" -ForegroundColor White
    Write-Host "5. 输入扩展程序目录：$(Resolve-Path $extensionDir)" -ForegroundColor White
    Write-Host "6. 点击 '打包扩展程序'" -ForegroundColor White
    exit 1
}

Write-Host "✅ 找到 Chrome 浏览器：$chromeExe" -ForegroundColor Green

# 验证扩展目录是否存在
if (-not (Test-Path $extensionDir)) {
    Write-Host "❌ 扩展目录不存在：$extensionDir" -ForegroundColor Red
    Write-Host "请先运行：pnpm build" -ForegroundColor Yellow
    exit 1
}

# 检查 manifest.json 是否存在
if (-not (Test-Path "$extensionDir\manifest.json")) {
    Write-Host "❌ 未找到 manifest.json 文件" -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 开始打包扩展程序..." -ForegroundColor Cyan
Write-Host "   源目录：$(Resolve-Path $extensionDir)" -ForegroundColor Gray
Write-Host "   输出目录：$(Resolve-Path $outputPath)" -ForegroundColor Gray

# 使用 Chrome 打包扩展
$chromeArgs = @('--pack-extension', "--pack-extension-key=$extensionDir\key.pem", "--pack-app-name=FluentRead")

# 如果没有私钥文件，Chrome 会自动生成一个
Write-Host "`n⚙️  调用 Chrome 打包..." -ForegroundColor Cyan

try {
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = $chromeExe
    $processInfo.Arguments = "--pack-extension=""$(Resolve-Path $extensionDir)"""
    $processInfo.WorkingDirectory = (Resolve-Path $outputPath)
    $processInfo.UseShellExecute = $false
    $processInfo.CreateNoWindow = $true
    
    $process = [System.Diagnostics.Process]::Start($processInfo)
    
    Write-Host "⏳ 等待 Chrome 打包完成..." -ForegroundColor Yellow
    $process.WaitForExit()
    
    # 等待一会儿让文件系统同步
    Start-Sleep -Seconds 2
    
    # 检查是否生成了 CRX 文件
    $crxFile = Join-Path $outputPath "chrome-mv3.crx"
    if (Test-Path $crxFile) {
        Write-Host "`n✅ 打包成功！" -ForegroundColor Green
        Write-Host "   CRX 文件：$crxFile" -ForegroundColor Cyan
        Write-Host "   文件大小：$((Get-Item $crxFile).Length / 1MB -as [math]::Round($_, 2)) MB" -ForegroundColor Cyan
        
        # 同时显示 PEM 密钥文件位置（如果需要重新打包）
        $pemFile = Join-Path $extensionDir "key.pem"
        if (Test-Path $pemFile) {
            Write-Host "`n💡 提示：私钥文件已保存在：$pemFile" -ForegroundColor Yellow
            Write-Host "   下次更新扩展时需要使用相同的私钥文件" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n⚠️  未找到生成的 CRX 文件" -ForegroundColor Yellow
        Write-Host "   可能打包失败，或者 CRX 文件在其他位置" -ForegroundColor Yellow
        Write-Host "`n   请检查 Chrome 浏览器的打包日志" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ 打包过程中发生错误：$_" -ForegroundColor Red
    Write-Host "`n建议手动打包：" -ForegroundColor Yellow
    Write-Host "1. 打开 Chrome 浏览器" -ForegroundColor White
    Write-Host "2. 访问 chrome://extensions/" -ForegroundColor White
    Write-Host "3. 开启'开发者模式'" -ForegroundColor White
    Write-Host "4. 点击'打包扩展程序'" -ForegroundColor White
    Write-Host "5. 输入目录：$(Resolve-Path $extensionDir)" -ForegroundColor White
}

Write-Host "`n✨ 完成！" -ForegroundColor Green
