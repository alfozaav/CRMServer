const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
require('dotenv').config({path: 'variables.env'});
const conectDB = require('./config/db');

// Conect to DB
conectDB();

// Server
const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
    context: ({req}) => {
        const token = req.headers['authorization'] || '';
        if (token) {
            try {
                const user = jwt.verify(token, process.env.SECRET);
            
                return {user};
            } catch (error) {
                console.log('An error ocurred!')
                console.log(error);
            }
        }
    }
});

// Run Server
server.listen().then( ( {url} ) => {
    console.log(`Server running on port ${url}`);
} )