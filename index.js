const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const cliSpinners = require("cli-spinners");
const { nanoid } = require("nanoid"); // Import nanoid

const helpers = require("./src/helper"); // Import the helper functions

let inventory = [];
let cart = [];

// Load data from the JSON file
const loadData = () => {
  inventory = helpers.loadData();
};

// Save data to the JSON file
const saveData = () => {
  helpers.saveData(inventory);
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
    id: nanoid(4), // Generates a 4-digit ID
    name: answer.name,
    priceInCents: parseInt(answer.priceInCents),
    inStock: answer.inStock,
  };

  inventory.push(newItem);
  saveData();
  console.log(chalk.green("Item added to inventory."));
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
      helpers.viewItems(inventory);
      break;
    case "View item details":
      await helpers.viewItemDetails(inventory);
      break;
    case "Add a new item":
      await addItem();
      break;
    case "Update an item":
      await updateItem();
      break;
    case "View cart":
      helpers.viewCart(cart);
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
