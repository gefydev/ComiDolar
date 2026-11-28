FROM oven/bun:1.4-alpine
WORKDIR /app
COPY --chmod=0444 app.js db.js server.js ./
USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/ping || exit 1
CMD ["bun", "server.js"]
