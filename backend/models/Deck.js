import mongoose from 'mongoose';

const deckSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  subject: { type: String, default: 'General' },
  emoji: { type: String, default: '📚' },
  accentColor: { type: String, default: '#a78bfa' },
  totalCards: { type: Number, default: 0 },
  masteredCards: { type: Number, default: 0 },
  dueCards: { type: Number, default: 0 },
  lastStudiedAt: { type: Date },
  status: { type: String, enum: ['processing', 'ready', 'error'], default: 'ready' },
  sourceFile: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

deckSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

deckSchema.virtual('masteryPercent').get(function () {
  if (!this.totalCards) return 0;
  return Math.round((this.masteredCards / this.totalCards) * 100);
});

deckSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Deck', deckSchema);
