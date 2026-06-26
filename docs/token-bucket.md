# Token Bucket Rate Limiting

A Token Bucket rate limiting mechanism has been implemented to protect authentication endpoints from brute-force attacks, excessive requests, and abuse.

Each client receives a limited number of tokens. Every incoming request consumes one token. Tokens are automatically replenished over time. When no tokens remain, additional requests are rejected with:

```http
429 Too Many Requests
```

This approach allows short bursts of legitimate traffic while preventing continuous abuse.

## Testing

- Start the project.

- Send multiple requests to the login endpoint:

```bash
for i in {1..15}; do
  echo "Request $i"
  curl -i -X POST http://127.0.0.1:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrongpassword"}'
  echo ""
done
```

Expected result:

- Initial requests are processed normally.
- Once the token bucket is exhausted, the API returns:

```http
429 Too Many Requests
```

- After waiting for the refill period, requests are accepted again.

This demonstrates that the Token Bucket mechanism is correctly limiting request rates and protecting the authentication endpoints.