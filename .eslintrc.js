module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { 
      varsIgnorePattern: '^_', 
      argsIgnorePattern: '^_' 
    }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-require-imports': 'off'
  },
} 