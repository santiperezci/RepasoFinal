import "babel-polyfill";
const Entrada = {
    autor:async(parent,args,ctx,info) =>{
        const {client} = ctx;
        const autor = parent.autor;

        const db = client.db("ExamenFinal");
        const collection = db.collection("Autores");

        return await collection.findOne({email:autor});
    }
}
export {Entrada as default};