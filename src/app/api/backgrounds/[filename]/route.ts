import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const resolvedParams = await params;
    const bgDir = path.join(process.cwd(), 'bg');
    
    // Security check to prevent directory traversal
    const safeFilename = path.normalize(resolvedParams.filename).replace(/^(\.\.(\/|\\|$))+/, '');
    const filePath = path.join(bgDir, safeFilename);
    
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Not found', { status: 404 });
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    
    // Guess mime type
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    
    return new NextResponse(fileBuffer, {
      headers: { 
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
