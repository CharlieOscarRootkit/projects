const bcrypt = require("bcrypt");

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


// Example usage:
// const hashedPassword = await hashpassword("bro");
// const isMatch = await comparepassword("bros", hashedPassword);
// console.log(isMatch);

module.exports = { hashpassword, comparepassword };
