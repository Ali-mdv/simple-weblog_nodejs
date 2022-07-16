const inquirer = require("inquirer");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const config = require("config");
const User = require("./src/models/user");


let adminInfo = {};

const questions = [
    {
        type: "input",
        name: "first",
        message: "first name?",
    },
    {
        type: "input",
        name: "last",
        message: "last name?",
    },
    {
        type: "input",
        name: "username",
        message: "username?",
        validate: async (answer) => {
            if (!answer) return "username required";

            const user = await User.findOne({ username: answer });
            if (user) return "user with this username exist";
            return true;
        },
    },
    {
        type: "input",
        name: "email",
        message: "email?",
        validate: async (answer) => {
            if (!answer) return "email required";
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(answer)) {
                return "invalid email";
            }

            const user = await User.findOne({ email: answer });
            if (user) return "user with this email exist";
            return true;
        },
    },
    {
        type: "password",
        name: "password1",
        message: "password?",
        mask: "*",
        validate: (answer) => {
            if (!answer) return "password required";
            adminInfo.password1 = answer;
            return true;
        },
    },
    {
        type: "password",
        name: "password2",
        message: "password(again)?",
        mask: "*",
        validate: (answer) => {
            if (!answer) return "confirm password required";
            adminInfo.password2 = answer;
            if (answer !== adminInfo.password1) {
                return "passwords not match";
            }
            return true;
        },
    },
];

mongoose
    .connect(config.get("db.address"))
    .then(() => {
        inquirer.prompt(questions).then(async (answers) => {
            adminInfo = { ...answers, ...adminInfo };
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(adminInfo.password1, salt);

            const newAdmin = new User({
                first: adminInfo.first,
                last: adminInfo.last,
                username: adminInfo.username,
                email: adminInfo.email,
                password: hashPassword,
                is_active: true,
                is_admin: true,
                is_special: true,
            });
            await newAdmin.save();
            console.log(newAdmin);
            mongoose.disconnect();
        });
    })
    .catch(() => {
        console.log("could not connected to database");
    });
