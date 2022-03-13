const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');

const conectDB = require('./config/db');

// Conect to DB
conectDB();

// Server
const server = new ApolloServer({ 
    typeDefs, 
    resolvers
});

// Run Server
server.listen().then( ( {url} ) => {
    console.log(`Server running on port ${url}`);
} )