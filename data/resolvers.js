// import mongose from 'mongose';
import { Clientes, Productos, Pedidos, Usuarios } from './db';
import { rejects } from 'assert';
import mongoose from 'mongoose';
/// bcrypt encriptacion 
import  bcrypt from 'bcrypt';

// Genera token 
import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });

import jwt from 'jsonwebtoken';

// const para el objectId
const ObjectId = mongoose.Types.ObjectId;
// funcion para crear el token, donde recibira tres parametros
const crearToken = (usuarioLogin, secreto, expiresIn) => { 
    const {usuario} =  usuarioLogin;

    return jwt.sign({usuario}, secreto, {expiresIn});
}

export const resolvers = { 
    Query: {
        getClientes: (root, { offset, limite, vendedor }) => {
            let filtro;
            if(vendedor) {
                filtro = {vendedor:  new ObjectId(vendedor)}
            }
            return new Promise((resolve, object) => {
                Clientes.find({filtro}, (error, clientes) => {
                    if (error) rejects(error)
                    else resolve(clientes)
                }).limit(limite).skip(offset)
            })
        },
        getCliente: (root, { id }) => {
            return new Promise((resolve, object) => {
                Clientes.findById(id, (error, clientes) => {
                    if (error) rejects(error)
                    else resolve(clientes)
                })
            })
        },
        totalClientes: (root, {vendedor}) => {
            return new Promise((resolve, object) => {
                let filtro;
                if(vendedor) {
                    filtro = {vendedor:  new ObjectId(vendedor)}
                }
                Clientes.countDocuments(vendedor, (error, count) => {
                    // ssi existe un error maandar el metodo de rechazo y como paraametro el
                    if (error) rejects(error)
                    else resolve(count)
                })
            })
        },
        // obteniendo los productos
        obtainProducts: (root, { offset, limite, stock }) => {
            let filtro;
            // obtiene todos los que sean mayos a cero 
            if(stock) {
                filtro = { stock: {$gt : 0} }
            }
            return new Promise((resolve, object) => {
                Productos.find({}, (error, productos) => {
                    if (error) rejects(error);
                    else resolve(productos)
                }).limit(limite).skip(offset)
            })
        },
        getProduct: (root, { id }) => {
            return new Promise((resolve, rejects) => {
                Productos.findById(id, (error, producto) => {
                    if (error) rejects(error);
                    else resolve(producto)
                })
            })
        },
        totalProducts: (root) => {
            return new Promise((resolve, object) => {
                Productos.countDocuments({}, (error, count) => {
                    // ssi existe un error maandar el metodo de rechazo y como paraametro el
                    if (error) rejects(error)
                    else resolve(count)
                })
            })
        },

        // obtener Pedidos
        obtenerPedidos:(root, {cliente}) => {
            return new Promise((resolve, object) => { 
                Pedidos.find({cliente: cliente}, (error, pedido) => {
                    if(error) rejects(error);
                    else resolve(pedido);
                })
            })
        },

        // seccion de topClientes 
        topClientes: (root) => {
            return new Promise((resolve, objefct) => { 
                Pedidos.aggregate([
                    {
                        $match : { estado: "COMPLETADO" } 
                    },
                    {
                        $group: {
                            _id : "cliente",
                            total: { $sum : "$total"} 
                        }
                    },
                   { 
                       $lookup: { 
                           from: "clientes",
                           localField: '_id',
                           foreignField: '_id',
                           as: 'cliente'
                       }
                   },
                   {
                       $sort : { total : -1 }
                   },
                   {
                       $limit: 10
                   }
               ], (error, resultado) =>  { 
                   if(error) rejects(error);
                   else resolve(resultado)
               })
                
            })
        }, 
        obtenerUsuario : ( root, args, {usuarioActual}) => { 
            if(!usuarioActual) {
                return null;
            }

            //* Obtener el usuaaario actual del request del JWT verificado
            const usuario = Usuarios.findOne({usuario: usuarioActual.usuario});

            return usuario;            
        }
    },
    Mutation: {
        crearCliente: (root, { input }) => {
            const nuevoCliente = new Clientes({
                nombre: input.nombre,
                apellidos: input.apellidos,
                empresa: input.empresa,
                emails: input.emails,
                edad: input.edad,
                tipo: input.tipo,
                pedidos: input.pedidos,
                vendedor: input.vendedor
            });

            // agregar el id 
            nuevoCliente.id = nuevoCliente._id;

            //& agregarlo a base de datos
            return new Promise((resolve, object) => {
                nuevoCliente.save((err) => {
                    if (err) rejects(err)
                    else resolve(nuevoCliente)
                })
            })
        },

        // mutation para la actualizacion 
        actualizarCliente: (root, { input }) => {
            return new Promise((resolve, object) => {
                Clientes.findOneAndUpdate({ _id: input.id }, input, { new: true }, (error, cliente) => {
                    if (error) rejects(error)
                    else resolve(cliente)
                })
            })
        },
        /// eliminar clientes por medio de id
        eliminarCliente: (root, { id }) => {
            return new Promise((resolve, object) => {
                Clientes.deleteOne({ _id: id }, (error) => {
                    if (error) rejects(error)
                    else resolve("Se elimino correctamente el cliente")
                })
            })
        },
        // nuevos Productos  
        nuevoProducto: (root, { input }) => {
            //creaaamos el schemaa para la bd 
            const nuevoProducto = new Productos({
                nombre: input.nombre,
                precio: input.precio,
                stock: input.stock
            });

            //agregamos el id  que se asigna al objeto 
            nuevoProducto.id = nuevoProducto._id;

            /// agregar a la BD 
            return new Promise((resolve, object) => {
                nuevoProducto.save((error) => {
                    if (error) rejects(error);
                    else resolve(nuevoProducto)
                })
            })
        },
        updateProduct: (root, { input }) => {
            return new Promise((resolve, object) => {
                Productos.findOneAndUpdate({ _id: input.id }, input, { new: true }, (error, producto) => {
                    if (error) rejects(error)
                    else resolve(producto)
                })
            })
        },
        deleteProduct: (root, { id }) => {
            return new Promise((resolve, object) => {
                // accion de mongosse 
                Productos.deleteOne({ _id: id }, (err) => {
                    if (err) rejects(err);
                    else resolve('Se elimino correctamente producto');
                })
            })
        },
        // sseccion de pedidos 
        nuevoPedido: (root, {input}) => { 
            const nuevoPedido =  new Pedidos({ 
                pedido: input.pedido,
                total: input.total,
                fecha: new Date(),
                cliente: input.cliente,
                estado: "PENDIENTE",
                vendedor: input.vendedor
            });

            nuevoPedido.id = nuevoPedido._id;

            return new Promise((resolve, object) => {
                // input.pedido.forEach(pedido => {
                //     Productos.updateOne({_id : pedido.id},
                //         { "$inc" : { "stock" : -pedido.cantidad} 
                //     }, function(error) {
                //         if(error) return new Error(error)
                //     })
                // });

                nuevoPedido.save((error) => {
                    if(error) rejects(error)
                    else resolve(nuevoPedido)
                })
            });
        },
        // actualizar estaadode pendiente, completado, cancelado
        actualizarEstado:(root, {input}) => {
            return new Promise((resolve, object) => { 
                // recorrer y ctualizar la cantidad de productos con base al esstado de pedido
                const { estado } = input;

                let instruccion;
                if( estado === 'COMPLETADO') {
                    instruccion = '-';
                } else if(estado === 'CANCELADO') {
                    instruccion = '+'
                }

                // actualiza la caantidad de productos con base al estado del pedido
                input.pedido.forEach(pedido => {
                    Productos.updateOne({_id : pedido.id},
                        { "$inc" : { "stock" : `${instruccion}${pedido.cantidad}`} 
                    }, function(error) {
                        if(error) return new Error(error)
                    })
                });

                Pedidos.findOneAndUpdate({_id: input.id}, input, {new: true}, (error) => {
                    if(error) rejects(error);
                    else resolve('Se actualizo correctamente');
                })
            })
        },
        
        crearUsuario: async(root, {usuario, nombre, password, rol }) => { 
            // el metodo async ayudaa para realizar una consulta de usuarios repetidos
            ///*  gracias a babel y los estandaares de ecma7 se puede solo declarar solo usuaario
            ///* en vez de Usuarios.finOne({usuario: usuario})
            const existeUsuario =  await Usuarios.findOne({usuario})

            if(existeUsuario) { 
                throw new Error('El usuario ya existe');
            }

            const nuevoUsuario =  await new Usuarios({ 
                usuario,
                nombre,
                password,
                rol
            }).save();
            console.log(nuevoUsuario);

            return "Usuario Agregado Correctamente";
        }, 

        autenticarUsuario : async ( root, {usuario, password}) => {

                const nombreUsuario =  await Usuarios.findOne({usuario});
                
                /// si el nombre no coincide con la busquedaa de arribaa maandaara el mensaje 
                if(!nombreUsuario) { 
                    throw new Error('Usuario no encontrado ');
                }
                
                // al usar el await retornara un true o false dependiendo de la comparación
                const passwordCorrecto = await bcrypt.compare(password, nombreUsuario.password);
                
                if(!passwordCorrecto) { 
                   throw new  Error('Password Incorrecto');
                }

                return {
                    token: crearToken(nombreUsuario, process.env.SECRETO, '1hr')
                }
        }
    }
}