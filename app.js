if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express'),
    app = express(),
    path = require('path'),
    bodyParser = require('body-parser'),
    { MongoClient, Int32 } = require("mongodb"),
    valid = require('./jobs'),
    userModel = require("./user"),
    ObjectId = require("mongodb").ObjectID,
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    { nextTick } = require('process'),
    customError = require('./customError'),
    db = require("./db"),
    session = require("express-session"),
    MongoStore = require('connect-mongo').default,
    // config = require("./config"),
    passport = require('passport'),
    LocalStrategy = require('passport-local')
    bcrypt = require("bcrypt");

const store = MongoStore.create({
    mongoUrl: `mongodb+srv://${process.env.name}:${process.env.pass}@cluster0.kojr7.mongodb.net?retryWrites=true&w=majority`,
    secret: process.env.sessionSecret,
    touchAfter: 24 * 60 * 60
});

store.on("error",function(e){
    console.log("session store error",e);
})
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(morgan('common'));
app.use(session({store,secret:process.env.secret ,saveUninitialized: true, resave: true}))
app.use(passport.initialize());
app.use(passport.session());

const checkValues = function(body){
    console.log(body);
    const values = Object.values(body);
    values.forEach(function(item){
        if(item == '' || item == NaN){
            return new customError(`Please provide value for ${item}`,403,'Error');
        }
    })
}
//---------------------- PASSPORT -----------------------

passport.use("local-signup",new LocalStrategy(
    {passReqToCallback:true},
    function(req,username,password,done,userType){
        userType = req.body.userType;
        userModel.localSignUp(username,password,userType).then(function(user){
            if(user){
            console.log("LOGGED IN AS: " );
            req.session.success = 'You are successfully logged in ' + '!';
            return done(null,{user_id:user.id,username:user.username,password:user.password,userType:req.body.userType});
          }
          if (!user) {
            console.log("COULD NOT LOG IN");
            req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
            return done(null, {user_id:user.id,username:user.username,password:user.password,userType:req.body.userType});
          }
        }).fail(function(err){
          console.log(err);
        })
    }
))

passport.use("local-signin",new LocalStrategy(
    {passReqToCallback:true},
    function(req,username,password,done,userType){
        userType = req.body.userType;
        userModel.localSignIn(username,password,userType).then(function(user){
            if(user){
            console.log("LOGGED IN AS: " );
            req.session.success = 'You are successfully logged in ' + '!';
            return done(null,{user_id:user.id,username:user.username,password:user.password,userType:req.body.userType});
          }
          if (!user) {
            console.log("COULD NOT LOG IN");
            req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
            return done(null,user);
          }
        }).fail(function(err){
          console.log(err);
        })
    }
))


passport.serializeUser(function(user, done) {
    console.log("serializing " + user.username);
    done(null, user);
  });
  
passport.deserializeUser(function(obj, done) {
    console.log("deserializing " + obj);
    done(null, obj);

});

const appliers = async function(){
    
}

const applierFind = async function(req,result){
    if(req.user.user_id && req.user.user_id == result.creator.id){
        var emp_arr = [];
        emp_arr = await Promise.all(result.appliers.map(async function(item){
            emp = await employee_coll.findOne({_id:ObjectId(item.id)});
            return emp;
        }) 
    )
    return emp_arr;
    }

}


const isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.session.error = 'Please sign in!';
    res.redirect('/signin');
}

const isEmployer = function(req,res,next){
    if(req.user.userType == "Employer"){
        return next();
    }
    res.redirect('/signin');
}

// -------------------------------------------------------------------

app.use(function(req,res,next){
    res.locals.user = req.user;
    // res.locals.userType =req.user.userType;
    next();
})


app.get('/',function(req,res){
    res.render('home');
    // collection.insertOne({name:'Amazon',experience:3,qualification:'masters',location:{country:'America',city:'California'}});
})

app.get("/signIn",function(req,res){
    res.render("signin");
})

app.post("/local-login",passport.authenticate("local-signin",{
    successRedirect : '/',
    failureRedirect : '/signIn'
}))

app.post("/local-reg",passport.authenticate("local-signup",{
    successRedirect : '/',
    failureRedirect : '/signIn'
}))

app.get("/logOut",function(req,res){
    console.log("LOGGIN OUT " + req.user.username)
    var name = req.user.username;
    req.logout();
    req.session.notice = "You have successfully been logged out " + name + "!";
    name = "";
    return res.redirect('/');
    
})



app.get('/jobs',function(req,res,next){
    
    console.log(req.user);
    collection.find({},{name:1,qualification:1}).toArray((error, result) => {
        if(error) {
            return next(error);
        }
        res.render('allJobs',{result});
    });
})

app.post('/jobs',isAuthenticated,isEmployer,function(req,res,next){
    req.body.experience = parseInt(req.body.experience);
    collection.insertOne({name:req.body.name,experience:req.body.experience,qualification:req.body.qualification,post:req.body.post,description:req.body.description,location:{country:req.body.country,city:req.body.city},creator:{ref:"Employer",id:ObjectId(req.user.user_id)},appliers:[]},function(err,result){
        if(err){
            return next(err);
        }
        res.redirect('/jobs');
    });
    
})

app.get('/jobs/new',isAuthenticated,isEmployer,function(req,res){
    console.log(req.user.user_id);
    res.render('newJob');
})

app.get('/jobs/:id',async function(req,res,next){
    var id = req.params.id;
    result = await collection.findOne({_id: ObjectId(id)});
    if(!result){
        return next(new customError('ID not found',404));
    }
    if(!req.user){
        res.render('show',{val:result});
    }
    else{
        emp_arr=await applierFind(req,result);
        res.render('show',{val:result,emp_arr});
        
    }
    
})

app.get('/jobs/:id/edit',isAuthenticated,isEmployer,function(req,res,next){
    const id = req.params.id;
    collection.findOne({_id: ObjectId(id)},function(err,result){
        if(!result){
            return next(new customError('ID not found',404));
        }
        else{
            if(result.creator.id == req.user.user_id){
                res.render('edit',{val:result,id:req.params.id});
            }
            else{
                res.redirect("/signIn");
            }
        }
        
    });
})



app.post('/jobs/:id',isAuthenticated,isEmployer,function(req,res,next){
    checkValues(req.body);
    const id = req.params.id;
    req.body.experience = parseInt(req.body.experience);
    collection.updateOne({_id: ObjectId(id)},{$set:{experience:req.body.experience,qualification:req.body.qualification,post:req.body.post,description:req.body.description,location:{country:req.body.country,city:req.body.city}}});
    res.redirect(`/jobs/${id}`);

});

app.delete('/jobs/:id',isAuthenticated,isEmployer,function(req,res){
    const id = req.params.id;
    collection.deleteOne({_id:ObjectId(id)},function(err,results){
        if(err){
            return next(err);
        }
        res.redirect('/jobs');
    })
})

app.post("/jobs/:id/apply",isAuthenticated,function(req,res){
    const id = req.params.id;
    collection.updateOne({_id:ObjectId(id)},{$push:{appliers:{ref:"Employee",id:req.user.user_id}}});
    res.redirect("/jobs");
})

app.use(function(err,req,res,next){
    const {message = 'Something went wrong',status = 500,name = 'Error'} = err;
    if(err.name == 'Error'){
        res.status(status).send(message);
    }
    res.status(status).send(`${name}:${message}`);
})
const PORT = process.env.PORT || 3000;
app.listen(PORT ,function(){
    console.log('Listening at port 3000');
    db.dbConnect();
})