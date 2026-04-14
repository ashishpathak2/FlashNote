import express from 'express';
import Card from '../models/Card.js';
import Deck from '../models/Deck.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET session cards for a deck
router.get('/session/:deckId', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const due = await Card.find({
      deck: req.params.deckId, user: req.user._id,
      dueDate: { $lte: new Date() }, state: { $ne: 'mastered' },
    }).limit(limit).sort({ dueDate: 1 });

    let cards = [...due];
    if (cards.length < limit) {
      const newCards = await Card.find({
        deck: req.params.deckId, user: req.user._id,
        state: 'new', _id: { $nin: cards.map((c) => c._id) },
      }).limit(limit - cards.length);
      cards = [...cards, ...newCards];
    }

    // Shuffle
    cards.sort(() => Math.random() - 0.5);
    res.json({ cards, total: cards.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST review a card — quality 0(again) 1(hard) 3(good) 5(easy)
router.post('/review/:cardId', protect, async (req, res) => {
  try {
    const { quality } = req.body;
    if (quality == null || quality < 0 || quality > 5)
      return res.status(400).json({ message: 'quality must be 0–5' });

    const card = await Card.findOne({ _id: req.params.cardId, user: req.user._id });
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const prevState = card.state;
    card.applyReview(quality);
    await card.save();

    // Update deck mastery count
    const deck = await Deck.findById(card.deck);
    if (deck) {
      const mastered = await Card.countDocuments({ deck: deck._id, state: 'mastered' });
      deck.masteredCards  = mastered;
      deck.lastStudiedAt  = new Date();
      await deck.save();
    }

    // Update user streak
    const user = await User.findById(req.user._id);
    user.totalCardsReviewed += 1;
    const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0);
    if (user.lastStudiedAt) {
      const last = new Date(user.lastStudiedAt); last.setHours(0,0,0,0);
      const diff = Math.floor((todayMidnight - last) / 86400000);
      if (diff === 0) { /* same day */ }
      else if (diff === 1) user.streak += 1;
      else user.streak = 1;
    } else {
      user.streak = 1;
    }
    user.lastStudiedAt = new Date();
    await user.save();

    res.json({
      card,
      streak:        user.streak,
      newlyMastered: prevState !== 'mastered' && card.state === 'mastered',
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET global study stats
router.get('/stats', protect, async (req, res) => {
  try {
    const uid = req.user._id;
    const [totalDecks, totalCards, masteredCards, dueToday, user] = await Promise.all([
      Deck.countDocuments({ user: uid }),
      Card.countDocuments({ user: uid }),
      Card.countDocuments({ user: uid, state: 'mastered' }),
      Card.countDocuments({ user: uid, dueDate: { $lte: new Date() }, state: { $ne: 'mastered' } }),
      User.findById(uid),
    ]);

    res.json({
      totalDecks, totalCards, masteredCards, dueToday,
      streak:         user.streak,
      totalReviewed:  user.totalCardsReviewed,
      masteryPercent: totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
