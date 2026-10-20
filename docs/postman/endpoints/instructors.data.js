/** Endpoints mounted at /api/instructors  (routes/instructor.route.js) */
const { mkItem } = require("../builder");

module.exports = [
  mkItem({
    name: "Register Instructor",
    method: "POST",
    path: "/api/instructors/register",
    auth: "noauth",
    desc:
      "**Public.** Creates the `users` row **and** the `instructors` profile in a single " +
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
      "| bio | string | no | |\n" +
      "| address | string | no | |\n" +
      "| specialization | string | yes | |\n" +
      "| years_experience | string | yes | model column is a `STRING` |\n\n" +
      "**Response:** `201` with the instructor profile including the joined `user` object " +
      "(`id`, `password`, `created_at`, `updated_at` excluded). Validation errors are " +
      "rolled back and returned as `500 {\"message\":\"Internal server error\"}`.",
    body: {
      first_name: "Grace",
      last_name: "Hopper",
      middle_name: "Murray",
      email: "grace.hopper@example.com",
      password: "secret123",
      gender: "female",
      bio: "Computer scientist and US Navy rear admiral.",
      address: "2 Compiler Lane",
      specialization: "Compilers and Distributed Systems",
      years_experience: "25",
    },
    responses: [
      {
        name: "201 - Instructor created successfully",
        code: 201,
        body: {
          message: "Instructor created successfully",
          data: {
            id: 1,
            user_id: 1,
            bio: "Computer scientist and US Navy rear admiral.",
            specialization: "Compilers and Distributed Systems",
            years_experience: "25",
            created_at: "2026-01-01T09:00:00.000Z",
            updated_at: "2026-01-01T09:00:00.000Z",
            user: {
              first_name: "Grace",
              last_name: "Hopper",
              middle_name: "Murray",
              email: "grace.hopper@example.com",
              role: "instructor",
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
    name: "Get All Instructors",
    method: "GET",
    path: "/api/instructors",
    auth: "noauth",
    desc:
      "**Public.** Returns a paginated list of instructor profiles with their joined " +
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
        name: "200 - Instructors fetched successfully",
        code: 200,
        body: {
          message: "Instructors fetched successfully",
          data: [
            {
              id: 1,
              user_id: 1,
              bio: "Computer scientist and US Navy rear admiral.",
              specialization: "Compilers and Distributed Systems",
              years_experience: "25",
              user: {
                first_name: "Grace",
                last_name: "Hopper",
                email: "grace.hopper@example.com",
                role: "instructor",
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
    name: "Get Instructor By ID",
    method: "GET",
    path: "/api/instructors/:id",
    auth: "noauth",
    desc:
      "**Public.** Returns a single instructor profile (with its `user` object) by the " +
      "**instructor profile id** (not the user id).\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "Unknown id -> `404 {\"message\":\"Instructor not found\"}`.",
    responses: [
      {
        name: "200 - Instructor fetched successfully",
        code: 200,
        body: {
          message: "Instructor fetched successfully",
          data: {
            id: 1,
            user_id: 1,
            bio: "Computer scientist and US Navy rear admiral.",
            specialization: "Compilers and Distributed Systems",
            years_experience: "25",
            user: {
              first_name: "Grace",
              last_name: "Hopper",
              email: "grace.hopper@example.com",
              role: "instructor",
              is_active: true,
              gender: "female",
            },
          },
        },
      },
      {
        name: "404 - Instructor not found",
        code: 404,
        body: { message: "Instructor not found" },
      },
    ],
  }),

  mkItem({
    name: "Create Instructor Profile",
    method: "POST",
    path: "/api/instructors",
    desc:
      "**Private (admin only).** Creates an `instructors` profile for an **existing** user.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Body fields**\n" +
      "| Field | Type | Required | Notes |\n" +
      "|---|---|---|---|\n" +
      "| user_id | integer | yes | id of the user row |\n" +
      "| bio | string | no | |\n" +
      "| specialization | string | yes | |\n" +
      "| years_experience | string | yes | model column is a `STRING` |\n\n" +
      "**Responses**\n" +
      "- `400 {\"message\":\"All fields are required\"}` - `user_id`, `specialization` or " +
      "`years_experience` missing.\n" +
      "- `404 {\"message\":\"User not found\"}` - no user with that id.\n" +
      "- `400 {\"message\":\"User is not instructor\"}` - the user's role is not `instructor`.\n" +
      "- `400 {\"message\":\"Instructor profile already exists\"}` - one profile already exists " +
      "for that user.\n\n" +
      "Everything runs inside a transaction, so a failure rolls the whole thing back.",
    body: {
      user_id: 1,
      bio: "Computer scientist and US Navy rear admiral.",
      specialization: "Compilers and Distributed Systems",
      years_experience: "25",
    },
    responses: [
      {
        name: "200 - Instructor created successfully",
        code: 200,
        body: {
          message: "Instructor created successfully",
          data: {
            id: 1,
            user_id: 1,
            bio: "Computer scientist and US Navy rear admiral.",
            specialization: "Compilers and Distributed Systems",
            years_experience: "25",
            user: {
              first_name: "Grace",
              last_name: "Hopper",
              email: "grace.hopper@example.com",
              role: "instructor",
              is_active: true,
              gender: "female",
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
        name: "404 - User not found",
        code: 404,
        body: { message: "User not found" },
      },
      {
        name: "400 - User is not instructor",
        code: 400,
        body: { message: "User is not instructor" },
      },
      {
        name: "400 - Instructor profile already exists",
        code: 400,
        body: { message: "Instructor profile already exists" },
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

  mkItem({
    name: "Update Instructor Profile",
    method: "PUT",
    path: "/api/instructors/:id",
    desc:
      "**Private (admin or instructor).** Updates an instructor profile.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin', 'instructor')`.\n\n" +
      "**Path param:** `id` (integer, required) - the instructor profile id.\n\n" +
      "**Body fields:** `bio`, `specialization`, `years_experience`.\n\n" +
      "**Behaviour notes**\n" +
      "- All three fields are written unconditionally, so **omitting a field clears it**. Send " +
      "the full record to preserve values.\n" +
      "- `authorize` only checks the caller's role - it does **not** verify that the instructor " +
      "owns the profile being updated. Any instructor can update any instructor profile. " +
      "This is an authorization defect.\n" +
      "- Unknown id -> `404 {\"message\":\"Instructor not found\"}`.",
    body: {
      bio: "Computer scientist and US Navy rear admiral.",
      specialization: "Compilers and Distributed Systems",
      years_experience: "25",
    },
    responses: [
      {
        name: "200 - Instructor updated successfully",
        code: 200,
        body: {
          message: "Instructor updated successfully",
          data: {
            id: 1,
            user_id: 1,
            bio: "Computer scientist and US Navy rear admiral.",
            specialization: "Compilers and Distributed Systems",
            years_experience: "25",
          },
        },
      },
      {
        name: "404 - Instructor not found",
        code: 404,
        body: { message: "Instructor not found" },
      },
      {
        name: "403 - Forbidden, You do not have permission to access this resource.Required [admin, instructor]",
        code: 403,
        body: {
          message:
            "Forbidden, You do not have permission to access this resource.Required [admin, instructor]",
        },
      },
    ],
  }),

  mkItem({
    name: "Get Instructor Courses",
    method: "GET",
    path: "/api/instructors/:id/courses",
    auth: "noauth",
    desc:
      "**Public.** Returns the courses assigned to an instructor.\n\n" +
      "**Path param:** `id` (integer, required) - the instructor profile id.\n\n" +
      "Unknown instructor id -> `404 {\"message\":\"Instructor not found\"}`.",
    responses: [
      {
        name: "200 - Courses fetched successfully",
        code: 200,
        body: {
          message: "Courses fetched successfully",
          data: [
            {
              id: 1,
              title: "Introduction to Programming",
              code: "CS101",
              description: "Fundamentals of programming using JavaScript.",
              duration: "8 weeks",
              is_active: true,
            },
          ],
        },
      },
      {
        name: "404 - Instructor not found",
        code: 404,
        body: { message: "Instructor not found" },
      },
    ],
  }),
  mkItem({
    name: "Delete Instructor Profile",
    method: "DELETE",
    path: "/api/instructors/:id",
    desc:
      "**Private (admin only).** Deletes an instructor profile.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Path param:** `id` (integer, required) - the instructor profile id.\n\n" +
      "The associated `users` row is **not** deleted, and the `instructor_courses` join rows " +
      "are removed by the `CASCADE` foreign key.\n\n" +
      "Unknown id -> `404 {\"message\":\"Instructor not found\"}`.",
    responses: [
      {
        name: "200 - Instructor deleted successfully",
        code: 200,
        body: {
          message: "Instructor deleted successfully",
          data: {
            id: 1,
            user_id: 1,
            bio: "Computer scientist and US Navy rear admiral.",
            specialization: "Compilers and Distributed Systems",
            years_experience: "25",
          },
        },
      },
      {
        name: "404 - Instructor not found",
        code: 404,
        body: { message: "Instructor not found" },
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

  mkItem({
    name: "Attach Courses to Instructor",
    method: "POST",
    path: "/api/instructors/:id/courses",
    desc:
      "**Private (admin only).** Assigns courses to an instructor through the " +
      "`instructor_courses` join table.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Path param:** `id` (integer, required) - the instructor profile id.\n\n" +
      "**Body fields**\n" +
      "| Field | Type | Required | Notes |\n" +
      "|---|---|---|---|\n" +
      "| coursesInfo | array | yes | array of course descriptors |\n" +
      "| coursesInfo[].course_id | integer | yes | id of the course to attach |\n" +
      "| coursesInfo[].assigned_at | string | no | ISO date; defaults to `new Date()` |\n\n" +
      "**Responses**\n" +
      "- `404 {\"message\":\"Instructor not found\"}`.\n" +
      "- `400 {\"message\":\"Some courses do not exist\", \"missingCourseIds\":[...]}` - one or " +
      "more `course_id`s have no matching course row.\n" +
      "- `400 {\"message\":\"Some courses already attached to this instructor\", " +
      "\"duplicateCourseIds\":[...]}`.\n\n" +
      "**Quirk:** the controller calls `coursesInfo.map(...)` without validating the body, so a " +
      "missing/non-array `coursesInfo` throws and returns `500 " +
      "{\"message\":\"Internal Server error\"}`.",
    body: {
      coursesInfo: [
        { course_id: 1, assigned_at: "2026-01-01T09:00:00.000Z" },
        { course_id: 2 },
      ],
    },
    responses: [
      {
        name: "200 - Courses attached successfully",
        code: 200,
        body: {
          message: "Courses attached successfully",
          data: [
            {
              id: 1,
              instructor_id: 1,
              course_id: 1,
              assigned_at: "2026-01-01T09:00:00.000Z",
              created_at: "2026-01-01T09:00:00.000Z",
              updated_at: "2026-01-01T09:00:00.000Z",
            },
          ],
        },
      },
      {
        name: "400 - Some courses do not exist",
        code: 400,
        body: { message: "Some courses do not exist", missingCourseIds: [99] },
      },
      {
        name: "400 - Some courses already attached to this instructor",
        code: 400,
        body: {
          message: "Some courses already attached to this instructor",
          duplicateCourseIds: [1],
        },
      },
      {
        name: "404 - Instructor not found",
        code: 404,
        body: { message: "Instructor not found" },
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
  mkItem({
    name: "Detach Courses from Instructor",
    method: "DELETE",
    path: "/api/instructors/:id/courses",
    desc:
      "**Private (admin only).** Removes course assignments from an instructor.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Path param:** `id` (integer, required) - the instructor profile id.\n\n" +
      "**Body fields:** `courseIds` (array of integers, required).\n\n" +
      "**Responses**\n" +
      "- `404 {\"message\":\"Instructor not found\"}`.\n" +
      "- `400 {\"message\":\"Please provide an array of course ids\"}` - `courseIds` is missing, " +
      "not an array, or empty.\n" +
      "- `400 {\"message\":\"No courses found to detach\"}` - none of the given ids are currently " +
      "attached to the instructor.\n\n" +
      "**Note:** the request body is required even though the route is a `DELETE` - in Postman " +
      "select **raw / JSON** as the body type.",
    body: { courseIds: [1, 2] },
    responses: [
      {
        name: "200 - Courses detached successfully",
        code: 200,
        body: {
          message: "Courses detached successfully",
          data: [
            {
              id: 1,
              instructor_id: 1,
              course_id: 1,
              assigned_at: "2026-01-01T09:00:00.000Z",
            },
          ],
        },
      },
      {
        name: "400 - Please provide an array of course ids",
        code: 400,
        body: { message: "Please provide an array of course ids" },
      },
      {
        name: "400 - No courses found to detach",
        code: 400,
        body: { message: "No courses found to detach" },
      },
      {
        name: "404 - Instructor not found",
        code: 404,
        body: { message: "Instructor not found" },
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
