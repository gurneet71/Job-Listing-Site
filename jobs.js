const { MongoClient, ObjectID } = require("mongodb");

const valid = {
    $jsonSchema: {
       bsonType: "object",
       required: [ "name", "experience", "qualification", "location","post","description" ],
       properties: {
          name: {
             bsonType: "string",
             description: "must be a string and is required"
          },
          experience: {
              bsonType: "int",
              description: "must be an integer in [ 0,20 ] and is required"
          },
          qualification:{
            enum:['secondary-school','bachelors','masters'],
            description: "can only be one of the enum values and is required"
          },
          post:{
            bsonType:"string",
            description: "must be a string and is required"
          },
          description:{
            bsonType:"string",
            description: "must be a string and is required"
          },
          location:{
            bsonType:"object",
            required: [ "city","country" ],
               properties: {
                  country: {
                     bsonType: "string",
                     description: "must be a string and is required"
                  },
                  city: {
                     bsonType: "string",
                     description: "must be a string and is required"
                    }
               }
         },
         creator:{
            bsonType:"object",
            properties:{
               ref:{
                  bsonType:"string",
               },
               id:{
                  bsonType:ObjectID
               }
            }
            
         }
        },
        appliers:{
           bsonType:"array",
           items:{
              bsonType:"object",
              properties:{
                 ref:{
                    bsonType:"string",
                 },
                 id:{
                  bsonType:ObjectID
                 }
              }
           }
        }
    }
}

module.exports = valid;

