const express = require('express')
const app = express();
const fs = require('fs')
const _ = require('lodash')
const morgan = require('morgan')
const mongoose = require('mongoose')
const Customer = require('./models/customer')
const Transaction = require('./models/transaction')

const dbURI = 'mongodb+srv://evaluator:evaluator0521@bbs.xpe7d.mongodb.net/basic_banking_system?retryWrites=true&w=majority'

app.set('view engine','ejs');

app.use(morgan('dev'))
app.use(express.static('static'))
app.use(express.urlencoded({extended:true}))

mongoose.connect(dbURI,{useNewUrlParser:true, useUnifiedTopology:true})
.then((result)=>{
  console.log("connected to db");
  //console.log(result);
  PORT=process.env.PORT||3000;
  app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`);
  })
})
.catch((err)=>{
  console.log(err)
})


//temporary
app.get('/add-user',(req,res)=>{
  const customer = new Customer({
    name : 'Lorem Ipsum',
    email : 'loremipsum@bmail.com',
    balance : 4000
  })
  customer.save()
  .then((result)=>{
    res.send(result)
  })
  .catch((err)=>{
    console.log(err)
  })
})

//dummy obj to simulate real data
app.get("/",(req,res)=>{
  res.redirect("/home");
})
app.get('/home',(req,res)=>{
  res.render('home');
})

app.get('/customers',(req,res)=>{
  //get all customers
  Customer.find()
  .then((result)=>{
    res.render('customers',{customers:result})
  })
  .catch((err)=>{
    console.log(err)
  })
  //res.render('customers',{customers:result);
})

//'/customers/:id'
app.get('/customers/:id',(req,res)=>{
  id = req.params.id
  Customer.findById(id)
  .then((result)=>{
    //console.log("Customer found")
    res.render('customer',{customer:result});
  })
  .catch((err)=>{
    console.log(err)
  })
})
app.get('/transfers/:id',(req,res)=> {
  //show available recepients except the sender itself
  senderId = req.params.id
  Customer.findById(senderId)
  .then((result)=>{
       senderName = result.name;
       max_transfer = result.balance;
       Customer.find({ "email": { "$ne": result.email }})
       .then((result)=>{
         res.render("transfers",{senderName,senderId,limit:max_transfer,customers:result})
       })
       .catch((err)=>{
         console.log("Error in finding potential recepients");
         console.log(err);
       })
  })
  .catch((err)=>{
    console.log(err)
  })
})

app.post('/transfers',(req,res)=> {
  let senderId = req.body.sender
  let receiverId = req.body.recepient
  let amount = req.body.amount
  let sender_name = ""
  let receiver_name = ""
  Customer.findById(senderId)
  .then((doc)=>{
    doc.balance = doc.balance-Number(amount)
    sender_name = doc.name
    doc.save()
    .then((updated_doc)=>{
      console.log("Amount deducted successfully")
      //console.log(updated_doc)
    })
    .catch((err)=>{
      console.log("Deduction unsuccessful")
      console.log(err)
    })
  })
  .catch((err)=>{
    console.log("Cannot find sender")
    console.log(err)
  })

  Customer.findById(receiverId)
  .then((doc)=>{
    doc.balance = doc.balance + Number(amount)
    receiver_name = doc.name
    doc.save()
    .then((updated_doc)=>{
      console.log("Amount added successfully")
      //console.log(updated_doc)
      //TRANSACTION

      const transaction = new Transaction({
        sender_id : senderId,
        receiver_id : receiverId,
        sender_name : sender_name,
        receiver_name : receiver_name,
        amount_transferred : amount
      })
      transaction.save()
      .then((result)=>{
        console.log("TRANSACTION")
        console.log(result)
      })
      .catch((err)=>{
        console.log("Error in logging transaction")
        console.log(err)
      })
      res.redirect('/customers')
    })
    .catch((err)=>{
      console.log("Addition unsuccessful")
      console.log(err)
    })
  })
  .catch((err)=>{
    console.log("Cannot find receiver")
    console.log(err)
  })
  //------------------------------------------

  //let ids=[req.body.sender,req.body.recepient]
app.get('/about',(req,res)=>{
  res.render('about')
})

})

app.use((req,res)=>{
  res.status(404).render('generic',{val: "404"})

})
