import express from 'express';
import multer from 'multer';
import { EmployeeController } from '../controllers/employee.controller.js';
import { authenticate, hasPermission } from '../middleware/auth.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const controller = new EmployeeController();

router.use(authenticate);

// ⚠️ IMPORTANT: Specific routes MUST come BEFORE parameterized routes
// Otherwise /export would match /:id and treat "export" as an ID

// Specific action routes (must be first)
router.post('/import', hasPermission('employees', 'import'), upload.single('file'), (req, res) => controller.uploadExcel(req, res));
router.post('/update', hasPermission('employees', 'import'), upload.single('file'), (req, res) => controller.updateExcel(req, res));
router.get('/export', hasPermission('employees', 'export'), (req, res) => controller.downloadExcel(req, res));

// Generic CRUD routes (must be after specific routes)
router.get('/', hasPermission('employees', 'read'), (req, res) => controller.getAll(req, res));
router.get('/:id', hasPermission('employees', 'read'), (req, res) => controller.getById(req, res));
router.post('/', hasPermission('employees', 'write'), (req, res) => controller.create(req, res));
router.put('/:id', hasPermission('employees', 'write'), (req, res) => controller.update(req, res));
router.delete('/:id', hasPermission('employees', 'delete'), (req, res) => controller.deleteEmployee(req, res));

export default router;