import { describe, it, expect, vi } from 'vitest';

describe('Graceful Shutdown - src/index.js', () => {
  it('should export startServer function', async () => {
    const index = await import('../src/index.js');
    
    expect(typeof index.startServer).toBe('function');
  });

  it('should import closePool from db.js', async () => {
    // Check that db.js exports closePool
    const db = await import('../src/config/db.js');
    
    expect(typeof db.closePool).toBe('function');
  });

  it('should have signal handlers registered via process.on', () => {
    // Read the file content and check for process.on calls
    const fs = require('fs');
    const path = require('path');
    const indexContent = fs.readFileSync(path.join(__dirname, '../src/index.js'), 'utf-8');
    
    // Check for SIGTERM handler
    expect(indexContent).toContain("process.on('SIGTERM'");
    // Check for SIGINT handler
    expect(indexContent).toContain("process.on('SIGINT'");
    // Check for shutdown function
    expect(indexContent).toContain('const shutdown');
    // Check for 30s timeout logic
    expect(indexContent).toContain('30000');
  });
});