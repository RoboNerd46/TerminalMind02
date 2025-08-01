import express from 'express';
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

const app = express();
const PORT = process.env.PORT || 3000;
let isStreaming = false; // Prevent multiple streams
let browser = null; // Track Puppeteer browser instance
let ffmpeg = null; // Track FFmpeg process

async function startStream() {
  if (isStreaming) {
    console.log('Stream already running');
    return;
  }

  isStreaming = true;
  try {
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto('https://your-app.onrender.com', { waitUntil: 'networkidle0' });

    // Start FFmpeg process
    const streamKey = process.env.YOUTUBE_STREAM_KEY;
    ffmpeg = spawn('ffmpeg', [
      '-re', // Read input at native frame rate
      '-f', 'image2pipe', // Input format for screenshots
      '-i', 'pipe:0', // Input from Puppeteer screenshots
      '-c:v', 'libx264', // Video codec
      '-preset', 'ultrafast', // Optimize for low latency
      '-b:v', '2000k', // Video bitrate
      '-c:a', 'aac', // Audio codec
      '-b:a', '128k', // Audio bitrate
      '-f', 'flv', // Output format for YouTube
      `rtmp://a.rtmp.youtube.com/live2/${streamKey}`
    ]);

    // Pipe screenshots from Puppeteer to FFmpeg
    const frameRate = 30;
    setInterval(async () => {
      try {
        const screenshot = await page.screenshot({ type: 'png' });
        if (ffmpeg && !ffmpeg.killed) {
          ffmpeg.stdin.write(screenshot);
        }
      } catch (error) {
        console.error('Screenshot error:', error);
      }
    }, 1000 / frameRate);

    ffmpeg.stderr.on('data', (data) => console.error(`FFmpeg error: ${data.toString()}`));
    ffmpeg.on('close', (code) => {
      console.log(`FFmpeg exited with code ${code}`);
      isStreaming = false;
      if (browser) {
        browser.close().catch((err) => console.error('Browser close error:', err));
        browser = null;
      }
      ffmpeg = null;
      console.log('Retrying stream in 5 seconds...');
      setTimeout(startStream, 5000); // Retry after 5 seconds
    });
  } catch (error) {
    console.error('Streaming error:', error);
    isStreaming = false;
    if (browser) {
      browser.close().catch((err) => console.error('Browser close error:', err));
      browser = null;
    }
    ffmpeg = null;
    console.log('Retrying stream in 5 seconds...');
    setTimeout(startStream, 5000); // Retry on error
  }
}

app.get('/start-stream', async (req, res) => {
  if (isStreaming) {
    return res.status(400).send('Stream already running');
  }
  try {
    await startStream();
    res.send('Streaming started');
  } catch (error) {
    res.status(500).send(`Failed to start stream: ${error.message}`);
  }
});

app.get('/stop-stream', async (req, res) => {
  if (!isStreaming) {
    return res.status(400).send('No stream running');
  }
  try {
    if (ffmpeg) {
      ffmpeg.stdin.end();
      ffmpeg.kill('SIGTERM');
    }
    if (browser) {
      await browser.close();
      browser = null;
    }
    isStreaming = false;
    ffmpeg = null;
    res.send('Stream stopped');
  } catch (error) {
    res.status(500).send(`Failed to stop stream: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Automatically start streaming on server boot
  startStream();
});