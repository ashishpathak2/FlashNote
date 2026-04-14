import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import Deck from '../models/Deck.js';
import Card from '../models/Card.js';
import { protect } from '../middleware/auth.js';
import { generateFlashcardsFromText } from '../utils/aiGenerator.js';

const router = express.Router();

// 25 MB file limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
});

const EMOJIS = ['📚','🧠','⚡','🎯','🔬','📐','🌍','💡','🧪','📖','🏛️','🎨','🔭','🧮','📊'];
const pick   = arr => arr[Math.floor(Math.random() * arr.length)];

// ── GET all decks ──────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const decks = await Deck.find({ user: req.user._id }).sort({ updatedAt: -1 });
    const enriched = await Promise.all(decks.map(async deck => {
      const [due, mastered] = await Promise.all([
        Card.countDocuments({ deck: deck._id, dueDate: { $lte: new Date() }, state: { $ne: 'mastered' } }),
        Card.countDocuments({ deck: deck._id, state: 'mastered' }),
      ]);
      deck.dueCards = due;
      deck.masteredCards = mastered;
      await deck.save();
      return deck;
    }));
    res.json(enriched);
  } catch (e) {
    console.error('[GET /decks]', e);
    res.status(500).json({ message: e.message });
  }
});

// ── GET single deck ────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const deck = await Deck.findOne({ _id: req.params.id, user: req.user._id });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    const [due, mastered] = await Promise.all([
      Card.countDocuments({ deck: deck._id, dueDate: { $lte: new Date() }, state: { $ne: 'mastered' } }),
      Card.countDocuments({ deck: deck._id, state: 'mastered' }),
    ]);
    deck.dueCards = due;
    deck.masteredCards = mastered;
    await deck.save();
    res.json(deck);
  } catch (e) {
    console.error('[GET /decks/:id]', e);
    res.status(500).json({ message: e.message });
  }
});

// ── POST create manual deck ────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, subject, emoji, accentColor } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const deck = await Deck.create({
      user: req.user._id,
      title, description: description || '',
      subject: subject || 'General',
      emoji: emoji || pick(EMOJIS),
      accentColor: accentColor || '#0a0a0a',
    });
    res.status(201).json(deck);
  } catch (e) {
    console.error('[POST /decks]', e);
    res.status(500).json({ message: e.message });
  }
});

// ── POST upload PDF → AI cards ─────────────────────────────
router.post('/upload-pdf', protect, (req, res, next) => {
  // Wrap multer so we can return clean JSON errors
  upload.single('pdf')(req, res, err => {
    if (err) {
      console.error('[upload-pdf] Multer error:', err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'PDF is too large. Maximum size is 25 MB.' });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  let deck = null; // track so we can delete on failure

  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF file uploaded.' });

    const { title, description } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Please provide a title for this deck.' });

    console.log(`[upload-pdf] File: ${req.file.originalname}, Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    // ── Step 1: Parse PDF ──────────────────────────────────
    let pdfData;
    try {
      pdfData = await pdfParse(req.file.buffer);
    } catch (parseErr) {
      console.error('[upload-pdf] PDF parse error:', parseErr.message);
      return res.status(422).json({
        message: 'Could not read this PDF. Make sure it contains selectable/searchable text and is not a scanned image.',
      });
    }

    const text = pdfData.text || '';
    console.log(`[upload-pdf] Extracted text: ${text.length} chars, Pages: ${pdfData.numpages}`);

    if (text.trim().length < 100) {
      return res.status(422).json({
        message: 'This PDF has very little readable text. It may be a scanned image PDF — please use a text-based PDF.',
      });
    }

    // ── Step 2: AI generation (before creating deck) ───────
    let generated;
    try {
      generated = await generateFlashcardsFromText(text, title.trim(), pdfData.numpages || 0);
    } catch (aiErr) {
      console.error('[upload-pdf] AI generation error:', aiErr.message);
      // Don't create a broken deck — return error immediately
      return res.status(500).json({
        message: aiErr.message || 'AI failed to generate cards. Please try again.',
      });
    }

    // ── Step 3: Save deck + cards only after AI succeeds ───
    deck = await Deck.create({
      user: req.user._id,
      title: title.trim(),
      description: description?.trim() || generated.summary || '',
      subject: generated.subject || 'General',
      emoji: pick(EMOJIS),
      accentColor: '#0a0a0a',
      status: 'ready',
      sourceFile: req.file.originalname,
      totalCards: generated.cards.length,
    });

    const cardDocs = generated.cards.map(c => ({
      deck: deck._id,
      user: req.user._id,
      front: c.front,
      back:  c.back,
      hint:  c.hint || '',
      type:  c.type || 'concept',
      tags:  c.tags || [],
    }));

    await Card.insertMany(cardDocs);
    console.log(`[upload-pdf] ✓ Deck "${title}" created with ${cardDocs.length} cards`);

    res.status(201).json({ deck, cardCount: cardDocs.length });

  } catch (e) {
    console.error('[upload-pdf] Unexpected error:', e);

    // Clean up partial deck if it was created before the error
    if (deck?._id) {
      try {
        await Deck.findByIdAndDelete(deck._id);
        await Card.deleteMany({ deck: deck._id });
        console.log('[upload-pdf] Cleaned up partial deck:', deck._id);
      } catch (cleanupErr) {
        console.error('[upload-pdf] Cleanup error:', cleanupErr.message);
      }
    }

    res.status(500).json({ message: e.message || 'An unexpected error occurred. Please try again.' });
  }
});

// ── PATCH update deck ──────────────────────────────────────
router.patch('/:id', protect, async (req, res) => {
  try {
    const deck = await Deck.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true }
    );
    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    res.json(deck);
  } catch (e) {
    console.error('[PATCH /decks/:id]', e);
    res.status(500).json({ message: e.message });
  }
});

// ── DELETE deck ────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const deck = await Deck.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    const deleted = await Card.deleteMany({ deck: deck._id });
    console.log(`[DELETE /decks/:id] Deleted deck "${deck.title}" and ${deleted.deletedCount} cards`);
    res.json({ message: 'Deck deleted successfully' });
  } catch (e) {
    console.error('[DELETE /decks/:id]', e);
    res.status(500).json({ message: e.message });
  }
});

export default router;
