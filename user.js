const {ObjectID} = require("mongodb"),
    q = require("q");

exports.validator = {
    $jsonSchema:{
        bsonType:"object",
        required:["username","password"],
        properties:{
            username:{
                bsonType:"string",
                description:"Must be unique and is required"
            },
            password:{
                bsonType:"string",
                description:"Must be a string and is required"
            },

            jobs:{
                bsonType:"array",
                items:{
                    bsonType:"object",
                    properties:{
                        ref:{
                            bsonType:"string",
                            description: "required"
                        },
                        id:ObjectID
                    }
                    
                }
            }
        }
    }
    

}

// exports.EmployeeValidator = {
//     $jsonSchema:{
//         bsonType:"object",
//         required:["username","password"],
//         properties:{
//             username:{
//                 bsonType:"string",
//                 description:"Must be unique and is required"
//             },
//             password:{
//                 bsonType:"string",
//                 description:"Must be a string and is required"
//             },

//             jobs:{
//                 bsonType:"array",
//                 items:{
//                     bsonType:"object",
//                     properties:{
//                         ref:{
//                             bsonType:"string",
//                             description: "required"
//                         },
//                         id:ObjectID
//                     }
                    
//                 }
//             }
//         }
//     }
    

// }

exports.localSignUp = function(username,password,userType){
    deferred = q.defer();
    // userType = req.body.userType;
    // console.log(req.body);
    // db = client.db("job-listing");
    // collection = db.collection("jobs");
    if(userType == "Employer"){
        userCollection = db.collection("Employer") 
    }
    else{
        userCollection = db.collection("Employee");
    }

    user = {username:username,password:password};
    userCollection.findOne({username:username}).then(function(result){
        if(result != null){
            console.log("user already exists");
            deferred.resolve(false);
        }
        else{
            var hash = bcrypt.hashSync(password,10);
            user = {username:username,password:hash,id:result._id};
            userCollection.insertOne(user).then(function(){
                // client.close();
                deferred.resolve(user);
            })
        }
    })

    return deferred.promise;
}


exports.localSignIn = function(username,password,userType){
    deferred = q.defer();
    // userType = req.body.userType;
    // console.log(req.body);
    // db = client.db("job-listing");
    // collection = db.collection("jobs");
    if(userType == "Employer"){
        userCollection = db.collection("Employer");
    }
    else{
        userCollection = db.collection("Employee");
    }

    
    userCollection.findOne({username:username}).then(function(result){
        if(result != null){
            hash = result.password.toString();
            if(bcrypt.compareSync(password,hash)){
                user = {username:username,password:hash,id:result._id};
                deferred.resolve(user);
            }
            else{
                deferred.resolve(false);
            }
        }
        else{
            deferred.resolve(false);
        }
    })

    return deferred.promise;
}