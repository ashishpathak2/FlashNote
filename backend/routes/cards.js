import express from 'express';
import Card from '../models/Card.js';
import Deck from '../models/Deck.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET cards for a deck
router.get('/deck/:deckId', protect, async (req, res) => {
  try {
    const cards = await Card.find({ deck: req.params.deckId, user: req.user._id })
      .sort({ createdAt: 1 });
    res.json(cards);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST create card
router.post('/', protect, async (req, res) => {
  try {
    const { deckId, front, back, hint, type, tags } = req.body;
    const deck = await Deck.findOne({ _id: deckId, user: req.user._id });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    const card = await Card.create({
      deck: deckId, user: req.user._id,
      front, back, hint: hint || '', type: type || 'concept', tags: tags || [],
    });
    deck.totalCards += 1;
    await deck.save();
    res.status(201).json(card);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PATCH update card
router.patch('/:id', protect, async (req, res) => {
  try {
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true }
    );
    if (!card) return res.status(404).json({ message: 'Card not found' });
    res.json(card);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE card
router.delete('/:id', protect, async (req, res) => {
  try {
    const card = await Card.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!card) return res.status(404).json({ message: 'Card not found' });
    const deck = await Deck.findById(card.deck);
    if (deck) { deck.totalCards = Math.max(0, deck.totalCards - 1); await deck.save(); }
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
