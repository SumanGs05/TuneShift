import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch user's migration history
export async function GET(request) {
  try {
    const session = await auth();

    if (!session?.userId) {
      // Return demo data for unauthenticated users
      return NextResponse.json({
        migrations: [],
      });
    }

    const migrations = await prisma.migration.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({ migrations });
  } catch (error) {
    console.error('Error fetching migrations:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch migrations' },
      { status: 500 }
    );
  }
}

// POST - Create new migration record
export async function POST(request) {
  try {
    const session = await auth();
    const { source, destination, report } = await request.json();

    if (!session?.userId) {
      
      return NextResponse.json({
        success: true,
        migration: {
          id: `demo-${Date.now()}`,
          source,
          destination,
          report,
          createdAt: new Date().toISOString(),
        },
      });
    }

    const migration = await prisma.migration.create({
      data: {
        userId: session.userId,
        source,
        destination,
        status: 'completed',
        report,
      },
    });

    return NextResponse.json({
      success: true,
      migration,
    });
  } catch (error) {
    console.error('Error creating migration:', error);
    
    return NextResponse.json(
      { error: 'Failed to create migration record' },
      { status: 500 }
    );
  }
}


