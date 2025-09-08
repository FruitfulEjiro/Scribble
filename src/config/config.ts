export default () => ({
  port: parseInt(process.env.PORT!, 10) || 3000,
  url: process.env.DATABASE_URL!,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN!,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN!,
  resetTokenSecret: process.env.RESET_TOKEN_SECRET!,
  resetTokenExpiresIn: process.env.RESET_TOKEN_EXPIRES_IN!,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
});
