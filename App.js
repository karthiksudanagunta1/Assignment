const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');


const app = express();
const PORT = process.env.PORT || 3000;


app.use(bodyParser.json());

// Database setup with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'user_registration.db' 
});

// Define models
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
});

const Address = sequelize.define('Address', {
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Set up relationships
User.hasMany(Address, { foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId' });

// Sync database
sequelize.sync({ force: true }).then(() => {
    console.log('Database & tables created!');
});



app.post('/register', async (req, res) => {
    const { username, email, addresses } = req.body;

    try {
        const user = await User.create({ username, email });
        if (addresses && addresses.length > 0) {
            for (const addr of addresses) {
                await Address.create({ address: addr, userId: user.id });
            }
        }
        res.status(201).json({ message: 'User registered successfully!', userId: user.id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get User by ID Route
app.get('/register/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id, {
            include: Address 
        });

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
