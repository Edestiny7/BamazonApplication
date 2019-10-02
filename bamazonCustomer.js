let mysql = require("mysql");
let inquirer = require("inquirer");
let table = require("cli-table");

let PORT = process.env.PORT || 3306;

// connection info for sql database
const connection = mysql.createConnection({
    host: "localhost",
    port: PORT,
    user: "root",
    password: "root",
    database: "bamazon"
});

// connection to mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    console.log(`Connected as ID: ${connection.threadId}`);
});

// Display inventory
function inventory() {
    connection.query("SELECT item_id, product_name, price FROM products", function(err, res) {
        if (err) {
            console.log(err)
        };

        let display = new table({
            head: ["ID", "Product", "Price"],
            colWidths: [5, 75, 10]
        });
        for (var i = 0; i < res.length; i++) {
            display.push(
                [res[i].item_id, res[i].product_name, res[i].price]
            );
        }
        console.log(display.toString());

        // Prompt user  
        inquire();
    });
}

// Prompt user for selection
let inquire = function() {
    inquirer
        .prompt([{
                name: `ProductID`,
                type: `input`,
                message: `Please enter ID of item you would like to purchase: `,
            },
            {
                name: `Quantity`,
                type: `input`,
                message: `Quantity? `,
            }
        ]).then(function(answer) {
            let purchaseID = answer.ProductID;
            let purchaseQty = answer.Quantity;
            purchase(purchaseID, purchaseQty);
        });
}

// Process request
function purchase(id, qty) {
    connection.query("SELECT * FROM products WHERE item_id =" + id, function(err, res) {
        if (err) {
            console.log(err)
        };
        if (qty <= res[0].stock_quantity) {
            let total = res[0].price * qty;
            console.log(`Total for ${qty} - ${res[0].product_name} is ${total}. 
Thank you for shopping with Bamazon!`);
            connection.query("UPDATE products SET stock_quantity = (stock_quantity - " + qty + ") WHERE item_id =" + id);
        } else {
            console.log(`Unfortunately, stock of ${res[0].product_name} is insufficient to fulfill your order at this time. Please try again later.`);
        };
        inventory();
    });
};

inventory();