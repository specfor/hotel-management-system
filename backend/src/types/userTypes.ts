//User entity from database (matches "user" table schema)
export interface User {
  staff_id: number;
  username: string;
  password_hash: string;
}

//Login credentials
export interface UserLogin {
  username: string;
  password: string;
}

//Registration data
export interface UserRegister {
  staff_id: number;
  username: string;
  password: string;
}


//Public user data (without password)
export interface UserPublic {
  staff_id: number;
  username: string;
}

//Pagination and filter parameters for users
export interface UserQueryParams {
  page?: number;
  limit?: number;
  username?: string;
}
