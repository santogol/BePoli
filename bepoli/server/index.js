// index.js — BePoli backend (CommonJS)

// Env
require('dotenv').config()

// Core deps
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcrypt')
const path = require('path')
const multer = require('multer')
const session = require('express-session')
const csrf = require('csurf')
const cookieParser = require('cookie-parser')
const { OAuth2Client } = require('google-auth-library')
const jwt = require('jsonwebtoken')
const helmet = require('helmet')
const morgan = require('morgan')

// ===== ENV =====
const {
  NODE_ENV = 'development',
  PORT = process.env.PORT || 3000,
  MONGO_URI,
  SESSION_SECRET = 'change-me',
  JWT_SECRET = 'change-me',
  ORIGIN = 'https://bepoli.onrender.com,http://localhost:5173',
  GOOGLE_CLIENT_ID = '42592859457-ausft7g5gohk7mf96st2047ul9rk8o0v.apps.googleusercontent.com'
} = process.env
const isProd = NODE_ENV === 'production'
const __dirnameResolved = __dirname


// ===== App =====
const app = express()
app.set('trust proxy', 1)

// Sicurezza + log
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(morgan(isProd ? 'combined' : 'dev'))

// Static legacy (public/)
app.use(express.static(path.join(__dirnameResolved, 'public')))

// Body & cookies
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// CORS (lista di origini)
app.use(cors({
  origin: ORIGIN.split(',').map(s => s.trim()),
  credentials: true
}))

// COOP/COEP come nel tuo file
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
  next()
})

// Sessione
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: 1000 * 60 * 30, // 30 minuti
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax'
  }
}))

const csrfProtection = csrf({ cookie: false })

// ===== DB =====
mongoose.set('strictQuery', true)
mongoose.connect(MONGO_URI)
  .then(() => console.log('[db] Connesso a MongoDB'))
  .catch(err => {
    console.error('[db] Connessione fallita:', err)
    process.exit(1)
  })

// ===== Schemi =====
const utenteSchema = new mongoose.Schema({
  nome: String,
  username: { type: String, unique: true },
  password: String,
  bio: String,
  profilePic: { data: Buffer, contentType: String },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Utente' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Utente' }],
  utentiRecenti: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Utente' }]
})
const Utente = mongoose.model('Utente', utenteSchema)

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utente' },
  desc: String,
  image: { data: Buffer, contentType: String },
  location: String,
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Utente' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Utente' },
    text: String,
    location: String,
    createdAt: { type: Date, default: Date.now }
  }]
})
const Post = mongoose.model('Post', postSchema)

// ===== Helpers =====
const storage = multer.memoryStorage()
const upload = multer({ storage })

function getFingerprint(req) {
  return req.headers['user-agent'] || ''
}
function checkFingerprint(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Non autorizzato' })
  }
  const current = getFingerprint(req)
  const saved = req.session.fingerprint
  if (!saved) {
    req.session.fingerprint = current
    return next()
  }
  if (saved !== current) {
    req.session.destroy(err => {
      if (err) console.error('Errore distruggendo sessione:', err)
      return res.status(403).json({ message: 'Sessione invalida, effettua di nuovo il login.' })
    })
  } else next()
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

// ===== ROTTE =====

// CSRF token
app.get('/csrf-token', (req, res, next) => { req.session.touch(); next() }, csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// Root (in dev mostra login.html; in prod lo gestiamo sotto con la SPA)
if (!isProd) {
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirnameResolved, 'public/login.html'))
  })
}

// Auth-token JWT (short-lived) dalla sessione
app.get('/api/auth-token', checkFingerprint, (req, res) => {
  const payload = {
    id: req.session.user.id,
    username: req.session.user.username,
    nome: req.session.user.nome
  }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
  res.json({ token })
})

// Login tradizionale
app.post('/login', csrfProtection, async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ message: 'Dati mancanti' })
  try {
    const utente = await Utente.findOne({ username })
    if (!utente || !(await bcrypt.compare(password, utente.password))) {
      return res.status(400).json({ message: 'Username o password errati' })
    }
    req.session.user = { id: utente._id, nome: utente.nome, username: utente.username }
    req.session.fingerprint = getFingerprint(req)
    res.status(200).json({ message: 'Login riuscito', user: req.session.user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Errore server' })
  }
})

// Login con Google
app.post('/auth/google', async (req, res) => {
  const { id_token } = req.body || {}
  if (!id_token) return res.status(400).json({ message: 'Token mancante' })
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: GOOGLE_CLIENT_ID })
    const payload = ticket.getPayload()
    let utente = await Utente.findOne({ username: payload.email })
    if (!utente) {
      utente = new Utente({
        nome: payload.name,
        username: payload.email,
        password: '',
        bio: '',
        profilePic: { data: null, contentType: null }
      })
      await utente.save()
    }
    req.session.user = { id: utente._id, nome: utente.nome, username: utente.username }
    req.session.fingerprint = getFingerprint(req)
    res.json({ message: 'Login Google effettuato', user: req.session.user })
  } catch (err) {
    console.error('Errore login Google:', err)
    res.status(401).json({ message: 'Token non valido' })
  }
})

// Registrazione
app.post('/register', csrfProtection, async (req, res) => {
  const { nome, username, password } = req.body || {}
  if (!nome || !username || !password) return res.status(400).json({ message: 'Dati mancanti' })
  try {
    if (await Utente.findOne({ username })) return res.status(400).json({ message: 'Username già esistente' })
    const hash = await bcrypt.hash(password, 10)
    await Utente.create({
      nome,
      username,
      password: hash,
      bio: '',
      profilePic: { data: null, contentType: null }
    })
    res.status(201).json({ message: 'Registrazione completata' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Errore server' })
  }
})

// Update profilo (bio + foto)
app.post('/api/update-profile', checkFingerprint, csrfProtection, upload.single('profilePic'), async (req, res) => {
  const userId = req.session.user.id
  const updateData = {}
  if (req.body.bio !== undefined) updateData.bio = req.body.bio
  if (req.file) updateData.profilePic = { data: req.file.buffer, contentType: req.file.mimetype }
  try {
    const updated = await Utente.findByIdAndUpdate(userId, { $set: updateData }, { new: true })
    if (!updated) return res.status(404).json({ message: 'Utente non trovato' })
    res.json({ message: 'Profilo aggiornato' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Errore salvataggio profilo' })
  }
})

// Foto profilo
app.get('/api/user-photo/:userId', async (req, res) => {
  try {
    const user = await Utente.findById(req.params.userId)
    if (user?.profilePic?.data) {
      res.contentType(user.profilePic.contentType)
      res.send(user.profilePic.data)
    } else {
      res.status(404).send('Nessuna foto')
    }
  } catch {
    res.status(500).send('Errore')
  }
})

// Ricerca utenti (paginata)
app.get('/api/search-users', checkFingerprint, async (req, res) => {
  const query = req.query.q
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit
  if (!query) return res.status(400).json({ message: 'Query mancante' })
  try {
    const results = await Utente.find({ username: new RegExp(query, 'i') }, 'username nome _id')
      .skip(skip)
      .limit(limit)
    res.json(results.map(u => ({
      id: u._id,
      username: u.username,
      nome: u.nome,
      profilePicUrl: /api/user-photo/${u._id}
    })))
  } catch {
    res.status(500).json({ message: 'Errore ricerca' })
  }
})

// Visitato di recente
app.post('/api/visit-user/:id', checkFingerprint, async (req, res) => {
  const userId = req.session.user.id
  const visitedId = req.params.id
  if (userId === visitedId) return res.status(400).json({ message: 'Non puoi visitare te stesso' })
  try {
    const utente = await Utente.findById(userId)
    if (!utente) return res.status(404).json({ message: 'Utente non trovato' })
    utente.utentiRecenti = utente.utentiRecenti.filter(id => id.toString() !== visitedId)
    utente.utentiRecenti.unshift(visitedId)
    utente.utentiRecenti = utente.utentiRecenti.slice(0, 5)
    await utente.save()
    res.json({ message: 'Utente salvato come visitato' })
  } catch (err) {
    console.error('Errore salvataggio visitato:', err)
    res.status(500).json({ message: 'Errore server' })
  }
})
app.get('/api/recent-users', checkFingerprint, async (req, res) => {
  try {
    const utente = await Utente.findById(req.session.user.id)
      .populate('utentiRecenti', 'username nome _id')
      .exec()
    const recenti = (utente?.utentiRecenti || []).map(u => ({
      id: u._id,
      username: u.username,
      nome: u.nome,
      profilePicUrl: /api/user-photo/${u._id}
    }))
    res.json(recenti)
  } catch {
    res.status(500).json({ message: 'Errore caricamento recenti' })
  }
})

// Followers / Following (paginati)
app.get('/api/user/:id/followers', checkFingerprint, async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit
  try {
    const user = await Utente.findById(req.params.id)
      .populate({ path: 'followers', select: 'nome username _id', options: { skip, limit } })
    if (!user) return res.status(404).json({ message: 'Utente non trovato' })
    const total = user.followers.length
    const list = user.followers.map(u => ({
      id: u._id, nome: u.nome, username: u.username, profilePicUrl: /api/user-photo/${u._id}
    }))
    res.json({ total, page, limit, followers: list })
  } catch {
    res.status(500).json({ message: 'Errore nel recupero follower' })
  }
})
app.get('/api/user/:id/following', checkFingerprint, async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit
  try {
    const user = await Utente.findById(req.params.id)
      .populate({ path: 'following', select: 'nome username _id', options: { skip, limit } })
    if (!user) return res.status(404).json({ message: 'Utente non trovato' })
    const total = user.following.length
    const list = user.following.map(u => ({
      id: u._id, nome: u.nome, username: u.username, profilePicUrl: /api/user-photo/${u._id}
    }))
    res.json({ total, page, limit, following: list })
  } catch {
    res.status(500).json({ message: 'Errore nel recupero following' })
  }
})

// Profilo pubblico e me
app.get('/api/user-public/:id', async (req, res) => {
  try {
    const user = await Utente.findById(req.params.id).select('username nome bio followers following')
    if (!user) return res.status(404).json({ message: 'Utente non trovato' })
    res.json({
      _id: user._id,
      username: user.username,
      nome: user.nome,
      bio: user.bio,
      followersCount: user.followers.length,
      followingCount: user.following.length
    })
  } catch {
    res.status(500).json({ message: 'Errore server' })
  }
})
app.get('/api/user', checkFingerprint, async (req, res) => {
  try {
    const user = await Utente.findById(req.session.user.id).select('username nome bio followers following')
    if (!user) return res.status(404).json({ message: 'Utente non trovato' })
    res.json({
      _id: user._id,
      username: user.username,
      nome: user.nome,
      bio: user.bio,
      followersCount: user.followers.length,
      followingCount: user.following.length
    })
  } catch {
    res.status(500).json({ message: 'Errore server' })
  }
})

// Follow/Unfollow + info
app.post('/api/follow/:id', checkFingerprint, async (req, res) => {
  const followerId = req.session.user.id
  const targetId = req.params.id
  if (followerId === targetId) return res.status(400).json({ message: 'Non puoi seguire te stesso' })
  try {
    const [follower, target] = await Promise.all([Utente.findById(followerId), Utente.findById(targetId)])
    if (!follower || !target) return res.status(404).json({ message: 'Utente non trovato' })
    const isFollowing = follower.following.includes(target._id)
    if (isFollowing) {
      follower.following.pull(target._id); target.followers.pull(follower._id)
    } else {
      follower.following.addToSet(target._id); target.followers.addToSet(follower._id)
    }
    await Promise.all([follower.save(), target.save()])
    res.json({
      following: !isFollowing,
      followersCount: target.followers.length,
      followingCount: follower.following.length
    })
  } catch (err) {
    console.error('Errore follow:', err)
    res.status(500).json({ message: 'Errore follow' })
  }
})
app.get('/api/follow-info/:id', checkFingerprint, async (req, res) => {
  const viewerId = req.session.user.id
  const targetId = req.params.id
  try {
    const [viewer, target] = await Promise.all([Utente.findById(viewerId), Utente.findById(targetId)])
    if (!target) return res.status(404).json({ message: 'Utente non trovato' })
    if (!viewer) return res.status(404).json({ message: 'Utente viewer non trovato' })
    const isFollowing = viewer.following.includes(target._id)
    res.json({
      followersCount: target.followers.length,
      followingCount: target.following.length,
      isFollowing
    })
  } catch {
    res.status(500).json({ message: 'Errore follow-info' })
  }
})

// Logout
app.post('/logout', checkFingerprint, csrfProtection, (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Errore logout' })
    res.clearCookie('connect.sid')
    res.json({ message: 'Logout effettuato' })
  })
})

/* ====== POSTS ====== */

// Crea post (multipart)
app.post('/api/posts', checkFingerprint, upload.single('image'), async (req, res) => {
  try {
    const userId = req.session.user.id
    const location = req.body.location || 'Posizione sconosciuta'
    const newPost = new Post({
      userId,
      desc: req.body.desc,
      location,
      createdAt: new Date(),
      image: req.file ? { data: req.file.buffer, contentType: req.file.mimetype } : null
    })
    await newPost.save()
    res.status(201).json(newPost)
  } catch (error) {
    console.error('Errore creazione post:', error)
    res.status(500).json({ message: 'Errore del server' })
  }
})

// Feed paginato filtrato per location + fallback aggregate (come il tuo)
app.get('/api/posts', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = 10
  const location = req.query.location || 'Fuori dalle aree conosciute'

  let baseLocationName
  if (location.startsWith('Vicino a: ')) baseLocationName = location.replace('Vicino a: ', '')
  else baseLocationName = location

  const locationsToFind = [baseLocationName, 'Vicino a: ' + baseLocationName]

  try {
    const query = { location: { $in: locationsToFind } }
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('userId', 'username nome _id')
      .populate('comments.userId', 'username nome')

    return res.json(posts.map(post => ({
      _id: post._id,
      userId: {
        _id: post.userId._id,
        username: post.userId.username,
        nome: post.userId.nome
      },
      desc: post.desc,
      location: post.location,
      createdAt: post.createdAt,
      imageUrl: post.image?.data ? /api/post-image/${post._id} : null,
      likes: post.likes.length,
      comments: post.comments.length,
      commentsData: post.comments.map(comment => ({
        text: comment.text,
        createdAt: comment.createdAt,
        userId: {
          username: comment.userId?.username,
          nome: comment.userId?.nome
        }
      }))
    })))
  } catch (err) {
    if (
      err.code === 292 ||
      err.codeName === 'QueryExceededMemoryLimitNoDiskUseAllowed' ||
      (err.message || '').includes('Sort exceeded memory limit')
    ) {
      try {
        const aggPipeline = [
          { $match: { location: { $in: locationsToFind } } },
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * pageSize },
          { $limit: pageSize },
          {
            $lookup: { from: 'utentes', localField: 'userId', foreignField: '_id', as: 'user' }
          },
          { $unwind: '$user' },
          {
            $lookup: { from: 'utentes', localField: 'comments.userId', foreignField: '_id', as: 'commentUsers' }
          },
          {
            $addFields: {
              comments: {
                $map: {
                  input: '$comments',
                  as: 'comment',
                  in: {
                    $mergeObjects: [
                      '$$comment',
                      {
                        user: {
                          $arrayElemAt: [
                            { $filter: { input: '$commentUsers', cond: { $eq: ['$$this._id', '$$comment.userId'] } } },
                            0
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            }
          },
          { $project: { commentUsers: 0 } }
        ]
        const posts = await Post.aggregate(aggPipeline).allowDiskUse(true)
        const formatted = posts.map(post => ({
          _id: post._id,
          userId: {
            _id: post.user._id,
            username: post.user.username,
            nome: post.user.nome
          },
          desc: post.desc,
          location: post.location,
          createdAt: post.createdAt,
          imageUrl: post.image?.data ? /api/post-image/${post._id} : null,
          likes: post.likes.length,
          comments: post.comments.length,
          commentsData: (post.comments || []).map(comment => ({
            text: comment.text,
            createdAt: comment.createdAt,
            userId: {
              username: comment.user?.username,
              nome: comment.user?.nome
            }
          }))
        }))
        return res.json(formatted)
      } catch (aggErr) {
        console.error('Errore fallback aggregate:', aggErr)
        return res.status(500).json({ message: 'Errore caricamento post' })
      }
    }
    console.error('Errore caricamento post:', err)
    return res.status(500).json({ message: 'Errore caricamento post' })
  }
})

// Immagine post
app.get('/api/post-image/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (post?.image?.data) {
      res.contentType(post.image.contentType)
      res.send(post.image.data)
    } else {
      res.status(404).send('Nessuna immagine')
    }
  } catch {
    res.status(500).send('Errore immagine')
  }
})

// Like (toggle)
app.post('/api/posts/:id/like', checkFingerprint, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post non trovato' })
    const uid = new mongoose.Types.ObjectId(req.session.user.id)
    const i = post.likes.findIndex(x => x.equals(uid))
    if (i === -1) post.likes.push(uid)
    else post.likes.splice(i, 1)
    await post.save()
    res.json({ likes: post.likes.length })
  } catch (err) {
    console.error('Errore nel like:', err)
    res.status(500).json({ message: 'Errore like' })
  }
})

// Commenta
app.post('/api/posts/:id/comment', checkFingerprint, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post non trovato' })
    const text = (req.body.text || '').trim()
    if (!text) return res.status(400).json({ message: 'Testo commento mancante' })
    post.comments.push({ userId: req.session.user.id, text, createdAt: new Date() })
    await post.save()
    const lastComment = post.comments[post.comments.length - 1]
    const populated = await Post.populate(lastComment, { path: 'userId', select: 'nome username' })
    res.json({ comments: post.comments.length, newComment: populated })
  } catch (err) {
    console.error('Errore commento:', err)
    res.status(500).json({ message: 'Errore commento' })
  }
})

// Lista commenti
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('comments.userId', 'nome username')
    if (!post) return res.status(404).json({ message: 'Post non trovato' })
    res.json(post.comments)
  } catch (err) {
    console.error('Errore caricamento commenti:', err)
    res.status(500).json({ message: 'Errore commenti' })
  }
})

// Post di un utente
app.get('/api/user/:id/posts', checkFingerprint, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'username nome _id')
      .populate('comments.userId', 'username nome')
    res.json(posts.map(post => ({
      _id: post._id,
      userId: { _id: post.userId._id, username: post.userId.username, nome: post.userId.nome },
      desc: post.desc,
      createdAt: post.createdAt,
      imageUrl: post.image?.data ? /api/post-image/${post._id} : null,
      likes: post.likes.length,
      comments: post.comments.length,
      commentsData: post.comments.map(comment => ({
        text: comment.text,
        createdAt: comment.createdAt,
        userId: { username: comment.userId?.username, nome: comment.userId?.nome }
      }))
    })))
  } catch (err) {
    console.error('Errore caricamento post utente:', err)
    res.status(500).json({ message: 'Errore caricamento post utente' })
  }
})

/* ===== SPA (React) in produzione ===== */
if (isProd) {
  const clientDist = path.join(__dirnameResolved, '../client/dist')
  app.use(express.static(clientDist))
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')))
}


if (process.env.NODE_ENV === 'production') {
  const path = require('path')
  const clientDist = path.join(__dirname, '../client/dist')
  app.use(express.static(clientDist))
  app.get('*', (req,res)=>res.sendFile(path.join(clientDist,'index.html')))
}
/* ===== START ===== */
app.listen(PORT, '0.0.0.0', () => {
  console.log(Server attivo su porta ${PORT} (${NODE_ENV}))
})




