import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
    privateKey: process.env.JWT_PRIVATE_KEY,
    publicKey: process.env.JWT_PUBLIC_KEY,
    accessExpiresIn: '15m',
}));
