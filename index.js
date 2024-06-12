const fs = require("fs");
const inquirer = require("inquirer");
const { nanoid } = require("nanoid");
const chalk = require("chalk");
const path = require("path");
const figlet = require("figlet");
const CliTable = require("cli-table");
const cliSpinners = require("cli-spinners");

const DATA_FILE = path.join(__dirname, "data", "sample-data.json");
let inventory = [];
let cart = [];

// Load data from the JSON file
const loadData = () => {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE);
      inventory = JSON.parse(data);
    } catch (error) {
      console.error(chalk.red("Error loading data from file:", error.message));
      inventory = [];
    }
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

// View all items in a table format
const viewItems = () => {
  const table = new CliTable({
    head: ["ID", "Name", "Price (cents)", "In Stock"],
    colWidths: [30, 30, 15, 10],
  });

  inventory.forEach((item) => {
    table.push([
      item.id || "",
      item.name || "",
      item.priceInCents != null ? item.priceInCents : "",
      item.inStock ? "Yes" : "No",
    ]);
  });

  console.log(chalk.green("Inventory List:"));
  console.log(table.toString());
};

// View details of one item
const viewItemDetails = async () => {
  const answer = await inquirer.prompt([
    { name: "id", message: "Enter the ID of the item you want to view:" },
  ]);

  const item = inventory.find((item) => item.id === answer.id);
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
      message: "Price (in cents):",
      validate: (value) => !isNaN(value),
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

// Update an item
const updateItem = async () => {
  const answer = await inquirer.prompt([
    { name: "id", message: "Enter the ID of the item you want to update:" },
  ]);

  const item = inventory.find((item) => item.id === answer.id);
  if (item) {
    const updateAnswer = await inquirer.prompt([
      {
        name: "name",
        message: `Enter new name (current: ${item.name}):`,
        default: item.name,
      },
      {
        name: "priceInCents",
        message: `Enter new price (current: ${item.priceInCents}):`,
        default: item.priceInCents,
        validate: (value) => !isNaN(value),
      },
      {
        name: "inStock",
        type: "confirm",
        message: "Is it in stock?",
        default: item.inStock,
      },
    ]);

    item.name = updateAnswer.name;
    item.priceInCents = parseInt(updateAnswer.priceInCents);
    item.inStock = updateAnswer.inStock;

    saveData();
    console.log(chalk.green("Item updated successfully!"));
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
    const table = new CliTable({
      head: ["ID", "Name", "Price (cents)", "Quantity"],
      colWidths: [30, 30, 15, 10],
    });

    cart.forEach((item) => {
      table.push([
        item.id || "",
        item.name || "",
        item.priceInCents != null ? item.priceInCents : "",
        item.quantity || "",
      ]);
    });

    const total = cart.reduce(
      (sum, item) => sum + item.priceInCents * item.quantity,
      0
    );
    table.push([], ["Total", "", total, ""]);

    console.log(table.toString());
  }
};

// Add item to cart
const addToCart = async () => {
  const answer = await inquirer.prompt([
    {
      name: "id",
      message: "Enter the ID of the item you want to add to the cart:",
    },
    {
      name: "quantity",
      message: "Enter the quantity:",
      validate: (value) => !isNaN(value),
    },
  ]);

  const item = inventory.find((item) => item.id === answer.id);
  if (item) {
    const cartItem = cart.find((cartItem) => cartItem.id === item.id);
    if (cartItem) {
      cartItem.quantity += parseInt(answer.quantity);
    } else {
      cart.push({ ...item, quantity: parseInt(answer.quantity) });
    }
    console.log(chalk.green("Item added to cart!"));
  } else {
    console.log(chalk.red("Item not found!"));
  }
};

// Cancel cart
const cancelCart = () => {
  cart = [];
  console.log(chalk.yellow("Shopping cart has been emptied."));
};

// Main menu
const mainMenu = async () => {
  const spinner = cliSpinners.dots;
  console.log(chalk.yellow(figlet.textSync("Inventory App")));

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
        "View cart",
        "Add to cart",
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
    case "View cart":
      viewCart();
      break;
    case "Add to cart":
      await addToCart();
      break;
    case "Cancel cart":
      cancelCart();
      break;
    case "Exit":
      console.log(chalk.blue(figlet.textSync("Goodbye!")));
      process.exit();
  }

  mainMenu();
};

// Initialize the application
const init = () => {
  loadData();
  mainMenu();
};

init();
