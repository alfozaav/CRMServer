const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config({path: 'variables.env'});

const createToken = (user, secret, expiresIn) => {
    console.log(user);
    const {id, email, name, lastName} = user;
    return jwt.sign( {id, email, name, lastName}, secret, {expiresIn} );
}

// Resolvers
const resolvers = {
    Query: {
        getUser: async (_, {token}) => {
            const userId =  await jwt.verify(token, process.env.SECRET);
            return userId;
        }
    },
    Mutation: {
        newUser: async (_, {input}) => {

            const { email, password } = input;
            const userExists = await User.findOne({email});
            // Check if User already registered
            if (userExists) {
                throw new Error('User already registered!');
            }
            // Hash Password
            const salt = await bcryptjs.genSaltSync(10);
            input.password = await bcryptjs.hashSync(password, salt);
            
            try {
                // Save on DB
                const user = new User(input);
                user.save();
                return user;
            } catch (error) {
                console.log(error);
            }
        },
        authUser: async (_, {input}) => {
            const {email, password} = input;
            //  If User exits
            const userExists = await User.findOne({email});
            if (!userExists) throw new Error('User doesn´t exist!');
            //  If Password is Correct
            const correctPassword = await bcryptjs.compare(password, userExists.password);
            if (!correctPassword) throw new Error('Incorrect Password!');
            // Create Token
            return {
                token: createToken(userExists, process.env.SECRET, '24h')
            }
        }
    }
}

module.exports = resolvers;