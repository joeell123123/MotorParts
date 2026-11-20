import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.joeell123123.motorparts',
  appName: 'MotorParts',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
