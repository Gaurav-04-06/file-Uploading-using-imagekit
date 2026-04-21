import ApiError from "../../../common/utils/api-error.js";
import Player from "../models/player.model.js";
import Team from "../models/team.model.js";

const transferPlayer = async (playerId, newteamId) => {
  const newTeam = await Team.findById(newteamId);

  if (!newTeam) {
    throw ApiError.notfound("Team not found!");
  }

  const player = await Player.findByIdAndUpdate(
    playerId,
    {
      teamId: newteamId,
    },
    {
      new: true,
      runValidators: true,
    },
  );
};
