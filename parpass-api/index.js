const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'ParPass API is running', docs: '/docs' });
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         zip:
 *           type: string
 *         holes:
 *           type: integer
 *         tier_required:
 *           type: string
 *           enum: [core, premium]
 *         phone:
 *           type: string
 *     Member:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         email:
 *           type: string
 *         parpass_code:
 *           type: string
 *         status:
 *           type: string
 *         health_plan_name:
 *           type: string
 *         tier:
 *           type: string
 *         monthly_rounds:
 *           type: integer
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: tier
 *         schema:
 *           type: string
 *           enum: [core, premium]
 *         description: Filter by tier
 *     responses:
 *       200:
 *         description: List of courses
 *   post:
 *     summary: Add a new course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - city
 *               - state
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zip:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               holes:
 *                 type: integer
 *                 default: 18
 *               tier_required:
 *                 type: string
 *                 enum: [core, premium]
 *                 default: core
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created
 */
app.get('/api/courses', async (req, res) => {
  try {
    const { tier } = req.query;
    let query = `
      SELECT
        gc.*,
        ROUND(AVG(r.rating)::numeric, 1) as average_rating,
        COUNT(r.id) as review_count
      FROM golf_courses gc
      LEFT JOIN reviews r ON gc.id = r.course_id
      WHERE gc.is_active = true
    `;
    const params = [];

    if (tier) {
      query += ' AND gc.tier_required = $1';
      params.push(tier);
    }

    query += ' GROUP BY gc.id ORDER BY gc.name';
    const result = await db.query(query, params);

    // Convert types
    const courses = result.rows.map(row => ({
      ...row,
      average_rating: row.average_rating ? parseFloat(row.average_rating) : null,
      review_count: parseInt(row.review_count)
    }));

    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { name, address, city, state, zip, latitude, longitude, holes = 18, tier_required = 'core', phone } = req.body;
    
    const result = await db.query(`
      INSERT INTO golf_courses (name, address, city, state, zip, latitude, longitude, holes, tier_required, phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [name, address, city, state, zip, latitude, longitude, holes, tier_required, phone]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details
 *       404:
 *         description: Course not found
 */
app.get('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM golf_courses WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/members:
 *   post:
 *     summary: Add a new member
 *     tags: [Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - health_plan_id
 *               - first_name
 *               - last_name
 *               - email
 *             properties:
 *               health_plan_id:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Member created
 */
app.post('/api/members', async (req, res) => {
  try {
    const { health_plan_id, first_name, last_name, email } = req.body;
    
    // Generate a unique ParPass code
    const codeResult = await db.query('SELECT COUNT(*) FROM members');
    const count = parseInt(codeResult.rows[0].count) + 1;
    const parpass_code = `PP${String(100000 + count).slice(1)}`;
    
    const result = await db.query(`
      INSERT INTO members (health_plan_id, first_name, last_name, email, parpass_code)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [health_plan_id, first_name, last_name, email, parpass_code]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/members/code/{code}:
 *   get:
 *     summary: Get member by ParPass code
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         example: PP100001
 *     responses:
 *       200:
 *         description: Member details
 *       404:
 *         description: Member not found
 */
app.get('/api/members/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const result = await db.query(`
      SELECT 
        m.*,
        hp.name as health_plan_name,
        pt.name as tier,
        pt.monthly_rounds
      FROM members m
      JOIN health_plans hp ON m.health_plan_id = hp.id
      JOIN plan_tiers pt ON hp.plan_tier_id = pt.id
      WHERE m.parpass_code = $1
    `, [code]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/members/{id}/usage:
 *   get:
 *     summary: Get member's rounds used this month
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usage info
 */
app.get('/api/members/:id/usage', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT COUNT(*) as rounds_used
      FROM golf_utilization
      WHERE member_id = $1
      AND checked_in_at >= DATE_TRUNC('month', NOW())
    `, [id]);
    
    res.json({ rounds_used: parseInt(result.rows[0].rounds_used) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/check-in:
 *   post:
 *     summary: Check in a member at a course
 *     tags: [Check-in]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - member_id
 *               - course_id
 *             properties:
 *               member_id:
 *                 type: string
 *               course_id:
 *                 type: string
 *               holes_played:
 *                 type: integer
 *                 default: 18
 *     responses:
 *       201:
 *         description: Check-in successful
 *       403:
 *         description: Not allowed (inactive, limit reached, or tier mismatch)
 */
app.post('/api/check-in', async (req, res) => {
  try {
    const { member_id, course_id, holes_played = 18 } = req.body;
    
    const memberResult = await db.query(`
      SELECT m.*, pt.name as tier, pt.monthly_rounds
      FROM members m
      JOIN health_plans hp ON m.health_plan_id = hp.id
      JOIN plan_tiers pt ON hp.plan_tier_id = pt.id
      WHERE m.id = $1
    `, [member_id]);
    
    if (memberResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    const member = memberResult.rows[0];
    
    if (member.status !== 'active') {
      return res.status(403).json({ error: 'Member is not active' });
    }
    
    const usageResult = await db.query(`
      SELECT COUNT(*) as rounds_used
      FROM golf_utilization
      WHERE member_id = $1
      AND checked_in_at >= DATE_TRUNC('month', NOW())
    `, [member_id]);
    
    const roundsUsed = parseInt(usageResult.rows[0].rounds_used);
    
    if (roundsUsed >= member.monthly_rounds) {
      return res.status(403).json({ error: 'Monthly round limit reached' });
    }
    
    const courseResult = await db.query('SELECT * FROM golf_courses WHERE id = $1', [course_id]);
    
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const course = courseResult.rows[0];
    
    if (course.tier_required === 'premium' && member.tier === 'core') {
      return res.status(403).json({ error: 'Premium course requires premium membership' });
    }
    
    const checkInResult = await db.query(`
      INSERT INTO golf_utilization (member_id, course_id, holes_played)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [member_id, course_id, holes_played]);
    
    res.status(201).json({
      check_in: checkInResult.rows[0],
      rounds_remaining: member.monthly_rounds - roundsUsed - 1
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/members/{id}/favorites:
 *   get:
 *     summary: Get member's favorite courses
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of favorite courses
 *   post:
 *     summary: Add a course to favorites
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *             properties:
 *               course_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Favorite added
 */
app.get('/api/members/:id/favorites', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT gc.*
      FROM favorites f
      JOIN golf_courses gc ON f.course_id = gc.id
      WHERE f.member_id = $1
      ORDER BY gc.name
    `, [id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/members/:id/favorites', async (req, res) => {
  try {
    const { id } = req.params;
    const { course_id } = req.body;
    
    const result = await db.query(`
      INSERT INTO favorites (member_id, course_id)
      VALUES ($1, $2)
      ON CONFLICT (member_id, course_id) DO NOTHING
      RETURNING *
    `, [id, course_id]);
    
    res.status(201).json(result.rows[0] || { message: 'Already favorited' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/members/{id}/favorites/{courseId}:
 *   delete:
 *     summary: Remove a course from favorites
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite removed
 */
app.delete('/api/members/:id/favorites/:courseId', async (req, res) => {
  try {
    const { id, courseId } = req.params;
    
    await db.query(`
      DELETE FROM favorites
      WHERE member_id = $1 AND course_id = $2
    `, [id, courseId]);
    
    res.json({ message: 'Favorite removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/health-plans:
 *   get:
 *     summary: Get all health plans
 *     tags: [Health Plans]
 *     responses:
 *       200:
 *         description: List of health plans
 */
app.get('/api/health-plans', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT hp.*, pt.name as tier_name, pt.monthly_rounds
      FROM health_plans hp
      JOIN plan_tiers pt ON hp.plan_tier_id = pt.id
      WHERE hp.is_active = true
      ORDER BY hp.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/members/{id}/history:
 *   get:
 *     summary: Get member's round history
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of rounds played
 */
app.get('/api/members/:id/history', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(`
        SELECT 
          gu.id,
          gu.checked_in_at,
          gu.holes_played,
          gc.name as course_name,
          gc.city,
          gc.state,
          gc.tier_required
        FROM golf_utilization gu
        JOIN golf_courses gc ON gu.course_id = gc.id
        WHERE gu.member_id = $1
        ORDER BY gu.checked_in_at DESC
        LIMIT 50
      `, [id]);
      
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
/**
 * @swagger
 * /api/stats/overview:
 *   get:
 *     summary: Get overall platform stats
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Platform statistics
 */
app.get('/api/stats/overview', async (req, res) => {
    try {
      const stats = await db.query(`
        SELECT
          (SELECT COUNT(*) FROM members WHERE status = 'active') as active_members,
          (SELECT COUNT(*) FROM golf_courses WHERE is_active = true) as total_courses,
          (SELECT COUNT(*) FROM golf_utilization) as total_rounds,
          (SELECT COUNT(*) FROM golf_utilization WHERE checked_in_at >= DATE_TRUNC('month', NOW())) as rounds_this_month
      `);
      res.json(stats.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  /**
   * @swagger
   * /api/stats/popular-courses:
   *   get:
   *     summary: Get most popular courses
   *     tags: [Stats]
   *     responses:
   *       200:
   *         description: List of courses by popularity
   */
  app.get('/api/stats/popular-courses', async (req, res) => {
    try {
      const result = await db.query(`
        SELECT 
          gc.id,
          gc.name,
          gc.city,
          gc.tier_required,
          COUNT(gu.id) as total_rounds,
          COUNT(DISTINCT gu.member_id) as unique_members
        FROM golf_courses gc
        LEFT JOIN golf_utilization gu ON gc.id = gu.course_id
        WHERE gc.is_active = true
        GROUP BY gc.id, gc.name, gc.city, gc.tier_required
        ORDER BY total_rounds DESC
        LIMIT 10
      `);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  /**
   * @swagger
   * /api/stats/rounds-by-month:
   *   get:
   *     summary: Get rounds played by month
   *     tags: [Stats]
   *     responses:
   *       200:
   *         description: Monthly round counts
   */
  app.get('/api/stats/rounds-by-month', async (req, res) => {
    try {
      const result = await db.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', checked_in_at), 'Mon YYYY') as month,
          DATE_TRUNC('month', checked_in_at) as month_date,
          COUNT(*) as rounds
        FROM golf_utilization
        WHERE checked_in_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', checked_in_at)
        ORDER BY month_date ASC
      `);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  /**
   * @swagger
   * /api/stats/tier-breakdown:
   *   get:
   *     summary: Get rounds by tier
   *     tags: [Stats]
   *     responses:
   *       200:
   *         description: Tier usage breakdown
   */
  app.get('/api/stats/tier-breakdown', async (req, res) => {
    try {
      const result = await db.query(`
        SELECT 
          gc.tier_required as tier,
          COUNT(gu.id) as rounds
        FROM golf_utilization gu
        JOIN golf_courses gc ON gu.course_id = gc.id
        GROUP BY gc.tier_required
      `);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  /**
   * @swagger
   * /api/stats/top-members:
   *   get:
   *     summary: Get most active members
   *     tags: [Stats]
   *     responses:
   *       200:
   *         description: List of top members by usage
   */
  app.get('/api/stats/top-members', async (req, res) => {
    try {
      const result = await db.query(`
        SELECT 
          m.id,
          m.first_name,
          m.last_name,
          hp.name as health_plan,
          pt.name as tier,
          COUNT(gu.id) as total_rounds
        FROM members m
        JOIN health_plans hp ON m.health_plan_id = hp.id
        JOIN plan_tiers pt ON hp.plan_tier_id = pt.id
        LEFT JOIN golf_utilization gu ON m.id = gu.member_id
        WHERE m.status = 'active'
        GROUP BY m.id, m.first_name, m.last_name, hp.name, pt.name
        ORDER BY total_rounds DESC
        LIMIT 10
      `);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  /**
 * @swagger
 * /api/members/{id}/recommendations:
 *   get:
 *     summary: Get personalized course recommendations
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of recommended courses
 */
app.get('/api/members/:id/recommendations', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get member's tier
      const memberResult = await db.query(`
        SELECT m.id, pt.name as tier
        FROM members m
        JOIN health_plans hp ON m.health_plan_id = hp.id
        JOIN plan_tiers pt ON hp.plan_tier_id = pt.id
        WHERE m.id = $1
      `, [id]);
      
      if (memberResult.rows.length === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }
      
      const member = memberResult.rows[0];
      const isPremium = member.tier === 'premium';
      
      // Get courses the member has already played
      const playedResult = await db.query(`
        SELECT DISTINCT course_id FROM golf_utilization WHERE member_id = $1
      `, [id]);
      const playedIds = playedResult.rows.map(r => r.course_id);
      
      // Get cities the member has played in
      const citiesResult = await db.query(`
        SELECT DISTINCT gc.city 
        FROM golf_utilization gu
        JOIN golf_courses gc ON gu.course_id = gc.id
        WHERE gu.member_id = $1
      `, [id]);
      const playedCities = citiesResult.rows.map(r => r.city);
      
      // Build recommendation query
      // Prioritize: 
      // 1. Courses in cities they've played (familiar area)
      // 2. Popular courses among same-tier members
      // 3. Courses they haven't played yet
      const recommendations = await db.query(`
        WITH course_popularity AS (
          SELECT 
            gc.id,
            gc.name,
            gc.city,
            gc.state,
            gc.tier_required,
            gc.holes,
            gc.phone,
            COUNT(gu.id) as total_plays,
            COUNT(DISTINCT gu.member_id) as unique_players
          FROM golf_courses gc
          LEFT JOIN golf_utilization gu ON gc.id = gu.course_id
          WHERE gc.is_active = true
          ${isPremium ? '' : "AND gc.tier_required = 'core'"}
          GROUP BY gc.id
        )
        SELECT 
          *,
          CASE 
            WHEN city = ANY($2) THEN 30
            ELSE 0
          END +
          CASE 
            WHEN total_plays > 5 THEN 20
            WHEN total_plays > 2 THEN 10
            ELSE 0
          END +
          CASE
            WHEN unique_players > 3 THEN 15
            WHEN unique_players > 1 THEN 8
            ELSE 0
          END as score
        FROM course_popularity
        WHERE id != ALL($1)
        ORDER BY score DESC, total_plays DESC
        LIMIT 5
      `, [playedIds.length > 0 ? playedIds : ['00000000-0000-0000-0000-000000000000'], playedCities]);
      
      // Add recommendation reasons
      const withReasons = recommendations.rows.map(course => {
        const reasons = [];
        if (playedCities.includes(course.city)) {
          reasons.push(`You've played in ${course.city} before`);
        }
        if (parseInt(course.unique_players) > 1) {
          reasons.push(`Popular with ${course.unique_players} members`);
        }
        if (course.tier_required === 'premium') {
          reasons.push('Premium course');
        }
        if (reasons.length === 0) {
          reasons.push('Recommended for you');
        }
        
        return {
          ...course,
          reason: reasons[0]
        };
      });
      
      res.json(withReasons);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

/**
 * @swagger
 * /api/courses/{id}/reviews:
 *   get:
 *     summary: Get all reviews for a course
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 *   post:
 *     summary: Add or update a review for a course
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - member_id
 *               - rating
 *             properties:
 *               member_id:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created/updated
 *       403:
 *         description: Member has not played this course
 */
app.get('/api/courses/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        m.first_name as member_first_name
      FROM reviews r
      JOIN members m ON r.member_id = m.id
      WHERE r.course_id = $1
      ORDER BY r.created_at DESC
    `, [id]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/courses/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { member_id, rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if member has played this course
    const playedResult = await db.query(`
      SELECT id FROM golf_utilization
      WHERE member_id = $1 AND course_id = $2
      LIMIT 1
    `, [member_id, id]);

    if (playedResult.rows.length === 0) {
      return res.status(403).json({ error: 'You must play this course before leaving a review' });
    }

    // Upsert review
    const result = await db.query(`
      INSERT INTO reviews (member_id, course_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (member_id, course_id)
      DO UPDATE SET rating = $3, comment = $4, created_at = NOW()
      RETURNING *
    `, [member_id, id, rating, comment || null]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/courses/{id}/rating:
 *   get:
 *     summary: Get average rating for a course
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course rating summary
 */
app.get('/api/courses/:id/rating', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT
        ROUND(AVG(rating)::numeric, 1) as average_rating,
        COUNT(*) as review_count
      FROM reviews
      WHERE course_id = $1
    `, [id]);

    const row = result.rows[0];
    res.json({
      average_rating: row.average_rating ? parseFloat(row.average_rating) : null,
      review_count: parseInt(row.review_count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/members/{id}/preferences:
 *   get:
 *     summary: Get member's preferences/survey data
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member preferences
 *       404:
 *         description: No preferences found
 *   put:
 *     summary: Save or update member's preferences/survey data
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skill_level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               goals:
 *                 type: array
 *                 items:
 *                   type: string
 *               play_frequency:
 *                 type: string
 *                 enum: [weekly, biweekly, monthly, occasionally]
 *               preferred_time:
 *                 type: string
 *                 enum: [morning, afternoon, evening, flexible]
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               notifications_enabled:
 *                 type: boolean
 *               push_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Preferences saved
 */
app.get('/api/members/:id/preferences', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT * FROM member_preferences WHERE member_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No preferences found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/members/:id/preferences', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      skill_level,
      goals,
      play_frequency,
      preferred_time,
      interests,
      notifications_enabled,
      push_token
    } = req.body;

    // Check if member exists
    const memberCheck = await db.query('SELECT id FROM members WHERE id = $1', [id]);
    if (memberCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Upsert preferences
    const result = await db.query(`
      INSERT INTO member_preferences (
        member_id,
        skill_level,
        goals,
        play_frequency,
        preferred_time,
        interests,
        notifications_enabled,
        push_token,
        onboarding_completed_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (member_id)
      DO UPDATE SET
        skill_level = COALESCE($2, member_preferences.skill_level),
        goals = COALESCE($3, member_preferences.goals),
        play_frequency = COALESCE($4, member_preferences.play_frequency),
        preferred_time = COALESCE($5, member_preferences.preferred_time),
        interests = COALESCE($6, member_preferences.interests),
        notifications_enabled = COALESCE($7, member_preferences.notifications_enabled),
        push_token = COALESCE($8, member_preferences.push_token),
        onboarding_completed_at = COALESCE(member_preferences.onboarding_completed_at, NOW())
      RETURNING *
    `, [id, skill_level, goals, play_frequency, preferred_time, interests, notifications_enabled, push_token]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/members/{id}/preferences/onboarding-status:
 *   get:
 *     summary: Check if member has completed onboarding
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Onboarding status
 */
app.get('/api/members/:id/preferences/onboarding-status', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT onboarding_completed_at FROM member_preferences WHERE member_id = $1
    `, [id]);

    res.json({
      completed: result.rows.length > 0 && result.rows[0].onboarding_completed_at !== null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================

const notifications = require('./services/notifications');

/**
 * @swagger
 * /api/notifications/broadcast:
 *   post:
 *     summary: Send push notification to all members
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification sent
 */
app.post('/api/notifications/broadcast', async (req, res) => {
  try {
    const { title, body, data = {} } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Create log entry first to get ID for member-level tracking
    const logId = await notifications.logNotification(
      'broadcast',
      title,
      body,
      null,
      0,  // Will be updated
      'pending',
      0,
      0
    );

    const result = await notifications.sendToAllMembers(title, body, data, logId);

    // Update the log with final counts
    await db.query(`
      UPDATE notification_log
      SET recipient_count = $1, sent_count = $2, failed_count = $3, status = $4
      WHERE id = $5
    `, [result.sent + result.failed, result.sent, result.failed, result.failed === 0 ? 'sent' : 'partial', logId]);

    res.json({
      success: true,
      sent: result.sent,
      failed: result.failed
    });
  } catch (err) {
    console.error('Broadcast notification error:', err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

/**
 * @swagger
 * /api/notifications/targeted:
 *   post:
 *     summary: Send push notification to members matching criteria
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *               - criteria
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               criteria:
 *                 type: object
 *                 properties:
 *                   tier:
 *                     type: string
 *                     enum: [core, premium]
 *                   skillLevel:
 *                     type: string
 *                     enum: [beginner, intermediate, advanced]
 *                   playFrequency:
 *                     type: string
 *                     enum: [weekly, biweekly, monthly, occasionally]
 *                   inactiveDays:
 *                     type: integer
 *                     description: Members who haven't played in X days
 *                   activeDays:
 *                     type: integer
 *                     description: Members who have played in last X days
 *                   hasRoundsRemaining:
 *                     type: boolean
 *                     description: Members who still have rounds available this month
 *                   goals:
 *                     type: array
 *                     items:
 *                       type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification sent
 */
app.post('/api/notifications/targeted', async (req, res) => {
  try {
    const { title, body, criteria, data = {} } = req.body;

    if (!title || !body || !criteria) {
      return res.status(400).json({ error: 'Title, body, and criteria are required' });
    }

    // Create log entry first to get ID for member-level tracking
    const logId = await notifications.logNotification(
      'targeted',
      title,
      body,
      criteria,
      0,
      'pending',
      0,
      0
    );

    const result = await notifications.sendByCriteria(criteria, title, body, data, logId);

    // Update the log with final counts
    await db.query(`
      UPDATE notification_log
      SET recipient_count = $1, sent_count = $2, failed_count = $3, status = $4
      WHERE id = $5
    `, [result.sent + result.failed, result.sent, result.failed, result.failed === 0 ? 'sent' : 'partial', logId]);

    res.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      criteria
    });
  } catch (err) {
    console.error('Targeted notification error:', err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

/**
 * @swagger
 * /api/notifications/member/{memberId}:
 *   post:
 *     summary: Send push notification to a specific member
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification sent
 */
app.post('/api/notifications/member/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    const { title, body, data = {} } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Create log entry first to get ID for member-level tracking
    const logId = await notifications.logNotification(
      'individual',
      title,
      body,
      { memberId },
      1,
      'pending',
      0,
      0
    );

    const result = await notifications.sendToMember(memberId, title, body, data, logId);

    // Update the log with final status
    await db.query(`
      UPDATE notification_log
      SET sent_count = $1, failed_count = $2, status = $3
      WHERE id = $4
    `, [result.success ? 1 : 0, result.success ? 0 : 1, result.success ? 'sent' : 'failed', logId]);

    res.json(result);
  } catch (err) {
    console.error('Individual notification error:', err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

/**
 * @swagger
 * /api/notifications/history:
 *   get:
 *     summary: Get notification history
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [broadcast, targeted, individual]
 *     responses:
 *       200:
 *         description: List of sent notifications
 */
app.get('/api/notifications/history', async (req, res) => {
  try {
    const { limit = 50, type } = req.query;

    let query = `
      SELECT * FROM notification_log
      ${type ? 'WHERE type = $2' : ''}
      ORDER BY created_at DESC
      LIMIT $1
    `;
    const params = type ? [limit, type] : [limit];

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Notification history error:', err);
    res.status(500).json({ error: 'Failed to fetch notification history' });
  }
});

/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     summary: Get notification statistics
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Notification statistics
 */
app.get('/api/notifications/stats', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*) as total_notifications,
        SUM(sent_count) as total_sent,
        SUM(failed_count) as total_failed,
        COUNT(CASE WHEN type = 'broadcast' THEN 1 END) as broadcast_count,
        COUNT(CASE WHEN type = 'targeted' THEN 1 END) as targeted_count,
        COUNT(CASE WHEN type = 'individual' THEN 1 END) as individual_count,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7_days,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as last_30_days
      FROM notification_log
    `);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Notification stats error:', err);
    res.status(500).json({ error: 'Failed to fetch notification stats' });
  }
});

/**
 * @swagger
 * /api/members/{memberId}/notifications:
 *   get:
 *     summary: Get notification history for a specific member
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of notifications for the member
 */
app.get('/api/members/:memberId/notifications', async (req, res) => {
  try {
    const { memberId } = req.params;
    const { limit = 50 } = req.query;

    const result = await notifications.getMemberNotifications(memberId, parseInt(limit));
    res.json(result);
  } catch (err) {
    console.error('Member notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch member notifications' });
  }
});

/**
 * @swagger
 * /api/members/{memberId}/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count for a member
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unread notification count
 */
app.get('/api/members/:memberId/notifications/unread-count', async (req, res) => {
  try {
    const { memberId } = req.params;
    const count = await notifications.getUnreadCount(memberId);
    res.json({ unreadCount: count });
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   post:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
app.post('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    await notifications.markNotificationRead(notificationId);
    res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// ============================================
// RECOMMENDATIONS & CLUSTERING
// ============================================

// Cluster names mapping
const CLUSTER_NAMES = {
  0: 'Budget Conscious',
  1: 'Premium Seeker',
  2: 'Ambitious Improver',
  3: 'Course Explorer',
  4: 'Casual Social'
};

/**
 * @swagger
 * /api/members/{memberId}/cluster:
 *   get:
 *     summary: Get member's cluster/segment info
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member cluster information
 */
app.get('/api/members/:memberId/cluster', async (req, res) => {
  try {
    const { memberId } = req.params;

    const result = await db.query(`
      SELECT
        mp.cluster_id,
        mp.cluster_updated_at,
        mp.skill_level,
        mp.handicap,
        mp.budget_preference,
        mp.goals
      FROM member_preferences mp
      WHERE mp.member_id = $1
    `, [memberId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member preferences not found' });
    }

    const prefs = result.rows[0];
    const clusterId = prefs.cluster_id;
    const clusterName = CLUSTER_NAMES[clusterId] || 'Unknown';

    // Get cluster description
    const clusterDescriptions = {
      'Budget Conscious': 'Values affordable options and good deals. Prefers courses that offer great value.',
      'Premium Seeker': 'Appreciates quality experiences. Willing to pay more for better courses and amenities.',
      'Ambitious Improver': 'Focused on getting better. Plays frequently and seeks courses that challenge their skills.',
      'Course Explorer': 'Loves variety and trying new courses. Willing to travel for unique experiences.',
      'Casual Social': 'Plays for fun and relaxation. Enjoys the social aspects of golf.'
    };

    res.json({
      clusterId,
      clusterName,
      description: clusterDescriptions[clusterName] || '',
      updatedAt: prefs.cluster_updated_at,
      profile: {
        skillLevel: prefs.skill_level,
        handicap: prefs.handicap,
        budgetPreference: prefs.budget_preference,
        goals: prefs.goals
      }
    });
  } catch (err) {
    console.error('Cluster fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch cluster info' });
  }
});

/**
 * @swagger
 * /api/members/{memberId}/recommendations/cluster:
 *   get:
 *     summary: Get cluster-based course recommendations (ML-powered)
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: List of recommended courses based on member cluster
 */
app.get('/api/members/:memberId/recommendations/cluster', async (req, res) => {
  try {
    const { memberId } = req.params;
    const { limit = 5 } = req.query;

    // Get member profile and cluster
    const memberResult = await db.query(`
      SELECT
        m.id,
        pt.name as tier,
        mp.cluster_id,
        mp.skill_level,
        mp.handicap,
        mp.budget_preference,
        mp.preferred_difficulty,
        mp.max_travel_miles,
        mp.goals
      FROM members m
      JOIN health_plans hp ON m.health_plan_id = hp.id
      JOIN plan_tiers pt ON hp.plan_tier_id = pt.id
      LEFT JOIN member_preferences mp ON m.id = mp.member_id
      WHERE m.id = $1
    `, [memberId]);

    if (memberResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const member = memberResult.rows[0];
    const isPremium = member.tier === 'premium';
    const clusterId = member.cluster_id;
    const clusterName = CLUSTER_NAMES[clusterId] || 'Unknown';

    // Get courses the member has already played
    const playedResult = await db.query(`
      SELECT DISTINCT course_id FROM golf_utilization WHERE member_id = $1
    `, [memberId]);
    const playedCourseIds = playedResult.rows.map(r => r.course_id);

    // Build recommendation query based on cluster profile
    let orderBy = '';
    let conditions = [];

    // Tier access control
    if (!isPremium) {
      conditions.push("gc.tier_required = 'core'");
    }

    // Exclude already played courses
    if (playedCourseIds.length > 0) {
      conditions.push(`gc.id NOT IN ('${playedCourseIds.join("','")}')`);
    }

    // Cluster-specific ordering
    switch (clusterName) {
      case 'Budget Conscious':
        orderBy = "CASE gc.price_range WHEN 'budget' THEN 1 WHEN 'moderate' THEN 2 ELSE 3 END, gc.slope_rating";
        break;
      case 'Premium Seeker':
        orderBy = "CASE gc.price_range WHEN 'luxury' THEN 1 WHEN 'premium' THEN 2 ELSE 3 END DESC, gc.course_rating DESC";
        break;
      case 'Ambitious Improver':
        // Match difficulty to skill level, slight challenge
        if (member.preferred_difficulty) {
          conditions.push(`gc.difficulty IN ('${member.preferred_difficulty}', 'moderate', 'challenging')`);
        }
        orderBy = "gc.slope_rating DESC, gc.has_driving_range DESC, gc.has_practice_green DESC";
        break;
      case 'Course Explorer':
        // Prioritize variety and unique experiences
        orderBy = "CASE gc.course_type WHEN 'links' THEN 1 WHEN 'resort' THEN 2 WHEN 'parkland' THEN 3 ELSE 4 END, RANDOM()";
        break;
      case 'Casual Social':
        // Easy courses with good amenities
        orderBy = "CASE gc.difficulty WHEN 'easy' THEN 1 WHEN 'moderate' THEN 2 ELSE 3 END, gc.has_restaurant DESC, gc.pace_of_play_mins";
        break;
      default:
        orderBy = "gc.course_rating DESC";
    }

    const query = `
      SELECT
        gc.id,
        gc.name,
        gc.city,
        gc.state,
        gc.difficulty,
        gc.course_type,
        gc.price_range,
        gc.tier_required,
        gc.course_rating,
        gc.slope_rating,
        gc.has_driving_range,
        gc.has_restaurant,
        gc.walking_friendly,
        COALESCE(r.avg_rating, 0) as avg_rating,
        COALESCE(r.review_count, 0) as review_count
      FROM golf_courses gc
      LEFT JOIN (
        SELECT course_id, AVG(rating) as avg_rating, COUNT(*) as review_count
        FROM reviews GROUP BY course_id
      ) r ON gc.id = r.course_id
      WHERE gc.is_active = true
      ${conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''}
      ORDER BY ${orderBy}
      LIMIT $1
    `;

    const coursesResult = await db.query(query, [limit]);

    // Add recommendation reasons
    const recommendations = coursesResult.rows.map(course => {
      let reason = '';
      switch (clusterName) {
        case 'Budget Conscious':
          reason = course.price_range === 'budget' ? 'Great value option' : 'Affordable for your budget';
          break;
        case 'Premium Seeker':
          reason = course.price_range === 'luxury' || course.price_range === 'premium'
            ? 'Premium experience' : 'Highly rated course';
          break;
        case 'Ambitious Improver':
          reason = course.has_driving_range ? 'Has practice facilities' : 'Good for skill development';
          break;
        case 'Course Explorer':
          reason = `Try this ${course.course_type} course`;
          break;
        case 'Casual Social':
          reason = course.has_restaurant ? 'Great for socializing' : 'Relaxed atmosphere';
          break;
        default:
          reason = 'Recommended for you';
      }

      return {
        ...course,
        reason
      };
    });

    res.json({
      memberId,
      cluster: {
        id: clusterId,
        name: clusterName
      },
      recommendations
    });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

/**
 * @swagger
 * /api/members/{memberId}/similar:
 *   get:
 *     summary: Find members in the same cluster
 *     tags: [Recommendations]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: List of similar members
 */
app.get('/api/members/:memberId/similar', async (req, res) => {
  try {
    const { memberId } = req.params;
    const { limit = 5 } = req.query;

    // Get member's cluster
    const memberResult = await db.query(`
      SELECT cluster_id FROM member_preferences WHERE member_id = $1
    `, [memberId]);

    if (memberResult.rows.length === 0 || memberResult.rows[0].cluster_id === null) {
      return res.status(404).json({ error: 'Member cluster not found' });
    }

    const clusterId = memberResult.rows[0].cluster_id;

    // Get other members in same cluster
    const similarResult = await db.query(`
      SELECT
        m.id,
        m.first_name,
        mp.skill_level,
        mp.handicap,
        COALESCE(u.total_rounds, 0) as total_rounds
      FROM members m
      JOIN member_preferences mp ON m.id = mp.member_id
      LEFT JOIN (
        SELECT member_id, COUNT(*) as total_rounds
        FROM golf_utilization GROUP BY member_id
      ) u ON m.id = u.member_id
      WHERE mp.cluster_id = $1 AND m.id != $2
      ORDER BY u.total_rounds DESC
      LIMIT $3
    `, [clusterId, memberId, limit]);

    res.json({
      clusterId,
      clusterName: CLUSTER_NAMES[clusterId],
      similarMembers: similarResult.rows
    });
  } catch (err) {
    console.error('Similar members error:', err);
    res.status(500).json({ error: 'Failed to fetch similar members' });
  }
});

/**
 * @swagger
 * /api/clusters/stats:
 *   get:
 *     summary: Get cluster statistics
 *     tags: [Recommendations]
 *     responses:
 *       200:
 *         description: Cluster statistics
 */
app.get('/api/clusters/stats', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        mp.cluster_id,
        COUNT(*) as member_count,
        AVG(mp.handicap) as avg_handicap,
        AVG(CASE mp.budget_preference
          WHEN 'budget' THEN 1
          WHEN 'moderate' THEN 2
          WHEN 'premium' THEN 3
          ELSE 2 END) as avg_budget_score,
        AVG(COALESCE(u.total_rounds, 0)) as avg_rounds
      FROM member_preferences mp
      LEFT JOIN (
        SELECT member_id, COUNT(*) as total_rounds
        FROM golf_utilization GROUP BY member_id
      ) u ON mp.member_id = u.member_id
      WHERE mp.cluster_id IS NOT NULL
      GROUP BY mp.cluster_id
      ORDER BY mp.cluster_id
    `);

    const stats = result.rows.map(row => ({
      clusterId: row.cluster_id,
      clusterName: CLUSTER_NAMES[row.cluster_id],
      memberCount: parseInt(row.member_count),
      avgHandicap: parseFloat(row.avg_handicap).toFixed(1),
      avgBudgetScore: parseFloat(row.avg_budget_score).toFixed(2),
      avgRounds: parseFloat(row.avg_rounds).toFixed(1)
    }));

    res.json(stats);
  } catch (err) {
    console.error('Cluster stats error:', err);
    res.status(500).json({ error: 'Failed to fetch cluster stats' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`ParPass API running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/docs`);
});

