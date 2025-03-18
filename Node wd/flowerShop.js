let express=require('express')
const app=express()
var mysql = require('mysql2');
const bodyParser = require('body-parser');
const ejs = require('ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(3000,()=>{})

app.set('view engine','ejs')
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "########",
    database: "flowerShop"
});
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});
app.get('/',(req,res)=>{
    res.sendFile("public/home.html",{root:__dirname})
})
app.get('/aboutus',(req,res)=>{
    res.sendFile('public/aboutus.html',{root:__dirname})
});
app.get('/contactus',(req,res)=>{
    res.sendFile('public/contact.html',{root:__dirname})
})
app.get('/customer',(req,res)=>{
    const q1="SELECT * from customer"
    con.query(q1,(err,results)=>{
        if(err) throw err;
        res.render('cust',{customers:results})
    })
})


app.get('/orders',(req,res)=>{
    const q1="SELECT * from orders"
    con.query(q1,(err,results)=>{
        if(err) throw err;
        res.render('orders',{orders:results})
    })
})
app.get('/myproducts',(req,res)=>{
    const q1="SELECT * from product"
    con.query(q1,(err,results)=>{
        if(err) throw err;
        res.render('myproduct',{products:results})
    })
})
app.get('/help',(req,res)=>{
    res.sendFile('public/help.html',{root:__dirname})
})
app.get('/help/orderdisplay',(req,res)=>{
    res.sendFile('public/orderdisplay.html',{root:__dirname})
})
app.post('/help/orderdisplay',async (req,res)=>{
    const oid=req.body.orderID
    var cusid=0;
    var pid;
    var qty;
    var pri;
    var q1=`select customer_id,product_id,qty from ORDERS where order_id=${oid}`;
    await new Promise((resolve, reject) => {
        con.query(q1, (err, result) => {
            if (err) reject(err);
            cusid=result[0].customer_id;
            pid=result[0].product_id;
            qty=result[0].qty;
          
            resolve();
        });
    });
    var pname;
    var q2=`select product_name,price from product where product_id="${pid}"`;
    await new Promise((resolve, reject) => {
        con.query(q2, (err, result) => {
            if (err) reject(err);
            pri=result[0].price;
           pname=result[0].product_name
            resolve();
        });
    });
    const totalp=parseFloat(pri)*parseInt(qty);
  // res.json({order_id:oid,customer_id:cusid,product_name:pname,quantity:qty,total_price:totalp})
   res.render('orderdetails',{order_id:oid,customer_id:cusid,product_name:pname,quantity:qty,total_price:totalp,msg:" "})
})

app.get('/help/orderdelete',(req,res)=>{
    res.sendFile('public/orderdelete.html',{root:__dirname})
})

app.post('/help/orderdelete',async(req,res)=>{
    const oid=req.body.orderID
    var cusid=0;
    var pid;
    var qty;

    var pri;
    var q1=`select customer_id,product_id,qty from ORDERS where order_id=${oid}`;
    await new Promise((resolve, reject) => {
        con.query(q1, (err, result) => {
            if (err) reject(err);
            cusid=result[0].customer_id;
            pid=result[0].product_id;
            qty=result[0].qty;
          
            resolve();
        });
    });
    
    var pname;
    var q2=`select product_name,price from product where product_id="${pid}"`;
    await new Promise((resolve, reject) => {
        con.query(q2, (err, result) => {
            if (err) reject(err);
            pri=result[0].price;
           pname=result[0].product_name
            resolve();
        });
    });
    var q3=`delete from orders where order_id=${oid}`;
    await new Promise((resolve, reject) => {
        con.query(q3, (err, result) => {
            if (err) reject(err);
            
            resolve();
        });
    });
    var q4=`delete from customer where customer_id=${cusid}`;
    await new Promise((resolve, reject) => {
        con.query(q4, (err, result) => {
            if (err) reject(err);
            
            resolve();
        });
    });
    var q5=`update product set totalQty=totalQty+${qty} where product_id="${pid}"`;
    await new Promise((resolve, reject) => {
        con.query(q5, (err, result) => {
            if (err) reject(err);
            
            resolve();
        });
    });


const totalp=parseFloat(pri)*parseInt(qty);
res.render('orderdetails',{order_id:oid,customer_id:cusid,product_name:pname,quantity:qty,total_price:totalp,msg:"Order Deleted"})
})

app.get('/product',(req,res)=>{
    res.sendFile("public/products.html",{root:__dirname})
})

app.get('/product/:productId', (req, res) => {
    const productId = req.params.productId;
    const query = `SELECT * FROM product_details WHERE product_id = "${productId}"`;
    const query2=`SELECT price FROM product WHERE product_id = "${productId}"`;
    var pri=0;
    con.query(query2,(err,results)=>{
        if(err){
            console.error('Error');
            return;
        }


        pri=results[0].price;
    })
    con.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product details:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('Product not found');
            return;
        }

        let fn=results[0].name
        let des=results[0].Description
        let caring=results[0].CaringTips
        let weat=results[0].AdequateWeather
        let imglink=results[0].imglink
        res.render('productDetails',{fname:`${fn}`,pid:req.params.productId,fdesc:`${des}`,fimage:imglink,fcare:caring,fweather:weat,fprice:pri})
        // res.send(results)
    });
});


app.get('/product/:productId/booknow',(req,res)=>{ 
    //console.log('BOOKing')
    let x=req.params.productId+"/booknow"
    const query2=`SELECT price FROM product WHERE product_id = "${req.params.productId}"`;
    var pri=0;
    con.query(query2,(err,results)=>{
        if(err){
            
            console.error('Error');
            return;
        }

        pri=results[0].price;
        res.render('placeorder',{pid:`${x}`,price:`${pri}`})
    })
})

app.post('/product/:productId/booknow',async(req,res)=>{
    try{

        const fname=req.body.firstName;
        const lname=req.body.lastName;
        const emailid=req.body.email;
        const pno=req.body.phoneNumber;
        const qnty=req.body.quantity;
        const tbill=req.body.totalBill;


    const q1=`Insert into customer(first_name,last_name,phoneno,email) values ("${fname}","${lname}","${pno}","${emailid}")`

    var q2=`select customer_id from customer order by customer_id desc limit 1`;
   
    
    await new Promise((resolve, reject) => {
        con.query(q1, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });
    const rows = await new Promise((resolve, reject) => {
        con.query(q2, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
    const cusid = rows[0].customer_id;
    var price;
    var q3=`insert into orders (customer_id,product_id,qty) values (${cusid},"${req.params.productId}","${qnty}")`;
    
    await new Promise((resolve, reject) => {
        con.query(q3, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });
    var q4=`select order_id from orders order by customer_id desc limit 1`;
    var oid=0;
    await new Promise((resolve, reject) => {
        con.query(q4, (err, result) => {
            if (err) reject(err);
            oid=result[0].order_id
            resolve();
        });
    });

    
    var q5=`update product set totalQty=totalqty-${qnty} where product_id="${req.params.productId}"`;
    
    await new Promise((resolve, reject) => {
        con.query(q5, (err, result) => {
            if (err) reject(err);
            resolve();
        });
    });
   
    var q6=`select product_name,price from product where product_id="${req.params.productId}"`;
    var proname;
    var pri;
    await new Promise((resolve, reject) => {
        con.query(q6, (err, result) => {
            if (err) reject(err);
            pri=result[0].price;
           proname=result[0].product_name
            resolve();
        });
    });
    const totalp=parseFloat(pri)*parseInt(qnty);

    const finalbill={order_id:oid,customer_name:`${fname} ${lname}`,phoneNumber:pno,email:emailid ,pname:proname,price:pri,quantity:qnty,totalPrice:tbill}

    res.render('totalbill', { bill: finalbill });


    //price 
    // res.json({name:name,phonenumber: phoneNo,address:address ,orderId: cusid, totalprice: calculateTotalPrice(price, inventory_quantity) });
    // res.render("cusform",{product_id:product_id});

}catch(err){
    console.log(err);
    res.status(500).send("Internal Server Error");
}


})




