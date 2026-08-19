import crypto from 'crypto';
import { serverConfig } from '@/lib/config/server';

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const pepper = serverConfig.ADMIN_HASH_PEPPER;
  return new Promise<boolean>((resolve, reject) => {
    crypto.pbkdf2(password + pepper, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const computedHash = derivedKey.toString('hex');
        const result = crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(hash, 'hex'));
        resolve(result);
      } catch (compareErr) {
        resolve(false);
      }
    });
  });
}
