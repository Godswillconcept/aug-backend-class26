/** Endpoints mounted at /api/courses  (routes/course.route.js) */
const { mkItem } = require("../builder");

module.exports = [
  mkItem({
    name: "Get All Courses",
    method: "GET",
    path: "/api/courses",
    auth: "noauth",
    desc:
      "**Public.** Returns a paginated list of **active** courses, newest first.\n\n" +
      "**Query params**\n" +
      "| Param | Type | Default | Notes |\n" +
      "|---|---|---|---|\n" +
      "| page | number | 1 | 1-based page number |\n" +
      "| limit | number | 10 | page size |\n\n" +
      "**Response notes**\n" +
      "- Rows are filtered with `where: { is_active: true }` - inactive courses are never listed here.\n" +
      "- Ordered by `created_at DESC`.\n" +
      "- The pagination object uses the keys `total`, `page`, `limit`, `totalPages`.",
    query: [
      { key: "page", value: "1", description: "1-based page number" },
      { key: "limit", value: "10", description: "Page size (default 10)" },
    ],
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
              created_at: "2026-01-01T09:00:00.000Z",
              updated_at: "2026-01-01T09:00:00.000Z",
            },
          ],
          pagination: { total: 1, page: "1", limit: "10", totalPages: 1 },
        },
      },
    ],
  }),

  mkItem({
    name: "Get Course By ID",
    method: "GET",
    path: "/api/courses/:id",
    auth: "noauth",
    desc:
      "**Public.** Returns a single course by primary key.\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "Unlike the list endpoint, this one does **not** filter on `is_active`, so an inactive " +
      "course is still returned. Unknown id -> `404 {\"message\":\"Course not found\"}`.",
    responses: [
      {
        name: "200 - Course fetched successfully",
        code: 200,
        body: {
          message: "Course fetched successfully",
          data: {
            id: 1,
            title: "Introduction to Programming",
            code: "CS101",
            description: "Fundamentals of programming using JavaScript.",
            duration: "8 weeks",
            is_active: true,
            created_at: "2026-01-01T09:00:00.000Z",
            updated_at: "2026-01-01T09:00:00.000Z",
          },
        },
      },
      {
        name: "404 - Course not found",
        code: 404,
        body: { message: "Course not found" },
      },
    ],
  }),

  mkItem({
    name: "Create Course",
    method: "POST",
    path: "/api/courses",
    desc:
      "**Private (admin only).** Creates a course.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Body fields**\n" +
      "| Field | Type | Required | Notes |\n" +
      "|---|---|---|---|\n" +
      "| title | string | yes | not empty |\n" +
      "| code | string | yes | unique (`course_code_unique`) |\n" +
      "| description | string | yes | not empty |\n" +
      "| duration | string | yes | not empty, e.g. `\"8 weeks\"` |\n" +
      "| is_active | boolean | yes | the column has **no default**, so omitting it fails the " +
      "`allowNull: false` check |\n\n" +
      "**Response:** `200` (not `201`) with `message: \"Course created successfully\"`. " +
      "Validation errors are caught by the controller and returned as " +
      "`500 {\"message\":\"Internal Server error\"}`.",
    body: {
      title: "Introduction to Programming",
      code: "CS101",
      description: "Fundamentals of programming using JavaScript.",
      duration: "8 weeks",
      is_active: true,
    },
    responses: [
      {
        name: "200 - Course created successfully",
        code: 200,
        body: {
          message: "Course created successfully",
          data: {
            id: 1,
            title: "Introduction to Programming",
            code: "CS101",
            description: "Fundamentals of programming using JavaScript.",
            duration: "8 weeks",
            is_active: true,
            created_at: "2026-01-01T09:00:00.000Z",
            updated_at: "2026-01-01T09:00:00.000Z",
          },
        },
      },
      {
        name: "500 - Internal Server error",
        code: 500,
        body: { message: "Internal Server error" },
      },
    ],
  }),

  mkItem({
    name: "Update Course",
    method: "PUT",
    path: "/api/courses/:id",
    desc:
      "**Private (admin only).** Updates a course.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "**Body fields:** `title`, `code`, `description`, `duration`, `is_active` - the same set " +
      "as create. All of them are written on every call, so omitted fields are cleared and an " +
      "omitted `is_active` becomes `null` (which fails the `allowNull` check).\n\n" +
      "Unknown id -> `404 {\"message\":\"Course not found\"}`.",
    body: {
      title: "Introduction to Programming",
      code: "CS101",
      description: "Fundamentals of programming using JavaScript.",
      duration: "10 weeks",
      is_active: true,
    },
    responses: [
      {
        name: "200 - Course updated successfully",
        code: 200,
        body: {
          message: "Course updated successfully",
          data: {
            id: 1,
            title: "Introduction to Programming",
            code: "CS101",
            duration: "10 weeks",
            is_active: true,
            updated_at: "2026-02-01T09:00:00.000Z",
          },
        },
      },
      {
        name: "404 - Course not found",
        code: 404,
        body: { message: "Course not found" },
      },
    ],
  }),

  mkItem({
    name: "Delete Course",
    method: "DELETE",
    path: "/api/courses/:id",
    desc:
      "**Private (admin only).** Deletes a course.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "`program_courses` and `instructor_courses` rows are removed by the `CASCADE` foreign " +
      "keys. Unknown id -> `404 {\"message\":\"Course not found\"}`.",
    responses: [
      {
        name: "200 - Course deleted successfully",
        code: 200,
        body: { message: "Course deleted successfully" },
      },
      {
        name: "404 - Course not found",
        code: 404,
        body: { message: "Course not found" },
      },
    ],
  }),
];
