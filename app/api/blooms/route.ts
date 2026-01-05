import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface BloomMetadata {
  id: number;
  url: string;
  pathname: string;
  uploadedAt: string;
  plantId?: number | null;
}

// Get all blooms
export async function GET() {
  try {
    const blooms = await prisma.bloom.findMany({
      orderBy: {
        uploadedAt: 'desc',
      },
      include: {
        plant: true,
      },
    });

    const bloomsResponse: BloomMetadata[] = blooms.map((bloom: any): BloomMetadata => ({
      id: bloom.id,
      url: bloom.url,
      pathname: bloom.pathname,
      uploadedAt: bloom.uploadedAt.toISOString(),
      plantId: bloom.plantId,
    }));

    return NextResponse.json({ blooms: bloomsResponse });
  } catch (error) {
    console.error('Error fetching blooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blooms' },
      { status: 500 }
    );
  }
}

// Update bloom's plant assignment
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { bloomId, plantId } = body;

    if (!bloomId) {
      return NextResponse.json(
        { error: 'Bloom ID is required' },
        { status: 400 }
      );
    }

    // Validate bloom exists
    const existingBloom = await prisma.bloom.findUnique({
      where: { id: parseInt(bloomId.toString()) },
    });

    if (!existingBloom) {
      return NextResponse.json(
        { error: 'Bloom not found' },
        { status: 404 }
      );
    }

    // Validate plant exists if plantId provided
    if (plantId) {
      const plant = await prisma.plant.findUnique({
        where: { id: parseInt(plantId.toString()) },
      });

      if (!plant) {
        return NextResponse.json(
          { error: 'Plant not found' },
          { status: 404 }
        );
      }
    }

    // Update bloom with atomic transaction
    const updatedBloom = await prisma.bloom.update({
      where: { id: parseInt(bloomId.toString()) },
      data: {
        plantId: plantId ? parseInt(plantId.toString()) : null,
      },
    });

    return NextResponse.json({
      bloom: {
        id: updatedBloom.id,
        url: updatedBloom.url,
        pathname: updatedBloom.pathname,
        uploadedAt: updatedBloom.uploadedAt.toISOString(),
        plantId: updatedBloom.plantId,
      },
    });
  } catch (error) {
    console.error('Error updating bloom:', error);
    return NextResponse.json(
      { error: 'Failed to update bloom' },
      { status: 500 }
    );
  }
}

// Delete a bloom
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bloomId = searchParams.get('id');

    if (!bloomId) {
      return NextResponse.json(
        { error: 'Bloom ID is required' },
        { status: 400 }
      );
    }

    // Delete bloom from database
    await prisma.bloom.delete({
      where: { id: parseInt(bloomId) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bloom:', error);
    return NextResponse.json(
      { error: 'Failed to delete bloom' },
      { status: 500 }
    );
  }
}
