const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    fixtureId: {
      type: String,
      required: true,
    },
    fixtureDate: {
      type: String,
      required: true,
    },
    league: {
      type: String,
    },
    homeTeam: {
      type: String,
    },
    awayTeam: {
      type: String,
    },
    homeTeamName: {
      type: String,
    },
    awayTeamName: {
      type: String,
    },
    finished: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('fixtures', UserSchema);
