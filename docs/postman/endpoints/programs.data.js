/** Endpoints mounted at /api/programs  (routes/program.route.js) */
const { mkItem } = require("../builder");

module.exports = [
  mkItem({
    name: "Get All Programs",
    method: "GET",
    path: "/api/programs",
    auth: "noauth",
    desc:
      "**Public.** Returns a paginated list of **active** programs, newest first.\n\n" +
      "**Query params:** `page` (default `1`), `limit` (default `10`).\n\n" +
      "**Response notes**\n" +
      "- Filtered with `where: { is_active: true }`; ordered by `created_at DESC`.\n" +
      "- Pagination keys: `total`, `page`, `limit`, `totalPages`.\n" +
      "- `tuition` is a `DECIMAL(10,2)` and is serialised as a string by Sequelize.",
    query: [
      { key: "page", value: "1", description: "1-based page number" },
      { key: "limit", value: "10", description: "Page size (default 10)" },
    ],
    responses: [
      {
        name: "200 - Programs fetched successfully",
        code: 200,
        body: {
          message: "Programs fetched successfully",
          data: [
            {
              id: 1,
              name: "Full Stack Web Development",
              description: "6-month intensive web development program.",
              program_code: "FSWD-01",
              tuition: "250000.00",
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
    name: "Get Program By ID",
    method: "GET",
    path: "/api/programs/:id",
    auth: "noauth",
    desc:
      "**Public.** Returns a single program by primary key.\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "This endpoint does **not** filter on `is_active`, so an inactive program is still " +
      "returned. Unknown id -> `404 {\"message\":\"Program not found\"}`.",
    responses: [
      {
        name: "200 - Program fetched successfully",
        code: 200,
        body: {
          message: "Program fetched successfully",
          data: {
            id: 1,
            name: "Full Stack Web Development",
            description: "6-month intensive web development program.",
            program_code: "FSWD-01",
            tuition: "250000.00",
            is_active: true,
            created_at: "2026-01-01T09:00:00.000Z",
            updated_at: "2026-01-01T09:00:00.000Z",
          },
        },
      },
      {
        name: "404 - Program not found",
        code: 404,
        body: { message: "Program not found" },
      },
    ],
  }),

  mkItem({
    name: "Create Program",
    method: "POST",
    path: "/api/programs",
    desc:
      "**Private (admin only).** Creates a program.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Body fields**\n" +
      "| Field | Type | Notes |\n" +
      "|---|---|---|\n" +
      "| name | string | required, not empty |\n" +
      "| program_code | string | required, unique (`program_code_unique`) |\n" +
      "| description | string | required, not empty |\n" +
      "| tuition | number | required, decimal |\n" +
      "| is_active | boolean | optional (model default `true`) |\n\n" +
      "**Response:** `200` (not `201`) with `message: \"Program created successfully\"`. " +
      "Model validation errors are caught by the controller and returned as " +
      "`500 {\"message\":\"Internal Server error\"}`.",
    body: {
      name: "Full Stack Web Development",
      program_code: "FSWD-01",
      description: "6-month intensive web development program.",
      tuition: 250000,
      is_active: true,
    },
    responses: [
      {
        name: "200 - Program created successfully",
        code: 200,
        body: {
          message: "Program created successfully",
          data: {
            id: 1,
            name: "Full Stack Web Development",
            program_code: "FSWD-01",
            description: "6-month intensive web development program.",
            tuition: "250000.00",
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
    name: "Update Program",
    method: "PUT",
    path: "/api/programs/:id",
    desc:
      "**Private (admin only).** Updates a program.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "**Body fields:** `name`, `program_code`, `description`, `tuition`, `is_active` - the " +
      "same set as create. All of them are written on every call, so omitted fields are " +
      "cleared. Unknown id -> `404 {\"message\":\"Program not found\"}`.",
    body: {
      name: "Full Stack Web Development",
      program_code: "FSWD-01",
      description: "6-month intensive web development program.",
      tuition: 275000,
      is_active: true,
    },
    responses: [
      {
        name: "200 - Program updated successfully",
        code: 200,
        body: {
          message: "Program updated successfully",
          data: {
            id: 1,
            name: "Full Stack Web Development",
            program_code: "FSWD-01",
            tuition: "275000.00",
            is_active: true,
            updated_at: "2026-02-01T09:00:00.000Z",
          },
        },
      },
      {
        name: "404 - Program not found",
        code: 404,
        body: { message: "Program not found" },
      },
    ],
  }),



  mkItem({
    name: "Delete Program",
    method: "DELETE",
    path: "/api/programs/:id",
    desc:
      "**Private (admin only).** Deletes a program.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "Enrolments and `program_courses` rows are removed by the `CASCADE` foreign keys. " +
      "Unknown id -> `404 {\"message\":\"Program not found\"}`.",
    responses: [
      {
        name: "200 - Program deleted successfully",
        code: 200,
        body: { message: "Program deleted successfully" },
      },
      {
        name: "404 - Program not found",
        code: 404,
        body: { message: "Program not found" },
      },
    ],
  }),

  mkItem({
    name: "Get Program Courses",
    method: "GET",
    path: "/api/programs/:id/courses",
    auth: "noauth",
    desc:
      "**Public.** Returns the courses attached to a program.\n\n" +
      "**Path param:** `id` (integer, required) - the program id.\n\n" +
      "Unknown program id -> `404 {\"message\":\"Program not found\"}`. The response contains " +
      "the plain `courses` rows (no join-table data such as `sequence`/`is_required`).",
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
        name: "404 - Program not found",
        code: 404,
        body: { message: "Program not found" },
      },
    ],
  }),

  mkItem({
    name: "Attach Courses to Program",
    method: "POST",
    path: "/api/programs/:id/courses",
    desc:
      "**Private (admin only).** Attaches courses to a program.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')`.\n\n" +
      "**Path param:** `id` (integer, required) - the program id.\n\n" +
      "**Body:** `coursesInfo` - an **array** of objects, each with `course_id` (int), " +
      "`sequence` (int) and `is_required` (boolean).\n\n" +
      "**Validation**\n" +
      "- Unknown course ids -> `400 {\"message\":\"Some courses do not exist\", " +
      "\"missingCourseIds\":[...]}`.\n" +
      "- Courses already attached -> `400 {\"message\":\"Some courses already attached to " +
      "this program\", \"duplicateCourseIds\":[...]}`.\n" +
      "- Missing `coursesInfo` throws inside the controller and returns `500`.",
    body: {
      coursesInfo: [
        { course_id: 1, sequence: 1, is_required: true },
        { course_id: 2, sequence: 2, is_required: false },
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
              program_id: 1,
              course_id: 1,
              sequence: 1,
              is_required: true,
            },
            {
              id: 2,
              program_id: 1,
              course_id: 2,
              sequence: 2,
              is_required: false,
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
        name: "400 - Some courses already attached to this program",
        code: 400,
        body: {
          message: "Some courses already attached to this program",
          duplicateCourseIds: [1],
        },
      },
      {
        name: "404 - Program not found",
        code: 404,
        body: { message: "Program not found" },
      },
    ],
  }),

  mkItem({
    name: "Detach Courses from Program",
    method: "DELETE",
    path: "/api/programs/:id/courses",
    // No auth middleware is registered on this route, so it must be marked
    // `noauth` - sending a bearer token would be misleading documentation.
    auth: "noauth",
    desc:
      "**Effectively public (security defect).** Detaches courses from a program.\n\n" +
      "**Middleware:** *none is registered on this route* - the `authenticate` / " +
      "`authorize('admin')` middleware is missing here, so the endpoint is reachable " +
      "**without a token** (security defect).\n\n" +
      "**Path param:** `id` (integer, required) - the program id.\n\n" +
      "**Body:** `courseIds` - an **array of course ids**.\n\n" +
      "**Validation**\n" +
      "- Empty / non-array `courseIds` -> `400 {\"message\":\"Please provide an array of course " +
      "ids\"}`.\n" +
      "- None of the ids are attached -> `400 {\"message\":\"No courses found to detach\"}`.\n" +
      "- Unknown program id -> `404 {\"message\":\"Program not found\"}`.",
    body: { courseIds: [1, 2] },
    responses: [
      {
        name: "200 - Courses detached successfully",
        code: 200,
        body: {
          message: "Courses detached successfully",
          data: [{ id: 1, program_id: 1, course_id: 1 }],
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
        name: "404 - Program not found",
        code: 404,
        body: { message: "Program not found" },
      },
    ],
  })
];
