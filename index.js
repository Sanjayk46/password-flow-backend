
const express = require ("express");
const AppRouter = require ("./routers/router");
const dotenv = require ("dotenv");
const cors = require ("cors");
const {dbConnection} = require("./database/database")
dotenv.config();
const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());
app.use("/", AppRouter);
dbConnection();

app.get("/", (req, res) => {
try {
  res.status(200).send({
    message:"working"
   });
  
} catch (error) {
  res.status(500).send({
    message:"Internal Server Error",
    error:error.message
})
}
  
});

app.listen(PORT,()=>console.log("app is running successfully"))
