import express from 'express';

// importacionde apollo 
import { ApolloServer } from 'apollo-server-express';
// importaacionb ahora de typeDefs que sustituye a graphQL
import { typeDefs } from './data/schema'
// importacion de resolverss
import { resolvers } from './data/resolvers';

// importacionde graphql
// import graphqlHTTP from 'express-graphql';
// import { schema } from './data/schema';
// import resolvers from './data/resolvers';

// TODO configuraacion de apollo server 
const app = express();
const server = new ApolloServer({typeDefs, resolvers});
// levantaar ekl sservicio en el navegaador
server.applyMiddleware({app});
/// utiilizar el puerto  para el naaavegaador
app.listen({port: 4000}, () => console.log(`El servidor esta corriendo http://localhost:4000${server.graphqlPath}`));

// // pasar a una constante el resolver  
// // const root = resolvers;
// app.get('/', (req, res) =>  { 
//     res.send('Listo corriendo servidor');
// });
// // este apartado funcionaa para reaalizar la graficaa de graphql
// /// http://localhost:3000/graphql
// app.use('/graphql', graphqlHTTP({ 
//     /// el schema que se va utilizar
//     schema,
//     /// el ressolver sse paaasaa como rootRessolve de la constante rtesolve 
//     // rootValue:  root, 
//     /// utilizar gaarphql
//     graphiql :  true
// }))
// app.listen(3000, () => { 
//     console.log( 'El servidor esta funcionando');
// });