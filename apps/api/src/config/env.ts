import "dotenv/config";

export const env = {
  port: process.env.PORT ?? 3001,
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  jwtSecret: process.env.JWT_SECRET ?? "dev_secret",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "access_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "refresh_secret",
  jwtAccessTtlMin: Number(process.env.JWT_ACCESS_TTL_MIN) || 15,
  jwtRefreshTtlDays: Number(process.env.JWT_REFRESH_TTL_DAYS) || 7,
  orgDomain: process.env.ORG_DOMAIN ?? "example.com",

  aiEnabled: process.env.AI_ENABLED !== "false",
  glpiEnabled: process.env.GLPI_ENABLED !== "false",
  solmanEnabled: process.env.SOLMAN_ENABLED !== "false",

  GLPI_URL: process.env.GLPI_URL ?? "",
  GLPI_APP_TOKEN: process.env.GLPI_APP_TOKEN ?? "",
  GLPI_USER_TOKEN: process.env.GLPI_USER_TOKEN ?? ""
} as const;