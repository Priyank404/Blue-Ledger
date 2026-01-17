import mongoose from "mongoose";

const PortfolioSnapshotSchema  = new mongoose.Schema({
    portfolio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Portfolio",
        required: true
    },
    day: { 
      type: String,
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
PortfolioSnapshotSchema.index({ portfolio: 1, day: 1 },{unique: true});

export const PortfolioSnapshot = mongoose.model("PortfolioSnapshot", PortfolioSnapshotSchema )