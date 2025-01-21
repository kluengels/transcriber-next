// stream audio file from supabase

import { NextResponse } from 'next/server';
import { getAudioFileUrl } from '@/lib/supabase/actions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const projectId = searchParams.get('projectId');
  const filename = searchParams.get('filename');

  if (!userId || !projectId || !filename) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }


  // fetch audio file from supabase 
  const { data: audioBlob, error } = await getAudioFileUrl({ userId, projectId, filename });

  if (error || !audioBlob) {
    return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
  }

  const arrayBuffer = await audioBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const headers: HeadersInit = {
    'Content-Type': audioBlob.type,
    'Accept-Ranges': 'bytes',
  };

  // This allows the client to request specific parts of the audio file
  const range = request.headers.get('Range');
  if (range) {
    const bytesPrefix = 'bytes=';
    if (range.startsWith(bytesPrefix)) {
      const bytesRange = range.substring(bytesPrefix.length);
      const parts = bytesRange.split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : buffer.length - 1;

      if (isNaN(start) || isNaN(end) || start >= buffer.length || end >= buffer.length) {
        return NextResponse.json({ error: 'Invalid range' }, { status: 416 });
      }

      const chunk = buffer.subarray(start, end + 1);
      headers['Content-Range'] = `bytes ${start}-${end}/${buffer.length}`;
      headers['Content-Length'] = chunk.length.toString();

      // When a valid Range header is found, the server responds with a 206 Partial Content status, serving only the requested byte range
      return new NextResponse(chunk, {
        status: 206,
        headers,
      });
    }
  }

  headers['Content-Length'] = buffer.length.toString();
  return new NextResponse(buffer, { headers });
}