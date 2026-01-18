
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function analyze() {
    console.log('--- Analyzing Duplicates ---');

    console.log('\n1. Video Categories:');
    const videoCategories = await db.videoCategory.groupBy({
        by: ['name'],
        _count: { name: true },
        having: { name: { _count: { gt: 1 } } },
    });
    if (videoCategories.length === 0) console.log('   No duplicates found.');
    videoCategories.forEach(c => console.log(`   "${c.name}": ${c._count.name} times`));

    console.log('\n2. Video Genres:');
    const videoGenres = await db.videoGenre.groupBy({
        by: ['name'],
        _count: { name: true },
        having: { name: { _count: { gt: 1 } } },
    });
    if (videoGenres.length === 0) console.log('   No duplicates found.');
    videoGenres.forEach(g => console.log(`   "${g.name}": ${g._count.name} times`));

    console.log('\n3. Music Genres:');
    const musicGenres = await db.musicGenre.groupBy({
        by: ['name'],
        _count: { name: true },
        having: { name: { _count: { gt: 1 } } },
    });
    if (musicGenres.length === 0) console.log('   No duplicates found.');
    musicGenres.forEach(g => console.log(`   "${g.name}": ${g._count.name} times`));

    console.log('\n--- End Analysis ---');
}

analyze()
    .catch(e => console.error(e))
    .finally(async () => {
        await db.$disconnect();
    });
