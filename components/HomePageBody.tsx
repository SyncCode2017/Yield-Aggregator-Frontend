import { yieldAggregatorAbi, contractAddresses, wethContractAbi, wethAddress } from "../constants"
import { useEffect, useState } from "react"
import { Button, useNotification, Input } from "web3uikit"
import { useWeb3Contract, useMoralis, Web3ExecuteFunctionParameters } from "react-moralis"
import { ethToWeiConverter, weiToEthConverter } from "@/utils/helper-functions"
import WrapEthModal from "./WrapEthModal"

interface contractAddressesInterface {
  [key: string]: { [key: string]: string[] }
}

export default function HomePageBody() {
  let chain_id: string | null
  const addresses: contractAddressesInterface = contractAddresses
  const { chainId: chainIdHex, account, isWeb3Enabled } = useMoralis()

  chainIdHex ? chain_id = parseInt(chainIdHex).toString() : chain_id = null
  console.log("chain_id", chain_id)

  const [amountInEth, setAmountInEth] = useState("")
  const [aaveApy, setAaveApy] = useState(0)
  const [compApy, setCompApy] = useState(0)
  const [balanceInAave, setBalanceInAave] = useState(0)
  const [balanceInCompound, setBalanceInCompound] = useState(0)
  const [showWrapEthModal, setShowWrapEthModal] = useState(false)
  const hideWrapEthModal = () => setShowWrapEthModal(false)

  const yieldAggAddress =
    chain_id! in addresses ? addresses[chain_id!]["YieldAggregator"][0] : null

  // console.log("yieldAggAddress", yieldAggAddress)

  // @ts-ignore
  const { runContractFunction } = useWeb3Contract()
  const dispatch = useNotification()

  const updateUI = async () => {
    setAaveApy((await getAaveApyInContract())!)
    setCompApy((await getCompApyInContract())!)
    const balAave = await getBalanceInAave()
    balAave ? setBalanceInAave(weiToEthConverter(balAave!)) : null
    const balComp = await getBalanceInCompound()
    balComp ? setBalanceInCompound(weiToEthConverter(balComp!)) : null
  }

  useEffect(() => {
    updateUI()
  }, [account, isWeb3Enabled, chain_id!])

  const handleWrapEthButtonClick = () => {
    setShowWrapEthModal(true)
    // console.log("Wrapped Eth Clicked")
  }

  //************************************** Notificatications ********************************************/

  const handleDepositSuccess = async (tx: unknown) => {
    // @ts-ignore
    await tx.wait(1)
    dispatch({
      type: "success",
      message: "Weth deposited",
      title: "Deposit Successful  - please refresh",
      position: "topR",
    })
  }

  const handleDepositFailure = async (error: unknown) => {
    dispatch({
      type: "info",
      // @ts-ignore
      message: `${error.message}`,
      title: `Deposit failed - please try again`,
      position: "topR",
    })
  }

  const handleWithdrawalSuccess = async (tx: unknown) => {
    // @ts-ignore
    await tx.wait(1)
    dispatch({
      type: "success",
      message: "Weth withdrawn",
      title: "Withdrawal Successful  - please refresh",
      position: "topR",
    })
  }

  const handleWithdrawalFailure = async (error: unknown) => {
    dispatch({
      type: "info",
      // @ts-ignore
      message: `${error.message}`,
      title: `Withdrawal failed - please try again`,
      position: "topR",
    })
  }

  const handleRebalanceSuccess = async (tx: unknown) => {
    // @ts-ignore
    await tx.wait(1)
    dispatch({
      type: "success",
      message: "Weth deposit rebalanced",
      title: "Deposit Rebalanced - please refresh",
      position: "topR",
    })
  }

  const handleRebalanceFailure = async (error: unknown) => {
    dispatch({
      type: "info",
      // @ts-ignore
      message: `${error.message}`,
      title: `No Rebalancing Required`,
      position: "topR",
    })
  }

  //************************************** Functions Calling Contracts **********************************/

  const getAaveApyInContract = async (): Promise<number | null> => {
    const options = {
      abi: yieldAggregatorAbi,
      contractAddress: yieldAggAddress,
      functionName: "getAaveCurrentWETHAPY",
      params: {},
    }
    const returnedApy: number | null = (await runContractFunction({
      params: options as unknown as Web3ExecuteFunctionParameters,
      onError: (error) => console.log(error),
    })) as number

    if (returnedApy) {
      const aaveApyFormatted = (returnedApy / (10 ** 25)).toFixed(2)
      return Number(aaveApyFormatted)
    }
    return null
  }

  const getCompApyInContract = async (): Promise<number | null> => {
    const options = {
      abi: yieldAggregatorAbi,
      contractAddress: yieldAggAddress,
      functionName: "getCompoundCurrentWETHAPY",
      params: {},
    }
    const returnedApy: number | null = (await runContractFunction({
      params: options as unknown as Web3ExecuteFunctionParameters,
      onError: (error) => console.log(error),
    })) as number

    if (returnedApy) {
      const compApyFormatted = (returnedApy / (10 ** 25)).toFixed(2)
      return Number(compApyFormatted)
    }
    return null
  }

  const getBalanceInCompound = async (): Promise<number | null> => {
    const options = {
      abi: yieldAggregatorAbi,
      contractAddress: yieldAggAddress,
      functionName: "getCompoundWETHCurrentBalance",
      params: {},
    }
    const returnedApy: number | null = (await runContractFunction({
      params: options as unknown as Web3ExecuteFunctionParameters,
      onError: (error) => console.log(error),
    })) as number

    if (returnedApy) {
      return returnedApy
    }
    return null
  }

  const getBalanceInAave = async (): Promise<number | null> => {
    const options = {
      abi: yieldAggregatorAbi,
      contractAddress: yieldAggAddress,
      functionName: "getAaveWETHCurrentBalance",
      params: {},
    }
    const returnedApy: number | null = (await runContractFunction({
      params: options as unknown as Web3ExecuteFunctionParameters,
      onError: (error) => console.log(error),
    })) as number

    if (returnedApy) {
      return returnedApy
    }
    return null
  }

  const amountInWei = ethToWeiConverter(Number(amountInEth))

  const { runContractFunction: approveOptions } = useWeb3Contract({
    abi: wethContractAbi,
    contractAddress: wethAddress,
    functionName: "approve",
    params: {
      guy: yieldAggAddress!,
      wad: amountInWei.toString(),
    },
  })

  const approveAndDepositWeth = async () => {
    await approveOptions({
      onSuccess: () => handleApproveSuccess(),
      onError: (error) => console.log(error),
    })
  }

  async function handleApproveSuccess() {
    console.log("Ok... Now depositing weth...");
    const options = {
      abi: yieldAggregatorAbi,
      contractAddress: yieldAggAddress!,
      functionName: "depositWETH",
      params: {
        _amount: amountInWei.toString(),
      },
    }
    await runContractFunction({
      params: options,
      onSuccess: (tx) => handleDepositSuccess(tx),
      onError: (error) => handleDepositFailure(error),
    });
  }


  const { runContractFunction: rebalanceOptions } = useWeb3Contract({
    abi: yieldAggregatorAbi,
    contractAddress: yieldAggAddress!,
    functionName: "rebalanceWETH",
    params: {},
  })

  const rebalanceWethInProtocol = async () => {
    await rebalanceOptions({
      onSuccess: (tx) => handleRebalanceSuccess(tx),
      onError: (error) => handleRebalanceFailure(error),
    })
  }

  const { runContractFunction: withdrawalOptions } = useWeb3Contract({
    abi: yieldAggregatorAbi,
    contractAddress: yieldAggAddress!,
    functionName: "withdrawWETH",
    params: {},
  })

  const withdrawWethFromProtocol = async () => {
    await withdrawalOptions({
      onSuccess: (tx) => handleWithdrawalSuccess(tx),
      onError: (error) => handleWithdrawalFailure(error),
    })
  }

  // 
  return (
    <div className="flex flex-row pt-20 items-centre px-10">
      <div>
        {account ? (
          yieldAggAddress ? (
            <div className="flex flex-row justify-between">
              <div className="flex flex-col pl-40">
                <div className="flex flex-col">
                  <div className="">
                    <Input
                      label="Enter the WETH amount to deposit"
                      name="deposit-weth"
                      onChange={(event) => {
                        setAmountInEth(event.target.value)
                      }}
                      type="number"
                    />
                  </div>
                  <div className="px-5 pt-4">
                    <div>
                      <Button
                        id="deposit-button"
                        onClick={() => approveAndDepositWeth()}
                        text="Deposit WETH"
                        theme="colored"
                        color="blue"
                        type="button"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-5 pt-12">
                  <Button
                    id="rebalance-button"
                    onClick={rebalanceWethInProtocol}
                    text="Rebalance"
                    theme="colored"
                    color="green"
                    type="button"
                  />
                </div>
                <div className="px-5 pt-12">
                  <Button
                    id="withdraw-weth"
                    onClick={withdrawWethFromProtocol}
                    text="Withdraw WETH"
                    theme="colored"
                    color="red"
                    type="button"
                  />
                </div>
              </div>
              <div className="flex flex-col pl-80">
                <div className="pb-5">
                  <p>Aave V3 APY: {aaveApy}%</p>
                  <p>Compound V3 APY: {compApy}%</p>
                </div>
                <div>
                  <p>Balance in Aave: {balanceInAave.toFixed(2)} WETH</p>
                  <p>Balance in Compound: {balanceInCompound.toFixed(2)} WETH</p>
                </div>
                <div className="flex flex-col mt-20">
                  <div className="pb-3 text-sm">
                    <p>Please ensure you have sufficient WETH tokens in your wallet. </p>
                    <p>To get WETH tokens, please click the button below.</p>
                  </div>
                  <WrapEthModal
                    isVisible={showWrapEthModal}
                    account={account!}
                    onClose={hideWrapEthModal}
                  />
                  <Button
                    id="wrap-ether"
                    onClick={handleWrapEthButtonClick}
                    text="Get WETH Tokens"
                    theme="colored"
                    color="blue"
                    type="button"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              className="bg-orange-100 border-l-4 border-blue-500 text-blue-700 p-8"
              role="alert"
            >
              <p className="font-bold text-3xl pb-5">Unsupported Network!</p>
              <p>Please switch the network in your wallet!</p>
            </div>
          )
        ) : (
          <div className="bg-orange-100 border-l-4 border-blue-500 text-blue-600 p-20">
            <h1 className="font-bold text-3xl pb-5">
              Yield Aggregator for Aave and Compound
            </h1>
            <h2 className="text-2xl">Please connect your wallet!</h2>
          </div>
        )}
      </div>
    </div>
  )
}
