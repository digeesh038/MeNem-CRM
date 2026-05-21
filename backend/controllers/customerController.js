import Customer from '../models/Customer.js';

// Format dates the same way everywhere ("May 21, 2026, 12:30 PM")
const formatTime = () =>
  new Date().toLocaleString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// Mongoose throws code 11000 when a unique field (like email) is duplicated.
// We convert that into a friendly error message.
const handleDuplicateKey = (err) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return { status: 400, message: `A customer with this ${field} already exists.` };
  }
  return null;
};

// POST /api/customers  —  create a new customer
export const createCustomer = async (req, res, next) => {
  try {
    const { name, company, email, phone, status, role, tier, csat, avatarUrl } = req.body;

    const customer = new Customer({ name, company, email, phone, status, role, tier, csat, avatarUrl });

    // Add the first activity to the timeline so it's never empty
    customer.activities.unshift({
      activityId: `ACT-${Date.now()}`,
      type: 'update',
      title: 'Account Created',
      time: formatTime(),
      description: 'Customer profile registered in the system.',
    });

    await customer.save();
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    const dup = handleDuplicateKey(err);
    if (dup) return res.status(dup.status).json({ success: false, message: dup.message });
    next(err); // pass anything else to the global error handler
  }
};

// GET /api/customers  —  list customers (supports search, filter, sort, paging)
export const getAllCustomers = async (req, res, next) => {
  try {
    const { search, status, tier, sort = 'newest', page = 1, limit = 100 } = req.query;

    // Build the filter object based on which query params were given
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (tier && tier !== 'All') filter.tier = tier;
    if (search) {
      // $regex with 'i' = case-insensitive partial match
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    // Map sort keys from the URL to mongoose sort objects
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name: { name: 1 },
      tier: { tier: 1 },
      csat: { csat: -1 },
    };

    // Pagination math: page 1 limit 10 -> skip 0, page 2 limit 10 -> skip 10
    const skip = (Number(page) - 1) * Number(limit);

    // Run the query + total count in parallel for speed
    const [customers, total] = await Promise.all([
      Customer.find(filter).sort(sortMap[sort] || { createdAt: -1 }).skip(skip).limit(Number(limit)),
      Customer.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, count: customers.length, total, page: Number(page), data: customers });
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/stats  —  dashboard numbers (total, active, by tier, avg csat)
export const getStats = async (req, res, next) => {
  try {
    // Run all 5 queries in parallel — much faster than awaiting one by one
    const [total, active, inactive, tierBreakdown, avgCsatResult] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ status: 'Active' }),
      Customer.countDocuments({ status: 'Inactive' }),
      Customer.aggregate([{ $group: { _id: '$tier', count: { $sum: 1 } } }]),
      Customer.aggregate([{ $group: { _id: null, avg: { $avg: '$csat' } } }]),
    ]);

    // Convert tier results from array form to a clean object with all 4 tiers
    const tiers = { Platinum: 0, Gold: 0, Silver: 0, Standard: 0 };
    tierBreakdown.forEach(t => { tiers[t._id] = t.count; });

    res.status(200).json({
      success: true,
      data: { total, active, inactive, tiers, avgCsat: avgCsatResult[0]?.avg?.toFixed(2) || '0.00' },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/:id  —  fetch one customer by their MongoDB _id
export const getSingleCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.status(200).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

// PUT /api/customers/:id  —  update an existing customer
export const updateCustomer = async (req, res, next) => {
  try {
    const { name, company, email, phone, status, role, tier, csat, avatarUrl } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    // Only overwrite fields that were actually sent in the request body
    const fields = { name, company, email, phone, status, role, tier, csat, avatarUrl };
    Object.entries(fields).forEach(([key, val]) => { if (val !== undefined) customer[key] = val; });

    // Add an activity log entry so we know an update happened
    customer.activities.unshift({
      activityId: `ACT-${Date.now()}`,
      type: 'update',
      title: 'Profile Updated',
      time: formatTime(),
      description: 'Customer record synchronized by admin.',
    });

    await customer.save();
    res.status(200).json({ success: true, data: customer });
  } catch (err) {
    const dup = handleDuplicateKey(err);
    if (dup) return res.status(dup.status).json({ success: false, message: dup.message });
    next(err);
  }
};

// DELETE /api/customers/:id  —  remove a customer
export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.status(200).json({ success: true, message: `Customer "${customer.name}" deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

// POST /api/customers/:id/activities  —  add a new activity to a customer's timeline
export const addActivity = async (req, res, next) => {
  try {
    const { type, title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Activity title is required' });

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    // unshift adds to the START of the array so the newest activity shows first
    customer.activities.unshift({
      activityId: `ACT-${Date.now()}`,
      type: type || 'other',
      title,
      time: formatTime(),
      description: description || '',
    });

    await customer.save();
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};
