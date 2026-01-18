
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function cleanup() {
    console.log('--- Starting Data Cleanup ---');

    // 1. Clean Video Categories
    console.log('\nProcessing Video Categories...');
    const categories = await db.videoCategory.findMany();
    const uniqueCategories = new Map<string, number>(); // Name -> Master ID

    for (const cat of categories) {
        if (!uniqueCategories.has(cat.name)) {
            uniqueCategories.set(cat.name, cat.id);
        } else {
            const masterId = uniqueCategories.get(cat.name)!;
            // Reassign videos
            const result = await db.video.updateMany({
                where: { categoryId: cat.id },
                data: { categoryId: masterId }
            });
            if (result.count > 0) console.log(`  Moved ${result.count} videos from ${cat.id} to ${masterId} (${cat.name})`);

            // Delete duplicate
            await db.videoCategory.delete({ where: { id: cat.id } });
            process.stdout.write('.');
        }
    }
    console.log('\nVideo Categories clean.');

    // 2. Clean Video Genres
    console.log('\nProcessing Video Genres...');
    const vGenres = await db.videoGenre.findMany();
    const uniqueVGenres = new Map<string, number>();

    for (const genre of vGenres) {
        if (!uniqueVGenres.has(genre.name)) {
            uniqueVGenres.set(genre.name, genre.id);
        } else {
            const masterId = uniqueVGenres.get(genre.name)!;
            // Reassign videos
            const result = await db.video.updateMany({
                where: { genreId: genre.id },
                data: { genreId: masterId }
            });
            if (result.count > 0) console.log(`  Moved ${result.count} videos from ${genre.id} to ${masterId} (${genre.name})`);

            await db.videoGenre.delete({ where: { id: genre.id } });
            process.stdout.write('.');
        }
    }
    console.log('\nVideo Genres clean.');

    // 3. Clean Music Genres
    console.log('\nProcessing Music Genres...');
    const mGenres = await db.musicGenre.findMany();
    const uniqueMGenres = new Map<string, number>();

    for (const genre of mGenres) {
        if (!uniqueMGenres.has(genre.name)) {
            uniqueMGenres.set(genre.name, genre.id);
        } else {
            const masterId = uniqueMGenres.get(genre.name)!;
            // Reassign songs
            const result = await db.song.updateMany({
                where: { genreId: genre.id },
                data: { genreId: masterId }
            });
            if (result.count > 0) console.log(`  Moved ${result.count} songs from ${genre.id} to ${masterId} (${genre.name})`);

            await db.musicGenre.delete({ where: { id: genre.id } });
            process.stdout.write('.');
        }
    }
    console.log('\nMusic Genres clean.');

    console.log('\n--- Cleanup Complete ---');
}

cleanup()
    .catch(e => console.error(e))
    .finally(async () => {
        await db.$disconnect();
    });
