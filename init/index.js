const mongoose= require("mongoose");
const initData= require("./data.js");
const Listing=require("../models/listing.js");

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
})


async function main() {
    await mongoose.connect(process.env.mongodbUrl);
}

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data =initData.data.map((obj)=>({...obj,owner: "69b438e3d8550e07b021ea62"}))
    await Listing.insertMany(initData.data);
    console.log("initialised");
}

initDB();