import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Player name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    role: {
      type: String,
      required: [true, "Role of the player is required"],
      enum: {
        value: ["Batsman", "Bowler", "WicketKeeper", "All-rounder"],
        message:
          'Role must be: "Batsman", "Bowler", "WicketKeeper", "All-rounder',
      },
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Team Id is required"],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Player", playerSchema);
