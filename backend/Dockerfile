# ─────────────────────────────────────────────────────────────
# Nishya Go API — Multi-stage Docker Build
# ─────────────────────────────────────────────────────────────

# Stage 1: Build
FROM golang:1.22-alpine AS builder

RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Build binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /nishya-api .

# Stage 2: Runtime
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /nishya-api /app/nishya-api

# Non-root user for security
RUN addgroup -S nishya && adduser -S nishya -G nishya
USER nishya

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/api/health || exit 1

ENTRYPOINT ["/app/nishya-api"]
