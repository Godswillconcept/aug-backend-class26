# Raw SQL Queries vs Sequelize ORM

Audience: Node.js backend students learning MySQL, Express, and Sequelize.

Repository context: this project already uses `mysql2`, `sequelize`, and `sequelize-cli`, and has a starter SQL file in `blog_db.sql`.

## Learning Objectives

By the end of this class, students should be able to:

- Explain the difference between writing raw SQL and using Sequelize ORM.
- Define columns, data types, primary keys, unique keys, nullable fields, defaults, timestamps, and foreign keys in both styles.
- Compare how references and constraints protect data integrity.
- Write CRUD operations using raw SQL and Sequelize.
- Decide when raw SQL is better and when Sequelize is better.
- Build and test a simple `users`, `categories`, and `posts` schema.

## Quick Summary

Raw SQL means you write the exact query sent to the database:

```sql
SELECT id, fname, lname, email FROM users WHERE email = ?;
```

Sequelize ORM means you work mostly with JavaScript models and methods:

```js
const user = await User.findOne({
  where: { email },
  attributes: ["id", "fname", "lname", "email"],
});
```

An ORM does not remove the need to understand SQL. It gives you a JavaScript abstraction over SQL. Good backend developers should understand both.

## Comparison Table

| Area              | Raw SQL                                            | Sequelize ORM                                                     |
| ----------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| Schema definition | `CREATE TABLE ...` statements                      | Model files and migrations                                        |
| Query style       | SQL strings                                        | JavaScript methods like `findAll`, `create`, `update`             |
| Control           | Maximum control over exact SQL                     | Less direct control, but faster common CRUD                       |
| Learning value    | Helps students understand database behavior deeply | Helps students build apps faster once DB basics are known         |
| Safety            | Safe only when parameterized correctly             | Safer defaults, but still requires validation and constraints     |
| Complex joins     | Often clearer and more direct                      | Can become verbose with associations and includes                 |
| Simple CRUD       | More repetitive                                    | Cleaner and faster to write                                       |
| Portability       | Usually tied to one SQL dialect                    | Some abstraction across MySQL, PostgreSQL, SQLite, etc.           |
| Debugging         | You inspect the query you wrote                    | You may need logging to see generated SQL                         |
| Constraints       | Written directly in SQL                            | Written in migrations/models, enforced by the DB only if migrated |

## Important Principle

Application validation and database constraints are not the same thing.

Example:

- Express validation says: "Do not accept an empty email from the request."
- Sequelize validation says: "This model instance is invalid before saving."
- MySQL constraint says: "This table can never store a duplicate or null email."

The database constraint is the final protection. Never rely only on frontend or controller validation for important rules.

## Current SQL Example in This Repo

`blog_db.sql` currently describes a `users` table conceptually like this:

```sql
CREATE DATABASE blog_db;

CREATE TABLE users (
    id INT(11) PRIMARY KEY AUTO_INCREMENT,
    fname VARCHAR(255) NOT NULL,
    lname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Teaching note: the correct MySQL syntax is `CREATE TABLE IF NOT EXISTS users`, not `CREATE TABLE users if not exists`.

## Columns: Raw SQL vs Sequelize

### Raw SQL Column Definition

```sql
CREATE TABLE users (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Sequelize Model Definition

```js
// models/user.js
"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      fname: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lname: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
      },
    },
    {
      tableName: "users",
      underscored: true,
    },
  );

  return User;
};
```

### Sequelize Migration Definition

```js
// migrations/XXXXXXXXXXXXXX-create-users.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      fname: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      lname: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      username: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
```

## Column Mapping

| Database Concept | Raw SQL                   | Sequelize Model/Migration    |
| ---------------- | ------------------------- | ---------------------------- |
| Integer          | `INT`                     | `DataTypes.INTEGER`          |
| Unsigned integer | `INT UNSIGNED`            | `DataTypes.INTEGER.UNSIGNED` |
| String           | `VARCHAR(255)`            | `DataTypes.STRING(255)`      |
| Text             | `TEXT`                    | `DataTypes.TEXT`             |
| Boolean          | `BOOLEAN` or `TINYINT(1)` | `DataTypes.BOOLEAN`          |
| Date/time        | `DATETIME`                | `DataTypes.DATE`             |
| Not nullable     | `NOT NULL`                | `allowNull: false`           |
| Default          | `DEFAULT 'value'`         | `defaultValue: 'value'`      |
| Auto increment   | `AUTO_INCREMENT`          | `autoIncrement: true`        |
| Primary key      | `PRIMARY KEY`             | `primaryKey: true`           |
| Unique           | `UNIQUE`                  | `unique: true`               |
| Column alias     | `is_active`               | `field: 'is_active'`         |

## Constraints

Constraints are database rules. They protect your table from invalid data.

### Primary Key

Raw SQL:

```sql
id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT
```

Sequelize:

```js
id: {
  type: DataTypes.INTEGER.UNSIGNED,
  primaryKey: true,
  autoIncrement: true,
}
```

Meaning: every row has a unique identity.

### Not Null

Raw SQL:

```sql
email VARCHAR(255) NOT NULL
```

Sequelize:

```js
email: {
  type: DataTypes.STRING(255),
  allowNull: false,
}
```

Meaning: the column must have a value.

### Unique

Raw SQL:

```sql
email VARCHAR(255) NOT NULL UNIQUE
```

Sequelize:

```js
email: {
  type: DataTypes.STRING(255),
  allowNull: false,
  unique: true,
}
```

Meaning: no two users can have the same email.

### Default

Raw SQL:

```sql
status VARCHAR(20) NOT NULL DEFAULT 'draft'
```

Sequelize:

```js
status: {
  type: DataTypes.STRING(20),
  allowNull: false,
  defaultValue: 'draft',
}
```

Meaning: if no value is provided, the database or ORM uses the default.

### Check

Raw SQL:

```sql
CONSTRAINT posts_status_check CHECK (status IN ('draft', 'published', 'archived'))
```

Sequelize migration:

```js
await queryInterface.addConstraint("posts", {
  fields: ["status"],
  type: "check",
  name: "posts_status_check",
  where: {
    status: ["draft", "published", "archived"],
  },
});
```

Meaning: the value must match an allowed rule. In MySQL, `CHECK` is enforced in modern MySQL versions, but students should confirm their local server version.

## References and Foreign Keys

A reference connects one table to another. A foreign key is the database constraint that enforces that connection.

Example relationship:

- One user can write many posts.
- One category can have many posts.
- Each post belongs to one user and one category.

## Raw SQL Schema With References

```sql
CREATE TABLE categories (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    user_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT posts_user_id_fk
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,

    CONSTRAINT posts_category_id_fk
      FOREIGN KEY (category_id)
      REFERENCES categories(id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,

    CONSTRAINT posts_status_check
      CHECK (status IN ('draft', 'published', 'archived'))
);
```

## Sequelize Models With Associations

```js
// models/category.js
"use strict";

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "categories",
      underscored: true,
    },
  );

  Category.associate = (models) => {
    Category.hasMany(models.Post, {
      foreignKey: "categoryId",
      as: "posts",
    });
  };

  return Category;
};
```

```js
// models/post.js
"use strict";

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(180),
        allowNull: false,
        unique: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "draft",
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "user_id",
      },
      categoryId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "category_id",
      },
    },
    {
      tableName: "posts",
      underscored: true,
    },
  );

  Post.associate = (models) => {
    Post.belongsTo(models.User, {
      foreignKey: "userId",
      as: "author",
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    Post.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "category",
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  };

  return Post;
};
```

## Sequelize Migration With Foreign Keys

```js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("posts", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(180),
        allowNull: false,
        unique: true,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "draft",
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      category_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addConstraint("posts", {
      fields: ["status"],
      type: "check",
      name: "posts_status_check",
      where: {
        status: ["draft", "published", "archived"],
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("posts");
  },
};
```

## References Mapping

| Relationship Concept     | Raw SQL                                      | Sequelize                                   |
| ------------------------ | -------------------------------------------- | ------------------------------------------- |
| Child column             | `user_id INT UNSIGNED NOT NULL`              | `userId: { field: 'user_id' }`              |
| Foreign key              | `FOREIGN KEY (user_id) REFERENCES users(id)` | `references: { model: 'users', key: 'id' }` |
| Parent has many children | Implied by FK and joins                      | `User.hasMany(Post)`                        |
| Child belongs to parent  | Implied by FK and joins                      | `Post.belongsTo(User)`                      |
| Join data                | `JOIN users ON posts.user_id = users.id`     | `include: [{ model: User, as: 'author' }]`  |
| Delete behavior          | `ON DELETE RESTRICT`                         | `onDelete: 'RESTRICT'`                      |
| Update behavior          | `ON UPDATE CASCADE`                          | `onUpdate: 'CASCADE'`                       |

## CRUD Comparison

### Create

Raw SQL:

```js
const sql = `
  INSERT INTO users (fname, lname, email, username, password)
  VALUES (?, ?, ?, ?, ?)
`;

const [result] = await connection.execute(sql, [
  "Ada",
  "Lovelace",
  "ada@example.com",
  "ada",
  hashedPassword,
]);
```

Sequelize:

```js
const user = await User.create({
  fname: "Ada",
  lname: "Lovelace",
  email: "ada@example.com",
  username: "ada",
  password: hashedPassword,
});
```

### Read One

Raw SQL:

```js
const [rows] = await connection.execute(
  "SELECT id, fname, lname, email, username FROM users WHERE id = ?",
  [id],
);

const user = rows[0] || null;
```

Sequelize:

```js
const user = await User.findByPk(id, {
  attributes: ["id", "fname", "lname", "email", "username"],
});
```

### Read With Join

Raw SQL:

```js
const [rows] = await connection.execute(
  `
  SELECT
    posts.id,
    posts.title,
    posts.slug,
    users.username AS author_username,
    categories.name AS category_name
  FROM posts
  INNER JOIN users ON users.id = posts.user_id
  INNER JOIN categories ON categories.id = posts.category_id
  WHERE posts.status = ?
  ORDER BY posts.created_at DESC
  `,
  ["published"],
);
```

Sequelize:

```js
const posts = await Post.findAll({
  where: { status: "published" },
  attributes: ["id", "title", "slug"],
  include: [
    {
      model: User,
      as: "author",
      attributes: ["username"],
    },
    {
      model: Category,
      as: "category",
      attributes: ["name"],
    },
  ],
  order: [["createdAt", "DESC"]],
});
```

### Update

Raw SQL:

```js
const [result] = await connection.execute(
  "UPDATE users SET fname = ?, lname = ? WHERE id = ?",
  ["Ada", "Byron", id],
);
```

Sequelize:

```js
const [affectedRows] = await User.update(
  { fname: "Ada", lname: "Byron" },
  { where: { id } },
);
```

### Delete

Raw SQL:

```js
const [result] = await connection.execute("DELETE FROM users WHERE id = ?", [
  id,
]);
```

Sequelize:

```js
const deletedRows = await User.destroy({
  where: { id },
});
```

## Raw SQL Inside Sequelize

Sequelize still allows raw queries:

```js
const { QueryTypes } = require("sequelize");
const { sequelize } = require("../models");

const users = await sequelize.query(
  "SELECT id, fname, lname, email FROM users WHERE email = :email",
  {
    replacements: { email },
    type: QueryTypes.SELECT,
  },
);
```

Use raw queries inside Sequelize when:

- The query is easier to write in SQL.
- You need a complex report query.
- You need database-specific features.
- You want to optimize a specific performance problem.

Avoid building raw SQL by string concatenation:

```js
// Unsafe
const sql = `SELECT * FROM users WHERE email = '${email}'`;
```

Use placeholders, replacements, or bind parameters:

```js
// Safer
const sql = "SELECT * FROM users WHERE email = ?";
const [rows] = await connection.execute(sql, [email]);
```

## Security Comparison

| Risk                           | Raw SQL                                   | Sequelize                                                              |
| ------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------- |
| SQL injection                  | High risk if string concatenation is used | Lower risk when using `where`, `create`, `update`, or replacements     |
| Missing validation             | Still possible                            | Still possible                                                         |
| Over-fetching sensitive fields | Easy to accidentally use `SELECT *`       | Easy to forget `attributes`                                            |
| Password leakage               | Avoid selecting password                  | Exclude password in model scopes or query attributes                   |
| Constraint bypass              | Impossible if DB constraints exist        | Possible if rules only exist as model validation and DB schema is weak |

## Performance Comparison

Raw SQL can be better when:

- You need complete control over joins, indexes, grouping, and query plans.
- You are writing reports or dashboards.
- You need `EXPLAIN`-driven tuning.
- The ORM generates inefficient SQL.

Sequelize can be better when:

- The operation is simple CRUD.
- You need consistent model methods.
- You want associations, hooks, scopes, and migrations.
- You want readable application code for common operations.

Best practice: use Sequelize for common application behavior, and raw SQL for special queries that are clearer or faster in SQL.

## Classroom Teaching Flow

### Part 1: Start With the Table

Ask students:

- What is a table?
- What is a row?
- What is a column?
- Why should `email` be unique?
- Why should `password` be `NOT NULL`?
- Why do we need `created_at` and `updated_at`?

Then show the raw SQL `users` table.

### Part 2: Translate the Table to a Model

Show students that this:

```sql
email VARCHAR(255) NOT NULL UNIQUE
```

becomes this:

```js
email: {
  type: DataTypes.STRING(255),
  allowNull: false,
  unique: true,
}
```

### Part 3: Add Relationships

Use a blog example:

- `users` write `posts`
- `categories` group `posts`
- `posts.user_id` references `users.id`
- `posts.category_id` references `categories.id`

### Part 4: Query the Same Data Two Ways

First with SQL:

```sql
SELECT posts.title, users.username
FROM posts
INNER JOIN users ON users.id = posts.user_id;
```

Then with Sequelize:

```js
const posts = await Post.findAll({
  include: [{ model: User, as: "author", attributes: ["username"] }],
});
```

### Part 5: Discuss Tradeoffs

Ask:

- Which version is easier to read?
- Which version gives more control?
- Which one helps you understand the database better?
- Which one is faster to write for normal CRUD?
- Which one would you use for a complex report?

## Practice

### Task 1: Fix the Raw SQL Users Table

Write a corrected `CREATE TABLE IF NOT EXISTS users` statement with:

- `id`
- `fname`
- `lname`
- `email`
- `username`
- `password`
- `created_at`
- `updated_at`

Rules:

- `id` should be primary key and auto-increment.
- `email` should be unique.
- `username` should be unique.
- Required fields should not allow `NULL`.

### Task 2: Create a Categories Table

Write the raw SQL for a `categories` table with:

- `id`
- `name`
- `created_at`
- `updated_at`

Rules:

- `name` should be required and unique.

### Task 3: Create a Posts Table

Write the raw SQL for a `posts` table with:

- `id`
- `title`
- `slug`
- `content`
- `status`
- `user_id`
- `category_id`
- `created_at`
- `updated_at`

Rules:

- `slug` should be unique.
- `status` should default to `draft`.
- `user_id` should reference `users(id)`.
- `category_id` should reference `categories(id)`.

### Task 4: Translate to Sequelize

Create Sequelize models for:

- `User`
- `Category`
- `Post`

Add associations:

- `User.hasMany(Post)`
- `Post.belongsTo(User)`
- `Category.hasMany(Post)`
- `Post.belongsTo(Category)`

### Task 5: Query Practice

Write both raw SQL and Sequelize versions for:

- Create a user.
- Find a user by email.
- Create a category.
- Create a post.
- Fetch all published posts with author username and category name.
- Update a post status from `draft` to `published`.
- Delete a category only if it has no posts.

## Worked Solution

### Solution 1: Raw SQL Schema

```sql
CREATE DATABASE IF NOT EXISTS blog_db;
USE blog_db;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    user_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT posts_user_id_fk
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,

    CONSTRAINT posts_category_id_fk
      FOREIGN KEY (category_id)
      REFERENCES categories(id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,

    CONSTRAINT posts_status_check
      CHECK (status IN ('draft', 'published', 'archived'))
);
```

### Solution 2: Raw SQL Queries

```js
// Create user
await connection.execute(
  `
  INSERT INTO users (fname, lname, email, username, password)
  VALUES (?, ?, ?, ?, ?)
  `,
  ["Ada", "Lovelace", "ada@example.com", "ada", hashedPassword],
);

// Find user by email
const [users] = await connection.execute(
  `
  SELECT id, fname, lname, email, username
  FROM users
  WHERE email = ?
  `,
  ["ada@example.com"],
);

// Create category
await connection.execute("INSERT INTO categories (name) VALUES (?)", [
  "Backend",
]);

// Create post
await connection.execute(
  `
  INSERT INTO posts (title, slug, content, user_id, category_id)
  VALUES (?, ?, ?, ?, ?)
  `,
  ["Learning Sequelize", "learning-sequelize", "Content here", 1, 1],
);

// Fetch published posts with author and category
const [posts] = await connection.execute(
  `
  SELECT
    posts.id,
    posts.title,
    posts.slug,
    users.username AS author_username,
    categories.name AS category_name
  FROM posts
  INNER JOIN users ON users.id = posts.user_id
  INNER JOIN categories ON categories.id = posts.category_id
  WHERE posts.status = ?
  ORDER BY posts.created_at DESC
  `,
  ["published"],
);

// Publish post
await connection.execute("UPDATE posts SET status = ? WHERE id = ?", [
  "published",
  1,
]);

// Delete category if it has no posts
await connection.execute("DELETE FROM categories WHERE id = ?", [1]);
```

### Solution 3: Sequelize Queries

```js
// Create user
const user = await User.create({
  fname: "Ada",
  lname: "Lovelace",
  email: "ada@example.com",
  username: "ada",
  password: hashedPassword,
});

// Find user by email
const foundUser = await User.findOne({
  where: { email: "ada@example.com" },
  attributes: ["id", "fname", "lname", "email", "username"],
});

// Create category
const category = await Category.create({
  name: "Backend",
});

// Create post
const post = await Post.create({
  title: "Learning Sequelize",
  slug: "learning-sequelize",
  content: "Content here",
  userId: user.id,
  categoryId: category.id,
});

// Fetch published posts with author and category
const publishedPosts = await Post.findAll({
  where: { status: "published" },
  attributes: ["id", "title", "slug", "status"],
  include: [
    {
      model: User,
      as: "author",
      attributes: ["username"],
    },
    {
      model: Category,
      as: "category",
      attributes: ["name"],
    },
  ],
  order: [["createdAt", "DESC"]],
});

// Publish post
await Post.update({ status: "published" }, { where: { id: post.id } });

// Delete category if it has no posts
await Category.destroy({
  where: { id: category.id },
});
```

Note: the delete will fail if the database has `ON DELETE RESTRICT` and posts still reference that category. That is good. It proves the foreign key is protecting the data.

## Common Student Mistakes

- Writing `CREATE TABLE users if not exists` instead of `CREATE TABLE IF NOT EXISTS users`.
- Using `SELECT *` and accidentally returning passwords.
- Concatenating user input into SQL strings.
- Defining associations in Sequelize but forgetting the database foreign key in the migration.
- Defining `allowNull: false` in the model but forgetting `allowNull: false` in the migration.
- Assuming `hasMany` creates a database constraint by itself.
- Forgetting to use the same column type for foreign key and referenced primary key.
- Using `CASCADE` deletes without understanding the consequences.
- Treating Sequelize validation as a replacement for database constraints.

## Recommended Rule for Students

Use this order when designing backend data:

1. Draw the entities and relationships.
2. Write the raw SQL table design first.
3. Identify primary keys, unique keys, foreign keys, and nullability.
4. Translate the design to Sequelize migrations.
5. Translate the design to Sequelize models.
6. Write queries.
7. Test constraint failures intentionally.

## Mini Assessment

Ask students to answer:

1. What is the difference between a primary key and a foreign key?
2. What does `allowNull: false` become in raw SQL?
3. What does `unique: true` prevent?
4. Does `User.hasMany(Post)` automatically protect the database from invalid `user_id` values?
5. Why should passwords not appear in `SELECT *` responses?
6. When would you prefer raw SQL over Sequelize?
7. When would you prefer Sequelize over raw SQL?

## Video References for Class

Use these as optional reinforcement after the live class:

- MySQL Constraints Explained: Primary Key, Foreign Key, Unique, Not Null, Check, Default  
  https://www.youtube.com/watch?v=NC8aPK8zYtQ
- Raw Queries with Sequelize  
  https://www.youtube.com/watch?v=Cj3FsRVswak
- Search suggestion for a full Sequelize playlist:  
  https://www.youtube.com/results?search_query=node+js+sequelize+mysql+tutorial+associations+migrations

## Documentation References

- Sequelize v6 Raw Queries: https://sequelize.org/docs/v6/core-concepts/raw-queries/
- Sequelize v6 Model Basics: https://sequelize.org/docs/v6/core-concepts/model-basics/
- Sequelize v6 Associations: https://sequelize.org/docs/v6/core-concepts/assocs/
- DigitalOcean Sequelize with Node.js and MySQL tutorial: https://www.digitalocean.com/community/tutorials/how-to-use-sequelize-with-node-js-and-mysql
- MySQL `CREATE TABLE` reference: https://dev.mysql.com/doc/refman/8.4/en/create-table.html
- MySQL Foreign Key Constraints: https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html

## Instructor Closing Note

Raw SQL teaches students what the database actually does. Sequelize teaches students how to build Node.js applications faster with models, associations, and migrations. The best backend engineers are comfortable with both and know when to switch between them.
