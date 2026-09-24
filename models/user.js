const { createHmac, randomBytes } = require("crypto");
const { Schema, model } = require("mongoose");
const { createTokenForUser } = require("../services/auth");

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },

        salt: {
            type: String,
        },

        password: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        profileImageUrl: {
            type: String,
            default: "/images/default.png",
        },

        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER",
        },
    },

    { timestamps: true }
);


//HASH PASSWORD BEFORE SAVING
userSchema.pre("save", async function () {

    const user = this;

    if (!user.isModified("password")) return;

    const salt = randomBytes(16).toString("hex");

    const hashedPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");

    user.salt = salt;
    user.password = hashedPassword;
});


//CHECK PASSWORD DURING SIGN IN
userSchema.static("matchPasswordAndCreateToken", async function (email, password) {

    const user = await this.findOne({ email });

    if (!user) return false;


    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt)
        .update(password)
        .digest("hex");
        if(hashedPassword!==userProvidedHash)throw new Error('incorrect password');

    const token=createTokenForUser(user);
    return token;
});


const User = model("user", userSchema);

module.exports = User;