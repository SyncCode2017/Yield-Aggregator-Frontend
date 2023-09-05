import { ethers } from "ethers"

export const ethToWeiConverter = (valueInEth: number): number => {
    return Number(ethers.utils.parseEther(valueInEth.toString()))
}

export const weiToEthConverter = (valueInWei: number): number => {
    return Number(ethers.utils.formatEther(valueInWei.toString()))
}