import {MongoClient,ObjectID} from "mongodb";
import "babel-polyfill";
import * as uuid from 'uuid';
import {PubSub} from "graphql-yoga";

const Mutation = {
    addUser:async(parent,args,ctx,info)=>{
        const {email,aut,contrasena} = args;
        const {client} = ctx;

        const db = client.db("ExamenFinal");
        const collection = db.collection("Lectores");
        const collection2 = db.collection("Autores");
        

        if((await collection.findOne({email}))||await collection2.findOne({email})){
            throw new Error('El usuario ya existe');
        }

        if(aut === 1){
            const result = await collection2.insertOne({email,contrasena});
            return {
                email,
                contrasena,
                _id: result.ops[0]._id
            }
        }else{
            const result = await collection.insertOne({email,contrasena});
            return {
                email,
                contrasena,
                _id: result.ops[0]._id
            }
        }
        

        // return {
        //     email,
        //     contrasena,
        //     _id: result.ops[0]._id
        // };
    },
    login:async(parent,args,ctx,info) =>{
        const {email,aut,contrasena} = args;
        const {client} = ctx;

        const db = client.db("ExamenFinal");
        const collection = db.collection("Lectores");
        const collection2 = db.collection("Autores");

        // if((!await collection.findOne({email,contrasena}))||(!await collection2.findOne({email,contrasena}))){
        //     throw new Error('El usuario no existe o contrasena incorrecta');
        // }
        if(aut === 1){
            if(!await collection2.findOne({email,contrasena})){
                throw new Error('El usuario no existe');
            }
            await collection2.updateOne({email},{$set:{"token":uuid.v4()}});
            setTimeout(()=>{
                collection2.findOneAndUpdate({email},{$set:{token:null}});
            },1800000);
            return await collection2.findOne({email});
        }else{
            if(!await collection.findOne({email,contrasena})){
                throw new Error('EL usuario no existe');
            }
            await collection.updateOne({email},{$set:{"token":uuid.v4()}});
            setTimeout(()=>{
                collection.findOneAndUpdate({email},{$set:{token:null}});
            },1800000);
            return await collection.findOne({email});
        }
        //const result = await collection.findOne({nombre});
        
        //return result;//devolvemos el usuario con el token incluido
    },
    logout:async(parent,args,ctx,info) =>{
        const {email,aut,contrasena,token} = args;
        const {client} = ctx;

        const db = client.db("ExamenFinal");
        const lectores = db.collection("Lectores");
        const autores = db.collection("Autores");

        if(aut === 1){
            if(!await autores.findOne({email,contrasena})){
                throw new Error('El usuario no existe o no es la contrasena');
            }
            if(token != null){
                if(!await autores.findOne({email,token})){
                    throw new Error('El usuario no esta logueado');
                }
                await autores.updateOne({email},{$set:{"token":null}});
                const result = await autores.findOne({email});
                return result;
            }else{
                throw new Error('El usuario no esta logueado');
            }
        }else{
            if(!await lectores.findOne({email,contrasena})){
                throw new Error('El usuario no existe o no es la contrasena')
            }
            if(token != null){
                if(!await lectores.findOne({email,token})){
                    throw new Error('El usuario no esta logueado');
                }
                await lectores.updateOne({email},{$set:{"token":null}});
                const result = await lectores.findOne({email});
                return result;
            }else{
                throw new Error('El usuario no esta logueado');
            }
        }
        
    },
    addEntrada:async(parent,args,ctx,info) =>{
        const{autor,aut,token,titulo,descripcion} = args;
        const {client,pubsub} = ctx;

        const db = client.db("ExamenFinal");
        const autores = db.collection("Autores");
        const entradas = db.collection("Entradas");
        
        if(aut === 1){
            if(!await autores.findOne({email:autor},token)){
                throw new Error('El autor no existe o no esta logueado');
            }
            if(await entradas.findOne({titulo})){
                throw new Error('La entrada ya esta creada, introduzca otro titulo');
            }
            const result = await entradas.insertOne({autor,titulo,descripcion});
            pubsub.publish(
                autor,
                {
                    subUsuario: result.ops[0]
                }
            )
            return result.ops[0];
        }else{
            throw new Error('Solo un autor puede crear entradas');
        }
    },
    borrarEntrada:async(parent,args,ctx,info) =>{
        const {_id,autor,aut,token} = args;
        const {client,pubsub} = ctx;

        const db = client.db("ExamenFinal");
        const entradas = db.collection("Entradas");
        const autores = db.collection("Autores");

        if(aut === 1){
            if(!await autores.findOne({email:autor,token})){
                throw new Error('No puedes borrar la entrada');
            }
            if(!await entradas.findOne({_id:ObjectID(_id)})){
                throw new Error('No existe esa entrada');
            }
            if(!await entradas.findOne({_id:ObjectID(_id),autor})){
                throw new Error('No puedes borrar una entrada de otro usuario');
            }
            const result = await entradas.findOneAndDelete({_id:ObjectID(_id)});

            return result.value;
        }else{
            throw new Error('Solo un autor puede borrar entradas');
        }        
    },
    borrarUsuario:async(parent,args,ctx,info) =>{
        const {email,aut,token} = args;
        const {client} = ctx;

        const db = client.db("ExamenFinal");
        const lectores = db.collection("Lectores");
        const autores = db.collection("Autores");
        const entradas = db.collection("Entradas");

        if(aut === 1){
            if(!await autores.findOne({email,token})){
                throw new Error('El autor no esta logueado o no existe');
            }
            const result = await autores.findOneAndDelete({email});
            await entradas.deleteMany({autor:email});
            return result.value;
        }else{
            if(!await lectores.findOne({email,token})){
                throw new Error('EL lector no esta logueado o no existe');
            }
            const result = await lectores.findOneAndDelete({email});
            return result.value;
        }

    },
}



export {Mutation as default};