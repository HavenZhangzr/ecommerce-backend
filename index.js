const port = 4000;
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
// const { error } = require("console");

/*
当客户端发送 JSON 数据（如通过 POST 请求），Express 使用 express.json() 将数据解析成 JavaScript 对象，让你可以方便地通过 req.body 访问这些数据。
*/
/*简单来说：
.use() 是用来在 Express 中注册中间件的，中间件实际上就是一个函数，它负责处理客户端的请求。
中间件可以通过接收 req（请求对象）、res（响应对象）和 next（用来传递控制权的函数）三个参数来定义如何处理请求。
具体过程是：

客户端发送请求：当客户端向服务器发出请求时，Express 会根据请求的路径和方法找到相应的路由。
执行中间件：如果有注册在 .use() 上的中间件，它会在请求到达路由之前被执行。这些中间件可以处理很多事情，比如解析请求体、进行身份验证、记录日志等。
中间件的功能：每个中间件函数都会执行一些操作后，调用 next() 将控制权交给下一个中间件，直到最后进入到路由处理。
*/
/*
可以这么理解，app.use() 作为中间件，确实是为 .get() 等路由方法服务的，它可以在路由处理请求之前或者之后进行一些预处理操作。
简而言之，app.use() 会拦截所有请求并执行一些操作（比如日志记录、验证等），然后交给适当的路由方法（如 .get()）来处理最终的响应。
*/
/* 之所以需要用到中间件，而不是把所有的处理逻辑都写在get中，是因为中间件封装了很多函数可以直接拿来用，可以这样理解吗
是的，你理解得很对！中间件的一个关键作用就是将常见的处理逻辑封装成可复用的函数，使得代码更加模块化和可维护。
通过使用中间件，可以避免将所有的处理逻辑写在每个具体的路由方法（如 .get()）中，从而使代码更简洁、易于扩展。
举个例子，为什么要用中间件？
假设我们有一个网站，每次请求都需要检查用户是否已登录，如果没有登录，就返回一个 401 错误。如果我们把这段逻辑写在每个 .get() 或 .post() 路由中，代码会变得非常重复：....
为了解决这个问题，我们可以使用中间件来封装这段逻辑：。。。。
中间件可以自定义，其实就是提一个函数出来，然后直接作为get的第二个参数，表示它只会作用于这个特定的路由。（或者use也是可以指定path的，可以为指定路径注册中间件，效果和传参一样。
如果use没有指定路径，那么他的作用域就是全局，比如express.json()，所有的请求都要执行json的处理）
*/
app.use(express.json()); //它主要用于处理 Content-Type: application/json 的 HTTP 请求（简单来说就是客户端发来的json数据，服务器来自动解析它，并将解析结果存储在 req.body 中）
// 而res.json()是用于将响应数据作为 JSON 格式 返回给客户端的方法。

app.use(cors());

// Database Connection With MongoDB
mongoose.connect("mongodb+srv://zhangzr9030:B4YEW5Pgg2Z1vkEe@cluster0.vkbkz.mongodb.net/e-commerce");


// mongoose.connect("mongodb+srv://zhangzr9030:B4YEW5Pgg2Z1vkEe@cluster0.vkbkz.mongodb.net/Ecommerce", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log("Database connected successfully!"))
//   .catch((err) => console.error("Database connection error:", err));


// API Creation
app.get("/", (req,res)=>{
    res.send("Express App is Running");
})

// Image Storage Engine
/* 
假设上传了一个名为 example.png 的文件：
文件存储路径：upload/images/
文件生成名称：example_1693369298371.png
应用场景：如用户上传头像
*/
//第一段代码 (multer.diskStorage) 是 配置文件的存储方式，包括文件的保存路径 (destination) 和命名规则 (filename)。
//是服务器端的配置（给服务器用的，定义了如何处理上传的文件：存储在哪个文件夹、命名规则等，主要是确保文件存储的方式正确。）
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
      return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})


const upload = multer({ storage: storage })

// Creating Upload Endpoint for images
/*
第二段代码 是客户端请求的处理 包括两部分：
第一个 app.use('/images', express.static('upload/images')) 是让服务器能通过 URL 让客户端访问已经上传的文件。
第二个 app.post("/upload", ...) 是处理客户端上传文件的请求，文件会被存储到服务器的指定位置，上传后服务器返回上传文件的 URL，客户端可以通过这个 URL 获取文件。
*/
//第一个(注册中间件express.static，只用于/images路径的请求)
app.use('/images', express.static('upload/images'))

//第二个（出来客户端的post请求）
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
      success: 1,
      image_url: `http://localhost:${port}/images/${req.file.filename}`//响应信息：上传成功后，服务器返回包含 image_url（图像的访问 URL）的 JSON 响应，客户端可以根据这个 URL 获取上传的图像。
    })
})

// Schema for Creating Products

const Product = mongoose.model("Product",{
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    avilable: { type: Boolean, default: true }
})

// Create an endpoint for adding products using admin panel
app.post("/addproduct", async (req, res) => {
    let products = await Product.find({});
    let id;
    if(products.length > 0) {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else{
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
      });
      console.log(product);
      await product.save();
      console.log("Saved");
      res.json({
        success:true,
        name:req.body.name,
      })
  });

// Creating API For Deleting Products
app.post('/removeproduct', async (req,res) => {
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name
    })
})

// Creating API For Getting All Products
app.get("/allproducts", async (req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

// Schema Creating For User Model
const Users = mongoose.model('User',{
    name: {type:String,},
    email: {type:String, unique:true,},
    password: {type:String},
    cartData: {type:Object},
    date: {type:Date, default:Date.now,}
})

// Creating Endpoint for resgistering the user
/*
验证身份的完整流程
用户登录：

客户端发送用户名和密码到服务器。
服务器验证后，生成 JWT Token，并返回给客户端。
客户端存储 Token：

将 Token 存储在 localStorage 或 cookies 中。
客户端每次请求附带 Token：

在请求头中附加 Authorization: Bearer <token>。
服务器验证 Token：

通过 jwt.verify() 解码和验证 Token。
验证成功后，提取用户信息，用于业务逻辑.

总结
Token 是一种加密字符串，包含用户身份信息。
密钥 用于加密和验证 Token，只有服务器知道。
验证身份时：
用户登录后生成 Token。
客户端发送请求时附带 Token。
服务器验证 Token 后确定用户身份。
*/
app.post('/signup', async (req,res)=>{
    let check = await Users.findOne({email:req.body.email})
    if(check){
        return res.status(400).json({success:false,errors:"existing user found with same email address"})
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i]=0;
    }
    const user = new Users({
        name: req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save();

    const data = {
        user: {id:user.id}
    }

    const token = jwt.sign(data, 'secret_ecom');
    res.json({success:true, token})
})

// Creating endpoint for user login
app.post('/login', async (req,res)=> {
    let user = await Users.findOne({email:req.body.email});
    if (user) {
        const passCompare = req.body.password === user.password;
        if(passCompare) {
            const data = {
                user:{id: user.id}
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({success:true, token})
        }
        else {
            res.json({success:false,errors:"Wrong Password"})
        }
    }
    else {
        res.json({success:false,errors:"Wrong Email Id"})
    }
})


// creating endpoint for newcollection data
app.get('/newcollection',async (req,res)=>{
    let products = await Product.find({});
    let newcollection= products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
})


// creating endpoint for popular in women section
app.get('/popularinwomen',async (req,res)=>{
    let products = await Product.find({category:"women"});
    let popular_in_women = products.slice(0,4);
    console.log("Popular in women fetched");
    res.send(popular_in_women);
})

// creating middleware to fetch user
/*
fetchUser 的作用总结
中间件拦截了请求，在 req 对象上动态添加了一个 user 属性，用于存储解码后的用户信息。
*/
const fetchUser = async (req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"Please authenticate using valid token"})
    }
    else{
        try{
            const data = jwt.verify(token,'secret_ecom');
            req.user = data.user; // 动态给 req 对象添加 user 属性
            next()
        }catch(error){
            res.status(401).send({errors:"Please authenticate using valid token"})
        }
    }
}

// creating endpoint for adding products in cartdata
app.post('/addtocart', fetchUser, async (req,res)=>{
    // console.log(req.body,req.user);
    console.log("added",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id})
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added")
})

// creating endpoint for removing products in cartdata
app.post('/removefromcart', fetchUser, async (req,res)=>{
    // console.log(req.body,req.user);
    console.log("removed",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id})
    if(userData.cartData[req.body.itemId]>0){
        userData.cartData[req.body.itemId] -= 1;
    }
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Rmoved")
})

// creating endpoint to get cartdata
app.post('/getcart', fetchUser, async (req,res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})



app.listen(port, () => {
  console.log("Server Running on Port " + port);
});