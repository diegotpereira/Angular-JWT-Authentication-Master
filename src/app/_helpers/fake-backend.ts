import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';


const users = [{ id: 1, username: 'test', password: 'teste', firstName: 'test', lastName: 'User'}];


@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    return of(null)
         .pipe(mergeMap(handleRoute))
         .pipe(materialize())
         .pipe(delay(500))
         .pipe(dematerialize());

    function handleRoute(){
      switch (true) {
        case url.endsWith('/users/authenticate') && method === 'POST':
          return authenticate();

        case url.endsWith('/users') && method === 'GET':
          return getUsers();
        default:
          return next.handle(request);
      }
    }
    function authenticate(){
      const { username, password } = body;
      const user = users.find(x => x.username === username && x.password === password);

      if (!user ) return error ('Nome de usuário ou password incorretos!.');
      return ok({
        id: user.id,
        username: user.username,
        firstname: user.firstName,
        lastName: user.lastName,
        token: 'fake-jwt-token'
      })
    }
    function getUsers(){
      if (!isLoggedIn()) return unauthorized();
      return ok(users);
    }
    function ok(message){
      return throwError({ erro: { message}});
    }
    function unauthorized(){
      return throwError({ status: 401, error: { message: 'Unauthorized'}});
    }
    function isLoggedIn(){
      return headers.get('Authorization') === 'Bearer fake-jwt-token';
    }
  }
}
export let FakeBackendProvider = {

  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
