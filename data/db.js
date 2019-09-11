import mongoose from 'mongoose';

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
    pedidos: Array
});

const Clientes = mongoose.model('clientes', clientesSchema);

/// eschema para los productos y se aagregará a la BD
const porductosSchema = new mongoose.Schema({
    nombre: String,
    precio: Number,
    stock: Number
});

const Productos = mongoose.model('productos', porductosSchema);

export { Clientes, Productos };