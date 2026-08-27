const user = {
  _id: 123,
  name: "Aluko Tosin",
  email: "[EMAIL_ADDRESS]",
  phone: "08036096348",
  address: {
    street: "123 Main St",
    city: "Akure",
    state: "Ondo",
    country: "Nigeria",
  },
};

const user2 = {
  _id: 234,
  name: "Olatunji Abass",
  email: "[EMAIL_ADDRESS]",
  phone: "08036096348",
  address: {
    street: "123 Main St",
    city: "Akure",
    state: "Ondo",
    country: "Nigeria",
  },
};

const users = [user, user2];

module.exports = { users };
