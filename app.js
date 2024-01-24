const express = require("express");
const cors = require("cors")
const app = express();


const {hashpassword,comparepassword} = require("./lib.js")
const {createUser,selectRecord,findSingleUserRecord,updateSingleUser} = require("./airtable_connect.js")

// parsing json object
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())

// set EJS as view engine
app.set("view engine","ejs")
app.set("views",`${__dirname}/views`)

app.get("/", async (req, res) => {
    const id = "admin"
    const data = await findSingleUserRecord(id)
    console.log(data)
    res.json(data).status(200)
});

app.get("/sign-up", (req,res) => {
    res.render("sign_up",{title : "Sign-up page"})
})  

app.post("/sign-up", async (req,res) => {

    try {
        const {business_name,email,business_type,legal_structure,password} = req.body
        const hashedpassword = await hashpassword(password)
    
        let business_user = {
            business_name,
            email,
            business_type,
            legal_structure,
            password:hashedpassword
        }
    
        console.log(business_user)
        const createdUser = await createUser(business_user)
        if (createUser){
            res.redirect(301,"/sign-in")
        }else{
            res.json("fail to create").status(422)
        }
        
    } catch (error) {
        console.error(error)
        return res.json("Internal server Error").status(500)
    }
    
})

app.get("/sign-in",(req,res) => {
    res.render("sign_in",{title:"login"})
})

app.post("/sign-in", async (req,res) => {
    try {
        const { email, password} = req.body
    
        const user = await findSingleUserRecord(email)
        if (! user){
            return res.json({msg : "wrong email or password",authentication:false}).status(401)
            
        }
    
        console.log(user)
    
        const isPassword = await comparepassword(password, user.password)
        if(! isPassword){
            return res.json({msg : "wrong email or password",authentication:false}).status(401)
            
        }
    
        return res.render("info.ejs",{authentication:true,...user})
        // return res.json({authentication:true, msg:`Welcome back ${user.business_name}`}).status(200)
    
    } catch (error) {
        console.error(error)
        return res.json("Internal server Error").status(500)
    }


})


app.post("/update",async (req,res) => {
    
    
    

    console.log(`updating record ${req.body.recordId}`)
    console.log(req.body)

    try {
        const updates = await updateSingleUser(req.body.recordId,req.body.updates)
        console.log(updates)
       return  res.status(200).json({updated : updates})
    } catch (error) {
        console.log(error)
        return res.status(500).json({err:"Internal server Error"})
    }
    
})

app.get("/users-overview", (req,res) => {
    res.render("user_overview",{title:"Users Overview Page"})
})

module.exports = app;
