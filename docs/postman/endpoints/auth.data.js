/** Endpoints mounted at /api/auth  (routes/auth.route.js) */
const { mkItem } = require("../builder");

module.exports = [
  mkItem({
    name: "Login",
    method: "POST",
    path: "/api/auth/login",
    auth: "noauth",
    desc:
      "**Public.** Authenticates a user by email + password and returns a signed JWT.\n\n" +
      "- Token type: single **Bearer** JWT (HS256), payload `{ id, email, role }`.\n" +
      "- Token lifetime: `JWT_EXPIRES_IN` (currently **3hr** in `.env`).\n" +
      "- There is **no refresh token**. When the token expires, call " +
      "`POST /api/auth/login` again.\n" +
      "- The token must be sent as `Authorization: Bearer <token>` on every protected route.\n\n" +
      "**Body validation** (controller-level): `email` and `password` are both required, " +
      "otherwise `400`.",
    body: {
      email: "student@example.com",
      password: "secret123",
    },
    tests: [
      "pm.test('Status is 200', () => pm.response.to.have.status(200));",
      "const json = pm.response.json();",
      "pm.expect(json.message).to.eql('Login successful');",
      "pm.expect(json.data.token).to.be.a('string');",
      "pm.collectionVariables.set('token', json.data.token);",
    ],
    responses: [
      {
        name: "200 - Login successful",
        code: 200,
        body: {
          message: "Login successful",
          data: {
            user: {
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
              created_at: "2026-01-01T09:00:00.000Z",
              updated_at: "2026-01-01T09:00:00.000Z",
              student: {
                id: 1,
                dob: "2002-04-15",
                guardian_name: "Charles Babbage",
                guardian_email: "guardian@example.com",
                guardian_phone: "08012345678",
              },
            },
            token:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzdHVkZW50QGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQifQ.1a2B3c4d5e6f",
          },
          success: true,
        },
      },
      {
        name: "400 - Email and password are required",
        code: 400,
        body: { message: "Email and password are required" },
      },
      {
        name: "404 - User not found",
        code: 404,
        body: { message: "User not found" },
      },
      {
        name: "400 - User is not active",
        code: 400,
        body: { message: "User is not active" },
      },
      {
        name: "401 - Invalid credentials",
        code: 401,
        body: { message: "Invalid credentials" },
      },
    ],
  }),

  mkItem({
    name: "Forgot Password (request OTP)",
    method: "POST",
    path: "/api/auth/forget-password",
    auth: "noauth",
    desc:
      "**Public.** Generates a 6-character OTP (digits + upper/lower case letters, no special " +
      "characters), stores it on the user with a 10-minute expiry, and emails it via SMTP " +
      "(`EMAIL_HOST`/`EMAIL_PORT`/`EMAIL_USER`/`EMAIL_PASS`).\n\n" +
      "The OTP is also echoed in the response `data.otp`, which makes this endpoint usable in " +
      "local development. Use the same value in `POST /api/auth/reset-password`.\n\n" +
      "**Note:** the route is mounted as `/forget-password` (not `/forgot-password`).",
    body: { email: "student@example.com" },
    responses: [
      {
        name: "200 - OTP sent successfully",
        code: 200,
        body: {
          message: "OTP sent successfully",
          data: { otp: "aB3xZ9" },
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
    name: "Reset Password (with OTP)",
    method: "POST",
    path: "/api/auth/reset-password",
    auth: "noauth",
    desc:
      "**Public.** Sets a new password using the OTP issued by " +
      "`POST /api/auth/forget-password`.\n\n" +
      "- The OTP is matched against `users.otp`; if no user matches, `404` is returned.\n" +
      "- If `otp_expires_at` is in the past, `400 {\"message\":\"OTP has expired\"}` is returned.\n" +
      "- On success the OTP and its expiry are cleared.\n" +
      "- The new password is hashed with bcrypt (salt rounds = 10) by the model hook.\n" +
      "- Model validation: password must be 6-20 characters.",
    body: { otp: "aB3xZ9", password: "newSecret123" },
    responses: [
      {
        name: "200 - Password reset successful",
        code: 200,
        body: { message: "Password reset successful", success: true },
      },
      {
        name: "404 - User not found",
        code: 404,
        body: { message: "User not found" },
      },
      {
        name: "400 - OTP has expired",
        code: 400,
        body: { message: "OTP has expired" },
      },
    ],
  }),

  mkItem({
    name: "Change Password",
    method: "POST",
    path: "/api/auth/change-password",
    desc:
      "**Private.** Changes the password of the authenticated user.\n\n" +
      "**Middleware:** `authenticate` - requires `Authorization: Bearer <token>`.\n\n" +
      "**Body validation** (controller-level): `currentPassword` and `newPassword` are both " +
      "required, otherwise `400`.\n\n" +
      "The current password is verified with bcrypt. A mismatch returns `401 " +
      "{\"message\":\"Invalid credentials\"}`. The new password is 6-20 characters.",
    body: { currentPassword: "secret123", newPassword: "newSecret123" },
    tests: [
      "pm.test('Status is 200', () => pm.response.to.have.status(200));",
      "pm.expect(pm.response.json().message).to.eql('Password changed successfully');",
    ],
    responses: [
      {
        name: "200 - Password changed successfully",
        code: 200,
        body: { message: "Password changed successfully", success: true },
      },
      {
        name: "400 - Current password and new password are required",
        code: 400,
        body: {
          message: "Current password and new password are required",
          success: false,
        },
      },
      {
        name: "401 - Unauthorized, Authentication token not found",
        code: 401,
        body: { message: "Unauthorized, Authentication token not found" },
      },
      {
        name: "401 - Invalid credentials",
        code: 401,
        body: { message: "Invalid credentials" },
      },
      {
        name: "404 - User not found",
        code: 404,
        body: { message: "User not found", success: false },
      },
    ],
  }),

  mkItem({
    name: "Update Current User (me)",
    method: "PUT",
    path: "/api/auth/me",
    desc:
      "**Private.** Updates the profile of the authenticated user.\n\n" +
      "**Middleware:** `authenticate`.\n\n" +
      "**Body fields**\n" +
      "| Field | Type | Applies to | Notes |\n" +
      "|---|---|---|---|\n" +
      "| first_name | string | user | |\n" +
      "| last_name | string | user | |\n" +
      "| middle_name | string | user | |\n" +
      "| email | string | user | must be unique |\n" +
      "| address | string | user | |\n" +
      "| gender | string | user | enum `male` \\| `female` \\| `other` |\n" +
      "| dob | string | student | `YYYY-MM-DD` (`DATEONLY`) |\n" +
      "| guardian_name | string | student | |\n" +
      "| guardian_email | string | student | valid email |\n" +
      "| guardian_phone | string | student | numeric |\n" +
      "| bio | string | instructor | |\n" +
      "| specialization | string | instructor | |\n" +
      "| years_experience | string | instructor | |\n\n" +
      "**Quirk:** the user fields are written unconditionally, so any field you omit is set to " +
      "`undefined` -> `null` on the user row. Always send the complete set of fields you want " +
      "to keep.\n\n" +
      "**Response:** `200` with the updated user (password removed). The nested `student` / " +
      "`instructor` sub-profile in the response is the **pre-update** snapshot, because the " +
      "controller updates the sub-profile with a separate query after loading the user.",
    body: {
      first_name: "Ada",
      last_name: "Lovelace",
      middle_name: null,
      email: "ada.lovelace@example.com",
      address: "1 Analytical Way",
      gender: "female",
      dob: "2002-04-15",
      guardian_name: "Charles Babbage",
      guardian_email: "guardian@example.com",
      guardian_phone: "08012345678",
    },
    responses: [
      {
        name: "200 - User Profile updated successfully",
        code: 200,
        body: {
          message: "User Profile updated successfully",
          data: {
            id: 1,
            first_name: "Ada",
            last_name: "Lovelace",
            middle_name: null,
            profile_pic: null,
            email: "ada.lovelace@example.com",
            address: "1 Analytical Way",
            role: "student",
            is_active: true,
            gender: "female",
            otp: null,
            otp_expires_at: null,
            created_at: "2026-01-01T09:00:00.000Z",
            updated_at: "2026-02-01T09:00:00.000Z",
            student: {
              id: 1,
              dob: "2002-04-15",
              guardian_name: "Charles Babbage",
              guardian_email: "guardian@example.com",
              guardian_phone: "08012345678",
            },
          },
          success: true,
        },
      },
      {
        name: "404 - User not found",
        code: 404,
        body: { message: "User not found", success: false },
      },
      {
        name: "404 - Student not found",
        code: 404,
        body: { message: "Student not found", success: false },
      },
      {
        name: "404 - Instructor not found",
        code: 404,
        body: { message: "Instructor not found", success: false },
      },
    ],
  }),

  mkItem({
    name: "Get Current User (me)",
    method: "GET",
    path: "/api/auth/me",
    desc:
      "**Private.** Returns the profile of the authenticated user, including the related " +
      "`student` / `instructor` sub-profile.\n\n" +
      "**Middleware:** `authenticate`.\n\n" +
      "The password column is excluded by the middleware, and `otp` / `otp_expires_at` are " +
      "still returned by the model (they are only cleared after a password reset).",
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
            middle_name: null,
            profile_pic: null,
            email: "student@example.com",
            address: "1 Analytical Way",
            role: "student",
            is_active: true,
            gender: "female",
            otp: null,
            otp_expires_at: null,
            created_at: "2026-01-01T09:00:00.000Z",
            updated_at: "2026-01-01T09:00:00.000Z",
            student: {
              id: 1,
              dob: "2002-04-15",
              guardian_name: "Charles Babbage",
              guardian_email: "guardian@example.com",
              guardian_phone: "08012345678",
            },
          },
          success: true,
        },
      },
      {
        name: "401 - Unauthorized, Authentication token not found",
        code: 401,
        body: { message: "Unauthorized, Authentication token not found" },
      },
      {
        name: "401 - Authentication token expired",
        code: 401,
        body: { message: "Authentication token expired" },
      },
      {
        name: "403 - Invalid authentication token",
        code: 403,
        body: { message: "Invalid authentication token" },
      },
      {
        name: "401 - Unauthorized, Invalid or inactive user",
        code: 401,
        body: { message: "Unauthorized, Invalid or inactive user" },
      },
    ],
  }),

  mkItem({
    name: "Upload Profile Picture",
    method: "PUT",
    path: "/api/auth/profile-picture",
    desc:
      "**Private.** Uploads a new profile picture for the authenticated user.\n\n" +
      "**Middleware:** `authenticate` -> `multer.single('profile_picture')`.\n\n" +
      "**Request type:** `multipart/form-data` with a single file field named " +
      "**`profile_picture`**.\n" +
      "Do not set `Content-Type` manually - Postman adds the multipart boundary " +
      "automatically.\n\n" +
      "**Storage** (`config/upload.js`)\n" +
      "- Destination is chosen from `req.user.role` + the URL containing `profile-picture`:\n" +
      "  - admin -> `./uploads/admin/profile-pictures/`\n" +
      "  - instructor -> `./uploads/instructor/profile-pictures/`\n" +
      "  - student -> `./uploads/student/profile-pictures/`\n" +
      "  - otherwise -> `./uploads/`\n" +
      "- Filename: `<base32 timestamp><random>` + the extension taken from the mimetype.\n" +
      "- The folder is created recursively if it does not exist.\n" +
      "- The stored relative path is written to `users.profile_pic` and returned in the " +
      "response.\n" +
      "- `uploads` is served statically, so the file is reachable at " +
      "`http://<host>:<port>/<profile_pic>`.\n\n" +
      "**Validation:** no file -> `400 {\"message\":\"Profile picture is required\"}`.",
    form: [
      {
        key: "profile_picture",
        type: "file",
        value: "",
        description: "Image file. The mimetype extension is used as the file extension.",
      },
    ],
    responses: [
      {
        name: "200 - Profile picture changed successfully",
        code: 200,
        body: {
          message: "Profile picture changed successfully",
          data: {
            id: 1,
            first_name: "Ada",
            last_name: "Lovelace",
            email: "student@example.com",
            role: "student",
            profile_pic: "uploads/student/profile-pictures/1k5a0skjgs0ghl1juh34.png",
          },
          success: true,
        },
      },
      {
        name: "400 - Profile picture is required",
        code: 400,
        body: { message: "Profile picture is required", success: false },
      },
      {
        name: "401 - Unauthorized",
        code: 401,
        body: { message: "Unauthorized", success: false },
      },
    ],
  }),


];
