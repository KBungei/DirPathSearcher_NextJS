export function getSplitPath(path: string): string[] {
    const sep = path.includes('\\') ? '\\' : '/';
    return path.split(sep);
}

export function isAncestorOf(potentialAncestor: string, potentialDescendant: string): boolean {
    if (!potentialDescendant.startsWith(potentialAncestor) || potentialAncestor.length >= potentialDescendant.length) {
        return false;
    }

    const ancestorParts = getSplitPath(potentialAncestor);
    const descendantParts = getSplitPath(potentialDescendant);

    // Every part of the ancestor must match the beginning of the descendant
    return ancestorParts.every((part, i) => part === descendantParts[i]);
}

export function isDescendantOf(potentialDescendant: string, potentialAncestor: string): boolean {
    return isAncestorOf(potentialAncestor, potentialDescendant);
}

export function getTrueRootPaths(paths: string[]): string[] {
    return paths.filter(path => 
        !paths.some(otherPath => path !== otherPath && isDescendantOf(path, otherPath))
    );
}

