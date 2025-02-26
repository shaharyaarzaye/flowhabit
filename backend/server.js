const express = require('express')
const app = express()

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get('/' , (req , res) =>{
    res.send('server is up')
})


app.post('/signup' , (req , res)=>{
    console.log("A new User Signup Request")
    console.log(req.body)
})

app.post('/login' , (req , res)=>{
    console.log("A Requested to login ")
    console.log(req.body)

})

app.listen(3000 , () =>{
    console.log('server is running at port 3000')
})