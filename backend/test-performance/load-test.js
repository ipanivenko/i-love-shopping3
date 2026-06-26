import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 200,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<5000'],
  },
}

export default function () {
  const res = http.get('http://localhost:3000/orders')

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time below 5s': (r) => r.timings.duration < 5000,
  })

  sleep(1)
}