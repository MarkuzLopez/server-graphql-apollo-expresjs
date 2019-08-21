// import mongose from 'mongose';
import { Clientes } from './db';
import { rejects } from 'assert';

 export const resolvers = { 
     Query: {
        getClientes: (root ,{limite}) => { 
            return new Promise((resolve, object) => { 
                Clientes.find({}, (error, clientes) => { 
                    if(error) rejects(error)
                    else resolve(clientes)
                }).limit(limite) 
            })
        },
        // getClientes : (root, {limite}) => { 
        //     return new Clientes.find({}).limit(limite)
        // },

        // getCliente: ({id}) => {
        //     return new Cliente(id, clientesDB[id]);
        // },
        getCliente: (root, {id}) => { 
            return new Promise((resolve, object) => { 
                Clientes.findById(id, (error, clientes) => {
                    if(error) rejects(error)
                    else resolve(clientes)
                })
            })
        }
     },
     Mutation: { 
         crearCliente : (root, {input}) => {
            const nuevoCliente = new Clientes({ 
                nombre : input.nombre,
                apellidos : input.apellidos,
                empresa : input.empresa,
                emails : input.emails,
                edad :  input.edad,
                tipo : input.tipo,
                pedidos : input.pedidos
            });            

            // agregar el id 
            nuevoCliente.id =  nuevoCliente._id;

            //& agregarlo a base de datos
            return new Promise((resolve, object) => { 
                nuevoCliente.save((err) => { 
                    if(err) rejects(err)
                    else resolve(nuevoCliente)
                })
            })
         },

         // mutation para la actualizacion 
         actualizarCliente: (root, {input}) => { 
             return new Promise((resolve, object) => { 
                 Clientes.findOneAndUpdate({ _id: input.id}, input, {new: true}, (error, cliente) => { 
                     if(error) rejects(error)
                     else resolve(cliente)
                 })
             })
         },         
         /// eliminar clientes por medio de id
         eliminarCliente: ( root, {id}) => { 
            return new Promise((resolve, object) => { 
                Clientes.deleteOne({_id: id}, (error) => { 
                    if(error) rejects(error)
                    else resolve("Se elimino correctamente el cliente")
                })
            })
         }
     }
 }