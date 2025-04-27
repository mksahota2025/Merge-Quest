#!/bin/bash

# Create organization (you'll need to do this manually in GitHub UI)
echo "Please create the organization 'merge-quest-org' in GitHub UI first"
echo "Press Enter when done..."
read

# Create repositories
repos=("branch-maze" "dependency-jenga" "security-sieve" "vibe-boss")

for repo in "${repos[@]}"; do
    echo "Creating $repo..."
    
    # Create repository
    gh repo create "merge-quest-org/$repo" --public --clone
    
    # Create README.md
    cat > "$repo/README.md" << EOF
# Welcome to ${repo^} 🧩

Your repo is in chaos. Fix the issues and get approval!

## Steps:
1. Clone this repository
2. Fix the issues
3. Open a PR with your solution
4. Get approval

## Room-specific Instructions:

$(case $repo in
    "branch-maze")
        echo "1. Fix branch structure"
        echo "2. Clean up merge conflicts"
        echo "3. Open PR and fix errors"
        ;;
    "dependency-jenga")
        echo "1. Fix dependency conflicts"
        echo "2. Update package versions"
        echo "3. Resolve circular dependencies"
        ;;
    "security-sieve")
        echo "1. Fix security vulnerabilities"
        echo "2. Update deprecated APIs"
        echo "3. Implement proper authentication"
        ;;
    "vibe-boss")
        echo "1. Fix code style issues"
        echo "2. Improve documentation"
        echo "3. Add proper error handling"
        ;;
esac)

## Getting Started
\`\`\`bash
git clone https://github.com/merge-quest-org/$repo.git
cd $repo
\`\`\`

Good luck! 🚀
EOF

    # Initialize git and push
    cd "$repo"
    git add README.md
    git commit -m "Initial commit: Add puzzle instructions"
    git push origin main
    cd ..
done

echo "All repositories created successfully!" 