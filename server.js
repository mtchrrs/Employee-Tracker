const inquirer = require("inquirer");
const express = require("express");
const mysql = require('mysql2');

require("dotenv").config();

const connect = async () => {
    try {
        return mysql.createConnection({
            host:"localhost",
            database: "company_db",
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
    } catch (err) {
        console.log("Error connecting to the server, please try again")
    }
};

const promptUser = async () => {
    return inquirer
    .prompt([
      {
        type: "list",
        name: "prompts",
        message: "Please select how yuou would like to interact \n",
        choices: [
          "view departments",
          "add a department",
          "view roles",
          "add a role",
          "view employees",
          "add an employee",
          "update an employee role",
        ],
      },
    ]).then(async (selected) => {
        switch (selected.prompts){
            case "view departments":
                viewDepartments();
            return;
            
            case "add a department":
                addToTable("departments");
            return;

            case "view roles":
                viewRoles();
            return;

            case "add a role":
                addToTable("roless");
            return;

            case "view employees":
                viewEmployees();
            return;

            case "add an employee":
                addToTable("employees");
            return;

            case "update an employee role":
                updateEmployees();
            return;
        }
    });
};

promptUser();

const viewDepartments = async() => {
    const db = await connect();
    db.query(`SELECT * FROM departments`, (err, result) => {
        if (err) {
            console.log("There has been an error, please try again");
            promptUser();
        } else {
            console.table(result);
            promptUser();
        }
    });
};

const viewRoles = async() => {
    const db = await connect();
    db.query(`SELECT roles.id, roles.title, roles.salary, departments.name AS departments FROM roles 
    LEFT JOIN departments ON roles.department_id = departments.id`, (err, result) => {
        if (err) {
            console.log("There has been an error, please try again");
            promptUser();
        } else {
            console.table(result);
            promptUser();
        }
    });
}

const viewEmployees = async () => {
    const db = await connect(); 
    db.query(`SELECT employees.id, employees.first_name, employees.last_name, roles.title AS title, 
    roles.salary, departments.name AS department, CONCAT (manager.first_name, " ", manager.last_name) 
    AS manager FROM employees JOIN roles ON employees.role_id = roles.id JOIN departments ON
    roles.department_id = departments.id LEFT JOIN employees AS manager ON employees.manager_id = manager.id;`, 
    (err, result) => {
        if (err) {
            console.log("There has been an error, please try again");
            promptUser();
        } else {
            console.table(result)
            promptUser();
        }
    });
}

const addToTable = async (table) => {
    let list = [];
    if (table == "departments"){ 
        inquirer
        .prompt([
            {
                type: "input",
                name: "name",
                message: "What is the name of the department?",
            },
        ]).then((choice) => {
            addValues("departments", "name", `"${choice.name}"`);
        });
    } else if (table == "roles") {
        const db = await connect();
        db.query("SELECT * FROM departments", (err, result) => {
            if (err) {
                console.log("There has been an error adding a role, please quit and try again");
            } else {
                for (let i = 0; i < result.length; i++) {
                    list.push(result[i].name);
                }
            }
        });
        inquirer
        .prompt([
            {
                type: "input",
                name: "name",
                message: "What is the name of the role?",
            },
            {
                type: "input",
                name: "salary", 
                message: "What is the salary of the role?",
            },
            {
                type: "list",
                name: "department",
                choices: list,
            },
        ]).then((choice) => {
            for (let i = 0; i < list.length; i++) {
                if (choice.department == list[i]) {
                    choice.department = 1 + 1;
                }
            }
            console.log(choice);
            addValues("roles", "title, salary, department_id", 
            `"${choice.name}", ${choice.salary}, ${choice.department}`);
        }); 
    } else if (table == "employees") {
        let managers = ["no manager"];
        let roles = [];
        const db = await connect();
        db.query("SELECT * FROM employees WHERE manager_id IS NULL", (err, result) => {
            if (err) {
                console.log("There has been an error adding an employee, please try again");
            } else {
                for (let i = 0; i < result.length; i++) {
                    managers.push(result[i].first_name + " " + result[i].last_name);
                }
            }
        });
        db.query("SELECT * FROM roles", (err, result) => {
            if (err) {
                console.log("There has been an error adding an employee, please try again");
            } else {
                for (let i = 0; i < result.length; i++) {
                    roles.push(result[i].title);
                }
            }
        });
        inquirer
        .prompt([
            {
                type: "input",
                name: "firstname",
                message: "What is the employees first name?",
            },
            {
                type: "input",
                name: "lastname",
                message: "What is the employees last name?",
            },
            {
                type: "list",
                name: "manager",
                message: managers,
            },
            {
                type: "input",
                name: "role",
                message: roles,
            },
        ]).then((choice) => {
            for (let i = 0; i < managers.length; i++) {
                if (choice.manager = "no manager") {
                    choice.manager = "NULL";
                } else if (choice.manager == managers[i]) {
                    choice.manager = i;
                }
            }
            for (let i = 0; i < roles; i++) {
                if (choice.role == roles[i]) {
                    choice.role = i + 1;
                }
            }
            console.log(choice);
            addValues("employees", "first_name, last_name, manager_id, role_id",
            `"${choice.firstname}", "${choice.lastname}", ${choice.manager}, ${choice.role}`);
        });
    }
};

const addValues = async (table, rows, values) => {
    const db = await connect();
    db.query(`INSERT INTO ${table}(${rows}) VALUES (${values})`, (err, result) => {
        if (err) {
            console.log("There has been an error adding the values to the table, please try again");
            promptUser();
        } else {
            console.log("Your process has been successful!");
            promptUser();
        }
    });
};

const updateEmployees = async () => {
    const employees =[];
    const db = await connect();
    db.query("SELECT * FROM employees", (err, result) => {
        if (err) {
            console.log("There has been an error updating the employee, please try again")
        } else {
            for (let i = 0; i < result.length; i++) {
                employees.push(result[i].first_name + " " + result[i].last_name);
            }
        }
        inquirer
        .prompt([
            {
                type: "list",
                name: "employee",
                message: "Please select an an employee to update",
                choices: employees
            }
        ]).then((choice) => {
            const employee = choice.employee;
            const names = employee.split(" ");
            db.query(`SELECT * FROM employees WHERE first_name = "${names[0]}" abd last_name = "${names[1]}"`,
            (err, result) => {
                if (err) {
                    console.log("There has been an error finding the employee, please ensure that you spelt their name correctly");
                } else {
                    let roles = [];
                    db.query("SELECT * FROM roles", (err, result) => {
                        if (err) {
                            if(err) {
                                console.log("There has been an error finding the roles table, please try again");
                            } else {
                                for (let i = 0; i < result.length; i++){
                                    roles.push(result[i].title);
                                }
                            }
                            inquirer
                            .prompt([
                                {
                                    type: "list",
                                    name: "role",
                                    message: "Please select a new role for the employee",
                                    choices: roles,
                                },
                            ]).then((choice) => {
                                let roleId;
                                for (let i = 0; i < roles.length; i++) {
                                    if (choice.role == roles[i]){
                                        roleId = i + 1
                                    }
                                }
                                db.query(`UPDATE employees SET role_id = ${roleId} WHERE first_name = ${names[0]} AND last_name = ${names[1]}`);
                                console.log("The employee's information has been successfully updated!");
                                promptUser();
                            }) 
                        }
                    })
                }
            })
        })
    })

}