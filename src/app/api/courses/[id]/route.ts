import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, context: any) {
  const raw = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params
  const { id } = (raw || {}) as { id: string }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { name, location, par } = body

  try {
    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    if (course.createdById !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(par !== undefined ? { par: typeof par === 'number' ? par : Number(par) || course.par } : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update course error:', error)
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: any) {
  const raw = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params
  const { id } = (raw || {}) as { id: string }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    if (course.createdById !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.course.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete course error:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}
