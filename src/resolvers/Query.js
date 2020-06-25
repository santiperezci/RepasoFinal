import { ObjectID } from "mongodb";

const Query = {
    ok: (parent,args,ctx,info) =>{
        return "ok";
    },
    listarEntradas:async(parent,args,ctx,info) =>{
        const{email,aut,token} = args;
        const{client} = ctx;

        const db = client.db("ExamenFinal");
        const entradas = db.collection("Entradas");
        const lectores = db.collection("Lectores");
        const autores = db.collection("Autores");

        if(aut === 1){
            if(!(await autores.findOne({email,token}))){
                throw new Error('El usuao no se ha encontrado');
            }
        }else{
            if(!(await lectores.findOne({email,token}))){
                throw new Error('El usuario no se ha encontrado');
            }
        }
        return entradas.find().toArray();
    },
    leerEntrada:async(parent,args,ctx,info) =>{
        const {email,aut,autor,token} = args;
        const {client} = ctx;

        const db = client.db("ExamenFinal");
        const entradas = db.collection("Entradas");
        const lectores = db.collection("Lectores");
        const autores = db.collection("Autores");
        
        if(aut === 1){
            if(!(await autores.findOne({email,token}))){
                throw new Error('El usuao no se ha encontrado');
            }
        }else{
            if(!(await lectores.findOne({email,token}))){
                throw new Error('El usuario no se ha encontrado');
            }
        }
        

        return entradas.find({autor}).toArray();
    },
    leerEntradaEspecifica:async(parent,args,ctx,info) =>{
        const {email,aut,_id,autor,token} = args;
        const {client} = ctx;

        const db = client.db("ExamenFinal");
        const entradas = db.collection("Entradas");
        const lectores = db.collection("Lectores");
        const autores = db.collection("Autores");
        
        if(aut === 1){
            if(!(await autores.findOne({email,token}))){
                throw new Error('El usuao no se ha encontrado');
            }
        }else{
            if(!(await lectores.findOne({email,token}))){
                throw new Error('El usuario no se ha encontrado');
            }
        }
        return entradas.findOne({_id:ObjectID(_id)});
    }
}
export {Query as default};