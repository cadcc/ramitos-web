import { defineConfig } from 'orval';

export default defineConfig({
  petstore: {
    input: './petstore.yaml',
    output: './src/petstore.ts',
  },
});