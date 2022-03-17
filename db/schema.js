const { gql } = require('apollo-server');

// Schema
const typeDefs = gql`
    # Types

    # Users
    type User {
        id: ID
        name: String
        lastName: String
        email: String
        created: String
    }
    type Token {
        token: String
    }

    # Products
    type Product {
        id: ID
        name: String
        stock: Int
        price: Float
        created: String
    }

    # Client
    type Client {
        id: ID
        name: String
        lastName: String
        company: String
        email: String
        phone: String
        seller: ID
    }

    # Inputs

    # Users
    input UserInput {
        name: String!
        lastName: String!
        email: String!
        password: String!
    }
    input AuthInput {
        email: String!
        password: String!
    }

    #   Products
    input ProductInput {
        name: String!
        stock: Int!
        price: Float!
    }

    # Client
    input ClientInput {
        name: String!
        lastName: String!
        company: String!
        email: String!
        phone: String
    }

    # Queries
    type Query {
        # Users
        getUser(token: String!): User

        # Products
        getProducts: [Product]
        getProduct(id: ID!): Product

        # Clients
        getClients: [Client]
        getClientsSeller: [Client]
        getClient(id: ID!): Client
    }
    # Mutations
    type Mutation {
        # Users
        newUser(input: UserInput): User
        authUser(input: AuthInput): Token

        # Products
        newProduct(input: ProductInput): Product
        updateProduct(id: ID!, input: ProductInput): Product
        deleteProduct(id: ID!): String

        # Clients
        newClient(input: ClientInput): Client
        updateClient(id: ID!, input: ClientInput): Client
        deleteClient(id: ID!): String
    }
`;

module.exports = typeDefs;