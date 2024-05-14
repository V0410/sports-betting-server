const { ethers } = require("ethers")
const connectDB = require("./config/db")
const Fixtures = require("./models/Fixtures")
const bettingAbi_json = require("./contracts/Betting.json")

require("dotenv").config()

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
const BettingContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, bettingAbi_json, provider)

const INTERVAL_TIME = 10 * 60 * 1000;

const main = async () => {
  setInterval(async () => {
    try {
      const fixtures = await Fixtures.find({ finished: false })
      fixtures.map(async (fixture) => {
        const { fixtureId } = fixture
        console.log(fixtureId)

        const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?id=${fixtureId}`
        const res = await axios.get(url, {
          headers: {
            "X-RapidAPI-Key": "4d0108a5a6mshc2e36a7acaf5ecap162acbjsn80103448a735",
            "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
          }
        })
        if (res.data.response[0].fixture.status.short === "FT") {
          const goals = res.data.response[0].goals
          const fixtureResult = goals.home > goals.away ? "HOME" : goals.home < goals.away ? "AWAY" : "DRAW"
          BettingContract.methods.processGame()
          console.log(fixtureResult)
        }
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }, INTERVAL_TIME)
}

// Connect Database
connectDB()

main()