import mongoose from "mongoose";

const StockPriceSnapshotSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, { timestamps: true });

StockPriceSnapshotSchema.index({ symbol: 1, date: 1 },{ unique: true });

export const StockPriceSnapshot = mongoose.model(
  "StockPriceSnapshot",
  StockPriceSnapshotSchema
);
