const mongoose = require('mongoose')

module.exports.connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)
    console.log("Kết nối thành công!");

    // enable debug query
    mongoose.set("debug", (collection, method, query, doc) => {
      console.log(`Mongo Query → ${collection}.${method}`, query, doc);
    });
  }
  catch (error) {
    console.log("Kết nối thất bại!");
    console.error("Lỗi: ", error.message);
  }
};
