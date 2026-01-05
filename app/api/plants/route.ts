import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface Plant {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

// Get all plants
export async function GET() {
  try {
    const plants = await prisma.plant.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        blooms: true,
      },
    });

    const plantsResponse: Plant[] = plants.map((plant: any): Plant => ({
      id: plant.id,
      name: plant.name,
      description: plant.description || '',
      createdAt: plant.createdAt.toISOString(),
    }));

    return NextResponse.json({ plants: plantsResponse });
  } catch (error) {
    console.error('Error fetching plants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plants' },
      { status: 500 }
    );
  }
}

// Create a new plant
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Plant name is required' },
        { status: 400 }
      );
    }

    const plant = await prisma.plant.create({
      data: {
        name,
        description: description || '',
      },
    });

    return NextResponse.json({
      plant: {
        id: plant.id,
        name: plant.name,
        description: plant.description || '',
        createdAt: plant.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating plant:', error);
    return NextResponse.json(
      { error: 'Failed to create plant' },
      { status: 500 }
    );
  }
}

// Update a plant
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Plant ID is required' },
        { status: 400 }
      );
    }

    // Validate plant exists
    const existingPlant = await prisma.plant.findUnique({
      where: { id: parseInt(id.toString()) },
    });

    if (!existingPlant) {
      return NextResponse.json(
        { error: 'Plant not found' },
        { status: 404 }
      );
    }

    // Update plant
    const updatedPlant = await prisma.plant.update({
      where: { id: parseInt(id.toString()) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({
      plant: {
        id: updatedPlant.id,
        name: updatedPlant.name,
        description: updatedPlant.description || '',
        createdAt: updatedPlant.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating plant:', error);
    return NextResponse.json(
      { error: 'Failed to update plant' },
      { status: 500 }
    );
  }
}

// Delete a plant
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const plantId = searchParams.get('id');

    if (!plantId) {
      return NextResponse.json(
        { error: 'Plant ID is required' },
        { status: 400 }
      );
    }

    // Delete plant (blooms will be unassigned via ON DELETE SET NULL)
    await prisma.plant.delete({
      where: { id: parseInt(plantId) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plant:', error);
    return NextResponse.json(
      { error: 'Failed to delete plant' },
      { status: 500 }
    );
  }
}
