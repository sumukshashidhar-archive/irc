
module.exports  = {
    signOptions: {
        issuer:  "irc_chat",
        expiresIn:  "24h",
        algorithm:  "RS512"
    },
    verifyOptions: {
        issuer:  "irc_chat",
        expiresIn:  "24h",
        algorithm:  ["RS512"]
       }
}