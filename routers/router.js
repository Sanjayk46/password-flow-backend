
const express =require ("express");
const UserRoutes =require ("./userrouter");
const router = express.Router();

router.use("/user", UserRoutes);

module.exports = router;
