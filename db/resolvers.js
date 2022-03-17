const User = require('../models/User');
const Product = require('../models/Product');
const Client = require('../models/Client');
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
        },
        getProducts: async () => {
            try {
                const products = await Product.find({});
                return products;
            } catch (error) {
                console.log(error);
            }
        },
        getProduct: async (_, {id}) => {
            const product = await Product.findById(id);
            // If Product doesn´t exist
            if(!product) throw new Error('Product doesn´t exist!');

            return product;
        },
        getClients: async () => {
            try {
                const clients = await Client.find({});
                return clients;
            } catch (error) {
                console.log(error);
            }
        },
        getClientsSeller: async (_, {}, ctx) => {
            try {
                const clients = await Client.find({seller: ctx.user.id.toString()});
                return clients;
            } catch (error) {
                console.log(error);
            }
        },
        getClient: async (_, {id}, ctx) => {
            // If Clients exists or not
            const client = await Client.findById(id);
            if (!client) throw new Error('Client not found!');
            // Who created the Client can see it
            if (client.seller.toString() !== ctx.user.id) throw new Error('Credentials not valid!');
            return client;
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
        },
        newProduct: async (_, {input}) => {
            try {
                const product = new Product(input);
                // Save in DB
                const result = await product.save();
                return result;
            } catch (error) {
                console.log(error);
            }
        },
        updateProduct: async (_, {id, input}) => {
            let product = await Product.findById(id);
            // If doesn´t exixt
            if(!product) throw new Error('Product doesn´t exist!');
            // Save in DB
            product = await Product.findOneAndUpdate({_id: id}, input, {new:true});
            return product;
        },
        deleteProduct: async (_, {id}) => {
            let product = await Product.findById(id);
            // If doesn´t exixst
            if(!product) throw new Error ('Product doesn´t exist!');

            // Delete from DB
            await Product.findByIdAndDelete({_id:id});
            return 'Product deleted sucessfully!';
        },
        newClient: async (_,{input}, ctx) => {
            const {email} = input
            //  If Client is already registered
            const client = await Client.findOne({email});
            if(client) throw new Error('Client already registered!');

            const newClient = new Client(input);

            //  Asign Seller
            newClient.seller = ctx.user.id;
            //  Save in DB
            try {
                const result = await newClient.save();
                return result;
            } catch (error) {
                console.log(error);
            }
        },
        updateClient: async (_, {id, input}, ctx) => {
            // If Client exixts or not
            let client = await Client.findById(id);
            if (!client) throw new Error('Client not found!');
            // Who created the Client can see it
            if (client.seller.toString() !== ctx.user.id) throw new Error('Credentials not valid!');
            // Save Client in DB
            client = await Client.findOneAndUpdate({_id: id}, input, {new: true})
            return client;
        },
        deleteClient: async (_, {id}, ctx) => {
            // If Client exixts or not
            const client = await Client.findById(id);
            if (!client) throw new Error('Client not found!');
            // Who created the Client can see it
            if (client.seller.toString() !== ctx.user.id) throw new Error('Credentials not valid!');
            // Delete from DB
            await Client.findOneAndDelete({_id: id});
            return 'Client deleted!';
        }
    }
}

module.exports = resolvers;