//Genertae HIGH error

// export const isAuthorized = () => expressJwt(({ secret: publicKey }) )
 export const denyAll = () => expressJwt({ secret: '' + Math.random() } )
// export const authorize = (user = {}) => jwt.sign(user, privateKey, { expiresIn: '6h', algorithm: 'RS256' })
// export const verify = (token: string) => token ? (jws.verify as ((token: string, secret: string) => boolean))(token, publicKey) : false
// export const decode = (token: string) => { return jws.decode(token)?.payload }