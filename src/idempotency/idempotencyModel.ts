import mongoose from "mongoose";


const idempotencySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
    },
    response: {
        type: Object,
        required: true
    }
}, { timestamps: true })

idempotencySchema.index({ createdAt: 1 }, { expireAfterSeconds: 20 });
idempotencySchema.index({ key: 1 }, { unique: true });

const IdempotencyModel = mongoose.model("Idempotency", idempotencySchema);

export default IdempotencyModel;    