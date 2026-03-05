import { registerAs } from '@nestjs/config';

export default registerAs('trustlessWork', () => ({
  apiKey: process.env.TRUSTLESS_WORK_API_KEY,
  apiUrl: process.env.TRUSTLESS_WORK_API_URL,
}));
