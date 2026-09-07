const login = (req, res) => {
  const { email, password } = req.body; // object destruction
  console.log({ email, password });

  res.status(200).send("Login successful");
};

module.exports = { login };
