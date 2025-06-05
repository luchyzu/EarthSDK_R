declare namespace API {
  type Response<T extends Record<string, any> = any> = {
    code: number;
    status: 'success' | 'fail';
    message: string;
    data: T;
  };

  type UserInfo = {
    routeInfo: RouteType[];
    userInfo: CurrentUser;
    routeMap: Record<string, any>;
  };
}
