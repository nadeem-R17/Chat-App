// const { pgTable, text, timestamp, uuid } = require("drizzle-orm/pg-core");
// const { connectToDatabase } = require("../config/db");

// const readReceiptsTableDefinition = pgTable("read_receipts", {
//   id: uuid("id").primaryKey(), // Primary Key
//   messageId: uuid("messageId").notNull().references("messages.messageId"), // Foreign Key referencing `messages.messageId`
//   userId: uuid("userId").notNull().references("users.id"), // Foreign Key referencing `users.id`
//   deliveredAt: timestamp("deliveredAt").defaultNow(),
//   readAt: timestamp("readAt"),
// });

// const readReceiptsTable = async () => {
//   const db = await connectToDatabase();
//   return { db, readReceiptsTableDefinition };
// };

// module.exports = readReceiptsTable;


const mongoose = require("mongoose");

const readReceiptSchema = new mongoose.Schema({
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    deliveredAt: {
        type: Date,
        default: Date.now,
    },
    readAt: {
        type: Date,
    },
});

const ReadReceipt = mongoose.model("ReadReceipt", readReceiptSchema);

module.exports = ReadReceipt;