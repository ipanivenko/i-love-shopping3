import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 300,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(90)<2000'],
    http_req_failed: ['rate<0.05'],
  },
}

export default function () {
  const res = http.get(
    'http://localhost:3000/products?brand=adidas'
  )

  check(res, {
    'status is 200': (r) => r.status === 200,
  })

  sleep(1)
}