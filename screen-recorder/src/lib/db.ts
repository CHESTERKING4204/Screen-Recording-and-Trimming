import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'videos.json');

export interface VideoRecord {
  id: string;
  filename: string;
  originalName: string;
  createdAt: string;
  views: number;
  completions: number;
  duration: number;
}

function ensureDbExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ videos: [] }));
  }
}

export function getVideos(): VideoRecord[] {
  ensureDbExists();
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  return data.videos;
}

export function getVideo(id: string): VideoRecord | undefined {
  return getVideos().find((v) => v.id === id);
}

export function saveVideo(video: VideoRecord) {
  ensureDbExists();
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  data.videos.push(video);
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function updateVideo(id: string, updates: Partial<VideoRecord>) {
  ensureDbExists();
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  const index = data.videos.findIndex((v: VideoRecord) => v.id === id);
  if (index !== -1) {
    data.videos[index] = { ...data.videos[index], ...updates };
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }
}
