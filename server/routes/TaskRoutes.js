const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protectAdmin, authorizeAdmin } = require('../middlewares/AdminAuth');

// GET all tasks (Admin only)
// GET all tasks (Admin only)
router.get('/', protectAdmin, authorizeAdmin('MainAdmin','SalesAdmin', 'AgentAdmin'), async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedToAdmin', 'name email') // Admin info
      .populate('clientId', 'name email userType') // Client info
      .lean();

    const formattedTasks = tasks.map(task => ({
      ...task,
      id: task._id.toString(),
      assignedToAdmin: task.assignedToAdmin ? {
        id: task.assignedToAdmin._id.toString(),
        name: task.assignedToAdmin.name,
        email: task.assignedToAdmin.email
      } : null,
      clientId: task.clientId ? {
        id: task.clientId._id.toString(),
        name: task.clientId.name,
        email: task.clientId.email,
        userType: task.clientId.userType
      } : null
    }));

    res.json(formattedTasks);  // ✅ send only once

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET single task
router.get('/:id', protectAdmin, authorizeAdmin('MainAdmin','SalesAdmin', 'AgentAdmin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedToAdmin', 'id name email')
      .populate('clientId', 'name email userType');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE task
router.post('/', protectAdmin, authorizeAdmin('MainAdmin'), async (req, res) => {
  try {
    const { title, description, category, priority, assignedToAdmin, clientId, clientType, dueDate, notes } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!description) missingFields.push("description");
    if (!category) missingFields.push("category");
    if (!assignedToAdmin) missingFields.push("assignedToAdmin");
    if (!clientId) missingFields.push("clientId");
    if (!clientType) missingFields.push("clientType");
    if (!dueDate) missingFields.push("dueDate");

    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const task = new Task({
      title,
      description,
      category,
      priority,
      assignedToAdmin,
      clientId,
      clientType,
      dueDate,
      notes
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(400).json({ message: err.message });
  }
});

// UPDATE task
router.put('/:id', protectAdmin, authorizeAdmin('MainAdmin'), async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE task
router.delete('/:id', protectAdmin, authorizeAdmin('MainAdmin'), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch("/:id/complete", protectAdmin, authorizeAdmin('MainAdmin','SalesAdmin', 'AgentAdmin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = "Completed";
    await task.save();

    res.json({ success: true, message: "Task marked as completed", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
