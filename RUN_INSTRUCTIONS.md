# 🚀 How to Run the Prompt Library

## Quick Start

1. **Open Terminal** and navigate to the project directory:
   ```bash
   cd /Users/shivamrai/Projects/prompt-library/web-app
   ```

2. **Start the development server**:
   ```bash
   python3 -m http.server 8000
   ```

3. **Open your browser** and go to:
   ```
   http://localhost:8000/src/index.html
   ```

## Alternative Method (if the above doesn't work)

If you're having issues, try this alternative approach:

1. **Kill any existing server**:
   ```bash
   pkill -f "python3 -m http.server" 2>/dev/null || true
   ```

2. **Start server from the correct directory**:
   ```bash
   cd /Users/shivamrai/Projects/prompt-library/web-app
   python3 -m http.server 8000 --bind 127.0.0.1
   ```

3. **Try both URLs**:
   - http://127.0.0.1:8000/src/index.html
   - http://localhost:8000/src/index.html

## Testing (Debug Mode)

If the main app still doesn't work, try the test page first:

1. Visit: `http://localhost:8000/test.html`
2. This will show you what's loading and what might be failing

## Troubleshooting

### Common Issues:

1. **Port already in use**:
   ```bash
   # Try a different port
   python3 -m http.server 8001
   # Then visit: http://localhost:8001/src/index.html
   ```

2. **Browser cache issues**:
   - Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
   - Or open in private/incognito mode

3. **Python not found**:
   ```bash
   # Try with python instead of python3
   python -m http.server 8000
   ```

4. **Permission issues**:
   ```bash
   # Make sure you're in the right directory
   pwd
   # Should show: /Users/shivamrai/Projects/prompt-library/web-app
   
   # Check if files exist
   ls src/index.html
   ```

## Expected Behavior

When working correctly, you should see:

- 🚀 **Header**: "Prompt Library" with navigation buttons
- 🔍 **Search bar** with filters
- 📋 **Category cards** for different industries
- 💡 **Sample prompts** with voting buttons
- ✨ **Professional design** with smooth animations

## Features to Test:

1. **Browse prompts** by clicking category cards
2. **Search** for prompts using the search bar
3. **Vote** on prompts using ▲ and ▼ buttons
4. **Add to favorites** using the ♡ button
5. **View prompt details** by clicking on prompt cards
6. **Submit new prompts** using the "Contribute" tab
7. **See trending prompts** in the "Trending" tab

If you're still having issues, let me know what you see in the browser and any error messages!