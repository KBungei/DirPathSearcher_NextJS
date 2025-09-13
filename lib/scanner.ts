import chokidar from 'chokidar';
import fs from 'fs-extra';
import path from 'path';
import {
  addDirectory,
  addRootPath,
  getAllPaths,
  getRootPaths,
  removeDirectory,
} from './db';

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

export async function startInitialScan() {
  if (isScanning) {
    return;
  }
  isScanning = true;
  const rootPaths = await getRootPaths();
  for (const rootPath of rootPaths) {
    await scan(rootPath.path, rootPath.id);
  }
  isScanning = false;
  console.log('Initial scan complete.');
}

export async function scanAndWatch() {
  await startInitialScan();

  const rootPaths = (await getRootPaths()).map((p) => p.path);
  const watcher = chokidar.watch(rootPaths, {
    ignored: /(^|[\\])\/.. /,
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

export async function addNewRootPath(newPath: string) {
    const rootPaths = await getRootPaths();
    if (rootPaths.some(p => p.path === newPath)) {
        console.log('Path already exists.');
        return;
    }
    await addRootPath(newPath);
    const newRootPath = (await getRootPaths()).find(p => p.path === newPath);
    if (newRootPath) {
        await scan(newRootPath.path, newRootPath.id);
        scanAndWatch(); // Re-initialize watcher to include new path
    }
}
