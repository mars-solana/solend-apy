import { Reserve } from "./models";
import BigNumber from "bignumber.js";

export const calculateAPY = (currentUtilization: number, reserve: Reserve) => {
    const borrowAPY = calculateBorrowAPY(reserve);
    return currentUtilization * borrowAPY;
};

export const calculateBorrowAPY = (reserve: Reserve) => {
    const currentUtilization = calculateUtilizationRatio(reserve);
    const optimalUtilization = reserve.config.optimalUtilizationRate / 100;
    let borrowAPY;
    if (
        optimalUtilization === 1.0 ||
        currentUtilization.isLessThan(new BigNumber(optimalUtilization))
    ) {
        const normalizedFactor = currentUtilization.div(optimalUtilization);
        const optimalBorrowRate = reserve.config.optimalBorrowRate / 100;
        const minBorrowRate = reserve.config.minBorrowRate / 100;
        borrowAPY = normalizedFactor
            .multipliedBy(optimalBorrowRate - minBorrowRate)
            .plus(minBorrowRate);
    } else {
        const normalizedFactor = currentUtilization
            .minus(optimalUtilization)
            .div(1 - optimalUtilization);
        const optimalBorrowRate = reserve.config.optimalBorrowRate / 100;
        const maxBorrowRate = reserve.config.maxBorrowRate / 100;
        borrowAPY = normalizedFactor
            .multipliedBy(maxBorrowRate - optimalBorrowRate)
            .plus(optimalBorrowRate);
    }

    return borrowAPY;
};

const calculateUtilizationRatio = (reserve: Reserve) => {
    const borrowedAmount = reserve.liquidity.borrowedAmountWads;

    const availableAmount = new BigNumber(
        Number(reserve.liquidity.availableAmount)
    );

    const totalSupply = availableAmount.plus(borrowedAmount);
    const currentUtilization = borrowedAmount.div(totalSupply);

    return currentUtilization;
};

export const SolendProtocol = {
    calculateUtilizationRatio,
    calculateAPY,
};
