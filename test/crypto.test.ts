import {
  generateSalt,
  hashPin,
  encryptText,
  decryptText,
} from '../lib/src/utils/crypto';

describe('crypto utils', () => {
  describe('generateSalt', () => {
    it('16バイト（32文字の16進数）のソルトを生成すること', () => {
      const salt = generateSalt();
      expect(typeof salt).toBe('string');
      expect(salt).toHaveLength(32);
      expect(salt).toMatch(/^[0-9a-f]{32}$/);
    });

    it('連続呼び出しで異なるソルトが生成されること', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('hashPin', () => {
    it('PINとソルトから64文字の16進数SHA-256ハッシュを生成すること', async () => {
      const pin = '1234';
      const salt = generateSalt();
      const hash = await hashPin(pin, salt);

      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('同一のPINとソルトからは常に同一のハッシュ値が得られること', async () => {
      const pin = '9999';
      const salt = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
      const hash1 = await hashPin(pin, salt);
      const hash2 = await hashPin(pin, salt);

      expect(hash1).toBe(hash2);
    });

    it('PINが異なればハッシュ値も異なること', async () => {
      const salt = generateSalt();
      const hash1 = await hashPin('1234', salt);
      const hash2 = await hashPin('5678', salt);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('encryptText & decryptText', () => {
    it('平文テキストを暗号化し、正しいPINとソルトで復号できること', async () => {
      const plainText = 'これは極秘のメモです。SecureMemo 1234! 🚀';
      const pin = '4321';
      const salt = generateSalt();

      const encrypted = await encryptText(plainText, pin, salt);
      expect(encrypted.cipherText).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.cipherText).not.toBe(plainText);

      const decrypted = await decryptText(
        encrypted.cipherText,
        encrypted.iv,
        pin,
        salt
      );

      expect(decrypted).toBe(plainText);
    });

    it('改行やHTMLタグ、マークダウンを含む長文も正しく暗号化・復号できること', async () => {
      const richText = `# 見出し\n\n- リスト1\n- **太字**\n<p>HTML段落</p>`;
      const pin = 'password_pin';
      const salt = generateSalt();

      const encrypted = await encryptText(richText, pin, salt);
      const decrypted = await decryptText(
        encrypted.cipherText,
        encrypted.iv,
        pin,
        salt
      );

      expect(decrypted).toBe(richText);
    });

    it('誤ったPINで復号しようとした場合は例外が発生すること', async () => {
      const plainText = '機密情報';
      const pin = '1111';
      const wrongPin = '2222';
      const salt = generateSalt();

      const encrypted = await encryptText(plainText, pin, salt);

      await expect(
        decryptText(encrypted.cipherText, encrypted.iv, wrongPin, salt)
      ).rejects.toThrow();
    });

    it('誤ったソルトで復号しようとした場合も例外が発生すること', async () => {
      const plainText = '機密情報';
      const pin = '1111';
      const salt = generateSalt();
      const wrongSalt = generateSalt();

      const encrypted = await encryptText(plainText, pin, salt);

      await expect(
        decryptText(encrypted.cipherText, encrypted.iv, pin, wrongSalt)
      ).rejects.toThrow();
    });
  });
});
