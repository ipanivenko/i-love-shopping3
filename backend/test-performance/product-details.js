import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 1500, 
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(90)<2000'],
    http_req_failed: ['rate<0.05'],
  },
}

const URL =
  'http://localhost:3000/products/adidas-dropset-4-women-s-training-shoes-ss26'

export default function () {
  const res = http.get(URL)

  check(res, {
    'status is 200': (r) => r.status === 200,
  })

  sleep(1)
}