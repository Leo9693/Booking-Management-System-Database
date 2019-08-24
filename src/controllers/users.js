
const bcrypt = require('bcrypt');
const User = require('../models/users');
const { generateToken } = require('../utils/jwt');


async function getAllUsers(req, res) {
    const allUsers = await User.find().exec();
    if (!allUsers) {
        return res.status(404).json('Users are not found');
    }
    return res.json(allUsers);
}

async function getUserById(req, res) {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json('User is not found');
    }
    return res.json(user);
}

async function addUser(req, res) {
    const { name, email, password } = req.body;
    let existingUser = await User.findOne({ name });
    if (existingUser) {
        return res.status(400).json('Name has already been used');
    }

    existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json('Email has already been used');
    }

    const hashPassword = bcrypt.hashSync(password, 10);
    const user = new User({ name, email, hashPassword });
    if (!user) {
        return res.status(500).json('Adding user failed');
    }

    await user.save();
    const { _id } = user;
    const token = generateToken(_id);
    return res.json({ _id, name, email, token });
}

async function updateUser(req, res) {
    const { id } = req.params;
    const { name, email } = req.body;
    const existingUser = await User.findById(id);
    if (name !== existingUser.name) {
        const checkingUserByName = await User.findOne({ name });
        if (checkingUserByName) {
            return res.status(400).json('Name has already been used');
        }
    }

    if (email !== existingUser.email) {
        const checkingUserByEmail = await User.findOne({ email });
        if (checkingUserByEmail) {
            return res.status(400).json('Email has already been used');
        }
    }

    // const hashPassword = bcrypt.hashSync(password, 10);
    const updatedUser = await User.findByIdAndUpdate(
        id,
        { name, email },
        { runValidators: true, new: true }
    );
    if (!updatedUser) {
        return res.status(404).json('updating user failed');
    }

    return res.json(updatedUser);
}

async function updatePassword(req, res) {
    const { id } = req.params;
    const { originalPassword, newPassword } = req.body;
    console.log(originalPassword);
    console.log(newPassword);
    const existingUser = await User.findById(id);
    const isValidPassword = await bcrypt.compareSync(originalPassword, existingUser.hashPassword);
    if (!isValidPassword) {
        return res.status(401).json('Invalid original password');
    }

    const hashPassword = bcrypt.hashSync(newPassword, 10);
    const updatedPassword = await User.findByIdAndUpdate(
        id,
        { hashPassword },
        { runValidators: true, new: true }
    );
    if (!updatedPassword) {
        return res.status(404).json('updating password failed');
    }

    return res.json(updatedPassword);
}

async function deleteUser(req, res, next) {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
        return res.status(404).json('Deleting user failed');
    }

    return res.json(deletedUser);
}

async function loginUser(req, res) {
    const { name, password } = req.body;
    const existingUser = await User.findOne({ name });
    if (!existingUser) {
        return res.status(401).json('Invalid user name');
    }

    const isValidPassword = await bcrypt.compareSync(password, existingUser.hashPassword);
    if (!isValidPassword) {
        return res.status(401).json('Invalid password');
    }

    const { email } = existingUser;
    const { _id } = existingUser;
    const token = generateToken(_id);
    const userInfo = { _id, name, email, token };
    const data = { userInfo };
    return res.json(data);
}

module.exports = {
    getAllUsers,
    getUserById,
    addUser,
    updateUser,
    updatePassword,
    deleteUser,
    loginUser
};