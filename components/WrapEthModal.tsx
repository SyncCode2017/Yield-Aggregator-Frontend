import { Modal, useNotification, Input, Button } from "web3uikit"
import { useState } from "react"
import { yieldAggregatorAbi, contractAddresses, wethContractAbi, wethAddress } from "../constants"
import { useWeb3Contract } from "react-moralis"
import { ethToWeiConverter } from "@/utils/helper-functions"

interface WrapEthModalProps {
    isVisible: boolean
    onClose: () => void
    account: string
}

const WrapEthModal = ({
    isVisible,
    onClose,
    account,
}: WrapEthModalProps) => {
    const [amountInEth, setAmountInEth] = useState("")
    // @ts-ignore
    const { runContractFunction } = useWeb3Contract()
    const dispatch = useNotification()

    const handleWrappedEthSuccess = async (tx: unknown) => {
        // @ts-ignore
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "ETH wrapped successfully",
            title: "ETH Wrapped- please refresh",
            position: "topR",
        })
    }

    const handleWrappedEthFailure = async (error: unknown) => {
        // @ts-ignore
        // console.log(error.message)
        dispatch({
            type: "info",
            // @ts-ignore
            message: `${error.message}`,
            title: `ETH wrapping failed - please try again`,
            position: "topR",
        })
    }

    const depositAmountWei = ethToWeiConverter(Number(amountInEth))
    const { runContractFunction: wrappedEthOptions } = useWeb3Contract({
        abi: wethContractAbi,
        contractAddress: wethAddress,
        functionName: "deposit",
        msgValue: depositAmountWei,
        params: {},
    })

    const getWrappedEth = async () => {
        await wrappedEthOptions({
            onSuccess: (tx) => handleWrappedEthSuccess(tx),
            onError: (error) => handleWrappedEthFailure(error),
        })
    }

    const handleCloseModal = () => {
        onClose()
    }

    return (
        <Modal
            isVisible={isVisible}
            id="regular"
            onCancel={handleCloseModal}
            onCloseButtonPressed={handleCloseModal}
            onOk={handleCloseModal}
            title="wrap-eth"
        >
            <div
                style={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                <div>
                </div>
                <div className="font-bold text-2xl p-2">
                    <div className="flex flex-col ml-20 py-10">
                        <div className="mr-4">
                            <p className="pb-4">Get Wrapped Ether (WETH)</p>
                            <Input
                                label="Enter the ETH amount to wrap"
                                name="Wrap Eth"
                                onChange={(event) => {
                                    setAmountInEth(event.target.value)
                                }}
                                type="number"
                            />
                        </div>
                        <div className="px-20 py-5">
                            {amountInEth! ? (
                                <Button
                                    id="get-weth-id"
                                    onClick={getWrappedEth}
                                    text="Get WETH"
                                    theme="colored"
                                    color="blue"
                                    type="button"
                                />
                            ) : (
                                <p></p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default WrapEthModal
