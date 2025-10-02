// SPDX-License-Identifier: MIT

pragma solidity 0.8.23;

contract GasEstimator {
    /**
     * @notice get the current gas left in the transaction
     */
    function gasLimit() external view returns (uint256) {
        return gasleft();
    }

    /**
     * @notice estimate the gas cost of a call to a target contract
     * @param target the address of the target contract
     * @param data the calldata to send to the target contract
     * @return gasUsed the amount of gas used by the call
     * @return success whether the call was successful or not
     */
    function gasCost(address target, bytes calldata data) external view returns (uint256 gasUsed, bool success) {
        uint256 gas = gasleft();
        (bool s, ) = target.staticcall(data);
        return (gas - gasleft(), s);
    }
}
