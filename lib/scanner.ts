import chokidar from 'chokidar';
import fs from 'fs-extra';
import path from 'path';
import {
  addDirectory,
  addRootPath,
  clearPathsForRoot,
  getAllPaths,
  getRootPaths,
  removeDirectory,
  removePaths,
} from './db';
import { getTrueRootPaths, isDescendantOf } from './path-utils';

let isScanning = false;

async function scan(rootPath: string, rootPathId: number) {
  try {
    const entries = await fs.readdir(rootPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(rootPath, entry.name);
      if (entry.isDirectory()) {
        await addDirectory(fullPath, rootPathId);
        await scan(fullPath, rootPathId);
      }
    }
  } catch (error) {
    console.error(`Error scanning ${rootPath}:`, error);
  }
}

export async function rescanRootPath(rootPath: string) {
    let rootPaths = await getRootPaths();
    let root = rootPaths.find(p => p.path === rootPath);

    if (!root) {
        await addRootPath(rootPath);
        rootPaths = await getRootPaths();
        root = rootPaths.find(p => p.path === rootPath);
    }

    if (root) {
        await clearPathsForRoot(root.id);
        await scan(root.path, root.id);
    }
}

export async function validateAndRefreshAllRootPaths() {
  const allDbPaths = (await getAllPaths()).map(p => p.path);
  if (allDbPaths.length === 0) {
    return;
  }

  const trueRootPaths = getTrueRootPaths(allDbPaths);

  for (const rootPath of trueRootPaths) {
    const pathExists = await fs.pathExists(rootPath);

    if (pathExists) {
      // Path is valid, rescan to check for internal changes
      await rescanRootPath(rootPath);
    } else {
      // Path is invalid, remove it and all its descendants from the DB
      const descendants = allDbPaths.filter(p => isDescendantOf(p, rootPath));
      const pathsToRemove = [rootPath, ...descendants];
      await removePaths(pathsToRemove);
    }
  }
}


export async function startInitialScan() {
  if (isScanning) {
    return;
  }
  isScanning = true;
  await validateAndRefreshAllRootPaths();
  isScanning = false;
  console.log('Initial scan complete.');
}

export async function scanAndWatch() {
  await startInitialScan();

  const rootPaths = (await getRootPaths()).map((p) => p.path);
  const watcher = chokidar.watch(rootPaths, {
    ignored: /(^|[\\/])\.. /, 
    persistent: true,
    ignoreInitial: true,
    depth: Infinity,
  });

  watcher
    .on('addDir', async (dirPath) => {
      console.log(`Directory ${dirPath} has been added`);
      const root = rootPaths.find((r) => dirPath.startsWith(r));
      if (root) {
        const rootPathId = (await getRootPaths()).find(r => r.path === root)?.id;
        if (rootPathId) {
            await addDirectory(dirPath, rootPathId);
        }
      }
    })
    .on('unlinkDir', async (dirPath) => {
      console.log(`Directory ${dirPath} has been removed`);
      await removeDirectory(dirPath);
    })
    .on('error', (error) => console.error(`Watcher error: ${error}`));
}
