users table

id int primary key,

first_name varchar(255) not null,

last_name varchar(255) not null,

email varchar(255) not null,

phone varchar(255) not null,

address varchar(255) not null,

password varchar(255) not null,

role enum('student','instructor','admin') default 'student',

is_active boolean default true,

gender enum('male','female','other') not null,

created_at timestamp default current_timestamp,

updated_at timestamp default current_timestamp

students table

id int primary key,

user_id int not null FK users(id),

dob date not null,

guardian_name varchar(255) not null,

guardian_email varchar(255) not null,

guardian_phone varchar(255) not null,

created_at timestamp default current_timestamp,

updated_at timestamp default current_timestamp

instructors table

id int primary key,

user_id int not null FK users(id),

bio varchar(255) not null,

specialization varchar(255) not null,

years_experience int not null,

created_at timestamp default current_timestamp,

updated_at timestamp default current_timestamp

courses table

id int primary key,

title varchar(255) not null,

code varchar(255) not null unique,

description text not null,

duration varchar(255) not null,

is_active boolean default true,

created_at timestamp default current_timestamp,

updated_at timestamp default current_timestamp

programs table

id int primary key,

name varchar(255) not null,

description text not null,

program_code varchar(255) not null unique,

tuition decimal(10,2) not null,

is_active boolean default true,

created_at timestamp default current_timestamp,

updated_at timestamp default current_timestamp

program_courses table

id int primary key,

program_id int not null FK programs(id),

course_id int not null FK courses(id),

sequence int not null,

is_required boolean default true,

created_at timestamp default current_timestamp,

updated_at timestamp default current_timestamp

instructor_courses table

id int primary key,

course_id int not null FK courses(id),

instructor_id int not null FK instructors(id),

assigned_at timestamp default current_timestamp,

created_at timestamp default current_timestamp,

updated_at timestamp default current_timestamp

enrolments table

id int primary key,

user_id int not null FK users(id),

program_id int not null FK programs(id),

enrolment_date date not null,

status enum('enrolled','completed','dropped') not null default 'enrolled',

enrolled_at timestamp default current_timestamp,

created_at timestamp default current_timestamp,

updated_at timestamp default current_timestamp

payments table

id int primary key,

enrolment_id int not null FK enrolments(id),

amount decimal(10,2) not null,

payment_date date not null,

payment_method enum('cash','card','bank_transfer') not null,

status enum('pending','completed','failed') not null default 'pending',

created_at timestamp default current_timestamp,

updated_at timestamp default current_timestamp
