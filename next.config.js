/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/api/clova",
        destination: "https://naveropenapi.apigw.ntruss.com/sentiment-analysis/v1/analyze",
      },
    ];
  },
}

module.exports = nextConfig
