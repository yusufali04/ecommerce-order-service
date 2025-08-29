import mongoose from "mongoose";

const toppingSchema = new mongoose.Schema({
    toppingId: String,
    price: String,
})

const ToppingCacheModel = mongoose.model("toppingCache", toppingSchema, "toppingCache");

export default ToppingCacheModel;