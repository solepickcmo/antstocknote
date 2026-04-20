import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // vitest 설정 — orchestration.md §12 테스트 전략
  test: {
    globals: true,       // describe/it/expect를 import 없이 사용
    environment: 'node', // PnL 계산 유틸은 DOM 불필요 → node 환경
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
