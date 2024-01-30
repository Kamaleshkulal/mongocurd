const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');
//image upload

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single('image');

router.post('/add', upload, async(req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        await user.save();

        req.session.message = {
            type: 'success',
            message: 'User added successfully'
        };

        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});


// Get all user route
router.get("/", async(req, res) => {
    try {
        const users = await User.find().exec();
        res.render("index", {
            title: "Home Page",
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});


// Update User
router.get('/edit/:id', async(req, res) => {
    try {
        let id = req.params.id;
        const user = await User.findById(id).exec();

        if (user == null) {
            res.redirect('/');
        } else {
            res.render("edit_users", {
                title: "Edit User",
                user: user,
            });
        }
    } catch (err) {
        res.redirect('/');
    }
});

// Update User
router.post('/update/:id', upload, async(req, res) => {
    try {
        let id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync("./upload/" + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        const result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        }).exec();

        req.session.message = {
            type: 'success',
            message: 'User updated successfully',
        };

        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});


// Delete User
router.get('/delete/:id', async(req, res) => {
    try {
        let id = req.params.id;
        const result = await User.findByIdAndDelete(id).exec();

        if (result.image !== "") {
            try {
                fs.unlinkSync("./uploads/" + result.image);
            } catch (err) {
                console.log(err);
            }
        }

        req.session.message = {
            type: "info",
            message: "User deleted successfully",
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message });
    }
});


router.get('/', (req, res) => {
    res.render('index', { title: "Home Page" })
})

router.get('/add', (req, res) => {
    res.render('add_users', { title: "Add User" })
})

module.exports = router;