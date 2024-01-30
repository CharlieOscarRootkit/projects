const express = require("express");
const cors = require("cors")
const uuid = require("uuid")
const cookieParser = require("cookie-parser")

require("dotenv").config()
const app = express();
const accessRoles = require("./config.js")


const {hashpassword,comparepassword,sleep,generateSalt,createToken,verifyToken} = require("./lib.js")
const {createUser,selectRecord,findSingleUserRecord,updateSingleUser} = require("./airtable_connect.js")

// parsing json object
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin: true,
    credentials: true, // Include credentials in the CORS response (if needed)
  }))
app.use(cookieParser())

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
        const {business_name,email,business_type,legal_structure,password,industry,sales_representative,website} = req.body
      
        const saltLength = Math.floor(Math.random() * (15 - 5)) + 5
        const salt = generateSalt(saltLength)
        const hashedpassword = await hashpassword(`${salt}${password}${process.env.PAPER}`)
        
    
        let business_user = {
            business_name,
            email,
            business_type,
            legal_structure,
            industry,
            website,
            sales_representative,
            password:`${salt}---${hashedpassword}`
        }
    
        console.log(business_user)
        const createdUser = await createUser(business_user)
        if (createUser){
            res.status(201).json({msg:"Bussiness Account Creation Successfull",created : true})
            // res.redirect(301,"/sign-in")
        }else{
            res.status(422).json({msg:"Bussiness Account Creation Failed",created : false})
        }
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: "Internal Server Error", created: false });
    }
    
})

app.get("/sign-in",(req,res) => {
    res.render("sign_in",{title:"login"})
})



app.post("/sign-in", async (req,res) => {

    // console.log(req.cookies.RefreshToken)
    try {
        const { email, password} = req.body
    
        const user = await findSingleUserRecord(email)
        if (! user){
            return res.json({msg : "wrong email or password",authentication:false}).status(401)
            
        }
    
        console.log(user)
    
        const splitedPassword = user.password.split("---")

        const isPassword = await comparepassword(`${splitedPassword[0]}${password}${process.env.PAPER}`, `${splitedPassword[1]}`)
        
        if(! isPassword){
            await sleep(2000)
            return res.status(401).json({msg : "wrong email or password",authentication:false})
            
        }
        
        const userRole = "business_user"
        const accessTime = 1*60*60*1000
        const refreshTime = 7*60*60*1000
        const AccessTokenPayload = {
            iss:`${req.protocol}://${req.hostname}`,
            user_id: user.id,
            sub:user.email,
            name:user.business_name,
            roles:accessRoles[userRole],
            jti:uuid.v4(),

        }

        const RefreshTokenPayload = {
            iss:`${req.protocol}://${req.hostname}`,
            jti:uuid.v4(),
            sub:user.email,
            user_id: user.id,
            roles:accessRoles[userRole]
          }
          
          const accessToken = await createToken(AccessTokenPayload,accessTime)
          const refreshToken = await createToken(RefreshTokenPayload,refreshTime)

          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: refreshTime, // Convert seconds to milliseconds
            
          });

          
          
        // return res.render("info.ejs",{authentication:true,...user})
        return res.status(200).json({authentication:true, name:user.business_name, msg:`Welcome back ${user.business_name}`,accessToken:accessToken,refreshToken:refreshToken})
    
    } catch (error) {
        console.error(error)
        return res.status(500).json("Internal server Error")
    }


})


app.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;
  
    try {
      // Verify the refresh token
      const verifiedToken = await verifyToken(refreshToken);
  
      if (!verifiedToken) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
      console.log("refresh Token")
      console.log(verifiedToken)
      const user = await findSingleUserRecord(verifiedToken.sub)
    //   console.log(user)
      // Create a new access token
      const accessTokenPayload = {
        iss: `${req.protocol}://${req.hostname}`,
        user_id: user.id,
        sub: user.email,
        name: user.business_name,
        roles: ['user'], // Replace with actual user roles
        jti: uuid.v4(),
      };
  
      const accessTime = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
      
      const newAccessToken = await createToken(accessTokenPayload, accessTime);
  
    console.log("new accessToken")
    console.log(newAccessToken)

      // Send the new access token in the response
      res.status(201).json({ accessToken: newAccessToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


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
