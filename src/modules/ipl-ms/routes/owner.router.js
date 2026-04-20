import { Router } from "express";
import * as controller from "../controllers/owner.controller.js";

const router = Router();

// 1: Create a new owner
router.post("/", controller.createOwner);

// 2: Get all users
router.get("/", controller.getAllOwners);

// 3: Get owner by id
router.get("/:id", controller.getOwnerById);

// 4: Update owner
router.put("/:id", controller.updateOwner);

// 5: Delete owner
router.delete("/:id", controller.deleteOwner);

export default router;
