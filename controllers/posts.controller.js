const { Post, User } = require("../models");

class PostController {
  static async createPost(req, res, next) {
    try {
      const {
        title,
        content,
        author_id,
        status = "draft",
        published_date = new Date(),
      } = req.body;
      if (!title || !content || !author_id) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const user = await User.findOne({ where: { id: author_id } });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      const post = await Post.create({
        title,
        content,
        author_id,
        status,
        published_date,
      });

      return res
        .status(201)
        .json({ message: "Post created successfully", data: post });
    } catch (err) {
      next(err);
    }
  }

  static async updatePost(req, res) {}
}
module.exports = PostController;
