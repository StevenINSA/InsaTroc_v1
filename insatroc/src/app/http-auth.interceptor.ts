import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with basic auth credentials if available
    let currentUser = localStorage.getItem('username');
    let token = localStorage.getItem('token');
    console.log(currentUser);
    if(currentUser){
      request = request.clone({
        setHeaders: {
          // Authorization: `Basic ${token}`
          Authorization: token
        }
      });
    }

    return next.handle(request);
  }
}
