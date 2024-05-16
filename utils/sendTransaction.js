const sendTransaction = async (provider, signer, transaction) => {
  if (!provider) {
    return "fail"
  }

  const txRes = await signer.sendTransaction(transaction)
  let receipt = null

  while (receipt === null) {
    try {
      receipt = await provider.getTransactionReceipt(txRes.hash)

      if (receipt === null) {
        continue
      }

      if (receipt.status === 0) {
        const revertReason = ethers.utils.defaultAbiCoder.decode(['string'], receipt.data)[0]
        console.log("Revert reason:", revertReason)
        return "fail"
      }
    } catch (e) {
      console.log(`Receipt error:`, e)
      return "fail"
    }
  }

  if (receipt) {
    return "sent"
  } else {
    return "fail"
  }
}

module.exports = sendTransaction