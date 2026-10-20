# Alusoft Training API Reference

REST API for the Alusoft Training platform, generated from the live Express route definitions in `routes/`, the controllers in `controllers/` and the middleware in `middlewares/`.

## Table of Contents

- [Auth](#auth)
- [Users](#users)
- [Students](#students)
- [Instructors](#instructors)
- [Programs](#programs)
- [Courses](#courses)
- [Enrolments](#enrolments)
- [Payments](#payments)

### Reference

- [Endpoint Quick Reference](#endpoint-quick-reference)
- [Authentication](#authentication)
- [Known Implementation Quirks](#known-implementation-quirks)

---

## Endpoint Quick Reference

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates a user by email + password and returns a signed JWT. |
| `POST` | `/api/auth/forget-password` | Public | Generates a 6-character OTP (digits + upper/lower case letters, no special characters), stores it on the user with a 10-minute expiry, and emails it via SMTP (`EMAIL_HOST`/`EMAIL_PORT`/`EMAIL_USER`/`EMAIL_PASS`). |
| `POST` | `/api/auth/reset-password` | Public | Sets a new password using the OTP issued by `POST /api/auth/forget-password`. |
| `POST` | `/api/auth/change-password` | Private | Changes the password of the authenticated user. |
| `PUT` | `/api/auth/me` | Private | Updates the profile of the authenticated user. |
| `GET` | `/api/auth/me` | Private | Returns the profile of the authenticated user, including the related `student` / `instructor` sub-profile. |
| `PUT` | `/api/auth/profile-picture` | Private | Uploads a new profile picture for the authenticated user. |
| `GET` | `/api/users` | Public | Returns a paginated list of users. |
| `GET` | `/api/users/:id` | Public | Returns a single user by primary key. |
| `POST` | `/api/users` | Public | Creates a user record. |
| `PUT` | `/api/users/:id` | Private | Updates a user record. |
| `DELETE` | `/api/users/:id` | Private (admin only) | Deletes a user record. |
| `POST` | `/api/students/register` | Public | Creates the `users` row and the `students` profile in a single transaction. |
| `GET` | `/api/students` | Public | Returns a paginated list of student profiles with their joined `user` object (`id`, `password`, `created_at`, `updated_at` excluded). |
| `GET` | `/api/students/:id` | Public | Returns a single student profile (with its `user` object) by the student profile id (not the user id). |
| `POST` | `/api/students` | Private (admin only) | Creates a student profile for an existing user (the user row must already exist and have `role: "student"`). |
| `PUT` | `/api/students/:id` | Private (admin only) | Updates a student profile. |
| `DELETE` | `/api/students/:id` | Private (admin only) | Deletes a student profile. |
| `POST` | `/api/instructors/register` | Public | Creates the `users` row and the `instructors` profile in a single transaction. |
| `GET` | `/api/instructors` | Public | Returns a paginated list of instructor profiles with their joined `user` object (`id`, `password`, `created_at`, `updated_at` excluded). |
| `GET` | `/api/instructors/:id` | Public | Returns a single instructor profile (with its `user` object) by the instructor profile id (not the user id). |
| `POST` | `/api/instructors` | Private (admin only) | Creates an `instructors` profile for an existing user. |
| `PUT` | `/api/instructors/:id` | Private (admin or instructor) | Updates an instructor profile. |
| `GET` | `/api/instructors/:id/courses` | Public | Returns the courses assigned to an instructor. |
| `DELETE` | `/api/instructors/:id` | Private (admin only) | Deletes an instructor profile. |
| `POST` | `/api/instructors/:id/courses` | Private (admin only) | Assigns courses to an instructor through the `instructor_courses` join table. |
| `DELETE` | `/api/instructors/:id/courses` | Private (admin only) | Removes course assignments from an instructor. |
| `GET` | `/api/programs` | Public | Returns a paginated list of active programs, newest first. |
| `GET` | `/api/programs/:id` | Public | Returns a single program by primary key. |
| `POST` | `/api/programs` | Private (admin only) | Creates a program. |
| `PUT` | `/api/programs/:id` | Private (admin only) | Updates a program. |
| `DELETE` | `/api/programs/:id` | Private (admin only) | Deletes a program. |
| `GET` | `/api/programs/:id/courses` | Public | Returns the courses attached to a program. |
| `POST` | `/api/programs/:id/courses` | Private (admin only) | Attaches courses to a program. |
| `DELETE` | `/api/programs/:id/courses` | Public (no auth applied) | Detaches courses from a program. |
| `GET` | `/api/courses` | Public | Returns a paginated list of active courses, newest first. |
| `GET` | `/api/courses/:id` | Public | Returns a single course by primary key. |
| `POST` | `/api/courses` | Private (admin only) | Creates a course. |
| `PUT` | `/api/courses/:id` | Private (admin only) | Updates a course. |
| `DELETE` | `/api/courses/:id` | Private (admin only) | Deletes a course. |
| `POST` | `/api/enrolments/with-payment` | Private (student only) | Creates an enrolment and its payment in one transaction. |
| `GET` | `/api/enrolments` | Private (admin only) | Returns a paginated list of enrolments. |
| `POST` | `/api/enrolments` | Private (admin only) | Creates an enrolment for an existing student user. |
| `GET` | `/api/enrolments/:id` | Private (admin only) | Returns a single enrolment with its `user`, `program` and `payments` associations. |
| `PUT` | `/api/enrolments/:id` | Private (admin only) | Updates an enrolment. |
| `DELETE` | `/api/enrolments/:id` | Private (admin only) | Deletes an enrolment. |
| `GET` | `/api/payments` | Private (admin only) | Returns a paginated list of payments. |
| `POST` | `/api/payments` | Private (any authenticated role) | Records a payment against an existing enrolment. |
| `GET` | `/api/payments/:id` | Private (any authenticated role) | Returns a single payment with its `enrolment` (`user` and `program` nested). |
| `PUT` | `/api/payments/:id` | Private (admin only) | Updates a payment. |
| `DELETE` | `/api/payments/:id` | Private (admin only) | Deletes a payment. |

---

## Authentication

All private routes use a stateless JWT sent as `Authorization: Bearer <token>`.

| Situation | Status | Response |
|---|---|---|
| No `Authorization` header | `401` | `{"message":"Unauthorized, Authentication token not found"}` |
| Token expired | `401` | `{"message":"Authentication token expired"}` |
| Token invalid | `403` | `{"message":"Invalid authentication token"}` |
| User missing or `is_active = false` | `401` | `{"message":"Unauthorized, Invalid or inactive user"}` |
| Role not allowed by `authorize(...)` | `403` | `{"message":"Forbidden, You do not have permission to access this resource.Required [...]"}` |

Call `POST /api/auth/login` to obtain a token; the response body contains `data.token`.

---

## Auth

Authentication, password reset and profile management. Run **Login** first - it writes the JWT into the `token` collection variable.

### POST /api/auth/login

**Login** - Public

**Public.** Authenticates a user by email + password and returns a signed JWT.

- Token type: single **Bearer** JWT (HS256), payload `{ id, email, role }`.
- Token lifetime: `JWT_EXPIRES_IN` (currently **3hr** in `.env`).
- There is **no refresh token**. When the token expires, call `POST /api/auth/login` again.
- The token must be sent as `Authorization: Bearer <token>` on every protected route.

**Body validation** (controller-level): `email` and `password` are both required, otherwise `400`.

**Request body**

```json
{
  "email": "student@example.com",
  "password": "secret123"
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "first_name": "Ada",
      "last_name": "Lovelace",
      "middle_name": null,
      "profile_pic": null,
      "email": "student@example.com",
      "address": "1 Analytical Way",
      "role": "student",
      "is_active": true,
      "gender": "female",
      "otp": null,
      "otp_expires_at": null,
      "created_at": "2026-01-01T09:00:00.000Z",
      "updated_at": "2026-01-01T09:00:00.000Z",
      "student": {
        "id": 1,
        "dob": "2002-04-15",
        "guardian_name": "Charles Babbage",
        "guardian_email": "guardian@example.com",
        "guardian_phone": "08012345678"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzdHVkZW50QGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQifQ.1a2B3c4d5e6f"
  },
  "success": true
}
```

#### 400 Bad Request

```json
{
  "message": "Email and password are required"
}
```

#### 404 Not Found

```json
{
  "message": "User not found"
}
```

#### 400 Bad Request

```json
{
  "message": "User is not active"
}
```

#### 401 Unauthorized

```json
{
  "message": "Invalid credentials"
}
```

**Postman tests**

```javascript
pm.test('Status is 200', () => pm.response.to.have.status(200));
const json = pm.response.json();
pm.expect(json.message).to.eql('Login successful');
pm.expect(json.data.token).to.be.a('string');
pm.collectionVariables.set('token', json.data.token);
```

### POST /api/auth/forget-password

**Forgot Password (request OTP)** - Public

**Public.** Generates a 6-character OTP (digits + upper/lower case letters, no special characters), stores it on the user with a 10-minute expiry, and emails it via SMTP (`EMAIL_HOST`/`EMAIL_PORT`/`EMAIL_USER`/`EMAIL_PASS`).

The OTP is also echoed in the response `data.otp`, which makes this endpoint usable in local development. Use the same value in `POST /api/auth/reset-password`.

**Note:** the route is mounted as `/forget-password` (not `/forgot-password`).

**Request body**

```json
{
  "email": "student@example.com"
}
```

**Responses**

#### 200 OK

```json
{
  "message": "OTP sent successfully",
  "data": {
    "otp": "aB3xZ9"
  },
  "success": true
}
```

#### 404 Not Found

```json
{
  "message": "User not found"
}
```

### POST /api/auth/reset-password

**Reset Password (with OTP)** - Public

**Public.** Sets a new password using the OTP issued by `POST /api/auth/forget-password`.

- The OTP is matched against `users.otp`; if no user matches, `404` is returned.
- If `otp_expires_at` is in the past, `400 {"message":"OTP has expired"}` is returned.
- On success the OTP and its expiry are cleared.
- The new password is hashed with bcrypt (salt rounds = 10) by the model hook.
- Model validation: password must be 6-20 characters.

**Request body**

```json
{
  "otp": "aB3xZ9",
  "password": "newSecret123"
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Password reset successful",
  "success": true
}
```

#### 404 Not Found

```json
{
  "message": "User not found"
}
```

#### 400 Bad Request

```json
{
  "message": "OTP has expired"
}
```

### POST /api/auth/change-password

**Change Password** - Private

**Private.** Changes the password of the authenticated user.

**Middleware:** `authenticate` - requires `Authorization: Bearer <token>`.

**Body validation** (controller-level): `currentPassword` and `newPassword` are both required, otherwise `400`.

The current password is verified with bcrypt. A mismatch returns `401 {"message":"Invalid credentials"}`. The new password is 6-20 characters.

**Request body**

```json
{
  "currentPassword": "secret123",
  "newPassword": "newSecret123"
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Password changed successfully",
  "success": true
}
```

#### 400 Bad Request

```json
{
  "message": "Current password and new password are required",
  "success": false
}
```

#### 401 Unauthorized

```json
{
  "message": "Unauthorized, Authentication token not found"
}
```

#### 401 Unauthorized

```json
{
  "message": "Invalid credentials"
}
```

#### 404 Not Found

```json
{
  "message": "User not found",
  "success": false
}
```

**Postman tests**

```javascript
pm.test('Status is 200', () => pm.response.to.have.status(200));
pm.expect(pm.response.json().message).to.eql('Password changed successfully');
```

### PUT /api/auth/me

**Update Current User (me)** - Private

**Private.** Updates the profile of the authenticated user.

**Middleware:** `authenticate`.

**Body fields**
| Field | Type | Applies to | Notes |
|---|---|---|---|
| first_name | string | user | |
| last_name | string | user | |
| middle_name | string | user | |
| email | string | user | must be unique |
| address | string | user | |
| gender | string | user | enum `male` \| `female` \| `other` |
| dob | string | student | `YYYY-MM-DD` (`DATEONLY`) |
| guardian_name | string | student | |
| guardian_email | string | student | valid email |
| guardian_phone | string | student | numeric |
| bio | string | instructor | |
| specialization | string | instructor | |
| years_experience | string | instructor | |

**Quirk:** the user fields are written unconditionally, so any field you omit is set to `undefined` -> `null` on the user row. Always send the complete set of fields you want to keep.

**Response:** `200` with the updated user (password removed). The nested `student` / `instructor` sub-profile in the response is the **pre-update** snapshot, because the controller updates the sub-profile with a separate query after loading the user.

**Request body**

```json
{
  "first_name": "Ada",
  "last_name": "Lovelace",
  "middle_name": null,
  "email": "ada.lovelace@example.com",
  "address": "1 Analytical Way",
  "gender": "female",
  "dob": "2002-04-15",
  "guardian_name": "Charles Babbage",
  "guardian_email": "guardian@example.com",
  "guardian_phone": "08012345678"
}
```

**Responses**

#### 200 OK

```json
{
  "message": "User Profile updated successfully",
  "data": {
    "id": 1,
    "first_name": "Ada",
    "last_name": "Lovelace",
    "middle_name": null,
    "profile_pic": null,
    "email": "ada.lovelace@example.com",
    "address": "1 Analytical Way",
    "role": "student",
    "is_active": true,
    "gender": "female",
    "otp": null,
    "otp_expires_at": null,
    "created_at": "2026-01-01T09:00:00.000Z",
    "updated_at": "2026-02-01T09:00:00.000Z",
    "student": {
      "id": 1,
      "dob": "2002-04-15",
      "guardian_name": "Charles Babbage",
      "guardian_email": "guardian@example.com",
      "guardian_phone": "08012345678"
    }
  },
  "success": true
}
```

#### 404 Not Found

```json
{
  "message": "User not found",
  "success": false
}
```

#### 404 Not Found

```json
{
  "message": "Student not found",
  "success": false
}
```

#### 404 Not Found

```json
{
  "message": "Instructor not found",
  "success": false
}
```

### GET /api/auth/me

**Get Current User (me)** - Private

**Private.** Returns the profile of the authenticated user, including the related `student` / `instructor` sub-profile.

**Middleware:** `authenticate`.

The password column is excluded by the middleware, and `otp` / `otp_expires_at` are still returned by the model (they are only cleared after a password reset).

**Responses**

#### 200 OK

```json
{
  "message": "User fetched successfully",
  "data": {
    "id": 1,
    "first_name": "Ada",
    "last_name": "Lovelace",
    "middle_name": null,
    "profile_pic": null,
    "email": "student@example.com",
    "address": "1 Analytical Way",
    "role": "student",
    "is_active": true,
    "gender": "female",
    "otp": null,
    "otp_expires_at": null,
    "created_at": "2026-01-01T09:00:00.000Z",
    "updated_at": "2026-01-01T09:00:00.000Z",
    "student": {
      "id": 1,
      "dob": "2002-04-15",
      "guardian_name": "Charles Babbage",
      "guardian_email": "guardian@example.com",
      "guardian_phone": "08012345678"
    }
  },
  "success": true
}
```

#### 401 Unauthorized

```json
{
  "message": "Unauthorized, Authentication token not found"
}
```

#### 401 Unauthorized

```json
{
  "message": "Authentication token expired"
}
```

#### 403 Forbidden

```json
{
  "message": "Invalid authentication token"
}
```

#### 401 Unauthorized

```json
{
  "message": "Unauthorized, Invalid or inactive user"
}
```

### PUT /api/auth/profile-picture

**Upload Profile Picture** - Private

**Private.** Uploads a new profile picture for the authenticated user.

**Middleware:** `authenticate` -> `multer.single('profile_picture')`.

**Request type:** `multipart/form-data` with a single file field named **`profile_picture`**.
Do not set `Content-Type` manually - Postman adds the multipart boundary automatically.

**Storage** (`config/upload.js`)
- Destination is chosen from `req.user.role` + the URL containing `profile-picture`:
  - admin -> `./uploads/admin/profile-pictures/`
  - instructor -> `./uploads/instructor/profile-pictures/`
  - student -> `./uploads/student/profile-pictures/`
  - otherwise -> `./uploads/`
- Filename: `<base32 timestamp><random>` + the extension taken from the mimetype.
- The folder is created recursively if it does not exist.
- The stored relative path is written to `users.profile_pic` and returned in the response.
- `uploads` is served statically, so the file is reachable at `http://<host>:<port>/<profile_pic>`.

**Validation:** no file -> `400 {"message":"Profile picture is required"}`.

**Request body** (`multipart/form-data`)

| Field | Type | Description |
|---|---|---|
| `profile_picture` | file | Image file. The mimetype extension is used as the file extension. |

**Responses**

#### 200 OK

```json
{
  "message": "Profile picture changed successfully",
  "data": {
    "id": 1,
    "first_name": "Ada",
    "last_name": "Lovelace",
    "email": "student@example.com",
    "role": "student",
    "profile_pic": "uploads/student/profile-pictures/1k5a0skjgs0ghl1juh34.png"
  },
  "success": true
}
```

#### 400 Bad Request

```json
{
  "message": "Profile picture is required",
  "success": false
}
```

#### 401 Unauthorized

```json
{
  "message": "Unauthorized",
  "success": false
}
```

---

## Users

Base user records (`users` table) - registration, listing and CRUD.

### GET /api/users

**Get All Users** - Public

**Public (no middleware).** Returns a paginated list of users.

**Query params**
| Param | Type | Default | Notes |
|---|---|---|---|
| page | number | 1 | 1-based page number |
| limit | number | 20 | page size |

**Response notes**
- `password`, `created_at` and `updated_at` are excluded from `data`.
- The pagination object uses the keys `total`, `page`, `per_page`, `total_page` (note: different from the other resources, which use `totalItems`/`currentPage`/etc.).
- `total_page` is computed with `Math.ceil(count / limit)` where `limit` is still the **string** from the query, so a non-numeric `limit` yields `NaN`.

**Query parameters**

| Key | Example | Description |
|---|---|---|
| `page` | 1 | 1-based page number |
| `limit` | 20 | Page size (default 20) |

**Responses**

#### 200 OK

```json
{
  "message": "Users fetched successfully",
  "data": [
    {
      "id": 1,
      "first_name": "Ada",
      "last_name": "Lovelace",
      "middle_name": null,
      "profile_pic": null,
      "email": "student@example.com",
      "address": "1 Analytical Way",
      "role": "student",
      "is_active": true,
      "gender": "female",
      "otp": null,
      "otp_expires_at": null
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "per_page": 20,
    "total_page": 1
  },
  "success": true
}
```

### GET /api/users/:id

**Get User By ID** - Public

**Public (no middleware).** Returns a single user by primary key.

**Path param:** `id` (integer, required).

**Note:** unlike `GET /api/users`, this endpoint does **not** exclude the `password` column - the full user record (including the bcrypt hash) is returned. Treat this as a security defect and do not expose it outside a trusted environment.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "User fetched successfully",
  "data": {
    "id": 1,
    "first_name": "Ada",
    "last_name": "Lovelace",
    "email": "student@example.com",
    "role": "student",
    "is_active": true,
    "gender": "female",
    "password": "$2b$10$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMN"
  },
  "success": true
}
```

#### 404 Not Found

```json
{
  "message": "User not found"
}
```

### POST /api/users

**Create User** - Public

**Public (no middleware).** Creates a user record.

**Body fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| first_name | string | yes | `notNull` + `notEmpty` |
| last_name | string | yes | `notNull` + `notEmpty` |
| middle_name | string | no | - |
| email | string | yes | must be a valid email, unique (`users_email_unique`) |
| password | string | yes | 6-20 chars; hashed by a `beforeCreate` bcrypt hook |
| address | string | no | - |
| role | string | no | enum `student` \| `instructor` \| `admin`, default `student` |
| is_active | boolean | no | default `true` |
| gender | string | yes | enum `male` \| `female` \| `other` |

**Error handling:** Sequelize validation errors are caught by the controller and returned as `500`. The global error handler in `app.js` maps unhandled `SequelizeValidationError` to `400 {"message":"<validation message>"}` - but the controller's own `try/catch` intercepts them first, so a duplicate email or a bad gender actually surfaces as `500`.

**Request body**

```json
{
  "first_name": "Grace",
  "last_name": "Hopper",
  "middle_name": "Murray",
  "email": "grace.hopper@example.com",
  "password": "secret123",
  "address": "2 Compiler Road",
  "role": "student",
  "is_active": true,
  "gender": "female"
}
```

**Responses**

#### 201 Created

```json
{
  "message": "User created successfully",
  "data": {
    "id": 2,
    "first_name": "Grace",
    "last_name": "Hopper",
    "email": "grace.hopper@example.com",
    "role": "student",
    "is_active": true,
    "gender": "female"
  },
  "success": true
}
```

#### 500 Internal Server Error

```json
{
  "message": "Internal server error",
  "error": "SequelizeValidationError"
}
```

### PUT /api/users/:id

**Update User** - Private

**Private.** Updates a user record.

**Middleware:** `authenticate` -> `authorize('admin', 'instructor', 'student')`.

**Path param:** `id` (integer, required).

**Body fields**
| Field | Type | Notes |
|---|---|---|
| first_name | string | |
| last_name | string | |
| middle_name | string | |
| email | string | must stay unique |
| address | string | |
| role | string | enum `student` \| `instructor` \| `admin` |
| is_active | boolean | set `false` to deactivate the account |
| gender | string | enum `male` \| `female` \| `other` |
| password | string | optional; 6-20 chars; re-hashed by the `beforeUpdate` hook |

**Behaviour notes**
- Every listed field is written on every call, so **omitting a field clears it** (it is set to `undefined`/empty). Send the full record to preserve values.
- `authorize` only checks the caller's **role**, not ownership - any authenticated student or instructor can update any user, including changing `role` to `admin`. This is an authorization defect.
- Unknown id -> `404 {"message":"User not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Request body**

```json
{
  "first_name": "Ada",
  "last_name": "Lovelace",
  "middle_name": "Byron",
  "email": "ada.lovelace@example.com",
  "address": "1 Analytical Way",
  "role": "student",
  "is_active": true,
  "gender": "female",
  "password": "secret123"
}
```

**Responses**

#### 200 OK

```json
{
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "first_name": "Ada",
    "last_name": "Lovelace",
    "email": "ada.lovelace@example.com",
    "role": "student",
    "is_active": true,
    "gender": "female"
  },
  "success": true
}
```

#### 404 Not Found

```json
{
  "message": "User not found"
}
```

#### 403 Forbidden

```json
{
  "message": "Forbidden, You do not have permission to access this resource.Required [admin, instructor, student]"
}
```

### DELETE /api/users/:id

**Delete User** - Private (admin only)

**Private (admin only).** Deletes a user record.

**Middleware:** `authenticate` -> `authorize('admin')`.

**Path param:** `id` (integer, required).

Related `students` / `instructors` rows are removed by the `CASCADE` foreign keys. Unknown id -> `404 {"message":"User not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "User deleted successfully",
  "success": true
}
```

#### 404 Not Found

```json
{
  "message": "User not found"
}
```

#### 403 Forbidden

```json
{
  "message": "Forbidden, You do not have permission to access this resource.Required [admin]"
}
```

---

## Students

Student profiles (`students` table) linked to a user account.

### POST /api/students/register

**Register Student** - Public

**Public.** Creates the `users` row **and** the `students` profile in a single transaction.

**Body fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| first_name | string | yes | |
| last_name | string | yes | |
| middle_name | string | no | |
| email | string | yes | unique, valid email |
| password | string | yes | 6-20 characters, hashed by the `beforeCreate` hook |
| gender | string | yes | enum `male` \| `female` \| `other` |
| dob | string | yes | `YYYY-MM-DD` |
| address | string | no | |
| guardian_name | string | yes | |
| guardian_email | string | yes | valid email |
| guardian_phone | string | yes | numeric string |

**Response:** `201` with the student profile including the joined `user` object (`id`, `password`, `created_at`, `updated_at` excluded). Validation errors are rolled back and returned as `500 {"message":"Internal server error"}`.

**Request body**

```json
{
  "first_name": "Ada",
  "last_name": "Lovelace",
  "middle_name": "Byron",
  "email": "ada.lovelace@example.com",
  "password": "secret123",
  "gender": "female",
  "dob": "2002-04-15",
  "address": "1 Analytical Way",
  "guardian_name": "Charles Babbage",
  "guardian_email": "guardian@example.com",
  "guardian_phone": "08012345678"
}
```

**Responses**

#### 201 Created

```json
{
  "message": "Student created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "dob": "2002-04-15",
    "guardian_name": "Charles Babbage",
    "guardian_email": "guardian@example.com",
    "guardian_phone": "08012345678",
    "created_at": "2026-01-01T09:00:00.000Z",
    "updated_at": "2026-01-01T09:00:00.000Z",
    "user": {
      "first_name": "Ada",
      "last_name": "Lovelace",
      "middle_name": "Byron",
      "email": "ada.lovelace@example.com",
      "role": "student",
      "is_active": true,
      "gender": "female"
    }
  }
}
```

#### 500 Internal Server Error

```json
{
  "message": "Internal server error"
}
```

### GET /api/students

**Get All Students** - Public

**Public.** Returns a paginated list of student profiles with their joined `user` object (`id`, `password`, `created_at`, `updated_at` excluded).

**Query params:** `page` (default `1`), `limit` (default `10`).

**Response notes**
- Ordered by `created_at DESC`.
- Pagination keys: `totalItems`, `totalPages`, `currentPage`, `perPage`.
- The controller's `catch` block is empty, so a database error results in a **hung request** with no response instead of a `500`.

**Query parameters**

| Key | Example | Description |
|---|---|---|
| `page` | 1 | 1-based page number |
| `limit` | 10 | Page size (default 10) |

**Responses**

#### 200 OK

```json
{
  "message": "Students fetched successfully",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "dob": "2002-04-15",
      "guardian_name": "Charles Babbage",
      "guardian_email": "guardian@example.com",
      "guardian_phone": "08012345678",
      "user": {
        "first_name": "Ada",
        "last_name": "Lovelace",
        "email": "ada.lovelace@example.com",
        "role": "student",
        "is_active": true,
        "gender": "female"
      }
    }
  ],
  "pagination": {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1,
    "perPage": 10
  }
}
```

### GET /api/students/:id

**Get Student By ID** - Public

**Public.** Returns a single student profile (with its `user` object) by the **student profile id** (not the user id).

**Path param:** `id` (integer, required).

Unknown id -> `404 {"message":"Student not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "Student fetched successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "dob": "2002-04-15",
    "guardian_name": "Charles Babbage",
    "guardian_email": "guardian@example.com",
    "guardian_phone": "08012345678",
    "user": {
      "first_name": "Ada",
      "last_name": "Lovelace",
      "email": "ada.lovelace@example.com",
      "role": "student",
      "is_active": true,
      "gender": "female"
    }
  }
}
```

#### 404 Not Found

```json
{
  "message": "Student not found"
}
```

### POST /api/students

**Create Student Profile** - Private (admin only)

**Private (admin only).** Creates a student profile for an **existing** user (the user row must already exist and have `role: "student"`).

**Middleware:** `authenticate` -> `authorize('admin')`.

**Body fields**
| Field | Type | Notes |
|---|---|---|
| user_id | int | required, must reference an existing `student` user |
| dob | string | required, `YYYY-MM-DD` |
| guardian_name | string | required |
| guardian_email | string | required, valid email |
| guardian_phone | string | required, numeric string |

**Validation**
- Any field missing -> `400 {"message":"All fields are required"}`.
- Unknown user -> `404 {"message":"User not found"}`.
- User role is not `student` -> `400 {"message":"User is not student"}`.
- Profile already exists -> `400 {"message":"Student profile already exists"}`.

**Request body**

```json
{
  "user_id": 1,
  "dob": "2002-04-15",
  "guardian_name": "Charles Babbage",
  "guardian_email": "guardian@example.com",
  "guardian_phone": "08012345678"
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Student created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "dob": "2002-04-15",
    "guardian_name": "Charles Babbage",
    "guardian_email": "guardian@example.com",
    "guardian_phone": "08012345678",
    "user": {
      "first_name": "Ada",
      "last_name": "Lovelace",
      "email": "ada.lovelace@example.com",
      "role": "student"
    }
  }
}
```

#### 400 Bad Request

```json
{
  "message": "All fields are required"
}
```

#### 400 Bad Request

```json
{
  "message": "User is not student"
}
```

#### 400 Bad Request

```json
{
  "message": "Student profile already exists"
}
```

#### 404 Not Found

```json
{
  "message": "User not found"
}
```

### PUT /api/students/:id

**Update Student Profile** - Private (admin only)

**Private (admin only).** Updates a student profile.

**Middleware:** `authenticate` -> `authorize('admin')`.

**Path param:** `id` (integer, required) - the student profile id.

**Body fields:** `dob`, `guardian_name`, `guardian_email`, `guardian_phone`. All are written on every call, so omitted fields are cleared.

Unknown id -> `404 {"message":"Student not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Request body**

```json
{
  "dob": "2002-04-16",
  "guardian_name": "Charles Babbage",
  "guardian_email": "guardian@example.com",
  "guardian_phone": "08012345678"
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Student updated successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "dob": "2002-04-16",
    "guardian_name": "Charles Babbage",
    "guardian_email": "guardian@example.com",
    "guardian_phone": "08012345678"
  }
}
```

#### 404 Not Found

```json
{
  "message": "Student not found"
}
```

### DELETE /api/students/:id

**Delete Student Profile** - Private (admin only)

**Private (admin only).** Deletes a student profile.

**Middleware:** `authenticate` -> `authorize('admin')`.

**Path param:** `id` (integer, required) - the student profile id.

The linked `users` row is **not** deleted. The response echoes the deleted row. Unknown id -> `404 {"message":"Student not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "Student deleted successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "dob": "2002-04-15"
  }
}
```

#### 404 Not Found

```json
{
  "message": "Student not found"
}
```

---

## Instructors

Instructor profiles (`instructors` table) and instructor-course links.

### POST /api/instructors/register

**Register Instructor** - Public

**Public.** Creates the `users` row **and** the `instructors` profile in a single transaction.

**Body fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| first_name | string | yes | |
| last_name | string | yes | |
| middle_name | string | no | |
| email | string | yes | unique, valid email |
| password | string | yes | 6-20 characters, hashed by the `beforeCreate` hook |
| gender | string | yes | enum `male` \| `female` \| `other` |
| bio | string | no | |
| address | string | no | |
| specialization | string | yes | |
| years_experience | string | yes | model column is a `STRING` |

**Response:** `201` with the instructor profile including the joined `user` object (`id`, `password`, `created_at`, `updated_at` excluded). Validation errors are rolled back and returned as `500 {"message":"Internal server error"}`.

**Request body**

```json
{
  "first_name": "Grace",
  "last_name": "Hopper",
  "middle_name": "Murray",
  "email": "grace.hopper@example.com",
  "password": "secret123",
  "gender": "female",
  "bio": "Computer scientist and US Navy rear admiral.",
  "address": "2 Compiler Lane",
  "specialization": "Compilers and Distributed Systems",
  "years_experience": "25"
}
```

**Responses**

#### 201 Created

```json
{
  "message": "Instructor created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "bio": "Computer scientist and US Navy rear admiral.",
    "specialization": "Compilers and Distributed Systems",
    "years_experience": "25",
    "created_at": "2026-01-01T09:00:00.000Z",
    "updated_at": "2026-01-01T09:00:00.000Z",
    "user": {
      "first_name": "Grace",
      "last_name": "Hopper",
      "middle_name": "Murray",
      "email": "grace.hopper@example.com",
      "role": "instructor",
      "is_active": true,
      "gender": "female"
    }
  }
}
```

#### 500 Internal Server Error

```json
{
  "message": "Internal server error"
}
```

### GET /api/instructors

**Get All Instructors** - Public

**Public.** Returns a paginated list of instructor profiles with their joined `user` object (`id`, `password`, `created_at`, `updated_at` excluded).

**Query params:** `page` (default `1`), `limit` (default `10`).

**Response notes**
- Ordered by `created_at DESC`.
- Pagination keys: `totalItems`, `totalPages`, `currentPage`, `perPage`.
- The controller's `catch` block is empty, so a database error results in a **hung request** with no response instead of a `500`.

**Query parameters**

| Key | Example | Description |
|---|---|---|
| `page` | 1 | 1-based page number |
| `limit` | 10 | Page size (default 10) |

**Responses**

#### 200 OK

```json
{
  "message": "Instructors fetched successfully",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "bio": "Computer scientist and US Navy rear admiral.",
      "specialization": "Compilers and Distributed Systems",
      "years_experience": "25",
      "user": {
        "first_name": "Grace",
        "last_name": "Hopper",
        "email": "grace.hopper@example.com",
        "role": "instructor",
        "is_active": true,
        "gender": "female"
      }
    }
  ],
  "pagination": {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1,
    "perPage": 10
  }
}
```

### GET /api/instructors/:id

**Get Instructor By ID** - Public

**Public.** Returns a single instructor profile (with its `user` object) by the **instructor profile id** (not the user id).

**Path param:** `id` (integer, required).

Unknown id -> `404 {"message":"Instructor not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "Instructor fetched successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "bio": "Computer scientist and US Navy rear admiral.",
    "specialization": "Compilers and Distributed Systems",
    "years_experience": "25",
    "user": {
      "first_name": "Grace",
      "last_name": "Hopper",
      "email": "grace.hopper@example.com",
      "role": "instructor",
      "is_active": true,
      "gender": "female"
    }
  }
}
```

#### 404 Not Found

```json
{
  "message": "Instructor not found"
}
```

### POST /api/instructors

**Create Instructor Profile** - Private (admin only)

**Private (admin only).** Creates an `instructors` profile for an **existing** user.

**Middleware:** `authenticate` -> `authorize('admin')`.

**Body fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| user_id | integer | yes | id of the user row |
| bio | string | no | |
| specialization | string | yes | |
| years_experience | string | yes | model column is a `STRING` |

**Responses**
- `400 {"message":"All fields are required"}` - `user_id`, `specialization` or `years_experience` missing.
- `404 {"message":"User not found"}` - no user with that id.
- `400 {"message":"User is not instructor"}` - the user's role is not `instructor`.
- `400 {"message":"Instructor profile already exists"}` - one profile already exists for that user.

Everything runs inside a transaction, so a failure rolls the whole thing back.

**Request body**

```json
{
  "user_id": 1,
  "bio": "Computer scientist and US Navy rear admiral.",
  "specialization": "Compilers and Distributed Systems",
  "years_experience": "25"
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Instructor created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "bio": "Computer scientist and US Navy rear admiral.",
    "specialization": "Compilers and Distributed Systems",
    "years_experience": "25",
    "user": {
      "first_name": "Grace",
      "last_name": "Hopper",
      "email": "grace.hopper@example.com",
      "role": "instructor",
      "is_active": true,
      "gender": "female"
    }
  }
}
```

#### 400 Bad Request

```json
{
  "message": "All fields are required"
}
```

#### 404 Not Found

```json
{
  "message": "User not found"
}
```

#### 400 Bad Request

```json
{
  "message": "User is not instructor"
}
```

#### 400 Bad Request

```json
{
  "message": "Instructor profile already exists"
}
```

#### 403 Forbidden

```json
{
  "message": "Forbidden, You do not have permission to access this resource.Required [admin]"
}
```

### PUT /api/instructors/:id

**Update Instructor Profile** - Private (admin or instructor)

**Private (admin or instructor).** Updates an instructor profile.

**Middleware:** `authenticate` -> `authorize('admin', 'instructor')`.

**Path param:** `id` (integer, required) - the instructor profile id.

**Body fields:** `bio`, `specialization`, `years_experience`.

**Behaviour notes**
- All three fields are written unconditionally, so **omitting a field clears it**. Send the full record to preserve values.
- `authorize` only checks the caller's role - it does **not** verify that the instructor owns the profile being updated. Any instructor can update any instructor profile. This is an authorization defect.
- Unknown id -> `404 {"message":"Instructor not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Request body**

```json
{
  "bio": "Computer scientist and US Navy rear admiral.",
  "specialization": "Compilers and Distributed Systems",
  "years_experience": "25"
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Instructor updated successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "bio": "Computer scientist and US Navy rear admiral.",
    "specialization": "Compilers and Distributed Systems",
    "years_experience": "25"
  }
}
```

#### 404 Not Found

```json
{
  "message": "Instructor not found"
}
```

#### 403 Forbidden

```json
{
  "message": "Forbidden, You do not have permission to access this resource.Required [admin, instructor]"
}
```

### GET /api/instructors/:id/courses

**Get Instructor Courses** - Public

**Public.** Returns the courses assigned to an instructor.

**Path param:** `id` (integer, required) - the instructor profile id.

Unknown instructor id -> `404 {"message":"Instructor not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "Courses fetched successfully",
  "data": [
    {
      "id": 1,
      "title": "Introduction to Programming",
      "code": "CS101",
      "description": "Fundamentals of programming using JavaScript.",
      "duration": "8 weeks",
      "is_active": true
    }
  ]
}
```

#### 404 Not Found

```json
{
  "message": "Instructor not found"
}
```

### DELETE /api/instructors/:id

**Delete Instructor Profile** - Private (admin only)

**Private (admin only).** Deletes an instructor profile.

**Middleware:** `authenticate` -> `authorize('admin')`.

**Path param:** `id` (integer, required) - the instructor profile id.

The associated `users` row is **not** deleted, and the `instructor_courses` join rows are removed by the `CASCADE` foreign key.

Unknown id -> `404 {"message":"Instructor not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "Instructor deleted successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "bio": "Computer scientist and US Navy rear admiral.",
    "specialization": "Compilers and Distributed Systems",
    "years_experience": "25"
  }
}
```

#### 404 Not Found

```json
{
  "message": "Instructor not found"
}
```

#### 403 Forbidden

```json
{
  "message": "Forbidden, You do not have permission to access this resource.Required [admin]"
}
```

### POST /api/instructors/:id/courses

**Attach Courses to Instructor** - Private (admin only)

**Private (admin only).** Assigns courses to an instructor through the `instructor_courses` join table.

**Middleware:** `authenticate` -> `authorize('admin')`.

**Path param:** `id` (integer, required) - the instructor profile id.

**Body fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| coursesInfo | array | yes | array of course descriptors |
| coursesInfo[].course_id | integer | yes | id of the course to attach |
| coursesInfo[].assigned_at | string | no | ISO date; defaults to `new Date()` |

**Responses**
- `404 {"message":"Instructor not found"}`.
- `400 {"message":"Some courses do not exist", "missingCourseIds":[...]}` - one or more `course_id`s have no matching course row.
- `400 {"message":"Some courses already attached to this instructor", "duplicateCourseIds":[...]}`.

**Quirk:** the controller calls `coursesInfo.map(...)` without validating the body, so a missing/non-array `coursesInfo` throws and returns `500 {"message":"Internal Server error"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Request body**

```json
{
  "coursesInfo": [
    {
      "course_id": 1,
      "assigned_at": "2026-01-01T09:00:00.000Z"
    },
    {
      "course_id": 2
    }
  ]
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Courses attached successfully",
  "data": [
    {
      "id": 1,
      "instructor_id": 1,
      "course_id": 1,
      "assigned_at": "2026-01-01T09:00:00.000Z",
      "created_at": "2026-01-01T09:00:00.000Z",
      "updated_at": "2026-01-01T09:00:00.000Z"
    }
  ]
}
```

#### 400 Bad Request

```json
{
  "message": "Some courses do not exist",
  "missingCourseIds": [
    99
  ]
}
```

#### 400 Bad Request

```json
{
  "message": "Some courses already attached to this instructor",
  "duplicateCourseIds": [
    1
  ]
}
```

#### 404 Not Found

```json
{
  "message": "Instructor not found"
}
```

#### 403 Forbidden

```json
{
  "message": "Forbidden, You do not have permission to access this resource.Required [admin]"
}
```

### DELETE /api/instructors/:id/courses

**Detach Courses from Instructor** - Private (admin only)

**Private (admin only).** Removes course assignments from an instructor.

**Middleware:** `authenticate` -> `authorize('admin')`.

**Path param:** `id` (integer, required) - the instructor profile id.

**Body fields:** `courseIds` (array of integers, required).

**Responses**
- `404 {"message":"Instructor not found"}`.
- `400 {"message":"Please provide an array of course ids"}` - `courseIds` is missing, not an array, or empty.
- `400 {"message":"No courses found to detach"}` - none of the given ids are currently attached to the instructor.

**Note:** the request body is required even though the route is a `DELETE` - in Postman select **raw / JSON** as the body type.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Request body**

```json
{
  "courseIds": [
    1,
    2
  ]
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Courses detached successfully",
  "data": [
    {
      "id": 1,
      "instructor_id": 1,
      "course_id": 1,
      "assigned_at": "2026-01-01T09:00:00.000Z"
    }
  ]
}
```

#### 400 Bad Request

```json
{
  "message": "Please provide an array of course ids"
}
```

#### 400 Bad Request

```json
{
  "message": "No courses found to detach"
}
```

#### 404 Not Found

```json
{
  "message": "Instructor not found"
}
```

#### 403 Forbidden

```json
{
  "message": "Forbidden, You do not have permission to access this resource.Required [admin]"
}
```

---

## Programs

Programs (`programs` table) and the program-course join table.

### GET /api/programs

**Get All Programs** - Public

**Public.** Returns a paginated list of **active** programs, newest first.

**Query params:** `page` (default `1`), `limit` (default `10`).

**Response notes**
- Filtered with `where: { is_active: true }`; ordered by `created_at DESC`.
- Pagination keys: `total`, `page`, `limit`, `totalPages`.
- `tuition` is a `DECIMAL(10,2)` and is serialised as a string by Sequelize.

**Query parameters**

| Key | Example | Description |
|---|---|---|
| `page` | 1 | 1-based page number |
| `limit` | 10 | Page size (default 10) |

**Responses**

#### 200 OK

```json
{
  "message": "Programs fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Full Stack Web Development",
      "description": "6-month intensive web development program.",
      "program_code": "FSWD-01",
      "tuition": "250000.00",
      "is_active": true,
      "created_at": "2026-01-01T09:00:00.000Z",
      "updated_at": "2026-01-01T09:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": "1",
    "limit": "10",
    "totalPages": 1
  }
}
```

### GET /api/programs/:id

**Get Program By ID** - Public

**Public.** Returns a single program by primary key.

**Path param:** `id` (integer, required).

This endpoint does **not** filter on `is_active`, so an inactive program is still returned. Unknown id -> `404 {"message":"Program not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "Program fetched successfully",
  "data": {
    "id": 1,
    "name": "Full Stack Web Development",
    "description": "6-month intensive web development program.",
    "program_code": "FSWD-01",
    "tuition": "250000.00",
    "is_active": true,
    "created_at": "2026-01-01T09:00:00.000Z",
    "updated_at": "2026-01-01T09:00:00.000Z"
  }
}
```

#### 404 Not Found

```json
{
  "message": "Program not found"
}
```

### POST /api/programs

**Create Program** - Private (admin only)

**Private (admin only).** Creates a program.

**Middleware:** `authenticate` -> `authorize('admin')`.

**Body fields**
| Field | Type | Notes |
|---|---|---|
| name | string | required, not empty |
| program_code | string | required, unique (`program_code_unique`) |
| description | string | required, not empty |
| tuition | number | required, decimal |
| is_active | boolean | optional (model default `true`) |

**Response:** `200` (not `201`) with `message: "Program created successfully"`. Model validation errors are caught by the controller and returned as `500 {"message":"Internal Server error"}`.

**Request body**

```json
{
  "name": "Full Stack Web Development",
  "program_code": "FSWD-01",
  "description": "6-month intensive web development program.",
  "tuition": 250000,
  "is_active": true
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Program created successfully",
  "data": {
    "id": 1,
    "name": "Full Stack Web Development",
    "program_code": "FSWD-01",
    "description": "6-month intensive web development program.",
    "tuition": "250000.00",
    "is_active": true,
    "created_at": "2026-01-01T09:00:00.000Z",
    "updated_at": "2026-01-01T09:00:00.000Z"
  }
}
```

#### 500 Internal Server Error

```json
{
  "message": "Internal Server error"
}
```

### PUT /api/programs/:id

**Update Program** - Private (admin only)

**Private (admin only).** Updates a program.

**Middleware:** `authenticate` -> `authorize('admin')`.

**Path param:** `id` (integer, required).

**Body fields:** `name`, `program_code`, `description`, `tuition`, `is_active` - the same set as create. All of them are written on every call, so omitted fields are cleared. Unknown id -> `404 {"message":"Program not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Request body**

```json
{
  "name": "Full Stack Web Development",
  "program_code": "FSWD-01",
  "description": "6-month intensive web development program.",
  "tuition": 275000,
  "is_active": true
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Program updated successfully",
  "data": {
    "id": 1,
    "name": "Full Stack Web Development",
    "program_code": "FSWD-01",
    "tuition": "275000.00",
    "is_active": true,
    "updated_at": "2026-02-01T09:00:00.000Z"
  }
}
```

#### 404 Not Found

```json
{
  "message": "Program not found"
}
```

### DELETE /api/programs/:id

**Delete Program** - Private (admin only)

**Private (admin only).** Deletes a program.

**Middleware:** `authenticate` -> `authorize('admin')`.

**Path param:** `id` (integer, required).

Enrolments and `program_courses` rows are removed by the `CASCADE` foreign keys. Unknown id -> `404 {"message":"Program not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "Program deleted successfully"
}
```

#### 404 Not Found

```json
{
  "message": "Program not found"
}
```

### GET /api/programs/:id/courses

**Get Program Courses** - Public

**Public.** Returns the courses attached to a program.

**Path param:** `id` (integer, required) - the program id.

Unknown program id -> `404 {"message":"Program not found"}`. The response contains the plain `courses` rows (no join-table data such as `sequence`/`is_required`).

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "Courses fetched successfully",
  "data": [
    {
      "id": 1,
      "title": "Introduction to Programming",
      "code": "CS101",
      "description": "Fundamentals of programming using JavaScript.",
      "duration": "8 weeks",
      "is_active": true
    }
  ]
}
```

#### 404 Not Found

```json
{
  "message": "Program not found"
}
```

### POST /api/programs/:id/courses

**Attach Courses to Program** - Private (admin only)

**Private (admin only).** Attaches courses to a program.

**Middleware:** `authenticate` -> `authorize('admin')`.

**Path param:** `id` (integer, required) - the program id.

**Body:** `coursesInfo` - an **array** of objects, each with `course_id` (int), `sequence` (int) and `is_required` (boolean).

**Validation**
- Unknown course ids -> `400 {"message":"Some courses do not exist", "missingCourseIds":[...]}`.
- Courses already attached -> `400 {"message":"Some courses already attached to this program", "duplicateCourseIds":[...]}`.
- Missing `coursesInfo` throws inside the controller and returns `500`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Request body**

```json
{
  "coursesInfo": [
    {
      "course_id": 1,
      "sequence": 1,
      "is_required": true
    },
    {
      "course_id": 2,
      "sequence": 2,
      "is_required": false
    }
  ]
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Courses attached successfully",
  "data": [
    {
      "id": 1,
      "program_id": 1,
      "course_id": 1,
      "sequence": 1,
      "is_required": true
    },
    {
      "id": 2,
      "program_id": 1,
      "course_id": 2,
      "sequence": 2,
      "is_required": false
    }
  ]
}
```

#### 400 Bad Request

```json
{
  "message": "Some courses do not exist",
  "missingCourseIds": [
    99
  ]
}
```

#### 400 Bad Request

```json
{
  "message": "Some courses already attached to this program",
  "duplicateCourseIds": [
    1
  ]
}
```

#### 404 Not Found

```json
{
  "message": "Program not found"
}
```

### DELETE /api/programs/:id/courses

**Detach Courses from Program** - Public (no auth applied)

**Effectively public (security defect).** Detaches courses from a program.

**Middleware:** *none is registered on this route* - the `authenticate` / `authorize('admin')` middleware is missing here, so the endpoint is reachable **without a token** (security defect).

**Path param:** `id` (integer, required) - the program id.

**Body:** `courseIds` - an **array of course ids**.

**Validation**
- Empty / non-array `courseIds` -> `400 {"message":"Please provide an array of course ids"}`.
- None of the ids are attached -> `400 {"message":"No courses found to detach"}`.
- Unknown program id -> `404 {"message":"Program not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Request body**

```json
{
  "courseIds": [
    1,
    2
  ]
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Courses detached successfully",
  "data": [
    {
      "id": 1,
      "program_id": 1,
      "course_id": 1
    }
  ]
}
```

#### 400 Bad Request

```json
{
  "message": "Please provide an array of course ids"
}
```

#### 400 Bad Request

```json
{
  "message": "No courses found to detach"
}
```

#### 404 Not Found

```json
{
  "message": "Program not found"
}
```

---

## Courses

Courses (`courses` table) catalog.

### GET /api/courses

**Get All Courses** - Public

**Public.** Returns a paginated list of **active** courses, newest first.

**Query params**
| Param | Type | Default | Notes |
|---|---|---|---|
| page | number | 1 | 1-based page number |
| limit | number | 10 | page size |

**Response notes**
- Rows are filtered with `where: { is_active: true }` - inactive courses are never listed here.
- Ordered by `created_at DESC`.
- The pagination object uses the keys `total`, `page`, `limit`, `totalPages`.

**Query parameters**

| Key | Example | Description |
|---|---|---|
| `page` | 1 | 1-based page number |
| `limit` | 10 | Page size (default 10) |

**Responses**

#### 200 OK

```json
{
  "message": "Courses fetched successfully",
  "data": [
    {
      "id": 1,
      "title": "Introduction to Programming",
      "code": "CS101",
      "description": "Fundamentals of programming using JavaScript.",
      "duration": "8 weeks",
      "is_active": true,
      "created_at": "2026-01-01T09:00:00.000Z",
      "updated_at": "2026-01-01T09:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": "1",
    "limit": "10",
    "totalPages": 1
  }
}
```

### GET /api/courses/:id

**Get Course By ID** - Public

**Public.** Returns a single course by primary key.

**Path param:** `id` (integer, required).

Unlike the list endpoint, this one does **not** filter on `is_active`, so an inactive course is still returned. Unknown id -> `404 {"message":"Course not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "Course fetched successfully",
  "data": {
    "id": 1,
    "title": "Introduction to Programming",
    "code": "CS101",
    "description": "Fundamentals of programming using JavaScript.",
    "duration": "8 weeks",
    "is_active": true,
    "created_at": "2026-01-01T09:00:00.000Z",
    "updated_at": "2026-01-01T09:00:00.000Z"
  }
}
```

#### 404 Not Found

```json
{
  "message": "Course not found"
}
```

### POST /api/courses

**Create Course** - Private (admin only)

**Private (admin only).** Creates a course.

**Middleware:** `authenticate` -> `authorize('admin')`.

**Body fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| title | string | yes | not empty |
| code | string | yes | unique (`course_code_unique`) |
| description | string | yes | not empty |
| duration | string | yes | not empty, e.g. `"8 weeks"` |
| is_active | boolean | yes | the column has **no default**, so omitting it fails the `allowNull: false` check |

**Response:** `200` (not `201`) with `message: "Course created successfully"`. Validation errors are caught by the controller and returned as `500 {"message":"Internal Server error"}`.

**Request body**

```json
{
  "title": "Introduction to Programming",
  "code": "CS101",
  "description": "Fundamentals of programming using JavaScript.",
  "duration": "8 weeks",
  "is_active": true
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Course created successfully",
  "data": {
    "id": 1,
    "title": "Introduction to Programming",
    "code": "CS101",
    "description": "Fundamentals of programming using JavaScript.",
    "duration": "8 weeks",
    "is_active": true,
    "created_at": "2026-01-01T09:00:00.000Z",
    "updated_at": "2026-01-01T09:00:00.000Z"
  }
}
```

#### 500 Internal Server Error

```json
{
  "message": "Internal Server error"
}
```

### PUT /api/courses/:id

**Update Course** - Private (admin only)

**Private (admin only).** Updates a course.

**Middleware:** `authenticate` -> `authorize('admin')`.

**Path param:** `id` (integer, required).

**Body fields:** `title`, `code`, `description`, `duration`, `is_active` - the same set as create. All of them are written on every call, so omitted fields are cleared and an omitted `is_active` becomes `null` (which fails the `allowNull` check).

Unknown id -> `404 {"message":"Course not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Request body**

```json
{
  "title": "Introduction to Programming",
  "code": "CS101",
  "description": "Fundamentals of programming using JavaScript.",
  "duration": "10 weeks",
  "is_active": true
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Course updated successfully",
  "data": {
    "id": 1,
    "title": "Introduction to Programming",
    "code": "CS101",
    "duration": "10 weeks",
    "is_active": true,
    "updated_at": "2026-02-01T09:00:00.000Z"
  }
}
```

#### 404 Not Found

```json
{
  "message": "Course not found"
}
```

### DELETE /api/courses/:id

**Delete Course** - Private (admin only)

**Private (admin only).** Deletes a course.

**Middleware:** `authenticate` -> `authorize('admin')`.

**Path param:** `id` (integer, required).

`program_courses` and `instructor_courses` rows are removed by the `CASCADE` foreign keys. Unknown id -> `404 {"message":"Course not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "Course deleted successfully"
}
```

#### 404 Not Found

```json
{
  "message": "Course not found"
}
```

---

## Enrolments

Student enrolments into programs (`enrolments` table).

### POST /api/enrolments/with-payment

**Enrol With Payment** - Private (student only)

**Private (student only).** Creates an enrolment **and** its payment in one transaction.

**Middleware:** `authenticate` -> `authorize('student')`.

**Body fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| user_id | int | yes | must belong to a user with `role: "student"` |
| program_id | int | yes | must exist |
| enrolment_date | string | yes | `YYYY-MM-DD` (`DATEONLY`) |
| status | string | no | enum `enrolled` \| `completed` \| `dropped` |
| enrolled_at | string | no | ISO timestamp (`DATE`) |
| amount | number | yes | decimal, `DECIMAL` |
| payment_date | string | yes | `YYYY-MM-DD` (`DATEONLY`) |
| payment_method | string | yes | enum `cash` \| `card` \| `bank_transfer` |
| payment_status | string | no | enum `pending` \| `completed` \| `failed` |

**Response:** `201` with the enrolment including `user`, `program` and `payments`.

**Validation**
- Unknown `user_id` or `program_id` -> `404 {"message":"User or program not found"}`.
- User is not a student -> `400 {"message":"User is not student"}`.
- Model validation errors -> `500 {"message":"Internal server error"}`.

**Request body**

```json
{
  "user_id": 1,
  "program_id": 1,
  "enrolment_date": "2026-02-01",
  "status": "enrolled",
  "enrolled_at": "2026-02-01T09:00:00.000Z",
  "amount": 250000,
  "payment_date": "2026-02-01",
  "payment_method": "card",
  "payment_status": "completed"
}
```

**Responses**

#### 201 Created

```json
{
  "message": "Enrolment with payment created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "program_id": 1,
    "enrolment_date": "2026-02-01",
    "status": "enrolled",
    "enrolled_at": "2026-02-01T09:00:00.000Z",
    "user": {
      "first_name": "Ada",
      "last_name": "Lovelace",
      "email": "ada.lovelace@example.com",
      "role": "student"
    },
    "program": {
      "name": "Full Stack Web Development",
      "program_code": "FSWD-01",
      "tuition": "250000.00",
      "is_active": true
    },
    "payments": [
      {
        "enrolment_id": 1,
        "amount": "250000.00",
        "payment_date": "2026-02-01",
        "payment_method": "card",
        "status": "completed"
      }
    ]
  }
}
```

#### 400 Bad Request

```json
{
  "message": "User is not student"
}
```

#### 404 Not Found

```json
{
  "message": "User or program not found"
}
```

### GET /api/enrolments

**Get All Enrolments** - Private (admin only)

**Private (admin only).** Returns a paginated list of enrolments.

**Middleware:** `authenticate` -> `authorize('admin')` (applied with `router.use`).

**Query params:** `page` (default `1`), `limit` (default `10`).

**Response notes**
- Each row includes `user`, `program` and `payments` associations (`password`, `id` and timestamps excluded from the nested objects).
- Ordered by `created_at DESC`.
- Pagination keys: `totalItems`, `totalPages`, `currentPage`, `perPage`.

**Query parameters**

| Key | Example | Description |
|---|---|---|
| `page` | 1 | 1-based page number |
| `limit` | 10 | Page size (default 10) |

**Responses**

#### 200 OK

```json
{
  "message": "Enrolments fetched successfully",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "program_id": 1,
      "enrolment_date": "2026-02-01",
      "status": "enrolled",
      "enrolled_at": "2026-02-01T09:00:00.000Z",
      "user": {
        "first_name": "Ada",
        "last_name": "Lovelace",
        "email": "ada.lovelace@example.com",
        "role": "student"
      },
      "program": {
        "name": "Full Stack Web Development",
        "program_code": "FSWD-01",
        "tuition": "250000.00",
        "is_active": true
      },
      "payments": []
    }
  ],
  "pagination": {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1,
    "perPage": 10
  }
}
```

### POST /api/enrolments

**Create Enrolment** - Private (admin only)

**Private (admin only).** Creates an enrolment for an existing student user.

**Middleware:** `authenticate` -> `authorize('admin')` (applied with `router.use`).

**Body fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| user_id | int | yes | must belong to a user with `role: "student"` |
| program_id | int | yes | must exist |
| enrolment_date | string | yes | `YYYY-MM-DD` (`DATEONLY`) |
| status | string | yes | enum `enrolled` \| `completed` \| `dropped` |
| enrolled_at | string | yes | ISO timestamp (`DATE`) |

**Validation**
- Any field missing -> `400 {"message":"All fields are required"}`.
- Unknown `user_id` -> `404 {"message":"User not found"}`.
- User is not a student -> `400 {"message":"User is not student"}`.
- Unknown `program_id` -> `404 {"message":"Program not found"}`.
- Model validation errors -> `500 {"message":"Internal server error"}`.

**Request body**

```json
{
  "user_id": 1,
  "program_id": 1,
  "enrolment_date": "2026-02-01",
  "status": "enrolled",
  "enrolled_at": "2026-02-01T09:00:00.000Z"
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Enrolment created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "program_id": 1,
    "enrolment_date": "2026-02-01",
    "status": "enrolled",
    "enrolled_at": "2026-02-01T09:00:00.000Z",
    "user": {
      "first_name": "Ada",
      "last_name": "Lovelace",
      "email": "ada.lovelace@example.com",
      "role": "student",
      "student": {
        "dob": "2002-04-15",
        "guardian_name": "Charles Babbage",
        "guardian_email": "guardian@example.com",
        "guardian_phone": "08012345678"
      }
    },
    "program": {
      "name": "Full Stack Web Development",
      "program_code": "FSWD-01",
      "tuition": "250000.00",
      "is_active": true
    }
  }
}
```

#### 400 Bad Request

```json
{
  "message": "All fields are required"
}
```

#### 400 Bad Request

```json
{
  "message": "User is not student"
}
```

#### 404 Not Found

```json
{
  "message": "User not found"
}
```

#### 404 Not Found

```json
{
  "message": "Program not found"
}
```

### GET /api/enrolments/:id

**Get Enrolment By ID** - Private (admin only)

**Private (admin only).** Returns a single enrolment with its `user`, `program` and `payments` associations.

**Middleware:** `authenticate` -> `authorize('admin')` (applied with `router.use`).

**Path param:** `id` (integer, required).

Unknown id -> `404 {"message":"Enrolment not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "Enrolment fetched successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "program_id": 1,
    "enrolment_date": "2026-02-01",
    "status": "enrolled",
    "enrolled_at": "2026-02-01T09:00:00.000Z",
    "user": {
      "first_name": "Ada",
      "last_name": "Lovelace",
      "email": "ada.lovelace@example.com",
      "role": "student"
    },
    "program": {
      "name": "Full Stack Web Development",
      "program_code": "FSWD-01",
      "tuition": "250000.00",
      "is_active": true
    },
    "payments": [
      {
        "enrolment_id": 1,
        "amount": "250000.00",
        "payment_date": "2026-02-01",
        "payment_method": "card",
        "status": "completed"
      }
    ]
  }
}
```

#### 404 Not Found

```json
{
  "message": "Enrolment not found"
}
```

### PUT /api/enrolments/:id

**Update Enrolment** - Private (admin only)

**Private (admin only).** Updates an enrolment.

**Middleware:** `authenticate` -> `authorize('admin')` (applied with `router.use`).

**Path param:** `id` (integer, required).

**Body fields:** `program_id`, `enrolment_date`, `status`, `enrolled_at` - all are written on every call, so omitted fields are cleared. `user_id` cannot be changed.

Unknown id -> `404 {"message":"Enrolment not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Request body**

```json
{
  "program_id": 1,
  "enrolment_date": "2026-02-01",
  "status": "completed",
  "enrolled_at": "2026-02-01T09:00:00.000Z"
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Enrolment updated successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "program_id": 1,
    "enrolment_date": "2026-02-01",
    "status": "completed",
    "enrolled_at": "2026-02-01T09:00:00.000Z"
  }
}
```

#### 404 Not Found

```json
{
  "message": "Enrolment not found"
}
```

### DELETE /api/enrolments/:id

**Delete Enrolment** - Private (admin only)

**Private (admin only).** Deletes an enrolment. Its payments are removed by the `CASCADE` foreign key on `payments.enrolment_id`.

**Middleware:** `authenticate` -> `authorize('admin')` (applied with `router.use`).

**Path param:** `id` (integer, required).

Unknown id -> `404 {"message":"Enrolment not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "Enrolment deleted successfully"
}
```

#### 404 Not Found

```json
{
  "message": "Enrolment not found"
}
```

---

## Payments

Payments recorded against enrolments (`payments` table).

### GET /api/payments

**Get All Payments** - Private (admin only)

**Private (admin only).** Returns a paginated list of payments.

**Middleware:** `authenticate` (via `router.use`) -> `authorize('admin')`.

**Query params:** `page` (default `1`), `limit` (default `10`).

**Response notes**
- Each payment embeds `enrolment`, which itself embeds `user` and `program` (`id`, `password` and timestamps are excluded from those nested objects).
- Ordered by `created_at DESC`.
- Pagination keys: `total`, `page`, `limit`, `totalPages`.

**Query parameters**

| Key | Example | Description |
|---|---|---|
| `page` | 1 | 1-based page number |
| `limit` | 10 | Page size (default 10) |

**Responses**

#### 200 OK

```json
{
  "message": "Payments fetched successfully",
  "data": [
    {
      "id": 1,
      "enrolment_id": 1,
      "amount": "250000.00",
      "payment_date": "2026-02-01",
      "payment_method": "card",
      "status": "completed",
      "enrolment": {
        "user_id": 1,
        "program_id": 1,
        "enrolment_date": "2026-02-01",
        "status": "enrolled",
        "enrolled_at": "2026-02-01T09:00:00.000Z",
        "user": {
          "first_name": "Ada",
          "last_name": "Lovelace",
          "email": "ada.lovelace@example.com",
          "role": "student"
        },
        "program": {
          "name": "Full Stack Web Development",
          "program_code": "FSWD-01",
          "tuition": "250000.00",
          "is_active": true
        }
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": "1",
    "limit": "10",
    "totalPages": 1
  }
}
```

### POST /api/payments

**Create Payment** - Private (any authenticated role)

**Private (any authenticated role).** Records a payment against an existing enrolment.

**Middleware:** `authenticate` only - the route has **no** `authorize(...)` guard, so a `student` or `instructor` token can also create payments. This is an authorization gap worth flagging.

**Body fields**
| Field | Type | Required | Notes |
|---|---|---|---|
| enrolment_id | int | yes | must reference an existing enrolment |
| amount | decimal | yes | `DECIMAL` column |
| payment_date | string | yes | `YYYY-MM-DD` (`DATEONLY`) |
| payment_method | string | yes | enum `cash` \| `card` \| `bank_transfer` |
| status | string | no | enum `pending` \| `completed` \| `failed`, defaults to `pending` |

**Notes**
- The controller does **not** verify that `enrolment_id` exists; a bad value fails the foreign key and is returned as `500 {"message":"Internal Server error"}`.
- There is a unique index on `(enrolment_id, payment_date)`, so a second payment for the same enrolment and date fails with `500`.
- Response status is `200` (not `201`).

**Request body**

```json
{
  "enrolment_id": 1,
  "amount": 250000,
  "payment_date": "2026-02-01",
  "payment_method": "card",
  "status": "completed"
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Payment created successfully",
  "data": {
    "id": 1,
    "enrolment_id": 1,
    "amount": "250000.00",
    "payment_date": "2026-02-01",
    "payment_method": "card",
    "status": "completed",
    "created_at": "2026-02-01T09:00:00.000Z",
    "updated_at": "2026-02-01T09:00:00.000Z"
  }
}
```

#### 500 Internal Server Error

```json
{
  "message": "Internal Server error"
}
```

### GET /api/payments/:id

**Get Payment By ID** - Private (any authenticated role)

**Private (any authenticated role).** Returns a single payment with its `enrolment` (`user` and `program` nested).

**Middleware:** `authenticate` only - there is **no** `authorize(...)` guard on this route, so any signed-in user can read any payment.

**Path param:** `id` (integer, required).

Unknown id -> `404 {"message":"Payment not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "Payment fetched successfully",
  "data": {
    "id": 1,
    "enrolment_id": 1,
    "amount": "250000.00",
    "payment_date": "2026-02-01",
    "payment_method": "card",
    "status": "completed",
    "enrolment": {
      "user_id": 1,
      "program_id": 1,
      "enrolment_date": "2026-02-01",
      "status": "enrolled",
      "enrolled_at": "2026-02-01T09:00:00.000Z",
      "user": {
        "first_name": "Ada",
        "last_name": "Lovelace",
        "email": "ada.lovelace@example.com",
        "role": "student"
      },
      "program": {
        "name": "Full Stack Web Development",
        "program_code": "FSWD-01",
        "tuition": "250000.00",
        "is_active": true
      }
    }
  }
}
```

#### 404 Not Found

```json
{
  "message": "Payment not found"
}
```

### PUT /api/payments/:id

**Update Payment** - Private (admin only)

**Private (admin only).** Updates a payment.

**Middleware:** `authenticate` (via `router.use`) -> `authorize('admin')`.

**Path param:** `id` (integer, required).

**Body fields:** `enrolment_id`, `amount`, `payment_date`, `payment_method`, `status` - all are written on every call, so omitted fields are cleared.

**Validation**
- Unknown `enrolment_id` -> `404 {"message":"Enrolment not found","enrolment_id":<id>}` (the id is echoed in the body).
- Unknown payment `id` -> `404 {"message":"Payment not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Request body**

```json
{
  "enrolment_id": 1,
  "amount": 300000,
  "payment_date": "2026-02-05",
  "payment_method": "bank_transfer",
  "status": "completed"
}
```

**Responses**

#### 200 OK

```json
{
  "message": "Payment updated successfully",
  "data": {
    "id": 1,
    "enrolment_id": 1,
    "amount": "300000.00",
    "payment_date": "2026-02-05",
    "payment_method": "bank_transfer",
    "status": "completed"
  }
}
```

#### 404 Not Found

```json
{
  "message": "Enrolment not found",
  "enrolment_id": 1
}
```

#### 404 Not Found

```json
{
  "message": "Payment not found"
}
```

### DELETE /api/payments/:id

**Delete Payment** - Private (admin only)

**Private (admin only).** Deletes a payment.

**Middleware:** `authenticate` (via `router.use`) -> `authorize('admin')`.

**Path param:** `id` (integer, required).

Unknown id -> `404 {"message":"Payment not found"}`.

**Path parameters**

| Key | Example | Type |
|---|---|---|
| `id` | 1 | integer |

**Responses**

#### 200 OK

```json
{
  "message": "Payment deleted successfully"
}
```

#### 404 Not Found

```json
{
  "message": "Payment not found"
}
```

---

## Known Implementation Quirks

These are behaviours of the current codebase that differ from what you would expect from REST conventions. They are documented here so the collection behaves predictably against the running server.

| Quirk | Explanation |
|---|---|
| Validation errors return `500` | Most controllers catch Sequelize errors and respond with `500 {"message":"Internal Server error"}` instead of a `400` with a validation message. The only `400` responses come from hand-written checks inside the controller. |
| Omitted update fields are cleared | `PUT` handlers write every field on every request. Sending only one field nulls out all the others instead of leaving them untouched. |
| `PUT /api/auth/me` returns a stale profile | The response embeds a snapshot of the related `student` / `instructor` profile taken before the update, so the nested object can disagree with the updated user fields. |
| Instructor updates check role but not ownership | `PUT /api/instructors/:id` accepts `admin` **and** `instructor`, but it does not verify that the caller is the instructor being edited - any instructor can update any other instructor. |
| `DELETE /api/programs/:id/courses` is public | The route is registered without `authenticate` / `authorize`, so courses can be detached from a program without a token. |
| `POST /api/payments` has no role guard | The route only runs `authenticate`, so a `student` or `instructor` token can create payments. |
| `DELETE` with a JSON body | `DELETE /api/instructors/:id/courses` reads `courseIds` from the request body, so Postman must be set to send a raw JSON body on a `DELETE`. |
| Course attachment needs an array | `POST /api/programs/:id/courses` calls `.map()` on `coursesInfo` without a type check, so a missing or non-array value throws and returns `500`. |
| Course creation returns `200` | `POST /api/courses` responds with `200` (not `201`) and `is_active` is required by the model. |
| Pagination keys differ between resources | There are three different shapes. `/api/enrolments`, `/api/students` and `/api/instructors` return `totalItems`, `totalPages`, `currentPage`, `perPage`. `/api/payments`, `/api/programs` and `/api/courses` return `total`, `page`, `limit`, `totalPages`. `/api/users` returns `total`, `page`, `per_page`, `total_page` (snake_case). |
| Payment creation relies on the database | `POST /api/payments` never checks that `enrolment_id` exists. A bad value fails the foreign key and surfaces as a `500`. |
| Public user and student listing | `GET /api/users`, `POST /api/users`, `GET /api/students` and `GET /api/students/:id` are registered without any auth middleware. |

---

Generated by `node docs/generate-postman-collection.js`. Import `docs/postman-collection.json` into Postman to exercise the API.
