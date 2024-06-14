const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware');
const { getDonorsListController, getHospitalListController, getOrgListController, deleteDonorController } = require('../controllers/adminController');
const adminMiddleware = require('../middlewares/adminMiddleware');


// router object
const router = express.Router()

// Routes

// GET || DONOR LIST
router.get('/donor-list', authMiddleware,adminMiddleware, getDonorsListController);

// GET || HOSPITAL LIST
router.get('/hospital-list', authMiddleware,adminMiddleware, getHospitalListController);

// GET || ORG LIST
router.get('/org-list', authMiddleware,adminMiddleware, getOrgListController);

// ==========================

// DELETE DONoR || GET
router.delete("/delete-donor/:id", authMiddleware, adminMiddleware,deleteDonorController);

// EXPORT
module.exports = router;