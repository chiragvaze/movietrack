# Logo Animation Video Setup

## 📁 Upload Your Video Here

Place your logo animation video in this folder with the following name:
- **Primary file**: `logo-animation.mp4`
- **Optional (for better compression)**: `logo-animation.webm`

## 📋 Video Requirements

### Recommended Specifications:
- **Duration**: 2-4 seconds (max 5 seconds)
- **File Size**: Under 2-3 MB for fast loading
- **Resolution**: 1920x1080 (Full HD) or 1280x720 (HD)
- **Format**: MP4 (H.264 codec)
- **Aspect Ratio**: 16:9 or your logo's aspect ratio

### Optimization Tips:
1. **Compress your video** using tools like:
   - HandBrake (free desktop app)
   - Adobe Media Encoder
   - Online tools: cloudconvert.com, freeconvert.com

2. **Export Settings** (if using video editing software):
   - Codec: H.264
   - Bitrate: 2-4 Mbps (lower for shorter videos)
   - Audio: Not needed (will be muted anyway)
   - Preset: Web/Streaming

3. **Optional WebM version** (better compression):
   - Use ffmpeg: `ffmpeg -i logo-animation.mp4 -c:v libvpx-vp9 -b:v 1M logo-animation.webm`
   - Or online converters

## 🎯 What Happens

1. Video plays automatically when users first visit the homepage
2. "Skip" button appears after 1.5 seconds
3. Video auto-skips after 5 seconds (max)
4. Only shows once per browser session
5. Smooth fade-out transition to main content

## 🔧 Configuration

You can customize the behavior in `frontend/js/splash-screen.js`:

```javascript
const config = {
    minDisplayTime: 1000,  // Minimum display time (1 second)
    maxDisplayTime: 5000,  // Auto-skip after 5 seconds
    fadeOutDuration: 800   // Fade animation duration
};
```

## 🚀 Testing

After uploading your video:
1. Open `index.html` in a browser
2. Refresh the page (Ctrl+Shift+R for hard refresh)
3. To test again, clear session storage in DevTools

## ⚠️ Troubleshooting

**Video doesn't play?**
- Check the filename matches exactly: `logo-animation.mp4`
- Ensure the file is in the correct folder
- Try a hard refresh (Ctrl+Shift+R)

**Video is too large?**
- Compress it to under 2 MB
- Reduce resolution or bitrate
- Shorten duration to 2-3 seconds

**Want to disable it temporarily?**
- Comment out the splash screen script in `index.html`:
  ```html
  <!-- <script src="js/splash-screen.js"></script> -->
  ```

## 📱 Responsive Design

The splash screen is fully responsive and will:
- Scale video to fit any screen size
- Adjust skip button position on mobile
- Maintain aspect ratio on all devices

---

**Ready?** Just drop your `logo-animation.mp4` file in this folder and refresh your homepage!
