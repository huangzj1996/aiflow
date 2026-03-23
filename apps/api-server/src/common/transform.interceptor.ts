import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { map, Observable } from 'rxjs'

export interface ApiResponse<T> {
    success: true
    data: T
    message?: string
}

// 格式化控制器返回的数据
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
        return next.handle().pipe(map(data => ({ success: true as const, data })))
    }
}
