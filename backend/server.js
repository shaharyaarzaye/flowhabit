import express from 'express'
const app = express()
import mongoose from 'mongoose';
import {User} from './models/users.js'
import cors from 'cors'
mongoose.connect('mongodb://127.0.0.1:27017/flowhabitdb');

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get('/' , (req , res) =>{
    res.send('server is up')
})


app.post('/signup' , async (req , res)=>{
    console.log("User" , " / " , req.headers['user-agent'] ,"/ IP " ,  req.headers['x-forwarded-for'] )
    const {email , password} = req.body
    const newUser = await User.insertOne({email , password})
    res.redirect('/')
})

app.post('/login' , (req , res)=>{
    console.log("A Requested to login ")
    console.log(req.body)

})

app.listen(3000 , () =>{
    console.log('server is running at port 3000')
});
