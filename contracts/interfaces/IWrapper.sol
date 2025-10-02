// SPDX-License-Identifier: MIT

pragma solidity 0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IWrapper
 * @notice Interface for wrapper contracts that enable token conversions cross-chains.
 */
interface IWrapper {
    error NotSupportedToken();
    error NotAddedMarket();
    error NotRemovedMarket();

    function wrap(IERC20 token) external view returns (IERC20 wrappedToken, uint256 rate);
}
