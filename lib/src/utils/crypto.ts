// Web Crypto APIを用いた安全なPIN検証 & AES-GCM暗号化・復号

/**
 * 暗号学的に安全な乱数生成器（CSPRNG）を用いて、16バイトのソルト（Salt）を生成します。
 * 暗号鍵の導出（PBKDF2）やPINハッシュ化の際にレインボーテーブル攻撃を防ぐために使用します。
 * 
 * @returns {string} 16進数表記の32文字ソルト文字列
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 16進数文字列（hex）を Uint8Array（バイト配列）に変換する内部ヘルパー関数です。
 * 
 * @param {string} hex 変換対象の16進数文字列
 * @returns {Uint8Array} バイト配列
 */
function hexToUint8Array(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g) || [];
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
}

/**
 * バイナリデータ（ArrayBuffer）を Base64 文字列に変換する内部ヘルパー関数です。
 * 暗号文や初期化ベクトル（IV）をJSONやローカルストレージにテキストとして保存するために使用します。
 * 
 * @param {ArrayBuffer} buffer 変換対象のバイナリバッファ
 * @returns {string} Base64エンコード文字列
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Base64 文字列をバイナリデータ（ArrayBuffer）に復元する内部ヘルパー関数です。
 * 保存された暗号文や初期化ベクトル（IV）を復号処理に渡す際に使用します。
 * 
 * @param {string} base64 Base64エンコード文字列
 * @returns {ArrayBuffer} 復元されたバイナリバッファ
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * ユーザーが入力したPINコードとソルトから、PBKDF2 を用いて 256bit の AES-GCM 暗号鍵を導出します。
 * ストレッチング（100,000回反復）を行うことで、ブルートフォース（総当たり）攻撃耐性を高めています。
 * 
 * @param {string} pin ユーザーが入力したPINコード（暗号化パスワード）
 * @param {string} salt ソルト文字列（16進数）
 * @returns {Promise<CryptoKey>} Web Crypto API の AES-GCM 用暗号化鍵
 */
async function deriveKey(pin: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const pinData = encoder.encode(pin);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    pinData,
    { name: 'PBKDF2' },
    false,
    ['deriveKey', 'deriveBits']
  );

  const saltData = hexToUint8Array(salt);

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltData as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * PINの正当性を検証するためのハッシュ値（SHA-256）を生成します。
 * 生のPINを保存せず、ソルトを付与したハッシュ値を保存・比較することで安全な認証を行います。
 * 
 * @param {string} pin 検証対象のPINコード
 * @param {string} salt ソルト文字列
 * @returns {Promise<string>} 16進数表記のSHA-256ハッシュ文字列
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 平文テキストを AES-GCM (256bit) アルゴリズムで暗号化します。
 * 毎回ユニークな初期化ベクトル（IV: 12バイト）を生成し、同じ平文・PINでも毎回異なる暗号文を出力します。
 * 
 * @param {string} plainText 暗号化する平文テキスト
 * @param {string} pin 鍵導出に使用するPINコード
 * @param {string} salt 鍵導出に使用するソルト文字列
 * @returns {Promise<{ cipherText: string; iv: string }>} Base64エンコードされた暗号文とIVのオブジェクト
 */
export async function encryptText(
  plainText: string,
  pin: string,
  salt: string
): Promise<{ cipherText: string; iv: string }> {
  const key = await deriveKey(pin, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(plainText);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encodedData
  );

  return {
    cipherText: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv.buffer),
  };
}

/**
 * 暗号化されたテキストを AES-GCM (256bit) アルゴリズムで平文に復号します。
 * 暗号化時と同じ PIN、ソルト、および IV を用いて復号します（PINが誤っている場合は復号失敗の例外が発生します）。
 * 
 * @param {string} cipherText Base64形式の暗号文
 * @param {string} ivBase64 暗号化時に生成されたBase64形式のIV（初期化ベクトル）
 * @param {string} pin 鍵導出に使用するPINコード
 * @param {string} salt 鍵導出に使用するソルト文字列
 * @returns {Promise<string>} 復号された平文テキスト
 */
export async function decryptText(
  cipherText: string,
  ivBase64: string,
  pin: string,
  salt: string
): Promise<string> {
  const key = await deriveKey(pin, salt);
  const iv = base64ToBuffer(ivBase64);
  const cipherData = base64ToBuffer(cipherText);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
    },
    key,
    cipherData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}
