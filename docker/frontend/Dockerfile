FROM node:13.12-alpine AS builder
WORKDIR /app
COPY . .
RUN yarn run build

FROM node:13.12-alpine
RUN yarn global add serve
WORKDIR /app
COPY --from=builder /app/build .
CMD ["serve", "-p", "80", "-s", "."]