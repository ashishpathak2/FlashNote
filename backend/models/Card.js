import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  deck:  { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', required: true },
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  front: { type: String, required: true },
  back:  { type: String, required: true },
  hint:  { type: String, default: '' },
  type:  {
    type: String,
    enum: ['concept', 'definition', 'example', 'relationship', 'edge-case', 'formula'],
    default: 'concept',
  },
  tags: [String],

  // SM-2 fields
  easeFactor:  { type: Number, default: 2.5 },
  interval:    { type: Number, default: 0 },
  repetitions: { type: Number, default: 0 },
  dueDate:     { type: Date, default: Date.now },
  lastReviewDate: { type: Date },

  // Stats
  totalReviews:   { type: Number, default: 0 },
  correctReviews: { type: Number, default: 0 },
  state: {
    type: String,
    enum: ['new', 'learning', 'review', 'mastered'],
    default: 'new',
  },
  createdAt: { type: Date, default: Date.now },
});

// SM-2 algorithm: quality 0–5
cardSchema.methods.applyReview = function (quality) {
  this.totalReviews   += 1;
  this.lastReviewDate  = new Date();

  if (quality >= 3) {
    this.correctReviews += 1;
    if (this.repetitions === 0)      this.interval = 1;
    else if (this.repetitions === 1) this.interval = 6;
    else this.interval = Math.round(this.interval * this.easeFactor);

    this.repetitions += 1;
    this.easeFactor = Math.max(
      1.3,
      this.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    );
  } else {
    this.repetitions = 0;
    this.interval    = 1;
  }

  this.interval = Math.min(this.interval, 365);

  const next = new Date();
  next.setDate(next.getDate() + this.interval);
  this.dueDate = next;

  // Derive state
  const acc = this.totalReviews > 0 ? this.correctReviews / this.totalReviews : 0;
  if (this.repetitions === 0) this.state = 'new';
  else if (this.repetitions < 3) this.state = 'learning';
  else if (this.interval >= 21 && acc >= 0.85) this.state = 'mastered';
  else this.state = 'review';
};

export default mongoose.model('Card', cardSchema);
