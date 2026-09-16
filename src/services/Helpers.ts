import getDB from "../db/dbClient";

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function generateUniqueName(basename: string | null, userId: string) {
    const base = basename ?? "Untitled";
    const escapedBase = escapeRegExp(base);

    const db = await getDB();

    const results = await db.select<{ name: string }[]>(
        'SELECT name FROM collections WHERE user_id = ? AND name LIKE ?',
        [userId, `${base}%`]
    );

    const exactOrNumRegex = new RegExp(`^${escapedBase}(?:-[0-9]+)?$`);
    const existingNames = results
        .map(row => row.name)
        .filter(name => exactOrNumRegex.test(name));

    if (existingNames.length === 0) {
        return base;
    }

    const usedNums = new Set<number>();
    const numRegex = new RegExp(`^${escapedBase}-([0-9]+)$`);

    for (const name of existingNames) {
        const match = name.match(numRegex);
        if (match && match[1]) {
            usedNums.add(parseInt(match[1], 10));
        }
    }

    let counter = 1;
    while (usedNums.has(counter)) {
        counter++;
    }

    return `${base}-${counter}`;
}

export function now(date: Date = new Date()) {
  return date.toISOString().replace('T', ' ').slice(0, 19);
}