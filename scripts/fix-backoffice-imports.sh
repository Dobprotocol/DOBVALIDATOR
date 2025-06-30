#!/bin/bash

# Exit on any error
set -e

echo "🔧 Fixing import paths in backoffice components..."

# Process a single file in the UI components directory
process_ui_component_file() {
    local file=$1
    echo "📝 Processing UI component file: $file..."
    
    # Fix lib imports to use absolute paths
    sed -i '' 's|"../lib/utils"|"@/lib/utils"|g' "$file"
    sed -i '' 's|"../../lib/utils"|"@/lib/utils"|g' "$file"
    
    # Fix hook imports to use absolute paths
    sed -i '' 's|"../hooks/use-toast"|"@/hooks/use-toast"|g' "$file"
    sed -i '' 's|"../../hooks/use-toast"|"@/hooks/use-toast"|g' "$file"
    
    # Fix component imports to use absolute paths
    sed -i '' 's|"../components/ui/|"@/components/ui/|g' "$file"
    sed -i '' 's|"../../components/ui/|"@/components/ui/|g' "$file"
}

# Process a single file in the components directory
process_component_file() {
    local file=$1
    echo "📝 Processing component file: $file..."
    
    # Fix component imports to use absolute paths
    sed -i '' 's|"../components/ui/|"@/components/ui/|g' "$file"
    sed -i '' 's|"./ui/|"@/components/ui/|g' "$file"
    
    # Fix hook imports to use absolute paths
    sed -i '' 's|"../hooks/|"@/hooks/|g' "$file"
    sed -i '' 's|"./hooks/|"@/hooks/|g' "$file"
    
    # Fix lib imports to use absolute paths
    sed -i '' 's|"../lib/|"@/lib/|g' "$file"
    sed -i '' 's|"./lib/|"@/lib/|g' "$file"
    
    # Fix style imports to use absolute paths
    sed -i '' 's|"../styles/|"@/styles/|g' "$file"
    sed -i '' 's|"./styles/|"@/styles/|g' "$file"
}

# Process a single file in the app directory
process_app_file() {
    local file=$1
    echo "📝 Processing app file: $file..."
    
    # Fix imports to use absolute paths
    sed -i '' 's|"../components/|"@/components/|g' "$file"
    sed -i '' 's|"../hooks/|"@/hooks/|g' "$file"
    sed -i '' 's|"../lib/|"@/lib/|g' "$file"
    sed -i '' 's|"../styles/|"@/styles/|g' "$file"
}

# Process all TypeScript/JavaScript files in the UI components directory
find backoffice/components/ui -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
    process_ui_component_file "$file"
done

# Process all TypeScript/JavaScript files in the components directory
find backoffice/components -maxdepth 1 -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
    process_component_file "$file"
done

# Process all TypeScript/JavaScript files in the app directory
find backoffice/app -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
    process_app_file "$file"
done

echo "✨ Import paths fixed successfully!" 