import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createServerClient } from '@/lib/supabase';

// PCM (Linear16) を WAV に変換するヘルパー
function pcmToWav(pcmBuffer, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const wav = Buffer.alloc(totalSize);

  // RIFF header
  wav.write('RIFF', 0);
  wav.writeUInt32LE(totalSize - 8, 4);
  wav.write('WAVE', 8);

  // fmt sub-chunk
  wav.write('fmt ', 12);
  wav.writeUInt32LE(16, 16);       // sub-chunk size
  wav.writeUInt16LE(1, 20);        // PCM format
  wav.writeUInt16LE(channels, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(byteRate, 28);
  wav.writeUInt16LE(blockAlign, 32);
  wav.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  wav.write('data', 36);
  wav.writeUInt32LE(dataSize, 40);
  pcmBuffer.copy(wav, 44);

  return wav;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Generate audio using Gemini TTS
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Aoede',
            },
          },
        },
      },
    });

    // Extract audio data from response
    const audioPart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (!audioPart || !audioPart.data) {
      console.error('No audio data in Gemini response');
      return NextResponse.json({ error: 'No audio generated' }, { status: 500 });
    }

    // Decode base64 PCM audio and convert to WAV
    const pcmBuffer = Buffer.from(audioPart.data, 'base64');
    const wavBuffer = pcmToWav(pcmBuffer);

    // Upload to Supabase Storage
    const supabase = createServerClient();
    const filename = `${crypto.randomUUID()}.wav`;
    const filePath = `audio/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(filePath, wavBuffer, {
        contentType: 'audio/wav',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Audio upload failed' }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('audio')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json({ error: 'Audio generation failed' }, { status: 500 });
  }
}
