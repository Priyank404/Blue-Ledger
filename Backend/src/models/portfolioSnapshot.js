import mongoose from "mongoose";

const PortfolioSnapshotSchema  = new mongoose.Schema({
    portfolio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Portfolio",
        required: true
    },
    date: {
      type: Date,
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// Optional but recommended for charts
PortfolioSnapshotSchema.index({ portfolio: 1, date: 1 });

export const PortfolioSnapshot = mongoose.model("PortfolioSnapshot", PortfolioSnapshotSchema )