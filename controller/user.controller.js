import pkg from 'bcryptjs'
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import crypto from "crypto";
import path from 'path';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';

// import nodemailer from 'nodemailer';
const { compareSync } = pkg

export const UserController = {
    registrationuser: async (data, user) => {
        if (!data.firstName) {
            throw ({ message: "firstName Is Required" })
        }
        if (!data.lastName) {
            throw ({ message: "firstName Is Required" })
        }
        if (!data.password) {
            throw ({ message: "Password Is Required" })
        }
        if (!data.email) {
            throw ({ message: "Email Is Required" })
        }
        if (!data.country) {
            throw ({ message: "Country Is Required" })
        }
        if (!data.state) {
            throw ({ message: "State Is Required" })
        }
        if (!data.city) {
            throw ({ message: "City Is Required" })
        }
        if (!data.gender) {
            throw ({ message: "Gender Is Required" })
        }
        if (!data.dob) {
            throw ({ message: "Date Is Required" })
        }
        if (!data.zip) {
            throw ({ message: "zip code Is Required" })
        }
        if (!data.areaInterest) {
            throw ({ message: "Area of interest Is Required" })
        }
        const existinguser = await User.findOne({ email: data.email })
        if (existinguser) {
            throw ({ code: 409, message: "Email Already Exist" })
        }
        const Passwordsalt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash(data.password, Passwordsalt);
        const newUser = new User({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: encryptedPassword,
            gender: data.gender,
            dob: data.dob,
            country: data.country,
            state: data.state,
            city: data.city,
            zip: data.zip,
            areaInterest: data.areaInterest,
            // createBy: user._id
        });
        console.log(newUser)
        newUser.save().catch((err) => {
            console.error(err);
            throw { code: 500, message: "Failed to save user" };
        });

    },
    GenerateUserAccessToken: async (email, password, persist) => {

        if (!email) {
            throw { code: 400, message: "Invalid value for: User Name" };
        }
        if (!password) {
            throw { code: 400, message: "Invalid value for: password" };
        }
        const existingUser = await UserController.findUser({
            email: email,
        });
        console.log(existingUser)
        if (!existingUser) {
            throw { code: 401, message: "Invalid email or password" };
        }

        // if (existingUser.locked === false) {
        //     throw { code: 401, message: "User account is locked" };
        // }
        const passwordValid = await bcrypt.compare(password, existingUser.password);
        if (!passwordValid) {
            throw { code: 401, message: "Invalid User Name or password" };
        }

        console.log("Hashed password:", existingUser.password);


        const accessTokenResponse = {
            id: existingUser._id,
            email: existingUser.email,
            // role: existingUser.roles,
        };

        const accessToken = jwt.sign(
            accessTokenResponse,
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: persist ? "1y" : "8h",
            }
        );

        return {
            email: existingUser.email,
            accessToken: accessToken,
            // role: existingUser.roles,
            // balance: existingUser.balance,
            // loadBalance: existingUser.loadBalance,
            // isActive: existingUser.isActive

        };
    },
    sendResetPasswordEmail: async (email) => {
        const existingUser = await UserController.findUser({ email: email });
        console.log('Existing User:', existingUser);

        if (!existingUser) {
            throw { code: 409, message: "First Register with Reliablechess" };
        }
        existingUser.tokens = existingUser.tokens || {};


        const emailVerificationCode = await crypto.randomBytes(6).toString("hex");
        existingUser.tokens.passwordReset = emailVerificationCode;
        existingUser.save().catch((err) => {
            console.error(err);
            throw { code: 500, message: "Failed to save new password" };
        });

        nodemailer
            .createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: true,
                auth: {
                    user: process.env.SMTP_CLIENTID,
                    pass: process.env.SMTP_CLIENTSECRET,
                },
            })
            .sendMail({
                from: `'Reliablechess' <${process.env.SMTP_SENDER}>`,
                to: email,
                subject: "Password Reset Code",
                text: `The verification code to reset your password is ${emailVerificationCode}. (Note) : If you have not initiated a password reset then contact support as soon as possible. `,
            })
            .catch((err) => {
                console.error(err);
                throw { code: 500, message: "Failed to send verification email" };
            });

        return existingUser;
    },
    verifyPasswordResetCode: async (code, email, password) => {
        const existingUser = await UserController.findUser({ email: email });
        if (existingUser.tokens.passwordReset !== code) {
            throw { code: 401, message: "Entered wrong Code" };
        }

        const passwordIsDuplicate = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (passwordIsDuplicate) {
            throw {
                code: 409,
                message: "New Password cannot be the same as existing password",
            };
        }

        const passwordSalt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash(password, passwordSalt);

        existingUser.password = encryptedPassword;
        existingUser.save().catch((err) => {
            console.error(err);
            throw { code: 500, message: "Failed to save new password" };
        });

        return true;
    },
    findUser: async (filter) => {
        if (!filter) {
            throw { code: 409, message: "Required parameter: filter" };
        }
        return User.findOne(filter).exec();
    },
}