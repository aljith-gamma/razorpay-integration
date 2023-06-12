

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const Razorpay = require('razorpay'); 
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Razorpay'
    })
})

app.post('/createorder', async (req, res) => {
    const { amount, currency, receipt, notes } = req.body;
    
    const rzpService = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
    
    rzpService.orders.create({
        amount,
        currency,
        receipt,
        notes
    }, (err, order) => {
        if(err){
            console.log(err);
        }else {
            res.json({ order });
        }
    })
})

app.post('/verifyorder', async (req, res) => {
    const { order_id, payment_id } = req.body;
    const razorpay_signature =  req.headers['x-razorpay-signature'];

    let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);

    hmac.update(order_id + "|" + payment_id);

    const generated_signature = hmac.digest('hex');
    console.log(generated_signature);

    if(razorpay_signature === generated_signature){
        res.json({success:true, message:"Payment has been verified"})
    }else {
        res.json({success:false, message:"Payment verification failed"})
    }
})

app.listen(3000, () => {
    console.log('Server started on port: ', 3000);
})