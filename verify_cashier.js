const mongoose = require('mongoose');
const User = require('./models/user-model');
const userController = require('./controllers/user-controller');

// Mock res/req
const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.body = data; return res; };
    return res;
};

async function test() {
    try {
        // Find MongoDB URI from env or use default
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kale-cafe';
        await mongoose.connect(uri); 
        console.log("Connected to DB");

        // Clean up previous test users
        await User.deleteMany({ username: { $in: ['test_cashier_1', 'test_cashier_2'] } });

        // Create two test users
        const user1 = new User({ username: 'test_cashier_1', email: 'test1@test.com', password: 'password123' });
        const user2 = new User({ username: 'test_cashier_2', email: 'test2@test.com', password: 'password123' });
        await user1.save();
        await user2.save();
        console.log("Test users created");

        // Set User 1 as cashier
        const res1 = mockRes();
        await userController.updateUser({ params: { id: user1._id }, body: { isCashier: true } }, res1);
        
        const check1_u1 = await User.findById(user1._id);
        const check1_u2 = await User.findById(user2._id);
        console.log(`User 1 is cashier: ${check1_u1.isCashier}`); // Expect true
        console.log(`User 2 is cashier: ${check1_u2.isCashier}`); // Expect false

        // Set User 2 as cashier
        const res2 = mockRes();
        await userController.updateUser({ params: { id: user2._id }, body: { isCashier: true } }, res2);

        const check2_u1 = await User.findById(user1._id);
        const check2_u2 = await User.findById(user2._id);
        console.log(`User 1 is cashier: ${check2_u1.isCashier}`); // Expect false
        console.log(`User 2 is cashier: ${check2_u2.isCashier}`); // Expect true

        if (check2_u2.isCashier && !check2_u1.isCashier) {
            console.log("✅ Unique cashier logic verified!");
        } else {
            console.log("❌ Unique cashier logic FAILED!");
        }

        // Clean up
        await User.deleteMany({ username: { $in: ['test_cashier_1', 'test_cashier_2'] } });
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
