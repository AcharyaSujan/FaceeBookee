const express = require("express");
const path = require("path");
const app = express();
const multer = require('multer');
const hbs = require("hbs");

require("./db/conn");
const Register = require("./models/registers");
const Profile = require("./models/updateimg");
const Post = require("./models/addpost");
const Text = require("./models/addtext");


const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public" );
const template_path = path.join(__dirname, "./view" );

app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views",template_path);

app.get("/logout", (req, res) =>{
    res.render("login");
});

app.get("/", (req, res) =>{
    res.render("login");
});

app.get("/register", (req, res) =>{
    res.render("register");
});

app.get("/index", (req, res) =>{
    res.render("index");
});

app.post("/register", async(req, res) =>{

    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password === cpassword){

            const registerUser = new Register({
                firstname: req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                gender:req.body.gender,
                age:req.body.age,
                phone:req.body.phone,
                password:password,
                confirmpassword:cpassword
            })

            const registered = await registerUser.save();

            res.render("login");
        }else{
            res.send("password are not Matching")
        }
    }
    catch(error){
       res.status(400).send(error);
    }
});


app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await Register.findOne({ email: email });

        console.log("User Retrieved:", user); // Log user information

        if (user && user.password === password) {
            res.status(201).render("index", { user: user });
        } else {
            res.send("Password does not match");
        }
    } catch (error) {
        console.error("Error:", error); // Log any errors
        res.status(400).send("Invalid Email");
    }
});



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/img"); // Check if the 'uploads' folder exists in the project directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});


const upload = multer({ storage: storage });

app.post('/update-profile-image', upload.single('profileImage'), async (req, res) => {
    const { firstName, lastName } = req.body;
    console.log(req.file.filename)
    const profilePicture = {
        data: req.file.buffer,
        imgName: req.file.filename,
        contentType: req.file.mimetype
    };

    try {
       await Profile.findOneAndUpdate(
            {
                firstName: firstName,
                lastName: lastName,
                imageName: req.file.filename,
                profilePicture: profilePicture
            },
            // { firstName, lastName },
            { $set: { profilePicture } },
            { upsert: true }
        );

        await Register.findOneAndUpdate(
            {firstname: firstName}
            ,{$set: {imageName:req.file.filename}}
            ,{upsert: true}
        )


        res.status(200);
        const profile = await Register.findOne({imageName: req.file.filename });
        // console.log(profile);
        const usertext = await Text.findOne({ firstname: firstName }).sort({ createdAt: -1 }) 
        const userpost = await Post.findOne({firstname: firstName}).sort({ createdAt: -1 })
        res.render("index", { user: profile,userPost: userpost, userText: usertext })
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/addingpost', upload.single('feedimage'), async (req, res) => {
    console.log(req.body.content);
    console.log(req.file); // This will contain information about the uploaded image file

    // Create a new post instance using the Post model
    const newPost = new Post({
        firstname: req.body.firstname,
        content: req.body.content,
        image: req.file.filename // Assuming your Post model has an 'image' field
    });

    // Save the new post to the database
    try {
        let a = await newPost.save();
       
        const user = await Register.findOne({ firstname: req.body.firstname });
        const usertext = await Text.findOne({ firstname: req.body.firstname });

        const userpost = await Post.findOne({ _id: a._id });
        console.log(userpost)
        res.render("index", { user: user, userPost: userpost, userText: usertext });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(400).send('Unable to save post to database');
    }
});



app.post('/addtext', async (req, res) => {
    console.log(req.body)
    // Create a new post instance using the Post model
    const newText = new Text({
      firstname:req.body.firstname,
      content: req.body.content,
    });

    // Save the new post to the database
    try {
        let a = await newText.save();
        const user = await Register.findOne({ firstname: req.body.firstname });
        const usertext = await Text.findOne({ _id: a._id });
        const userpost = await Post.findOne({firstname: req.body.firstname});

        res.render("index", { user: user, userText: usertext, userPost: userpost});
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(400).send('Unable to save text-post to database');
    }
    
});
    
 
// Delete post
app.post('/deletepost', async (req, res) => {
    const deletepostid = req.body.id;
    // console.log(deletepostid)

    try {
        const deletedPost = await Post.findByIdAndDelete(deletepostid);
       
        const user = await Register.findOne({ firstname: req.body.fname });
        const usertext = await Text.findOne({ firstname: req.body.fname }).sort({ createdAt: -1 }) // Sort in descending order based on the createdAt field
        .exec();

        res.render("index", { user: user, userPost: "", userText: usertext });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting post');
    }
});

// Delete text
app.post('/deletetext', async (req, res) => {
    const delettextid = req.body.id;
    console.log(`text id: ${req.body.id}`)

    try {
        await Text.findByIdAndDelete(delettextid);
       
        const user = await Register.findOne({ firstname: req.body.fname });
        const userpost = await Post.findOne({firstname: req.body.fname}).sort({ createdAt: -1 }) // Sort in descending order based on the createdAt field
        .exec();


        res.render("index", { user: user, userText: "", userPost: userpost });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting text-post');
    }
});

app.listen(port, ()=>{
    console.log(`server is running at port no ${port}`);
});
