import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Graceful Shutdown - src/index.ts', () => {
  it('should export startServer function', async () => {
    const index = await import('../src/index.ts');

    expect(typeof index.startServer).toBe('function');
  });

  it('should import closePool from db.ts', async () => {
    const db = await import('../src/config/db.ts');

    expect(typeof db.closePool).toBe('function');
  });

  it('should have signal handlers registered via process.on', () => {
    const indexPath = path.join(__dirname, '../src/index.ts');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');

    expect(indexContent).toContain("process.on('SIGTERM'");
    expect(indexContent).toContain("process.on('SIGINT'");
    expect(indexContent).toContain('const shutdown');
    expect(indexContent).toContain('30000');
  });
});
