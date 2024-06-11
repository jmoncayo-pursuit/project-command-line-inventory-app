const fs = require("fs");
const inquirer = require("inquirer");
const { nanoid } = require("nanoid");
const chalk = require("chalk");
const path = require("path");
const figlet = require("figlet");

const DATA_FILE = path.join(__dirname, "data", "sample-data.json");

let inventory = [];
let cart = [];

// Load data from the JSON file
const loadData = () => {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE);
    inventory = JSON.parse(data);
  } else {
    inventory = [];
  }
};

// Save data to the JSON file
const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(inventory, null, 2));
    console.log(chalk.green("Data saved successfully."));
  } catch (error) {
    console.error(chalk.red("Error saving data to file:", error.message));
  }
};

// View all items
const viewItems = () => {
  console.log(chalk.green("Inventory List:"));
  inventory.forEach((item) => {
    console.log(
      `${item.id}: ${item.name} - ${item.priceInCents} cents - In Stock: ${item.inStock}`
    );
  });
};

// View details of one item
const viewItemDetails = async () => {
  const answer = await inquirer.prompt([
    { name: "id", message: "Enter the ID of the item you want to view:" },
  ]);

  const item = inventory.find((item) => item.id === answer.id.trim());
  if (item) {
    console.log(chalk.yellow("Item Details:"));
    console.log(`ID: ${item.id}`);
    console.log(`Name: ${item.name}`);
    console.log(`Price: ${item.priceInCents} cents`);
    console.log(`In Stock: ${item.inStock}`);
  } else {
    console.log(chalk.red("Item not found!"));
  }
};

// Add a new item
const addItem = async () => {
  const answer = await inquirer.prompt([
    { name: "name", message: "Item name:" },
    {
      name: "priceInCents",
      validate: (value) => !isNaN(value),
      message: "Enter the price in cents:",
    },
    { name: "inStock", type: "confirm", message: "Is it in stock?" },
  ]);

  const newItem = {
    id: nanoid(),
    name: answer.name,
    priceInCents: parseInt(answer.priceInCents),
    inStock: answer.inStock,
  };

  inventory.push(newItem);
  saveData();
  console.log(chalk.green("Item added successfully!"));
};

// Update an existing item
const updateItem = async () => {
  const answer = await inquirer.prompt([
    { name: "id", message: "Enter the ID of the item you want to update:" },
    { name: "priceInCents", message: "Enter the new price in cents:" },
    { name: "inStock", type: "confirm", message: "Is it in stock?" },
  ]);

  const index = inventory.findIndex((item) => item.id === answer.id.trim());
  if (index !== -1) {
    inventory[index].priceInCents = parseInt(answer.priceInCents);
    inventory[index].inStock = answer.inStock;
    saveData();
    console.log(chalk.green("Item updated successfully!"));
  } else {
    console.log(chalk.red("Item not found!"));
  }
};

// Add item to cart
const addToCart = async () => {
  const answer = await inquirer.prompt([
    {
      name: "id",
      message: "Enter the ID of the item you want to add to cart:",
    },
  ]);

  const item = inventory.find((item) => item.id === answer.id.trim());
  if (item) {
    cart.push(item);
    console.log(chalk.green("Item added to cart!"));
  } else {
    console.log(chalk.red("Item not found!"));
  }
};

// View cart
const viewCart = () => {
  if (cart.length === 0) {
    console.log(chalk.yellow("Your shopping cart is empty."));
  } else {
    console.log(chalk.green("Shopping Cart:"));
    cart.forEach((item) => {
      console.log(`${item.id}: ${item.name} - ${item.priceInCents} cents`);
    });
  }
};

// Cancel cart
const cancelCart = () => {
  cart = [];
  console.log(chalk.yellow("Shopping cart cleared!"));
};

// Main menu
const mainMenu = async () => {
  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "View all items",
        "View item details",
        "Add a new item",
        "Update an item",
        "Add item to cart",
        "View cart",
        "Cancel cart",
        "Exit",
      ],
    },
  ]);

  switch (answer.action) {
    case "View all items":
      viewItems();
      break;
    case "View item details":
      await viewItemDetails();
      break;
    case "Add a new item":
      await addItem();
      break;
    case "Update an item":
      await updateItem();
      break;
    case "Add item to cart":
      await addToCart();
      break;
    case "View cart":
      viewCart();
      break;
    case "Cancel cart":
      cancelCart();
      break;
    case "Exit":
      console.log(chalk.blue(figlet.textSync("Goodbye!")));
      process.exit();
  }

  // Go back to the main menu
  mainMenu();
};

// Initialize the application
const init = () => {
  console.log(chalk.yellow(figlet.textSync("Inventory App")));
  loadData();
  mainMenu();
};

// Start application
init();
