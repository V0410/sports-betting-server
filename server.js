const { ethers } = require("ethers")
const axios = require("axios")
const connectDB = require("./config/db")
const Fixtures = require("./models/Fixtures")
const sendTransaction = require("./utils/sendTransaction")
const bettingAbi_json = require("./contracts/Betting.json")

require("dotenv").config()

const INTERVAL_TIME = 10 * 60 * 1000;

const main = async () => {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
  const ownerKey = process.env.CONTRACT_OWNER
  const owner = new ethers.Wallet(ownerKey, provider);
  const BettingContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, bettingAbi_json, provider)
  const gasLimit = 2_000_000

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
          const fixtureResult = goals.home > goals.away ? 0 : goals.home < goals.away ? 2 : 1

          const transaction = await BettingContract.processGame.populateTransaction(
            BigInt(fixtureId),
            fixtureResult,
          )
          const transactionStatus = await sendTransaction(
            provider,
            owner,
            {
              ...transaction,
              gasLimit: gasLimit,
            },
          )
          
          if (transactionStatus === "sent") {
            fixture.updateOne({ finished: true })
          }
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