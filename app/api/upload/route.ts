import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface BloomMetadata {
  id: number;
  url: string;
  pathname: string;
  uploadedAt: string;
  plantId?: number | null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const plantIdStr = formData.get('plantId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate plant exists if plantId provided
    let plantId: number | null = null;
    if (plantIdStr) {
      const plant = await prisma.plant.findUnique({
        where: { id: parseInt(plantIdStr) },
      });

      if (!plant) {
        return NextResponse.json(
          { error: 'Plant not found' },
          { status: 404 }
        );
      }
      plantId = plant.id;
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split('.').pop();
    const fileNameWithoutExt = file.name.replace(`.${fileExtension}`, '');
    const uniqueFileName = `${fileNameWithoutExt}-${timestamp}-${randomSuffix}.${fileExtension}`;

    // Upload image to Vercel Blob
    const blob = await put(uniqueFileName, file, {
      access: 'public',
    });

    // Create bloom metadata in database (atomic operation - no race condition)
    const bloom = await prisma.bloom.create({
      data: {
        url: blob.url,
        pathname: blob.pathname,
        plantId: plantId,
      },
    });

    return NextResponse.json({
      bloom: {
        id: bloom.id,
        url: bloom.url,
        pathname: bloom.pathname,
        uploadedAt: bloom.uploadedAt.toISOString(),
        plantId: bloom.plantId ?? undefined,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
