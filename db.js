// const config = require("./config");
const MongoClient = require("mongodb");
const valid= require("./jobs");
const uri =`mongodb+srv://${config.name}:${config.pass}@cluster0.kojr7.mongodb.net?retryWrites=true&w=majority`;
exports.dbConnect = function(){
    
    MongoClient.connect(uri,{ useNewUrlParser: true , useUnifiedTopology: true },function(err,client){
        console.log("Connected to DB");
        db = client.db('job-listing');
        // db.createCollection('Employer',{validator: userModel},function(err,res){
        //     console.log('Employer connection created');
        // });

        // db.createCollection('Employee',{validator: userModel},function(err,res){
        //     console.log('Employee connection created');
        // });
        // db.command({collMod:'jobs',validator:valid},function(err,result){
        //     console.log('schema changed');
        // });
        collection = db.collection('jobs');
        employee_coll = db.collection("Employee");
        employer_coll = db.collection("Employer");
    })

}