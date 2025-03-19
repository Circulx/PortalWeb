import { NextResponse } from 'next/server'
import { connectDB1 } from '@/lib/db'
import { User, IUser } from '@/models/user'
import { getCurrentUser } from '@/actions/auth'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB1()
    const users: IUser[] = await User.find({}).select('-password')
    
    const sanitizedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      type: user.type,
    }))

    return NextResponse.json(sanitizedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
