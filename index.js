import express from 'express';

// importacionde apollo 
import { ApolloServer } from 'apollo-server-express';
// importaacionb ahora de typeDefs que sustituye a graphQL
import { typeDefs } from './data/schema'
// importacion de resolverss
import { resolvers } from './data/resolvers';

// importaciones  de  jsonweb y genere los tokenss a cada usuario 
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env'});

// TODO configuraacion de apollo server 
const app = express();

// * agregando el token obtenido del servidor que se envia del lado del cliente
const server = new ApolloServer({
    typeDefs, 
    resolvers,
    context: async ({req}) => { 
        // obteniendo el token 
        const token = req.headers['authorization'];
        // console.log(token);
        if( token !== "null" || token !== null ){ 
            try { 
                // TODO verficar el token del front end (cliente)
                const usuarioActual = await jwt.verify(token, process.env.SECRETO);
                // console.log(usuarioActual);
                // TODO agregamos el usuario actual al request 
                req.usuarioActual = usuarioActual;
                //firmammos a caada cliente con el json
                return { 
                    usuarioActual
                }
            }catch( err) {
                console.log(err);
            }
        }
    }
});
// levantaar ekl sservicio en el navegaador
server.applyMiddleware({app});
/// utiilizar el puerto  para el naaavegaador
app.listen({port: 4000}, () => console.log(`El servidor esta corriendo http://localhost:4000${server.graphqlPath}`));
