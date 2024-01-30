const bcrypt = require("bcrypt");
const {sign,verify} = require("jsonwebtoken")

const hashpassword = async (password) => {
    try {
        const hashedpassword = await bcrypt.hash(password, 10);
        return hashedpassword;   
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error; // You might want to handle or propagate the error accordingly
    }
};

const comparepassword = async (cmp_password, hashedPassword) => {
    try {
        const comparison = await bcrypt.compare(cmp_password, hashedPassword);
        return comparison;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        // throw error; // You might want to handle or propagate the error accordingly
    }
};


const generateSalt = (length)  => {
    const characters = "!#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
    var randomString = ''
    for(let i=0 ; i<length ; i++){
        var randomCharacterPosition = Math.floor(Math.random() * characters.length)
        randomString += characters.charAt(randomCharacterPosition)
    }
    return randomString
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const createToken = async (payload,expirationDate) => {
    try {
            const token = await sign(payload,process.env.SECRET,{expiresIn:expirationDate})
            console.log(token)
            if(token){
                return token
            }else{
                return false
            }
    } catch (error) {
            console.error(error)
            throw error
    }
}

const verifyToken = async (token) => {
    try {
        const verifiedToken = await verify(token,process.env.SECRET)
        console.log(verifiedToken)
        return verifiedToken
    } catch (error) {
        console.error(error)
        throw error
    }
}

// Example usage:
// const hashedPassword = await hashpassword("bro");
// const isMatch = await comparepassword("bros", hashedPassword);
// console.log(isMatch);

module.exports = { hashpassword, comparepassword, generateSalt, sleep, createToken, verifyToken  };
