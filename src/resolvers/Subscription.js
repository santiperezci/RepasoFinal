const Subscription ={
    subUsuario:{
        subscribe(parent,args,ctx,info){
            
            const {autor,aut,token} = args;
            const {pubsub} = ctx;

            if(token === null){
                throw new Error('El usuario no esta logueado, no puede suscribirse');
            }else if(aut!==1){
                throw new Error('NO te puedes suscribir a un lector');
            }
            return pubsub.asyncIterator(autor);
        }
    },
}
export{Subscription as default};