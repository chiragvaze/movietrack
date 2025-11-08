# 🚀 Quick Start Guide - New Features

## 🎯 Overview
This guide will help you quickly start using the 4 new features in MovieTrack.

---

## 1. 📌 Tags & Lists - Quick Start

### Create Your First Tag (30 seconds)
1. Click **"Tags & Lists"** in the sidebar
2. Type a tag name (e.g., "Favorites")
3. Click **"Add Tag"**
4. Done! Your tag is created

### Tag a Movie (15 seconds)
1. Go to Dashboard
2. Click any movie card
3. Click **"Edit"** button
4. Add tag in the tags field
5. Save

### Create Your First List (1 minute)
1. Go to Tags & Lists page
2. Click **"Create New List"**
3. Name your list (e.g., "Best of 2024")
4. Click movies to add them
5. Click **"Create List"**

**Pro Tip**: Use tags for categories (mood, quality) and lists for curated collections!

---

## 2. 📅 Watch Calendar - Quick Start

### View Your Watching History (10 seconds)
1. Click **"Watch Calendar"** in sidebar
2. See your activity heatmap
3. **Empty** = No movies
4. **Light Red** = 1 movie
5. **Medium Red** = 2-3 movies
6. **Dark Red** = 4+ movies

### Check What You Watched (5 seconds)
1. Click any colored day
2. See all movies watched that day
3. Click movie to see details

### Navigate Months (5 seconds)
1. Use **←** and **→** buttons
2. Jump to any month
3. Stats update automatically

**Pro Tip**: Track your viewing streaks in the stats cards!

---

## 3. 📺 Episode Tracker - Quick Start

### Track Your First Episode (30 seconds)
1. Find a TV show on Dashboard
2. Click the **📋 icon** (Track Episodes)
3. Click any season to expand
4. Click checkbox next to episode
5. Watch your progress update!

### Mark Multiple Episodes (10 seconds)
1. Open episode tracker
2. Click **"Mark All Watched"**
3. Confirm
4. All episodes marked!

### Export Your Progress (5 seconds)
1. Open episode tracker
2. Click **"Export Progress"**
3. JSON file downloads
4. Keep as backup!

**Pro Tip**: Use "Clear All" to restart tracking a rewatch!

---

## 🎬 Common Use Cases

### Use Case 1: Movie Night Planning
**Goal**: Create a "Date Night" list
```
1. Tags & Lists → Create tag "Date Night"
2. Dashboard → Edit romantic movies
3. Add "Date Night" tag
4. Tags & Lists → Click tag → See all options
```

### Use Case 2: Track TV Series
**Goal**: Track Breaking Bad episodes
```
1. Add Breaking Bad to collection
2. Dashboard → Click 📋 on Breaking Bad
3. Click Season 1
4. Check off episodes as you watch
5. See progress bar update
```

### Use Case 3: Review Watch History
**Goal**: See what you watched last month
```
1. Watch Calendar
2. Click ← to go to last month
3. Click days with activity
4. Review your choices
```

### Use Case 4: Organize Collection
**Goal**: Tag all Marvel movies
```
1. Create "MCU" tag
2. Filter dashboard to show only Marvel
3. Bulk edit → Add "MCU" tag
4. Now filter by tag anytime
```

---

## 💡 Pro Tips

### Tags Best Practices:
✅ Keep tags short (1-2 words)
✅ Be consistent with naming
✅ Use lowercase for uniformity
✅ Common tags: favorites, rewatch, family-friendly, classic
❌ Don't over-tag (3-5 tags per movie is enough)

### Lists Best Practices:
✅ Create themed lists (mood, year, quality)
✅ Keep lists manageable (10-30 movies)
✅ Update lists regularly
✅ Examples: "Top 10 Thrillers", "Comfort Movies", "Movies to Rewatch"

### Calendar Tips:
✅ Set watched dates when adding movies
✅ Check calendar weekly to spot patterns
✅ Use streaks to build watching habits
✅ Compare months to see trends

### Episode Tracker Tips:
✅ Mark episodes immediately after watching
✅ Export progress before marathons
✅ Use progress bars to motivate completion
✅ Clear all to track rewatches separately

---

## 🔥 Power User Features

### Advanced Tag Filtering:
```javascript
// In browser console
// Get all movies with multiple tags
const sciFiThrillers = movies.filter(m => 
  m.tags.includes('sci-fi') && m.tags.includes('thriller')
);
```

### Batch Tagging:
1. Create tag in Tags & Lists
2. Go to Dashboard
3. Filter movies you want to tag
4. Edit each and add tag
5. Consider creating a list instead for easier management

### Calendar Analytics:
- **Best month**: Check which month you watched most
- **Trends**: Compare this year vs last year
- **Streaks**: Track your longest streak
- **Favorites**: Days with high ratings

### Episode Tracker Export:
```json
// Exported JSON includes:
{
  "title": "Show Name",
  "watchedEpisodes": [...],
  "progress": {
    "percentage": "72.5"
  }
}
// Import back by manually marking episodes
```

---

## 🆘 Quick Troubleshooting

### Tags not showing?
```
✓ Refresh the page
✓ Check you're logged in
✓ Verify tag was saved (check API)
✓ Clear browser cache
```

### Calendar empty?
```
✓ Ensure movies have watched dates
✓ Check you're viewing right month
✓ Verify movies marked as "watched"
✓ Refresh page
```

### Episode tracker loading slow?
```
✓ Normal for shows with many seasons
✓ Each season loads individually
✓ Wait for TMDB API response
✓ Check internet connection
```

### Can't create list?
```
✓ Give list a unique name
✓ Select at least one movie
✓ Check you're logged in
✓ Try again in a few seconds
```

---

## 📱 Mobile Quick Start

### Tags on Mobile:
1. Tap sidebar menu (☰)
2. Tap "Tags & Lists"
3. Use bottom navigation
4. Swipe cards to navigate

### Calendar on Mobile:
1. Tap sidebar menu
2. Tap "Watch Calendar"
3. Swipe left/right for months
4. Tap days to see details
5. Stats scroll horizontally

### Episodes on Mobile:
1. Tap 📋 on TV show
2. Tap season to expand
3. Tap checkboxes
4. Scroll to see all
5. Use bulk buttons at top

---

## 🎯 30-Second Quick Wins

**Quick Win 1**: Create "Favorites" tag
```
Sidebar → Tags & Lists → Type "Favorites" → Add
```

**Quick Win 2**: View last month's watching
```
Sidebar → Calendar → Click ← once
```

**Quick Win 3**: Track first episode
```
Dashboard → Find TV show → Click 📋 → Expand season → Check episode
```

**Quick Win 4**: Create "To Watch" list
```
Tags & Lists → Create List → Name it → Add movies
```

---

## 🏁 Next Steps

Once you're comfortable:
1. ✅ Tag all your existing movies
2. ✅ Create themed lists
3. ✅ Track all active TV shows
4. ✅ Review calendar monthly
5. ✅ Export episode progress regularly

---

## 📚 Resources

- **Full Documentation**: See `NEW_FEATURES.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **API Reference**: See backend routes documentation
- **Keyboard Shortcuts**: Press `?` in app (coming soon)

---

## 🎉 You're Ready!

All features are live and ready to use. Start with one feature at a time:

**Day 1**: Explore Tags & Lists  
**Day 2**: Check out Calendar  
**Day 3**: Try Episode Tracker  
**Day 4**: Combine all features!

---

**Need Help?** Check console logs (F12) or refer to full documentation.

**Happy Tracking! 🎬📺🍿**
