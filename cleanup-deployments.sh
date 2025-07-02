#!/bin/bash

# Script to clean up Vercel deployment commits while preserving actual code changes
# This script will help squash deployment-related commits into meaningful ones

echo "🚀 DOB Validator - Deployment Commit Cleanup Script"
echo "=================================================="
echo ""
echo "This script will help you clean up deployment commits from your Git history."
echo "IMPORTANT: Make sure you have a backup of your repository before proceeding!"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

echo "📊 Current commit statistics:"
echo "Total commits: $(git rev-list --count HEAD)"
echo "Deployment-related commits: $(git log --oneline --grep='vercel\|deploy\|Vercel' | wc -l)"
echo ""

echo "🔍 Recent deployment commits:"
git log --oneline --grep="vercel\|deploy\|Vercel" -10
echo ""

echo "Options:"
echo "1. Interactive rebase to squash deployment commits"
echo "2. Create a new branch with cleaned history"
echo "3. Show deployment commit patterns"
echo "4. Exit"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo "🔄 Starting interactive rebase..."
        echo "This will open an editor where you can:"
        echo "- Change 'pick' to 'squash' for deployment commits"
        echo "- Edit commit messages to be more meaningful"
        echo "- Combine related commits"
        echo ""
        read -p "Press Enter to continue..."
        
        # Find the first commit that's not a deployment commit
        first_clean_commit=$(git log --oneline --grep="vercel\|deploy\|Vercel" --invert-grep -1 --format="%H")
        if [ -n "$first_clean_commit" ]; then
            git rebase -i $first_clean_commit
        else
            echo "❌ Could not find a suitable starting point for rebase"
        fi
        ;;
    2)
        echo "🌿 Creating new branch with cleaned history..."
        read -p "Enter name for new branch: " branch_name
        
        # Create new branch
        git checkout -b $branch_name
        
        # Create a script for the user to manually clean commits
        cat > cleanup-commits-manual.sh << 'EOF'
#!/bin/bash
# Manual cleanup script - run this after reviewing your commits

echo "Manual cleanup instructions:"
echo "1. Run: git log --oneline -20"
echo "2. Identify deployment commits to squash"
echo "3. Run: git rebase -i HEAD~20"
echo "4. Change 'pick' to 'squash' for deployment commits"
echo "5. Edit commit messages to be meaningful"
echo "6. Save and exit editor"
echo ""
echo "Example of good commit messages:"
echo "- feat: implement wallet authentication"
echo "- fix: resolve API endpoint errors"
echo "- chore: update dependencies and configurations"
echo "- docs: update deployment documentation"
EOF
        
        chmod +x cleanup-commits-manual.sh
        echo "✅ Created manual cleanup script: cleanup-commits-manual.sh"
        ;;
    3)
        echo "📋 Deployment commit patterns found:"
        echo ""
        echo "Vercel deployment patterns:"
        git log --oneline --grep="vercel\|Vercel" | head -10
        echo ""
        echo "General deployment patterns:"
        git log --oneline --grep="deploy" | head -10
        echo ""
        echo "Build/CI patterns:"
        git log --oneline --grep="build\|ci\|cd" | head -10
        ;;
    4)
        echo "👋 Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Cleanup process completed!"
echo ""
echo "Next steps:"
echo "1. Review your commit history: git log --oneline"
echo "2. Push changes: git push --force-with-lease origin main"
echo "3. Update Vercel settings to prevent future deployment commits"
echo ""
echo "💡 Tips to prevent future deployment commits:"
echo "- Use meaningful commit messages"
echo "- Configure Vercel to only deploy on specific branches"
echo "- Use feature branches and merge with squash"
echo "- Consider using conventional commits format" 