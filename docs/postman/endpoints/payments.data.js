/** Endpoints mounted at /api/payments  (routes/payment.route.js) */
const { mkItem } = require("../builder");

module.exports = [
  mkItem({
    name: "Get All Payments",
    method: "GET",
    path: "/api/payments",
    desc:
      "**Private (admin only).** Returns a paginated list of payments.\n\n" +
      "**Middleware:** `authenticate` (via `router.use`) -> `authorize('admin')`.\n\n" +
      "**Query params:** `page` (default `1`), `limit` (default `10`).\n\n" +
      "**Response notes**\n" +
      "- Each payment embeds `enrolment`, which itself embeds `user` and `program` " +
      "(`id`, `password` and timestamps are excluded from those nested objects).\n" +
      "- Ordered by `created_at DESC`.\n" +
      "- Pagination keys: `total`, `page`, `limit`, `totalPages`.",
    query: [
      { key: "page", value: "1", description: "1-based page number" },
      { key: "limit", value: "10", description: "Page size (default 10)" },
    ],
    responses: [
      {
        name: "200 - Payments fetched successfully",
        code: 200,
        body: {
          message: "Payments fetched successfully",
          data: [
            {
              id: 1,
              enrolment_id: 1,
              amount: "250000.00",
              payment_date: "2026-02-01",
              payment_method: "card",
              status: "completed",
              enrolment: {
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
              },
            },
          ],
          pagination: { total: 1, page: "1", limit: "10", totalPages: 1 },
        },
      },
    ],
  }),

  mkItem({
    name: "Create Payment",
    method: "POST",
    path: "/api/payments",
    desc:
      "**Private (any authenticated role).** Records a payment against an existing " +
      "enrolment.\n\n" +
      "**Middleware:** `authenticate` only - the route has **no** `authorize(...)` guard, so a " +
      "`student` or `instructor` token can also create payments. This is an authorization gap " +
      "worth flagging.\n\n" +
      "**Body fields**\n" +
      "| Field | Type | Required | Notes |\n" +
      "|---|---|---|---|\n" +
      "| enrolment_id | int | yes | must reference an existing enrolment |\n" +
      "| amount | decimal | yes | `DECIMAL` column |\n" +
      "| payment_date | string | yes | `YYYY-MM-DD` (`DATEONLY`) |\n" +
      "| payment_method | string | yes | enum `cash` \\| `card` \\| `bank_transfer` |\n" +
      "| status | string | no | enum `pending` \\| `completed` \\| `failed`, defaults to `pending` |\n\n" +
      "**Notes**\n" +
      "- The controller does **not** verify that `enrolment_id` exists; a bad value fails the " +
      "foreign key and is returned as `500 {\"message\":\"Internal Server error\"}`.\n" +
      "- There is a unique index on `(enrolment_id, payment_date)`, so a second payment for the " +
      "same enrolment and date fails with `500`.\n" +
      "- Response status is `200` (not `201`).",
    body: {
      enrolment_id: 1,
      amount: 250000,
      payment_date: "2026-02-01",
      payment_method: "card",
      status: "completed",
    },
    responses: [
      {
        name: "200 - Payment created successfully",
        code: 200,
        body: {
          message: "Payment created successfully",
          data: {
            id: 1,
            enrolment_id: 1,
            amount: "250000.00",
            payment_date: "2026-02-01",
            payment_method: "card",
            status: "completed",
            created_at: "2026-02-01T09:00:00.000Z",
            updated_at: "2026-02-01T09:00:00.000Z",
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
    name: "Get Payment By ID",
    method: "GET",
    path: "/api/payments/:id",
    desc:
      "**Private (any authenticated role).** Returns a single payment with its `enrolment` " +
      "(`user` and `program` nested).\n\n" +
      "**Middleware:** `authenticate` only - there is **no** `authorize(...)` guard on this " +
      "route, so any signed-in user can read any payment.\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "Unknown id -> `404 {\"message\":\"Payment not found\"}`.",
    responses: [
      {
        name: "200 - Payment fetched successfully",
        code: 200,
        body: {
          message: "Payment fetched successfully",
          data: {
            id: 1,
            enrolment_id: 1,
            amount: "250000.00",
            payment_date: "2026-02-01",
            payment_method: "card",
            status: "completed",
            enrolment: {
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
            },
          },
        },
      },
      {
        name: "404 - Payment not found",
        code: 404,
        body: { message: "Payment not found" },
      },
    ],
  }),

  mkItem({
    name: "Update Payment",
    method: "PUT",
    path: "/api/payments/:id",
    desc:
      "**Private (admin only).** Updates a payment.\n\n" +
      "**Middleware:** `authenticate` (via `router.use`) -> `authorize('admin')`.\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "**Body fields:** `enrolment_id`, `amount`, `payment_date`, `payment_method`, `status` - " +
      "all are written on every call, so omitted fields are cleared.\n\n" +
      "**Validation**\n" +
      "- Unknown `enrolment_id` -> `404 {\"message\":\"Enrolment not found\",\"enrolment_id\":<id>}` " +
      "(the id is echoed in the body).\n" +
      "- Unknown payment `id` -> `404 {\"message\":\"Payment not found\"}`.",
    body: {
      enrolment_id: 1,
      amount: 300000,
      payment_date: "2026-02-05",
      payment_method: "bank_transfer",
      status: "completed",
    },
    responses: [
      {
        name: "200 - Payment updated successfully",
        code: 200,
        body: {
          message: "Payment updated successfully",
          data: {
            id: 1,
            enrolment_id: 1,
            amount: "300000.00",
            payment_date: "2026-02-05",
            payment_method: "bank_transfer",
            status: "completed",
          },
        },
      },
      {
        name: "404 - Enrolment not found",
        code: 404,
        body: { message: "Enrolment not found", enrolment_id: 1 },
      },
      {
        name: "404 - Payment not found",
        code: 404,
        body: { message: "Payment not found" },
      },
    ],
  }),

  mkItem({
    name: "Delete Payment",
    method: "DELETE",
    path: "/api/payments/:id",
    desc:
      "**Private (admin only).** Deletes a payment.\n\n" +
      "**Middleware:** `authenticate` (via `router.use`) -> `authorize('admin')`.\n\n" +
      "**Path param:** `id` (integer, required).\n\n" +
      "Unknown id -> `404 {\"message\":\"Payment not found\"}`.",
    responses: [
      {
        name: "200 - Payment deleted successfully",
        code: 200,
        body: { message: "Payment deleted successfully" },
      },
      {
        name: "404 - Payment not found",
        code: 404,
        body: { message: "Payment not found" },
      },
    ],
  }),
];
