import { getAllPaths } from './db';

const normalizeString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
};

const cleanSearchPhrase = (phrase: string): string => {
    return phrase.replace(/[^a-zA-Z0-9_>!\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function hierarchyCheck(pathParts: string[], terms: string[], ordered: boolean): boolean {
    if (ordered) {
        let lastIndex = -1;
        for (const term of terms) {
            const index = pathParts.findIndex((part, i) => i > lastIndex && part.includes(term));
            if (index === -1) {
                return false;
            }
            lastIndex = index;
        }
        return true;
    } else {
        return terms.every(term => pathParts.some(part => part.includes(term)));
    }
}

export async function search(searchPhrase: string, orderEnforced: boolean): Promise<{ path: string }[]> {
  const allPaths = await getAllPaths();
  const cleanedPhrase = cleanSearchPhrase(searchPhrase);

  let inclusionTerms: string[] = [];
  let exclusionTerms: string[] = [];
  let exclusionOrderEnforced = false;

  if (cleanedPhrase.includes('!')) {
    const parts = cleanedPhrase.split('!');
    inclusionTerms = parts[0].split('>').map(t => t.trim()).filter(t => t);
    const exclusionPart = parts[1];
    exclusionTerms = exclusionPart.split('>').map(t => t.trim()).filter(t => t);
    // The checkbox in UI is for inclusion, let's assume exclusion is ordered if it contains >
    exclusionOrderEnforced = exclusionPart.includes('>'); 

  } else {
    inclusionTerms = cleanedPhrase.split('>').map(t => t.trim()).filter(t => t);
  }

  const normalizedInclusion = inclusionTerms.map(normalizeString);
  const normalizedExclusion = exclusionTerms.map(normalizeString);

  const results = allPaths.filter(p => {
    const normalizedPath = normalizeString(p.path);
    const pathParts = normalizedPath.split(/[\/\\]/);

    // Check for exclusion
    if (normalizedExclusion.length > 0) {
        if (hierarchyCheck(pathParts, normalizedExclusion, exclusionOrderEnforced)) {
            return false;
        }
    }

    // Check for inclusion
    if (normalizedInclusion.length > 0) {
        return hierarchyCheck(pathParts, normalizedInclusion, orderEnforced);
    }

    return false;
  });

  return results.sort((a, b) => {
    const pathA = a.path.split(/[\/\\]/);
    const pathB = b.path.split(/[\/\\]/);
    const len = Math.min(pathA.length, pathB.length);
    for (let i = 0; i < len; i++) {
        const cmp = pathA[i].localeCompare(pathB[i]);
        if (cmp !== 0) {
            return cmp;
        }
    }
    return pathA.length - pathB.length;
  });
}