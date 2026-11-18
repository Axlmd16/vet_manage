export default () => ({
  app: {
    name: process.env.APP_NAME ?? 'vet-manage-api',
    port: Number(process.env.PORT ?? 3080),
    prefix: process.env.API_PREFIX ?? 'api/v1',
    nodeEnv: process.env.NODE_ENV ?? 'development',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://redis:56379',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    sessionExpiresIn: process.env.SESSION_EXPIRES_IN ?? '12h',
  },
  rbac: {
    syncMode: process.env.RBAC_SYNC_MODE ?? 'create-only',
  },
  initialAdmin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    identification: process.env.ADMIN_IDENTIFICATION,
    firstName: process.env.ADMIN_FIRST_NAME,
    lastName: process.env.ADMIN_LAST_NAME,
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? 'amqp://vetmanage:vetmanage_dev_password@rabbitmq:55672',
  },
});
