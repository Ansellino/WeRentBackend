import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'
 
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
 
    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let code = 'INTERNAL_ERROR'
    let message = 'Something went wrong'
 
    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const res = exception.getResponse() as any
      code = res.code || 'ERROR'
      message = Array.isArray(res.message) ? res.message[0] : (res.message || message)
    }
 
    response.status(status).json({
      success: false,
      error: { code, message },
    })
  }
}