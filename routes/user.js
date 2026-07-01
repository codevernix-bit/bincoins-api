const express = require("express");
const { ethers } = require("ethers");
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

const BSC_RPC = "https://bsc-dataseed.binance.org/";
const BINC_CONTRACT = "0xB0475ccB26A6dC27a4694a2f26ed810ef8F93252";

const erc20Abi = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

router.get("/profile", authMiddleware, async (req, res) => {
  res.json({
    user: req.user,
  });
});

router.put("/wallet", authMiddleware, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address is required" });
    }

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ message: "Invalid wallet address" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { walletAddress },
      { new: true }
    ).select("-password");

    res.json({
      message: "Wallet connected successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user || !user.walletAddress) {
      return res.json({
        balance: "0",
        formatted: "0 BINC",
      });
    }

    const provider = new ethers.JsonRpcProvider(BSC_RPC);
    const token = new ethers.Contract(BINC_CONTRACT, erc20Abi, provider);

    const decimals = await token.decimals();
    const balance = await token.balanceOf(user.walletAddress);

    const formattedBalance = ethers.formatUnits(balance, decimals);
    const cleanBalance = Number(formattedBalance).toLocaleString("en-US", {
      maximumFractionDigits: 4,
    });

    res.json({
      balance: formattedBalance,
      formatted: `${cleanBalance} BINC`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load BINC balance",
      error: error.message,
    });
  }
});

module.exports = router;