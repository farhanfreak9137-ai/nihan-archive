import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nila.archive',
  appName: 'NILA ARCHIVE',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
