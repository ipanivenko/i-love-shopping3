import speakeasy from 'speakeasy'

const secret = 'OQYF4ZC6FJSEC2L2IU4XAWDUNFQT4KKD'

const token = speakeasy.totp({
  secret,
  encoding: 'base32',
})

console.log('Your 6-digit code:', token)