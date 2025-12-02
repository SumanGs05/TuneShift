const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  
  const user = await prisma.user.upsert({
    where: { email: 'demo@tuneshift.app' },
    update: {},
    create: {
      email: 'demo@tuneshift.app',
      name: 'Demo User',
    },
  });

  console.log('✓ Created demo user:', user.email);

  
  const migrations = [
    {
      userId: user.id,
      source: 'spotify',
      destination: 'soundcloud',
      status: 'completed',
      report: {
        totalTracks: 156,
        matchedTracks: 142,
        skippedTracks: [
          { name: 'Rare Track 1', artist: 'Unknown Artist', reason: 'Not found' },
          { name: 'Local File', artist: 'Local', reason: 'Local file' },
        ],
        playlists: [
          { name: 'Summer Hits', total: 45, matched: 43 },
          { name: 'Workout Mix', total: 32, matched: 30 },
          { name: 'Chill Vibes', total: 79, matched: 69 },
        ],
      },
    },
    {
      userId: user.id,
      source: 'youtube',
      destination: 'tidal',
      status: 'completed',
      report: {
        totalTracks: 89,
        matchedTracks: 78,
        skippedTracks: [
          { name: 'YouTube Exclusive', artist: 'Various', reason: 'Not found' },
        ],
        playlists: [
          { name: 'My Favorites', total: 89, matched: 78 },
        ],
      },
    },
    {
      userId: user.id,
      source: 'soundcloud',
      destination: 'spotify',
      status: 'completed',
      report: {
        totalTracks: 234,
        matchedTracks: 228,
        skippedTracks: [],
        playlists: [
          { name: 'Road Trip', total: 67, matched: 65 },
          { name: 'Study Music', total: 45, matched: 44 },
          { name: 'Party Playlist', total: 122, matched: 119 },
        ],
      },
    },
  ];

  for (const migration of migrations) {
    await prisma.migration.create({
      data: migration,
    });
  }

  console.log('✓ Created', migrations.length, 'sample migrations');
  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

