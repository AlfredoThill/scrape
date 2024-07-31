import { PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const config: PlaywrightTestConfig = {
  testDir: 'src',
};

export default config;
