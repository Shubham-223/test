const { Schema, model } = require("mongoose");
const { genSalt, hash } = require("bcryptjs");

// User Fields
// name
// email
// password
// role (user/student, company/school)
// results: [{tid,marks}]
// createdAt

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
  },

  email: {
    type: String,
    required: [true, "Please provide email address"],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
  },

  passwordHash: {
    type: String,
    required: [true, "Please add a password"],
    select: false,
  },

  role: {
    type: String,
    required: [true, "Please select your role"],
    enum: {
      values: ["user", "company"],
      message: "Please add valid role!",
    },
  },

  results: [
    new Schema({
      testId: {
        type: Schema.Types.ObjectId,
        required: [true, "Please provide testid!"],
        ref: "test",
      },
      marks: {
        type: Number,
        required: [true, "Please provide marks!"],
      },
    }),
  ],

  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
});

userSchema.pre("save", async function (next) {
  const salt = await genSalt(10);
  this.passwordHash = await hash(this.passwordHash, salt);
  next();
});

const User = new model("user", userSchema);

module.exports = User;
