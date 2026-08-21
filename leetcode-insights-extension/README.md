# LeetCode Insights Chrome Extension

A lightweight Chrome extension that adds company frequency insights directly into the LeetCode problem lists.

## Features
- Displays top companies and frequencies next to problem titles on LeetCode.
- Lightweight: No React or heavy frameworks. Pure vanilla JS and CSS.
- Fast: Uses a local JSON file (`data.json`) for instant lookups without API rate limits.
- Toggle On/Off via the extension popup.

## Installation (Unpacked)

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle switch in the top right corner).
3. Click on **Load unpacked** in the top left.
4. Select the `leetcode-insights` folder.
5. The extension is now installed and active!

## How to use

1. Go to [LeetCode Problemset](https://leetcode.com/problemset/all/) or any study plan page.
2. You will see company badges next to problems that have data (e.g., "Two Sum", "LRU Cache").
3. Click the extension icon in the Chrome toolbar to toggle the insights on or off.

## Updating the Data

The extension uses `data.json` for its insights. It currently ships with a sample dataset for popular problems. 
To use a comprehensive dataset:
1. Find an open-source LeetCode company dataset (e.g., on GitHub).
2. Format it as a dictionary mapping problem slugs to an array of company objects:
   ```json
   {
     "problem-slug": [
       { "company": "Company A", "freq": 100 },
       { "company": "Company B", "freq": 50 }
     ]
   }
   ```
3. Replace the contents of `data.json` in the extension folder.
4. Go to `chrome://extensions/` and click the **Reload** button on the extension card.

## License
MIT
