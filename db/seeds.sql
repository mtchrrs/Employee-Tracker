USE company_db

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE employees;
TRUNCATE roles;
TRUNCATE departments;

INSERT INTO departments (name)
VALUE   ("Creative"),
        ("Engineering"),
        ("Finance"),
        ("Marketing"),
        ("Sales");

INSERT INTO roles (title, salary, department_id)
VALUE   ("Creative Director", 80000, 1),
        ("Creative Coordinator", 42000, 1),
        ("Senior Engineer", 200000, 2),
        ("Junior Engineer", 90000, 2),
        ("Finance Coordinator", 60000, 3), 
        ("Accountant", 90000, 3),
        ("Marketing Manager", 85000, 4),
        ("Marketing Executive", 50000, 4),
        ("Senior Salesman", 110000, 5),
        ("Junior Salesman", 60000, 5);

-- INSERT INTO employees (first_name, last_name, manager_id, role_id)
-- VALUE 