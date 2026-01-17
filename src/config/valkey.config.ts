export const valkeyConfig = () => ({
  valkey: {
    host: process.env.VALKEY_HOST,
    port: Number(process.env.VALKEY_PORT),
    password: process.env.VALKEY_PASSWORD,
    db: Number(process.env.VALKEY_DB ?? 0),
    connectTimeout: Number(process.env.VALKEY_CONNECT_TIMEOUT ?? 10000),
  },
});
