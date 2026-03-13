import { type NextRequest, NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getCurrentUser } from '@/lib/auth-stub'
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/upload'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Verify user is authenticated
        await getCurrentUser()

        return {
          allowedContentTypes: ALLOWED_IMAGE_TYPES as unknown as string[],
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {
        // Nothing to do — the Server Action saves the URL to the DB
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
}
