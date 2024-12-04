'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import { User, IUser } from '@/models/user'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'gyuhiuhthoju2596rfyjhtfykjb'

export async function signIn(formData: FormData) {
  try {
    await connectDB()
    console.log("MongoDB connected successfully")
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    const user = await User.findOne({ email })
    if (!user) {
      return { error: 'User not found' }
    }
    
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return { error: 'Invalid credentials' }
    }
    
    const token = jwt.sign(
      { userId: user._id, type: user.type },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    return {
      success: true,
      message: 'Signed in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
      },
    }
  } catch (error) {
    console.error("Error in signIn:", error)
    return { error: 'Something went wrong' }
  }
}

export async function signUp(formData: FormData) {
  try {
    await connectDB()
    console.log("MongoDB connected successfully")
    
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return { error: 'Email already exists' }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      type: 'customer', // Default type
    })
    
    return {
      success: true,
      message: 'Registered successfully. Please sign in.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
      },
    }
  } catch (error) {
    console.error("Error in signUp:", error)
    return { error: 'Something went wrong' }
  }
}

export async function signOut() {
  cookies().delete('auth-token')
  redirect('/')
}

export async function getCurrentUser() {
  try {
    await connectDB()
    console.log("MongoDB connected successfully")

    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')

    if (!token || !token.value) return null
    
    const decoded = jwt.verify(token.value, JWT_SECRET) as {
      userId: string
      type: string
    }
    
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user) return null
    
    // Convert MongoDB document to a plain object
    const plainUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      type: user.type,
    }

    return plainUser
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}

export async function updateUserType(userId: string, newType: 'admin' | 'seller' | 'customer') {
  try {
    await connectDB()
    console.log("MongoDB connected successfully")

    const user = await User.findByIdAndUpdate(userId, { type: newType }, { new: true })

    if (!user) {
      return { error: 'User not found' }
    }

    return {
      success: true,
      message: 'User type updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
      },
    }
  } catch (error) {
    console.error("Error in updateUserType:", error)
    return { error: 'Something went wrong' }
  }
}

