import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password } = body
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('POST /api/auth error:', e)
    return NextResponse.json(
      { error: 'Auth failed', details: (e as Error)?.message || String(e) },
      { status: 500 }
    )
  }
}
