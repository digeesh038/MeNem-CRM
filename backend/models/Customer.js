import mongoose from 'mongoose';

// Each customer can have a timeline of activities (created, updated, etc.)
const activitySchema = new mongoose.Schema(
  {
    activityId: { type: String, default: () => `ACT-${Date.now()}` },
    type: {
      type: String,
      enum: ['call', 'email', 'update', 'meeting', 'other'],
      default: 'update',
    },
    title: { type: String, required: true, trim: true },
    time: {
      type: String,
      default: () =>
        new Date().toLocaleString('en-US', {
          month: 'short', day: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
    },
    description: { type: String, default: '' },
  },
  { _id: false }
);

// Main customer document
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    company: { type: String, trim: true, default: '' },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // no duplicate emails allowed
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: { values: ['Active', 'Inactive'], message: 'Status must be Active or Inactive' },
      default: 'Active',
    },
    role: { type: String, trim: true, default: 'Manager' },
    avatarInitials: { type: String, default: 'AC', maxlength: 2 },
    avatarUrl: { type: String, default: '' },
    tier: {
      type: String,
      enum: { values: ['Platinum', 'Gold', 'Silver', 'Standard'], message: 'Invalid tier level' },
      default: 'Gold',
    },
    csat: {
      type: Number,
      default: 4.5,
      min: [1, 'CSAT cannot be below 1'],
      max: [5, 'CSAT cannot exceed 5'],
    },
    activities: { type: [activitySchema], default: [] },
  },
  { timestamps: true } // adds createdAt + updatedAt automatically
);

// Build initials from the customer's name. Runs before every save.
// "John Smith" -> "JS"    "Ram" -> "RA"
customerSchema.pre('save', async function () {
  if (this.isModified('name') || this.isNew) {
    const parts = this.name.trim().split(' ').filter(Boolean);
    this.avatarInitials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : this.name.slice(0, 2).toUpperCase();
  }
});

// Indexes — make searches and filters faster
customerSchema.index({ name: 'text', email: 'text', company: 'text' });
customerSchema.index({ status: 1, tier: 1, createdAt: -1 });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
