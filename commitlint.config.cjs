module.exports = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      // [type] subject 形式をパースする
      headerPattern: /^\[(\w+)\]\s+(.*)$/,
      headerCorrespondence: ['type', 'subject'],
    },
  },
  rules: {
    'type-enum': [
      2,
      'always',
      ['add', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'remove', 'modify'],
    ],
    // 日本語の subject を使う場合、大文字・小文字の制限で弾かれないように無効化
    'subject-case': [0],
  },
};