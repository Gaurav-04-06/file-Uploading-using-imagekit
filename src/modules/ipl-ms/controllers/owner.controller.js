import * as ownerService from "../services/owner.service.js"
import ApiResponse from "../../../common/utils/api-response.js"

const createOwner = async (req, res) => {
    const owner = await ownerService.createOwner(req.body);
    ApiResponse.created(res, "Owner successfully created: ", owner);
};

const getAllOwners = async (req, res) => {
    const allOwners = await ownerService.getAllOwners();
    ApiResponse.ok(res, "Owners: ", allOwners);
};

const getOwnerById = async (req, res) => {
    const owner = await ownerService.getOwnerById(req.params.id);
    ApiResponse.ok(res , "Owner by id: ", owner);
};

const updateOwner = async (req, res) => {
    const updatedOwner = await ownerService.updateOwner(req.params.id, req.body);
    ApiResponse.ok(res, "Updated the details: ", updatedOwner);
};

const deleteOwner = async (req, res) => {
    await ownerService.deleteOwner(req.params.id);
    ApiResponse.ok(res, "Owner deteled successfully");
};

export {
    createOwner,
    getAllOwners,
    getOwnerById,
    updateOwner,
    deleteOwner
};
