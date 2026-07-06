import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const bgDir = path.join(process.cwd(), 'bg');
    if (!fs.existsSync(bgDir)) {
      return NextResponse.json([]);
    }
    const files = fs.readdirSync(bgDir);
    const images = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
    return NextResponse.json(images.map(img => `/api/backgrounds/${img}`));
  } catch (error) {
    console.error('Error reading backgrounds:', error);
    return NextResponse.json([]);
  }
}
