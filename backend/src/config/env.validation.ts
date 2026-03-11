import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  JWT_PRIVATE_KEY: Joi.string().required(),
  JWT_PUBLIC_KEY: Joi.string().required(),
  WALLET_ENCRYPTION_KEY: Joi.string().length(64).required(),
  STELLAR_NETWORK: Joi.string().valid('testnet', 'mainnet').default('testnet'),
  TRUSTLESS_WORK_API_KEY: Joi.string().required(),
  TRUSTLESS_WORK_API_URL: Joi.string().uri().required(),
  ALLOWED_ORIGINS: Joi.string().required(),
});
