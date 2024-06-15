// src/helper.js
const fs = require("fs");
const inquirer = require("inquirer");
const { nanoid } = require("nanoid");
const chalk = require("chalk");
const path = require("path");
const CliTable = require("cli-table");

const DATA_FILE = path.join(__dirname, "../data", "sample-data.json");

// Load data from the JSON file
const loadData = () => {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE);
      return JSON.parse(data);
    } catch (error) {
      console.error(chalk.red("Error loading data from file:", error.message));
      return [];
    }
  } else {
    return [];
  }
};

// Save data to the JSON file
const saveData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(chalk.green("Data saved successfully."));
  } catch (error) {
    console.error(chalk.red("Error saving data to file:", error.message));
  }
};

// View all items in a table format
const viewItems = (inventory) => {
  const table = new CliTable({
    head: ["ID", "Name", "Price", "In Stock"],
    colWidths: [30, 30, 15, 10],
  });

  inventory.forEach((item) => {
    table.push([
      item.id || "",
      item.name || "",
      item.priceInCents != null ? item.priceInCents / 100 : "",
      item.inStock ? "Yes" : "No",
    ]);
  });

  console.log(chalk.green("Inventory List:"));
  console.log(table.toString());
};

// View details of one item
const viewItemDetails = async (inventory) => {
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

// View cart
const viewCart = (cart) => {
  if (cart.length === 0) {
    console.log(chalk.yellow("Your shopping cart is empty."));
  } else {
    console.log(chalk.green("Shopping Cart:"));
    const table = new CliTable({
      head: ["ID", "Name", "Price", "Quantity"],
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

module.exports = {
  loadData,
  saveData,
  viewItems,
  viewItemDetails,
  viewCart,
};
