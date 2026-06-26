import speakeasy from 'speakeasy'

const secret = 'IQWEMOZZLI7DAOBBI5CVM6TYO5VSQIKE'

//const secret = 'OZNXIKLGFRMD4U2FGVYGIVSYIQ2VCUBO'
//const secret = 'OQYF4ZC6FJSEC2L2IU4XAWDUNFQT4KKD' for J

const token = speakeasy.totp({
  secret,
  encoding: 'base32',
})

console.log('Your 6-digit code:', token)