import express from 'express';
import { ClearanceController } from '../controllers/clearance.controller.js';
import { authenticate, hasPermission } from '../middleware/auth.middleware.js';
const router = express.Router();
const controller = new ClearanceController();
router.use(authenticate);
// Generate clearance form for a specific employee
router.get('/:empcode', hasPermission('employees', 'read'), (req, res) => controller.generateClearanceForm(req, res));
export default router;
//# sourceMappingURL=clearance.routes.js.map