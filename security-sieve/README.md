# 🧩 Merge Quest: Security Sieve

This repo is full of holes — can you patch them all?

## 🚨 Your Escape Goals:
1. Find and fix all security vulnerabilities in this app.
2. Remove hardcoded secrets.
3. Prevent SQL injection.
4. Hash passwords securely before saving them.
5. Submit a secure pull request to `main`.

🕓 Time Limit: 30 minutes  
💡 Hint: OWASP Top 10 is your friend.

## **Here's How to Commit Your Specific Changes:**

### **Step 1: Check Current Status**
```bash
git status
```

### **Step 2: See What Changed**
```bash
# See changes in index.js
git diff index.js
```

### **Step 3: Stage Specific Files**
```bash
# Add only index.js
git add index.js

# Or if you want to see what you're staging first:
git add -p index.js
```

### **Step 4: Commit with a Descriptive Message**
```bash
git commit -m "Update index.js with BUGFIX branch edit"
```

### **Step 5: Push to GitHub**
```bash
git push origin main
```

## **Alternative: Commit with More Detail**

If you want to be more specific about what you changed:

```bash
<code_block_to_apply_changes_from>
```

## **What Would You Like to Do?**

- **Run these commands step by step?**
- **Check what other files might have changed?**
- **See the git diff output first?**
- **Something else?**

Let me know how you'd like to proceed!

## **Current Situation:**

- **You're on branch:** `bugfixzzz` (not main)
- **index.js was committed** but there are many other changes
- **You have several modified files** and some new untracked files

## **Here's What You Need to Do:**

### **Option 1: Commit All Changes (Recommended)**
```bash
# Add all modified and new files
git add .

# Commit everything with a comprehensive message
git commit -m "Implement bugfix changes across multiple components"
```

### **Option 2: Commit Specific Changes**
```bash
# Add specific files you want to commit
git add backend/server.js
git add frontend/src/App.js
git add frontend/src/index.css
git add branch-maze/README.md

# Commit these specific changes
git commit -m "Update backend, frontend components and documentation"
```

### **Option 3: Handle Deleted File**
```bash
# Remove the deleted server.js from tracking
git rm server.js

# Add other changes
git add .

# Commit
git commit -m "Remove old server.js and update components"
```

## **My Recommendation:**

Since you're on a `bugfixzzz` branch and have comprehensive changes, I'd suggest:

```bash
<code_block_to_apply_changes_from>
```

## **Questions for You:**

1. **Do you want to commit all these changes together?**
2. **Should we review what changed in each file first?**
3. **Do you want to push this branch to GitHub?**

Let me know how you'd like to proceed!
