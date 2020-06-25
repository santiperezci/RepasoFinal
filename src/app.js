import {MongoClient, ObjectID} from "mongodb";
import {GraphQLServer,PubSub} from "graphql-yoga";
import Usuario from './resolvers/Usuario';
import Query from './resolvers/Query';
import Mutation from './resolvers/Mutation';
import Entrada from './resolvers/Entrada';
import Subscription from './resolvers/Subscription';
import Autor from './resolvers/Autor';
import * as uuid from 'uuid';
import "babel-polyfill";


const usr = "msanisidrop";
const pwd = "123456abc";
const url = "cluster0-vbkmi.gcp.mongodb.net/test?retryWrites=true&w=majority";

const connectToDb = async function(usr, pwd, url) {
    const uri = `mongodb+srv://${usr}:${pwd}@${url}`;
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  
    await client.connect();
    return client;
};

const runGraphQLServer = function(context){
    const resolvers = {
        
        Entrada,
        Query,
        Mutation,
        Subscription       
    }
    const server = new GraphQLServer({ typeDefs: './src/schema.graphql', resolvers, context });
  const options = {
    port: 5000
  };

  try {
    server.start(options, ({ port }) =>
      console.log(
        `Server started, listening on port ${port} for incoming requests.`
      )
    );
  } catch (e) {
    console.info(e);
    server.close();
  }
};
const runApp = async function() {
    const client = await connectToDb(usr, pwd, url);
    const pubsub = new PubSub();
    console.log("Connect to Mongo DB");
    try {
      runGraphQLServer({ client,pubsub});//meter pubsub
      //En la otra le paso db: definicion... y esa mierda
    } catch (e) {
        console.log(e)
      client.close();
    }
  };
  
  runApp();