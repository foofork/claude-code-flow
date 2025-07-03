#!/bin/bash

# Script to batch fix TS18046 errors across the codebase
# This adds type annotations to event handlers and error handling

echo "🔍 Finding files with TS18046 errors..."

# Get list of files with TS18046 errors
FILES=$(npm run typecheck 2>&1 | grep "TS18046" | cut -d'(' -f1 | sort | uniq)

TOTAL=$(echo "$FILES" | wc -l)
FIXED=0

echo "📊 Found $TOTAL files with TS18046 errors"

for file in $FILES; do
  echo "Processing $file..."
  
  # Check if error-handler import already exists
  if ! grep -q "error-handler" "$file"; then
    # Add import after other imports
    sed -i '/^import.*\.js'\'';\?$/a import { getErrorMessage } from '\''../utils/error-handler.js'\'';' "$file"
  fi
  
  # Fix common patterns
  
  # 1. Event handlers with data parameter
  sed -i 's/\.on(\(.*\), (\(data\|event\|payload\))[ ]*=>[ ]*{/\.on(\1, (\2: unknown) => {/g' "$file"
  
  # 2. catch blocks with error
  sed -i 's/catch[ ]*([ ]*\(error\|err\|e\|ex\|exception\)[ ]*)[ ]*{/catch (\1) {/g' "$file"
  
  # 3. error.message patterns
  sed -i 's/\(error\|err\|e\|ex\|exception\)\.message/getErrorMessage(\1)/g' "$file"
  
  # 4. String(error) patterns
  sed -i 's/String(\(error\|err\|e\|ex\|exception\))/getErrorMessage(\1)/g' "$file"
  
  # 5. ${error} in template literals
  sed -i 's/${[ ]*\(error\|err\|e\|ex\|exception\)[ ]*}/${getErrorMessage(\1)}/g' "$file"
  
  FIXED=$((FIXED + 1))
  echo "✅ Fixed $file ($FIXED/$TOTAL)"
done

echo "
✅ Batch fix complete! Fixed $FIXED files.

Next steps:
1. Run 'npm run typecheck' to see remaining errors
2. Manually review the changes
3. Fix any remaining edge cases
"

# Show improvement
echo "🔍 Checking improvement..."
BEFORE_COUNT=$(npm run typecheck 2>&1 | grep -c "TS18046" || echo "0")
echo "📊 Remaining TS18046 errors: $BEFORE_COUNT"