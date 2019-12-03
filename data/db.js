import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/clientes', { userNewUrlPassword: true });

mongoose.set('useFindAndModify', false);

/// definir el schema de clientes para la bd 

const clientesSchema = new mongoose.Schema({
    nombre: String,
    apellidos: String,
    empresa: String,
    emails: Array,
    edad: Number,
    tipo: String,
    pedidos: Array, 
    vendedor: mongoose.Types.ObjectId

});

const Clientes = mongoose.model('clientes', clientesSchema);

/// eschema para los productos y se aagregará a la BD
const porductosSchema = new mongoose.Schema({
    nombre: String,
    precio: Number,
    stock: Number
});

const Productos = mongoose.model('productos', porductosSchema);

// sschema para pedidos 
const pedidosSchema = new mongoose.Schema({
    pedido: Array,
    total: Number,
    fecha: Date,
    cliente: mongoose.Types.ObjectId,
    estado: String,
    vendedor: mongoose.Types.ObjectId
});

const Pedidos = mongoose.model('pedidos', pedidosSchema);

//schema usuarios 
const usuariosSchema = new mongoose.Schema({
    usuario: String,
    nombre: String,
    password: String,
    rol: String
});

/// hashear los password antes de guardaarlos en la baase de daatos 
usuariosSchema.pre('save', function(next ) { 
    /// si el password no esta modificado ejecutar la siguiente función.
    if(!this.isModified('password')) {
        return next();
    }

    // entreb mayor sea el numero del genSalt es mayormla seguridad de datoss encriptados
    bcrypt.genSalt(10, (err, salt) => { 
        if(err) return next(err);

        bcrypt.hash(this.password, salt, (err, hash ) => { 
            if(err) return next(err);
            this.password = hash;
            next(); 
        })
    })
}) 

const Usuarios = mongoose.model('usuarios', usuariosSchema);

export { Clientes, Productos, Pedidos, Usuarios };