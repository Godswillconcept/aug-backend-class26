/** Endpoints mounted at /api/users  (routes/user.route.js) */
const { mkItem } = require("../builder");

module.exports = [
  mkItem({
    name: "Get All Users",
    method: "GET",
    path: "/api/users",
    auth: "noauth",
    desc:
      "**Public (no middleware).** Returns a paginated list of users.\n\n" +
      "**Query params**\n" +
      "| Param | Type | Default | Notes |\n" +
      "|---|---|---|---|\n" +
      "| page | number | 1 | 1-based page number |\n" +
      "| limit | number | 20 | page size |\n\n" +
      "**Response notes**\n" +
      "- `password`, `created_at` and `updated_at` are excluded from `data`.\n" +
      "- The pagination object uses the keys `total`, `page`, `per_page`, `total_page` " +
      "(note: different from the other resources, which use `totalItems`/`currentPage`/etc.).\n" +
      "- `total_page` is computed with `Math.ceil(count / limit)` where `limit` is still the " +
      "**string** from the query, so a non-numeric `limit` yields `NaN`.",
    query: [
      { key: "page", value: "1", description: "1-based page number" },
      { key: "limit", value: "20", description: "Page size (default 20)" },
    ],
    responses: [
      {
        name: "200 - Users fetched successfully",
        code: 200,
        body: {
          message: "Users fetched successfully",
          data: [
            {
              id: 1,
              first_name: "Ada",
              last_name: "Lovelace",
              middle_name: null,
              profile_pic: null,
              email: "student@example.com",
              address: "1 Analytical Way",
              role: "student",
              is_active: true,
              gender: "female",
              otp: null,
              otp_expires_at: null,
            },
          ],
          pagination: { total: 1, page: 1, per_page: 20, total_page: 1 },
          success: true,
        },
      },
    ],
  }),

  mkItem({
    name: "Get User By ID",
    method: "GET",
    path: "/api/users/:id",
    auth: "noauth",
    desc:
      "**Public (no middleware).** Returns a single user by primary key.\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "**Note:** unlike `GET /api/users`, this endpoint does **not** exclude the `password` " +
      "column - the full user record (including the bcrypt hash) is returned. Treat this " +
      "as a security defect and do not expose it outside a trusted environment.",
    responses: [
      {
        name: "200 - User fetched successfully",
        code: 200,
        body: {
          message: "User fetched successfully",
          data: {
            id: 1,
            first_name: "Ada",
            last_name: "Lovelace",
            email: "student@example.com",
            role: "student",
            is_active: true,
            gender: "female",
            password: "$2b$10$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMN",
          },
          success: true,
        },
      },
      {
        name: "404 - User not found",
        code: 404,
        body: { message: "User not found" },
      },
    ],
  }),

  mkItem({
    name: "Create User",
    method: "POST",
    path: "/api/users",
    auth: "noauth",
    desc:
      "**Public (no middleware).** Creates a user record.\n\n" +
      "**Body fields**\n" +
      "| Field | Type | Required | Notes |\n" +
      "|---|---|---|---|\n" +
      "| first_name | string | yes | `notNull` + `notEmpty` |\n" +
      "| last_name | string | yes | `notNull` + `notEmpty` |\n" +
      "| middle_name | string | no | - |\n" +
      "| email | string | yes | must be a valid email, unique (`users_email_unique`) |\n" +
      "| password | string | yes | 6-20 chars; hashed by a `beforeCreate` bcrypt hook |\n" +
      "| address | string | no | - |\n" +
      "| role | string | no | enum `student` \\| `instructor` \\| `admin`, default `student` |\n" +
      "| is_active | boolean | no | default `true` |\n" +
      "| gender | string | yes | enum `male` \\| `female` \\| `other` |\n\n" +
      "**Error handling:** Sequelize validation errors are caught by the controller and " +
      "returned as `500`. The global error handler in `app.js` maps unhandled " +
      "`SequelizeValidationError` to `400 {\"message\":\"<validation message>\"}` - but the " +
      "controller's own `try/catch` intercepts them first, so a duplicate email or a bad " +
      "gender actually surfaces as `500`.",
    body: {
      first_name: "Grace",
      last_name: "Hopper",
      middle_name: "Murray",
      email: "grace.hopper@example.com",
      password: "secret123",
      address: "2 Compiler Road",
      role: "student",
      is_active: true,
      gender: "female",
    },
    responses: [
      {
        name: "201 - User created successfully",
        code: 201,
        body: {
          message: "User created successfully",
          data: {
            id: 2,
            first_name: "Grace",
            last_name: "Hopper",
            email: "grace.hopper@example.com",
            role: "student",
            is_active: true,
            gender: "female",
          },
          success: true,
        },
      },
      {
        name: "500 - Internal server error",
        code: 500,
        body: { message: "Internal server error", error: "SequelizeValidationError" },
      },
    ],
  }),

  mkItem({
    name: "Update User",
    method: "PUT",
    path: "/api/users/:id",
    desc:
      "**Private.** Updates a user record.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin', 'instructor', 'student')`.\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "**Body fields**\n" +
      "| Field | Type | Notes |\n" +
      "|---|---|---|\n" +
      "| first_name | string | |\n" +
      "| last_name | string | |\n" +
      "| middle_name | string | |\n" +
      "| email | string | must stay unique |\n" +
      "| address | string | |\n" +
      "| role | string | enum `student` \\| `instructor` \\| `admin` |\n" +
      "| is_active | boolean | set `false` to deactivate the account |\n" +
      "| gender | string | enum `male` \\| `female` \\| `other` |\n" +
      "| password | string | optional; 6-20 chars; re-hashed by the `beforeUpdate` hook |\n\n" +
      "**Behaviour notes**\n" +
      "- Every listed field is written on every call, so **omitting a field clears it** " +
      "(it is set to `undefined`/empty). Send the full record to preserve values.\n" +
      "- `authorize` only checks the caller's **role**, not ownership - any authenticated " +
      "student or instructor can update any user, including changing `role` to `admin`. " +
      "This is an authorization defect.\n" +
      "- Unknown id -> `404 {\"message\":\"User not found\"}`.",
    body: {
      first_name: "Ada",
      last_name: "Lovelace",
      middle_name: "Byron",
      email: "ada.lovelace@example.com",
      address: "1 Analytical Way",
      role: "student",
      is_active: true,
      gender: "female",
      password: "secret123",
    },
    responses: [
      {
        name: "200 - User updated successfully",
        code: 200,
        body: {
          message: "User updated successfully",
          data: {
            id: 1,
            first_name: "Ada",
            last_name: "Lovelace",
            email: "ada.lovelace@example.com",
            role: "student",
            is_active: true,
            gender: "female",
          },
          success: true,
        },
      },
      {
        name: "404 - User not found",
        code: 404,
        body: { message: "User not found" },
      },
      {
        name: "403 - Forbidden, You do not have permission to access this resource.Required [admin, instructor, student]",
        code: 403,
        body: {
          message:
            "Forbidden, You do not have permission to access this resource.Required [admin, instructor, student]",
        },
      },
    ],
  }),

  mkItem({
    name: "Delete User",
    method: "DELETE",
    path: "/api/users/:id",
    desc:
      "**Private (admin only).** Deletes a user record.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "Related `students` / `instructors` rows are removed by the `CASCADE` foreign keys. " +
      "Unknown id -> `404 {\"message\":\"User not found\"}`.",
    responses: [
      {
        name: "200 - User deleted successfully",
        code: 200,
        body: { message: "User deleted successfully", success: true },
      },
      {
        name: "404 - User not found",
        code: 404,
        body: { message: "User not found" },
      },
      {
        name: "403 - Forbidden, You do not have permission to access this resource.Required [admin]",
        code: 403,
        body: {
          message:
            "Forbidden, You do not have permission to access this resource.Required [admin]",
        },
      },
    ],
  }),
];