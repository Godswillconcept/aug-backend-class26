/** Endpoints mounted at /api/enrolments  (routes/enrolment.route.js) */
const { mkItem } = require("../builder");

module.exports = [
  mkItem({
    name: "Enrol With Payment",
    method: "POST",
    path: "/api/enrolments/with-payment",
    desc:
      "**Private (student only).** Creates an enrolment **and** its payment in one " +
      "transaction.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('student')`.\n\n" +
      "**Body fields**\n" +
      "| Field | Type | Required | Notes |\n" +
      "|---|---|---|---|\n" +
      "| user_id | int | yes | must belong to a user with `role: \"student\"` |\n" +
      "| program_id | int | yes | must exist |\n" +
      "| enrolment_date | string | yes | `YYYY-MM-DD` (`DATEONLY`) |\n" +
      "| status | string | no | enum `enrolled` \\| `completed` \\| `dropped` |\n" +
      "| enrolled_at | string | no | ISO timestamp (`DATE`) |\n" +
      "| amount | number | yes | decimal, `DECIMAL` |\n" +
      "| payment_date | string | yes | `YYYY-MM-DD` (`DATEONLY`) |\n" +
      "| payment_method | string | yes | enum `cash` \\| `card` \\| `bank_transfer` |\n" +
      "| payment_status | string | no | enum `pending` \\| `completed` \\| `failed` |\n\n" +
      "**Response:** `201` with the enrolment including `user`, `program` and `payments`.\n\n" +
      "**Validation**\n" +
      "- Unknown `user_id` or `program_id` -> `404 {\"message\":\"User or program not found\"}`.\n" +
      "- User is not a student -> `400 {\"message\":\"User is not student\"}`.\n" +
      "- Model validation errors -> `500 {\"message\":\"Internal server error\"}`.",
    body: {
      user_id: 1,
      program_id: 1,
      enrolment_date: "2026-02-01",
      status: "enrolled",
      enrolled_at: "2026-02-01T09:00:00.000Z",
      amount: 250000,
      payment_date: "2026-02-01",
      payment_method: "card",
      payment_status: "completed",
    },
    responses: [
      {
        name: "201 - Enrolment with payment created successfully",
        code: 201,
        body: {
          message: "Enrolment with payment created successfully",
          data: {
            id: 1,
            user_id: 1,
            program_id: 1,
            enrolment_date: "2026-02-01",
            status: "enrolled",
            enrolled_at: "2026-02-01T09:00:00.000Z",
            user: {
              first_name: "Ada",
              last_name: "Lovelace",
              email: "ada.lovelace@example.com",
              role: "student",
            },
            program: {
              name: "Full Stack Web Development",
              program_code: "FSWD-01",
              tuition: "250000.00",
              is_active: true,
            },
            payments: [
              {
                enrolment_id: 1,
                amount: "250000.00",
                payment_date: "2026-02-01",
                payment_method: "card",
                status: "completed",
              },
            ],
          },
        },
      },
      {
        name: "400 - User is not student",
        code: 400,
        body: { message: "User is not student" },
      },
      {
        name: "404 - User or program not found",
        code: 404,
        body: { message: "User or program not found" },
      },
    ],
  }),

  mkItem({
    name: "Get All Enrolments",
    method: "GET",
    path: "/api/enrolments",
    desc:
      "**Private (admin only).** Returns a paginated list of enrolments.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')` (applied with `router.use`).\n\n" +
      "**Query params:** `page` (default `1`), `limit` (default `10`).\n\n" +
      "**Response notes**\n" +
      "- Each row includes `user`, `program` and `payments` associations " +
      "(`password`, `id` and timestamps excluded from the nested objects).\n" +
      "- Ordered by `created_at DESC`.\n" +
      "- Pagination keys: `totalItems`, `totalPages`, `currentPage`, `perPage`.",
    query: [
      { key: "page", value: "1", description: "1-based page number" },
      { key: "limit", value: "10", description: "Page size (default 10)" },
    ],
    responses: [
      {
        name: "200 - Enrolments fetched successfully",
        code: 200,
        body: {
          message: "Enrolments fetched successfully",
          data: [
            {
              id: 1,
              user_id: 1,
              program_id: 1,
              enrolment_date: "2026-02-01",
              status: "enrolled",
              enrolled_at: "2026-02-01T09:00:00.000Z",
              user: {
                first_name: "Ada",
                last_name: "Lovelace",
                email: "ada.lovelace@example.com",
                role: "student",
              },
              program: {
                name: "Full Stack Web Development",
                program_code: "FSWD-01",
                tuition: "250000.00",
                is_active: true,
              },
              payments: [],
            },
          ],
          pagination: { totalItems: 1, totalPages: 1, currentPage: 1, perPage: 10 },
        },
      },
    ],
  }),

  mkItem({
    name: "Create Enrolment",
    method: "POST",
    path: "/api/enrolments",
    desc:
      "**Private (admin only).** Creates an enrolment for an existing student user.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')` (applied with `router.use`).\n\n" +
      "**Body fields**\n" +
      "| Field | Type | Required | Notes |\n" +
      "|---|---|---|---|\n" +
      "| user_id | int | yes | must belong to a user with `role: \"student\"` |\n" +
      "| program_id | int | yes | must exist |\n" +
      "| enrolment_date | string | yes | `YYYY-MM-DD` (`DATEONLY`) |\n" +
      "| status | string | yes | enum `enrolled` \\| `completed` \\| `dropped` |\n" +
      "| enrolled_at | string | yes | ISO timestamp (`DATE`) |\n\n" +
      "**Validation**\n" +
      "- Any field missing -> `400 {\"message\":\"All fields are required\"}`.\n" +
      "- Unknown `user_id` -> `404 {\"message\":\"User not found\"}`.\n" +
      "- User is not a student -> `400 {\"message\":\"User is not student\"}`.\n" +
      "- Unknown `program_id` -> `404 {\"message\":\"Program not found\"}`.\n" +
      "- Model validation errors -> `500 {\"message\":\"Internal server error\"}`.",
    body: {
      user_id: 1,
      program_id: 1,
      enrolment_date: "2026-02-01",
      status: "enrolled",
      enrolled_at: "2026-02-01T09:00:00.000Z",
    },
    responses: [
      {
        name: "200 - Enrolment created successfully",
        code: 200,
        body: {
          message: "Enrolment created successfully",
          data: {
            id: 1,
            user_id: 1,
            program_id: 1,
            enrolment_date: "2026-02-01",
            status: "enrolled",
            enrolled_at: "2026-02-01T09:00:00.000Z",
            user: {
              first_name: "Ada",
              last_name: "Lovelace",
              email: "ada.lovelace@example.com",
              role: "student",
              student: {
                dob: "2002-04-15",
                guardian_name: "Charles Babbage",
                guardian_email: "guardian@example.com",
                guardian_phone: "08012345678",
              },
            },
            program: {
              name: "Full Stack Web Development",
              program_code: "FSWD-01",
              tuition: "250000.00",
              is_active: true,
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
        name: "404 - User not found",
        code: 404,
        body: { message: "User not found" },
      },
      {
        name: "404 - Program not found",
        code: 404,
        body: { message: "Program not found" },
      },
    ],
  }),

  mkItem({
    name: "Get Enrolment By ID",
    method: "GET",
    path: "/api/enrolments/:id",
    desc:
      "**Private (admin only).** Returns a single enrolment with its `user`, `program` " +
      "and `payments` associations.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')` (applied with `router.use`).\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "Unknown id -> `404 {\"message\":\"Enrolment not found\"}`.",
    responses: [
      {
        name: "200 - Enrolment fetched successfully",
        code: 200,
        body: {
          message: "Enrolment fetched successfully",
          data: {
            id: 1,
            user_id: 1,
            program_id: 1,
            enrolment_date: "2026-02-01",
            status: "enrolled",
            enrolled_at: "2026-02-01T09:00:00.000Z",
            user: {
              first_name: "Ada",
              last_name: "Lovelace",
              email: "ada.lovelace@example.com",
              role: "student",
            },
            program: {
              name: "Full Stack Web Development",
              program_code: "FSWD-01",
              tuition: "250000.00",
              is_active: true,
            },
            payments: [
              {
                enrolment_id: 1,
                amount: "250000.00",
                payment_date: "2026-02-01",
                payment_method: "card",
                status: "completed",
              },
            ],
          },
        },
      },
      {
        name: "404 - Enrolment not found",
        code: 404,
        body: { message: "Enrolment not found" },
      },
    ],
  }),

  mkItem({
    name: "Update Enrolment",
    method: "PUT",
    path: "/api/enrolments/:id",
    desc:
      "**Private (admin only).** Updates an enrolment.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')` (applied with `router.use`).\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "**Body fields:** `program_id`, `enrolment_date`, `status`, `enrolled_at` - all are " +
      "written on every call, so omitted fields are cleared. `user_id` cannot be changed.\n\n" +
      "Unknown id -> `404 {\"message\":\"Enrolment not found\"}`.",
    body: {
      program_id: 1,
      enrolment_date: "2026-02-01",
      status: "completed",
      enrolled_at: "2026-02-01T09:00:00.000Z",
    },
    responses: [
      {
        name: "200 - Enrolment updated successfully",
        code: 200,
        body: {
          message: "Enrolment updated successfully",
          data: {
            id: 1,
            user_id: 1,
            program_id: 1,
            enrolment_date: "2026-02-01",
            status: "completed",
            enrolled_at: "2026-02-01T09:00:00.000Z",
          },
        },
      },
      {
        name: "404 - Enrolment not found",
        code: 404,
        body: { message: "Enrolment not found" },
      },
    ],
  }),

  mkItem({
    name: "Delete Enrolment",
    method: "DELETE",
    path: "/api/enrolments/:id",
    desc:
      "**Private (admin only).** Deletes an enrolment. Its payments are removed by the " +
      "`CASCADE` foreign key on `payments.enrolment_id`.\n\n" +
      "**Middleware:** `authenticate` -> `authorize('admin')` (applied with `router.use`).\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "Unknown id -> `404 {\"message\":\"Enrolment not found\"}`.",
    responses: [
      {
        name: "200 - Enrolment deleted successfully",
        code: 200,
        body: { message: "Enrolment deleted successfully" },
      },
      {
        name: "404 - Enrolment not found",
        code: 404,
        body: { message: "Enrolment not found" },
      },
    ],
  }),
];
