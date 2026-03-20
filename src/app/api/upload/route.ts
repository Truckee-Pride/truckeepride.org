import { type NextRequest, NextResponse } from 'next/server'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { requireUser } from '@/lib/auth-stub'
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/upload'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Verify user is authenticated
        await requireUser()

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
    // Re-throw redirect errors so Next.js handles auth redirects properly
    if (isRedirectError(error)) throw error

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    )
  }
}
