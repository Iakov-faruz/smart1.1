# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

$srcPath = "C:\Users\5722y\Desktop\smart\SmartExpEnterprise\backend\routes"
$downloads = [Environment]::GetFolderPath("UserProfile") + "\Downloads"

# עבור כל תיקייה בתוך src
Get-ChildItem -Directory $srcPath | ForEach-Object {
    $folderName = $_.Name
    $outputFile = Join-Path $downloads "$folderName.txt"

    # כותב את שם התיקייה
    "===== Folder: $folderName =====" | Out-File $outputFile -Encoding utf8

    # עובר על כל הקבצים שבתוכה ומוסיף את התוכן שלהם
    Get-ChildItem -Recurse $_.FullName -File | ForEach-Object {
        "----- File: $($_.FullName) -----" | Out-File $outputFile -Append -Encoding utf8
        Get-Content $_.FullName | Out-File $outputFile -Append -Encoding utf8
        "`n" | Out-File $outputFile -Append -Encoding utf8
    }
}