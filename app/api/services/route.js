import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SERVICE_CATEGORIES, PRE_SPECIFIED_CATALOG } from '@/lib/data';

/**
 * GET /api/services
 * Returns skills and services mapped directly to prisma.skill & prisma.service
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skillName = searchParams.get('skill');

    // Query skills and services from PostgreSQL
    const skills = await prisma.skill.findMany({
      where: skillName ? { name: { contains: skillName, mode: 'insensitive' } } : undefined,
      include: {
        services: {
          orderBy: { basePrice: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    if (skills && skills.length > 0) {
      // Flatten catalog list for easy frontend consumption
      const catalog = skills.flatMap((skill) =>
        skill.services.map((service) => ({
          id: service.id,
          skillId: skill.id,
          skillName: skill.name,
          trade: skill.name.toLowerCase().replace(/\s+/g, '-'),
          title: service.name,
          name: service.name,
          description: service.description,
          basePrice: Number(service.basePrice),
          createdAt: service.createdAt,
        }))
      );

      return NextResponse.json({
        success: true,
        data: {
          source: 'NEON_POSTGRESQL',
          skills,
          catalog,
          categories: skills.map((s) => ({
            id: s.id,
            name: s.name,
            serviceCount: s.services.length,
          })),
        },
      }, { status: 200 });
    }

    // Fallback if db is empty before seeding
    return NextResponse.json({
      success: true,
      data: {
        source: 'LOCAL_FALLBACK',
        categories: SERVICE_CATEGORIES,
        catalog: PRE_SPECIFIED_CATALOG,
        skills: [],
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * POST /api/services
 * Create a new service under a skill (Admin / Cooperative)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { skillId, name, description, basePrice } = body;

    if (!skillId || !name || basePrice === undefined) {
      return NextResponse.json({
        success: false,
        error: 'skillId, name, and basePrice are required.',
      }, { status: 400 });
    }

    const newService = await prisma.service.create({
      data: {
        skillId,
        name,
        description,
        basePrice: parseFloat(basePrice),
      },
      include: {
        skill: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      data: newService,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
