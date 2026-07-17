import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { toPublicUrl } from '../../src/helpers/url.helper.ts';

describe('URL Helper - toPublicUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return null if filePath is missing', () => {
    expect(toPublicUrl(null)).toBeNull();
    expect(toPublicUrl('')).toBeNull();
  });

  it('should format URL correctly without trailing slash on APP_URL', () => {
    process.env.APP_URL = 'http://example.com';
    const result = toPublicUrl('/var/tmp/avatar.png');
    expect(result).toBe('http://example.com/uploads/usuarios/avatar.png');
  });

  it('should format URL correctly with trailing slash on APP_URL', () => {
    process.env.APP_URL = 'http://example.com/';
    const result = toPublicUrl('/var/tmp/avatar.png');
    expect(result).toBe('http://example.com/uploads/usuarios/avatar.png');
  });

  it('should support custom publicDir', () => {
    process.env.APP_URL = 'http://example.com';
    const result = toPublicUrl('/var/tmp/photo.jpg', 'custom/dir');
    expect(result).toBe('http://example.com/custom/dir/photo.jpg');
  });

  it('should support APP_URL with subpaths', () => {
    process.env.APP_URL = 'http://example.com/api/v1';
    const result = toPublicUrl('/var/tmp/avatar.png');
    expect(result).toBe('http://example.com/api/v1/uploads/usuarios/avatar.png');
  });

  it('should support APP_URL with subpaths and trailing slash', () => {
    process.env.APP_URL = 'http://example.com/api/v1/';
    const result = toPublicUrl('/var/tmp/avatar.png');
    expect(result).toBe('http://example.com/api/v1/uploads/usuarios/avatar.png');
  });
});
