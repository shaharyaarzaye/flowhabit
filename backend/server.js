import express from 'express'
const app = express()
import mongoose from 'mongoose';
import {User} from './models/users.js'
import cors from 'cors'
import cookieParser from 'cookieparser'
import bcrypt from 'bcrypt'
// import {jwt} from 'jsonwebtoken'


mongoose.connect('mongodb://127.0.0.1:27017/flowhabitdb');


app.use(express.json());
app.use(express.urlencoded({extended:false}));
// app.use(cookieParser())

app.use(cors({
    origin: "https://redesigned-fiesta-46xv5jpg465cq4r5-5173.app.github.dev",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.post("/api/data", (req, res) => {
    const receivedData = req.body;  // Get the sent object
    console.log("Received Data:", receivedData);
    res.json({ message: "Data received successfully", data: receivedData });
});


app.get('/' , (req , res) =>{
    res.send('server is up')
})


app.post('/signup' , async (req , res)=>{
    // console.log("User" , " / " , req.headers['user-agent'] ,"/ IP " ,  req.headers['x-forwarded-for'] )
    const {email , password} = req.body
    const isUser = await User.findOne({email , password});
    if(isUser){
        res.send("You are already a user Please Login....")
    }
    else{
        bcrypt.hash(password, 10, function(err, hash) {
            User.insertOne({email , password : hash })
            res.send("You are Now a user Please Login....")
        });
    }
})

app.post('/login' , async(req , res)=>{
    console.log("A Requested to login ")
    console.log(req.body)
    const {email , password} = req.body
    const isUser = await User.findOne({email})
    console.log(isUser)
    bcrypt.compare(password, isUser.password , function(err, result) {
        if(result){
            console.log("User / " , isUser._id , " / has logged in ")
        }
    });
})

app.listen(3000 , () =>{
    console.log('server is running at port 3000')
});
