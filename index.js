/* basic functionality for viewing all items, adding a new item, and initializing the application */
const fs = require("fs");
const inquirer = require("inquirer");
const { nanoid } = require("nanoid");
const chalk = require("chalk");
const path = require("path");
const figlet = require("figlet");

const DATA_FILE = path.join(__dirname, "data", "sample-data.json");

let inventory = [];

// loads data from the JSON file
const loadData = () => {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE);
    inventory = JSON.parse(data);
  } else {
    inventory = [];
  }
};

// saves data to the JSON file
const saveData = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(inventory, null, 2));
};

// view all items
const viewItems = () => {
  console.log(chalk.green("Inventory List:"));
  inventory.forEach((item) => {
    console.log(
      `${item.id}: ${item.name} - ${item.priceInCents} cents - In Stock: ${item.inStock}`
    );
  });
};

//view details of one item
const viewItemDetails = async () => {
  const answer = await inquirer.prompt([
    { name: "id", message: "Enter the ID of the item you want to view:" },
  ]);

  console.log("Entered ID:", answer.id);

  const item = inventory.find((item) => {
    console.log("Item ID in inventory:", item.id);
    return item.id === answer.id.trim();
  });

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

// adds a new item
const addItem = async () => {
  const answer = await inquirer.prompt([
    { name: "name", message: "Item name:" },
    { name: "princeInCent", validate: (value) => !isNaN(value) },
    { name: "inStock", type: "convirm", message: "Is it in stock?" },
  ]);

  const newItem = {
    id: nanoid(),
    name: answer.name,
    priceInCents: parseInt(answer.priceInCent),
    inStock: answer.inStock,
  };

  inventory.push(newItem);
  saveData();
  console.log(chalk.green("Item added successfully!"));
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
    case "Exit":
      console.log(chalk.blue(figlet.textSync("Goodbye!")));
      process.exit();
  }

  //go back to the main menu
  mainMenu();
};

// intialize the application
const init = () => {
  console.log(chalk.yellow(figlet.textSync("Inventory App")));
  loadData();
  mainMenu();
};

//start application
init();
