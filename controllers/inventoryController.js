const userModel = require("../models/userModel");
const inventoryModel = require("../models/inventoryModel");
const mongoose = require("mongoose");

// Create Inventory
const createInventoryController = async(req,res) => {
    try {
        const {email} = req.body
        //validation
        const user = await userModel.findOne({email})
        if(!user){
         throw new Error('User Not Found')
        }
        // if(inventoryType === "in" && user.role !== 'donor'){
        //   throw new Error('Not a donor account')
        // }
        // if(inventoryType === "out" && user.role !== 'hospital'){
        //     throw new Error('Not a hospital')
        // }

        if(req.body.inventoryType == 'out'){
            const requestedBloodGroup = req.body.bloodGroup
            const requestedQuantityOfBlood = req.body.quantity
            const organisation = new mongoose.Types.ObjectId(req.body.userId)
            // calculate In Blood Quanitity
            const totalInOfRequestedBlood = await inventoryModel.aggregate([
                {$match: {
                    organisation,
                    inventoryType:'in',
                    bloodGroup:requestedBloodGroup
                }}, {
                    $group:{
                        _id:'$bloodGroup',
                        total:{$sum : '$quantity'},
                    },
                },
            ]);
            // console.log("total In", totalInOfRequestedBlood);
            const totalIn = totalInOfRequestedBlood[0]?.total || 0;

            // calculate Out Blood Quanitity

            const totalOutOfRequestedBloodGroup = await inventoryModel.aggregate([
                {$match:{
                    organisation,
                    inventoryType:'out',
                    bloodGroup:requestedBloodGroup
                }},
                {
                    $group:{
                        _id:'$bloodGroup',
                        total: {$sum : '$quantity'}
                    }
                }
            ]);
            const totalOut = totalOutOfRequestedBloodGroup[0]?.total || 0;

            // in & out Calculate:
            const availableQuanityOfBloodGroup = totalIn - totalOut;
            //quantity validation
            if (availableQuanityOfBloodGroup < requestedQuantityOfBlood) {
                return res.status(500).send({
                success: false,
                message: `Only ${availableQuanityOfBloodGroup}ML of ${requestedBloodGroup.toUpperCase()} is available`,
                });
            }
            req.body.hospital = user?._id;
        } else{
            req.body.donor = user?._id
        }


        // // save record
        const inventory = new inventoryModel(req.body)
        await inventory.save()
        return res.status(201).send({
            success: true,
            message: "New Blood Record Added",
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: 'Error In Create Inventory API',
            error
        })
    }
};

// GET ALL BLOOD RECORDS
const getInventoryController = async(req, res) => {
    try {
        const inventory = await inventoryModel.find({
            organisation: req.body.userId,
        }).populate('organisation').populate('hospital').sort({createdAt: -1});
        return res.status(200).send({
            success: true,
            message: "get all records successfully",
            inventory,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Get All Inventory",
            error,
        });
    }
};

// GET HOSPITAL BLOOD RECORDS
const getInventoryHospitalController = async(req, res) => {
    try {
        const inventory = await inventoryModel.find(req.body.filters).populate('donor').populate('hospital').populate('organisation').sort({createdAt: -1});
        return res.status(200).send({
            success: true,
            message: "get hospital consumer records successfully",
            inventory,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error In Get Consumer Inventory",
            error,
        });
    }
};

// GET BLOOD RECORD OF 3
const getRecentInventoryController = async (req, res) => {
    try {
      const inventory = await inventoryModel
        .find({
          organisation: req.body.userId,
        })
        .limit(3)
        .sort({ createdAt: -1 });
      return res.status(200).send({
        success: true,
        message: "recent Inventry Data",
        inventory,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Error In Recent Inventory API",
        error,
      });
    }
  };
   
//   GET DONOR RECORDS
const getDonorsController = async (req, res) => {
    try {
        const organisation = req.body.userId;
        // find donors
        const donorId = await inventoryModel.distinct("donor", {
            organisation,
        });
        // console.log(donorId);
        const donors = await userModel.find({_id: {$in: donorId} });

        return res.status(200).send({
            success:true,
            message: "Donor Record Fetched Successfully",
            donors,
        })
    }   catch (error) {
        console.log(error);
        return res.status(500).send({
            success:false,
            message: "Error in Donor Records",
            error,
        });

        }
    };

    const getHospitalController = async (req, res) => {
        try {
            const organisation = req.body.userId;
            // GET HOSPITAL ID
            const hospitalId = await inventoryModel.distinct('hospital', {
                organisation,
            });
            // FIND HOSPITAL
            const hospitals = await userModel.find({
                _id: { $in: hospitalId },
            });
            return res.status(200).send({
                success: true,
                message: "Hospitals Data Fetched Successfully",
                hospitals,
            });    
        }   catch (error) {
            console.log(error);
            return res.status(500).send({
                success: false,
                message: "Error In get Hosptial API",
                error,
            });

        };
    };

    // GET ORG PROFILES
    const getOrganisationController = async (req, res) => {
    try {
      const donor = req.body.userId;
      const orgId = await inventoryModel.distinct("organisation", { donor });
      //find org
      const organisations = await userModel.find({
        _id: { $in: orgId },
      });
      return res.status(200).send({
        success: true,
        message: "Org Data Fetched Successfully",
        organisations,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Error In ORG API",
        error,
      });
    };
  };

  // GET ORG for Hospital
  const getOrganisationForHospitalController = async (req, res) => {
    try {
      const hospital = req.body.userId;
      const orgId = await inventoryModel.distinct("organisation", { hospital });
      //find org
      const organisations = await userModel.find({
        _id: { $in: orgId },
      });
      return res.status(200).send({
        success: true,
        message: "Hospital Org Data Fetched Successfully",
        organisations,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Error In Hospital ORG API",
        error,
      });
    };
  };
module.exports = { createInventoryController, getInventoryController, getDonorsController, getHospitalController, getOrganisationController, getOrganisationForHospitalController, getInventoryHospitalController, getRecentInventoryController };
