/** Endpoints mounted at /api/students  (routes/student.route.js) */
const { mkItem } = require("../builder");

module.exports = [
  mkItem({
    name: "Register Student",
    method: "POST",
    path: "/api/students/register",
    auth: "noauth",
    desc:
      "**Public.** Creates the `users` row **and** the `students` profile in a single " +
      "transaction.\n\n" +
      "**Body fields**\n" +
      "| Field | Type | Required | Notes |\n" +
      "|---|---|---|---|\n" +
      "| first_name | string | yes | |\n" +
      "| last_name | string | yes | |\n" +
      "| middle_name | string | no | |\n" +
      "| email | string | yes | unique, valid email |\n" +
      "| password | string | yes | 6-20 characters, hashed by the `beforeCreate` hook |\n" +
      "| gender | string | yes | enum `male` \\| `female` \\| `other` |\n" +
      "| dob | string | yes | `YYYY-MM-DD` |\n" +
      "| address | string | no | |\n" +
      "| guardian_name | string | yes | |\n" +
      "| guardian_email | string | yes | valid email |\n" +
      "| guardian_phone | string | yes | numeric string |\n\n" +
      "**Response:** `201` with the student profile including the joined `user` object " +
      "(`id`, `password`, `created_at`, `updated_at` excluded). Validation errors are " +
      "rolled back and returned as `500 {\"message\":\"Internal server error\"}`.",
    body: {
      first_name: "Ada",
      last_name: "Lovelace",
      middle_name: "Byron",
      email: "ada.lovelace@example.com",
      password: "secret123",
      gender: "female",
      dob: "2002-04-15",
      address: "1 Analytical Way",
      guardian_name: "Charles Babbage",
      guardian_email: "guardian@example.com",
      guardian_phone: "08012345678",
    },
    responses: [
      {
        name: "201 - Student created successfully",
        code: 201,
        body: {
          message: "Student created successfully",
          data: {
            id: 1,
            user_id: 1,
            dob: "2002-04-15",
            guardian_name: "Charles Babbage",
            guardian_email: "guardian@example.com",
            guardian_phone: "08012345678",
            created_at: "2026-01-01T09:00:00.000Z",
            updated_at: "2026-01-01T09:00:00.000Z",
            user: {
              first_name: "Ada",
              last_name: "Lovelace",
              middle_name: "Byron",
              email: "ada.lovelace@example.com",
              role: "student",
              is_active: true,
              gender: "female",
            },
          },
        },
      },
      {
        name: "500 - Internal server error",
        code: 500,
        body: { message: "Internal server error" },
      },
    ],
  }),

  mkItem({
    name: "Get All Students",
    method: "GET",
    path: "/api/students",
    auth: "noauth",
    desc:
      "**Public.** Returns a paginated list of student profiles with their joined " +
      "`user` object (`id`, `password`, `created_at`, `updated_at` excluded).\n\n" +
      "**Query params:** `page` (default `1`), `limit` (default `10`).\n\n" +
      "**Response notes**\n" +
      "- Ordered by `created_at DESC`.\n" +
      "- Pagination keys: `totalItems`, `totalPages`, `currentPage`, `perPage`.\n" +
      "- The controller's `catch` block is empty, so a database error results in a " +
      "**hung request** with no response instead of a `500`.",
    query: [
      { key: "page", value: "1", description: "1-based page number" },
      { key: "limit", value: "10", description: "Page size (default 10)" },
    ],
    responses: [
      {
        name: "200 - Students fetched successfully",
        code: 200,
        body: {
          message: "Students fetched successfully",
          data: [
            {
              id: 1,
              user_id: 1,
              dob: "2002-04-15",
              guardian_name: "Charles Babbage",
              guardian_email: "guardian@example.com",
              guardian_phone: "08012345678",
              user: {
                first_name: "Ada",
                last_name: "Lovelace",
                email: "ada.lovelace@example.com",
                role: "student",
                is_active: true,
                gender: "female",
              },
            },
          ],
          pagination: { totalItems: 1, totalPages: 1, currentPage: 1, perPage: 10 },
        },
      },
    ],
  }),

  mkItem({
    name: "Get Student By ID",
    method: "GET",
    path: "/api/students/:id",
    auth: "noauth",
    desc:
      "**Public.** Returns a single student profile (with its `user` object) by the " +
      "**student profile id** (not the user id).\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "Unknown id -> `404 {\"message\":\"Student not found\"}`.",
    responses: [
      {
        name: "200 - Student fetched successfully",
        code: 200,
        body: {
          message: "Student fetched successfully",
          data: {
            id: 1,
            user_id: 1,
            dob: "2002-04-15",
            guardian_name: "Charles Babbage",
            guardian_email: "guardian@example.com",
            guardian_phone: "08012345678",
            user: {
              first_name: "Ada",
              last_name: "Lovelace",
              email: "ada.lovelace@example.com",
              role: "student",
              is_active: true,
              gender: "female",
            },
          },
        },
      },
      {
        name: "404 - Student not found",
        code: 404,
        body: { message: "Student not found" },
      },
    ],
  }),


  mkItem({
    name: "Create Student Profile",
    method: "POST",
    path: "/api/students",
    desc:
      "**Private (admin only).** Creates a student profile for an **existing** user " +
      "(the user row must already exist and have `role: \"student\"`).\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Body fields**\n" +
      "| Field | Type | Notes |\n" +
      "|---|---|---|\n" +
      "| user_id | int | required, must reference an existing `student` user |\n" +
      "| dob | string | required, `YYYY-MM-DD` |\n" +
      "| guardian_name | string | required |\n" +
      "| guardian_email | string | required, valid email |\n" +
      "| guardian_phone | string | required, numeric string |\n\n" +
      "**Validation**\n" +
      "- Any field missing -> `400 {\"message\":\"All fields are required\"}`.\n" +
      "- Unknown user -> `404 {\"message\":\"User not found\"}`.\n" +
      "- User role is not `student` -> `400 {\"message\":\"User is not student\"}`.\n" +
      "- Profile already exists -> `400 {\"message\":\"Student profile already exists\"}`.",
    body: {
      user_id: 1,
      dob: "2002-04-15",
      guardian_name: "Charles Babbage",
      guardian_email: "guardian@example.com",
      guardian_phone: "08012345678",
    },
    responses: [
      {
        name: "200 - Student created successfully",
        code: 200,
        body: {
          message: "Student created successfully",
          data: {
            id: 1,
            user_id: 1,
            dob: "2002-04-15",
            guardian_name: "Charles Babbage",
            guardian_email: "guardian@example.com",
            guardian_phone: "08012345678",
            user: {
              first_name: "Ada",
              last_name: "Lovelace",
              email: "ada.lovelace@example.com",
              role: "student",
            },
          },
        },
      },
      {
        name: "400 - All fields are required",
        code: 400,
        body: { message: "All fields are required" },
      },
      {
        name: "400 - User is not student",
        code: 400,
        body: { message: "User is not student" },
      },
      {
        name: "400 - Student profile already exists",
        code: 400,
        body: { message: "Student profile already exists" },
      },
      {
        name: "404 - User not found",
        code: 404,
        body: { message: "User not found" },
      },
    ],
  }),

  mkItem({
    name: "Update Student Profile",
    method: "PUT",
    path: "/api/students/:id",
    desc:
      "**Private (admin only).** Updates a student profile.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Path param:** `id` (integer, required) - the student profile id.\n\n" +
      "**Body fields:** `dob`, `guardian_name`, `guardian_email`, `guardian_phone`. All are " +
      "written on every call, so omitted fields are cleared.\n\n" +
      "Unknown id -> `404 {\"message\":\"Student not found\"}`.",
    body: {
      dob: "2002-04-16",
      guardian_name: "Charles Babbage",
      guardian_email: "guardian@example.com",
      guardian_phone: "08012345678",
    },
    responses: [
      {
        name: "200 - Student updated successfully",
        code: 200,
        body: {
          message: "Student updated successfully",
          data: {
            id: 1,
            user_id: 1,
            dob: "2002-04-16",
            guardian_name: "Charles Babbage",
            guardian_email: "guardian@example.com",
            guardian_phone: "08012345678",
          },
        },
      },
      {
        name: "404 - Student not found",
        code: 404,
        body: { message: "Student not found" },
      },
    ],
  }),

  mkItem({
    name: "Delete Student Profile",
    method: "DELETE",
    path: "/api/students/:id",
    desc:
      "**Private (admin only).** Deletes a student profile.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Path param:** `id` (integer, required) - the student profile id.\n\n" +
      "The linked `users` row is **not** deleted. The response echoes the deleted row. " +
      "Unknown id -> `404 {\"message\":\"Student not found\"}`.",
    responses: [
      {
        name: "200 - Student deleted successfully",
        code: 200,
        body: {
          message: "Student deleted successfully",
          data: { id: 1, user_id: 1, dob: "2002-04-15" },
        },
      },
      {
        name: "404 - Student not found",
        code: 404,
        body: { message: "Student not found" },
      },
    ],
  }),
];
