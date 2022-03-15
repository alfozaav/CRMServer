const User = require('../models/User');
const Product = require('../models/Product');
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
        }
    }
}

module.exports = resolvers;