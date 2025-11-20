const bcrypt = require('bcryptjs')
const User = require('../models/user.model')
const generate = require('../helpers/generate')

const pickPublicUser = (doc) => {
  if (!doc) return null
  const obj = doc.toObject ? doc.toObject() : doc
  delete obj.password
  delete obj.tokenUser
  return obj
}

module.exports.register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body || {}

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'fullName, email, password, confirmPassword là bắt buộc' })
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp' })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu tối thiểu 6 ký tự' })
    }

    const existing = await User.findOne({ email: email.toLowerCase(), deleted: false })
    if (existing) {
      return res.status(409).json({ message: 'Email đã tồn tại' })
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashed
    })

    return res.status(201).json({
      message: 'Đăng ký thành công',
      data: pickPublicUser(user)
    })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ message: 'Lỗi máy chủ' })
  }
}

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {}

    if (!email || !password) {
      return res.status(400).json({ message: 'email và password là bắt buộc' })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ' })
    }

    const user = await User.findOne({ email: email.toLowerCase(), deleted: false })
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
    }

    // Check account status
    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa' })
    }

    // Issue new token for session
    const token = generate.generateRandomString(20)
    user.tokenUser = token
    await user.save()

    return res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      data: pickPublicUser(user)
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ message: 'Lỗi máy chủ' })
  }
}
