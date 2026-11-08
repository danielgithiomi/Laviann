import { NextRequest, NextResponse } from 'next/server';

type WithAuthHandler = (request: NextRequest, context?: unknown) => Promise<NextResponse>;

export function AuthGuard(handler: WithAuthHandler) {
    return async (request: NextRequest, context: unknown) => {
        const requestToken = request.cookies.get('pp_token')?.value;

        if (!requestToken)
            return new NextResponse(
                JSON.stringify({
                    status: 401,
                    error: 'Unauthorized',
                    message: 'No token found in the request',
                }),
                {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

        return handler(request, context);
    };
}
